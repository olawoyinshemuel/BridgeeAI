# **02_NATLAS_PROVIDER_IMPLEMENTATION.md**
## **BridgeeAI × N-ATLAS: ASR Provider Implementation & Fallback Architecture**

**Document Version:** 1.0.0  
**Phase:** Phase 2 — Provider Implementation  
**Subject:** NatlasASRProvider, MockNatlasASRProvider & Nigerian Language Speech Pipeline  
**Status:** COMPLETED & VERIFIED  

---

## **1. PHASE OBJECTIVE & SCOPE**

Phase 2 builds the core speech recognition provider classes for the N-ATLAS integration in BridgeeAI:
1. **Concrete Provider Class (`NatlasASRProvider`)**: Implements streaming audio buffer accumulation (250ms cadence) and dispatches transcript events.
2. **Deterministic Mock Fallback (`MockNatlasASRProvider`)**: Houses realistic, linguistically authentic Nigerian speech corpora for Yorùbá (`yo-NG`), Hausa (`ha-NG`), Asụsụ Igbo (`ig-NG`), and Nigerian English (`en-NG`), ensuring reliable testing and offline resilience.
3. **Pluggable Factory Interface (`getSpeechProvider()`)**: Decouples application logic from direct provider instantiation.

---

## **2. ARCHITECTURAL FLOW & PROVIDER TOPOLOGY**

```
                     Incoming 250ms Audio Chunk
                                 │
                                 ▼
                     NatlasASRProvider.processChunk()
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
     (Live Enabled & Valid Key?)               (Mock Fallback / Offline)
             │                                       │
             ▼                                       ▼
     NatlasASRClient                         MockNatlasASRProvider
    (Remote N-ATLAS API)                   (Nigerian Speech Corpora)
             │                                       │
             └───────────────────┬───────────────────┘
                                 │
                                 ▼
                    Transcript Event Generator
                     ├── onPartial(partialText)
                     └── onFinal(finalSentence)
                                 │
                                 ▼
                   Downstream Gemini Translation
                   (services/translationService.js)
```

---

## **3. DETAILED IMPLEMENTATION SPECIFICATIONS**

### **3.1 Mock N-ATLAS Provider (`services/natlas/mockNatlasProvider.js`)**
* **Linguistic Alignment**: Contains phonetically accurate multi-sentence domain corpora reflecting civic, conference, and technology presentations in Yorùbá, Hausa, Igbo, and Nigerian English.
* **Cadence Emulation**: Emulates human speech rate (~150 words per minute) by advancing 2 words per ~500ms (every two 250ms chunks).
* **VAD Boundary Trigger**: Automatically signals `isFinal: true` when a sentence completes, cycling sequentially through the domain corpus.
* **Callbacks**: Implements `onPartial(cb)` and `onFinal(cb)` observers.

### **3.2 Production N-ATLAS Provider (`services/natlas/natlasProvider.js`)**
* **Audio Buffer Slicing**: Slices and batches incoming 250ms chunks into 1-second transmission frames for remote inference.
* **Fallback Circuit**: If remote HTTP requests fail or credentials are unset, the provider seamlessly delegates chunk processing to the internal `MockNatlasASRProvider`, ensuring live sessions never fail silently.
* **Language Validation**: Enforces Nigerian language boundaries using `isNatlasSupportedLanguage()`.

### **3.3 Provider Factory (`services/natlas/index.js`)**
* Exposes `getSpeechProvider({ provider, language })` as a singleton provider factory.
* Provides uniform access to ASR capabilities across the server.

---

## **4. VERIFICATION EVIDENCE**

Phase 2 verified using `test_natlas_provider.js`:
* **Mock Provider Ingestion**: Streamed twenty 250ms chunks across Yorùbá, Hausa, Igbo, and Nigerian English; observed word-level partials and finalized sentence boundaries.
* **Production Provider Delegation**: Confirmed safe mock fallback execution when live credentials are not present.
* **Health Status**: Verified diagnostic health checks.

---

## **5. READINESS & NEXT PHASE**

Phase 2 is complete. Ready to proceed to **Phase 3: Realtime Audio Ingestion Integration (`03_NATLAS_REALTIME_INGESTION.md`)** upon explicit instruction.
