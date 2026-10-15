import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { getThreadMessages } from "@/lib/threads.functions";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const Route = createFileRoute("/_authenticated/app/c/$threadId")({
  head: () => ({
    meta: [
      { title: "Coach Conversation | Drivable" },
      { name: "description", content: "Review your permit-prep conversation with the Drivable AI coach." },
      { property: "og:title", content: "Coach Conversation | Drivable" },
      { property: "og:description", content: "Review your permit-prep conversation with the Drivable AI coach." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = useParams({ from: "/_authenticated/app/c/$threadId" });
  const fn = useServerFn(getThreadMessages);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: () => fn({ data: { threadId } }),
  });

  if (isLoading || !messages) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Loading chat…
      </div>
    );
  }

  return (
    <ChatWindow
      key={threadId}
      threadId={threadId}
      initialMessages={messages as unknown as UIMessage[]}
    />
  );
}

