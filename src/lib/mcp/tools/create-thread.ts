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
  name: "create_thread",
  title: "Create chat thread",
  description: "Create a new empty Drivable chat thread for the signed-in user.",
  inputSchema: {
    title: z.string().trim().min(1).max(120).optional().describe("Optional thread title."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = userClient(ctx);
    const { data, error } = await supabase
      .from("threads")
      .insert({ user_id: ctx.getUserId(), title: title ?? "New chat" })
      .select("id, title, phase, updated_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { thread: data },
    };
  },
});
