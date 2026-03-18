# ReadFlow — Complete Build Plan

> 195 tasks · Phase 0 → MVP3 · Every component, route, migration, and config step

---

## Phase 0: Project Setup & Infrastructure (Tasks 1–28)

### Project Initialization

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 1 | ⚡ Initialize Next.js project | `./` (root) | — | `npx -y create-next-app@latest ./ --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"`. Bootstraps the App Router project with TypeScript and Tailwind. | S |
| 2 | Install core dependencies | `package.json` | #1 | Install: `@supabase/supabase-js @supabase/ssr zustand @tanstack/react-query @tanstack/react-query-devtools framer-motion zod date-fns lucide-react howler wavesurfer.js compromise`. Dev deps: `@types/howler`. | S |
| 3 | ⚡ Configure environment variables | `.env.local`, `.env.example` | #1 | Define `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`. `.env.example` as template with placeholder values. | S |
| 4 | Configure TypeScript strict mode | `tsconfig.json` | #1 | Enable `strict: true`, `noUncheckedIndexedAccess: true`, path aliases `@/*` → `./src/*`. | S |

### Design System Configuration

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 5 | ⚡ Tailwind config with design tokens | `tailwind.config.ts` | #1 | Extend theme with all color tokens (light/dark), font families (Instrument Serif, DM Sans, Literata, JetBrains Mono), custom spacing scale (4/8/12/16/20/24/32/40/48/64), breakpoints, border-radius values, and animation durations per the design system. | M |
| 6 | ⚡ Global CSS with font imports & custom properties | `src/app/globals.css` | #5 | Import Google Fonts (Instrument Serif, DM Sans, Literata, JetBrains Mono). Define CSS custom properties for all color tokens. Set up light/dark mode via `prefers-color-scheme` and a `[data-theme]` attribute. Base typography resets. `@media (prefers-reduced-motion)` wrappers. | M |
| 7 | Create shared icon configuration | `src/lib/icons.ts` | #2 | Re-export commonly used Lucide icons with consistent defaults (20px, 1.5px stroke). Central place to swap icons. | S |

### Supabase Client Setup

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 8 | ⚡ Supabase browser client | `src/lib/supabase/client.ts` | #2, #3 | `createBrowserClient()` using `@supabase/ssr`. Used in client components. | S |
| 9 | ⚡ Supabase server client | `src/lib/supabase/server.ts` | #2, #3 | `createServerClient()` using `@supabase/ssr` with cookie handling for server components and API routes. | S |
| 10 | Supabase admin client | `src/lib/supabase/admin.ts` | #3 | Service-role client for background jobs (processing pipeline, cron). Never exposed to browser. | S |
| 11 | ⚡ Auth middleware | `src/middleware.ts` | #9 | Next.js middleware that refreshes Supabase session on every request. Protects `/library`, `/read`, `/reflect`, `/journal`, `/insights`, `/settings`, `/onboarding`. Redirects unauthenticated users to `/login`. Redirects authenticated users from `/login`/`/signup` to `/library`. | M |

### Shared Types & Validation

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 12 | ⚡ Database types (generated) | `src/types/database.ts` | #3 | Generate TypeScript types from Supabase schema using `supabase gen types`. Foundation for all data access. | S |
| 13 | ⚡ Zod schemas for all tables | `src/lib/schemas.ts` | #2 | Zod schemas for: User profile, Book, Chapter, Distillation, Reflection, JournalEntry, ThemeThread, ReadingSession. Used for API request/response validation. Includes enums for processing_status, reading_status, coach_tone, pattern_type, mode. | L |
| 14 | Application-level types | `src/types/index.ts` | #12, #13 | Derived TypeScript types from Zod schemas. Component prop types. API response wrappers. Utility types like `ProcessingStatus`, `ReadingMode`, `CoachTone`. | M |

### Provider & Layout Setup

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 15 | ⚡ React Query provider | `src/providers/QueryProvider.tsx` | #2 | Client component wrapping `QueryClientProvider` with default stale times per query key pattern. Includes React Query DevTools in development. | S |
| 16 | Theme provider | `src/providers/ThemeProvider.tsx` | #6 | Manages light/dark mode toggle. Reads system preference, persists choice to localStorage, sets `[data-theme]` on `<html>`. | S |
| 17 | ⚡ Root layout | `src/app/layout.tsx` | #6, #15, #16 | Root `<html>` with font classes, metadata (title, description, OG tags), `QueryProvider`, `ThemeProvider`, skip-to-content link. | M |
| 18 | Auth layout | `src/app/(auth)/layout.tsx` | #17 | Centered card layout for `/login`, `/signup`, `/reset-password`. No sidebar. Warm background. | S |
| 19 | ⚡ Sidebar component | `src/components/layout/Sidebar.tsx` | #7, #14 | 240px sidebar (desktop) with nav items: Library, Journal, Insights, Settings. Active indicator uses `--accent`. Collapses to 64px icons on tablet. Hidden on mobile. Uses `usePathname()` for active state. | M |
| 20 | Bottom tab bar (mobile) | `src/components/layout/BottomTabBar.tsx` | #7, #14 | 56px bottom tab bar for mobile (<768px). 4 items: Library, Journal, Insights, Settings. Active tab uses `--accent`. | S |
| 21 | ⚡ App layout | `src/app/(app)/layout.tsx` | #17, #19, #20 | Authenticated layout with Sidebar + main content area (max-width 960px centered). Renders BottomTabBar on mobile. Fetches user profile for sidebar avatar. | M |
| 22 | Reader layout | `src/app/(reader)/layout.tsx` | #17 | Full-viewport layout with NO sidebar, NO bottom bar. Minimal structure for immersive reading. | S |

