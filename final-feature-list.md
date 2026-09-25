# **BridgeeAI — Final Feature List & MoSCoW Prioritization**

This document consolidates every feature described across the **BridgeeAI Master PRD & System Architecture**, the **Design System Specification** (ALTERME\_INSPIRED\_BRIDGEEAI\_DESIGN\_PROMPT\_2.md), and the **Screen Specifications & UI Component Matrix**. All features have been evaluated and prioritized using the MoSCoW framework for a 5-day build.

## **MoSCoW Feature Matrix**

| Feature | Description | MoSCoW Category | Reason |
| :---- | :---- | :---- | :---- |
| **Instant QR / Token Join (No App)** | Allows participants to scan a QR code or click a short URL (bridgee.ai/join/ROOM-ID) to join a live session instantly on mobile web without account registration or app installation. | **Must have** | Core value proposition; eliminates onboarding friction for audience members. |
| **WebSocket Audio Ingestion** | Streams raw 250ms audio chunks from the host's microphone via WebSockets to the server processing engine. | **Must have** | Core engine requirement; live speech recognition cannot function without real-time audio streaming. |
| **Real-Time Speech-to-Text & Translation** | Converts host microphone audio into source text and translates finalized sentence segments into target languages. | **Must have** | Primary functional purpose of the entire product. |
| **Independent Language & Mode Selection** | Audience PWA allowing individual participants to independently choose their target language and delivery mode (Read, Listen, Read \+ Listen). | **Must have** | Core participant feature; delivers personalized multilingual access. |
| **Host Session Console & Audio Control** | Real-time console providing host audio level meters, live participant count, stream status, pause/resume, and session termination controls. | **Must have** | Essential for presenters to initiate, manage, monitor, and safely end live sessions. |
| **Silent Text-Only Fallback** | Automated logic that routes participants to Read Mode (text captions) with a clear notification when their selected language lacks synthetic voice (TTS) support. | **Must have** | Essential error handler; prevents session crash or silent audio failure when TTS is missing. |
| **Homepage & Vertical Landing Pages** | Marketing surface featuring shared homepage (/) and specialized vertical entry points (/education, /conferences, /church, /events). | **Should have** | Important for user acquisition and template routing, but core translation engine works without marketing pages. |
| **Production OBS / vMix Browser Overlays** | Transparent browser-source overlay URLs (bridgee.ai/overlay/ROOM-ID) displaying real-time stage/broadcast captions. | **Should have** | High value for AV operators and stage screens, but audience mobile streaming functions independently. |
| **Custom Glossary & Slide Context Upload** | Allows hosts to upload slide decks (PDF/PPTX) and custom domain terms/acronyms to override default translation model mappings. | **Should have** | Significantly improves translation accuracy in technical domains, but standard translation operates without it. |
| **Low-Bandwidth Adaptive Streaming** | Automatically prioritizes low-footprint text payloads ($\<2 \\text{ KB/s}$) over heavy audio streams on degraded cellular networks (2G/3G). | **Should have** | Critical for network resilience in low-connectivity environments, but standard WebSocket delivery functions on reliable networks. |
| **Venue Display View** | Dedicated full-screen high-legibility display (/venue/ROOM-ID) formatted for venue projectors and LED walls. | **Should have** | Useful for physical sanctuary or hall displays, but mobile audience access remains functional. |
| **Experience Templates Preset** | Pre-configured UI layouts and domain terminology presets for Education, Conferences, Church, and Events. | **Could have** | Improves initial host setup workflow, but manual configuration achieves the same setup. |
| **Post-Session Transcript Export** | Allows host to download raw source or localized target transcripts after session closure. | **Could have** | Convenient post-event feature, but does not impact live session translation delivery. |
| **Social Media Template System** | Editable post templates and story/reel layouts for marketing campaigns. | **Could have** | Useful for brand growth, but entirely secondary to software application build. |
| **Native Mobile Apps (iOS / Android)** | Downloadable native application packages required via Apple App Store or Google Play Store. | **Won't have** | Explicitly out of scope; zero-friction web PWA entry is the core architecture decision. |
| **Automated Speaker Diarization** | Automatic identification and labeling of multiple distinct speakers from a single combined audio channel. | **Won't have** | Explicitly out of scope for current build; adds unnecessary complexity to single-speaker presentations. |
| **Peer-to-Peer Video Conferencing** | Built-in video calling, screen sharing, or WebRTC video rooms. | **Won't have** | Explicitly out of scope; platform focuses strictly on speech-to-text and audio translation layers. |
| **User Accounts for Participants** | Login, password creation, or social sign-in requirement for session audience members. | **Won't have** | Explicitly out of scope; breaks instant QR/link onboarding guarantee. |

## **5-Day Build Constraints & Trade-Off Analysis**

To guarantee a successful, high-quality team delivery within a strict 5-day sprint, the **Must Have** category is strictly capped at **6 core features**:

> 1. **Instant QR / Token Join (No App)**

> 2. **WebSocket Audio Ingestion**

> 3. **Real-Time Speech-to-Text & Translation**

> 4. **Independent Language & Mode Selection**

> 5. **Host Session Console & Audio Control**

> 6. **Silent Text-Only Fallback**

### **Recommended Cuts if Sprint Capacity is Reduced**

If team velocity or technical risks require cutting the **Must Have** scope further (reducing to 4-5 features), apply the following cuts in order:

* **First Cut: Silent Text-Only Fallback**

  * **Why:** In a restricted MVP or demonstration build, hard-coding a core set of fully supported languages (e.g., English, French, Spanish) guarantees TTS availability across all options. This allows the team to bypass building dynamic capability checks and fallback toast notifications during day 1–3 development.  
* **Second Cut: Independent Language & Mode Selection (Limit to Read Mode Text-Only)**

  * **Why:** If TTS integration (audio synthesis streaming) introduces latency or audio buffer synchronization bottlenecks, stripping the audience PWA down to pure real-time text captions ($\<2 \\text{ KB/s}$) preserves the primary multilingual communication value while drastically reducing backend complexity.