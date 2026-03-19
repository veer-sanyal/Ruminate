import { ai, MODEL_FLASH } from "@/lib/gemini";

interface RawSection {
  index: number;
  text: string;
}

interface LabeledSection {
  index: number;
  title: string;
  type: "front_matter" | "chapter" | "back_matter" | "unknown";
  include: boolean;
}

/**
 * Label raw sections by sending their opening lines to the LLM.
 * Returns structured labels with titles, types, and include/exclude flags.
 */
export async function labelSections(sections: RawSection[]): Promise<LabeledSection[]> {
  const previews = sections.map((s) => {
    const firstLines = s.text.trim().split("\n").slice(0, 5).join("\n").substring(0, 300);
    return `[Section ${s.index}]:\n${firstLines}`;
  }).join("\n\n---\n\n");

  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `You are analyzing sections extracted from a book. Below are the opening lines of each section.

For each section, determine:
1. A clean title (use the section's own heading if visible, otherwise create a descriptive title)
2. The type: "front_matter" (copyright, dedication, TOC, preface), "chapter" (main content), or "back_matter" (bibliography, acknowledgments, about author, index)
3. Whether to include it (false for: table of contents, copyright page, blank/very short sections under 100 words)

Return ONLY a JSON array, no other text:
[{"index": 0, "title": "Author's Note", "type": "front_matter", "include": true}, ...]

Sections:
${previews}`,
  });

  const text = response.text?.trim() ?? "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return sections.map((s, i) => ({
      index: i,
      title: `Section ${i + 1}`,
      type: "unknown" as const,
      include: true,
    }));
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return sections.map((s, i) => ({
      index: i,
      title: `Section ${i + 1}`,
      type: "unknown" as const,
      include: true,
    }));
  }
}
