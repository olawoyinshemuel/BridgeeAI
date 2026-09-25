# BridgeeAI Design Template and Master Build Prompt

> **Document role:** Reference analysis and extended creative/build prompt. The authoritative product design rules are maintained in [DESIGN.md](DESIGN.md).

## Purpose

Use this document as the creative and implementation brief for BridgeeAI's website, live-caption product, attendee mobile experience, venue display, and social media system.

The direction is derived from a visual audit of AlterMe's public website, public App Store presentation, and Instagram grid on September 18, 2026. Reproduce the design logic, mood, hierarchy, pacing, and level of polish, but do not copy AlterMe's name, logo, proprietary icon, photography, screenshots, copy, DNA motif, or other protected brand assets. BridgeeAI must remain an original multilingual communication brand.

## 1. Reference interpretation

### Core design idea

AlterMe presents complex health data as calm, personal guidance. Its system balances:

- editorial warmth with technical credibility;
- cinematic human imagery with precise data overlays;
- large, quiet typography with compact functional cards;
- near-black and warm ivory neutrals with restrained spectral accents;
- generous whitespace with dense information only where the user needs it;
- confident outcomes rather than feature-heavy explanations.

Translate that logic to BridgeeAI:

> Turn complex live speech and translation infrastructure into calm, immediate understanding.

The BridgeeAI experience should feel human first, intelligent second, and technical only when useful. The emotional promise is inclusion and clarity, not “AI magic.”

### Brand translation

| AlterMe design role | BridgeeAI interpretation |
|---|---|
| Personal biology becomes a plan | Live speech becomes shared understanding |
| Health signals and readiness | Audio, connection, latency, and language state |
| Daily recommendation cards | Live caption segments and operator actions |
| DNA and biometric personalization | Language choice and audience accessibility |
| Ring and app ecosystem | Speaker console, audience PWA, venue display, and broadcast overlay |
| “Stop guessing. Start knowing.” | “One speaker. Many languages. Everyone included.” |

## 2. Visual direction

### Art direction

The overall mood is premium editorial technology: calm, cinematic, inclusive, intelligent, and tactile. Avoid generic SaaS gradients, robot imagery, flags as the main language identifier, glowing AI brains, stock-photo handshakes, and crowded dashboard mosaics.

Use:

- real people speaking, listening, learning, worshipping, or participating in live events;
- candid expressions and natural movement rather than staged corporate poses;
- low-contrast cinematic photography with warm skin tones;
- translucent live-caption cards floating over imagery;
- subtle waveform, transcript, language, connection, and latency signals;
- clean product screenshots framed as part of a real event environment;
- softly illuminated accents that suggest many voices converging into clarity.

### Color system

The following palette preserves the reference's tonal architecture while giving BridgeeAI its own meaning.

| Token | Value | Use |
|---|---:|---|
| `ink-950` | `#1A1818` | Primary text, dark controls, app background |
| `ink-900` | `#121A16` | Deep green-black sections and venue mode |
| `slate-850` | `#2A373B` | Primary dark CTA and navigation action |
| `bone-50` | `#FFFCF4` | Warm light text and soft page background |
| `paper-0` | `#FFFFFF` | Cards, panels, inputs, clean canvas |
| `violet-500` | `#7B84DC` | Primary language and active-state accent |
| `violet-100` | `#E8E9FF` | Selected text, chips, soft highlights |
| `aqua-400` | `#7AD9D2` | Live/connected state and data visualization |
| `rose-400` | `#D7798B` | Speaker/waveform accent and warning-adjacent data |
| `gold-400` | `#D5AE68` | Premium emphasis and translated-caption metadata |
| `success-500` | `#59B889` | Healthy connection and completed states |
| `warning-500` | `#D59A4E` | Delayed or degraded states |
| `danger-500` | `#C95F64` | Translation failure or disconnected state |

#### Color rules

- Default marketing pages are 65–75% warm white or bone, 20–30% near-black, and no more than 10% accent color.
- The app is primarily near-black with white cards or dark elevated surfaces.
- Accent colors communicate meaning. Do not scatter rainbow colors decoratively.
- Use `bone-50`, not stark white, over dark photography.
- Use large areas of pure black only for immersive product, proof, and CTA sections.
- Preserve WCAG AA contrast for all essential text and controls.

