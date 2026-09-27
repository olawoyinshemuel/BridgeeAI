# **04_NATLAS_UI_INTEGRATION.md**
## **BridgeeAI × N-ATLAS: Host Console & Session UI Integration Specification**

**Document Version:** 1.0.0  
**Phase:** Phase 4 — Host Console & Session UI Integration  
**Subject:** Language Selection, NAIC Quick Presets, and Host Telemetry Badges  
**Status:** COMPLETED & VERIFIED  

---

## **1. PHASE OBJECTIVE & SCOPE**

Phase 4 surfaces the N-ATLAS speech recognition provider cleanly within BridgeeAI's user interface:
1. **Source Language Selection (`public/session-new.html`)**:
   * Introduces an `optgroup` specifically branded for Nigerian Languages (`yo-NG`, `ha-NG`, `ig-NG`, `en-NG`) powered by N-ATLAS.
   * Provides a one-click quick preset button `"🇳🇬 NAIC Voice Demo"` to instantly set up a Yorùbá keynote with African target language bundles.
2. **Host Audio Console (`public/host-console.html`, `public/js/host-console.js`)**:
   * Introduces a glowing status badge `#natlasEngineBadge` (`🇳🇬 N-ATLAS ASR ACTIVE`) in the host console header rail.
   * Dynamically activates the badge and updates `#sttStatusBadge` to cyan `#00F5D4` when a Nigerian source language session is loaded.
   * Retains the existing UI styling and layout for standard non-Nigerian sessions.

---

## **2. UI TOPOLOGY & VISUAL STATES**

### **Session Setup (Step 2: `/session/new`)**
```
Speaker's Native Language Dropdown:
┌────────────────────────────────────────────────────────┐
│ 🇳🇬 Nigerian Languages (N-ATLAS ASR)                    │
│   • Yorùbá (N-ATLAS Voice AI)                          │
│   • Hausa (N-ATLAS Voice AI)                           │
│   • Asụsụ Igbo (N-ATLAS Voice AI)                      │
│   • Nigerian English / Pidgin (N-ATLAS)                │
│ Global Languages                                       │
│   • English (US / UK / Global)                         │
│   • Français, Español, Deutsch, Português, etc.        │
└────────────────────────────────────────────────────────┘
```

### **Host Console (Step 4: `/host/console/:roomId`)**
```
Top Header Rail:
[● LIVE DISCONNECTED] [NAIC Keynote Title]  │  [00:02:14]  [● 250ms CHUNKS]  [🇳🇬 N-ATLAS ASR ACTIVE]  [ROOM: NAIC-VOICE]

Left Panel (Live STT Feed):
Live Source Speech Transcript (STT)                  [N-ATLAS ASR Active]  ◄ (Cyan Glow)
[Speak into microphone or stream 250ms chunks...]
```

---

## **3. VERIFICATION EVIDENCE**

Verified via `test_natlas_ui_integration.js`:
* **HTML Form Verification**: Verified `session-new.html` contains the `🇳🇬 Nigerian Languages (N-ATLAS ASR)` option group, correct language values (`yo-NG`, `ha-NG`, `ig-NG`, `en-NG`), and the NAIC demo preset.
* **Console Element Verification**: Verified `host-console.html` contains `#natlasEngineBadge`.
* **Client Logic Verification**: Verified `host-console.js` activates the badge and updates status indicators for Nigerian languages.
* **End-to-End Session Creation Test**: Created a dynamic session via `POST /api/sessions` with `sourceLanguage: "yo-NG"`; verified the session is created successfully and can be queried via `GET /api/sessions/:roomId`.

---

## **4. READINESS & NEXT PHASE**

Phase 4 is complete. Ready to proceed to **Phase 5: Telemetry, Diagnostics & Benchmarks (`05_NATLAS_BENCHMARKS_AND_VALIDATION.md`)** upon explicit instruction.
