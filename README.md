# BridgeeAI × N-ATLAS

> **Real-Time Multilingual Live Communication Layer with Native Nigerian Language Speech Recognition**  
> *NAIC Track: Voice-First Access | Powered by N-ATLAS / NCAIR & Google Gemini*

---

## Overview

**BridgeeAI** is an ultra-low-latency real-time multilingual communication platform designed to break language barriers in live environments — including conferences, university lectures, places of worship, and civic assemblies.

For the **NAIC Voice-First Access** initiative, BridgeeAI integrates official **N-ATLAS speech recognition** to establish a native Nigerian-language voice bridge:
* A speaker communicates naturally in **Yorùbá**, **Hausa**, **Asụsụ Igbo**, or **Nigerian English / Pidgin**.
* **N-ATLAS ASR** transcribes the spoken speech in real-time using 250ms streaming PCM chunks.
* BridgeeAI's **Gemini Flash translation layer** translates finalized sentences into participants' preferred languages.
* Audience members receive live subtitles on their mobile phones, venue projection screens, or broadcast streams at under **2 KB/s**, ensuring accessibility even on constrained 2G/3G cellular networks.

---

## Architectural Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          1. SPEAKER MICROPHONE                              │
│              Web Audio API: 16,000 Hz, 16-bit Linear PCM                    │
│                        250ms Chunks (8,000 bytes)                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    2. INGESTION WEBSOCKET: /ws/audio                        │
│                 Telemetry: 4 fps Cadence, ~256 kbps Raw                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  3. ASR ENGINE: N-ATLAS NIGERIAN LAYER                      │
│   • Yorùbá (yo-NG)       • Hausa (ha-NG)                                    │
│   • Asụsụ Igbo (ig-NG)   • Nigerian English (en-NG)                         │
│   (Automatic fallback to MockNatlasASRProvider when offline/zero-key)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Emits: SOURCE_PARTIAL & SOURCE_FINAL
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 4. TRANSLATION LAYER: GEMINI 3.5 FLASH                      │
│         Orthographic fidelity (tone marks, sub-dots, domain glossaries)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Multilingual Captions
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   5. SUBSCRIBER WEBSOCKET: /ws/live                         │
│        Target Languages: French, Spanish, English, Arabic, Swahili, etc.    │
│                        Bandwidth: < 1.4 KB/s per client                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│  Mobile Audience  │        │   Stage Display   │        │ Broadcast Overlay │
│   (/live/:room)   │        │  (/venue/:room)   │        │  (/overlay/:room) │
└───────────────────┘        └───────────────────┘        └───────────────────┘
```

---

## Quickstart

### Prerequisites
* **Node.js**: v20+
* **npm**: v10+

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/olawoyinshemuel/BridgeeAI.git
cd BridgeeAI

# Install dependencies
npm install

# Launch the server (runs on port 3000 by default)
npm start
```

### Pre-Configured Demo Rooms
The platform comes pre-seeded with live vertical demonstration rooms:
* 🇳🇬 **`NAIC-VOICE`**: *NAIC Voice-First Access Demonstration* (Yorùbá source language).
* 🌐 **`TECH-2026`**: *Global AI & Ethics Summit 2026* (Conference template, English source).
* 🎓 **`EDU-101`**: *Advanced Machine Learning Bootcamp* (Education template).
* ⛪ **`CHURCH-LIVE`**: *Grace International Sunday Gathering* (Faith template).
* 🎪 **`GLOBAL-EVENT`**: *World Civic Innovation Assembly* (Civic template).

---

## Live URLs

| Interface | URL | Description |
| :--- | :--- | :--- |
| **Landing Page** | [http://localhost:3000/](http://localhost:3000/) | Interactive platform homepage & showcase |
| **Session Creator** | [http://localhost:3000/session/new](http://localhost:3000/session/new) | Create new sessions with Nigerian language presets |
| **Host Audio Console** | [http://localhost:3000/host/console/NAIC-VOICE](http://localhost:3000/host/console/NAIC-VOICE) | 60 FPS waveform, dBFS meter, N-ATLAS telemetry badge |
| **Attendee Live View** | [http://localhost:3000/live/NAIC-VOICE](http://localhost:3000/live/NAIC-VOICE) | Mobile-optimized live translated caption stream |
| **Stage Display** | [http://localhost:3000/venue/NAIC-VOICE](http://localhost:3000/venue/NAIC-VOICE) | High-contrast auditorium stage display |
| **OBS Overlay** | [http://localhost:3000/overlay/NAIC-VOICE](http://localhost:3000/overlay/NAIC-VOICE) | Transparent lower-third subtitle overlay for livestreams |
| **Health Check API** | [http://localhost:3000/api/health](http://localhost:3000/api/health) | Subsystem operational status |
| **Telemetry API** | [http://localhost:3000/api/sessions/NAIC-VOICE/telemetry](http://localhost:3000/api/sessions/NAIC-VOICE/telemetry) | End-to-end latency & accuracy benchmarks |

---

## Running the Automated Test Suites

```bash
# Phase 1: Test N-ATLAS foundation types, configuration & error hierarchy
node test_natlas_foundation.js

# Phase 2: Test N-ATLAS provider, mock streaming & Nigerian speech corpora
node test_natlas_provider.js

# Phase 3: Test 250ms binary PCM WebSocket ingestion & multilingual broadcast
node test_natlas_realtime_ingestion.js

# Phase 4: Test session creation UI options & host console badging
node test_natlas_ui_integration.js

# Phase 5: Test latency benchmarks, correlation IDs & telemetry metrics
node test_natlas_benchmarks.js
```

---

## Implementation Phase Documentation

Detailed architectural specifications are maintained for each phase:
* [00_NATLAS_REPOSITORY_AUDIT.md](00_NATLAS_REPOSITORY_AUDIT.md) — Baseline codebase & topology audit
* [01_NATLAS_INTEGRATION_FOUNDATION.md](01_NATLAS_INTEGRATION_FOUNDATION.md) — Schemas, error taxonomy & client adapter
* [02_NATLAS_PROVIDER_IMPLEMENTATION.md](02_NATLAS_PROVIDER_IMPLEMENTATION.md) — Provider & mock streaming architecture
* [03_NATLAS_REALTIME_INGESTION.md](03_NATLAS_REALTIME_INGESTION.md) — Binary WebSocket ingestion & translation wire-up
* [04_NATLAS_UI_INTEGRATION.md](04_NATLAS_UI_INTEGRATION.md) — Session setup & host console badging
* [05_NATLAS_BENCHMARKS_AND_VALIDATION.md](05_NATLAS_BENCHMARKS_AND_VALIDATION.md) — Latency profiling & NAIC evidence
* [NATLAS_INTEGRATION.md](NATLAS_INTEGRATION.md) — Complete N-ATLAS integration manual

---

## License

ISC License. Built for the National Artificial Intelligence Challenge (NAIC) — Voice-First Access Track.