### Typography

The observed reference pairs a light modern grotesk with an editorial serif:

- primary sans: `fontModernGothic`;
- editorial serif: `fontSabonLTStd`.

For BridgeeAI, use legally licensed equivalents. Preferred implementation:

- **Sans:** Satoshi, Neue Montreal, or Inter as the fallback;
- **Serif:** Sabon if licensed; otherwise Source Serif 4 or Cormorant Garamond;
- **Data/technical:** the sans family with tabular numerals; do not introduce a third display font.

#### Type scale

| Role | Desktop | Mobile | Weight / leading |
|---|---:|---:|---|
| Hero display | `80px` | `44px` | Sans 250–300 / 1.1–1.2 |
| Editorial display | `56px` | `38px` | Serif 400 / 1.2 |
| Section heading | `44px` | `32px` | Serif or light sans / 1.2 |
| Product heading | `32px` | `26px` | Sans 300 / 1.2 |
| Lead copy | `20px` | `18px` | Sans 300 / 1.5 |
| Body | `16px` | `16px` | Sans 300–400 / 1.5 |
| Label | `14px` | `12px` | Sans 400 / 1.0; `0.03em` tracking |
| Caption/meta | `12px` | `12px` | Sans 300–400 / 1.4 |

Typography behavior:

- Use the light sans for bold, direct outcome statements.
- Use the serif for emotional, human, or explanatory moments.
- Use uppercase micro-labels sparingly above major sections.
- Keep headlines short and deliberately line-broken.
- Use italic serif for one meaningful word or phrase, not full paragraphs.
- Avoid heavy bold text except for concise status or accessibility emphasis.

### Spacing and layout

- Desktop content maximum: `1440px`.
- Desktop page gutters: `80px`; tablet: `40px`; mobile: `24px`.
- Primary section spacing: `120–160px` desktop and `72–96px` mobile.
- Use a 12-column desktop grid, 8-column tablet grid, and 4-column mobile grid.
- Favor asymmetric 5/7 or 6/6 editorial compositions.
- Alternate full-bleed cinematic sections with quiet white editorial sections.
- Keep text blocks narrow: `520–640px` for primary reading copy.
- Let one clear message dominate each viewport.

### Shape, border, and elevation

- CTA buttons: full pill, `64px` radius, `48–56px` height.
- Compact chips: full pill, `24–32px` height.
- Live-caption and recommendation cards: `16px` radius.
- Large product/media panels: `32–40px` radius.
- Standard card border: `1px solid rgba(26,24,24,0.20)`.
- Standard card shadow: `0 8px 16px rgba(0,0,0,0.10)`.
- Dark glass card: `rgba(26,24,24,0.56)` with `12–20px` backdrop blur and a faint white border.
- Do not use thick borders, hard drop shadows, or excessive nested cards.

### Iconography

Create an original BridgeeAI symbol based on connection, speech, and bridging. Do not imitate AlterMe's starburst mark.

Use simple monoline icons with:

- rounded terminals;
- 1.5–2px stroke;
- minimal interior detail;
- consistent optical size;
- labels where meaning is not universally obvious.

Core icon set: microphone, waveform, captions, globe/language, audience, display, copy link, QR code, latency, connection, pause, stop, settings, accessibility, translation, and reconnect.

### Motion

- Standard UI transitions: `150–200ms` ease-out.
- Section and card reveals: `240–320ms` with small opacity and vertical movement.
- Caption arrival: gentle fade/slide with no typewriter effect.
- Partial-to-final transcript changes: crossfade or content morph without layout jump.
- Live state: restrained pulse every 2–3 seconds.
- Data visualization: slow, readable progress animation; never decorative turbulence.
- Respect `prefers-reduced-motion` and remove nonessential animation.

## 3. Website template

### Navigation

White, minimal navigation with the BridgeeAI wordmark at left, primary links in the center, and utility actions at right.

Recommended links:

- Why BridgeeAI
- How It Works
- Use Cases
- Pricing
- Sign In
- Help
- Get Started

