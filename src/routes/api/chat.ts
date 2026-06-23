import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { DRIVEGUIDE_SYSTEM_PROMPT } from "@/lib/system-prompt";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Body = { messages?: UIMessage[]; threadId?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = (await request.json()) as Body;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("messages and threadId are required", { status: 400 });
        }

        const apiKey = process.env.LOVABLE_API_KEY;
        const url = process.env.SUPABASE_URL;
        const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!apiKey || !url || !pubKey) {
          return new Response("Server not configured", { status: 500 });
        }

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const supabase = createClient<Database>(url, pubKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });

        const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.claims.sub;

        // Verify the thread belongs to the user
        const { data: thread } = await supabase
          .from("threads")
          .select("id, title")
          .eq("id", threadId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        // Persist the latest user message (the last one in the incoming list)
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabase.from("messages").insert({
            thread_id: threadId,
            role: "user",
            parts: lastUser.parts as never,
          });
          // If thread title is still default, set it from the first user message.
          if (thread.title === "New chat") {
            const textPart = lastUser.parts.find(
              (p): p is { type: "text"; text: string } => p.type === "text",
            );
            const title =
              textPart?.text.replace(/\s+/g, " ").trim().slice(0, 60) || "New chat";
            await supabase.from("threads").update({ title }).eq("id", threadId);
          } else {
            await supabase
              .from("threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          }
        }

        const gateway = createLovableAiGatewayProvider(apiKey);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: DRIVEGUIDE_SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistant = [...finalMessages]
              .reverse()
              .find((m) => m.role === "assistant");
            if (assistant) {
              await supabase.from("messages").insert({
                thread_id: threadId,
                role: "assistant",
                parts: assistant.parts as never,
              });
              await supabase
                .from("threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);
            }
          },
        });
      },
    },
  },
});
