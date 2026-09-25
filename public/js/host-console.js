// BridgeeAI — Host Audio Console Controller
// Real-time 250ms WebSocket Audio Ingestion & Telemetry

let ws = null;
let audioContext = null;
let mediaStream = null;
let analyserNode = null;
let scriptProcessorNode = null;
let simulatorInterval = null;

let isStreaming = false;
let isMuted = false;
let isPaused = false;
let chunksSent = 0;
let chunksAcked = 0;
let streamStartTime = null;
let timerInterval = null;

// Speech Recognition & Real Voice Audio
let speechRecognizer = null;
let hostSourceLanguage = 'en-US';

// Audio parameters: 16kHz linear PCM, 250ms chunks = 4000 samples / chunk
const SAMPLE_RATE = 16000;
const CHUNK_DURATION_MS = 250;
const SAMPLES_PER_CHUNK = (SAMPLE_RATE * CHUNK_DURATION_MS) / 1000; // 4000 samples

// DOM Elements
const wsConnDot = document.getElementById('wsConnDot');
const wsConnLabel = document.getElementById('wsConnLabel');
const wsConnPulse = document.getElementById('wsConnPulse');
const railSessionTitle = document.getElementById('railSessionTitle');
const railRoomToken = document.getElementById('railRoomToken');
const panelTemplateTag = document.getElementById('panelTemplateTag');
const elapsedTimer = document.getElementById('elapsedTimer');

const waveformCanvas = document.getElementById('waveformCanvas');
const canvasCtx = waveformCanvas.getContext('2d');
const meterFill = document.getElementById('meterFill');
const meterDbVal = document.getElementById('meterDbVal');
const chunksLogBox = document.getElementById('chunksLogBox');
const streamStateSummary = document.getElementById('streamStateSummary');

const audioDeviceSelect = document.getElementById('audioDeviceSelect');
const chunksSentVal = document.getElementById('chunksSentVal');
const chunksAckVal = document.getElementById('chunksAckVal');
const throughputVal = document.getElementById('throughputVal');
const healthStatusVal = document.getElementById('healthStatusVal');

const startStopBtn = document.getElementById('startStopBtn');
const startStopIcon = document.getElementById('startStopIcon');
const startStopText = document.getElementById('startStopText');
const muteBtn = document.getElementById('muteBtn');
const muteIcon = document.getElementById('muteIcon');
const muteText = document.getElementById('muteText');
const pauseBtn = document.getElementById('pauseBtn');
const pauseText = document.getElementById('pauseText');
const statusNote = document.getElementById('statusNote');

const qrPreviewLink = document.getElementById('qrPreviewLink');
const attendeeJoinLink = document.getElementById('attendeeJoinLink');

// Get Room ID from URL
function getRoomId() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'host' && parts[1] === 'console' && parts[2]) {
    return parts[2].toUpperCase();
  }
  return 'TECH-2026';
}

const roomId = getRoomId();

// Initialize Console
async function initConsole() {
  railRoomToken.textContent = `ROOM: ${roomId}`;
  qrPreviewLink.href = `/host/preview/${roomId}`;
  attendeeJoinLink.href = `/join/${roomId}`;

  try {
    const res = await fetch(`/api/sessions/${roomId}`);
    const data = await res.json();
    if (data.success) {
      railSessionTitle.textContent = data.session.title;
      panelTemplateTag.textContent = data.session.template.toUpperCase();
      document.title = `${data.session.title} — Host Audio Console`;

      if (data.session.sourceLanguage) {
        hostSourceLanguage = typeof data.session.sourceLanguage === 'object'
          ? (data.session.sourceLanguage.code || 'en-US')
          : data.session.sourceLanguage;
      }
    }
  } catch (err) {
    console.error('Failed to load session details:', err);
  }

  // Populate audio input devices if supported
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      audioInputs.forEach((d, idx) => {
        const opt = document.createElement('option');
        opt.value = d.deviceId;
        opt.textContent = d.label || `Microphone ${idx + 1}`;
        audioDeviceSelect.appendChild(opt);
      });
    } catch (e) {
      console.warn('Microphone permission or enumeration not yet available:', e);
    }
  }

  // Setup Manual Speech Test Input Bar
  const manualInput = document.getElementById('manualSpeechInput');
  const btnSendManual = document.getElementById('btnSendManualSpeech');

  function sendManual() {
    if (!manualInput) return;
    const txt = manualInput.value.trim();
    if (!txt) return;
    handleRealVoiceFinal(txt);
    manualInput.value = '';
  }

  if (btnSendManual) {
    btnSendManual.addEventListener('click', sendManual);
  }
  if (manualInput) {
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendManual();
      }
    });
  }

  // Connect WebSocket gateway in standby
  connectWebSocket();
  drawIdleWaveform();
}

