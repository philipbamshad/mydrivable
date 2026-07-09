"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { toast } from "sonner";
import logo from "@/assets/drivable-logo.png";
import { useUserProfile } from "@/lib/user-profile";

const SUGGESTIONS = [
  "I'm starting permit prep, where do I begin?",
  "Quiz me on right-of-way rules.",
  "What does the examiner watch for during parallel parking?",
  "Walk me through a smooth highway merge.",
];


export function ChatWindow({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state: userState, isPro, openCheckout } = useUserProfile();

  // Free tier lifetime usage tracker. Bypassed entirely for Pro Pass.
  const FREE_LIFETIME_LIMIT = 5;
  const storageKey = `drivable:chat-usage:lifetime`;
  const [freeUsed, setFreeUsed] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(storageKey);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  const bumpFreeUsage = useCallback(() => {
    if (isPro) return;
    setFreeUsed((prev) => {
      const next = prev + 1;
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore quota errors, in-memory state still enforces the cap
      }
      return next;
    });
  }, [isPro, storageKey]);

  const limitReached = !isPro && freeUsed >= FREE_LIFETIME_LIMIT;
  const remaining = Math.max(0, FREE_LIFETIME_LIMIT - freeUsed);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: { messages, threadId, userState, ...body },
          };
        },
      }),
    [threadId, userState],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message ?? "Something went wrong"),
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const handleSubmit = async (msg: PromptInputMessage) => {
    if (!msg.text.trim()) return;
    if (limitReached) {
      openCheckout();
      return;
    }
    bumpFreeUsage();
    await sendMessage({ text: msg.text });
  };

  const handleSuggestion = async (text: string) => {
    if (limitReached) {
      openCheckout();
      return;
    }
    bumpFreeUsage();
    await sendMessage({ text });
  };

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-background/60 backdrop-blur px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary  animate-pulse" />
          <span className="text-foreground/90">
            AI Assistant Active, {userState
              ? <>Synced with the official <span className="font-semibold text-primary">{userState}</span> DMV Handbook</>
              : <span className="text-muted-foreground">No state set. Pick one in Settings for state-specific rules.</span>}
          </span>
        </div>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="max-w-3xl mx-auto w-full px-4 py-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<img src={logo} alt="" width={56} height={56} className="opacity-90" />}
              title="What are we tackling?"
              description={
                userState
                  ? `Permit, road test, or specific ${userState} rules, pick a starter or just ask.`
                  : "Permit prep, road-test maneuvers, or sign meanings, pick a starter or just ask."
              }
            >
              <div className="mt-6 grid sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-left text-sm rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-accent transition-colors px-4 py-3 press"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  {m.role === "user" ? (
                    <MessageContent>
                      {m.parts.map((p, i) =>
                        p.type === "text" ? <span key={i}>{p.text}</span> : null,
                      )}
                    </MessageContent>
                  ) : (
                    <MessageContent className="px-0 group-[.is-assistant]:bg-transparent">
                      {m.parts.map((p, i) =>
                        p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null,
                      )}
                    </MessageContent>
                  )}
                </Message>
              ))}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent className="px-0 group-[.is-assistant]:bg-transparent">
                    <Shimmer>Thinking...</Shimmer>
                  </MessageContent>
                </Message>
              )}
              {error && <p className="text-sm text-destructive">{error.message}</p>}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="max-w-3xl mx-auto w-full px-4 py-4">
          {limitReached ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-primary/40 bg-primary/10 px-5 py-5 text-center shadow-[0_0_40px_-18px_var(--color-primary)]">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-primary/40 bg-primary/15">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                You've used your 5 free AI questions for today. Upgrade to Pro Pass for unlimited chat, instant rule explanations, and full exam simulators! [Get Pro Pass — $9]
              </p>
              <Button
                onClick={() => openCheckout()}
                className="mt-4 press w-full sm:w-auto"
                size="sm"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Get Pro Pass — $9
              </Button>
            </div>
          ) : (
            <>
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputTextarea
                  ref={textareaRef}
                  placeholder="Ask Drivable anything, sign meanings, right-of-way, parallel parking…"
                  disabled={isBusy}
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} disabled={isBusy} />
                </PromptInputFooter>
              </PromptInput>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                {isPro
                  ? "Drivable can be wrong on state-specific rules. Always verify with your state DMV."
                  : `${remaining} of ${FREE_DAILY_LIMIT} free AI questions left today. Upgrade for unlimited chat.`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
