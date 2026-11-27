export type ConversationMessageRow = {
  id: string;
  role: string;
  parts: unknown;
  created_at: string;
};

const DUPLICATE_WINDOW_MS = 15_000;

export function isDuplicateUserMessage(previous: Pick<ConversationMessageRow, "role" | "parts" | "created_at"> | null | undefined, next: Pick<ConversationMessageRow, "role" | "parts" | "created_at">): boolean {
  if (!previous || previous.role !== "user" || next.role !== "user") return false;
  const elapsed = Math.abs(Date.parse(next.created_at) - Date.parse(previous.created_at));
  return Number.isFinite(elapsed) && elapsed <= DUPLICATE_WINDOW_MS && JSON.stringify(previous.parts) === JSON.stringify(next.parts);
}

/** Hide only immediate accidental write duplicates; deliberate repeated questions remain visible. */
export function uniqueConversationMessages<T extends ConversationMessageRow>(rows: T[]): T[] {
  return rows.filter((row, index) => !isDuplicateUserMessage(rows[index - 1], row));
}
