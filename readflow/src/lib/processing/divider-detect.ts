interface DividerResult {
  pattern: RegExp;
  count: number;
  name: string;
}

/**
 * Detect consistent visual dividers between sections in book text.
 * Returns the most common divider pattern if found (≥3 occurrences).
 */
export function detectDividerPattern(text: string): DividerResult | null {
  const candidates = [
    { regex: /\n\s*\. \. \.\s*\r?\n/g, name: "spaced-dots" },
    { regex: /\n\s*\.\.\.\s*\r?\n/g, name: "ellipsis" },
    { regex: /\n\s*\*\s*\*\s*\*\s*\r?\n/g, name: "asterisks" },
    { regex: /\n\s*\* \* \*\s*\r?\n/g, name: "spaced-asterisks" },
    { regex: /\n\s*---+\s*\r?\n/g, name: "dashes" },
    { regex: /\n\s*___+\s*\r?\n/g, name: "underscores" },
    { regex: /\n\s*~~~+\s*\r?\n/g, name: "tildes" },
    { regex: /\n\s*•\s*•\s*•\s*\r?\n/g, name: "bullets" },
    { regex: /\f/g, name: "form-feed" },
  ];

  let best: DividerResult | null = null;

  for (const c of candidates) {
    const matches = text.match(c.regex);
    if (matches && matches.length >= 3) {
      if (!best || matches.length > best.count) {
        best = { pattern: c.regex, count: matches.length, name: c.name };
      }
    }
  }

  return best;
}
