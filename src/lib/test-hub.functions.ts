import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { answerProgress, emptyTopic, type TopicProgress, type HubQuestion } from "./test-hub";

const topicSchema = z.enum(["signs", "intersections", "substances", "speed"]);
export const getHubProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ state: string; progress: TopicProgress }[]> => {
    const { data, error } = await context.supabase.from("test_hub_progress").select("state, topic, questions, last_score").eq("user_id", context.userId);
    if (error) throw new Error("Unable to load practice progress.");
    return (data ?? []).map(row => ({ state: row.state, progress: {
      topic: topicSchema.parse(row.topic), questions: row.questions as unknown as TopicProgress["questions"], lastScore: row.last_score,
    } }));
  });

export const hubProgressOptions = (userId: string) => queryOptions({
  queryKey: ["test-hub-progress", userId], queryFn: () => getHubProgress(),
});

export const saveHubProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    state: z.string().min(1).max(80), topic: topicSchema,
    answer: z.object({ question: z.custom<HubQuestion>(q => {
      if (!q || typeof q !== "object") return false;
      const value = q as HubQuestion;
      return typeof value.key === "string" && typeof value.q === "string" && Array.isArray(value.options) && value.options.every(o => typeof o === "string") && Number.isInteger(value.correct) && value.correct >= 0 && value.correct < value.options.length;
    }), correct: z.boolean() }).optional(),
    score: z.number().int().min(0).max(100).optional(),
  }).parse(input))
  .handler(async ({ data, context }): Promise<TopicProgress> => {
    const { data: row, error } = await context.supabase.from("test_hub_progress").select("questions, last_score").eq("user_id", context.userId).eq("state", data.state).eq("topic", data.topic).maybeSingle();
    if (error) throw new Error("Unable to save practice progress.");
    let progress: TopicProgress = row ? { topic: data.topic, questions: row.questions as unknown as TopicProgress["questions"], lastScore: row.last_score } : emptyTopic(data.topic);
    if (data.answer) progress = answerProgress(progress, data.answer.question, data.answer.correct);
    if (data.score !== undefined) progress = { ...progress, lastScore: data.score };
    const { error: writeError } = await context.supabase.from("test_hub_progress").upsert({
      user_id: context.userId, state: data.state, topic: data.topic,
      questions: JSON.parse(JSON.stringify(progress.questions)), last_score: progress.lastScore, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,state,topic" });
    if (writeError) throw new Error("Unable to save practice progress. Please try again.");
    return progress;
  });