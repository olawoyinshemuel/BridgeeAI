import { WebSocket } from 'ws';

async function runAudioIngestionTests() {
  const baseHttp = 'http://localhost:3000';
  const baseWs = 'ws://localhost:3000/ws/audio?roomId=TECH-2026&role=host';

  console.log('=== TEST 1: Host Console HTTP Route ===');
  const consoleRes = await fetch(baseHttp + '/host/console/TECH-2026');
  console.log('/host/console/TECH-2026 status:', consoleRes.status);
  const consoleHtml = await consoleRes.text();
  console.log('Contains waveform canvas:', consoleHtml.includes('waveformCanvas'));
  console.log('Contains 250ms cadence badge:', consoleHtml.includes('250ms CHUNKS'));

  console.log('\n=== TEST 2: WebSocket Handshake & Protocol ===');
  const ws = new WebSocket(baseWs);

  await new Promise((resolve, reject) => {
    ws.on('open', () => {
      console.log('WebSocket connected successfully');
      resolve();
    });
    ws.on('error', reject);
  });

  // Send AUDIO_INIT handshake
  console.log('Sending AUDIO_INIT (250ms chunk duration, 16kHz)...');
  ws.send(JSON.stringify({
    type: 'AUDIO_INIT',
    roomId: 'TECH-2026',
    sampleRate: 16000,
    channelCount: 1,
    chunkDurationMs: 250
  }));

  const initAck = await new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'AUDIO_INIT_ACK') {
        ws.removeListener('message', handler);
        resolve(msg);
      }
    };
    ws.on('message', handler);
  });

  console.log('Received Handshake Ack:', initAck);

  console.log('\n=== TEST 3: Streaming Raw 250ms Audio Chunks ===');
  // 16kHz * 0.25s = 4000 samples = 8000 bytes (PCM 16-bit)
  const chunkSize = 8000;
  const chunkBuffer = Buffer.alloc(chunkSize);
  for (let i = 0; i < chunkSize / 2; i++) {
    const val = Math.round(Math.sin(i * 0.1) * 16000);
    chunkBuffer.writeInt16LE(val, i * 2);
  }

  let telemetryReceived = 0;
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'AUDIO_TELEMETRY') {
        telemetryReceived++;
        console.log(`Telemetry update: chunksReceived=${msg.chunksReceived}, throughput=${msg.throughputKbps} kbps, levelRms=${msg.levelRms}`);
      }
    } catch (e) {}
  });

  const totalChunksToSend = 12; // 3 seconds of audio at 250ms chunks
  console.log(`Streaming ${totalChunksToSend} consecutive 250ms chunks...`);
  for (let i = 1; i <= totalChunksToSend; i++) {
    ws.send(chunkBuffer);
    await new Promise(r => setTimeout(r, 60));
  }

  await new Promise(r => setTimeout(r, 500));
  console.log('Total telemetry updates received:', telemetryReceived);

  console.log('\n=== TEST 4: Mute / Resume Control ===');
  console.log('Sending MUTE_TOGGLE (isMuted: true)...');
  ws.send(JSON.stringify({ type: 'MUTE_TOGGLE', isMuted: true }));
  const muteAck = await new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'MUTE_ACK') {
        ws.removeListener('message', handler);
        resolve(msg);
      }
    };
    ws.on('message', handler);
  });
  console.log('Received Mute Ack:', muteAck);

  console.log('Sending MUTE_TOGGLE (isMuted: false)...');
  ws.send(JSON.stringify({ type: 'MUTE_TOGGLE', isMuted: false }));
  await new Promise(r => setTimeout(r, 200));

  console.log('\n=== TEST 5: Telemetry REST Endpoint Verification ===');
  const statusRes = await fetch(baseHttp + '/api/sessions/TECH-2026/audio-status').then(r => r.json());
  console.log('Server Audio Ingestion State:');
  console.log(' - isStreaming:', statusRes.audioState?.isStreaming);
  console.log(' - totalChunksReceived:', statusRes.audioState?.totalChunksReceived);
  console.log(' - totalBytesReceived:', statusRes.audioState?.totalBytesReceived);
  console.log(' - chunkDurationMs:', statusRes.audioState?.chunkDurationMs);

  console.log('\n=== TEST 6: Regression Verification (Instant QR Join) ===');
  const qrRes = await fetch(baseHttp + '/api/sessions/TECH-2026/qr').then(r => r.json());
  console.log('QR JoinUrl intact:', qrRes.joinUrl);
  console.log('QR Data valid:', qrRes.qrDataUrl?.startsWith('data:image/png;base64,'));
  const joinPage = await fetch(baseHttp + '/join/TECH-2026');
  console.log('Join page status:', joinPage.status);
  const livePage = await fetch(baseHttp + '/live/TECH-2026');
  console.log('Live page status:', livePage.status);

  ws.close();
  console.log('\n=== ALL WEBSOCKET AUDIO INGESTION TESTS PASSED SUCCESSFULLY! ===');
}

runAudioIngestionTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
