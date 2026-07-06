// Session-persistent "already seen" question tracker.
//
// Every quiz/test surface (pillar quizzes, full state permit exam, etc.)
// shares this helper so a question served in one attempt is not served
// again in the next attempt until the pool for that (category, state) is
// fully exhausted. When exhausted, history resets automatically and the
// next attempt starts fresh with a completely randomized order.

const STORAGE_KEY = "drivable-seen-questions-v1";

type Store = Record<string, string[]>;

function safeParse(raw: string | null): Store {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? (v as Store) : {};
  } catch {
    return {};
  }
}

function load(): Store {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function save(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full / disabled — degrade gracefully, tracking becomes per-session
  }
}

/** Stable string id for a question — hashes on the question text. */
export function questionId(q: { q: string }): string {
  let h = 2166136261;
  for (let i = 0; i < q.q.length; i++) {
    h ^= q.q.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function buildKey(category: string, stateName: string | null | undefined): string {
  return `${category}::${(stateName || "default").toLowerCase()}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` questions from `pool` that the user has NOT seen yet for the
 * (category, state) bucket. If fewer than `count` unseen remain, seen history
 * for that bucket is reset first so the pool starts fresh.
 *
 * Returns the picked questions in randomized order and records their ids so
 * subsequent calls skip them.
 */
export function pickUnseenQuestions<T extends { q: string }>(
  category: string,
  stateName: string | null | undefined,
  pool: T[],
  count: number,
): T[] {
  if (pool.length === 0) return [];
  const take = Math.min(count, pool.length);
  const key = buildKey(category, stateName);
  const store = load();
  let seen = new Set(store[key] ?? []);

  let unseen = pool.filter((q) => !seen.has(questionId(q)));

  // If we don't have enough unseen items left for a full test, reset the
  // history for this bucket so the next attempt starts fresh.
  if (unseen.length < take) {
    seen = new Set();
    unseen = pool.slice();
  }

  const picked = shuffle(unseen).slice(0, take);
  for (const q of picked) seen.add(questionId(q));

  store[key] = Array.from(seen);
  save(store);

  return picked;
}

/** Manually clear seen-question history for a bucket (e.g. debug reset). */
export function resetSeenQuestions(
  category: string,
  stateName: string | null | undefined,
) {
  const key = buildKey(category, stateName);
  const store = load();
  if (store[key]) {
    delete store[key];
    save(store);
  }
}
