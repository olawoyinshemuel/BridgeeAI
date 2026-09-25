# **BridgeeAI — High-Fidelity Screen Specifications & UI Component Matrix**

This specification bridges the **User Flow Architecture** and the **Editorial Design System System Architecture** (ALTERME\_INSPIRED\_BRIDGEEAI\_DESIGN\_PROMPT\_2.md). It defines the layout structure, UI hierarchy, visual tokens, element inventory, and interaction triggers for every screen required across the BridgeeAI ecosystem.

## **Visual Design Token Reference**

To ensure consistency, all screens adhere to the following design tokens:

* **Primary Backgrounds:** Warm Bone \#FFFCF4 (bone-50 for light marketing/setup), Ink \#1A1818 (ink-950 for live dark app/console), Deep Green-Black \#121A16 (ink-900 for venue mode).  
* **Card Canvas:** Pure White \#FFFFFF (paper-0) on light; Translucent Ink rgba(26,24,24,0.56) with 12–20px backdrop blur on dark.  
* **Brand Accents:** Slate \#2A373B (Primary Dark CTA), Violet \#7B84DC (Selected/Active State), Aqua \#7AD9D2 (Live Connected/Data Viz), Rose \#D7798B (Audio Waveform), Gold \#D5AE68 (Translated Metadata).  
* **Typography:** Modern Grotesk Sans (Satoshi/Inter) for direct actions & data; Editorial Serif (Source Serif 4/Cormorant) for emotional headlines.

## **1\. Homepage (/)**

