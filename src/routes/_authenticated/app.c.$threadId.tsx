import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages } from "@/lib/threads.functions";
import { ChatWindow } from "@/components/chat/ChatWindow";

export const Route = createFileRoute("/_authenticated/app/c/$threadId")({
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
    <ChatWindow key={threadId} threadId={threadId} initialMessages={messages} />
  );
}
