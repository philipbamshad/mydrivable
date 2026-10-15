// Variation engine.
//
// Multiplies any question pool by generating naturally worded rephrasings of
// each item. The answer options, correct index, explanation, and any sign
// artwork stay identical, so accuracy is preserved while the pool grows large
// enough that a learner keeps getting a brand new test every attempt. When the
// unseen tracker exhausts the base items it simply keeps drawing from these
// generated near duplicates.

type Anyish = { q: string } & Record<string, unknown>;

/**
 * Natural rephrasings of the question text. None of them add a header,
 * tag, or "Label:" prefix. Frames that mention a state are only used when
 * the learner has actually selected one; otherwise the neutral frame runs.
 */
const FRAMES: ((q: string, state: string | null) => string)[] = [
  (q) => q,
  (q, s) => (s ? `You are driving in ${s}. ${cap(q)}` : `You are driving on a public road. ${cap(q)}`),
  (q) => `During your morning drive, ${lower(q)}`,
  (q, s) => (s ? `On a ${s} road, ${lower(q)}` : `On a typical road, ${lower(q)}`),
  (q) => `While preparing for your written test, ${lower(q)}`,
  (q) => `Imagine you are behind the wheel. ${cap(q)}`,
];

/**
 * Remove conversational headers such as "Quick review:", "Note:",
 * "Question:", or "California permit exam:" from the start of a question.
 * Only short leading labels (up to 6 words) ending in a colon are stripped,
 * so real content like times ("3:00") is left alone.
 */
export function sanitizeQuestion(text: string): string {
  let out = (text ?? "").trim();
  const header = /^(?:[A-Za-z][\w'’-]*\s+){0,5}[A-Za-z][\w'’-]*\s*:\s+/;
  for (let i = 0; i < 3 && header.test(out); i++) out = out.replace(header, "");
  return out ? cap(out) : out;
}

function lower(s: string): string {
  if (!s) return s;
  // Keep acronyms and already lowercase text intact.
  if (s.slice(0, 3).toUpperCase() === s.slice(0, 3)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function cap(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Expand a pool by `factor` (1 keeps it as is). Variant 0 is always the
 * original wording, so the primary bank still reads exactly as authored.
 */
export function expandPool<T extends Anyish>(
  pool: T[],
  factor: number,
  stateName?: string | null,
): T[] {
  const state = stateName && stateName !== "Default" ? stateName : null;
  const rounds = Math.max(1, Math.min(factor, FRAMES.length));
  const seen = new Set<string>();
  const out: T[] = [];
  for (let r = 0; r < rounds; r++) {
    for (const item of pool) {
      const text = sanitizeQuestion(FRAMES[r % FRAMES.length](sanitizeQuestion(item.q), state));
      if (seen.has(text)) continue;
      seen.add(text);
      out.push({ ...item, q: text });
    }
  }
  return out;
}
