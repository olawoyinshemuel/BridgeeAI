// test_natlas_provider.js
// Verification suite for Phase 2 N-ATLAS Provider Implementation

import { MockNatlasASRProvider } from './services/natlas/mockNatlasProvider.js';
import { NatlasASRProvider } from './services/natlas/natlasProvider.js';
import { getSpeechProvider } from './services/natlas/index.js';

async function runProviderTests() {
  console.log('=== TEST 1: MockNatlasASRProvider Streaming Simulation ===');
  const mock = new MockNatlasASRProvider();
  await mock.initialize();

  const dummyChunk = Buffer.alloc(8000); // 250ms 16kHz PCM (4000 samples * 2 bytes)

  const partials = [];
  const finals = [];

  mock.onPartial(p => partials.push(p.text));
  mock.onFinal(f => finals.push(f.text));

  const roomId = 'TEST-ROOM-YORUBA';

  // Send 12 chunks (3 seconds of audio = ~6 words)
  console.log('Streaming 12 x 250ms audio chunks in Yorùbá (yo-NG)...');
  for (let i = 0; i < 12; i++) {
    await mock.processChunk(roomId, dummyChunk, 'yo-NG');
  }

  console.log('Partials generated count:', partials.length);
  console.log('Final sentences generated count:', finals.length);
  console.log('Sample Partial:', partials[0]);
  console.log('Sample Final:', finals[0]);

  if (partials.length === 0 || finals.length === 0) {
    throw new Error('Mock provider failed to generate partials or finals');
  }

  console.log('\n=== TEST 2: All Nigerian Languages Corpus Check ===');
  const languages = ['ha-NG', 'ig-NG', 'en-NG'];
  for (const lang of languages) {
    const langRoom = `TEST-ROOM-${lang}`;
    let finalReceived = false;
    const testMock = new MockNatlasASRProvider();
    testMock.onFinal(f => {
      finalReceived = true;
      console.log(` - [${lang}] Generated Final Sentence: "${f.text}"`);
    });

    for (let c = 0; c < 15; c++) {
      await testMock.processChunk(langRoom, dummyChunk, lang);
      if (finalReceived) break;
    }

    if (!finalReceived) {
      throw new Error(`Failed to cycle sentence for language: ${lang}`);
    }
  }

  console.log('\n=== TEST 3: NatlasASRProvider (with Mock Fallback Circuit) ===');
  const provider = new NatlasASRProvider({
    enabled: false,
    mockFallback: true
  });
  await provider.initialize();

  let providerPartial = 0;
  let providerFinal = 0;
  provider.onPartial(() => providerPartial++);
  provider.onFinal(() => providerFinal++);

  for (let i = 0; i < 12; i++) {
    await provider.processChunk('NATLAS-PROV-TEST', dummyChunk, 'yo-NG');
  }

  console.log('Provider Fallback Partials count:', providerPartial);
  console.log('Provider Fallback Finals count:', providerFinal);
  const health = await provider.healthCheck();
  console.log('Provider Health Status:', health);

  if (providerPartial === 0 || providerFinal === 0) {
    throw new Error('NatlasASRProvider fallback circuit failed');
  }

  console.log('\n=== TEST 4: getSpeechProvider Factory ===');
  const natlasInst = getSpeechProvider({ provider: 'natlas', language: 'yo-NG' });
  const mockInst = getSpeechProvider({ provider: 'mock-natlas', language: 'ha-NG' });

  console.log('Factory natlas instance ID:', natlasInst.id);
  console.log('Factory mock-natlas instance ID:', mockInst.id);

  if (natlasInst.id !== 'natlas' || mockInst.id !== 'mock-natlas') {
    throw new Error('Provider factory returned unexpected instance types');
  }

  console.log('\n>>> ALL PHASE 2 PROVIDER TESTS PASSED SUCCESSFULLY! <<<');
}

runProviderTests().catch(err => {
  console.error('Provider Test Failed:', err);
  process.exit(1);
});