The primary CTA is a dark slate pill. On mobile, use a compact logo, one CTA, and a clean menu button.

### Homepage sequence

1. **Hero: shared understanding**
   - Full-bleed cinematic event video or image.
   - Dark, soft overlay for legibility.
   - Trust chips such as “No attendee app required” and “Join by QR code.”
   - Headline: “One speaker. Many languages. Everyone included.”
   - Supporting line focused on live translated captions for every attendee.
   - Primary CTA: “Create a live session.”
   - Secondary line for pilot/demo access.
   - Floating translucent caption cards in multiple scripts, tied to one speaker.

2. **Meet BridgeeAI**
   - White editorial section.
   - Uppercase micro-label.
   - Serif statement: “Live speech, understood by everyone.”
   - Two short paragraphs explaining speaker audio, translation, and audience delivery.
   - Product link: “See how it works.”

3. **Three-step system**
   - Dark rounded media panel.
   - Steps: Speak → Translate → Include.
   - Pair each step with an authentic product view rather than an abstract illustration.

4. **Audience experience**
   - Show a phone joining through a QR code, selecting a language, and receiving live captions.
   - Add small language chips and a clear live/reconnecting status.
   - Headline: “Open the link. Choose a language. Follow every word.”

5. **Built for every room**
   - Four image-led cards: Training, Conferences, Congregations, Education.
   - Use real-world scenes and concise outcome labels.

6. **One engine, every screen**
   - Explain attendee mobile web, venue display, and browser broadcast overlay.
   - Present these as one coherent system consuming the same live output.

7. **Evidence and operational trust**
   - Use real measured claims only.
   - Suitable measures: median caption latency, session uptime, attendee join conversion, and human language-quality scores.
   - Label pilot or target data honestly; never present targets as achieved results.

8. **Human proof**
   - Testimonials or pilot stories in quiet editorial cards.
   - Pair a human portrait with a short result and role/organization.

9. **Final CTA**
   - Full-width dark cinematic section.
   - Serif headline: “Make every voice easier to reach.”
   - One primary CTA and one low-pressure demo/pilot action.

10. **Footer**
    - Bone background, dark text, four simple link columns, legal links, social icons, and the BridgeeAI mark.

## 4. Product UI template

### Product personality

The product should feel like a calm live control surface, not an analytics dashboard. The most important state is always obvious: what is being heard, what is being translated, who is connected, and whether the system is healthy.

### Organizer console

#### Session setup

- Quiet white canvas.
- Large serif page title with a short explanation.
- Single-column progressive form inside a `640–720px` panel.
- Inputs for session name, source language, target languages, and output modes.
- Selected languages appear as violet-tinted chips.
- A dark pill CTA starts the session.

#### Live session

- Near-black canvas with bone text.
- Top status bar: BridgeeAI mark, session name, live indicator, elapsed time, settings.
- Main left area: current source transcript and finalized segment history.
- Main right area: target-language health cards and preview.
- Bottom control rail: microphone, pause/resume, copy audience link, QR code, venue display, end session.
- Show latency as understandable status first (“Live,” “Slight delay,” “Reconnecting”), with milliseconds available secondarily.
- Destructive “End session” is visually separate and requires confirmation.

### Audience mobile PWA

- No account wall.
- First screen asks for language using large, searchable rows.
- Main caption view is dark and distraction-free.
- Current caption uses `28–34px` type; recent history uses `18–20px`.
- Speaker/source metadata is quiet and secondary.
- Bottom utility bar: language, text size, contrast, and connection state.
- Preserve reading position while new captions arrive.
- Make partial captions visually distinct but still readable.
- Reconnection must not erase the last valid caption.

### Venue display

- Designed for distance and glare.
- Near-black full-screen background.
- Large bone caption text with a maximum of 2–4 lines.
- Optional speaker name and language label.
- Minimal connection status in a corner.
- Configurable font size, line count, alignment, and high-contrast mode.
- No decorative interface while live.

### Browser broadcast overlay

- Transparent by default.
- Configurable caption background, width, position, alignment, font size, and history length.
- Preview should show title-safe boundaries.
- Provide a copyable browser-source URL and clear connection feedback.

