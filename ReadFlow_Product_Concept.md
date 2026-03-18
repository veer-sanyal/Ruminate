# ReadFlow — Product Concept

**AI-Narrated Reading for Deeper Understanding**
*Product Concept — Revised • March 2026*

> **Core loop:** Upload a book → Listen with AI narration (or use RSVP mode) → Reflect after each section → Journal daily with prompts tied to your reading → Track your growth over time.

---

## 1. The Core Idea

ReadFlow is a web-based reading app that helps people read nonfiction books faster, retain more, and translate what they learn into real behavior change. It does this by combining AI-narrated reading with guided reflection and connected journaling.

The primary reading mode is AI narration: the app reads the book aloud in a natural AI voice while displaying the page and highlighting the current word in real time, similar to how Kindle's read-aloud feature works but with much higher-quality synthesis. RSVP (rapid serial visual presentation) is available as a secondary speed-reading mode for users who prefer it.

---

## 2. Target User

The primary user is someone who reads nonfiction for personal growth (self-help, psychology, business, health) and wants to actually apply what they read, not just consume it. They likely have a backlog of books, feel like they forget most of what they read, and want a structured way to turn reading into action.

**This person is not:**
- A speed-reading enthusiast optimizing for WPM (RSVP is a secondary mode, not the pitch)
- A fiction reader looking for an audiobook replacement
- A student doing academic research

**This person is:**
- Reading 2–10 nonfiction books a year and wishing they retained more
- Interested in journaling or self-reflection but has never stuck with it
- Willing to spend 5 extra minutes per reading session on reflection if the app makes it easy

---

## 3. Product Experience

### A. Library

The library is where books live. Users upload PDFs or EPUBs, and the app processes them into structured "book objects."

**On upload, the app:**
- Extracts text and detects title, author, and cover image where possible
- Attempts chapter and section splitting (user can manually adjust if auto-detection is wrong)
- Estimates listening time at different narration speeds and RSVP reading time
- Generates a brief AI summary of the book's themes for categorization

**Shelf views:**
- Currently listening/reading, with progress bars
- Finished, with links to past reflections and journal entries
- Theme collections: user-created or auto-suggested groupings like "confidence," "discipline," or "anxiety"

**Supported formats:** EPUB is the primary supported format because it has reliable internal structure (chapters, headings, semantic markup). PDF is supported but with clear caveats: the app will warn users that chapter detection and text extraction may be less accurate with PDFs, especially scanned ones. Users can manually correct chapter boundaries after upload.

### B. AI-Narrated Reader (Primary Mode)

This is the main way people experience books in ReadFlow. The app reads the book aloud using high-quality AI text-to-speech while displaying the book's text on screen with real-time word highlighting.

**What it looks like:** The screen shows a page of text, formatted cleanly. As the AI voice reads, each word is highlighted in sequence, so the user can follow along visually while listening. Think of it as a teleprompter that reads to you.

**Narration controls:**
- Speed slider: 0.75x to 2.5x with named presets (Relaxed, Normal, Brisk, Sprint)
- Voice selection: 2–4 voice options with different tones (warm, neutral, energetic)
- Pause behavior: natural pauses at paragraph and section breaks; auto-pause at chapter end

**Key interaction features:**
- **Tap to pause/play.** Tapping anywhere on the text pauses narration; tap again to resume.
- **Scrub bar.** A timeline at the bottom lets users drag backward or forward within the current chapter. Dragging back replays that section at a slightly slower speed by default.
- **Sentence replay.** Double-tap rewinds to the start of the current sentence.
- **Paragraph view.** Long-press on any word to pop up the full paragraph for rereading at your own pace, without stopping the overall narration position.
- **Confusion flag.** A single-tap button (or gesture) marks "I didn't get that." The app logs it and, at the end of the section, offers a 1–2 sentence AI clarification of flagged passages.

**Chunk checkpoints:** Every 3–5 minutes of narration, the app briefly pauses and asks a lightweight check-in: "Got it / Kinda / Lost." If the user selects "Lost," the app can slow the narration speed slightly and increase the frequency of reflection prompts after that section. If "Got it," it stays the course. These check-ins also feed into comprehension tracking over time.

