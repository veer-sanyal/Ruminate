import { z } from "zod";

/* ── Enums ── */

export const processingStatusSchema = z.enum([
  "uploading",
  "extracting",
  "distilling",
  "ready",
  "error",
]);

export const readingStatusSchema = z.enum([
  "unread",
  "in_progress",
  "completed",
]);

export const coachToneSchema = z.enum(["direct", "gentle", "analytical"]);

export const readingModeSchema = z.enum(["narration", "rsvp"]);

/* ── Users ── */

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  focus_areas: z.array(z.string()).default([]),
  coach_tone: coachToneSchema.default("gentle"),
  narration_speed: z.number().min(0.5).max(3).default(1.0),
  preferred_voice: z.string().default("alloy"),
  journal_personalization: z.boolean().default(true),
  local_journal_only: z.boolean().default(false),
  delete_raw_text: z.boolean().default(false),
  onboarding_complete: z.boolean().default(false),
  created_at: z.string().optional(),
});

export const updateUserSchema = userSchema
  .omit({ id: true, email: true, created_at: true })
  .partial();

/* ── Books ── */

export const bookSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  author: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  source_file_url: z.string().nullable().optional(),
  source_format: z.enum(["epub", "pdf"]).nullable().optional(),
  total_words: z.number().int().default(0),
  estimated_listen_mins: z.number().int().default(0),
  estimated_rsvp_mins: z.number().int().default(0),
  theme_tags: z.array(z.string()).default([]),
  ai_summary: z.string().nullable().optional(),
  processing_status: processingStatusSchema.default("uploading"),
  processing_error: z.string().nullable().optional(),
  created_at: z.string().optional(),
  finished_at: z.string().nullable().optional(),
});

export const createBookSchema = bookSchema.pick({
  title: true,
  author: true,
});

/* ── Chapters ── */

export const chapterSchema = z.object({
  id: z.string().uuid(),
  book_id: z.string().uuid(),
  title: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
  word_count: z.number().int().default(0),
  raw_text: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  audio_timestamps: z.any().nullable().optional(),
  reading_status: readingStatusSchema.default("unread"),
  listen_progress_ms: z.number().int().default(0),
  rsvp_progress_word: z.number().int().default(0),
  last_read_at: z.string().nullable().optional(),
});

/* ── Reading Sessions ── */

export const readingSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  chapter_id: z.string().uuid(),
  mode: readingModeSchema.default("narration"),
  started_at: z.string().optional(),
  ended_at: z.string().nullable().optional(),
  duration_seconds: z.number().int().default(0),
  words_consumed: z.number().int().default(0),
  avg_speed: z.number().default(1.0),
  comprehension_ratings: z.any().default([]),
});

/* ── Distillations ── */

export const distillationSchema = z.object({
  id: z.string().uuid(),
  chapter_id: z.string().uuid(),
  summary: z.string(),
  key_terms: z.array(z.string()).default([]),
  claims: z.array(z.string()).default([]),
  application_angles: z.array(z.string()).default([]),
  identity_beliefs: z.array(z.string()).default([]),
  payoff_questions: z.array(z.string()).default([]),
  embedding: z.array(z.number()).nullable().optional(),
  created_at: z.string().optional(),
});

/* ── Reflections ── */

export const reflectionPromptSchema = z.object({
  depth: z.enum(["surface", "analytical", "personal"]),
  prompt: z.string(),
});

export const reflectionConnectionSchema = z.object({
  chapter_id: z.string().uuid(),
  chapter_title: z.string(),
  similarity: z.number(),
  shared_themes: z.array(z.string()),
});

export const recallQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const reflectionSchema = z.object({
  id: z.string().uuid(),
  chapter_id: z.string().uuid(),
  user_id: z.string().uuid(),
  ai_prompts: z.array(reflectionPromptSchema).default([]),
  prompt_responses: z.array(z.string()).default([]),
  user_summary: z.string().nullable().optional(),
  ai_connections: z.array(reflectionConnectionSchema).default([]),
  recall_questions: z.array(recallQuestionSchema).default([]),
  recall_answers: z.array(z.string()).default([]),
  confusion_clarifications: z.array(z.object({
    passage: z.string(),
    clarification: z.string(),
  })).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/* ── Auth Forms ── */

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = loginSchema.extend({
  displayName: z.string().min(1, "Name is required").optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

/* ── Types ── */

export type ProcessingStatus = z.infer<typeof processingStatusSchema>;
export type ReadingStatus = z.infer<typeof readingStatusSchema>;
export type CoachTone = z.infer<typeof coachToneSchema>;
export type ReadingMode = z.infer<typeof readingModeSchema>;
export type User = z.infer<typeof userSchema>;
export type Book = z.infer<typeof bookSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type ReadingSession = z.infer<typeof readingSessionSchema>;
export type Distillation = z.infer<typeof distillationSchema>;
export type Reflection = z.infer<typeof reflectionSchema>;
export type ReflectionPrompt = z.infer<typeof reflectionPromptSchema>;
export type ReflectionConnection = z.infer<typeof reflectionConnectionSchema>;
export type RecallQuestion = z.infer<typeof recallQuestionSchema>;
