import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminStatus, runReminderJobNow } from "@/lib/email-prefs.functions";
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
  </div>;
}