### Shared UI Components

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 23 | Button component | `src/components/ui/Button.tsx` | #6 | Variants: primary (--accent), secondary, ghost, destructive. Sizes: sm (32px), md (40px), lg (48px). Loading state with spinner. Disabled state (opacity 0.5). Hover darken + active scale(0.98). DM Sans 14px/500. | S |
| 24 | Input & Textarea components | `src/components/ui/Input.tsx` | #6 | Styled input (40px height, 8px radius, focus border --accent) and auto-grow textarea. Label, error message, helper text slots. 16px font to avoid iOS zoom. | S |
| 25 | Modal component | `src/components/ui/Modal.tsx` | #6 | Backdrop overlay + centered panel. Close on Escape/backdrop click. Framer Motion fade+scale entrance. Trap focus. Configurable width. | M |
| 26 | Card component | `src/components/ui/Card.tsx` | #6 | Base card: --bg-secondary, 1px border, 12px radius, 16px/20px padding. Interactive variant with hover effect. Elevated variant with shadow. | S |
| 27 | Skeleton loader | `src/components/ui/Skeleton.tsx` | #6 | Shimmer pulse animation (1.5s loop) on --bg-tertiary. Variants: text line, card, circle (avatar). | S |
| 28 | Toggle switch | `src/components/ui/Toggle.tsx` | #6 | 44×24px track, 20px thumb. Off: --bg-tertiary. On: --accent. 200ms transition. Accessible label. | S |

---

## Phase 1: MVP1 — Narrated Reader (Tasks 29–105)

### Database Migrations

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 29 | ⚡ Create users table migration | Supabase migration | #3 | Create `public.users` table matching schema: id (uuid, FK auth.users), email, display_name, avatar_url, focus_areas, coach_tone enum, narration_speed, preferred_voice, journal_personalization, local_journal_only, delete_raw_text, onboarding_complete, created_at. Trigger to create user row on auth signup. | M |
| 30 | ⚡ Create books table migration | Supabase migration | #29 | Books table with all columns. Enum for processing_status. FK to users. Indexes on user_id and processing_status. | M |
| 31 | ⚡ Create chapters table migration | Supabase migration | #30 | Chapters table. Enum for reading_status. FK to books. Indexes on book_id and sort_order. | M |
| 32 | Create reading_sessions table migration | Supabase migration | #31 | Reading sessions table. Enum for mode. FKs to users and chapters. Index on user_id and started_at. | S |
| 33 | ⚡ Row-level security policies | Supabase migration | #29, #30, #31, #32 | RLS on all tables. Users can only read/write their own data. Books filtered by user_id. Chapters filtered through book ownership. Sessions filtered by user_id. Enable RLS on every table. | M |

### Auth Pages

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 34 | Auth utility functions | `src/lib/auth.ts` | #8, #9 | Helper functions: `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `resetPassword`, `getUser`, `getSession`. Wraps Supabase Auth methods with error handling. | M |
| 35 | Sign up page | `src/app/(auth)/signup/page.tsx` | #18, #23, #24, #34 | Email + password form (min 8 chars, must include number — validated with Zod). Google OAuth button. Link to /login. On success → redirect to /onboarding. Error states for duplicate email, weak password. | M |
| 36 | Login page | `src/app/(auth)/login/page.tsx` | #18, #23, #24, #34 | Email + password form, Google OAuth, "Forgot password?" link to /reset-password. On success → /library (or /onboarding if not completed). | M |
| 37 | Reset password page | `src/app/(auth)/reset-password/page.tsx` | #18, #23, #24, #34 | Email input. Submit sends password reset email via Supabase. Success state: "Check your email for a reset link." | S |
| 38 | OAuth callback handler | `src/app/(auth)/callback/route.ts` | #9, #34 | Route handler for Supabase OAuth callback. Exchanges code for session, redirects to /library or /onboarding. | S |

### Onboarding

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 39 | ⚡ Onboarding page container | `src/app/(app)/onboarding/page.tsx` | #21, #23 | 4-step wizard with progress indicator (dots). Manages current step state. "Back" and "Next"/"Get Started" buttons. On completion → POST /api/user/onboarding → redirect to /library. | M |
| 40 | FocusAreasStep component | `src/components/onboarding/FocusAreasStep.tsx` | #39 | Grid of selectable tag chips (confidence, discipline, relationships, anxiety, leadership, creativity, communication, focus, emotional regulation, self-awareness). Multi-select, 3–5 required. Custom tag input. | M |
| 41 | CoachToneStep component | `src/components/onboarding/CoachToneStep.tsx` | #39 | Three radio-style cards with tone name, description, and sample AI text. Direct / Gentle / Analytical. | S |
| 42 | VoicePreviewStep component | `src/components/onboarding/VoicePreviewStep.tsx` | #39 | 2–4 voice sample cards, each with a play button for a short audio clip. Speed slider (0.75x–2.5x). Select preferred voice. | M |
| 43 | PrivacyStep component | `src/components/onboarding/PrivacyStep.tsx` | #28, #39 | Three toggle switches: journal personalization (default on), local-only storage (default off), delete raw text (default off). Brief explanation for each. | S |
| 44 | Onboarding API route | `src/app/api/user/onboarding/route.ts` | #9, #13, #29 | POST handler. Validates body with Zod. Updates user record with focus_areas, coach_tone, preferred_voice, narration_speed, privacy settings. Sets onboarding_complete = true. | S |

### User Profile API

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 45 | Get user profile API | `src/app/api/user/profile/route.ts` (GET) | #9, #13, #29 | Returns authenticated user's full profile. Used by sidebar (avatar, name) and settings page. | S |
| 46 | Update user profile API | `src/app/api/user/profile/route.ts` (PATCH) | #9, #13, #29 | Partial update of user profile fields. Validates with Zod partial schema. | S |

### Library

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 47 | useBooks hook | `src/hooks/useBooks.ts` | #8, #15 | React Query hook: `useBooks(status?, tag?, sort?)` → fetches `GET /api/books`. 5-min stale time. Returns books array, loading, error states. | S |
| 48 | Books list API route | `src/app/api/books/route.ts` (GET) | #9, #13, #30 | List user's books. Query params: status (reading/finished/all), tag, sort (recent/title/progress). Filtered by authenticated user_id. | M |
| 49 | ⚡ BookCard component | `src/components/library/BookCard.tsx` | #26, #14 | Displays cover image (2:3 ratio, max 160px), title (Instrument Serif), author (DM Sans), progress bar, processing status badge. Click navigates to `/library/:bookId`. Interactive card hover effect. | M |
| 50 | ProcessingBadge component | `src/components/library/ProcessingBadge.tsx` | #14 | Small badge showing processing_status: uploading (pulse), extracting (spinner), distilling (spinner), error (red). | S |
| 51 | EmptyLibrary component | `src/components/library/EmptyLibrary.tsx` | #23 | Warm illustration placeholder + "Upload your first book to get started" text + Upload button. Shown when user has zero books. | S |
| 52 | ⚡ Library page | `src/app/(app)/library/page.tsx` | #21, #47, #49, #50, #51 | Three tab views: Reading, Finished, Collections. Grid of BookCards. Upload button in top-right. Empty state for first-time users. Search input (client-side filter). Loading skeletons. | M |
| 53 | Upload modal | `src/components/library/UploadModal.tsx` | #25, #23, #24 | Drag-and-drop zone + file picker button. Accepts `.epub` and `.pdf`. File validation (type, size < 100MB). Upload progress bar. Calls POST /api/books/upload. Shows processing status after upload completes. | L |
| 54 | useUploadBook hook | `src/hooks/useUploadBook.ts` | #8 | React Query mutation for file upload. Tracks upload progress via XMLHttpRequest. Invalidates `['books']` on success. | M |

