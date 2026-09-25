# **BridgeeAI — Data Structure Specification**

This document details every core entity ("thing") the BridgeeAI platform must store and remember, along with the specific facts and fields required for each entity across session lifecycle, participant routing, context processing, and real-time streaming.

### **1\. Host / Presenter**

Stores facts about the session organizer or media operator controlling the broadcast stream.

* **Host ID:** Unique identifier for the host user account.  
* **Full Name:** Name of the host/presenter.  
* **Email Address:** Authentication and contact email.  
* **Account Status:** Active, suspended, or tier status (Free, Pro, Enterprise).  
* **Created At:** Timestamp when the host account was created.

### **2\. Session**

Stores global configuration, metadata, and state for a single live translation event.

* **Session ID:** Unique system identifier (UUID).  
* **Room ID / Token:** Short, URL-safe session token used in join links (bridgee.ai/join/ROOM-ID).  
* **Session Title:** Name of the session (e.g., "AI Engineering Bootcamp \- Module 1").  
* **Experience Template:** Vertical preset applied (Education, Conference, Church, Event).  
* **Source Language:** Primary language spoken by the presenter (e.g., en-US, fr-FR).  
* **Supported Target Languages:** Array of target language codes authorized for translation in this session.  
* **Session Status:** Current state (Configuring, Active, Paused, Ended).  
* **Start Time:** Timestamp when live streaming began.  
* **End Time:** Timestamp when the session was closed.  
* **Host ID:** Reference to the Host creator.  
* **QR Code Graphic URL:** Rendered QR code asset URL.  
* **Production Overlay URL:** Web link for broadcast subtitle integration (bridgee.ai/overlay/ROOM-ID).

### **3\. Context Document / Slide Deck**

Stores background files uploaded by the host to prime language models with session domain context.

* **Document ID:** Unique identifier for the uploaded file.  
* **Session ID:** Reference to the parent session.  
* **File Name:** Original file name (e.g., Module\_1\_Slides.pptx).  
* **File Format:** Document extension (PDF, PPTX, DOCX).  
* **Storage Path:** Secure cloud storage URL or blob path.  
* **Extracted Text Context:** Cleaned text embeddings/corpus used for translation model priming.  
* **Upload Timestamp:** Date and time uploaded.

### **4\. Custom Glossary Term**

Stores specialized terms, jargon, and acronym overrides to enforce precise translations.

* **Glossary Term ID:** Unique identifier for the glossary entry.  
* **Session ID:** Reference to the associated session.  
* **Source Term:** Specific phrase, acronym, or word in source language.  
* **Target Term Overrides:** Mapping of custom translations per target language code.  
* **Domain Category:** Category tag (e.g., Medical, Theological, Engineering, Legal).

### **5\. Participant / Audience Session**

Stores lightweight, anonymous connection settings for individual audience members receiving translation streams.

* **Participant Connection ID:** Temporary socket session ID.  
* **Session ID:** Reference to the active session joined.  
* **Selected Target Language:** Language chosen by the user (e.g., yo-NG, ha-NG, es-ES).  
* **Delivery Mode:** Preferred interaction mode (Read, Listen, Read \+ Listen).  
* **Network Capability Profile:** Real-time bandwidth metric (e.g., 2G/Text-Priority, 3G/4G/Full-Audio).  
* **Client User Agent:** Mobile browser or OS details for responsive UI optimization.  
* **Joined At:** Timestamp when participant joined.

### **6\. Audio Chunk Stream**

Stores transient raw audio buffer metadata transmitted from the host's microphone.

* **Chunk ID:** Sequential identifier for audio packets.  
* **Session ID:** Reference to the active session.  
* **Sequence Number:** Incremental frame counter for audio reassembly.  
* **Audio Format / Encoding:** Sampling rate and codec specifications (e.g., Opus/250ms).  
* **Payload Size:** Packet size in bytes.  
* **Timestamp:** High-resolution server ingestion time.

### **7\. Source Transcript Segment**

Stores raw Speech-to-Text (STT) conversions generated from the presenter's voice.

* **Segment ID:** Unique identifier for the transcript block.  
* **Session ID:** Reference to the active session.  
* **Segment Sequence Number:** Ordering index within the master session transcript.  
* **Source Text:** Recognized words in presenter language.  
* **Is Finalized:** Boolean flag indicating if Voice Activity Detection (VAD) finalized the sentence boundary.  
* **Start Time Code:** Offset timestamp relative to session start.  
* **End Time Code:** Offset timestamp when sentence boundary ended.

### **8\. Translated Payload**

Stores machine-translated text and synthesized audio mappings for downstream audience distribution.

* **Translation ID:** Unique identifier for translated payload.  
* **Segment ID:** Reference to source transcript segment.  
* **Target Language Code:** Language tag of the translation.  
* **Translated Text:** Finalized localized text string.  
* **Audio Asset Path / Buffer:** Stream URL or binary payload for synthesized voice (TTS) if supported.  
* **TTS Capability Status:** Availability flag (Supported, Fallback-Text-Only).  
* **Payload Size (KB):** Data footprint metric to enforce low-bandwidth limits (\< 2 KB/s for text).

### **9\. Production Overlay Config**

Stores visual styling and display preferences for OBS/vMix broadcast caption layers.

* **Overlay Config ID:** Unique identifier for overlay settings.  
* **Session ID:** Reference to the target session.  
* **Background Transparency:** Opacity parameter (e.g., 0% / Fully Transparent).  
* **Layout Style:** Display mode (Single Line, Dual Language, 2-4 Line Subtitle Block).  
* **Font Specs:** Font family, size, line height, and contrast text color.  
* **Screen Margin Safety Zone:** Padding dimensions for broadcast lower-thirds and stage displays.