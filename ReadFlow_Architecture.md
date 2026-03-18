# ReadFlow — System Architecture & Page-by-Page Specification

*Technical Planning Document • March 2026*

> This document defines every page, component, data model, API route, and state transition in ReadFlow.

---

## 1. Technology Stack

### 1.1 Frontend

| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| Next.js 14+ (App Router) | Framework | Server components for SEO landing pages, client components for the reader. File-based routing matches our page structure. |
| TypeScript | Language | Non-negotiable for a project this size. Catches bugs at compile time. |
| Tailwind CSS | Styling | Utility-first, fast iteration, consistent spacing/color tokens. |
| Zustand | Client state | Lightweight, no boilerplate. Manages reader state, playback position, UI mode. |
| React Query (TanStack) | Server state | Handles caching, background refetching, optimistic updates for library and journal data. |
| Framer Motion | Animation | Page transitions, reader UI micro-interactions, reflection card reveals. |
| Wavesurfer.js | Audio waveform | Renders the narration scrub bar with waveform visualization. |

### 1.2 Backend

| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| Next.js API Routes | API layer | Co-located with frontend. No separate server to deploy for MVP. |
| PostgreSQL (Supabase) | Primary database | Relational data (users, books, chapters, reflections, journal entries). Supabase adds auth, storage, and real-time for free tier. |
| Supabase Auth | Authentication | Email/password + OAuth (Google). Row-level security policies. |
| Supabase Storage | File storage | PDF/EPUB uploads, cached TTS audio files, cover images. |
| pgvector (Supabase) | Vector embeddings | Theme detection: cosine similarity between journal entries and book distillations. |
| OpenAI TTS API | Text-to-speech | Primary narration engine. Word-level timestamps for highlighting sync. |
| OpenAI GPT-4o-mini | AI generation | Distillation, prompt generation, journal personalization. Cheap and fast. |
| Vercel | Hosting | Deploys Next.js natively. Edge functions for low-latency API routes. Free tier for MVP. |

### 1.3 Key Libraries

| Library | Purpose |
|---------|---------|
| epub.js or @nicktomlin/epub | EPUB parsing and text extraction |
| pdf.js (Mozilla) | PDF text extraction with page coordinates |
| compromise (NLP) | Lightweight sentence splitting, keyword extraction for chunk boundaries |
| zod | Runtime validation of all API request/response shapes |
| date-fns | Date formatting for journal entries and reading streaks |
| howler.js | Audio playback with precise position tracking for word highlighting |

---

## 2. Data Model

### 2.1 Users

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Supabase auth.users reference |
| email | text | From auth provider |
| display_name | text | User-chosen name |
| avatar_url | text (nullable) | Profile image URL |
| focus_areas | text[] | Array of 3–5 tags: confidence, discipline, relationships, etc. |
| coach_tone | enum | direct \| gentle \| analytical |
| narration_speed | float | Default: 1.0. Range: 0.75–2.5 |
| preferred_voice | text | TTS voice ID |
| journal_personalization | boolean | Default: true. Whether AI can use journal for prompts. |
| local_journal_only | boolean | Default: false. If true, journal entries never leave the browser. |
| delete_raw_text | boolean | Default: false. If true, raw book text is deleted after distillation. |
| created_at | timestamptz | Account creation |
| onboarding_complete | boolean | Default: false |

### 2.2 Books

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | Owner |
| title | text | Auto-detected or user-entered |
| author | text | Auto-detected or user-entered |
| cover_url | text (nullable) | Supabase Storage path |
| source_file_url | text | Original uploaded file path |
| source_format | enum | epub \| pdf |
| total_words | integer | Calculated on ingest |
| estimated_listen_mins | integer | At 1.0x speed |
| estimated_rsvp_mins | integer | At 300 WPM |
| theme_tags | text[] | AI-generated: ['confidence', 'vulnerability'] |
| ai_summary | text | 2–3 sentence book-level summary |
| processing_status | enum | uploading \| extracting \| distilling \| ready \| error |
| processing_error | text (nullable) | Error message if processing failed |
| created_at | timestamptz | |
| finished_at | timestamptz (nullable) | When user finishes the book |