### Book Upload & Processing Pipeline

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 55 | ⚡ Upload API route | `src/app/api/books/upload/route.ts` | #10, #13, #30 | Accepts multipart file upload. Stores file in Supabase Storage bucket `book-files`. Creates book record with status `uploading`. Triggers processing pipeline (calls /api/internal/process-book). Returns book_id. | M |
| 56 | Text extraction utilities | `src/lib/processing/extract.ts` | #2 | Functions: `extractEpub(fileUrl)` → chapters with title, text, sort_order. `extractPdf(fileUrl)` → chapters via heading detection. Quality check: garbled text percentage, minimum word count. | L |
| 57 | EPUB parser | `src/lib/processing/epub-parser.ts` | #2, #56 | Parse EPUB using epub.js. Extract chapter structure from NCX/TOC. Return array of {title, text, sortOrder}. Handle cover image extraction. | L |
| 58 | PDF parser | `src/lib/processing/pdf-parser.ts` | #2, #56 | Parse PDF using pdf.js. Detect chapter headings via font-size heuristics. Map pages to chapters. Return same structure as EPUB parser. | L |
| 59 | ⚡ Process book API route | `src/app/api/internal/process-book/route.ts` | #10, #56, #57, #58, #30, #31 | Background route. Orchestrates: extract text → quality check → create chapter records → update status. Handles errors per step, sets processing_error. Updates status: uploading → extracting → ready (distilling added in MVP2). | L |
| 60 | Processing status polling hook | `src/hooks/useProcessingStatus.ts` | #8 | Polls book record every 3s while status is not `ready` or `error`. Uses React Query with `refetchInterval`. Stops polling when done. | S |

### Book Detail Page

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 61 | Book detail API route | `src/app/api/books/[id]/route.ts` | #9, #13, #30, #31 | GET: Returns book with chapters, progress calculation, total listening time. DELETE: Deletes book, all chapters, associated storage files. Validates ownership. | M |
| 62 | Chapters list API route | `src/app/api/books/[id]/chapters/route.ts` | #9, #13, #31 | GET: Returns chapters for a book, ordered by sort_order. Includes reading_status, word_count, has_audio flag. | S |
| 63 | Chapter reorder API route | `src/app/api/books/[id]/chapters/reorder/route.ts` | #9, #13, #31 | PATCH: Accepts array of {id, sort_order, title?}. Batch updates sort_order and optional title for chapters. | S |
| 64 | useBook hook | `src/hooks/useBook.ts` | #8 | React Query hook: `useBook(bookId)` → fetches book detail. 5-min stale time. | S |
| 65 | useChapters hook | `src/hooks/useChapters.ts` | #8 | React Query hook: `useChapters(bookId)` → fetches chapter list. 5-min stale time. | S |
| 66 | BookHeader component | `src/components/book-detail/BookHeader.tsx` | #14 | Large cover, title (Instrument Serif), author, theme tags as pills, progress %, estimated time remaining, "Continue Reading" button (navigates to next unfinished chapter). | M |
| 67 | ChapterList component | `src/components/book-detail/ChapterList.tsx` | #14, #26 | List of chapter rows: number, title, word count, status icon (unread/in_progress/completed), reflection badge. Click → reader. Drag handle for reorder. | M |
| 68 | ChapterEditMode component | `src/components/book-detail/ChapterEditMode.tsx` | #24, #67 | Toggle editing: drag-to-reorder, inline rename. Save calls PATCH /api/books/:id/chapters/reorder. Cancel reverts. | M |
| 69 | DeleteBookModal component | `src/components/book-detail/DeleteBookModal.tsx` | #25, #23 | Confirmation modal: "Delete [title]? This removes all chapters, audio, and reflections." Destructive button calls DELETE /api/books/:id. | S |
| 70 | ⚡ Book detail page | `src/app/(app)/library/[bookId]/page.tsx` | #21, #64, #65, #66, #67, #68, #69 | Renders BookHeader + ChapterList + delete action. Loading skeleton. 404 handling. | M |