### C. RSVP Mode (Secondary)

For users who prefer visual speed-reading, RSVP mode displays one word at a time at the center of the screen with optimal recognition point highlighting. This mode includes the same scrub bar, sentence replay, paragraph view, and confusion flag features as the narrated mode.

**RSVP-specific controls:**
- WPM slider with presets: Focus (200 WPM), Normal (300 WPM), Sprint (450+ WPM)
- ORP highlighting: the fixation point of each word is shown in a contrasting color
- Smart pausing: extra delay on punctuation, slower on long or rare words, optional auto-pause at paragraph breaks

RSVP is positioned as a power-user feature, not the default experience. The onboarding flow defaults new users to narration mode and lets them discover RSVP through settings.

### D. Post-Section Reflection Sprint

After completing a chapter or section (in either reading mode), the user lands on a reflection page. This takes 2–5 minutes and is the core meaning-making step.

**The reflection page includes:**
- **Your quick summary.** A text box (or voice-to-text option) where you write what you took away from the section in your own words. This is optional but encouraged.
- **AI starter threads.** Three prompts at escalating depth levels, tailored to the specific chapter:
  - *Level 1 — Intellectual:* What the author is arguing. "The author claims avoidance is a survival mechanism, not laziness. Do you agree?"
  - *Level 2 — Personal pattern:* Where this shows up in the user's life. "Where in your life do you keep saying you want something to change, but your behavior stays the same?"
  - *Level 3 — Identity / payoff:* What the user gains from staying stuck. "If you're honest, what's the payoff of not changing this? What does staying the same protect you from?"
- **Connection topics.** 2–4 links to ideas from earlier chapters or other books in your library.
- **Turn into recall questions.** An optional button that generates 3–5 short-answer or multiple-choice questions from the section, stored for later review.

If the user skips reflection, the app doesn't nag. It saves a brief auto-generated summary of the section and moves on. The goal is to make reflection feel rewarding, not mandatory.

### E. Daily Journal

The journal is not a blank page. It's a short, structured daily check-in that ties directly to the user's reading life.

**Each daily entry includes:**
- **Emotional check-in.** How are you feeling today? (quick emoji or word selector)
- **Behavior check-in.** One question about something you're working on, tied to themes from recent reading.
- **Theme question.** A deeper question pulled from whatever the user is currently reading.
- **Freeform entry.** Open-ended writing about anything — situations, conflicts, wins, fears. This is where the deepest self-work happens.
- **AI reflection (after saving).** The app generates a brief, gentle pattern observation. Not advice, not diagnosis — just "you mentioned this three times this week, what do those moments have in common?"
- **Micro-experiment.** A small, specific behavioral experiment for the next 24 hours. "Next time you see someone you know on campus, your only job is eye contact and a small hey."

**Theme Threads:** Over time, the app detects recurring patterns across journal entries and reading material. If someone keeps reading about procrastination and writing about avoidance, the app surfaces this as a "thread" and gently continues exploring it in future prompts. This is opt-in and explained clearly.

---

## 4. The AI Engine

The AI pipeline is designed to be reliable and cost-efficient. The key principle is to never generate outputs directly from raw book text. Instead, the pipeline distills content first, then generates user-facing prompts from the distilled output.

**Step 1: Ingest and Chunk** — Extract text from EPUB (preferred) or PDF. Split into logical sections. Create processing chunks of 400–900 tokens. Run quality check on extraction.

**Step 2: Distill** — For each chapter, generate a "distillation object": 2–3 sentence summary, key terms, core claims, application angles, identity beliefs (for self-help), and payoff questions. This distillation is the source of truth for all downstream generation.

**Step 3: Generate Prompts and Questions** — Using the distillation (not raw text), generate reflection prompts at three depth levels, connection topics, recall questions, and candidate journal prompts.

**Step 4: Theme Detection** — Runs daily. Compares embedding vectors of journal entries against distillation embeddings. When similarity crosses a threshold, surfaces a "thread" suggestion. Not a therapy bot — just pattern observation.

