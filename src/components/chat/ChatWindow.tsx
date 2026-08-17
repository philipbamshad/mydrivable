"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Lock, Plus, Mic, Paperclip, Square, X } from "lucide-react";
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
  PromptInputFooter,
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
    <div className="mx-auto max-w-xl rounded-2xl border border-primary/40 bg-primary/10 px-5 py-5 text-center shadow-[0_0_40px_-18px_var(--color-primary)]">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-primary/40 bg-primary/15">
        <Lock className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug">
        You've used your 5 free lifetime AI questions. Upgrade to Pro Pass to continue chatting, get instant rule explanations, and access full exam simulators! [Get Pro Pass — $9]
      </p>
      <Button onClick={() => openCheckout()} className="mt-4 press w-full sm:w-auto" size="sm">
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
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
        className="rounded-[28px] border border-primary/25 bg-card/90 backdrop-blur shadow-[0_18px_50px_-28px_var(--color-primary)] outline-none transition-colors focus-within:border-primary/50 overflow-hidden has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-primary/50"
      >
        <AttachmentChips />
        <PromptInputTextarea
          ref={textareaRef}
          placeholder="Ask Drivable AI anything about your permit test..."
          disabled={isBusy}
          className="px-5 pt-4 outline-none ring-0 focus:outline-none focus-visible:ring-0 rounded-[28px]"
        />
        <PromptInputFooter className="items-center justify-between border-0 px-3 pb-3">
          <AttachButton />
          <div className="flex items-center gap-2">
            <MicButton textareaRef={textareaRef} />
            <PromptInputSubmit status={status} disabled={isBusy} />
          </div>
        </PromptInputFooter>
      </PromptInput>
      {!isPro && (
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {`${remaining} of ${FREE_LIFETIME_LIMIT} free lifetime AI questions left. Upgrade for unlimited chat.`}
        </p>
      )}
    </>
  );


  if (isEmpty) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-background px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[420px] w-[560px] max-w-[95vw] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 65%)",
          }}
        />
        <div className="w-full max-w-2xl text-center">
          <img src={logo} alt="" width={52} height={52} className="logo-mask mx-auto mb-5 opacity-90" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {greetingName ? `What's the vibe, ${greetingName}?` : "What are we studying today?"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {userState
              ? `Road signs, traffic laws, or specific ${userState} permit rules.`
              : "Permit prep, traffic laws, or road sign meanings."}
          </p>

          <div className="mt-7 w-full text-left">
            {limitReached ? paywall : composer}
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="press rounded-xl border border-border bg-card/70 px-4 py-3 text-left text-sm transition-colors hover:border-primary/60 hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
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
        </div>
      </div>
    </div>
  );
}

function AttachmentChips() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3">
      {attachments.files.map((f) => (
        <span
          key={f.id}
          className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 py-1 pl-2.5 pr-1.5 text-xs text-foreground"
        >
          <Paperclip className="h-3 w-3 text-primary" />
          <span className="max-w-[140px] truncate">{f.filename ?? "attachment"}</span>
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => attachments.remove(f.id)}
            className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
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
      className="grid h-9 w-9 place-items-center rounded-full border border-primary/25 bg-primary/5 text-primary transition-colors hover:bg-primary/10"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}

function MicButton({
  textareaRef,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const stop = useCallback(() => {
    recognitionRef.current?.stop?.();
    setListening(false);
  }, []);

  useEffect(() => () => recognitionRef.current?.abort?.(), []);

  const start = useCallback(() => {
    const w = window as any;
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    const rec = new Recognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    const base = textareaRef.current?.value ?? "";
    rec.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const el = textareaRef.current;
      if (!el) return;
      const next = (base ? `${base.trimEnd()} ` : "") + transcript;
      el.value = next;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    rec.onerror = (event: any) => {
      setListening(false);
      if (event?.error === "not-allowed") {
        toast.error("Microphone access was blocked.");
      }
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
    textareaRef.current?.focus();
  }, [textareaRef]);

  return (
    <button
      type="button"
      aria-label={listening ? "Stop voice input" : "Voice input"}
      aria-pressed={listening}
      onClick={() => (listening ? stop() : start())}
      className={
        listening
          ? "grid h-9 w-9 place-items-center rounded-full border border-primary bg-primary text-primary-foreground transition-colors"
          : "grid h-9 w-9 place-items-center rounded-full border border-primary/25 bg-primary/5 text-primary transition-colors hover:bg-primary/10"
      }
    >
      {listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
