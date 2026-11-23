import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { queryOptions } from "@tanstack/react-query";

export const getExamHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("mock_test_history")
      .select("id, score_pct, state, created_at").eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Unable to load exam attempts.");
    return data ?? [];
  });

export const examHistoryOptions = (userId: string) => queryOptions({
  queryKey: ["mock-exam-history", userId], queryFn: () => getExamHistory(),
});