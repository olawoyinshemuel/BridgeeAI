# **01_NATLAS_INTEGRATION_FOUNDATION.md**
## **BridgeeAI × N-ATLAS: Integration Foundation Specification & Subsystem Architecture**

**Document Version:** 1.0.0  
**Phase:** Phase 1 — Integration Foundation  
**Subject:** N-ATLAS Core Contracts, Configuration, Error Hierarchy & Client Adapter  
**Status:** COMPLETED & VERIFIED  

---

## **1. PHASE OBJECTIVE & SCOPE**

Phase 1 establishes the structural foundation for integrating the official **N-ATLAS** speech recognition service into BridgeeAI.

### **Core Tenets of Phase 1**
1. **Zero Impact on Existing Functionality**: Does not mutate existing session flows, WebSockets, or Gemini translation pipelines.
2. **Strict Schema & Contract Separation**: Isolates all N-ATLAS data types, error taxonomy, and client transport inside the dedicated `services/natlas/` namespace.
3. **African Language Specialization**: Configures explicit capability mappings for Nigeria's core linguistic profiles:
   * **Yorùbá (`yo-NG`)**: Latin script with tonal diacritics (`á, à, é, è, ẹ́, ẹ̀, í, ì, ó, ò, ọ́, ọ̀, ú, ù`).
   * **Hausa (`ha-NG`)**: Latin script with Boko hooked letters (`ƙ, ɗ, ɓ, 'y`).
   * **Asụsụ Igbo (`ig-NG`)**: Latin script with sub-dots (`ị, ọ, ụ, ṅ`).
   * **Nigerian English / Pidgin (`en-NG` / `pcm`)**: Colloquial and standard Nigerian speech patterns.

---

## **2. FOUNDATION ARCHITECTURE & DIRECTORY BLUEPRINT**

```
services/natlas/
├── natlasTypes.js       # TypeScript/JSDoc interface schemas, request/response models
├── natlasErrors.js      # Robust error taxonomy extending NatlasError
├── natlasConfig.js      # Server-side configuration loader, validator, and feature flags
├── natlasRegistry.js    # Nigerian language capabilities, scripts, and sample utterances
└── natlasClient.js      # HTTP REST client adapter with exponential retry and health checks
```

---

## **3. DETAILED COMPONENT SPECIFICATIONS**

### **3.1 Data Types & Contracts (`services/natlas/natlasTypes.js`)**
Defines standard contracts:
* `NatlasTranscriptionRequest`: Slices raw audio buffers (PCM 16-bit 16kHz) or Base64 payloads with explicit language tags and session correlations.
* `NatlasTranscriptionResponse`: Normalized recognition output format with `transcript`, `language`, `confidence`, and `isFinal` flags.
* `NatlasHealthStatus`: Operational status (`ready`, `degraded`, `offline`), latency profiling, and active language arrays.
* `ASR_PROVIDER_INTERFACE`: Standardized interface definition ensuring future swappability.

### **3.2 Error Hierarchy (`services/natlas/natlasErrors.js`)**
Standardizes upstream exceptions into categorized errors:
* `NatlasError`: Base exception with timestamp and error codes.
* `NatlasAuthenticationError`: Shielded API key or authorization errors (HTTP 401/403).
* `NatlasNetworkError`: Socket and connectivity failures.
* `NatlasTimeoutError`: Sockets or HTTP requests exceeding configured thresholds (`NATLAS_TIMEOUT_MS`).
* `NatlasUnsupportedLanguageError`: Fast-fail assertion when an unsupported language code is passed to the engine.
* `NatlasRateLimitError`: Upstream rate limit backoff triggers.

### **3.3 Configuration & Feature Flagging (`services/natlas/natlasConfig.js`)**
Implements environment variable parsing with sensible defaults:
* `FEATURE_NATLAS_ASR` / `NATLAS_ENABLED`: Boolean feature flags.
* `NATLAS_API_BASE_URL`: Base URL (defaulting to `https://api.natlas.ncair.gov.ng/v1`).
* `NATLAS_API_KEY`: API key retained exclusively on the server (never exposed to browser bundles).
* `NATLAS_TIMEOUT_MS`: Request timeout (default 5,000ms).
* `NATLAS_MAX_RETRIES`: Retry ceiling (default 3).
* `NATLAS_MOCK_FALLBACK`: Enables automatic fallback to mock corpora during offline development or API failure.

### **3.4 Nigerian Language Capability Registry (`services/natlas/natlasRegistry.js`)**
Registry of supported languages:
* Validates codes using `isNatlasSupportedLanguage(code)`.
* Exposes metadata including script definitions, capabilities, and phonetically tailored domain sample utterances.

### **3.5 Client Adapter (`services/natlas/natlasClient.js`)**
Low-level communication layer:
* Handles `transcribe()` and `healthCheck()` requests.
* Enforces exponential backoff on transient network faults while terminating immediately on non-retryable errors (such as authentication or unsupported languages).
* Employs standard `AbortController` signals to enforce deterministic timeout guarantees.

---

## **4. VERIFICATION EVIDENCE**

The foundation was verified via `test_natlas_foundation.js`:
* **Config Verification**: Validated parsing, defaults, and security isolation.
* **Language Validation**: Verified all 4 core Nigerian languages (`yo-NG`, `ha-NG`, `ig-NG`, `en-NG`).
* **Error Propagation**: Verified inheritance chains, error codes, and details.
* **Safeguards**: Verified immediate rejection of non-Nigerian languages prior to network dispatch.

---

## **5. READINESS & NEXT PHASE**

Phase 1 foundation is complete, verified, and in place.
Proceed to **Phase 2: Provider Implementation (`02_NATLAS_PROVIDER_IMPLEMENTATION.md`)** upon explicit instruction.