### Data visualization

- Use restrained circular gauges for live health or session readiness.
- Use thin line charts for latency and connection history.
- Use violet, aqua, rose, and gold only as semantic series colors.
- Display a plain-language interpretation beside every chart.
- Do not use 3D charts, dense grids, or color without labels.

## 5. Social media template system

The observed social approach mixes cinematic human content, editorial data statements, product UI demonstrations, and founder/member proof. BridgeeAI should use the same content rhythm with original assets.

### Feed rhythm

Use a repeating nine-post pattern:

1. brand manifesto;
2. human event moment;
3. feature or product release;
4. customer/pilot proof;
5. multilingual insight or statistic;
6. short product demo/reel;
7. founder or mission quote;
8. app/UI walkthrough;
9. atmospheric culture or event footage.

Avoid a rigid checkerboard. Maintain cohesion through color, type, and framing instead.

### Template A: Editorial insight card

- Format: `1080 × 1350px`.
- Near-black background or dark cinematic crop.
- Large bone serif headline, 4–8 words per line.
- One italicized emphasis word.
- Small BridgeeAI mark in a corner.
- Optional minimal waveform or connecting line.

Example: “Understanding should not depend on the language you speak.”

### Template B: Human proof

- Full-frame portrait or event photography.
- Low dark gradient over the lower third.
- Large serif outcome quote.
- Small pill containing name, role, and organization.
- Keep the subject's face unobstructed.

### Template C: Product in context

- Dark UI screenshot on a violet-to-aqua glow or softly colored background.
- One clear feature label.
- One supporting sentence.
- Device frame used only when it adds context.

### Template D: Data story

- Macro image or atmospheric event still.
- One large statistic in serif.
- Short explanation in light sans.
- Source in 12px text.
- Never publish an unsourced or unvalidated claim.

### Template E: Carousel explainer

- Slide 1: strong problem statement.
- Slides 2–5: one idea per slide with a small diagram or UI detail.
- Final slide: one action, such as booking a pilot or viewing a demo.
- Use an arrow pill to signal continuation.

### Template F: Reel cover

- High-contrast human or product still.
- 3–6-word headline in the safe central zone.
- Small category chip: “Live Captions,” “Behind the Session,” “Language Access,” or “Product Update.”
- Consistent BridgeeAI mark placement.

### Social copy voice

- Start with a human tension or observation.
- Explain the practical outcome in plain language.
- Use proof, demonstration, or a specific story.
- End with one direct action.
- Avoid hype words such as revolutionary, game-changing, seamless, magical, and limitless unless independently justified.

## 6. Master prompt for an AI designer/developer

Copy the prompt below into a capable design or coding model. Replace bracketed fields only when the information is known.

