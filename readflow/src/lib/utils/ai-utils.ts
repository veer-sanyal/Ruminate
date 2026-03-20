import { ai, MODEL_PRO, MODEL_FLASH } from "@/lib/gemini";
import type { ReflectionPrompt, RecallQuestion } from "@/types";

/**
 * Retry wrapper for AI calls.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

interface DistillationResult {
  summary: string;
  key_terms: string[];
  claims: string[];
  application_angles: string[];
  identity_beliefs: string[];
  payoff_questions: string[];
}

/**
 * Generate AI distillation of a chapter.
 * Uses Gemini Flash for speed.
 */
export async function generateDistillation(
  chapterText: string,
  bookContext: { title: string; author?: string | null }
): Promise<DistillationResult> {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `You are analyzing a chapter from "${bookContext.title}"${bookContext.author ? ` by ${bookContext.author}` : ""}.

Analyze the following chapter text and produce a structured distillation.

Chapter text:
---
${chapterText.slice(0, 12000)}
---

Respond with ONLY valid JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the chapter's main ideas",
  "key_terms": ["term1", "term2", ...],
  "claims": ["Main argument or claim 1", "Claim 2", ...],
  "application_angles": ["How this could be applied in real life 1", ...],
  "identity_beliefs": ["Belief or identity assumption in this chapter", ...],
  "payoff_questions": ["Question that this chapter raises for further thought", ...]
}

Guidelines:
- summary: 2-3 clear sentences capturing the essence
- key_terms: 5-10 important terms, concepts, or names
- claims: 3-5 central claims or arguments made
- application_angles: 2-4 practical applications
- identity_beliefs: 2-3 underlying beliefs or assumptions
- payoff_questions: 2-4 thought-provoking questions for the reader`,
    });

    const text = response.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in distillation response");

    const parsed = JSON.parse(jsonMatch[0]) as DistillationResult;

    return {
      summary: parsed.summary || "No summary generated.",
      key_terms: parsed.key_terms || [],
      claims: parsed.claims || [],
      application_angles: parsed.application_angles || [],
      identity_beliefs: parsed.identity_beliefs || [],
      payoff_questions: parsed.payoff_questions || [],
    };
  });
}

/**
 * Generate embedding for text using Gemini embedding model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  return withRetry(async () => {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text.slice(0, 8000),
    });

    const embedding = response.embeddings?.[0]?.values;
    if (!embedding) throw new Error("No embedding returned");
    return embedding;
  });
}

/**
 * Generate 3 reflection prompts at escalating depth levels.
 * Uses Gemini Pro for nuanced prompts.
 */
export async function generateReflectionPrompts(
  distillation: {
    summary: string;
    key_terms: string[];
    claims: string[];
    application_angles: string[];
    identity_beliefs: string[];
  },
  userProfile?: { focus_areas?: string[]; coach_tone?: string }
): Promise<ReflectionPrompt[]> {
  return withRetry(async () => {
    const toneGuide = userProfile?.coach_tone === "direct"
      ? "Be direct and challenging."
      : userProfile?.coach_tone === "analytical"
      ? "Be analytical and framework-oriented."
      : "Be warm and encouraging.";

    const focusContext = userProfile?.focus_areas?.length
      ? `The reader is particularly interested in: ${userProfile.focus_areas.join(", ")}.`
      : "";

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `You are a thoughtful reading coach creating reflection prompts for a reader who just finished a chapter.

Chapter summary: ${distillation.summary}
Key terms: ${distillation.key_terms.join(", ")}
Main claims: ${distillation.claims.join("; ")}
Application angles: ${distillation.application_angles.join("; ")}
${focusContext}

${toneGuide}

Create exactly 3 reflection prompts at escalating depth:

1. "surface" — A comprehension check. Did they get the main idea?
2. "analytical" — Asks them to evaluate, compare, or critique a claim
3. "personal" — Connects the material to their own life, values, or experiences

Respond with ONLY valid JSON array:
[
  {"depth": "surface", "prompt": "..."},
  {"depth": "analytical", "prompt": "..."},
  {"depth": "personal", "prompt": "..."}
]`,
    });

    const text = response.text ?? "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in prompts response");

    return JSON.parse(jsonMatch[0]) as ReflectionPrompt[];
  });
}

/**
 * Generate recall questions from a distillation.
 * Uses Gemini Flash for speed.
 */
export async function generateRecallQuestions(
  distillation: {
    summary: string;
    key_terms: string[];
    claims: string[];
  }
): Promise<RecallQuestion[]> {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Based on this chapter summary, generate 3-5 recall questions to test comprehension.

Summary: ${distillation.summary}
Key terms: ${distillation.key_terms.join(", ")}
Main claims: ${distillation.claims.join("; ")}

Respond with ONLY valid JSON array:
[
  {"question": "What is...?", "answer": "The answer is..."},
  ...
]

Questions should test factual recall and understanding, not opinion. Keep answers concise (1-2 sentences).`,
    });

    const text = response.text ?? "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in recall response");

    return JSON.parse(jsonMatch[0]) as RecallQuestion[];
  });
}

/**
 * Generate a plain-language clarification for a confusing passage.
 * Uses Gemini Flash.
 */
export async function generateConfusionClarification(
  passage: string,
  context: { chapterSummary?: string; bookTitle?: string }
): Promise<string> {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `A reader flagged the following passage as confusing${context.bookTitle ? ` while reading "${context.bookTitle}"` : ""}.

Passage: "${passage}"
${context.chapterSummary ? `Chapter context: ${context.chapterSummary}` : ""}

Provide a clear, plain-language explanation of what this passage means. Be concise (2-4 sentences). Don't patronize — explain as you would to an intelligent reader encountering this concept for the first time.`,
    });

    return response.text?.trim() ?? "Unable to generate clarification.";
  });
}