### 2.3 Chapters

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| book_id | uuid (FK → books) | |
| title | text | Chapter title (auto-detected or user-edited) |
| sort_order | integer | Position in book |
| word_count | integer | |
| raw_text | text | Full chapter text. Deleted if user opts for delete_raw_text. |
| audio_url | text (nullable) | Cached TTS audio file path in Supabase Storage |
| audio_timestamps | jsonb (nullable) | Array of {word, start_ms, end_ms} for word highlighting sync |
| reading_status | enum | unread \| in_progress \| completed |
| listen_progress_ms | integer | Playback position in milliseconds. Default: 0 |
| rsvp_progress_word | integer | Word index for RSVP mode. Default: 0 |
| last_read_at | timestamptz (nullable) | |

### 2.4 Distillations

One per chapter. The AI-generated summary and metadata that powers all downstream features.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| chapter_id | uuid (FK → chapters) | One-to-one |
| summary | text | 2–3 sentence summary of the chapter |
| key_terms | jsonb | Array of {term, definition} objects |
| claims | text[] | Core arguments as short bullet strings |
| application_angles | text[] | 1–3 ways this applies to everyday life |
| identity_beliefs | text[] | Core identity-level beliefs the chapter challenges (self-help books only) |
| payoff_questions | text[] | "What do you gain by staying stuck in X?" (self-help books only) |
| embedding | vector(1536) | OpenAI text-embedding-3-small of the summary. For theme detection. |
| created_at | timestamptz | |

### 2.5 Reflections

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| chapter_id | uuid (FK → chapters) | |
| user_id | uuid (FK → users) | |
| user_summary | text (nullable) | User's own summary of the section |
| ai_prompts | jsonb | Array of 3 AI-generated reflection prompts at escalating depth |
| ai_connections | jsonb | Array of 2–4 connection topics linking to other chapters/books |
| prompt_responses | jsonb | User's responses to specific prompts: {prompt_index, response_text} |
| confusion_flags | jsonb | Array of {word_index, passage_text, clarification} from confusion taps |
| recall_questions | jsonb (nullable) | Generated if user clicked 'Turn into questions' |
| created_at | timestamptz | |

### 2.6 Journal Entries

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| date | date | One entry per day |
| emotional_checkin | text | Emoji or word: e.g., 'calm', 'anxious', 'energized' |
| behavior_checkin | text (nullable) | Response to the behavior question |
| theme_response | text (nullable) | Response to the reading-based theme question |
| freeform_entry | text (nullable) | Open-ended journal entry. Where the deepest self-work happens. |
| behavior_prompt | text | The AI-generated behavior question shown to the user |
| theme_prompt | text | The AI-generated theme question shown to the user |
| identity_prompt | text (nullable) | Deeper identity-level question (self-help books only) |
| source_chapter_id | uuid (FK, nullable) | Which chapter the theme prompt was derived from |
| ai_reflection | text (nullable) | AI-generated pattern observation after user submits |
| micro_experiment | text (nullable) | AI-suggested behavioral experiment for the day |
| experiment_outcome | text (nullable) | User reports back on the experiment. Optional. |
| embedding | vector(1536) | For theme thread detection |
| created_at | timestamptz | |

### 2.7 Theme Threads

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| label | text | AI-generated thread name: 'Avoidance & procrastination' |
| description | text | 1–2 sentence description of the pattern |
| pattern_type | enum | identity_belief \| behavioral_loop \| emotional_trigger \| relationship_pattern |
| root_belief | text (nullable) | The underlying belief driving the pattern |
| related_journal_ids | uuid[] | Journal entries that belong to this thread |
| related_chapter_ids | uuid[] | Chapters whose distillation matched this thread |
| experiments | jsonb | Array of {description, date_suggested, date_completed, outcome} |
| status | enum | active \| dormant \| dismissed |
| created_at | timestamptz | |
| last_surfaced_at | timestamptz | When the thread was last shown to the user |

