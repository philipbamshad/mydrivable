import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "confirm" | "done" | "already" | "invalid";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Drivable" },
      {
        name: "description",
        content: "Manage the emails Drivable sends you about your permit prep.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Email preferences" },
      {
        property: "og:description",
        content: "Unsubscribe from Drivable app emails.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/email/unsubscribe?token=${encodeURIComponent(token)}`,
        );
        const body = (await res.json()) as {
          valid?: boolean;
          reason?: string;
          email?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setStatus("invalid");
          return;
        }
        if (body.email) setEmail(body.email);
        setStatus(body.valid ? "confirm" : "already");
      } catch {
        if (!cancelled) setStatus("invalid");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        reason?: string;
      };
      if (!res.ok) setStatus("invalid");
      else if (body.success === false && body.reason === "already_unsubscribed")
        setStatus("already");
      else setStatus("done");
    } catch {
      setStatus("invalid");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[100dvh] grid place-items-center bg-background px-5 py-16">
      <div className="w-full max-w-md rounded-[32px] border border-border/70 bg-card p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Email preferences
        </h1>

        {status === "loading" && (
          <p className="mt-4 text-sm text-muted-foreground">Checking your link...</p>
        )}

        {status === "confirm" && (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              {email ? (
                <>
                  Stop sending Drivable app emails to{" "}
                  <span className="font-semibold text-foreground">{email}</span>?
                </>
              ) : (
                "Stop sending Drivable app emails to this address?"
              )}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Sign in and password reset emails keep working so you never lose
              access to your account.
            </p>
            <Button
              onClick={confirm}
              disabled={busy}
              className="press mt-6 h-11 w-full rounded-full"
            >
              {busy ? "Updating..." : "Unsubscribe"}
            </Button>
          </>
        )}

        {status === "already" && (
          <p className="mt-4 text-sm text-muted-foreground">
            You are already unsubscribed. No further app emails will be sent to
            this address.
          </p>
        )}

        {status === "done" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Done. You have been unsubscribed from Drivable app emails.
          </p>
        )}

        {status === "invalid" && (
          <p className="mt-4 text-sm text-muted-foreground">
            This link is no longer valid. Please use the link from your most
            recent Drivable email, or write to philip@mydrivable.com and we will
            take care of it.
          </p>
        )}

        <a
          href="/"
          className="mt-6 inline-block text-xs font-semibold text-primary hover:underline"
        >
          Back to Drivable
        </a>
      </div>
    </main>
  );
}
