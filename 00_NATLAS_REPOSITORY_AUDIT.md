# **00_NATLAS_REPOSITORY_AUDIT.md**
## **BridgeeAI × N-ATLAS: Comprehensive Repository Architecture & Integration Audit**

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Repository Audit & Integration Surface Mapping  
**Target:** BridgeeAI Platform (`BridgeeAIX`)  
**NAIC Track:** Voice-First Access  
**Integration Subject:** N-ATLAS / NCAIR Speech Recognition Engine  
**Status:** COMPLETE AUDIT — NO DESTRUCTIVE CHANGES  

---

## **1. EXECUTIVE SUMMARY & CORE DIRECTIVE**

This document establishes the verified architectural baseline of the **BridgeeAIX** repository prior to implementing the **N-ATLAS** speech recognition layer.

### **Key Architectural Directives**
1. **Preserve Existing Architecture**: The existing BridgeeAI platform is the single source of truth. Under no circumstances should the application be rebuilt, cloned, or duplicated.
2. **Provider Subsystem Integration**: N-ATLAS is introduced strictly as a **pluggable Speech-to-Text (ASR) Provider** within the existing audio ingestion and caption broadcasting architecture.
3. **Preserve Downstream Pipeline**: Once N-ATLAS produces Nigerian language text (Yorùbá, Hausa, Igbo, Nigerian English), BridgeeAI's existing translation engine, WebSocket pub/sub network, and audience displays consume and distribute the text without modification.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BRIDGEEAI PLATFORM                             │
│                                                                             │
│   HOST MICROPHONE (Web Audio API: 16kHz PCM, 250ms Chunks)                  │
│                             │                                               │
│                             ▼                                               │
│              WEBSOCKET INGESTION: /ws/audio                                 │
│                             │                                               │
│                             ▼                                               │
│   ┌───────────────────────────────────────────────────┐                     │
│   │             SPEECH RECOGNITION (ASR)              │                     │
│   │                                                   │                     │
│   │  Existing Fallbacks   │   [★ N-ATLAS ASR ★]       │ ◄─── (THIS AUDIT)   │
│   │  (Mock Corpus /       │   - Yorùbá (yo-NG)        │                     │
│   │   Web Speech API)     │   - Hausa (ha-NG)         │                     │
│   │                       │   - Igbo (ig-NG)          │                     │
│   │                       │   - Nig. English (en-NG)  │                     │
│   └───────────────────────┼───────────────────────────┘                     │
│                           │ Nigerian Source Transcript                      │
│                           ▼                                                 │
│   ┌───────────────────────────────────────────────────┐                     │
│   │            TRANSLATION & CONTEXT LAYER            │                     │
│   │   (services/translationService.js - Gemini Flash) │ (PRESERVED)         │
│   └───────────────────────┬───────────────────────────┘                     │
│                           │ Multilingual Captions                           │
│                           ▼                                                 │
│              WEBSOCKET FAN-OUT: /ws/live                                    │
│                             │                                               │
│       ┌─────────────────────┼─────────────────────┐                         │
│       ▼                     ▼                     ▼                         │
│  Live Attendee UI     Venue Stage Display   Broadcast Overlay               │
│  (public/live.html)   (public/venue.html)   (public/overlay.html)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## **2. EXISTING CODEBASE & REPOSITORY TOPOLOGY**

### **2.1 File & Directory Structure**
```
BRIDGEEAIX/
├── .env                                  # Configuration (PORT, GEMINI_API_KEY)
├── package.json                          # Dependencies: express, ws, qrcode (ES Modules)
├── server.js                             # Express HTTP server + Dual WebSocket servers
├── services/
│   ├── sttService.js                     # Speech-to-Text & VAD sentence boundary tracking
│   └── translationService.js             # Batch Gemini translation & language dictionaries
├── public/
│   ├── index.html                        # Modern landing page with interactive demo
│   ├── auth.html                         # Host authentication UI
│   ├── session-new.html                  # Session configuration & room creation form
│   ├── host-console.html                 # Host audio console (waveform, RMS, controls)
│   ├── host-preview.html                 # Host onboarding preview & invite display
│   ├── join.html                         # Attendee onboarding & room entry
│   ├── live.html                         # Live multilingual subtitle viewer for mobile/desktop
│   ├── venue.html                        # High-contrast fullscreen stage display for venues
│   ├── overlay.html                      # Transparent lower-third subtitle overlay for OBS/vMix
│   ├── conferences.html                  # Conference vertical landing page
│   ├── church.html                       # Church/Worship vertical landing page
│   ├── education.html                    # Education/Bootcamp vertical landing page
│   ├── events.html                       # Global Event vertical landing page
│   ├── js/
│   │   ├── host-console.js               # AudioContext, ScriptProcessorNode, WS protocol
│   │   └── join.js                       # Join routing & room token resolution
│   ├── css/                              # Rich design system with bespoke typography
│   └── assets/                           # Branded vectors, icons, and illustrations
├── test_audio_ingestion.js               # Verification script for 250ms PCM WebSocket streaming
└── test_gemini_integration.js            # Verification script for Gemini Flash batch translation
```