// WebSocket Connection
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/audio?roomId=${roomId}&role=host`;

  ws = new WebSocket(wsUrl);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    wsConnDot.style.background = 'var(--aqua-400)';
    wsConnDot.style.boxShadow = '0 0 10px var(--aqua-400)';
    wsConnLabel.textContent = 'WS CONNECTED';
    wsConnPulse.style.borderColor = 'rgba(122, 217, 210, 0.4)';
    statusNote.textContent = 'WebSocket ready for audio ingestion';
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleServerMessage(msg);
    } catch (e) {
      console.warn('Received binary or non-JSON message from server');
    }
  };

  ws.onclose = () => {
    wsConnDot.style.background = 'var(--danger-500)';
    wsConnDot.style.boxShadow = '0 0 10px var(--danger-500)';
    wsConnLabel.textContent = 'DISCONNECTED';
    statusNote.textContent = 'Connection closed. Reconnecting in 3s...';
    setTimeout(connectWebSocket, 3000);
  };
}

// Server Protocol Message Handler
function handleServerMessage(msg) {
  if (msg.type === 'AUDIO_INIT_ACK') {
    logActivity(`Handshake acknowledged: Ingestion ready @ ${msg.chunkDurationMs}ms chunks`, 'active-chunk');
    statusNote.textContent = `Streaming raw audio @ 250ms chunks / ${SAMPLE_RATE}Hz`;
  } else if (msg.type === 'AUDIO_TELEMETRY') {
    chunksAcked = msg.chunksReceived;
    chunksAckVal.textContent = chunksAcked;
    throughputVal.innerHTML = `${msg.throughputKbps} <span style="font-size:13px; font-weight:normal; color:rgba(255,252,244,0.5);">kbps</span>`;
  } else if (msg.type === 'MUTE_ACK') {
    logActivity(`Mic ${msg.isMuted ? 'Muted' : 'Unmuted'}`);
  } else if (msg.type === 'SOURCE_PARTIAL') {
    const partialEl = document.getElementById('partialLiveText');
    if (partialEl) {
      partialEl.textContent = `${msg.partialText} ...`;
      partialEl.style.color = 'var(--bone-50)';
    }
  } else if (msg.type === 'SOURCE_FINAL') {
    const feed = document.getElementById('hostTranscriptFeed');
    const partialEl = document.getElementById('partialLiveText');
    if (feed) {
      const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString('en-US', { hour12: false });
      const item = document.createElement('div');
      item.style.cssText = 'color: var(--bone-50); font-size: 14px; line-height: 1.4; padding: 4px 0; border-bottom: 1px solid rgba(255,252,244,0.05);';
      item.innerHTML = `<span style="color: var(--gold-400); font-family: monospace; font-size: 11px; margin-right: 8px;">[${time}]</span>${msg.finalText}`;
      if (partialEl) {
        feed.insertBefore(item, partialEl);
        partialEl.textContent = 'Listening...';
        partialEl.style.color = 'rgba(255,252,244,0.5)';
      } else {
        feed.appendChild(item);
      }
      feed.scrollTop = feed.scrollHeight;
    }
  }
}

// Real-Time Speech Recognition Engine (Web Speech API)
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    logActivity('Browser SpeechRecognition API not supported. Falling back to PCM streaming.', 'warn');
    return;
  }

  try {
    if (speechRecognizer) {
      try { speechRecognizer.stop(); } catch (e) {}
    }

    speechRecognizer = new SpeechRecognition();
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults = true;
    speechRecognizer.lang = hostSourceLanguage || 'en-US';

    speechRecognizer.onstart = () => {
      logActivity('🎙️ Real-time voice STT engine active & listening', 'active-chunk');
      const sttBadge = document.getElementById('sttStatusBadge');
      if (sttBadge) {
        sttBadge.textContent = 'Voice STT Active 🟢';
        sttBadge.style.color = '#2ECC71';
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'REAL_SPEECH_INIT', roomId }));
      }
    };

    speechRecognizer.onresult = (event) => {
      if (!isStreaming || isMuted || isPaused) return;

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const finalSpoken = transcript.trim();
          if (finalSpoken) {
            handleRealVoiceFinal(finalSpoken);
          }
        } else {
          interim += transcript;
        }
      }

      if (interim.trim()) {
        handleRealVoicePartial(interim.trim());
      }
    };

    speechRecognizer.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.warn('SpeechRecognition event error:', event.error);
      }
    };

    speechRecognizer.onend = () => {
      // Auto-restart while broadcasting is live
      if (isStreaming && !isPaused && !isMuted) {
        try {
          speechRecognizer.start();
        } catch (e) {}
      }
    };

    speechRecognizer.start();
  } catch (err) {
    console.warn('Failed to start SpeechRecognition:', err);
  }
}

function handleRealVoicePartial(interimText) {
  const partialEl = document.getElementById('partialLiveText');
  if (partialEl) {
    partialEl.textContent = `${interimText} ...`;
    partialEl.style.color = 'var(--bone-50)';
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'REAL_SPEECH_PARTIAL',
      text: interimText,
      roomId
    }));
  }
}

function handleRealVoiceFinal(finalSentence) {
  const feed = document.getElementById('hostTranscriptFeed');
  const partialEl = document.getElementById('partialLiveText');
  
  if (feed) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const item = document.createElement('div');
    item.style.cssText = 'color: var(--bone-50); font-size: 14px; line-height: 1.4; padding: 4px 0; border-bottom: 1px solid rgba(255,252,244,0.05);';
    item.innerHTML = `<span style="color: var(--gold-400); font-family: monospace; font-size: 11px; margin-right: 8px;">[${time}]</span>${finalSentence}`;
    
    if (partialEl) {
      feed.insertBefore(item, partialEl);
      partialEl.textContent = 'Listening for speech...';
      partialEl.style.color = 'rgba(255,252,244,0.5)';
    } else {
      feed.appendChild(item);
    }
    feed.scrollTop = feed.scrollHeight;
  }

  logActivity(`Spoken: "${finalSentence}"`, 'active-chunk');

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'REAL_SPEECH_FINAL',
      text: finalSentence,
      roomId
    }));
  }
}

// Start Audio Streaming
async function startStreaming() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;

    const deviceId = audioDeviceSelect.value;

    if (deviceId === 'simulator') {
      startSimulatedAudio();
    } else {
      try {
        const constraints = {
          audio: deviceId === 'default' ? true : { deviceId: { exact: deviceId } }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyserNode);

        // Process audio into 250ms PCM chunks
        setupAudioProcessing(source);

        // Launch Browser Real-Voice Speech Recognition
        setupSpeechRecognition();
      } catch (micErr) {
        console.warn('Physical microphone unavailable. Falling back to built-in Audio Simulator.', micErr);
        logActivity('Physical mic unavailable. Starting built-in Audio Simulator.', 'active-chunk');
        startSimulatedAudio();
      }
    }

    // Send Handshake
    ws.send(JSON.stringify({
      type: 'AUDIO_INIT',
      roomId,
      sampleRate: SAMPLE_RATE,
      channelCount: 1,
      chunkDurationMs: CHUNK_DURATION_MS
    }));

    isStreaming = true;
    isMuted = false;
    isPaused = false;
    chunksSent = 0;
    chunksAcked = 0;
    streamStartTime = Date.now();

    // UI Updates
    startStopBtn.classList.remove('btn-pill-primary');
    startStopBtn.classList.add('btn-mute');
    startStopIcon.textContent = '⏹';
    startStopText.textContent = 'Stop Audio Broadcast';
    muteBtn.disabled = false;
    pauseBtn.disabled = false;
    streamStateSummary.textContent = 'Live Ingestion Active (4 chunks/sec)';

    startTimer();
    renderWaveformLoop();
  } catch (err) {
    console.error('Failed to start audio broadcast:', err);
    alert('Could not start audio stream: ' + err.message);
  }
}

// Processing Web Audio API Node for 250ms chunks
function setupAudioProcessing(source) {
  // Use ScriptProcessor / Buffer Collector for 250ms PCM 16-bit
  const bufferSize = 4096;
  scriptProcessorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);

  let accumulatedSamples = new Float32Array(0);

  scriptProcessorNode.onaudioprocess = (e) => {
    if (!isStreaming || isMuted || isPaused) return;

    const inputData = e.inputBuffer.getChannelData(0);
    const newBuffer = new Float32Array(accumulatedSamples.length + inputData.length);
    newBuffer.set(accumulatedSamples, 0);
    newBuffer.set(inputData, accumulatedSamples.length);
    accumulatedSamples = newBuffer;

    // When we have at least 250ms of audio (4000 samples)
    while (accumulatedSamples.length >= SAMPLES_PER_CHUNK) {
      const chunkSamples = accumulatedSamples.slice(0, SAMPLES_PER_CHUNK);
      accumulatedSamples = accumulatedSamples.slice(SAMPLES_PER_CHUNK);

      // Convert float32 [-1.0, 1.0] to 16-bit linear PCM buffer
      const pcmBuffer = new ArrayBuffer(SAMPLES_PER_CHUNK * 2);
      const view = new DataView(pcmBuffer);
      for (let i = 0; i < SAMPLES_PER_CHUNK; i++) {
        let s = Math.max(-1, Math.min(1, chunkSamples[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }

      sendAudioChunk(pcmBuffer);
    }
  };

  source.connect(scriptProcessorNode);
  scriptProcessorNode.connect(audioContext.destination);
}

// Audio Simulator Mode (generates pure 250ms PCM chunks)
function startSimulatedAudio() {
  logActivity('Audio Simulator Mode Active: Generating realistic 250ms speech chunks');
  
  simulatorInterval = setInterval(() => {
    if (!isStreaming || isMuted || isPaused) return;

    // Generate 4000 samples of speech-like waveform (fundamental 180Hz + harmonics)
    const pcmBuffer = new ArrayBuffer(SAMPLES_PER_CHUNK * 2);
    const view = new DataView(pcmBuffer);
    const tBase = Date.now() / 1000;

    for (let i = 0; i < SAMPLES_PER_CHUNK; i++) {
      const t = tBase + i / SAMPLE_RATE;
      const sample = 0.4 * Math.sin(2 * Math.PI * 180 * t) + 
                     0.2 * Math.sin(2 * Math.PI * 360 * t) + 
                     0.1 * (Math.random() - 0.5);
      view.setInt16(i * 2, Math.round(sample * 32767), true);
    }

    sendAudioChunk(pcmBuffer);
  }, CHUNK_DURATION_MS);
}

// Send binary chunk over WebSocket
function sendAudioChunk(buffer) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(buffer);
    chunksSent++;
    chunksSentVal.textContent = chunksSent;

    if (chunksSent % 4 === 0) {
      logActivity(`Chunk #${chunksSent} sent [${buffer.byteLength} bytes / 250ms]`, 'active-chunk');
    }
  }
}

