import { GoogleGenAI } from "@google/genai";

/**
 * Shared Gemini AI client.
 * Uses GEMINI_API_KEY environment variable.
 */
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/** Model for complex tasks: distillation, reflection prompts, journal personalization */
export const MODEL_PRO = "gemini-3.1-pro-preview";

/** Model for simple/fast tasks: summaries, keyword extraction, basic generation */
export const MODEL_FLASH = "gemini-3-flash-preview";