### 2.8 Reading Sessions

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| chapter_id | uuid (FK → chapters) | |
| mode | enum | narration \| rsvp |
| started_at | timestamptz | |
| ended_at | timestamptz (nullable) | |
| duration_seconds | integer | |
| words_consumed | integer | Words read/listened in this session |
| avg_speed | float | Average narration speed or RSVP WPM |
| comprehension_ratings | jsonb | Array of {timestamp, rating: got_it\|kinda\|lost} |

---

## 3. API Routes

### 3.1 Authentication (Supabase handled)

| Route | Method | Description |
|-------|--------|-------------|
| /auth/signup | POST | Email + password registration |
| /auth/login | POST | Email + password login |
| /auth/oauth/google | GET | Google OAuth redirect |
| /auth/logout | POST | Invalidate session |
| /auth/reset-password | POST | Send password reset email |

### 3.2 User Profile

| Route | Method | Description |
|-------|--------|-------------|
| /api/user/profile | GET | Return current user profile, settings, focus areas |
| /api/user/profile | PATCH | Update display name, avatar, focus areas, coach tone, privacy settings |
| /api/user/onboarding | POST | Complete onboarding: save focus areas, coach tone, preferred voice |

### 3.3 Books & Library

| Route | Method | Description |
|-------|--------|-------------|
| /api/books | GET | List user's books. Query params: status, tag, sort |
| /api/books/upload | POST | Upload PDF/EPUB. Returns book_id. Triggers async processing. |
| /api/books/:id | GET | Book detail: metadata, chapters, progress, theme tags |
| /api/books/:id | DELETE | Delete book and all associated data |
| /api/books/:id/chapters | GET | List chapters with reading status and progress |
| /api/books/:id/chapters/:chId | GET | Full chapter data: text, audio URL, timestamps, distillation |
| /api/books/:id/chapters/:chId/audio | POST | Trigger TTS generation for a chapter |
| /api/books/:id/chapters/reorder | PATCH | User reorders or renames chapters |
| /api/books/:id/progress | PATCH | Update listen_progress_ms or rsvp_progress_word |

### 3.4 Reflections

| Route | Method | Description |
|-------|--------|-------------|
| /api/reflections | GET | List reflections for a book or chapter |
| /api/reflections | POST | Create a new reflection after completing a chapter |
| /api/reflections/:id | PATCH | Update: add user summary, prompt responses, confusion clarifications |
| /api/reflections/:id/recall | POST | Generate recall questions from this chapter's distillation |

### 3.5 Journal

| Route | Method | Description |
|-------|--------|-------------|
| /api/journal | GET | List journal entries. Query: date range, theme thread ID |
| /api/journal/today | GET | Get today's entry (or generate prompts if none exists) |
| /api/journal/today | POST | Save today's journal entry |
| /api/journal/today | PATCH | Update an existing entry |
| /api/journal/today/reflect | POST | Generate AI pattern reflection from this entry + recent history |
| /api/journal/today/experiment | POST | Generate a micro-experiment based on current entry |
| /api/journal/today/experiment-outcome | PATCH | User reports experiment outcome |
| /api/journal/prompts | GET | Generate today's behavior + theme + identity prompts |

### 3.6 Theme Threads

| Route | Method | Description |
|-------|--------|-------------|
| /api/themes | GET | List active theme threads for the user |
| /api/themes/detect | POST | Run theme detection now (normally via cron) |
| /api/themes/:id/dismiss | POST | User dismisses a thread |

### 3.7 Insights

| Route | Method | Description |
|-------|--------|-------------|
| /api/insights/reading-stats | GET | Aggregate: total time, books finished, words consumed, avg speed |
| /api/insights/sessions | GET | Reading session history for charts |
| /api/insights/comprehension | GET | Comprehension self-ratings over time |
| /api/insights/streaks | GET | Current reading and journaling streaks |