### **2.2 Runtime & Dependencies**
* **Runtime**: Node.js v20+ with ECMAScript Modules (`"type": "module"` in `package.json`).
* **Core Dependencies**:
  * `express` (`^4.21.2`): HTTP routing, session endpoints, static asset delivery.
  * `ws` (`^8.18.0`): High-throughput, low-latency dual WebSocket server.
  * `qrcode` (`^1.5.4`): In-memory QR code generator for instant participant onboarding.
* **Build Step**: Zero frontend compilation required; leverages pure standards-based Vanilla JavaScript and CSS variables for maximum reliability and minimal deploy overhead.

---

## **3. DETAILED SUBSYSTEM AUDIT**

### **3.1 Audio Ingestion & Transport Pipeline**
* **Cadence & Encoding**: 
  * Sample Rate: 16,000 Hz (16 kHz).
  * Format: Linear PCM, 16-bit mono.
  * Frame Chunk Size: 250ms duration (4,000 samples = 8,000 bytes per frame).
* **Ingestion Endpoint**: `ws://<host>:<port>/ws/audio?roomId=<ROOM_ID>&role=host`.
* **State Tracking**: `sessionAudioState[roomId]` in `server.js` maintains:
  * `isStreaming`, `isMuted`, `isPaused`.
  * `totalChunksReceived`, `totalBytesReceived`.
  * `streamStartTime`, `lastChunkTime`.
  * `transcriptHistory` (rolling history of finalized sentences).
* **Handshake Protocol**:
  1. Client sends `AUDIO_INIT` `{ type: 'AUDIO_INIT', roomId, sampleRate: 16000, chunkDurationMs: 250 }`.
  2. Server responds `AUDIO_INIT_ACK` `{ status: 'ready', chunkDurationMs: 250 }`.
  3. Binary frames stream continuously at 4 fps (250ms cadence).
  4. Server sends `AUDIO_TELEMETRY` every 4 chunks (~1000ms) with throughput metrics.
* **Control Events**: `MUTE_TOGGLE`, `PAUSE_TOGGLE`, `STOP_STREAM`.
* **Browser Speech Bridge**: Host browser transmits speech recognition fallbacks via `REAL_SPEECH_INIT`, `REAL_SPEECH_PARTIAL`, and `REAL_SPEECH_FINAL`.

### **3.2 Speech-to-Text (STT) & VAD Architecture**
* **Location**: `services/sttService.js` (`STTService` class).
* **Current Implementation**:
  * Maintains per-room sentence tracking state: `sessionStates.get(roomId)`.
  * Accumulates 250ms audio chunks (`chunkAccumulator`).
  * Emits partial transcript tokens (`onPartial`) at ~500ms intervals.
  * Triggers Voice Activity Detection (VAD) boundary completion (`onFinal`) when a sentence completes.
  * Web Speech suppression: When `isRealSpeechActive(roomId)` is true, mock corpora are automatically suppressed in favor of real spoken voice.

### **3.3 Translation Engine & Language System**
* **Location**: `services/translationService.js` (`TranslationService` class).
* **Translation Pipeline**:
  1. **Dynamic Memory Cache**: `dynamicCache.get(sentence)` avoids redundant LLM inferences for repeated sentences.
  2. **Pre-Seeded Dictionary**: Fast-path deterministic lookup for common phrases across 11 target languages.
  3. **Batch Gemini 3.6 / 3.5 Flash Integration**:
     * Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`.
     * API Key: Sourced from `process.env.GEMINI_API_KEY`.
     * Domain Glossary Injection: Preserves specialized terminology supplied at session creation.
     * Orthography Prompting: Specifically tuned for African tonal languages (Yorùbá tone marks, Hausa diacritics, Igbo sub-dots).
  4. **Algorithmic Fallback**: Clean language tag prefixing when offline or during transient upstream timeouts.

### **3.4 Realtime Participant Distribution (/ws/live)**
* **Subscription Endpoint**: `ws://<host>:<port>/ws/live?roomId=<ROOM_ID>&lang=<LANG_CODE>&mode=<read|listen|read_listen>`.
* **Subscriber Registry**: `roomSubscribers = new Map<roomId, Set<{ ws, lang, mode }>>()`.
* **Broadcast Flow**:
  1. Partial text arrives from STT (`onPartial`) → `broadcastToRoom()` sends `CAPTION_PARTIAL` to all room listeners.
  2. Final sentence arrives from STT (`onFinal`) → `dispatchTranslatedFinals(roomId, sourceSentence, timestamp)`:
     * Identifies all distinct languages required by connected participants.
     * Batches translation requests through `translationEngine.translateBatchAsync()`.
     * Sends individualized `CAPTION_FINAL` packets containing `originalText`, `translatedText`, `lang`, and `timestamp`.
  3. Bandwidth efficiency: Less than 2 KB/sec per participant, ensuring robust reception on cellular 2G/3G connections.

