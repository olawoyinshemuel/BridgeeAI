import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import QRCode from 'qrcode';
import { sttEngine } from './services/sttService.js';
import { translationEngine } from './services/translationService.js';

try {
  if (process.loadEnvFile) {
    process.loadEnvFile();
  }
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pre-seeded sessions for immediate testing across all 4 templates
const sessions = {
  'TECH-2026': {
    sessionId: 'sess_tech_2026_uuid',
    roomId: 'TECH-2026',
    title: 'Global AI & Ethics Summit 2026',
    hostName: 'Dr. Elena Rostova',
    template: 'Conference',
    sourceLanguage: { code: 'en-US', name: 'English' },
    status: 'active',
    activeParticipants: 42,
    createdAt: new Date().toISOString()
  },
  'EDU-101': {
    sessionId: 'sess_edu_101_uuid',
    roomId: 'EDU-101',
    title: 'Advanced Machine Learning Bootcamp',
    hostName: 'Prof. David Chen',
    template: 'Education',
    sourceLanguage: { code: 'en-US', name: 'English' },
    status: 'active',
    activeParticipants: 19,
    createdAt: new Date().toISOString()
  },
  'CHURCH-LIVE': {
    sessionId: 'sess_church_live_uuid',
    roomId: 'CHURCH-LIVE',
    title: 'Grace International Sunday Gathering',
    hostName: 'Pastor Marcus Adeyemi',
    template: 'Church',
    sourceLanguage: { code: 'en-US', name: 'English' },
    status: 'active',
    activeParticipants: 128,
    createdAt: new Date().toISOString()
  },
  'GLOBAL-EVENT': {
    sessionId: 'sess_global_event_uuid',
    roomId: 'GLOBAL-EVENT',
    title: 'World Civic Innovation Assembly',
    hostName: 'Amina Al-Mansoor',
    template: 'Event',
    sourceLanguage: { code: 'en-US', name: 'English' },
    status: 'active',
    activeParticipants: 85,
    createdAt: new Date().toISOString()
  }
};

// Supported target languages with capability profiles
const supportedLanguages = [
  { code: 'fr-FR', name: 'Français', englishName: 'French', script: 'Latin', capabilities: { text: true, audio: true } },
  { code: 'es-ES', name: 'Español', englishName: 'Spanish', script: 'Latin', capabilities: { text: true, audio: true } },
  { code: 'yo-NG', name: 'Yorùbá', englishName: 'Yoruba', script: 'Latin', capabilities: { text: true, audio: false } },
  { code: 'ha-NG', name: 'Hausa', englishName: 'Hausa', script: 'Latin', capabilities: { text: true, audio: false } },
  { code: 'ig-NG', name: 'Asụsụ Igbo', englishName: 'Igbo', script: 'Latin', capabilities: { text: true, audio: false } },
  { code: 'de-DE', name: 'Deutsch', englishName: 'German', script: 'Latin', capabilities: { text: true, audio: true } },
  { code: 'ja-JP', name: '日本語', englishName: 'Japanese', script: 'Kanji / Kana', capabilities: { text: true, audio: true } },
  { code: 'zh-CN', name: '简体中文', englishName: 'Chinese (Simplified)', script: 'Simplified Han', capabilities: { text: true, audio: true } },
  { code: 'ar-SA', name: 'العربية', englishName: 'Arabic', script: 'Arabic', capabilities: { text: true, audio: true } },
  { code: 'pt-BR', name: 'Português', englishName: 'Portuguese', script: 'Latin', capabilities: { text: true, audio: true } },
  { code: 'sw-KE', name: 'Kiswahili', englishName: 'Swahili', script: 'Latin', capabilities: { text: true, audio: false } }
];

// Audio ingestion state per session
const sessionAudioState = {};
// Live participant subscribers per room: Map<roomId, Set<{ ws, lang, mode }>>
const roomSubscribers = new Map();

function getOrCreateAudioState(roomId) {
  if (!sessionAudioState[roomId]) {
    sessionAudioState[roomId] = {
      isStreaming: false,
      isMuted: false,
      isPaused: false,
      sampleRate: 16000,
      chunkDurationMs: 250,
      totalChunksReceived: 0,
      totalBytesReceived: 0,
      streamStartTime: null,
      lastChunkTime: null,
      currentRms: 0,
      transcriptHistory: []
    };
  }
  return sessionAudioState[roomId];
}

function getRoomSubscriberSet(roomId) {
  if (!roomSubscribers.has(roomId)) {
    roomSubscribers.set(roomId, new Set());
  }
  return roomSubscribers.get(roomId);
}

// REST APIs
app.get('/api/sessions/:roomId', (req, res) => {
  const token = req.params.roomId.toUpperCase();
  const session = sessions[token];

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found or token has expired',
      validSampleTokens: Object.keys(sessions)
    });
  }

  const subscribers = getRoomSubscriberSet(token);
  res.json({
    success: true,
    session: {
      ...session,
      liveParticipantsCount: subscribers.size + (sessionAudioState[token]?.isStreaming ? 1 : 0)
    },
    languages: supportedLanguages
  });
});

