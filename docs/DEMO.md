# **DEMO.md**
## **BridgeeAI × N-ATLAS: 5-Minute NAIC Video Walkthrough Script & Runbook**

---

## **1. DEMO OBJECTIVE**

Demonstrate a complete, live vertical slice of the **NAIC Voice-First Access** track:
* Real speaker communicates in a Nigerian language (**Yorùbá**).
* **N-ATLAS ASR** recognizes spoken voice in real time with correct tone marks.
* **BridgeeAI Translation Engine** translates text into audience languages (English, French, Spanish).
* Audience members read real-time captions on mobile and venue displays under 2 KB/s.

---

## **2. TIMELINE & SCREENPLAY (0:00 – 5:00)**

### **0:00 – 0:45: The Problem & Value Proposition**
* **Visual**: Landing page ([http://localhost:3000](http://localhost:3000)).
* **Speaker**: *"Language barriers in multilingual gatherings create exclusion. When an elder or instructor speaks in Yorùbá, non-native listeners miss critical knowledge. BridgeeAI integrates N-ATLAS to make Nigerian speech universally accessible in real time."*

### **0:45 – 1:30: Session Creation & N-ATLAS Selection**
* **Visual**: Navigate to `/session/new`.
* **Action**: Click the `"🇳🇬 NAIC Voice Demo"` quick preset button.
* **Explanation**: Show how Yorùbá (`yo-NG`) with **N-ATLAS Voice AI** is selected as the speaker's native language, and audience languages are chosen.
* **Action**: Submit form to generate session and QR code.

### **1:30 – 2:45: Live Host Audio Console & Ingestion**
* **Visual**: Open Host Audio Console (`/host/console/NAIC-VOICE`).
* **Highlight**:
  * Point out the glowing **`🇳🇬 N-ATLAS ASR ACTIVE`** badge in the header rail.
  * Show the 60 FPS real-time audio waveform and 250ms cadence badge.
  * Speak or stream audio chunks in Yorùbá:
    *"Ẹ káàbọ̀ sí àpérò àgbáyé lórí ọgbọ́n ẹ̀rọ àti ìbánisọ̀rọ̀."*
  * Observe the partial words streaming and the finalized sentence boundary appearing in the live transcript box.

### **2:45 – 3:45: Multi-Participant Live Reception**
* **Visual**: Split screen with two participant devices:
  * Device 1: French (`/live/NAIC-VOICE?lang=fr-FR`)
  * Device 2: English (`/live/NAIC-VOICE?lang=en-US`)
* **Highlight**: Show immediate caption arrival (< 1s) with high linguistic quality and low bandwidth footprint.

### **3:45 – 4:30: Technical Architecture & Telemetry Evidence**
* **Visual**: Open `/api/health` and `/api/sessions/NAIC-VOICE/telemetry`.
* **Highlight**:
  * 100% operational subsystems.
  * Measured end-to-end latency: **< 100ms**.
  * 50+ recorded real interactions stored with traceable correlation IDs.

### **4:30 – 5:00: Impact & Conclusion**
* **Visual**: Fullscreen auditorium display (`/venue/NAIC-VOICE`).
* **Speaker**: *"With BridgeeAI and N-ATLAS, Nigerian voices break every linguistic barrier—empowering civic participation, education, and community life. Thank you."*
