import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { joinWaitlist } from "@/lib/waitlist.functions";
import { waitlistEmailSchema } from "@/lib/waitlist";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EVENT = "drivable:open-waitlist";
export const openWaitlist = () => window.dispatchEvent(new Event(EVENT));

export function WaitlistDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [website, setWebsite] = useState("");
  const join = useServerFn(joinWaitlist);

  useEffect(() => {
    const handler = () => { setOpen(true); setError(null); setDone(false); setDuplicate(false); setWebsite(""); };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = waitlistEmailSchema.safeParse(email);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Enter a valid email"); return; }
    setSaving(true); setError(null);
    try {
      const result = await join({ data: { email: parsed.data, website } });
      setDuplicate(result.result === "duplicate"); setDone(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-[28px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Join the waitlist</DialogTitle>
          <DialogDescription>Drivable is in private beta. Leave your email and we'll let you know when it opens.</DialogDescription>
        </DialogHeader>
        {done ? (
          <p role="status" className="rounded-2xl bg-muted p-4 text-sm font-medium">{duplicate ? "You're already on the list." : "You're on the list. We'll email you when Drivable launches."}</p>
        ) : (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <div className="hidden" aria-hidden="true"><Label htmlFor="waitlist-website">Website</Label><Input id="waitlist-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label htmlFor="waitlist-email">Email</Label>
              <Input id="waitlist-email" type="email" autoComplete="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!!error} className="h-11 rounded-xl" />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" disabled={saving} className="h-11 w-full rounded-full">{saving ? "Joining…" : "Join waitlist"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
