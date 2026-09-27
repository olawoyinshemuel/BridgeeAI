// test_natlas_realtime_ingestion.js
// End-to-End Realtime Ingestion Verification for N-ATLAS (Phase 3)

import { spawn } from 'child_process';
import { WebSocket } from 'ws';

async function runRealtimeIngestionTest() {
  console.log('=== Step 1: Starting BridgeeAI Server for Realtime Test ===');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3005' }, // Use 3005 to avoid port collision
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => {
    // console.log('[Server stdout]:', d.toString().trim());
  });
  serverProcess.stderr.on('data', (d) => {
    console.error('[Server stderr]:', d.toString().trim());
  });

  // Wait for server to become ready
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:3005/api/sessions/NAIC-VOICE');
      if (res.ok) {
        const data = await res.json();
        console.log('Server is online. NAIC-VOICE Session loaded:', data.session?.title);
        serverReady = true;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!serverReady) {
    serverProcess.kill();
    throw new Error('Server failed to start on port 3005 within timeout');
  }

  try {
    console.log('\n=== Step 2: Connect Participant Subscriber (Yorùbá -> French) ===');
    const participantWs = new WebSocket('ws://localhost:3005/ws/live?roomId=NAIC-VOICE&lang=fr-FR&mode=read');

    await new Promise((resolve, reject) => {
      participantWs.on('open', resolve);
      participantWs.on('error', reject);
    });

    const participantInit = await new Promise((resolve) => {
      participantWs.once('message', (data) => resolve(JSON.parse(data.toString())));
    });
    console.log('Participant subscribed:', participantInit.type, '| Room:', participantInit.roomId, '| Lang:', participantInit.lang);

    const receivedPartials = [];
    const receivedFinals = [];

    participantWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'CAPTION_PARTIAL') {
          receivedPartials.push(msg.partialText);
        } else if (msg.type === 'CAPTION_FINAL') {
          receivedFinals.push(msg);
        }
      } catch (e) {}
    });

    console.log('\n=== Step 3: Connect Host Console & Handshake ===');
    const hostWs = new WebSocket('ws://localhost:3005/ws/audio?roomId=NAIC-VOICE&role=host');
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

    const initAck = await new Promise((resolve) => {
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'AUDIO_INIT_ACK') {
          hostWs.removeListener('message', handler);
          resolve(msg);
        }
      };
      hostWs.on('message', handler);
    });
    console.log('Host Handshake Acknowledged:', initAck);

    const hostPartials = [];
    const hostFinals = [];
    hostWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'SOURCE_PARTIAL') {
          hostPartials.push(msg.partialText);
        } else if (msg.type === 'SOURCE_FINAL') {
          hostFinals.push(msg.finalText);
        }
      } catch (e) {}
    });

    console.log('\n=== Step 4: Stream 250ms Chunks to Trigger Sentence Boundary ===');
    const dummyChunk = Buffer.alloc(8000); // 250ms PCM (16kHz 16-bit mono)

    // Stream 12 chunks (3 seconds of audio)
    for (let c = 0; c < 12; c++) {
      hostWs.send(dummyChunk);
      await new Promise(r => setTimeout(r, 60)); // Pace chunks
    }

    // Wait for async translation fan-out (Gemini Flash or algorithmic fallback)
    for (let wait = 0; wait < 40; wait++) {
      if (receivedFinals.length > 0) break;
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('Host received partials count:', hostPartials.length);
    console.log('Host received finals count:', hostFinals.length);
    console.log('Audience received partials count:', receivedPartials.length);
    console.log('Audience received finals count:', receivedFinals.length);

    if (hostFinals.length > 0) {
      console.log('Host Source Final:', hostFinals[0]);
    }
    if (receivedFinals.length > 0) {
      console.log('Audience Translated Final:', receivedFinals[0].translatedText, `[${receivedFinals[0].lang}]`);
    }

    if (hostPartials.length === 0 || hostFinals.length === 0) {
      throw new Error('N-ATLAS realtime ingestion failed to generate partials/finals for NAIC-VOICE');
    }

    if (receivedFinals.length === 0) {
      throw new Error('Audience failed to receive translated CAPTION_FINAL from N-ATLAS pipeline');
    }

    console.log('\n=== Step 5: Verification of Existing TECH-2026 Non-Nigerian Session ===');
    const resTech = await fetch('http://localhost:3005/api/sessions/TECH-2026');
    const techData = await resTech.json();
    console.log('TECH-2026 Status:', techData.success, '| Title:', techData.session?.title, '| SourceLang:', techData.session?.sourceLanguage?.code);

    if (!techData.success) {
      throw new Error('Existing TECH-2026 session was broken');
    }

    // Clean up WebSockets
    hostWs.close();
    participantWs.close();

    console.log('\n>>> ALL PHASE 3 REALTIME INGESTION TESTS PASSED! <<<');
  } finally {
    serverProcess.kill('SIGINT');
  }
}

runRealtimeIngestionTest().catch(err => {
  console.error('Realtime Test Failed:', err);
  process.exit(1);
});
