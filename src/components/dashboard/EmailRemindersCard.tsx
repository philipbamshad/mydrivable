import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getEmailReminders, setEmailReminders } from "@/lib/email-prefs.functions";

export function EmailRemindersCard() {
  const load = useServerFn(getEmailReminders);
  const save = useServerFn(setEmailReminders);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => { load().then(r => setEnabled(r.enabled)).catch(() => setEnabled(true)); }, [load]);
  const toggle = async (next: boolean) => {
    const prev = enabled; setEnabled(next);
    try { await save({ data: { enabled: next } }); toast.success(next ? "Email reminders on" : "Email reminders off"); }
    catch { setEnabled(prev); toast.error("Could not save your email setting."); }
  };
  return <Card className="p-5">
    <div className="flex items-center justify-between gap-4">
      <div><label htmlFor="email-reminders" className="font-semibold">Email reminders</label>
        <p className="mt-1 text-sm text-muted-foreground">Get an email 7 days before and the day before your DMV test.</p></div>
      <Switch id="email-reminders" checked={enabled ?? true} disabled={enabled === null} onCheckedChange={toggle} />
    </div>
  </Card>;
}
