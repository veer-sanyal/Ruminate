-- Reflections: user responses to AI-generated reflection prompts
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_prompts JSONB NOT NULL DEFAULT '[]',
  prompt_responses JSONB NOT NULL DEFAULT '[]',
  user_summary TEXT,
  ai_connections JSONB NOT NULL DEFAULT '[]',
  recall_questions JSONB NOT NULL DEFAULT '[]',
  recall_answers JSONB NOT NULL DEFAULT '[]',
  confusion_clarifications JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One reflection per user per chapter
CREATE UNIQUE INDEX IF NOT EXISTS reflections_user_chapter_idx
  ON reflections(user_id, chapter_id);

-- RLS: user owns their reflections
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections"
  ON reflections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reflections"
  ON reflections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reflections"
  ON reflections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reflections"
  ON reflections FOR DELETE
  USING (user_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
