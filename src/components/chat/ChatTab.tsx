import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import {
  createThread,
  getThreadMessages,
  listThreads,
} from "@/lib/threads.functions";
import { ChatWindow } from "./ChatWindow";

export function ChatTab() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const getMsgs = useServerFn(getThreadMessages);

  const { data: threads, isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn({ data: undefined as never }),
  });

  const createMut = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["threads"] }),
  });

  useEffect(() => {
    if (isLoading) return;
    if ((!threads || threads.length === 0) && !createMut.isPending && !createMut.isSuccess) {
      createMut.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, threads]);

  const activeThread = threads?.[0];

  const { data: messages } = useQuery({
    queryKey: ["thread-messages", activeThread?.id],
    queryFn: () => getMsgs({ data: { threadId: activeThread!.id } }),
    enabled: !!activeThread,
  });

  if (!activeThread || !messages) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Warming up your AI coach…
      </div>
    );
  }

  return (
    <ChatWindow
      key={activeThread.id}
      threadId={activeThread.id}
      initialMessages={messages as unknown as UIMessage[]}
    />
  );
}
