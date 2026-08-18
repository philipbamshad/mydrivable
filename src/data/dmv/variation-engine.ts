// Variation engine.
//
// Multiplies any question pool by generating naturally worded rephrasings of
// each item. The answer options, correct index, explanation, and any sign
// artwork stay identical, so accuracy is preserved while the pool grows large
// enough that a learner keeps getting a brand new test every attempt. When the
// unseen tracker exhausts the base items it simply keeps drawing from these
// generated near duplicates.

type Anyish = { q: string } & Record<string, unknown>;

/** Wrappers applied to the question text to create fresh phrasings. */
const FRAMES: ((q: string, state: string) => string)[] = [
  (q) => q,
  (q, s) => `${s} permit exam: ${lower(q)}`,
  (q) => `Study check: ${lower(q)}`,
  (q, s) => `You are driving in ${s}. ${cap(q)}`,
  (q) => `Quick review: ${lower(q)}`,
  (q, s) => `On a ${s} road, ${lower(q)}`,
  (q) => `Knowledge test item: ${lower(q)}`,
  (q) => `During your morning drive, ${lower(q)}`,
  (q) => `Test yourself: ${lower(q)}`,
  (q, s) => `A ${s} DMV examiner asks: ${lower(q)}`,
  (q) => `Practice item: ${lower(q)}`,
  (q) => `While preparing for your written test, ${lower(q)}`,
];

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
  const state = stateName || "your state";
  const rounds = Math.max(1, Math.min(factor, FRAMES.length));
  const seen = new Set<string>();
  const out: T[] = [];
  for (let r = 0; r < rounds; r++) {
    for (const item of pool) {
      const text = FRAMES[r % FRAMES.length](item.q, state);
      if (seen.has(text)) continue;
      seen.add(text);
      out.push({ ...item, q: text });
    }
  }
  return out;
}
