// test_natlas_benchmarks.js
// Verification suite for Phase 5 N-ATLAS Telemetry, Benchmarks & Validation Evidence

import { WebSocket } from 'ws';

async function runBenchmarkTests() {
  const baseHttp = 'http://localhost:3000';
  const baseWs = 'ws://localhost:3000';

  console.log('=== TEST 1: Connect Host & Audience Sockets for NAIC-VOICE ===');
  const participantWs = new WebSocket(`${baseWs}/ws/live?roomId=NAIC-VOICE&lang=fr-FR&mode=read`);
  await new Promise((resolve, reject) => {
    participantWs.on('open', resolve);
    participantWs.on('error', reject);
  });

  const hostWs = new WebSocket(`${baseWs}/ws/audio?roomId=NAIC-VOICE&role=host`);
  await new Promise((resolve, reject) => {
    hostWs.on('open', resolve);
    hostWs.on('error', reject);
  });

  hostWs.send(JSON.stringify({
    type: 'AUDIO_INIT',
    roomId: 'NAIC-VOICE',
    sampleRate: 16000,
    chunkDurationMs: 250
  }));

  await new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'AUDIO_INIT_ACK') {
        hostWs.removeListener('message', handler);
        resolve();
      }
    };
    hostWs.on('message', handler);
  });
  console.log('Host initialized and ready for streaming');

  console.log('\n=== TEST 2: Stream Audio Chunks to Produce Benchmark Interactions ===');
  const dummyChunk = Buffer.alloc(8000); // 250ms PCM

  let finalsReceived = 0;
  participantWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'CAPTION_FINAL') {
        finalsReceived++;
        console.log(` - Audience received CAPTION_FINAL #${finalsReceived}: "${msg.translatedText}" [${msg.lang}]`);
      }
    } catch (e) {}
  });

  // Stream 14 chunks to ensure at least one final sentence is processed
  for (let c = 0; c < 14; c++) {
    hostWs.send(dummyChunk);
    await new Promise(r => setTimeout(r, 50));
  }

  // Allow async translation and telemetry recording to finalize
  for (let w = 0; w < 30; w++) {
    if (finalsReceived > 0) break;
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('Total finals received by audience:', finalsReceived);
  if (finalsReceived === 0) {
    throw new Error('Failed to produce finals for benchmark evaluation');
  }

  console.log('\n=== TEST 3: Query Telemetry REST API & Validate Benchmarks ===');
  const telemRes = await fetch(`${baseHttp}/api/sessions/NAIC-VOICE/telemetry`);
  if (!telemRes.ok) {
    throw new Error(`Telemetry API returned HTTP ${telemRes.status}`);
  }

  const telemData = await telemRes.json();
  console.log('Telemetry Summary Report:', JSON.stringify(telemData.summary, null, 2));
  console.log('Benchmark Evaluation:', JSON.stringify(telemData.benchmarks, null, 2));

  // Assertions
  if (telemData.summary.totalInteractions <= 0) {
    throw new Error('Telemetry reported 0 total interactions');
  }

  if (telemData.summary.successRatePercentage < 99.0) {
    throw new Error(`Success rate below threshold: ${telemData.summary.successRatePercentage}%`);
  }

  if (!telemData.benchmarks.latencyTargetMet) {
    throw new Error(`Latency target not met: average ${telemData.summary.averageEndToEndLatencyMs}ms`);
  }

  if (telemData.recentEvents.length === 0 || !telemData.recentEvents[0].interactionId) {
    throw new Error('Recent events missing or correlation ID absent');
  }

  console.log(`\nVerified Correlation ID: ${telemData.recentEvents[0].interactionId}`);
  console.log(`Measured End-to-End Latency: ${telemData.summary.averageEndToEndLatencyMs}ms (Target: < 2000ms)`);

  hostWs.close();
  participantWs.close();

  console.log('\n>>> ALL PHASE 5 BENCHMARK & TELEMETRY TESTS PASSED! <<<');
}

runBenchmarkTests().catch(err => {
  console.error('Benchmark Test Failed:', err);
  process.exit(1);
});
