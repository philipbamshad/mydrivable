import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function userClient(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_thread_messages",
  title: "Get thread messages",
  description: "Get all messages in one of the signed-in user's Drivable chat threads.",
  inputSchema: {
    threadId: z.string().uuid().describe("Thread ID from list_threads."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ threadId }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = userClient(ctx);
    const { data: thread, error: tErr } = await supabase
      .from("threads")
      .select("id")
      .eq("id", threadId)
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (tErr) return { content: [{ type: "text", text: tErr.message }], isError: true };
    if (!thread) return { content: [{ type: "text", text: "Thread not found" }], isError: true };

    const { data, error } = await supabase
      .from("messages")
      .select("id, role, parts, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { messages: data ?? [] },
    };
  },
});