// Stop Audio Streaming
function stopStreaming() {
  isStreaming = false;

  if (speechRecognizer) {
    try {
      speechRecognizer.stop();
    } catch (e) {}
    speechRecognizer = null;
  }

  const sttBadge = document.getElementById('sttStatusBadge');
  if (sttBadge) {
    sttBadge.textContent = 'Standby';
    sttBadge.style.color = 'var(--aqua-400)';
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'STOP_STREAM' }));
  }

  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }

  if (scriptProcessorNode) {
    scriptProcessorNode.disconnect();
    scriptProcessorNode = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  stopTimer();

  // UI Updates
  startStopBtn.classList.remove('btn-mute');
  startStopBtn.classList.add('btn-pill-primary');
  startStopIcon.textContent = '▶';
  startStopText.textContent = 'Start Audio Broadcast';
  muteBtn.disabled = true;
  pauseBtn.disabled = true;
  streamStateSummary.textContent = 'Broadcast Stopped';
  meterFill.style.width = '0%';
  meterDbVal.textContent = '-∞ dB';

  logActivity(`Broadcast stopped. Total 250ms chunks streamed: ${chunksSent}`);
  drawIdleWaveform();
}

// Mute Toggle Handler
muteBtn.addEventListener('click', () => {
  if (!isStreaming) return;
  isMuted = !isMuted;

  if (isMuted && speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) {}
  } else if (!isMuted && isStreaming && audioDeviceSelect.value !== 'simulator') {
    setupSpeechRecognition();
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'MUTE_TOGGLE', isMuted }));
  }

  if (isMuted) {
    muteBtn.classList.add('is-muted');
    muteText.textContent = 'Unmute Mic';
    muteIcon.textContent = '🔇';
    statusNote.textContent = 'Microphone muted (chunk streaming paused)';
  } else {
    muteBtn.classList.remove('is-muted');
    muteText.textContent = 'Mute Mic';
    muteIcon.textContent = '🎙';
    statusNote.textContent = `Streaming raw audio @ 250ms chunks / ${SAMPLE_RATE}Hz`;
  }
});