### AI-Narrated Reader — Core

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 71 | ⚡ Reader Zustand store | `src/stores/readerStore.ts` | #2 | State: isPlaying, currentWordIndex, currentSentenceIndex, playbackPosition, speed, mode, showParagraphView, paragraphViewWordIndex, checkpointPending, confusionFlags[], sessionStartTime. Actions: play, pause, seek, setSpeed, flagConfusion, triggerCheckpoint, reset. | M |
| 72 | Chapter data API route | `src/app/api/books/[id]/chapters/[chId]/route.ts` | #9, #13, #31 | GET: Returns full chapter data — text, audio_url, audio_timestamps, reading_status, progress. Validates ownership through book. | S |
| 73 | useChapter hook | `src/hooks/useChapter.ts` | #8 | React Query hook: `useChapter(bookId, chapterId)` → fetches chapter data. Infinity stale time (immutable text). | S |
| 74 | Text processing utilities | `src/lib/utils/text-utils.ts` | #2 | Functions: `splitIntoWords(text)`, `splitIntoSentences(text)` (using compromise NLP), `splitIntoParagraphs(text)`, `getWordAtIndex(words, index)`, `getSentenceForWord(sentences, wordIndex)`, `getParagraphForWord(paragraphs, wordIndex)`. | M |
| 75 | Audio utilities | `src/lib/utils/audio-utils.ts` | #2 | Functions: `findWordIndexAtTime(timestamps, currentMs)`, `findSentenceStartTime(timestamps, sentenceWords)`, `formatDuration(ms)`, `calculateProgress(currentMs, totalMs)`. | M |
| 76 | ⚡ TTS generation API route | `src/app/api/books/[id]/chapters/[chId]/audio/route.ts` | #10, #31 | POST: Calls OpenAI TTS API with chapter text and user's preferred voice. Requests word-level timestamps. Stores audio file + timestamps JSON in Supabase Storage. Updates chapter record with audio_url and audio_timestamps. | L |
| 77 | ⚡ useAudioPlayer hook | `src/hooks/useAudioPlayer.ts` | #2, #71, #75 | Wraps howler.js. Controls: play, pause, seek, setRate. On timeupdate: reads current position, calls `findWordIndexAtTime`, updates readerStore.currentWordIndex. Handles audio loading, error, and ended events. | L |
| 78 | ⚡ useWordHighlight hook | `src/hooks/useWordHighlight.ts` | #71, #74 | Reads currentWordIndex from store. Computes which word element to highlight. Auto-scrolls text container to keep highlighted word in view (smooth scroll, centered). Returns highlight position data. | M |
| 79 | ⚡ ChapterText component | `src/components/reader/ChapterText.tsx` | #74, #78 | Renders chapter text with each word wrapped in a `<span>`. Current word gets `--accent` background at 20% opacity. Literata font, 18–22px, line-height 1.7, max-width 680px. INSTANT highlight transition (0ms). Long-press handler on words for paragraph view. | L |
| 80 | Reader top bar | `src/components/reader/ReaderTopBar.tsx` | #7, #71 | Auto-hides on scroll down, shows on scroll up or tap. Back arrow (→ book detail), chapter title (truncated), mode toggle (Narration/RSVP pill — RSVP disabled in MVP1), settings gear. | M |
| 81 | Play/pause control | `src/components/reader/PlayPauseButton.tsx` | #7, #71, #77 | Large centered play/pause button. Also: tap anywhere on text toggles play/pause. Spacebar keyboard shortcut. | S |
| 82 | ⚡ Scrub bar component | `src/components/reader/ScrubBar.tsx` | #71, #77 | Waveform visualization using wavesurfer.js. Current position indicator. Time labels (elapsed / total). Drag to seek. | L |
| 83 | Speed control component | `src/components/reader/SpeedControl.tsx` | #71, #77, #28 | Slider (0.75x–2.5x) + preset buttons: Relaxed 0.75x, Normal 1.0x, Brisk 1.5x, Sprint 2.0x. Current speed display in JetBrains Mono. | M |
| 84 | Sentence replay | `src/components/reader/SentenceReplay.tsx` | #71, #74, #77 | Button (rotate-ccw icon). On tap: finds current sentence start time, seeks audio to that position. Double-tap text triggers same action. | S |
| 85 | Paragraph view overlay | `src/components/reader/ParagraphView.tsx` | #25, #71, #74 | Long-press on any word → centered modal showing the full paragraph with the pressed word highlighted. Tap outside or swipe down to dismiss. | M |
| 86 | Confusion flag button | `src/components/reader/ConfusionFlag.tsx` | #71 | Bottom-right floating button (message-circle-question icon). On tap: logs current word index to confusionFlags in store, shows pulse animation confirmation. Badge with count. | S |
| 87 | useCheckpoints hook | `src/hooks/useCheckpoints.ts` | #71 | Tracks elapsed time since last checkpoint. Every 3–5 minutes of playback: sets checkpointPending = true. After "Lost" response: decreases speed by 0.1x. Logs rating with timestamp. | M |
| 88 | Checkpoint card component | `src/components/reader/CheckpointCard.tsx` | #26, #71, #87 | Slide-up card from bottom: "How are you feeling?" → Got it (green) / Kinda (amber) / Lost (red). Auto-dismiss after 5 seconds. Framer Motion slide-up animation. | M |
| 89 | Audio loading state component | `src/components/reader/AudioLoadingState.tsx` | #27 | Three states: generating (spinner + "Generating narration…"), error (retry button), RSVP fallback offer ("Read in text mode while audio generates?"). | S |
| 90 | Chapter completion screen | `src/components/reader/ChapterComplete.tsx` | #23, #26 | "Chapter complete!" with chapter title. Two CTAs: "Reflect on this chapter" (→ /reflect/:bookId/:chId, dimmed in MVP1), "Continue to next chapter" (→ next chapter's reader). Last chapter shows "You finished the book!" | M |

### Reader Page & Session Tracking

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 91 | Reading session API routes | `src/app/api/sessions/route.ts` | #9, #13, #32 | POST: Create session (user_id, chapter_id, mode, started_at). PATCH: Update session on end (ended_at, duration_seconds, words_consumed, avg_speed, comprehension_ratings). | M |
| 92 | useReadingSession hook | `src/hooks/useReadingSession.ts` | #8, #91 | Creates session on reader mount, updates on unmount/chapter-end. Tracks duration, word count, speed, checkpoint ratings. | M |
| 93 | Progress persistence API | `src/app/api/books/[id]/progress/route.ts` | #9, #13, #31 | PATCH: Updates listen_progress_ms, rsvp_progress_word, reading_status, last_read_at for a chapter. Called on pause, exit, and periodically (every 30s). | S |
| 94 | useProgressPersistence hook | `src/hooks/useProgressPersistence.ts` | #8, #93 | Debounced save of playback position every 30 seconds and on beforeunload/visibilitychange. Calls PATCH /api/books/:id/progress. | M |
| 95 | ⚡ Reader page | `src/app/(reader)/read/[bookId]/[chId]/page.tsx` | #22, #71, #73, #77, #78, #79, #80, #81, #82, #83, #84, #85, #86, #88, #89, #90, #92, #94 | Full-screen reader. Loads chapter data, initializes audio player, renders ChapterText with word highlighting, all controls. Resumes from saved progress. Handles chapter completion. The core reading experience. | XL |

