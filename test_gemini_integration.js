import http from 'http';
import { WebSocket } from 'ws';

async function testFullGeminiIntegration() {
  const baseHttp = 'http://localhost:3000';
  console.log('=== TEST: Direct Gemini Translation REST API ===');

  const testPayload = {
    sentence: "Real-time multilingual accessibility empowers global understanding.",
    targetLanguages: ["fr-FR", "es-ES", "yo-NG", "ha-NG"]
  };

  const res = await fetch(`${baseHttp}/api/sessions/TECH-2026/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload)
  });

  console.log('API Status:', res.status);
  const data = await res.json();
  console.log('Translated Output:');
  console.log(' - French (fr-FR):', data.translations?.['fr-FR']);
  console.log(' - Spanish (es-ES):', data.translations?.['es-ES']);
  console.log(' - Yoruba (yo-NG):', data.translations?.['yo-NG']);
  console.log(' - Hausa (ha-NG):', data.translations?.['ha-NG']);

  if (!data.translations?.['fr-FR'] || !data.translations?.['yo-NG']) {
    throw new Error('Gemini translation failed to return expected languages');
  }

  console.log('\n=== TEST: End-to-End WebSocket Broadcast with Live Gemini ===');
  // 1. Connect a participant subscriber listening in Yoruba
  const participantWs = new WebSocket('ws://localhost:3000/ws/live?roomId=TECH-2026&lang=yo-NG&mode=read');
  
  await new Promise((resolve, reject) => {
    participantWs.on('open', resolve);
    participantWs.on('error', reject);
  });

  const participantReady = await new Promise((resolve) => {
    participantWs.once('message', (msg) => {
      resolve(JSON.parse(msg.toString()));
    });
  });
  console.log('Participant subscribed successfully:', participantReady.type, 'Target Lang:', participantReady.lang);

  // 2. Connect host WebSocket and send 250ms chunks to trigger sentence boundary
  const hostWs = new WebSocket('ws://localhost:3000/ws/audio?roomId=TECH-2026&role=host');
  await new Promise((resolve) => hostWs.on('open', resolve));

  hostWs.send(JSON.stringify({
    type: 'AUDIO_INIT',
    roomId: 'TECH-2026',
    sampleRate: 16000,
    channelCount: 1,
    chunkDurationMs: 250
  }));

  // Wait for handshake
  await new Promise(r => setTimeout(r, 200));

  // Listen for participant receiving CAPTION_FINAL translated into Yoruba
  const receivedCaptionPromise = new Promise((resolve) => {
    participantWs.on('message', (msg) => {
      const parsed = JSON.parse(msg.toString());
      if (parsed.type === 'CAPTION_FINAL') {
        resolve(parsed);
      }
    });
  });

  // Send chunks to complete the sentence
  const chunkBuffer = Buffer.alloc(8000);
  console.log('Streaming host chunks to trigger speech recognition and Gemini translation dispatch...');
  for (let i = 0; i < 14; i++) {
    hostWs.send(chunkBuffer);
    await new Promise(r => setTimeout(r, 60));
  }

  const captionEvent = await Promise.race([
    receivedCaptionPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for CAPTION_FINAL')), 6000))
  ]);

  console.log('\nParticipant received live translated caption:');
  console.log(' - Original:', captionEvent.originalText);
  console.log(' - Translated (Yorùbá):', captionEvent.translatedText);
  console.log(' - Language code:', captionEvent.lang);

  hostWs.close();
  participantWs.close();

  console.log('\n=== ALL GEMINI INTEGRATION & DISPATCH TESTS PASSED! ===');
}

testFullGeminiIntegration().catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
