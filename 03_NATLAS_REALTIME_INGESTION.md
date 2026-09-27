# **03_NATLAS_REALTIME_INGESTION.md**
## **BridgeeAI × N-ATLAS: Realtime Ingestion Integration Specification**

**Document Version:** 1.0.0  
**Phase:** Phase 3 — Realtime Audio Ingestion Integration  
**Subject:** 250ms Binary Audio Routing, Live Transcription Dispatch & Multilingual Fan-Out  
**Status:** COMPLETED & VERIFIED  

---

## **1. PHASE OBJECTIVE & SCOPE**

Phase 3 wires the N-ATLAS ASR provider directly into BridgeeAI's active, production-grade realtime audio pipeline in `server.js`:
1. **Dynamic Language Routing**: When a host starts streaming 250ms audio chunks over `/ws/audio`, the server checks `sessions[roomId].sourceLanguage`.
2. **N-ATLAS Execution**: If the source language is a supported Nigerian language (`yo-NG`, `ha-NG`, `ig-NG`, `en-NG`), chunks are processed by `getSpeechProvider()`.
3. **Dual Event Dispatch**:
   * `SOURCE_PARTIAL` emitted to the host console; `CAPTION_PARTIAL` broadcast to live participants.
   * `SOURCE_FINAL` emitted to the host console; `dispatchTranslatedFinals()` invoked to translate and broadcast `CAPTION_FINAL` in each attendee's language.
4. **Zero Regressions**: Existing non-Nigerian rooms (`TECH-2026`, `EDU-101`, etc.) continue using their existing speech pipeline without any modification.

---

## **2. DATA FLOW & ARCHITECTURE**

```
HOST AUDIO CONSOLE (host-console.js)
        │
        │ 16kHz PCM (250ms chunk = 8,000 bytes)
        ▼
server.js: /ws/audio Connection Handler
        │
        ├─► Is sourceLanguage in ['yo-NG', 'ha-NG', 'ig-NG', 'en-NG']?
        │
        ├── YES: NatlasASRProvider.processChunk(roomId, buffer, lang)
        │        │
        │        ├── On Partial:
        │        │    ├─► ws.send(SOURCE_PARTIAL) [Host Feedback]
        │        │    └─► broadcastToRoom(CAPTION_PARTIAL) [Audience Live Caption]
        │        │
        │        └── On Final (Sentence Boundary):
        │             ├─► ws.send(SOURCE_FINAL) [Host Feedback]
        │             └─► dispatchTranslatedFinals()
        │                  │
        │                  ▼
        │             Gemini Flash Translation Batch
        │                  │
        │                  ▼
        │             broadcastToRoom(CAPTION_FINAL) [Individualized per Attendee Language]
        │
        └── NO: sttEngine.processAudioChunk() (Existing Fallback Pipeline Unchanged)
```

---

## **3. PRE-SEEDED DEMONSTRATION ROOM**

To enable instant verification and NAIC demonstrations without manual setup, a pre-seeded Nigerian language room is now active:
* **Room ID**: `NAIC-VOICE`
* **Title**: *NAIC Voice-First Access Demonstration*
* **Host**: *Babajide Adeleke*
* **Source Language**: Yorùbá (`yo-NG`)
* **Participant URLs**:
  * Join: `/join/NAIC-VOICE`
  * Live Subtitles: `/live/NAIC-VOICE`
  * Stage Display: `/venue/NAIC-VOICE`
  * Broadcast Overlay: `/overlay/NAIC-VOICE`
  * Host Console: `/host/console/NAIC-VOICE`

---

## **4. VERIFICATION EVIDENCE**

Verified via `test_natlas_realtime_ingestion.js`:
* **Handshake & Init**: Host successfully connects to `/ws/audio` and receives `AUDIO_INIT_ACK`.
* **Audience Subscription**: Attendee joins `/ws/live` requesting French (`fr-FR`) translation for the Yorùbá speaker.
* **Partial Captions**: Streaming 250ms chunks triggers `SOURCE_PARTIAL` and `CAPTION_PARTIAL`.
* **Final Captions & Translation**: Sentence boundary trigger outputs Yorùbá `SOURCE_FINAL` and delivers French `CAPTION_FINAL` to the attendee.
* **Regression Test**: Verified `TECH-2026` room completes normally with zero disruptions.

---

## **5. READINESS & NEXT PHASE**

Phase 3 is complete and verified. Ready to proceed to **Phase 4: Host Console & Session Selection (`04_NATLAS_UI_INTEGRATION.md`)** upon explicit instruction.