// Pause Toggle Handler
pauseBtn.addEventListener('click', () => {
  if (!isStreaming) return;
  isPaused = !isPaused;

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'PAUSE_TOGGLE', isPaused }));
  }

  if (isPaused) {
    pauseBtn.classList.add('btn-mute');
    pauseText.textContent = 'Resume Session';
    pauseIcon.textContent = '▶';
    statusNote.textContent = 'Session paused globally';
  } else {
    pauseBtn.classList.remove('btn-mute');
    pauseText.textContent = 'Pause Session';
    pauseIcon.textContent = '⏸';
    statusNote.textContent = 'Session live';
  }
});

startStopBtn.addEventListener('click', () => {
  if (!isStreaming) {
    startStreaming();
  } else {
    stopStreaming();
  }
});

// Real-Time Waveform Loop (Rose #D7798B)
function renderWaveformLoop() {
  if (!isStreaming) return;

  requestAnimationFrame(renderWaveformLoop);

  const width = waveformCanvas.width;
  const height = waveformCanvas.height;

  canvasCtx.fillStyle = '#111010';
  canvasCtx.fillRect(0, 0, width, height);

  let dataArray = new Uint8Array(128);

  if (analyserNode && !isMuted && !isPaused) {
    analyserNode.getByteTimeDomainData(dataArray);
  } else {
    // Generate gentle live rhythm
    const t = Date.now() / 200;
    for (let i = 0; i < 128; i++) {
      dataArray[i] = isMuted ? 128 : Math.round(128 + Math.sin(t + i * 0.15) * 18);
    }
  }

  // Draw Rose Waveform Line
  canvasCtx.lineWidth = 2.5;
  canvasCtx.strokeStyle = isMuted ? 'rgba(215, 121, 139, 0.3)' : '#D7798B';
  canvasCtx.shadowColor = '#D7798B';
  canvasCtx.shadowBlur = isMuted ? 0 : 12;

  canvasCtx.beginPath();
  const sliceWidth = width / 128;
  let x = 0;

  for (let i = 0; i < 128; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  canvasCtx.lineTo(width, height / 2);
  canvasCtx.stroke();
  canvasCtx.shadowBlur = 0;

  // Calculate volume level for meter
  let peak = 0;
  for (let i = 0; i < 128; i++) {
    const dev = Math.abs(dataArray[i] - 128);
    if (dev > peak) peak = dev;
  }
  const pct = Math.min(100, Math.round((peak / 128) * 100));
  meterFill.style.width = `${pct}%`;
  const db = pct > 0 ? (20 * Math.log10(pct / 100)).toFixed(1) : '-∞';
  meterDbVal.textContent = `${db} dB`;
}

// Idle Waveform line
function drawIdleWaveform() {
  const width = waveformCanvas.width;
  const height = waveformCanvas.height;
  canvasCtx.fillStyle = '#111010';
  canvasCtx.fillRect(0, 0, width, height);

  canvasCtx.lineWidth = 1.5;
  canvasCtx.strokeStyle = 'rgba(215, 121, 139, 0.25)';
  canvasCtx.beginPath();
  canvasCtx.moveTo(0, height / 2);
  canvasCtx.lineTo(width, height / 2);
  canvasCtx.stroke();
}

// Activity Logging
function logActivity(text, className = '') {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const entry = document.createElement('div');
  entry.className = `log-entry ${className}`;
  entry.innerHTML = `<span>${text}</span><span style="opacity:0.4;">${time}</span>`;
  chunksLogBox.prepend(entry);

  while (chunksLogBox.children.length > 30) {
    chunksLogBox.removeChild(chunksLogBox.lastChild);
  }
}

// Elapsed Timer
function startTimer() {
  timerInterval = setInterval(() => {
    const elapsedMs = Date.now() - streamStartTime;
    const totalSec = Math.floor(elapsedMs / 1000);
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    elapsedTimer.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Boot
initConsole();

// Auto-start live stream if requested by preview page
if (new URLSearchParams(window.location.search).get('autostart') === 'true') {
  setTimeout(() => {
    if (!isStreaming) {
      logActivity('Auto-starting live microphone broadcast...', 'active-chunk');
      startStreaming();
    }
  }, 500);
}