### 3.8 Processing Pipeline (Internal / Background)

| Route | Method | Description |
|-------|--------|-------------|
| /api/internal/process-book | POST | After upload: extract → chunk → distill. Updates processing_status. |
| /api/internal/generate-audio | POST | TTS for one chapter. Stores in Supabase Storage. |
| /api/internal/daily-journal-gen | POST | Cron (midnight UTC): generate journal prompts for all active users |
| /api/internal/theme-detect | POST | Cron (2 AM UTC): embedding similarity for theme thread detection |

---

## 4. Page-by-Page Specification

### 4.1 Landing Page

| Property | Value |
|----------|-------|
| URL | / |
| Auth required | No |
| Purpose | Convert visitors to sign-ups |
| Data needed | None (static) |

**Sections:** Hero (headline + CTA + word-highlighting demo animation), How it works (3-step visual), Features (4 cards), Social proof (placeholder), Footer CTA.

**States:** Default = full landing. Logged in = redirect to /library.

### 4.2 Auth Pages

| Property | Value |
|----------|-------|
| URLs | /login, /signup, /reset-password |
| Auth required | No (redirect to /library if logged in) |

**Sign Up:** Email + password form (min 8 chars, must include number), Google OAuth button, link to /login. On success → /onboarding.

**Login:** Email + password, Google OAuth, 'Forgot password?' link. On success → /library (or /onboarding if not completed).

**Reset Password:** Email input, submit. Success state: 'Check your email for a reset link.'

### 4.3 Onboarding

| Property | Value |
|----------|-------|
| URL | /onboarding |
| Auth required | Yes |
| Purpose | Collect preferences to personalize from the start |

**Step 1 — Focus Areas:** Grid of selectable tags (confidence, discipline, relationships, anxiety, leadership, creativity, communication, focus, emotional regulation, self-awareness). Pick 3–5. Custom tags allowed.

**Step 2 — Coach Tone:** Three options with sample text. Direct / Gentle / Analytical.

**Step 3 — Voice Preview:** 2–4 voice samples reading the same passage. Speed slider.

**Step 4 — Privacy:** Three toggles: journal personalization, local-only storage, delete raw text. Defaults are permissive.

**Completion:** 'Upload your first book.' → /library with upload modal open.

### 4.4 Library

| Property | Value |
|----------|-------|
| URL | /library |
| Auth required | Yes |
| Data needed | GET /api/books |

**Layout:** Top bar (avatar, search, upload button). Tab bar: Reading (default), Finished, Collections. Grid of book cards.

**Book Card:** Cover image, title, author, progress bar, processing badge (if still processing).

**Upload Flow:** Click Upload → modal with drag-and-drop + file picker. Accepts .epub and .pdf. Progress bar during upload. Processing status polling. Modal closes when ready.

**Empty State:** Illustration + 'Upload your first book to get started' + upload button.

### 4.5 Book Detail

| Property | Value |
|----------|-------|
| URL | /library/:bookId |
| Auth required | Yes |
| Data needed | GET /api/books/:id, chapters, reflections |

**Header:** Cover (large), title, author, theme tags, progress %, listening time, 'Continue Reading' button.

**Chapter List:** Rows with chapter number, title, word count, status icon, reflection badge. Click → reader. Drag to reorder.

**Reflections Panel:** Completed reflections chronologically. Card = chapter title + summary excerpt + prompt count.

**Theme Threads:** Labeled links if threads connected to this book.

**Actions:** Continue Reading, Edit Chapters, Delete Book (confirmation modal).

### 4.6 AI-Narrated Reader

| Property | Value |
|----------|-------|
| URL | /read/:bookId/:chapterId |
| Auth required | Yes |
| Data needed | Chapter text, audio_url, audio_timestamps |
| On first open | Trigger TTS generation if audio_url is null |

**Layout:** Full-screen. Text in clean layout (Literata serif, wide margins). Current word highlighted. Audio plays on tap.