### **3.5 Session Management & Lifecycle**
* **In-Memory Store**: `sessions` dictionary in `server.js`.
* **Pre-Seeded Operational Rooms**:
  * `TECH-2026`: Global AI & Ethics Summit 2026 (Conference template).
  * `EDU-101`: Advanced Machine Learning Bootcamp (Education template).
  * `CHURCH-LIVE`: Grace International Sunday Gathering (Church template).
  * `GLOBAL-EVENT`: World Civic Innovation Assembly (Event template).
* **Creation API**: `POST /api/sessions` accepts `title`, `template`, `hostName`, `sourceLanguage`, `enabledLanguages`, `glossaryTerms`, `uploadedFiles`, and `customRoomId`.
* **QR Code Generation**: `GET /api/sessions/:roomId/qr` outputs high-resolution PNG data URLs pointing to attendee join URLs.

### **3.6 Data Persistence Model**
* **Current State**: High-performance in-memory state suitable for low-latency live streaming.
* **Schema Specifications**: Fully articulated in `data-structure.md`:
  1. `Host / Presenter`
  2. `Session`
  3. `Context Document / Slide Deck`
  4. `Custom Glossary Term`
  5. `Participant / Audience Session`
  6. `Audio Chunk Stream`
  7. `Source Transcript Segment`
  8. `Translated Payload`
* **Supabase Integration Readiness**: Database tables, row-level security (RLS) policies, and foreign keys align cleanly with this 8-entity model.

---

## **4. EXACT N-ATLAS INTEGRATION SPECIFICATION**

### **4.1 Where N-ATLAS Fits**
N-ATLAS operates strictly as the **primary Speech-to-Text (ASR) Provider for Nigerian languages**. It does NOT alter:
* How the host microphone captures audio.
* How WebSockets transport audio to the server.
* How the server fans out translated text to participants.
* Any HTML, CSS, or UI component on participant screens.

### **4.2 Architectural Layering**
```
[ Host Browser (host-console.js) ]
                │  16kHz PCM (250ms chunks)
                ▼
[ server.js: /ws/audio Connection ]
                │  Binary Buffer
                ▼
┌────────────────────────────────────────────────────────┐
│                   ASR ROUTER / MANAGER                 │
│                                                        │
│  If session.sourceLanguage in ['yo-NG','ha-NG',        │
│                               'ig-NG','en-NG']:        │
│          ──► NatlasASRProvider                         │
│  Else:                                                 │
│          ──► Standard / Fallback STT Provider          │
└────────────────────────────────────────────────────────┘
                │
                │ Emits: onPartial(text) & onFinal(text)
                ▼
[ server.js: dispatchTranslatedFinals() ]
                │
                ▼
[ services/translationService.js: Gemini Flash ]
                │
                ▼
[ server.js: /ws/live Subscribers ]
```

### **4.3 Language Support Matrix**
| Language Code | Display Name | Script | ASR Provider | Translation Provider |
| :--- | :--- | :--- | :--- | :--- |
| `yo-NG` | Yorùbá | Latin + Tones | **N-ATLAS** | Gemini Flash |
| `ha-NG` | Hausa | Latin + Diacritics | **N-ATLAS** | Gemini Flash |
| `ig-NG` | Asụsụ Igbo | Latin + Sub-dots | **N-ATLAS** | Gemini Flash |
| `en-NG` / `pcm` | Nigerian English / Pidgin | Latin | **N-ATLAS** | Gemini Flash |
| `en-US` | English (US) | Latin | WebSpeech / Fallback | Gemini Flash |
| `fr-FR`, `es-ES`, etc. | Target Languages | Various | Audience Target | Gemini Flash |