### Settings Page

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 96 | ProfileSection component | `src/components/settings/ProfileSection.tsx` | #24, #46 | Display name input, avatar upload, email (read-only). Save updates via PATCH /api/user/profile. | M |
| 97 | ReadingPreferencesSection component | `src/components/settings/ReadingPreferencesSection.tsx` | #24, #28, #46 | Narration speed slider with value display (JetBrains Mono), voice selector dropdown. | S |
| 98 | PersonalizationSection component | `src/components/settings/PersonalizationSection.tsx` | #40, #41, #46 | Edit focus areas (same chip grid as onboarding), coach tone selector. | M |
| 99 | PrivacySection component | `src/components/settings/PrivacySection.tsx` | #28, #46 | Same three toggles as onboarding privacy step. Additional "Export my data" (JSON download) and "Delete my account" (confirmation modal). | M |
| 100 | Settings page | `src/app/(app)/settings/page.tsx` | #21, #96, #97, #98, #99 | Sections: Profile, Reading Preferences, Personalization, Privacy & Data. All wired to PATCH /api/user/profile. Section headings in Instrument Serif. | M |

### Utility & Polish (MVP1)

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 101 | Toast/notification component | `src/components/ui/Toast.tsx` | #6 | Minimal toast for success/error feedback. Auto-dismiss after 4s. Bottom-center positioning. | S |
| 102 | ErrorBoundary component | `src/components/ui/ErrorBoundary.tsx` | #23 | Catches React errors. Shows friendly error message with retry button. Reports errors (console/future Sentry). | S |
| 103 | Loading page component | `src/components/ui/LoadingPage.tsx` | #27 | Full-page skeleton/spinner for route transitions. | S |
| 104 | 404 page | `src/app/not-found.tsx` | #23 | Warm 404 page with "Go to Library" CTA. | S |
| 105 | Supabase Storage bucket setup | Supabase config | #3 | Create Storage buckets: `book-files` (private), `audio-cache` (private), `covers` (public). Set file size limits and allowed MIME types. | S |

---

## Phase 2: MVP2 — Reflection + RSVP (Tasks 106–145)

### AI Distillation Pipeline

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 106 | ⚡ Create distillations table migration | Supabase migration | #31 | Distillations table with all columns. Enable pgvector extension. vector(1536) column for embedding. FK to chapters (one-to-one). RLS policy. | M |
| 107 | Create reflections table migration | Supabase migration | #31, #29 | Reflections table. FKs to chapters and users. RLS: user can only access own reflections. | M |
| 108 | AI utilities | `src/lib/utils/ai-utils.ts` | #2 | OpenAI API wrapper functions: `generateDistillation(chapterText, bookContext)`, `generateEmbedding(text)`, `generateReflectionPrompts(distillation, userProfile)`, `generateRecallQuestions(distillation)`. All with retry logic and error handling. | L |
| 109 | ⚡ Distillation API route | `src/app/api/internal/distill-chapter/route.ts` | #10, #108, #106 | Per-chapter distillation: chunk text (400–900 tokens), call GPT-4o-mini → summary, key_terms, claims, application_angles, identity_beliefs, payoff_questions. Generate embedding. Store distillation record. | L |
| 110 | Book summary & theme tags generation | `src/lib/processing/book-summary.ts` | #108, #106 | After all chapters distilled: synthesize book-level ai_summary and theme_tags from chapter distillations. Update book record. | M |
| 111 | ⚡ Update process-book route for distillation | `src/app/api/internal/process-book/route.ts` | #59, #109, #110 | Extend pipeline: after text extraction → run distillation for each chapter → generate book summary → set status to `ready`. Status flow: uploading → extracting → distilling → ready. | M |

### Reflection Sprint

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 112 | Reflections API routes | `src/app/api/reflections/route.ts` | #9, #13, #107 | GET: List reflections by book or chapter. POST: Create new reflection with ai_prompts and ai_connections (generated server-side). | M |
| 113 | Reflection update API route | `src/app/api/reflections/[id]/route.ts` | #9, #13, #107 | PATCH: Add user_summary, prompt_responses, confusion clarifications. | S |
| 114 | Recall questions API route | `src/app/api/reflections/[id]/recall/route.ts` | #108, #107 | POST: Generate 3–5 recall questions from chapter distillation. Returns questions and stores in reflection. | M |
| 115 | useReflection hook | `src/hooks/useReflection.ts` | #8 | React Query hook for fetching/creating/updating reflections for a chapter. | S |
| 116 | ReflectionHeader component | `src/components/reflection/ReflectionHeader.tsx` | #14 | Chapter title (Instrument Serif), AI-generated chapter summary (2–3 sentences, DM Sans, muted). Provides context for what the user just read. | S |
| 117 | UserSummarySection component | `src/components/reflection/UserSummarySection.tsx` | #24 | "In your own words…" auto-grow textarea. Voice-to-text button (Web Speech API). Optional — user can skip. | M |
| 118 | PromptCard component | `src/components/reflection/PromptCard.tsx` | #26 | Single prompt card: depth tag pill ("intellectual" / "personal" / "go deeper"), prompt text, expand-to-respond textarea. Framer Motion card reveal (staggered). | M |
| 119 | PromptCardsSection component | `src/components/reflection/PromptCardsSection.tsx` | #118 | Renders 3 PromptCards at escalating depth. Each response saved independently. | S |
| 120 | ConnectionChip component | `src/components/reflection/ConnectionChip.tsx` | #14 | Pill showing connection topic (e.g., "Similar theme in Ch.3 of Atomic Habits"). Tap expands inline explanation. | S |
| 121 | ConnectionsSection component | `src/components/reflection/ConnectionsSection.tsx` | #120 | Horizontal scroll of 2–4 ConnectionChips. Links current chapter to earlier reading. | S |
| 122 | RecallQuestionsSection component | `src/components/reflection/RecallQuestionsSection.tsx` | #23, #26, #114 | "Turn into recall questions" button. On click: generates 3–5 questions. Collapsible list with show/hide answers. | M |
| 123 | ConfusionClarifications component | `src/components/reflection/ConfusionClarifications.tsx` | #26 | Lists confusion flags from the reader session with AI-generated clarifications for each flagged passage. | M |
| 124 | ⚡ Reflection page | `src/app/(app)/reflect/[bookId]/[chId]/page.tsx` | #21, #115, #116, #117, #119, #121, #122, #123 | Clean focused layout. Sections: header, user summary, AI prompts, connections, recall questions, confusion clarifications. Save button + navigation (next chapter / book detail / library). | L |