**Top Bar (auto-hides):** Back arrow, chapter title, mode toggle (Narration/RSVP), settings gear.

**Bottom Bar (always visible):** Scrub bar (waveform + position), play/pause, speed indicator, sentence replay, confusion flag.

**Paragraph View:** Long-press word → overlay showing full paragraph. Tap outside to dismiss.

**Chunk Checkpoints:** Every 3–5 min, slide-up card: Got it / Kinda / Lost. "Lost" → slow by 0.1x. Auto-dismiss after 5s.

**Chapter Completion:** Transition screen with 'Reflect on this chapter' and 'Continue to next chapter.' Last chapter shows 'You finished the book!'

**Audio Loading States:** Cached = immediate. Generating = spinner + "Generating narration…" + RSVP fallback. Failed = error + retry.

### 4.7 RSVP Reader

| Property | Value |
|----------|-------|
| URL | /read/:bookId/:chapterId?mode=rsvp |
| Auth required | Yes |

**Layout:** Full-screen. Center = current word (large). ORP character highlighted in accent color. Progress bar at top. Context line (current sentence, muted) below word.

**Controls:** WPM display + presets (200/300/450), play/pause, scrub bar (word position), same supporting features.

**Pause Behavior:** +150ms on periods/question marks/exclamation. +80ms on commas/semicolons/colons. Words >10 chars: +20% time. Paragraph breaks: optional 500ms.

### 4.8 Reflection Sprint

| Property | Value |
|----------|-------|
| URL | /reflect/:bookId/:chapterId |
| Auth required | Yes |
| AI-generated content | 3 prompts at escalating depth, 2–4 connection topics |

**Section 1 — Your Summary:** Textarea + voice-to-text. Optional.

**Section 2 — AI Starter Threads:** Three prompt cards at depth levels:
- Level 1 (Intellectual): What the author argues
- Level 2 (Personal pattern): Where this shows up in your life
- Level 3 (Identity/payoff): What you gain from staying stuck

**Section 3 — Connections:** 2–4 chips linking to earlier chapters/books. Expand on tap.

**Section 4 — Recall Questions:** Optional button. Generates 3–5 questions.

**Completion:** Done button → next chapter, book detail, or library.

### 4.9 Daily Journal

| Property | Value |
|----------|-------|
| URL | /journal |
| Auth required | Yes |
| AI-generated content | Behavior prompt, theme prompt, identity prompt |

**Section 1 — Emotional Check-in:** 6–8 emoji/word options. Custom input.

**Section 2 — Behavior Check-in:** AI prompt + attribution + text input.

**Section 3 — Theme Question:** Deeper prompt + attribution + text input.

**Section 4 — Freeform Entry:** Large textarea, voice-to-text. The main event.

**Section 5 — AI Reflection (after saving):** Pattern observation, 2–4 sentences + open question. Never diagnostic. Always exploratory.

**Section 6 — Micro-Experiment:** One specific, low-stakes action. "I'll try it" / "Modify" / "Skip."

**Past Entries:** Collapsed cards below. Date + emoji + preview. Tap to expand.

### 4.10 Insights Dashboard

| Property | Value |
|----------|-------|
| URL | /insights |
| Auth required | Yes |

**Stat Cards:** Total time, books finished, reading streak, journaling streak.

**Charts:** Reading over time (bar, minutes/day by mode), speed trend (line), comprehension (line, % Got it).

**Theme Threads:** Active threads with descriptions + connection counts.

### 4.11 Settings

| Property | Value |
|----------|-------|
| URL | /settings |
| Auth required | Yes |

**Sections:** Profile, Reading Preferences, Personalization, Privacy & Data, Notifications.

---

## 5. Client-Side State Management

### 5.1 Zustand: Reader State

Lives only while the reader is open.

