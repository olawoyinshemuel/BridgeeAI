# BridgeeAI — Sequence Diagrams & Real-Time Data Flow

This document details the system sequence diagrams for BridgeeAI, illustrating the interactions between users, front-end interfaces, core real-time servers, AI engines, and production overlays.

---

## 1. Main End-to-End Real-Time Flow

The following Mermaid sequence diagram maps the complete multi-actor flow across Session Initialization, Host Audio Ingestion via WebSockets, Real-Time AI Translation Processing, Participant Delivery, and Production Browser Overlays.

```mermaid
sequenceDiagram
    autonumber
    actor Host as Host / Presenter
    actor Participant as Participant
    actor Operator as AV Operator
    participant ClientApp as Client App (PWA)
    participant Server as BridgeeAI Server / WS Gateway
    participant STT as STT Engine
    participant Trans as Translation & Glossary Engine
    participant TTS as TTS Engine
    participant Overlay as Production Overlay (OBS/vMix)

    %% 1. Session Setup
    rect rgb(240, 245, 255)
    Note over Host, Server: Phase 1: Session Creation & Configuration
    Host->>ClientApp: Selects Template & Languages, Uploads Slides/Glossary
    ClientApp->>Server: POST /api/v1/sessions (Config + File Attachments)
    Server-->>ClientApp: Returns Session ID, Token, QR Code, Overlay URL
    ClientApp-->>Host: Displays Host Console, QR Code, and Overlay Link
    end

    %% 2. Participant & Production Join
    rect rgb(245, 255, 240)
    Note over Participant, Overlay: Phase 2: Instant Join & Subscription
    Participant->>ClientApp: Scans QR Code / Opens Token URL (`bridgee.ai/join/ROOM-ID`)
    ClientApp->>Server: Connect WebSocket (Subscribe: Target Lang, Mode)
    Server-->>ClientApp: Connection Established (No Account Needed)
    Operator->>Overlay: Opens Overlay URL in OBS (`bridgee.ai/overlay/ROOM-ID`)
    Overlay->>Server: Connect WebSocket (Subscribe: Overlay Stream)
    Server-->>Overlay: Overlay Connection Ready
    end

    %% 3. Audio Ingestion & Real-Time AI Pipeline
    rect rgb(255, 250, 240)
    Note over Host, TTS: Phase 3: Real-Time Audio Chunking & AI Processing
    Host->>ClientApp: Speaks into Microphone
    ClientApp->>Server: WS Binary Stream (250ms Audio Chunks)
    Server->>STT: Stream Audio Buffer
    STT-->>Server: Raw Source Text (Partial / In-Progress)
    STT-->>Server: Finalized Sentence Trigger (VAD / Boundary Pause)
    Server->>Trans: Finalized Source Sentence + Session Context & Glossary
    Trans-->>Server: Target Language Translated Sentence
    
    alt Mode is "Listen" or "Read + Listen" AND TTS Available
        Server->>TTS: Target Translated Text
        TTS-->>Server: Synthesized Compressed Audio Chunks
    end
    end

    %% 4. Stream Distribution
    rect rgb(250, 240, 255)
    Note over Server, Overlay: Phase 4: Multi-Stream Distribution
    Server-->>ClientApp: Push Target JSON Text Payload (<2 KB/s)
    ClientApp-->>Participant: Render Subtitles / Captions (Read Mode)
    
    opt Listen or Read + Listen Mode
        Server-->>ClientApp: Push Target Audio Stream Payload
        ClientApp-->>Participant: Synchronized Audio Playback
    end

    Server-->>Overlay: Push Clean Overlay Subtitle Payload
    Overlay-->>Operator: Render Stage / Broadcast Subtitles
    end