import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminStatus, runReminderJobNow, sendTestEmails } from "@/lib/email-prefs.functions";
import type { ReminderRun } from "@/lib/reminders.server";

export const Route = createFileRoute("/_authenticated/app/admin")({
  head: () => ({ meta: [
    { title: "Admin · Drivable" },
    { name: "description", content: "Drivable admin tools." },
    { property: "og:title", content: "Admin · Drivable" },
    { property: "og:description", content: "Drivable admin tools." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  beforeLoad: async () => {
    const { admin } = await getAdminStatus();
    if (!admin) throw redirect({ to: "/app" });
  },
  component: AdminPage,
});

function EmailTestsCard() {
  const run = useServerFn(sendTestEmails);
  const [busy, setBusy] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ sentTo: string; results: { template: string; ok: boolean; reason?: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const go = async (templateName?: "launch-announcement") => {
    setBusy(templateName ?? "all"); setError(null); setOutcome(null);
    try { setOutcome(await run({ data: templateName ? { templateName } : {} })); }
    catch (e) { setError(e instanceof Error ? e.message : "Send failed"); }
    finally { setBusy(null); }
  };
  return <Card className="mt-6 max-w-xl space-y-4 p-6">
    <div><h2 className="font-semibold">Email tests</h2>
      <p className="mt-1 text-sm text-muted-foreground">Sends the app emails to your own inbox so you can review them. The launch announcement uses the "Drivable is live" template.</p></div>
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => go()} disabled={busy !== null}>{busy === "all" ? "Sending…" : "Send all app emails to me"}</Button>
      <Button variant="outline" onClick={() => go("launch-announcement")} disabled={busy !== null}>{busy === "launch-announcement" ? "Sending…" : "Send launch announcement test"}</Button>
    </div>
    {error && <p className="text-sm text-destructive">{error}</p>}
    {outcome && <div className="space-y-1 text-sm">
      <p>Sent to {outcome.sentTo}:</p>
      {outcome.results.map(r => <p key={r.template} className={r.ok ? "text-muted-foreground" : "text-destructive"}>{r.template}: {r.ok ? "sent" : `failed (${r.reason ?? "unknown"})`}</p>)}
    </div>}
  </Card>;
}

function AdminPage() {
  const run = useServerFn(runReminderJobNow);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReminderRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const go = async () => {
    setBusy(true); setError(null);
    try { setResult(await run()); } catch (e) { setError(e instanceof Error ? e.message : "Job failed"); } finally { setBusy(false); }
  };
  return <div className="h-full overflow-y-auto p-5 pl-16 sm:p-8 md:pl-8">
    <h1 className="font-display text-2xl font-bold">Admin</h1>
    <Card className="mt-6 max-w-xl space-y-4 p-6">
      <div><h2 className="font-semibold">Test date reminders</h2>
        <p className="mt-1 text-sm text-muted-foreground">Runs the same job as the hourly schedule, without waiting for 9 AM.</p></div>
      <Button onClick={go} disabled={busy}>{busy ? "Running…" : "Run reminder job now"}</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && <div className="space-y-1 text-sm">
        <p>Sent {result.sent.length} email{result.sent.length === 1 ? "" : "s"}{result.failed.length ? ` · ${result.failed.length} failed` : ""}.</p>
        {result.sent.map(s => <p key={s.email + s.kind} className="text-muted-foreground">{s.kind === "7d" ? "7-day" : "1-day"} reminder → {s.email} (test {s.testDate})</p>)}
        {result.failed.map(s => <p key={s.email + s.kind} className="text-destructive">Failed: {s.kind} → {s.email}</p>)}
      </div>}
    </Card>
    <EmailTestsCard />
  </div>;
}