| State Key | Type | Description |
|-----------|------|-------------|
| isPlaying | boolean | Narration/RSVP active |
| currentWordIndex | number | Currently highlighted word |
| currentSentenceIndex | number | For sentence replay |
| playbackPosition | number | Audio ms or word index |
| speed | number | Current playback speed |
| mode | 'narration' \| 'rsvp' | Active mode |
| showParagraphView | boolean | Overlay open |
| paragraphViewWordIndex | number | Which word triggered overlay |
| checkpointPending | boolean | Show checkpoint card |
| confusionFlags | number[] | Word indices flagged |
| sessionStartTime | Date | For duration tracking |

### 5.2 React Query: Server State

| Query Key | Endpoint | Stale Time |
|-----------|----------|------------|
| ['books'] | GET /api/books | 5 min |
| ['book', bookId] | GET /api/books/:id | 5 min |
| ['chapters', bookId] | GET /api/books/:id/chapters | 5 min |
| ['chapter', chapterId] | GET /api/books/:id/chapters/:chId | Infinity (immutable) |
| ['reflections', bookId] | GET /api/reflections | 1 min |
| ['journal', 'today'] | GET /api/journal/today | 1 min |
| ['insights'] | GET /api/insights/reading-stats | 5 min |
| ['themes'] | GET /api/themes | 10 min |

---

## 6. Background Processing Pipeline

### 6.1 Upload → Processing Flow

**Step 1: File Upload.** File → Supabase Storage, book record created (status: uploading). Frontend gets book_id immediately.

**Step 2: Text Extraction (status: extracting).** EPUB: epub.js, chapter structure from NCX/TOC. PDF: pdf.js, heading detection. Quality check: >5% garbled or <500 words → error. Create chapter records.

**Step 3: Distillation (status: distilling).** Per chapter: chunk 400–900 tokens, GPT-4o-mini → summary, key_terms, claims, application_angles, identity_beliefs, payoff_questions. Store embeddings. Generate book-level ai_summary and theme_tags.

**Step 4: Ready.** Book available. Audio NOT pre-generated — on-demand per chapter.

**Error Handling:** Each step can fail independently. Retry from failed step. Timeout: 5 min/chapter.

### 6.2 TTS Audio Generation

Triggered when user opens a chapter with no cached audio. OpenAI TTS API → audio + word-level timestamps → Supabase Storage. Cached per chapter per voice.

### 6.3 Daily Cron Jobs

- **Midnight UTC:** Generate journal prompts (behavior + theme + identity) from recent reading + focus areas + coach tone + last 3 entries.
- **2 AM UTC:** Theme detection via cosine similarity. Threshold 0.82 across 3+ entries and 2+ chapters.

### 6.4 AI Reflection Generation (Real-Time)

Triggered after journal save. Input: today's entry + last 5 entries + active threads + current book distillations. Output: 2–4 sentences of pattern observation + open question. GPT-4o-mini, temperature 0.7.

**Safety boundaries:** Never clinical language. Never "see a therapist." Never diagnoses. Never direct advice. Always exploratory. Crisis language → bypass AI, show static resource card.

---

## 7. Navigation & Routing Map

| URL | Page | From | To |
|-----|------|------|----|
| / | Landing | Direct / logged-out | /signup, /login |
| /signup | Sign Up | Landing CTA | /onboarding |
| /login | Login | Landing, /signup | /library, /onboarding |
| /onboarding | Onboarding | /signup, /login | /library |
| /library | Library | Sidebar nav, /onboarding | /library/:bookId, /journal, /insights, /settings |
| /library/:bookId | Book Detail | Library book card | /read/:bookId/:chId, /reflect/:bookId/:chId |
| /read/:bookId/:chId | Reader | Book detail | /reflect/:bookId/:chId, next chapter |
| /reflect/:bookId/:chId | Reflection | Reader, book detail | /read (next), /library/:bookId, /library |
| /journal | Journal | Sidebar nav | /library, /insights |
| /insights | Insights | Sidebar nav | /library, /journal |
| /settings | Settings | Sidebar nav | /library |

**Sidebar:** Library, Journal, Insights, Settings. Collapses on mobile to bottom tab bar. Hidden in reader.
