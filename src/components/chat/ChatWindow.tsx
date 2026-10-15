"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, Plus, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
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
  PromptInputSubmit,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { toast } from "sonner";
import logo from "@/assets/drivable-logo.png";
import { useUserProfile } from "@/lib/user-profile";

const SUGGESTIONS = [
  "I'm starting permit prep, where do I begin?",
  "Quiz me on right-of-way rules.",
  "Explain right turn on red rules for the written test.",
  "What do the warning sign shapes and colors mean?",
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
  const { state: userState, isPro, openCheckout, freeUsage, refreshFreeUsage } =
    useUserProfile();

  // Free tier lifetime usage tracker. Bypassed entirely for Pro Pass.
  // Counter persists via the profile provider (localStorage + user_profiles
  // row) so the limit is permanent across refresh, logout, and devices.
  const FREE_LIFETIME_LIMIT = 5;
  // The counter itself is incremented by the /api/chat handler, which is the
  // authoritative gate; the client only reads it back for display.
  const freeUsed = freeUsage.chat;

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
      refreshFreeUsage();
    },
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const handleSubmit = async (msg: PromptInputMessage) => {
    const hasFiles = Boolean(msg.files && msg.files.length > 0);
    if (!msg.text.trim() && !hasFiles) return;
    if (limitReached) {
      openCheckout();
      return;
    }
    await sendMessage({
      text: msg.text,
      ...(hasFiles ? { files: msg.files } : {}),
    });
  };


  const handleSuggestion = async (text: string) => {
    if (limitReached) {
      openCheckout();
      return;
    }
    await sendMessage({ text });
  };

  const [greetingName, setGreetingName] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const raw =
        (u?.user_metadata?.["full_name"] as string | undefined) ??
        (u?.user_metadata?.["name"] as string | undefined) ??
        u?.email?.split("@")[0] ??
        null;
      setGreetingName(raw ? raw.split(" ")[0] : null);
    });
  }, []);

  const isBusy = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  const paywall = (
    <div className="mx-auto max-w-lg rounded-[20px] border border-primary/25 bg-card px-4 py-5 text-center shadow-[0_12px_30px_-16px_rgba(15,23,42,0.22)]">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-primary/30 bg-primary/10">
        <Lock className="h-4 w-4 text-primary" />
      </div>
      <p className="mx-auto max-w-sm text-sm font-semibold text-foreground leading-snug">
        You've used your 5 free lifetime AI questions. Upgrade to Pro Pass to continue chatting, get instant rule explanations, and access full exam simulators!
      </p>
      <Button
        onClick={() => openCheckout()}
        className="mt-4 press rounded-2xl px-6 py-4 text-sm font-semibold"
      >
        Get Pro Pass — $9
      </Button>
    </div>
  );

  const composer = (
    <>
      <PromptInput
        onSubmit={handleSubmit}
        accept="image/*,application/pdf"
        maxFiles={4}
        maxFileSize={8 * 1024 * 1024}
        onError={(e) => toast.error(e.message)}
        className="rounded-full border border-primary/25 bg-card/90 backdrop-blur outline-none transition-colors focus-within:border-primary/50 overflow-hidden [&>div]:h-auto [&>div]:flex-wrap [&>div]:border-0 [&>div]:shadow-none [&>div]:bg-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-primary/50"
      >
        <AttachmentChips />
        <div className="flex w-full items-center gap-2 py-2 pl-2 pr-2">
          <AttachButton />
          <PromptInputTextarea
            ref={textareaRef}
            placeholder="Ask Drivable AI anything about your permit test..."
            disabled={isBusy}
            className="max-h-36 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-base shadow-none outline-none ring-0 focus:outline-none focus-visible:ring-0"
          />
          <PromptInputSubmit
            status={status}
            disabled={isBusy}
            size="icon-sm"
            className="shrink-0 size-11 rounded-full"
          />
        </div>
      </PromptInput>
      {!isPro && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {`${remaining} of ${FREE_LIFETIME_LIMIT} free lifetime AI questions left. Upgrade for unlimited chat.`}
        </p>
      )}
    </>
  );


  if (isEmpty) {
    return (
      <div
        className="relative flex h-full flex-col items-center justify-start overflow-y-auto bg-background px-4 py-5"
        style={{
          background:
            "radial-gradient(420px 420px at 18% 30%, color-mix(in oklch, var(--rose-soft) 16%, transparent), transparent 70%), radial-gradient(420px 420px at 82% 70%, color-mix(in oklch, var(--accent-coral) 13%, transparent), transparent 70%)",
        }}
      >
        <div className="w-full max-w-2xl text-center my-auto shrink-0">
          <img src={logo} alt="" width={48} height={48} className="logo-mask mx-auto mb-4 opacity-90" />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {greetingName ? `What's the vibe, ${greetingName}?` : "What are we studying today?"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {userState
              ? `Road signs, traffic laws, or specific ${userState} permit rules.`
              : "Permit prep, traffic laws, or road sign meanings."}
          </p>

          <div className="mt-4 w-full text-left">
            {limitReached ? paywall : composer}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="press rounded-2xl border border-border bg-card px-4 py-2.5 text-left text-sm shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] transition-colors hover:border-primary/50 hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Your coach can slip up. Confirm anything official with your state handbook.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <Conversation className="flex-1">
        <ConversationContent className="max-w-3xl mx-auto w-full px-4 py-6">
          <div className="space-y-6">
            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                {m.role === "user" ? (
                  <MessageContent>
                    {m.parts.some(
                      (p) => p.type === "file" && p.mediaType?.startsWith("image/"),
                    ) && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {m.parts.map((p, i) =>
                          p.type === "file" && p.mediaType?.startsWith("image/") ? (
                            <img
                              key={i}
                              src={p.url}
                              alt={p.filename ?? "Attached image"}
                              className="max-h-56 w-auto max-w-full rounded-xl border border-border object-contain"
                            />
                          ) : null,
                        )}
                      </div>
                    )}
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
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="bg-background/80 backdrop-blur">
        <div className="max-w-3xl mx-auto w-full px-4 py-4">
          {limitReached ? paywall : composer}
          <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
            Your coach can slip up. Confirm anything official with your state handbook.
          </p>
        </div>
      </div>
    </div>

  );
}

function AttachmentChips() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;
  return (
    <div className="flex w-full flex-wrap gap-2 px-4 pt-4 pb-1">
      {attachments.files.map((f) => {
        const isImage = Boolean(f.mediaType?.startsWith("image/") && f.url);
        return (
          <div
            key={f.id}
            className="relative rounded-2xl border border-primary/25 bg-primary/5 text-xs text-foreground"
          >
            {isImage ? (
              <img
                src={f.url}
                alt={f.filename ?? "Attached image"}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <span className="flex items-center gap-1.5 py-2 pl-2.5 pr-6">
                <Paperclip className="h-3 w-3 text-primary" />
                <span className="max-w-[140px] truncate">{f.filename ?? "attachment"}</span>
              </span>
            )}
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => attachments.remove(f.id)}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}


function AttachButton() {
  const attachments = usePromptInputAttachments();
  return (
    <button
      type="button"
      aria-label="Add attachment"
      onClick={() => attachments.openFileDialog()}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}
