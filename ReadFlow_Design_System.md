# ReadFlow — Design System & Visual Specification

*UI/UX Design Document • March 2026*

> Every color, font, spacing value, component, and interaction pattern.

---

## 1. Design Philosophy

### 1.1 The Vibe

ReadFlow's design should feel like a reading nook in a modern bookstore: warm, calm, focused, and intellectually stimulating.

> **Emotional targets:** focused but not sterile, warm but not playful, intelligent but not academic, personal but not precious.

**Design principles:**

- **Calm confidence.** No gamification (no XP, no leaderboards, no badges). Streaks are quiet facts, not celebrations. The app doesn't need to convince you to use it.
- **Reading-first hierarchy.** The reader is the heart. Every other page exists to get you into the reader or to deepen what you got out of it. The reader feels like a physical book.
- **Warmth through materials.** Warm neutrals instead of pure whites. Subtle texture instead of flat surfaces. Rounded but not bubbly. Paper, ink, and natural materials.
- **Progressive disclosure.** Show only what's needed. Reflection prompts appear after reading, not before. Theme threads surface when strong enough. The app teaches through use.
- **Respectful personalization.** AI features are always attributed ("Based on Chapter 4…"). Privacy controls are visible, never buried.

### 1.2 Anti-Patterns

- Not a Notion/Obsidian knowledge management tool
- Not a gamified reading tracker
- Not a generic AI chat interface
- Not a speed-reading flex (RSVP is secondary, never the hero)
- Not a dark-mode-first coding tool aesthetic

---

## 2. Color System

### 2.1 Core Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| --bg-primary | #FAFAF9 (warm white) | #1C1917 (warm black) | Page background |
| --bg-secondary | #F5F5F4 (sand) | #292524 (charcoal) | Cards, panels, surfaces |
| --bg-tertiary | #E7E5E4 (stone) | #44403C (dark stone) | Hover states, dividers |
| --bg-reader | #FAF8F5 (cream) | #1A1814 (parchment black) | Reader page only |
| --text-primary | #1C1917 | #FAFAF9 | Headings, body text |
| --text-secondary | #78716C | #A8A29E | Subtext, metadata |
| --text-tertiary | #A8A29E | #78716C | Placeholders, disabled |
| --border-default | #E7E5E4 | #44403C | Card borders, dividers |
| --border-subtle | #F5F5F4 | #292524 | Very subtle separators |

### 2.2 Accent & Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| --accent | #C2410C (burnt sienna) | Primary CTA buttons, word highlight, active nav |
| --accent-hover | #9A3412 | Hover on accent buttons |
| --accent-subtle | #FFF7ED (peach tint) | Accent backgrounds, selected states |
| --accent-text | #7C2D12 | Text on accent-subtle backgrounds |
| --success | #15803D (forest green) | Completed chapters, 'Got it' |
| --warning | #B45309 (amber) | Processing states, 'Kinda' |
| --error | #DC2626 (red) | Errors, 'Lost', failed uploads |
| --info | #1D4ED8 (blue) | Links, informational badges |

### 2.3 Color Rules