### **4.4 Boundary Interface Contract**
To maintain clean separation and testability, N-ATLAS will adhere to the following interface contract:

```typescript
interface ASRProvider {
  id: string; // "natlas" | "mock-natlas" | "webspeech"
  name: string; // "N-ATLAS Speech Recognition"
  supportedLanguages: string[]; // ["yo-NG", "ha-NG", "ig-NG", "en-NG"]
  
  initialize(config: NatlasConfig): Promise<void>;
  processChunk(roomId: string, audioBuffer: Buffer): Promise<void>;
  onPartial(callback: (event: PartialTranscriptEvent) => void): void;
  onFinal(callback: (event: FinalTranscriptEvent) => void): void;
  resetSession(roomId: string): void;
  healthCheck(): Promise<NatlasHealthStatus>;
}
```

### **4.5 Graceful Degradation & Resilience Strategy**
1. **Live N-ATLAS Mode**: Used when `NATLAS_ENABLED=true` and valid API credentials are configured.
2. **Mock N-ATLAS Mode (`MockNatlasASRProvider`)**: Used for automated testing, local development, or if the upstream N-ATLAS API is unreachable. Emits realistic phonetically accurate Nigerian language phrases matching the session domain.
3. **Automatic Fallback Circuit**: If the N-ATLAS API returns consecutive 5xx errors or network timeouts exceeding `NATLAS_TIMEOUT_MS` (default 5000ms), the system logs the incident and seamlessly falls back to the secondary speech pipeline without interrupting the live session.

---

## **5. CONFIGURATION & ENVIRONMENT SPECIFICATION**

The following environment variables will govern the N-ATLAS integration in `.env`:

```bash
# ==============================================================================
# EXISTING BRIDGEEAI CONFIGURATION (PRESERVED)
# ==============================================================================
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here

# ==============================================================================
# N-ATLAS / NAIC INTEGRATION CONFIGURATION (PHASE 1+)
# ==============================================================================
NATLAS_ENABLED=false
NATLAS_API_BASE_URL=https://api.natlas.ncair.gov.ng/v1
NATLAS_API_KEY=
NATLAS_TIMEOUT_MS=5000
NATLAS_MAX_RETRIES=3
NATLAS_MOCK_FALLBACK=true

# Language-specific Model Endpoint Overrides (if required by N-ATLAS API)
NATLAS_MODEL_YORUBA=natlas-asr-yo-v1
NATLAS_MODEL_HAUSA=natlas-asr-ha-v1
NATLAS_MODEL_IGBO=natlas-asr-ig-v1
NATLAS_MODEL_NIGERIAN_ENGLISH=natlas-asr-en-ng-v1
```

---

## **6. RISKS, CONSTRAINTS & BLOCKERS ASSESSMENT**

1. **Network Latency & Jitter**:
   * *Mitigation*: Audio is already buffered into 250ms chunks. Telemetry reports throughput in real time, and the ASR provider interface uses asynchronous non-blocking dispatch.
2. **Tone Mark & Diacritic Fidelity**:
   * *Mitigation*: `translationService.js` already includes explicit system prompts enforcing tone marks and diacritics for Yorùbá (`à, á, è, é, ẹ, ẹ́, ẹ̀, ì, í, ò, ó, ọ, ọ́, ọ̀, ù, ú`), Hausa (`ƙ, ɗ, ɓ, 'y`), and Igbo (`ị, ọ, ụ, ṅ`).
3. **Upstream API Availability**:
   * *Mitigation*: The `MockNatlasASRProvider` ensures full end-to-end functionality even during hackathons, offline demos, or network degradation.
4. **Zero Regression Guarantee**:
   * All existing tests ([test_audio_ingestion.js](file:///c:/Users/OLAWOYIN%20SHEMUEL/Documents/Anti%20Grav/BRIDGEEAIX/test_audio_ingestion.js), [test_gemini_integration.js](file:///c:/Users/OLAWOYIN%20SHEMUEL/Documents/Anti%20Grav/BRIDGEEAIX/test_gemini_integration.js)) must pass with 100% fidelity before and after every phase.

---

## **7. AUDIT CONCLUSION & READINESS CHECK**

* **Architecture Integrity**: 100% preserved.
* **Component Reuse**: 100% of transport, translation, and UI layers are reused.
* **Integration Points**: Clearly isolated to the speech recognition ingestion boundary.
* **Readiness**: Phase 0 complete. Ready to proceed to **Phase 1 (N-ATLAS Integration Foundation)** upon explicit instruction.
