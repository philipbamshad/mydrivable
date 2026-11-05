import { describe, expect, it } from "vitest";
import { consumeChatCredit, FREE_CHAT_DAILY_LIMIT } from "./entitlements.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
function client(used: number | null) {
  const chain = { select: () => chain, eq: () => chain, order: () => chain, limit: () => chain, maybeSingle: async () => ({ data: null, error: null }) };
  return { from: () => chain, rpc: async (name: string) => ({ data: name === 'get_daily_coach_used' ? 5 : used, error: null }) } as unknown as SupabaseClient<Database>;
}
describe("AI Coach daily limit", () => {
  it("allows the fifth accepted question", async () => {
    expect(FREE_CHAT_DAILY_LIMIT).toBe(5);
    expect(await consumeChatCredit(client(5), "user")).toMatchObject({ allowed: true, used: 5 });
  });
  it("denies any question beyond five", async () => {
    expect(await consumeChatCredit(client(null), "user")).toMatchObject({ allowed: false, used: 5, limit: 5 });
  });
});