- **Accent appears in exactly three places:** primary CTA buttons, word highlight in reader, active tab/nav indicators. Nowhere else.
- **Semantic colors are functional only.** Green = done, amber = in progress, red = problem. Never decorative.
- **Dark mode uses warm blacks** (#1C1917, #292524), not pure black. Text is warm white (#FAFAF9), not pure white.
- **The reader has its own background** (--bg-reader) — slightly warmer, simulating cream paper.

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Fallback | Why |
|------|------|----------|-----|
| Display / headings | Instrument Serif (Google Fonts) | Georgia, serif | Literary, warm, editorial feel. Page titles, book titles, chapter headings. |
| Body / UI | DM Sans (Google Fonts) | -apple-system, sans-serif | Clean, geometric, slightly warm. All body text, buttons, labels. |
| Reader body text | Literata (Google Fonts) | Georgia, serif | Designed for digital reading. 18–22px for long-form text. Reader only. |
| Monospace | JetBrains Mono | Menlo, monospace | WPM displays, timestamps. Very limited use. |

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| --text-xs | 12px | 400 | 1.5 | Badges, captions, timestamps |
| --text-sm | 14px | 400 | 1.5 | Metadata, secondary labels |
| --text-base | 16px | 400 | 1.6 | Body text, form labels, nav |
| --text-lg | 18px | 400 | 1.6 | Reader body (minimum) |
| --text-xl | 20px | 500 | 1.5 | Section headings, card titles |
| --text-2xl | 24px | 500 | 1.3 | Page sub-headings |
| --text-3xl | 32px | 600 | 1.2 | Page titles (Instrument Serif) |
| --text-4xl | 40px | 600 | 1.1 | Hero heading (Instrument Serif) |

### 3.3 Typography Rules

- Headings use Instrument Serif. Always sentence case, never ALL CAPS.
- UI text uses DM Sans. Serif = content, sans = interface.
- Reader text uses Literata at 18–22px, line-height 1.7, max-width 680px (~65–75 chars/line).
- Never bold entire sentences.
- Numbers in UI use `font-variant-numeric: tabular-nums`.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Inline icon gaps, tight padding |
| --space-2 | 8px | Badge/text gaps, compact lists |
| --space-3 | 12px | Card padding (sides), grid gaps |
| --space-4 | 16px | Card padding (top/bottom), form field gaps |
| --space-5 | 20px | Between sections within a card |
| --space-6 | 24px | Between cards, major section padding |
| --space-8 | 32px | Between page sections |
| --space-10 | 40px | Page top/bottom padding |
| --space-12 | 48px | Major section separators |
| --space-16 | 64px | Page-level whitespace, hero sections |

### 4.2 Layout Grid

**Desktop (1024px+):** Sidebar 240px (collapses to 64px). Main content max-width 960px centered. Reader: full viewport, no sidebar, content 680px.

**Tablet (768–1023px):** Sidebar collapsed to 64px, expands as overlay. Full-width content.

**Mobile (<768px):** Bottom tab bar (56px, 4 items). Full-width content. Reader: full screen, bottom controls, top bar auto-hides.

### 4.3 Breakpoints

| Name | Value | Layout Change |
|------|-------|---------------|
| sm | 640px | Stack cards single column |
| md | 768px | Bottom nav, 2-column card grid |
| lg | 1024px | Show sidebar, 3-column card grid |
| xl | 1280px | Wider content area |

---

## 5. Component Library

### 5.1 Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | --accent | white | none | Main CTA: 'Start reading', 'Save', 'Upload' |
| Secondary | transparent | --text-primary | 1px --border-default | 'Skip', 'Cancel', 'Edit' |
| Ghost | transparent | --text-secondary | none | 'Back', 'Dismiss'. Hover: --bg-tertiary |
| Danger | #DC2626 | white | none | 'Delete book', 'Delete account' |
| Icon | transparent | --text-secondary | none | Play, pause, settings |

**Specs:** 40px height (36px compact, 48px large). 8px radius. DM Sans 14px / 500. Hover: darken 10%, 150ms. Active: scale(0.98), 50ms. Disabled: opacity 0.5. Focus: 2px --accent ring, 2px offset.

### 5.2 Cards

| Variant | Background | Border | Radius | Shadow | Usage |
|---------|-----------|--------|--------|--------|-------|
| Default | --bg-secondary | 1px --border-default | 12px | none | Book cards, reflection cards |
| Elevated | --bg-primary | 1px --border-default | 12px | 0 1px 3px rgba(0,0,0,0.04) | Popovers, paragraph view |
| Interactive | --bg-secondary | 1px --border-default | 12px | none | Hover: --accent-subtle border, translateY(-1px) |
| Subtle | transparent | none | 0 | none | List items, chapter rows |

**Specs:** 16px 20px padding. 16px gap (grid), 8px (list). Book cover aspect ratio 2:3, max 160px width.

### 5.3 Form Elements

**Text Input:** 40px height, --bg-primary, 1px --border-default, 8px radius. Focus: 1px --accent. 16px font.

**Textarea:** Min 120px height, auto-grow. Same border/focus.

**Range Slider:** 4px track (--bg-tertiary), filled --accent. 20px thumb circle, 2px --accent border. Value label above thumb on drag.

**Toggle Switch:** 44px × 24px track, 20px thumb. Off: --bg-tertiary. On: --accent. 200ms.

**Emoji/Word Selector:** Row of pills (--bg-secondary, 1px border). Selected: --accent-subtle bg, --accent-text. 36px height.

### 5.4 Navigation

**Sidebar (desktop):** 240px expanded / 64px collapsed. --bg-secondary. 1px right border. Nav items: 40px height, 8px radius. Active: --accent-subtle bg, 2px left --accent border. Icons 20px, text DM Sans 14px / 500.

**Bottom Tab Bar (mobile):** 56px + safe area. --bg-primary with backdrop-filter blur(12px) 80% opacity. 1px top border. 4 items: Library, Journal, Insights, Settings. Active: --accent icon. Icons 24px, labels 10px.

### 5.5 Reader-Specific Components

**Word Highlight (narration):** --accent at 20% opacity background. 3px radius. 1px 2px padding. Instant transition (no animation). Previous 2 words at 10% opacity.

**ORP Highlight (RSVP):** Fixation character = --accent. Rest = --text-primary. 32px center screen. Full --bg-reader background.

**Scrub Bar:** 48px area. 32px waveform (--bg-tertiary bars, played = --accent 60%). 2px position indicator (--accent). Time labels: --text-xs, --text-secondary.

**Checkpoint Card:** Elevated card, max 320px centered, slides up from bottom. "Got it" (--success) / "Kinda" (--warning) / "Lost" (--error). Auto-dismiss 5s. Enter: 200ms slide-up ease-out. Exit: 300ms fade-down ease-in.

**Confusion Flag:** 40px circle, --bg-secondary, 1px border, bottom-right. Tap: pulse scale 1→1.2→1 (200ms), --accent border flash. Then checkmark for 1s.

**Paragraph View:** Backdrop rgba(0,0,0,0.4). Elevated card, max 600px, centered. Literata 18px, line-height 1.7. Trigger word highlighted. Dismiss: tap outside or Escape. 200ms fade-in, 150ms fade-out.

### 5.6 Reflection Components

**Prompt Card:** --bg-secondary. Border-left 3px --accent. Radius 0 8px 8px 0. 16px 20px padding. Prompt: DM Sans 16px / 500. Attribution: 12px --text-tertiary italic.

**Prompt Depth Tag:** Top-right pill. Level 1: no tag. Level 2: "personal" (--bg-tertiary, --text-secondary, 11px). Level 3: "go deeper" (--accent-subtle, --accent-text, 11px / 500).

**Connection Chip:** Pill (20px radius). --bg-tertiary. DM Sans 13px --text-secondary. Link icon (16px) before text. Tap expands explanation.

### 5.7 Journal Components

**Daily Entry Card:** Full-width, no border. Sections separated by --border-subtle. Date: Instrument Serif 24px. Labels: DM Sans 12px uppercase --text-tertiary, 0.5px letter-spacing. Freeform section has the most breathing room.

**AI Reflection Card:** --bg-secondary, 1px --border-default. 300ms fade-in. Border-left 3px, color by pattern type:
- Identity belief: --accent (burnt sienna)
- Behavioral loop: --info (blue)
- Emotional trigger: --warning (amber)
- Relationship pattern: #7C3AED (muted purple)

Content: DM Sans 15px, line-height 1.6. Closing question: italic, --text-secondary. No "AI" label. Max 4 sentences. Tone follows coach_tone setting.

**Micro-Experiment Card:** --accent-subtle (#FFF7ED). 12px radius. 16px 20px padding. Header: 'Try this today' — DM Sans 13px uppercase --accent-text. Experiment: DM Sans 16px. Buttons: "I'll try it" (primary), "Modify" (secondary), "Skip" (ghost). Appears 500ms after AI reflection.

**Theme Thread Badge:** --accent-subtle bg. --accent-text DM Sans 13px / 500. 20px radius pill. Thread icon 14px before text.

**Streak Counter:** Quiet number. "7-day streak" DM Sans 14px --text-secondary. No fire emoji. No celebration. No guilt.

### 5.8 Progress Indicators

**Book Progress Bar:** 4px height, 2px radius. Track: --bg-tertiary. Fill: --accent.

**Processing Status:** Uploading = indeterminate pulse. Extracting = determinate + label. Distilling = X/Y chapters + label. Ready = green check. Error = red X + retry.

---

## 6. Animation & Motion

### 6.1 Principles

- Motion serves function. No decorative animations.
- Fast: 150–200ms. Nothing > 400ms except page transitions.
- Ease-out entrances, ease-in exits.
- Always respect `prefers-reduced-motion`.

### 6.2 Specific Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Crossfade + 8px slide | 300ms | ease-out |
| Card hover | translateY(-1px) + border change | 150ms | ease |
| Button press | scale(0.98) | 50ms | ease-in |
| Modal enter | Backdrop fade + card scale(0.97→1) | 200ms | ease-out |
| Modal exit | Reverse | 150ms | ease-in |
| Checkpoint enter | translateY(100%→0) | 200ms | ease-out |
| Checkpoint exit | Fade + translateY(20px) | 300ms | ease-in |
| Confusion flag tap | scale(1→1.2→1) | 200ms | ease-out |
| Reflection card reveal | Stagger 100ms, fadeIn + translateY(12px) | 250ms | ease-out |
| Skeleton shimmer | Opacity 0.5→1→0.5 | 1.5s loop | ease-in-out |
| Word highlight | Instant | 0ms | none |
| AI reflection appear | Fade in | 300ms | ease-out |
| Experiment card appear | Fade in (500ms delay after reflection) | 250ms | ease-out |

---

## 7. Iconography

**Set:** Lucide React. Stroke-based, 1.5px. 20px default, 16px compact, 24px emphasis. Inherits parent text color. Never filled.

| Element | Icon | Size |
|---------|------|------|
| Library nav | book-open | 20px |
| Journal nav | pen-line | 20px |
| Insights nav | bar-chart-3 | 20px |
| Settings nav | settings | 20px |
| Upload | upload | 20px |
| Play / Pause | play / pause | 24px |
| Sentence replay | rotate-ccw | 20px |
| Confusion flag | message-circle-question | 20px |
| Speed | gauge | 16px |
| Mode toggle | headphones / eye | 20px |
| Reflection | sparkles | 16px |
| Theme thread | link-2 | 16px |
| Back / Close | arrow-left / x | 20px |
| Delete | trash-2 | 20px |
| Complete | check | 16px |
| Error | alert-circle | 16px |

---

## 8. Accessibility

**Color Contrast:** All text/background meets WCAG AA. Never use color alone to convey information.

**Keyboard:** Every element focusable. Focus ring: 2px --accent, 2px offset. Reader: space=play/pause, left=back 5s, right=forward 5s, Escape=close overlay.

**Screen Reader:** Images have alt text. Word highlighting announced via aria-live on sentence completion. Checkpoints use role='alertdialog'. Progress bars use aria-valuenow/min/max.

**Text Sizing:** Reader: 16–28px user-adjustable. All UI in rem. Touch targets: minimum 44×44px.

---

## 9. Responsive Behavior

| Page | Desktop | Mobile |
|------|---------|--------|
| Library | 3-col grid, sidebar | 2-col grid, bottom tabs. Upload as full-screen modal. |
| Book Detail | Cover + info side-by-side | Cover on top, info below |
| Reader (narration) | 680px text column, controls bottom | Full-width, larger touch targets |
| Reader (RSVP) | Centered word | Same, fills more screen |
| Reflection | Single col, 640px max | Full-width, cards stack |
| Journal | Single col, 560px max | Same, emoji wraps 2 rows |
| Insights | 4-col stat grid, charts side-by-side | 2-col grid, charts stack |
| Settings | Two-column | Single col, expand/collapse |
| Onboarding | Centered 480px card | Full-width, dot indicators |

---

## 10. Dark Mode

Applied via `class="dark"` on html. Respects system preference, overridable in settings.

- All colors via CSS custom properties in :root and .dark
- Tailwind `dark:` variant prefix
- Images and covers: no filter (natural in both modes)
- Reader has additional 'sepia' mode (warm tint). Three reader themes: light, dark, sepia.
- Theme switch: 200ms crossfade. No flash on load (blocking script in `<head>`).

---

## 11. Error & Empty States

### Empty States

| Page | Design | Tone |
|------|--------|------|
| Library (no books) | Bookshelf illustration + 'Upload your first book' + button | Warm, inviting |
| Reflections (none) | 'No reflections yet. Finish a chapter to unlock.' | Encouraging |
| Journal (new day) | Prompts pre-loaded. No empty state. | Proactive |
| Insights (no data) | 'Start reading to see insights.' + empty chart illustration | Patient |
| Theme threads (none) | 'Themes will emerge as you read and journal.' | Quiet |

### Error States

| Error | Design | Recovery |
|-------|--------|----------|
| Upload failed | Red border, error icon + message | Retry + file picker |
| TTS failed | Inline: 'Narration unavailable' | Retry + RSVP fallback |
| Network error | Toast: 'Connection lost' | Auto-retry with backoff |
| AI generation error | Muted card: 'Prompts couldn't load. Write freely.' | Retry link |
| Bad PDF | Warning card: 'Text may be garbled. Try EPUB.' | Edit chapters link |

---

## 12. Loading States

**Skeleton screens** for every data-loading page. Shapes match content layout. --bg-tertiary, shimmer pulse 1.5s.

- Library: grid of card skeletons
- Book detail: cover rect + 3 line skeletons + chapter list skeletons
- Reader: 6–8 paragraph-shaped lines
- Journal: 3 section skeletons

**Inline loading:** Button → 16px spinner (same width). Audio → play spinner + "Generating…". AI prompts → 3-dot typing animation. AI reflection → "Reflecting on your entry…" + dots.

---

## 13. AI Voice & Content Tone

### 13.1 Core Principles

- **Mirror the user's language.** "You mentioned avoiding things again" not "You exhibit avoidance behaviors."
- **Observe, don't conclude.** "You've written about this three times" — good. "This is a deep-rooted pattern" — bad.
- **Ask, don't tell.** End with a question. "What do those moments have in common?"
- **Attribute everything.** "Based on Chapter 4…" or "You wrote about this on Tuesday…"
- **Be brief.** Reflections: 2–4 sentences. Prompts: 1–2. Experiments: 2. User's words always outnumber AI's.

### 13.2 Tone by Coach Setting

| Setting | Personality | Example Prompt | Example Reflection |
|---------|-------------|---------------|-------------------|
| Direct | Honest, challenging | "You said you'd stop avoiding this. What happened?" | "You've mentioned avoiding hard conversations three times. What does avoidance protect you from?" |
| Gentle | Warm, curious, validating | "When you think about what held you back, what comes up?" | "It sounds like that moment touched something. You're noticing it, which matters." |
| Analytical | Pattern-focused, data-driven | "Your last 4 entries mention avoidance on weekdays. What changes on weekends?" | "Tuesday and Thursday entries both reference justifying yourself. There may be a situational trigger." |

### 13.3 Never Does

- Clinical language (depression, anxiety disorder, narcissist, codependent)
- "You should see a therapist" unprompted
- Direct advice ("you should do X")
- Exclamation marks or enthusiasm ("Great insight!")
- Compare user to norms
- Use the word "journey"
- Pressure to go deeper

### 13.4 Crisis Content

If self-harm / suicidal ideation / crisis language detected:
- Bypass AI reflection entirely
- Show static resource card: "If you're going through a difficult time, you don't have to handle it alone." + 988 Lifeline, Crisis Text Line
- Calm, factual tone. No alarm.
- Detection: keyword matching + lightweight classifier. False positives okay. False negatives not.
- Normal AI features resume next day.
