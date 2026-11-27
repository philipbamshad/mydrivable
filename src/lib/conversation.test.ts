import { expect, it } from "vitest";
import { uniqueConversationMessages } from "./conversation";

const row = (id: string, created_at: string) => ({ id, role: "user", parts: [{ type: "text", text: "Same question" }], created_at });

it("removes an immediate duplicate user write but keeps a deliberate later repeat", () => {
  const rows = [row("1", "2026-11-27T05:00:00Z"), row("2", "2026-11-27T05:00:02Z"), row("3", "2026-11-27T05:01:00Z")];
  expect(uniqueConversationMessages(rows).map(message => message.id)).toEqual(["1", "3"]);
});
