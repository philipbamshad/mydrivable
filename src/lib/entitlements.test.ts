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
  it("accepts a first credit returned by the new local-day bucket", async () => {
    expect(await consumeChatCredit(client(1), "user")).toMatchObject({ allowed: true, used: 1 });
  });
  it("Pro bypasses usage even after five questions", async () => {
    const chain={select:()=>chain,eq:()=>chain,order:()=>chain,limit:()=>chain,maybeSingle:async()=>({data:{status:'active',current_period_end:null},error:null})};
    const pro={from:()=>chain,rpc:async()=>{throw new Error('Pro must not consume a free credit');}} as unknown as SupabaseClient<Database>;
    expect(await consumeChatCredit(pro,'user')).toMatchObject({allowed:true,isPro:true,used:0});
  });
});