### RSVP Reader

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 125 | RSVP timing utilities | `src/lib/utils/rsvp-utils.ts` | #74 | Functions: `calculateWordDuration(word, baseWpm)` with smart pausing (punctuation delays, long-word slowdown, paragraph breaks). `findORP(word)` — optimal recognition point (roughly 30% into word). | M |
| 126 | useRSVPPlayer hook | `src/hooks/useRSVPPlayer.ts` | #71, #74, #125 | Timer-based word advancement. Controls: play, pause, seek to word index, setWPM. Reads words from chapter text, advances with calculated delay per word. Updates readerStore.currentWordIndex. | L |
| 127 | RSVPDisplay component | `src/components/reader/RSVPDisplay.tsx` | #71, #125 | Centered word display, large font. ORP character highlighted in --accent. Fixed vertical position. Fade-in transition for each word. | M |
| 128 | RSVPContextLine component | `src/components/reader/RSVPContextLine.tsx` | #71, #74 | Current sentence displayed in muted text below the RSVP word. Provides reading context. | S |
| 129 | WPMControl component | `src/components/reader/WPMControl.tsx` | #71, #126 | WPM display (JetBrains Mono) + preset buttons: Focus 200, Normal 300, Sprint 450. Slider for fine control. | M |
| 130 | RSVP scrub bar | `src/components/reader/RSVPScrubBar.tsx` | #71, #126 | Word-position scrub bar (not waveform). Progress = currentWordIndex / totalWords. Drag to seek. Word count labels. | M |
| 131 | Mode toggle (Narration ↔ RSVP) | `src/components/reader/ModeToggle.tsx` | #71 | Pill toggle in reader top bar. Switches mode in readerStore. When switching: preserves approximate position (match word index to audio time or vice versa). | M |
| 132 | Update reader top bar for mode toggle | `src/components/reader/ReaderTopBar.tsx` | #80, #131 | Enable mode toggle pill (was disabled in MVP1). Show appropriate controls per mode. | S |
| 133 | ⚡ Update reader page for RSVP | `src/app/(reader)/read/[bookId]/[chId]/page.tsx` | #95, #126, #127, #128, #129, #130, #131 | Conditionally render narration or RSVP UI based on readerStore.mode. All shared features (checkpoints, confusion flags, paragraph view, sentence replay) work in both modes. RSVP progress saves rsvp_progress_word. | L |

### Reflection Integration in Reader

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 134 | Update chapter completion for reflection | `src/components/reader/ChapterComplete.tsx` | #90, #124 | Enable "Reflect on this chapter" button → navigates to /reflect/:bookId/:chId. | S |
| 135 | Update book detail for reflections | `src/components/book-detail/BookHeader.tsx` | #66, #115 | Show reflection badges on chapters that have reflections. Add "Reflections" section below chapter list. | M |

### MVP2 Polish

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 136 | Voice-to-text utility hook | `src/hooks/useVoiceToText.ts` | — | Web Speech API wrapper. Returns: transcript, isListening, start, stop. Used in reflection summary and journal freeform. | M |
| 137 | Regenerate types after MVP2 migrations | `src/types/database.ts` | #106, #107 | Regenerate Supabase TypeScript types to include distillations and reflections tables. | S |
| 138 | Update Zod schemas for MVP2 | `src/lib/schemas.ts` | #13, #137 | Add Zod schemas for Distillation and Reflection. Update Book schema processing_status enum to include `distilling`. | S |
| 139 | Update BookCard for theme tags | `src/components/library/BookCard.tsx` | #49 | Show 1–2 theme tag pills on book card when available (after distillation). | S |
| 140 | Update book detail for distillation data | `src/app/(app)/library/[bookId]/page.tsx` | #70, #106 | Show AI summary, theme tags in BookHeader. Show distillation availability per chapter. | S |
| 141 | Confusion flag clarification API | `src/app/api/reflections/clarify/route.ts` | #108 | POST: Takes passage text + confusion context → GPT-4o-mini generates plain-language clarification. | M |
| 142 | Auto-save reflection on skip | `src/lib/utils/reflection-utils.ts` | #108 | When user skips reflection, auto-save minimal reflection with AI-generated summary from distillation. No nagging. | S |
| 143 | Update processing status for distilling | `src/components/library/ProcessingBadge.tsx` | #50 | Add "distilling" state with appropriate icon/text. | S |
| 144 | Chapter detail API update | `src/app/api/books/[id]/chapters/[chId]/route.ts` | #72, #106 | Include distillation data in chapter response when available. | S |
| 145 | Update chapter list for reflection badges | `src/components/book-detail/ChapterList.tsx` | #67, #107 | Show small badge on chapters that have saved reflections. | S |

---

## Phase 3: MVP3 — Journal + Personalization + Insights (Tasks 146–195)

### Database Migrations (MVP3)

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 146 | ⚡ Create journal_entries table migration | Supabase migration | #29, #31 | Journal entries table with all columns. vector(1536) for embedding. Unique constraint on (user_id, date). RLS: user owns their entries. | M |
| 147 | ⚡ Create theme_threads table migration | Supabase migration | #29 | Theme threads table. Enums for pattern_type and status. RLS: user owns their threads. | M |
| 148 | Regenerate types after MVP3 migrations | `src/types/database.ts` | #146, #147 | Regenerate Supabase TypeScript types. | S |
| 149 | Update Zod schemas for MVP3 | `src/lib/schemas.ts` | #138, #148 | Add Zod schemas for JournalEntry and ThemeThread. Enums for pattern_type, thread_status. | S |

