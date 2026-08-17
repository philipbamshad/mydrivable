import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server side entitlement checks. The client UI also gates Pro features for a
 * nicer experience, but these functions are the authoritative enforcement point
 * so a modified client or a direct API call cannot bypass the paywall.
 */

export const FREE_CHAT_LIFETIME_LIMIT = 5;

type AnyClient = SupabaseClient<Database>;

type FreeUsageShape = {
  chat: number;
  exam: number;
  pillars: Record<string, number>;
};

function toInt(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** Mirrors the client rule: an active, trialing, past due, or not yet expired canceled row grants Pro. */
export async function isProUser(supabase: AnyClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return false;
  const row = data as { status: string; current_period_end: string | null };
  const periodOk =
    !row.current_period_end || new Date(row.current_period_end) > new Date();
  if (!periodOk) return false;
  return (
    row.status === "active" ||
    row.status === "trialing" ||
    row.status === "past_due" ||
    row.status === "canceled"
  );
}

async function readFreeUsage(
  supabase: AnyClient,
  userId: string,
): Promise<FreeUsageShape> {
  const { data } = await supabase
    .from("user_profiles")
    .select("free_usage")
    .eq("user_id", userId)
    .maybeSingle();

  const raw = (data?.free_usage ?? {}) as Partial<FreeUsageShape> | null;
  const pillarsRaw =
    raw && typeof raw.pillars === "object" && raw.pillars ? raw.pillars : {};
  return {
    chat: toInt(raw?.chat),
    exam: toInt(raw?.exam),
    pillars: Object.fromEntries(
      Object.entries(pillarsRaw).map(([k, v]) => [k, toInt(v)]),
    ),
  };
}

export type ChatQuota =
  | { allowed: true; isPro: boolean; used: number }
  | { allowed: false; reason: string; used: number; limit: number };

/**
 * Authoritative free tier check for the AI chat endpoint. Pro users pass
 * through untouched; free users consume one lifetime credit per accepted call
 * and the counter is written server side so it cannot be rolled back by the
 * browser.
 */
export async function consumeChatCredit(
  supabase: AnyClient,
  userId: string,
): Promise<ChatQuota> {
  if (await isProUser(supabase, userId)) {
    return { allowed: true, isPro: true, used: 0 };
  }

  const usage = await readFreeUsage(supabase, userId);
  if (usage.chat >= FREE_CHAT_LIFETIME_LIMIT) {
    return {
      allowed: false,
      reason:
        "You have used all 5 free lifetime AI coach questions. Upgrade to the Pro Pass for unlimited chat.",
      used: usage.chat,
      limit: FREE_CHAT_LIFETIME_LIMIT,
    };
  }

  const next: FreeUsageShape = { ...usage, chat: usage.chat + 1 };
  await supabase
    .from("user_profiles")
    .upsert(
      { user_id: userId, free_usage: next as never },
      { onConflict: "user_id" },
    );

  return { allowed: true, isPro: false, used: next.chat };
}