```text
ROLE
You are a senior brand designer, product designer, UX writer, art director, and frontend design-systems engineer. Design a polished, production-ready visual system for BridgeeAI, a real-time multilingual communication platform for live audiences.

PRODUCT TRUTH
BridgeeAI lets one speaker talk in a source language while the system captures speech, creates incremental transcripts, translates finalized segments, and distributes live captions to attendees in their selected languages. Attendees join through a QR code or link in a mobile web experience without creating an account. Organizers operate the session. A venue display and browser caption overlay consume the same canonical realtime output.

CORE POSITIONING
“One speaker. Many languages. Everyone included.”

PRIMARY USERS
1. Organizers creating and operating a live session.
2. Audience members choosing a language and reading live captions.
3. Operators displaying captions on projectors, LED walls, livestreams, OBS, or vMix.

INITIAL MARKETS
Professional training, conferences, congregations, and education. The organizing institution is the customer; the audience is the end user.

CREATIVE DIRECTION
Create an original BridgeeAI identity using the design logic of a premium editorial wellness-technology brand: cinematic human photography, large light grotesk headlines, elegant serif statements, warm ivory and near-black foundations, restrained violet/aqua/rose/gold data accents, pill-shaped actions, large rounded media panels, compact insight cards, soft shadows, and calm data-rich product screens.

Do not copy or mention AlterMe in the output. Do not reproduce its logo, icon, photographs, screenshots, copy, DNA imagery, product assets, or proprietary layouts. The result must be recognizably BridgeeAI and grounded in speech, language access, live events, captions, and human connection.

EMOTIONAL GOAL
Make sophisticated realtime translation feel calm, dependable, immediate, and human. The interface must communicate inclusion and control, not AI spectacle.

VISUAL TOKENS
- Ink: #1A1818
- Deep green-black: #121A16
- Slate CTA: #2A373B
- Warm bone: #FFFCF4
- White: #FFFFFF
- Violet: #7B84DC
- Soft violet: #E8E9FF
- Aqua: #7AD9D2
- Rose: #D7798B
- Gold: #D5AE68
- Success: #59B889
- Warning: #D59A4E
- Danger: #C95F64

TYPOGRAPHY
- Sans: Satoshi or Neue Montreal; fall back to Inter.
- Serif: Sabon if licensed; otherwise Source Serif 4 or Cormorant Garamond.
- Hero: 80px desktop / 44px mobile, weight 250–300, line-height 1.1–1.2.
- Editorial display: 56px desktop / 38px mobile, serif regular, line-height 1.2.
- Section heading: 44px desktop / 32px mobile.
- Lead: 20px / 18px, weight 300, line-height 1.5.
- Body: 16px, line-height 1.5.
- Labels: 12–14px with restrained uppercase tracking.
- Use tabular numerals for latency, audience count, and timers.

LAYOUT AND COMPONENT RULES
- Maximum canvas: 1440px.
- Gutters: 80px desktop, 40px tablet, 24px mobile.
- Section spacing: 120–160px desktop, 72–96px mobile.
- Use asymmetric editorial layouts and one dominant idea per viewport.
- CTA buttons are 48–56px high, full pills, with clear focus states.
- Functional cards use 16px radii, 1px quiet borders, and 0 8px 16px rgba(0,0,0,.10) shadows.
- Large media/product panels use 32–40px radii.
- Dark glass caption cards use translucent ink, 12–20px blur, and a faint white border.
- Avoid excessive cards, gradients, glows, and dashboard density.

WEBSITE TO DESIGN
Build the following responsive pages:
1. Homepage.
2. Why BridgeeAI.
3. How It Works.
4. Use Cases overview plus Training, Conferences, Congregations, and Education pages.
5. Pricing.
6. Sign In.
7. Help/FAQ entry page.

The homepage must contain:
- white minimal navigation;
- cinematic hero with floating multilingual caption cards;
- trust chips;
- the headline “One speaker. Many languages. Everyone included.”;
- a Meet BridgeeAI editorial section;
- a Speak → Translate → Include product story;
- audience phone experience;
- use-case cards;
- one-engine/every-screen section;
- honest measured proof;
- human testimonials;
- a dark final CTA;
- a complete footer.

PRODUCT UI TO DESIGN
Create high-fidelity responsive interfaces and key states for:
1. Organizer session setup.
2. Live organizer console.
3. Audience mobile PWA language selection.
4. Audience live captions.
5. Venue display.
6. Browser broadcast overlay configuration and preview.
7. Paused, reconnecting, delayed, translation-failed, and ended states.

The live product must always make these facts obvious:
- whether the session is live;
- what the system currently hears;
- which transcript segments are partial or final;
- which languages are active;
- how many audience clients are connected;
- whether delivery is live, delayed, or reconnecting;
- what the organizer can safely do next.

SOCIAL SYSTEM TO DESIGN
Create editable 1080×1350 post templates and 1080×1920 story/reel templates for:
1. Editorial insight.
2. Human proof/testimonial.
3. Product in context.
4. Data story with source.
5. Educational carousel.
6. Reel cover.
7. Founder/mission quote.
8. Product release.
9. Event recap.

Use a cohesive feed rhythm that alternates dark editorial cards, warm human photography, product UI, and atmospheric event footage. Do not create a repetitive checkerboard.

COPY STYLE
- Calm, direct, specific, and human.
- Lead with the outcome, then explain the mechanism.
- Prefer “Choose your language and follow every word” over technical jargon.
- Use “AI” only where it clarifies the product; do not make it the emotional centerpiece.
- Never invent customer numbers, language coverage, accuracy rates, latency, security certifications, or testimonials.
- Label estimates, pilot results, and targets precisely.

ACCESSIBILITY AND RESPONSIVE REQUIREMENTS
- WCAG 2.2 AA minimum.
- Full keyboard operation and visible focus.
- 44×44px minimum touch targets.
- Never encode language or status by color alone.
- Support reduced motion, zoom to 200%, screen readers, high contrast, and long translated strings.
- Handle right-to-left layouts and mixed scripts.
- Preserve captions during reconnection.
- On mobile, prioritize caption readability and one-handed controls.
- On venue displays, support distance viewing, glare, overscan, and 2–4 line limits.

IMPLEMENTATION QUALITY
- Use semantic components and design tokens rather than one-off styling.
- Create reusable primitives for Button, Chip, CaptionCard, LanguagePicker, StatusBadge, MetricRing, SessionCard, TranscriptSegment, Modal, Toast, Navigation, and Footer.
- Define hover, focus, active, disabled, loading, empty, error, reconnecting, and success states.
- Use original icons and placeholder imagery with detailed art-direction prompts.
- Optimize images, defer noncritical media, and avoid layout shift.
- Keep decorative motion off the critical realtime path.

DELIVERABLES
Return:
1. Brand rationale in 150 words or fewer.
2. Design tokens in a machine-readable format.
3. Typography and responsive scale.
4. Sitemap and primary user flows.
5. Website wireframes and high-fidelity screen specifications.
6. Product UI screen specifications for every required state.
7. Component inventory with variants and behavior.
8. Social media template specifications.
9. Photography, illustration, icon, and motion direction.
10. Accessibility checklist.
11. Implementation notes and acceptance criteria.

QUALITY BAR
The result should look editorial, premium, and calm from a distance, but become precise and operational up close. Every decorative decision must reinforce speech, translation, inclusion, or live-event confidence. Remove anything that looks like generic AI SaaS design.
```

