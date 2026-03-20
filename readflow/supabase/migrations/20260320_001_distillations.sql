-- Enable pgvector for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Distillations: AI-generated chapter summaries and metadata
CREATE TABLE IF NOT EXISTS distillations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL UNIQUE REFERENCES chapters(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_terms TEXT[] NOT NULL DEFAULT '{}',
  claims TEXT[] NOT NULL DEFAULT '{}',
  application_angles TEXT[] NOT NULL DEFAULT '{}',
  identity_beliefs TEXT[] NOT NULL DEFAULT '{}',
  payoff_questions TEXT[] NOT NULL DEFAULT '{}',
  embedding VECTOR(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS distillations_embedding_idx
  ON distillations USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS: user can access distillations through chapter -> book ownership
ALTER TABLE distillations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view distillations for their books"
  ON distillations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chapters c
      JOIN books b ON b.id = c.book_id
      WHERE c.id = distillations.chapter_id
      AND b.user_id = auth.uid()
    )
  );

-- RPC function for cosine similarity search across distillations
CREATE OR REPLACE FUNCTION match_distillations(
  query_embedding VECTOR(768),
  match_count INT DEFAULT 5,
  filter_book_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chapter_id UUID,
  summary TEXT,
  key_terms TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.chapter_id,
    d.summary,
    d.key_terms,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM distillations d
  JOIN chapters c ON c.id = d.chapter_id
  WHERE d.embedding IS NOT NULL
    AND (filter_book_id IS NULL OR c.book_id = filter_book_id)
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
