/**
 * Supabase database types.
 *
 * In production, regenerate with: npx supabase gen types typescript --local > src/types/database.ts
 * This is a placeholder until the Supabase project is connected.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          focus_areas: string[];
          coach_tone: "direct" | "gentle" | "analytical";
          narration_speed: number;
          preferred_voice: string;
          journal_personalization: boolean;
          local_journal_only: boolean;
          delete_raw_text: boolean;
          onboarding_complete: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string | null;
          cover_url: string | null;
          source_file_url: string;
          source_format: "epub" | "pdf";
          total_words: number;
          estimated_listen_mins: number;
          estimated_rsvp_mins: number;
          theme_tags: string[];
          ai_summary: string | null;
          processing_status: "uploading" | "extracting" | "distilling" | "ready" | "error";
          processing_error: string | null;
          created_at: string;
          finished_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["books"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["books"]["Row"]>;
      };
      chapters: {
        Row: {
          id: string;
          book_id: string;
          title: string | null;
          sort_order: number;
          word_count: number;
          raw_text: string | null;
          audio_url: string | null;
          audio_timestamps: Json | null;
          reading_status: "unread" | "in_progress" | "completed";
          listen_progress_ms: number;
          rsvp_progress_word: number;
          last_read_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["chapters"]["Row"]> & {
          book_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["chapters"]["Row"]>;
      };
      reading_sessions: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          mode: "narration" | "rsvp";
          started_at: string;
          ended_at: string | null;
          duration_seconds: number;
          words_consumed: number;
          avg_speed: number;
          comprehension_ratings: Json;
        };
        Insert: Partial<Database["public"]["Tables"]["reading_sessions"]["Row"]> & {
          user_id: string;
          chapter_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["reading_sessions"]["Row"]>;
      };
      distillations: {
        Row: {
          id: string;
          chapter_id: string;
          summary: string;
          key_terms: string[];
          claims: string[];
          application_angles: string[];
          identity_beliefs: string[];
          payoff_questions: string[];
          embedding: number[] | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["distillations"]["Row"]> & {
          chapter_id: string;
          summary: string;
        };
        Update: Partial<Database["public"]["Tables"]["distillations"]["Row"]>;
      };
      reflections: {
        Row: {
          id: string;
          chapter_id: string;
          user_id: string;
          ai_prompts: Json;
          prompt_responses: Json;
          user_summary: string | null;
          ai_connections: Json;
          recall_questions: Json;
          recall_answers: Json;
          confusion_clarifications: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reflections"]["Row"]> & {
          chapter_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["reflections"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_distillations: {
        Args: {
          query_embedding: number[];
          match_count?: number;
          filter_book_id?: string;
        };
        Returns: {
          id: string;
          chapter_id: string;
          summary: string;
          key_terms: string[];
          similarity: number;
        }[];
      };
    };
    Enums: {
      processing_status: "uploading" | "extracting" | "distilling" | "ready" | "error";
      reading_status: "unread" | "in_progress" | "completed";
      coach_tone: "direct" | "gentle" | "analytical";
      reading_mode: "narration" | "rsvp";
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
