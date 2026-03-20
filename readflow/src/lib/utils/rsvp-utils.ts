/**
 * RSVP (Rapid Serial Visual Presentation) utilities.
 */

/**
 * Calculate display duration for a word based on WPM and smart pausing rules.
 */
export function calculateWordDuration(word: string, baseWpm: number): number {
  const baseDuration = 60000 / baseWpm; // ms per word at base speed

  let multiplier = 1.0;

  // Long words get extra time
  if (word.length > 8) {
    multiplier += 0.3;
  } else if (word.length > 6) {
    multiplier += 0.15;
  }

  // Punctuation pauses
  const lastChar = word[word.length - 1];
  if (lastChar === "." || lastChar === "!" || lastChar === "?") {
    multiplier += 0.6; // sentence end — significant pause
  } else if (lastChar === "," || lastChar === ";") {
    multiplier += 0.3; // clause break
  } else if (lastChar === ":" || lastChar === "—") {
    multiplier += 0.4;
  }

  // Opening quotes/parens get a small pause
  if (word[0] === '"' || word[0] === "(" || word[0] === "'") {
    multiplier += 0.1;
  }

  return Math.round(baseDuration * multiplier);
}

/**
 * Calculate paragraph break duration.
 */
export function calculateParagraphBreak(baseWpm: number): number {
  return Math.round((60000 / baseWpm) * 1.5);
}

/**
 * Find the Optimal Recognition Point (ORP) in a word.
 * The ORP is the character the eye should fixate on — roughly 30% through the word,
 * biased slightly left.
 */
export function findORP(word: string): number {
  // Strip leading punctuation for calculation
  const stripped = word.replace(/^[^a-zA-Z0-9]+/, "");
  const offset = word.length - stripped.length;

  if (stripped.length <= 1) return offset;
  if (stripped.length <= 3) return offset + 1;

  // ~30% through the word, 0-indexed
  return offset + Math.floor(stripped.length * 0.3);
}

/**
 * WPM presets for the RSVP reader.
 */
export const WPM_PRESETS = [
  { label: "Focus", wpm: 200 },
  { label: "Normal", wpm: 300 },
  { label: "Sprint", wpm: 450 },
] as const;
