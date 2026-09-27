# **ARCHITECTURE.md**
## **BridgeeAI × N-ATLAS: Technical Architecture Deep-Dive**

---

## **1. SYSTEM ARCHITECTURE & TOPOLOGY**

BridgeeAI is designed around an event-driven, dual-WebSocket architecture ensuring ultra-low latency (< 1.0s) and minimal network footprint (< 2 KB/s) for live multilingual communication.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HOST / PRESENTER TIER                              │
│                                                                             │
│  [Browser Microphone] ──► [Web Audio API: 16kHz PCM] ──► [250ms Chunks]     │
│                                                                 │           │
└─────────────────────────────────────────────────────────────────┼───────────┘
                                                                  │
                                                /ws/audio (Binary PCM Frames)
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BRIDGEEAI SERVER TIER                            │
│                                                                             │
│  [server.js: /ws/audio Handler]                                             │
│         │                                                                   │
│         ▼                                                                   │
│  [Language-Aware Router]                                                    │
│         ├── If Nigerian (yo-NG, ha-NG, ig-NG, en-NG)                        │
│         │         └──► NatlasASRProvider (services/natlas/)                 │
│         │                   │                                               │
│         │                   ├── Emits onPartial() ──► ws.send(SOURCE_PARTIAL)│
│         │                   │                         └─► broadcast(CAPTION_PARTIAL)
│         │                   │                                               │
│         │                   └── Emits onFinal() ──► ws.send(SOURCE_FINAL)   │
│         │                                           └─► dispatchTranslatedFinals()
│         │                                                                   │
│         └── If Non-Nigerian (en-US, etc.)                                   │
│                   └──► Standard STT Engine (services/sttService.js)         │
│                                                                             │
│  [Translation Engine] (services/translationService.js)                      │
│         ├── Dynamic In-Memory Cache                                         │
│         ├── Deterministic Pre-Seeded Dictionaries                          │
│         └── Google Gemini 3.5 Flash Batch Translation with Tone Marks       │
│                                                                             │
│  [Telemetry Engine] (services/natlas/natlasTelemetry.js)                   │
│         └── High-resolution latency profiling & correlation tracking        │
└─────────────────────────────────────────────────────────────────┬───────────┘
                                                                  │
                                           /ws/live (Lightweight JSON Captions)
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUDIENCE & DISPLAY TIER                             │
│                                                                             │
│       ┌─────────────────────────┼─────────────────────────┐                 │
│       ▼                         ▼                         ▼                 │
│  [Mobile Attendee]       [Auditorium Stage]     [Broadcast Lower-Third]     │
│  (/live/:room)           (/venue/:room)         (/overlay/:room)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## **2. AUDIO SPECIFICATIONS & INGESTION CADENCE**

* **Sample Rate**: 16,000 Hz
* **Sample Format**: 16-bit linear PCM little-endian, Mono
* **Cadence**: 250 milliseconds per packet
* **Payload Footprint**: 4,000 samples = 8,000 bytes per frame
* **Telemetry**: Cadence metrics (`AUDIO_TELEMETRY`) generated every 4 chunks (~1 second) reporting throughput in kbps.

---

## **3. N-ATLAS PROVIDER SUBSYSTEM (`services/natlas/`)**

* **`natlasTypes.js`**: Data contracts, request/response schemas, and interface definitions.
* **`natlasErrors.js`**: Standardized domain exceptions (`NatlasAuthenticationError`, `NatlasTimeoutError`, `NatlasUnsupportedLanguageError`).
* **`natlasConfig.js`**: Server-side configuration loader and feature flags (`FEATURE_NATLAS_ASR`, `NATLAS_ENABLED`).
* **`natlasRegistry.js`**: Capability mapping for Yorùbá, Hausa, Igbo, and Nigerian English.
* **`natlasClient.js`**: HTTP REST client adapter with exponential retry backoff.
* **`mockNatlasProvider.js`**: Offline simulation engine with authentic Nigerian domain corpora.
* **`natlasProvider.js`**: Concrete ASR provider with automatic mock fallback.
* **`natlasTelemetry.js`**: Real-time metrics recorder and latency profiler.

---

## **4. MULTILINGUAL TRANSLATION & DIACRITIC RETENTION**

Nigerian languages are tonal and require strict diacritic fidelity to avoid semantic confusion:
* **Yorùbá**: Tonal accents (`á, à, é, è, ẹ́, ẹ̀, í, ì, ó, ò, ọ́, ọ̀, ú, ù`).
* **Hausa**: Boko hooked letters (`ƙ, ɗ, ɓ, 'y`).
* **Igbo**: Sub-dots (`ị, ọ, ụ, ṅ`).

The translation engine enforces orthographic precision via system prompts in `services/translationService.js` and fast-path lookup in `translationDictionary`.