### Daily Journal

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 150 | Journal prompts API route | `src/app/api/journal/prompts/route.ts` | #10, #108, #146 | GET: Generate today's behavior prompt, theme prompt, identity prompt. Uses recent reading + focus areas + coach tone + last 3 entries. GPT-4o-mini. | L |
| 151 | Journal today API routes | `src/app/api/journal/today/route.ts` | #9, #13, #146 | GET: Fetch today's entry or return empty with generated prompts. POST: Create today's entry. PATCH: Update existing entry fields. | M |
| 152 | AI reflection API route | `src/app/api/journal/today/reflect/route.ts` | #10, #108, #146 | POST: Generate AI pattern reflection from current entry + last 5 entries + active threads. Returns 2–4 sentences with pattern observation + open question. Respects coach tone. | L |
| 153 | Micro-experiment API route | `src/app/api/journal/today/experiment/route.ts` | #10, #108, #146 | POST: Generate one specific, low-stakes micro-experiment based on entry content + focus areas. One-rep, actionable. | M |
| 154 | Experiment outcome API route | `src/app/api/journal/today/experiment-outcome/route.ts` | #9, #13, #146 | PATCH: Save experiment_outcome on journal entry. | S |
| 155 | Journal entries list API route | `src/app/api/journal/route.ts` | #9, #13, #146 | GET: List past journal entries. Query: date range, theme thread ID. Returns condensed entries (no full freeform). | S |
| 156 | Crisis detection utility | `src/lib/utils/crisis-utils.ts` | — | Keyword matching for self-harm, suicidal ideation, crisis language. Returns boolean flag. Errs on false positives. List of crisis resource contacts. | M |
| 157 | useJournalToday hook | `src/hooks/useJournalToday.ts` | #8 | React Query hook: `useJournalToday()` → fetches today's entry. 1-min stale time. Mutation for saving/updating. | S |
| 158 | EmotionalCheckin component | `src/components/journal/EmotionalCheckin.tsx` | #14 | Row of 6–8 emoji/word options (calm, anxious, energized, tired, hopeful, frustrated, grateful, curious). Select one. Custom input option. | M |
| 159 | BehaviorCheckin component | `src/components/journal/BehaviorCheckin.tsx` | #24, #14 | AI-generated prompt displayed with attribution ("Based on Chapter 4…"). Text input for response. | S |
| 160 | ThemeQuestion component | `src/components/journal/ThemeQuestion.tsx` | #24, #14 | Deeper AI-generated prompt + attribution. Text input. "go deeper" pill if identity prompt available. | S |
| 161 | IdentityPrompt component | `src/components/journal/IdentityPrompt.tsx` | #24, #14 | Conditionally rendered for self-help books. "go deeper" tag. Textarea for response. | S |
| 162 | FreeformEntry component | `src/components/journal/FreeformEntry.tsx` | #24, #136 | Large auto-grow textarea. Voice-to-text button. Word count indicator. The main event — largest visual section. | M |
| 163 | ExperimentFollowup component | `src/components/journal/ExperimentFollowup.tsx` | #24, #26 | Shown if yesterday's entry had an accepted experiment. "How did it go?" textarea. Saves experiment_outcome. | S |
| 164 | AIReflectionCard component | `src/components/journal/AIReflectionCard.tsx` | #26 | Appears after save with 300ms fade-in. Left border colored by pattern type. 2–4 sentences of observation + open question. Never clinical. Always exploratory. | M |
| 165 | MicroExperimentCard component | `src/components/journal/MicroExperimentCard.tsx` | #26, #23 | --accent-subtle background. Shows experiment text. Three buttons: "I'll try it" / "Modify" / "Skip". Modify opens inline text edit. | M |
| 166 | CrisisResourceCard component | `src/components/journal/CrisisResourceCard.tsx` | #26 | Static card: 988 Suicide & Crisis Lifeline, Crisis Text Line. Calm, factual, not alarming. Replaces AI reflection when crisis detected. | S |
| 167 | PastEntriesList component | `src/components/journal/PastEntriesList.tsx` | #26 | Collapsed entry cards: date + emoji + freeform preview (truncated). Tap expands full entry. Searchable by date. | M |
| 168 | ⚡ Journal page | `src/app/(app)/journal/page.tsx` | #21, #157, #158, #159, #160, #161, #162, #163, #164, #165, #166, #167, #156 | Single-column layout. Sections in order: emotional check-in → behavior → theme → identity (conditional) → experiment follow-up (conditional) → freeform → save button. After save: AI reflection card → micro-experiment card. Past entries below. Crisis detection runs on save. | XL |

### Theme Threads

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 169 | Theme detection utility | `src/lib/processing/theme-detection.ts` | #108, #147 | Cosine similarity between journal entry embeddings and distillation embeddings. Threshold 0.82 across 3+ entries and 2+ chapters. Cluster into labeled threads with GPT-4o-mini. | L |
| 170 | Theme detection API route | `src/app/api/internal/theme-detect/route.ts` | #10, #169, #147 | POST (cron at 2 AM UTC): For each active user, run theme detection. Create/update theme threads. Generate label, description, pattern_type, root_belief. | L |
| 171 | Themes list API route | `src/app/api/themes/route.ts` | #9, #13, #147 | GET: List user's active theme threads with description, connection counts, last surfaced date. | S |
| 172 | Theme dismiss API route | `src/app/api/themes/[id]/dismiss/route.ts` | #9, #147 | POST: Set thread status to "dismissed". | S |
| 173 | Manual theme detection trigger | `src/app/api/themes/detect/route.ts` | #9, #169 | POST: Run theme detection for current user on demand (for testing / user trigger). | S |
| 174 | useThemeThreads hook | `src/hooks/useThemeThreads.ts` | #8 | React Query hook: `useThemeThreads()` → fetches active themes. 10-min stale time. | S |
| 175 | ThemeThreadCard component | `src/components/themes/ThemeThreadCard.tsx` | #26, #14 | Card showing thread label, description, pattern_type badge, connection count (X entries, Y chapters), dismiss action. | M |
| 176 | ThemeThreadDetail component | `src/components/themes/ThemeThreadDetail.tsx` | #26, #14 | Expanded view: all related journal entries (dates + previews) and chapter passages. Root belief if available. Experiment history. | M |
| 177 | JournalThreadCallout component | `src/components/journal/JournalThreadCallout.tsx` | #26 | Gentle callout after journal save: "You've been thinking about [thread label]… Explore this thread →". Subtle, not intrusive. | S |