---

## 5. Cost Model

| Step | API Calls | Estimated Cost |
|------|-----------|---------------|
| Text extraction | 0 (local) | $0 |
| Distillation (~25 sections) | 25 calls | $0.15–$0.40 |
| Prompt generation | 25 calls | $0.10–$0.30 |
| Book-level summary | 1 call | $0.01–$0.03 |
| **Total per book (one-time)** | | **$0.25–$0.75** |

Ongoing: ~$0.01–$0.05 per user per day (journal). TTS narration: $1–$10 per book depending on provider. Caching narrated audio is essential.

**Cost mitigation:** Pre-generate/cache all narration audio. Use cheap models (GPT-4o-mini) for distillation. Batch on upload. Cap daily journal AI calls at 1–2.

---

## 6. Personalization

**User-controlled settings:** 3–5 focus areas, coach tone (direct / gentle / analytical), opt-in journal personalization.

**Privacy controls (shown prominently):** "Store journal locally only," "Don't use journal to personalize prompts," "Delete raw book text after distillation."

Every AI-generated prompt references where it came from: "Based on Chapter 4's point about avoidance…"

---

## 7. Key Screens

| Screen | Purpose | Priority |
|--------|---------|----------|
| Library shelf | Upload books, browse collection, see progress | MVP1 |
| Book detail | Chapter map, progress, reflections, theme threads | MVP1 |
| AI-narrated reader | Primary reading experience with word highlighting | MVP1 |
| RSVP reader | Secondary speed-reading mode | MVP2 |
| Reflection Sprint | Post-section prompts, summary, connections | MVP2 |
| Daily Journal | Structured check-in + freeform + AI reflection | MVP3 |
| Insights dashboard | Speed trends, comprehension ratings, themes over time | MVP3 |
| Settings / Privacy | Voice, speed, personalization, data controls | MVP1 |

---

## 8. TTS Provider Decision

| Provider | Quality | Cost (per 1M chars) | Notes |
|----------|---------|---------------------|-------|
| OpenAI TTS | Very good | ~$15 | Simple API, few voices, good for v1 |
| ElevenLabs | Excellent | ~$11–$30 | Best quality, more voices, higher complexity |
| Google Cloud TTS | Good | ~$4–$16 | Cheapest, decent quality, many languages |
| Browser Web Speech API | Variable | Free | Fallback only |

**Recommendation for MVP:** Start with OpenAI TTS. Evaluate ElevenLabs for v2.

---

## 9. MVP Roadmap

### MVP1: Narrated Reader (4–6 weeks)
- Book upload: EPUB and PDF with text extraction, basic chapter splitting, manual editing
- AI narration: Chapter-by-chapter TTS with word-level highlighting, speed control, pause/play, sentence replay
- Library: Book shelf with progress tracking
- Audio caching: Generate and cache per chapter on first listen

### MVP2: Reflection + RSVP (3–4 weeks)
- Reflection Sprint: Post-section page with AI-generated prompts at three depth levels, connections, recall questions
- AI distillation pipeline: Full ingest → distill → generate running on upload
- RSVP mode: WPM control, ORP highlighting, smart pausing
- Confusion flags: Mark passages, get clarifications

### MVP3: Journal + Personalization (3–4 weeks)
- Daily Journal: Structured check-in + freeform + AI reflection + micro-experiments
- Theme Threads: Embedding-based pattern detection across journal and books
- Personalization: Focus areas, coach tone, journal-informed prompts
- Insights dashboard: Reading speed, comprehension, theme tracking

---

## 10. Open Questions

- **Word-level timestamp sync.** Core technical challenge — OpenAI TTS supports this but needs testing.
- **Mobile responsiveness.** Web app, but primary use case is mobile. PWA needed for MVP2?
- **Offline support.** Cached audio + service workers for commuters.
- **EPUB DRM.** Only DRM-free files supported. Communicate clearly at upload.
- **Pricing model.** Free tier (1–2 books/month) + paid ($8–$15/month). TTS costs make pure free unsustainable.
- **Social features.** Probably not for MVP. Changes the product's intimate feel.