* **Purpose:** Introduces the platform promise, showcases the multi-screen system, and directs users to session creation or vertical landing pages.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Header Navigation Bar** (Sticky, minimal white background):  
   * **BridgeeAI Wordmark** (Left) $\\rightarrow$ Reloads homepage /.  
   * **Nav Links** (Center: *Why BridgeeAI*, *How It Works*, *Use Cases*, *Pricing*) $\\rightarrow$ Smooth scrolls to sections or routes to respective pages.  
   * **"Sign In" Link** (Right) $\\rightarrow$ Routes to /signin.  
   * **"Create a Session" CTA Button** (Full pill, Slate \#2A373B) $\\rightarrow$ Routes to /create.  
> 2. **Hero Section** (Full-bleed dark/cinematic overlay background):  
   * **Trust Chips** ("No app download required", "Join by QR code") $\\rightarrow$ Static informational badges.  
   * **Serif Headline** ("One speaker. Many languages. Everyone included.") $\\rightarrow$ Static text display.  
   * **Floating Caption Preview Cards** (Translucent cards displaying live multi-script captions) $\\rightarrow$ Animated preview demonstrating real-time translation arrival.  
   * **"Create a Session" Primary Button** (Slate pill) $\\rightarrow$ Routes to Host Session Setup (/create).  
   * **"Watch 1-Min Demo" Secondary Link** $\\rightarrow$ Opens modal with product video.  
> 3. **Vertical Solutions Section** ("Built for every room"):  
   * **4 Solution Cards Grid** (*Education*, *Conferences*, *Church*, *Events* with cinematic imagery & outcome tags) $\\rightarrow$ Clicking a card routes to its dedicated vertical page (/education, /conferences, /church, /events).  
> 4. **Three-Step Product Story Panel** (Dark rounded media panel: *Speak $\\rightarrow$ Translate $\\rightarrow$ Include*) $\\rightarrow$ Interactive tab toggle swapping live product views.  
> 5. **Footer** (Bone \#FFFCF4 background):  
   * **Navigation Columns & Social Links** $\\rightarrow$ Routes to secondary resources, legal terms, and social channels.

## **2\. Vertical Landing Pages (/education, /conferences, /church, /events)**

* **Purpose:** Delivers tailored value propositions and domain-specific terminology for specific market segments.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Header Navigation Bar** (Identical to Homepage header with active vertical highlighted).  
> 2. **Vertical Hero Section**:  
   * **Domain-Specific Serif Headline** (e.g., "Multi-Language Classrooms Without Hardware Barriers" for Education) $\\rightarrow$ Static heading.  
   * **Sub-headline & Industry Context** $\\rightarrow$ Highlights specific workflows (e.g., low-bandwidth text priority, OBS overlays, pre-loaded sermon outlines).  
   * **Contextual Call-to-Action Button** (e.g., "Create a Training Session") $\\rightarrow$ Routes to /create with the corresponding template pre-selected.  
> 3. **Feature Deep-Dive Grid** (3–4 editorial cards with domain screenshots and custom glossary callouts) $\\rightarrow$ Static reading section.  
> 4. **Targeted Pilot Proof / Testimonial Card** (Portrait photography \+ human outcome quote) $\\rightarrow$ Static testimonial card.  
> 5. **Bottom Conversion Panel** (Dark rounded card with primary CTA button) $\\rightarrow$ Routes to /create.

## **3\. Host Session Setup Console (/create)**

* **Purpose:** Allows session organizers to configure languages, select experience templates, and upload contextual documents.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Minimal Setup Header**:  
   * **BridgeeAI Logo** $\\rightarrow$ Routes to /.  
   * **"Exit Setup" Button** $\\rightarrow$ Returns to previous page.  
> 2. **Single-Column Progressive Form Panel** (640px centered white paper card):  
   * **Serif Page Title** ("Configure Your Live Session") $\\rightarrow$ Static text.  
   * **Session Title Input Field** $\\rightarrow$ User enters session name (e.g., "AI Engineering Bootcamp").  
   * **Experience Template Selector Dropdown** (*Education*, *Conference*, *Church*, *Event*) $\\rightarrow$ Updates default presets and glossary suggestions.  
   * **Source Language Picker** (Single-select dropdown, default: English) $\\rightarrow$ Sets audio speech recognition target.  
   * **Target Languages Multi-Select Grid** (Interactive language pills) $\\rightarrow$ Toggling pills highlights them in Violet-100 \#E8E9FF with Violet-500 \#7B84DC borders.  
   * **Context File Drag-and-Drop Zone** (Supports PDF, PPTX, DOCX) $\\rightarrow$ Dropping files initiates text extraction for translation model priming.  
   * **Custom Glossary Terms Input** (Add source term $\\rightarrow$ target override pairs) $\\rightarrow$ Adds custom terms to session rule database.  
> 3. **Microphone & Audio Hardware Test Card**:  
   * **Microphone Device Selector Dropdown** $\\rightarrow$ Switches active audio input source.  
   * **Real-time Audio Waveform Meter** (Rose \#D7798B visual meter) $\\rightarrow$ Reacts dynamically to user voice input to verify audio levels.  
> 4. **"Start Session" Action Button** (Full pill, Slate \#2A373B) $\\rightarrow$ Submits configuration, opens WebSocket pipeline, and routes to /host/console/\[room-id\].

## **4\. Live Host Control Console (/host/console/\[room-id\])**

* **Purpose:** Provides live audio streaming controls, real-time transcript monitoring, and audience connection diagnostics.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Top Status Rail** (Ink \#1A1818 background, high contrast):  
   * **Live Status Indicator** (Aqua \#7AD9D2 pulsing dot \+ "LIVE" label) $\\rightarrow$ Indicates active socket connection.  
   * **Session Title & Room Token Display** $\\rightarrow$ Static text display.  
   * **Elapsed Timer Counter** (Tabular numerals) $\\rightarrow$ Tracks stream duration.  
   * **Active Participant Counter Badge** (Audience icon \+ integer) $\\rightarrow$ Updates dynamically as users join/leave.  
> 2. **Main Console Split Canvas** (Asymmetric 7/5 layout):  
   * **Left Panel (Live Speech Pipeline)**:  
     * **Source Transcript Feed** (Displays real-time partial text in light sans and finalized sentences in crisp bone text) $\\rightarrow$ Auto-scrolls as host speaks.  
   * **Right Panel (Target Stream Diagnostics)**:  
     * **Language Stream Health Cards** (List of active target languages with individual connection badges and latency metrics in milliseconds) $\\rightarrow$ Click card to expand target translation preview.  
     * **QR Code & Join Link Display Card** (High-resolution QR code \+ bridgee.ai/join/ROOM-ID) $\\rightarrow$ Click "Copy Link" triggers toast notification.  
> 3. **Bottom Operational Control Bar**:  
   * **Mute / Unmute Mic Button** (Pill toggle with microphone icon) $\\rightarrow$ Toggles local audio stream pause.  
   * **Pause / Resume Session Button** $\\rightarrow$ Pauses translation pipeline globally.  
   * **"Open Venue Display" Button** $\\rightarrow$ Opens /venue/\[room-id\] in a new browser tab.  
   * **"Copy OBS Overlay Link" Button** $\\rightarrow$ Copies bridgee.ai/overlay/\[room-id\] to clipboard.  
   * **"End Session" Button** (Rose \#D7798B border, visually isolated) $\\rightarrow$ Triggers confirmation modal to terminate session.

## **5\. Audience Mobile PWA — Onboarding & Language Selection (/join/\[room-id\])**

* **Purpose:** Enables instant, zero-friction language and mode selection without account registration.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Mobile Header**:  
   * **BridgeeAI Mark** (Minimalist clean mark).  
   * **Session Name Sub-label** $\\rightarrow$ Static session identification.  
> 2. **Language Picker Section** (Dark ink canvas):  
   * **Serif Prompt** ("Select Your Preferred Language") $\\rightarrow$ Static heading.  
   * **Search Bar Input Field** $\\rightarrow$ Filters language list in real time.  
   * **Language Selection List** (Large touch-friendly rows displaying native script names, e.g., Yorùbá, Français, Spanish, Hausa):  
     * **Capability Badges** (Text / Audio icons per row) $\\rightarrow$ Tapping a row selects target language and highlights it in Violet \#7B84DC.  
> 3. **Delivery Mode Selection Cards** (3 touch cards):  
   * **Read Card** (Captions only, $\<2 \\text{ KB/s}$ optimization badge) $\\rightarrow$ Selects text-only mode.  
   * **Listen Card** (Synthetic voice audio stream) $\\rightarrow$ Selects audio-only mode.  
   * **Read \+ Listen Card** (Synchronized text \+ audio) $\\rightarrow$ Selects dual mode. *(Note: If selected language lacks TTS support, Listen options auto-disable with a toast: "Audio unavailable for this language. Switched to Read Mode.")*  
> 4. **"Enter Session" Primary CTA Button** (Full pill, Violet \#7B84DC) $\\rightarrow$ Establishes WebSocket subscription and routes to /live/\[room-id\].

## **6\. Audience Mobile PWA — Live Captions & Audio (/live/\[room-id\])**

* **Purpose:** Displays low-latency live captions and plays synthesized audio streams on audience mobile devices.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Minimal Mobile Top Bar**:  
   * **Live Stream Indicator Dot** (Aqua \#7AD9D2 when healthy, Warning Gold \#D59A4E when reconnecting) $\\rightarrow$ Displays connection state.  
   * **Current Language Badge** (e.g., "Yorùbá (Read \+ Listen)") $\\rightarrow$ Tapping opens quick language switcher drawer.  
   * **Audio Output Toggle Button** (Speaker icon) $\\rightarrow$ Mutes/unmutes live synthetic voice audio.  
> 2. **Main Caption Reading Canvas** (Distraction-free dark canvas):  
   * **Recent Transcript History** (Faded 18–20px text, subtle opacity) $\\rightarrow$ Scrollable past captions.  
   * **Active Live Caption Block** (Prominent 28–34px bone text \#FFFCF4):  
     * **Partial Segment Text** (Italicized/faded as words arrive) $\\rightarrow$ Morphs smoothly into finalized text.  
> 3. **Bottom Floating Utility Bar**:  
   * **Font Size Adjuster Button** ("A / A+" text size toggle) $\\rightarrow$ Cycles text scale (Normal, Large, Extra Large).  
   * **Contrast / Theme Toggle** $\\rightarrow$ Toggles high-contrast pure black mode.  
   * **Re-sync Connection Button** $\\rightarrow$ Manually re-establishes WebSocket if audio drops.

## **7\. Venue Display View (/venue/\[room-id\])**

* **Purpose:** Renders high-legibility, long-distance captions for sanctuary projectors, hall screens, and LED walls.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Full-Screen Canvas** (Deep Green-Black \#121A16 or pure \#000000).  
> 2. **Main Subtitle Text Container** (Center-aligned or lower-third aligned):  
   * **Clean Captions Block** (Large high-contrast bone text \#FFFCF4, restricted to 2–4 lines maximum) $\\rightarrow$ Renders finalized translated sentences dynamically with line wrapping.  
> 3. **Subtle Footer Status Overlay** (Minimal corner display):  
   * **Session QR Code Thumbnail** (Bottom-right corner) $\\rightarrow$ Allows late arrivals to scan screen.  
   * **Discrete Stream Status Dot** (Bottom-left corner) $\\rightarrow$ Diagnostic indicator for AV technicians.

## **8\. Browser Broadcast Overlay Config & Live Source (/overlay/\[room-id\])**

* **Purpose:** Generates transparent browser-source caption overlays for OBS Studio, vMix, and broadcast software.

### **Elements (Top to Bottom, Left to Right)**

> 1. **Transparent HTML Canvas Background** (Alpha 0.0 for clean keying).  
> 2. **Lower-Third Caption Box**:  
   * **Configurable Background Bar** (Semi-transparent dark box or fully transparent with text outline).  
   * **Real-time Subtitle Text Layer** (Styled according to URL parameters: ?font\_size=32\&lines=2\&align=center) $\\rightarrow$ Updates instantly via WebSocket as host speaks.