### Personalization

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 178 | Prompt personalization utility | `src/lib/utils/personalization-utils.ts` | #108 | Functions to build AI prompt context: include last 3 entry summaries (if opted in), coach tone system prompt prefix, focus areas as context. | M |
| 179 | Coach tone prompt templates | `src/lib/prompts/coach-tones.ts` | — | System prompt fragments for direct, gentle, analytical tones. Used in all AI generation calls (reflections, journal prompts, experiments). | S |
| 180 | Privacy controls enforcement | `src/lib/utils/privacy-utils.ts` | #14 | Utility functions: `shouldPersonalize(user)`, `shouldDeleteRawText(user)`, `isLocalJournalOnly(user)`. Called before AI generation and storage operations. | S |
| 181 | Raw text deletion job | `src/app/api/internal/cleanup/route.ts` | #10, #31, #106 | POST: For users with delete_raw_text=true, clear raw_text from chapters after distillation is complete. Runs after distillation. | S |

### Daily Journal Cron

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 182 | Journal prompt generation cron | `src/app/api/internal/daily-journal-gen/route.ts` | #10, #108, #150, #178, #179 | POST (cron at midnight UTC): For each active user, generate behavior_prompt, theme_prompt, identity_prompt based on recent reading + focus areas + coach tone + last 3 entries. Pre-generate and store so journal page loads fast. | L |

### Insights Dashboard

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 183 | Reading stats API route | `src/app/api/insights/reading-stats/route.ts` | #9, #32, #30, #146 | GET: Aggregate total reading time, books finished, words consumed, avg speed. | M |
| 184 | Sessions API route | `src/app/api/insights/sessions/route.ts` | #9, #32 | GET: Reading session history for charts. Grouped by day. Minutes and mode per session. | S |
| 185 | Comprehension API route | `src/app/api/insights/comprehension/route.ts` | #9, #32 | GET: Comprehension checkpoint ratings over time. % "Got it" per session/week. | S |
| 186 | Streaks API route | `src/app/api/insights/streaks/route.ts` | #9, #32, #146 | GET: Current reading streak (consecutive days with sessions) and journaling streak (consecutive days with entries). | M |
| 187 | useInsights hook | `src/hooks/useInsights.ts` | #8 | React Query hook: `useInsights()` → fetches reading stats, sessions, streaks. 5-min stale time. | S |
| 188 | StatCards component | `src/components/insights/StatCards.tsx` | #26, #14 | 4 stat cards in a 2×2 grid: total time (formatted), books finished, reading streak, journaling streak. Numbers in JetBrains Mono. No fire emoji, no gamification. Quiet facts. | M |
| 189 | ReadingTimeChart component | `src/components/insights/ReadingTimeChart.tsx` | #14 | Bar chart: minutes/day for last 30 days. Color-coded by mode (narration vs RSVP). Use a lightweight chart lib (recharts or Chart.js via react-chartjs-2). | L |
| 190 | SpeedTrendChart component | `src/components/insights/SpeedTrendChart.tsx` | #14 | Line chart: avg reading/narration speed over time. | M |
| 191 | ComprehensionChart component | `src/components/insights/ComprehensionChart.tsx` | #14 | Line chart: % "Got it" checkpoints per session/week over time. | M |
| 192 | ⚡ Insights page | `src/app/(app)/insights/page.tsx` | #21, #187, #188, #189, #190, #191, #174, #175, #176 | Layout: stat cards top → reading time chart → speed trend → comprehension → theme threads section (list of ThemeThreadCards with expand-to-detail). | L |

### Landing Page

| # | Task | File Path | Deps | Description | Size |
|---|------|-----------|------|-------------|------|
| 193 | Word-highlighting animation demo | `src/components/landing/WordHighlightDemo.tsx` | #6 | Animated component: text paragraph where words highlight sequentially (simulating the reader). Auto-playing, looping. Uses CSS animations. | M |
| 194 | Landing page sections | `src/components/landing/` (Hero, HowItWorks, Features, SocialProof, FooterCTA) | #23, #26, #193 | Hero: headline (Instrument Serif 4xl) + subheadline + CTA button + WordHighlightDemo. HowItWorks: 3-step visual (Upload → Listen → Reflect). Features: 4 cards. SocialProof: placeholder. FooterCTA: final CTA + links. | L |
| 195 | Landing page | `src/app/page.tsx` | #17, #194 | Public page. If logged in → redirect to /library. Sections: hero, how it works, features, social proof, footer CTA. SEO metadata. | M |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 195 |
| **Phase 0 (Setup)** | 28 tasks |
| **MVP1 (Narrated Reader)** | 77 tasks (#29–#105) |
| **MVP2 (Reflection + RSVP)** | 40 tasks (#106–#145) |
| **MVP3 (Journal + Insights)** | 50 tasks (#146–#195) |
| **S tasks** | 78 |
| **M tasks** | 79 |
| **L tasks** | 33 |
| **XL tasks** | 5 |
| **⚡ Blocker tasks** | 30 |

### Estimated Hours

| Size | Count | Hours Each | Subtotal |
|------|-------|-----------|----------|
| S (< 1 hr) | 78 | 0.75 | 58.5 |
| M (1–3 hrs) | 79 | 2.0 | 158.0 |
| L (3–8 hrs) | 33 | 5.0 | 165.0 |
| XL (8+ hrs) | 5 | 10.0 | 50.0 |
| **Total** | **195** | | **~431 hours** |

### Critical Path

The longest dependency chain from start to finish:

```
#1 (Init) → #2 (Deps) → #5 (Tailwind) → #6 (CSS) → #8 (Client)
→ #15 (Query Provider) → #17 (Root Layout) → #21 (App Layout)
→ #30 (Books table) → #31 (Chapters table) → #55 (Upload API)
→ #59 (Process-book) → #106 (Distillations table)
→ #109 (Distill API) → #111 (Pipeline update)
→ #146 (Journal table) → #150 (Journal prompts API)
→ #152 (AI reflection API) → #169 (Theme detection)
→ #170 (Theme cron) → #192 (Insights page) → #195 (Landing page)
```

**Critical path length: 22 tasks**
**Critical path estimated hours: ~95 hours**

> [!TIP]
> Many tasks can be parallelized. For example, while database migrations (#29–#33) are in progress, UI components (#23–#28) can be built simultaneously. The reader's sub-components (#79–#90) can all be built in parallel once the store (#71) and hooks (#77, #78) exist.

> [!IMPORTANT]
> Tasks marked with ⚡ are blockers for multiple downstream tasks. Prioritize these to unblock parallel work streams.