app.get('/api/sessions/:roomId/qr', async (req, res) => {
  const token = req.params.roomId.toUpperCase();
  const session = sessions[token];

  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const hostHeader = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol;
  const joinUrl = `${protocol}://${hostHeader}/join/${token}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#1A1818',
        light: '#FFFFFF'
      },
      width: 400
    });

    res.json({
      success: true,
      joinUrl,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
});

app.get('/api/sessions/:roomId/audio-status', (req, res) => {
  const token = req.params.roomId.toUpperCase();
  const state = sessionAudioState[token] || getOrCreateAudioState(token);
  res.json({
    success: true,
    roomId: token,
    audioState: state
  });
});

app.post('/api/sessions/:roomId/translate', async (req, res) => {
  try {
    const { sentence, targetLanguages, glossary } = req.body;
    if (!sentence) {
      return res.status(400).json({ success: false, error: 'Missing sentence parameter' });
    }
    const langs = Array.isArray(targetLanguages) && targetLanguages.length > 0
      ? targetLanguages
      : supportedLanguages.map(l => l.code);
    const results = await translationEngine.translateBatchAsync(sentence, langs, glossary);
    res.json({
      success: true,
      sentence,
      translations: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { 
      title, 
      template = 'Conference', 
      hostName = 'Event Host', 
      sourceLanguage = { code: 'en-US', name: 'English' },
      enabledLanguages = [],
      glossaryTerms = '',
      uploadedFiles = [],
      customRoomId
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Session title is required' });
    }

    // Generate room code or sanitize custom room code
    let token;
    if (customRoomId && customRoomId.trim()) {
      token = customRoomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').substring(0, 16);
    }
    
    if (!token) {
      const prefixMap = {
        'Church': 'SERMON',
        'Education': 'CLASS',
        'Conference': 'SUMMIT',
        'Event': 'EXPO'
      };
      const prefix = prefixMap[template] || 'ROOM';
      const randomNum = Math.floor(100 + Math.random() * 900);
      token = `${prefix}-${randomNum}`;
    }

    // Parse glossary items
    const parsedGlossary = [];
    if (glossaryTerms && typeof glossaryTerms === 'string') {
      glossaryTerms.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed) parsedGlossary.push(trimmed);
      });
    }

    // Construct session record
    const newSession = {
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomId: token,
      title: title.trim(),
      hostName: hostName.trim() || 'Event Host',
      template: template,
      sourceLanguage: typeof sourceLanguage === 'string' 
        ? { code: sourceLanguage, name: sourceLanguage } 
        : sourceLanguage,
      enabledLanguages: Array.isArray(enabledLanguages) && enabledLanguages.length > 0 
        ? enabledLanguages 
        : supportedLanguages.map(l => l.code),
      glossary: parsedGlossary,
      uploadedFiles: uploadedFiles || [],
      status: 'active',
      activeParticipants: 0,
      createdAt: new Date().toISOString()
    };

    sessions[token] = newSession;
    getOrCreateAudioState(token);

    res.status(201).json({
      success: true,
      session: newSession,
      urls: {
        joinUrl: `/join/${token}`,
        stageDisplayUrl: `/venue/${token}`,
        overlayUrl: `/overlay/${token}`,
        previewUrl: `/session/${token}/preview`,
        consoleUrl: `/host/console/${token}`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sessions', (req, res) => {
  res.json({
    success: true,
    sessions: Object.values(sessions)
  });
});

// HTML Page Routes: Host Onboarding & Session Flow
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/session/new', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'session-new.html'));
});

app.get('/session/:roomId/preview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host-preview.html'));
});

app.get('/session/preview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host-preview.html'));
});

app.get('/join/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

app.get('/live/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'live.html'));
});

app.get('/host/preview/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host-preview.html'));
});

app.get('/host/console/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host-console.html'));
});

app.get('/host/console', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host-console.html'));
});

app.get('/education', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'education.html'));
});

app.get('/conferences', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'conferences.html'));
});

app.get('/church', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'church.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/overlay/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overlay.html'));
});

app.get('/overlay', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overlay.html'));
});

app.get('/venue/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'venue.html'));
});

app.get('/venue', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'venue.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dual WebSocket Server:
// 1. /ws/audio : Host 250ms Audio Ingestion & Host Live Transcript Feed
// 2. /ws/live  : Participant Multilingual Live Translated Captions Subscription
const wssAudio = new WebSocketServer({ noServer: true });
const wssLive = new WebSocketServer({ noServer: true });

// Host WebSocket connection handling
wssAudio.on('connection', (ws, req, roomId) => {
  const audioState = getOrCreateAudioState(roomId);
  console.log(`[WS Host Ingestion] Host connected for room: ${roomId}`);

  ws.on('message', async (data, isBinary) => {
    // 1. Text Protocol Messages
    if (!isBinary) {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'AUDIO_INIT') {
          audioState.isStreaming = true;
          audioState.isMuted = false;
          audioState.sampleRate = msg.sampleRate || 16000;
          audioState.chunkDurationMs = msg.chunkDurationMs || 250;
          audioState.streamStartTime = Date.now();
          audioState.totalChunksReceived = 0;
          audioState.totalBytesReceived = 0;

          ws.send(JSON.stringify({
            type: 'AUDIO_INIT_ACK',
            status: 'ready',
            roomId,
            sessionId: sessions[roomId]?.sessionId || 'sess_default',
            chunkDurationMs: audioState.chunkDurationMs
          }));

          // Notify live subscribers that host has started speaking
          broadcastToRoom(roomId, {
            type: 'STREAM_STATUS',
            isStreaming: true,
            isMuted: false
          });
        } else if (msg.type === 'MUTE_TOGGLE') {
          audioState.isMuted = !!msg.isMuted;
          ws.send(JSON.stringify({ type: 'MUTE_ACK', isMuted: audioState.isMuted }));
          broadcastToRoom(roomId, { type: 'STREAM_STATUS', isStreaming: audioState.isStreaming, isMuted: audioState.isMuted });
        } else if (msg.type === 'PAUSE_TOGGLE') {
          audioState.isPaused = !!msg.isPaused;
          ws.send(JSON.stringify({ type: 'PAUSE_ACK', isPaused: audioState.isPaused }));
          broadcastToRoom(roomId, { type: 'STREAM_STATUS', isPaused: audioState.isPaused });
        } else if (msg.type === 'STOP_STREAM') {
          audioState.isStreaming = false;
          sttEngine.resetSession(roomId);
          ws.send(JSON.stringify({ type: 'STOP_ACK', totalChunksReceived: audioState.totalChunksReceived }));
          broadcastToRoom(roomId, { type: 'STREAM_STATUS', isStreaming: false });
        } else if (msg.type === 'REAL_SPEECH_INIT') {
          sttEngine.setRealSpeechActive(roomId, true);
          console.log(`[STT Real Voice] Host real speech recognition active for room: ${roomId}`);
        } else if (msg.type === 'REAL_SPEECH_PARTIAL') {
          sttEngine.setRealSpeechActive(roomId, true);
          const partialText = msg.text || '';
          if (partialText.trim()) {
            ws.send(JSON.stringify({
              type: 'SOURCE_PARTIAL',
              partialText,
              timestamp: new Date().toISOString()
            }));
            broadcastToRoom(roomId, {
              type: 'CAPTION_PARTIAL',
              partialText,
              timestamp: new Date().toISOString()
            });
          }
        } else if (msg.type === 'REAL_SPEECH_FINAL') {
          sttEngine.setRealSpeechActive(roomId, true);
          const finalText = (msg.text || '').trim();
          if (finalText) {
            const timestamp = new Date().toISOString();
            audioState.transcriptHistory.push({
              text: finalText,
              timestamp
            });
            ws.send(JSON.stringify({
              type: 'SOURCE_FINAL',
              finalText,
              timestamp
            }));
            const sessionGlossary = sessions[roomId]?.glossary || [];
            await dispatchTranslatedFinals(roomId, finalText, timestamp, sessionGlossary);
          }
        }
      } catch (err) {
        console.error('[WS Host Ingestion] Error parsing text message:', err);
      }
      return;
    }

    // 2. Binary Audio Ingestion (250ms chunks) -> Real-time STT & Translation
    if (audioState.isStreaming && !audioState.isMuted && !audioState.isPaused) {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      audioState.totalChunksReceived++;
      audioState.totalBytesReceived += buffer.length;
      audioState.lastChunkTime = Date.now();

      // Telemetry every 4 chunks (~1 second)
      if (audioState.totalChunksReceived % 4 === 0) {
        const elapsedSec = Math.max(1, (Date.now() - audioState.streamStartTime) / 1000);
        const kbps = ((audioState.totalBytesReceived * 8) / (elapsedSec * 1000)).toFixed(1);
        ws.send(JSON.stringify({
          type: 'AUDIO_TELEMETRY',
          chunksReceived: audioState.totalChunksReceived,
          throughputKbps: kbps,
          status: 'ingesting_250ms_active'
        }));
      }

      // Feed into Real-Time Speech-to-Text Pipeline
      sttEngine.processAudioChunk(
        roomId,
        buffer,
        // On Partial Speech Arrival
        (partialEvent) => {
          // Push partial transcript to host console
          ws.send(JSON.stringify({
            type: 'SOURCE_PARTIAL',
            partialText: partialEvent.partialText,
            timestamp: partialEvent.timestamp
          }));

          // Push partial to participants in their room
          broadcastToRoom(roomId, {
            type: 'CAPTION_PARTIAL',
            partialText: partialEvent.partialText,
            timestamp: partialEvent.timestamp
          });
        },
        // On Finalized Sentence Boundary (VAD Trigger)
        async (finalEvent) => {
          const sourceSentence = finalEvent.finalText;
          audioState.transcriptHistory.push({
            text: sourceSentence,
            timestamp: finalEvent.timestamp
          });

          // Echo finalized sentence to host console
          ws.send(JSON.stringify({
            type: 'SOURCE_FINAL',
            finalText: sourceSentence,
            timestamp: finalEvent.timestamp
          }));

          // Translate into participant languages and broadcast
          await dispatchTranslatedFinals(roomId, sourceSentence, finalEvent.timestamp);
        }
      );
    }
  });

  ws.on('close', () => {
    console.log(`[WS Host Ingestion] Closed host connection for: ${roomId}`);
    audioState.isStreaming = false;
  });
});

// Participant Live Multilingual Caption WebSocket
wssLive.on('connection', (ws, req, roomId, lang, mode) => {
  const subscriber = { ws, lang, mode, roomId };
  const roomSet = getRoomSubscriberSet(roomId);
  roomSet.add(subscriber);

  console.log(`[WS Live Subscriber] Participant joined: room=${roomId}, lang=${lang}, mode=${mode} (Total: ${roomSet.size})`);

  // Send initial welcome & session status
  const audioState = getOrCreateAudioState(roomId);
  ws.send(JSON.stringify({
    type: 'SUBSCRIPTION_READY',
    roomId,
    lang,
    mode,
    isHostStreaming: audioState.isStreaming,
    recentHistory: audioState.transcriptHistory.slice(-3).map(h => ({
      original: h.text,
      translated: translationEngine.translate(h.text, lang),
      timestamp: h.timestamp
    }))
  }));

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'DEMO_SPEECH_PARTIAL') {
        broadcastToRoom(roomId, {
          type: 'CAPTION_PARTIAL',
          partialText: msg.text || '',
          timestamp: new Date().toISOString()
        });
      } else if (msg.type === 'DEMO_SPEECH_FINAL') {
        const finalText = (msg.text || '').trim();
        if (finalText) {
          const timestamp = new Date().toISOString();
          audioState.transcriptHistory.push({ text: finalText, timestamp });
          const sessionGlossary = sessions[roomId]?.glossary || [];
          await dispatchTranslatedFinals(roomId, finalText, timestamp, sessionGlossary);
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    roomSet.delete(subscriber);
    console.log(`[WS Live Subscriber] Participant left room: ${roomId} (Remaining: ${roomSet.size})`);
  });
});

// Broadcast helper for all participants in a room
function broadcastToRoom(roomId, messageObj) {
  const roomSet = roomSubscribers.get(roomId);
  if (!roomSet || roomSet.size === 0) return;

  const payload = JSON.stringify(messageObj);
  for (const sub of roomSet) {
    if (sub.ws.readyState === WebSocket.OPEN) {
      sub.ws.send(payload);
    }
  }
}

// Dispatches finalized sentence translated to each participant's target language
async function dispatchTranslatedFinals(roomId, sourceSentence, timestamp) {
  const roomSet = roomSubscribers.get(roomId);
  if (!roomSet || roomSet.size === 0) return;

  // Collect all unique active languages subscribed in this room
  const neededLangs = new Set();
  for (const sub of roomSet) {
    if (sub.ws.readyState === WebSocket.OPEN && sub.lang) {
      neededLangs.add(sub.lang);
    }
  }

  // Perform cached or batch Gemini translation for all room languages
  const translations = await translationEngine.translateBatchAsync(
    sourceSentence,
    Array.from(neededLangs)
  );

  for (const sub of roomSet) {
    if (sub.ws.readyState === WebSocket.OPEN) {
      const targetLang = sub.lang;
      const translatedText = translations[targetLang] || translationEngine.translate(sourceSentence, targetLang);

      sub.ws.send(JSON.stringify({
        type: 'CAPTION_FINAL',
        originalText: sourceSentence,
        translatedText,
        lang: targetLang,
        mode: sub.mode,
        timestamp
      }));
    }
  }
}

// HTTP Upgrade routing for WebSockets
server.on('upgrade', (request, socket, head) => {
  const urlObj = new URL(request.url, `http://${request.headers.host}`);
  const pathname = urlObj.pathname;
  const roomId = (urlObj.searchParams.get('roomId') || 'TECH-2026').toUpperCase();

  if (pathname === '/ws/audio') {
    wssAudio.handleUpgrade(request, socket, head, (ws) => {
      wssAudio.emit('connection', ws, request, roomId);
    });
  } else if (pathname === '/ws/live') {
    const lang = urlObj.searchParams.get('lang') || 'fr-FR';
    const mode = urlObj.searchParams.get('mode') || 'read_listen';
    wssLive.handleUpgrade(request, socket, head, (ws) => {
      wssLive.emit('connection', ws, request, roomId, lang, mode);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`BridgeeAI server running on http://localhost:${PORT}`);
});