## 7. Acceptance checklist

### Brand

- [ ] The system feels like BridgeeAI, not a renamed health brand.
- [ ] No AlterMe trademarks, logo shapes, copy, photography, screenshots, or DNA motifs appear.
- [ ] Human inclusion is more prominent than AI technology.
- [ ] The serif/sans contrast feels intentional and consistent.

### Website

- [ ] The hero communicates the product within five seconds.
- [ ] One speaker, multiple languages, and audience delivery are visible without scrolling.
- [ ] Each section has one dominant idea.
- [ ] Claims are sourced or explicitly labeled as targets/pilot data.
- [ ] Mobile layouts preserve the editorial hierarchy.

### Product

- [ ] Partial and final captions are distinguishable.
- [ ] Live, paused, delayed, reconnecting, failed, and ended states are designed.
- [ ] Long translations and right-to-left scripts do not break layouts.
- [ ] The audience can join and read captions without an account.
- [ ] Connection state is clear without exposing unnecessary technical detail.
- [ ] Venue and overlay modes prioritize legibility over decoration.

### Social

- [ ] Templates support original photography, product screens, and proof.
- [ ] The feed has a recognizable system without looking mechanically tiled.
- [ ] Text remains readable in feed thumbnails and reel safe zones.
- [ ] Every statistic includes a source.
- [ ] Every post has one message and one action.

## 8. Public references reviewed

- [AlterMe homepage](https://www.alterme.com/)
- [How AlterMe Works](https://www.alterme.com/how-it-works)
- [AlterMe Instagram](https://www.instagram.com/alterme/)
- [AlterMe App Store listing](https://apps.apple.com/us/app/alterme/id1671228187)
- [AlterMe app support collection](https://support.alterme.com/en/collections/15585282-alterme-app)

Observed reference details include the Modern Gothic/Sabon pairing, `#1A1818` ink, `#FFFCF4` bone, dark slate CTAs, restrained violet and aqua data accents, pill buttons, 16px functional cards, 40px media panels, soft `0 8px 16px rgba(0,0,0,.10)` shadows, editorial serif social cards, cinematic lifestyle photography, and a dark app UI organized around circular readiness data, concise recommendations, charts, and bottom navigation.
