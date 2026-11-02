import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EVENT = "drivable:open-waitlist";
export const openWaitlist = () => window.dispatchEvent(new Event(EVENT));
const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email").max(255, "Email is too long");

export function WaitlistDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handler = () => { setOpen(true); setError(null); };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Enter a valid email"); return; }
    setSaving(true); setError(null);
    const { error: insertError } = await supabase.from("waitlist").insert({ email: parsed.data });
    setSaving(false);
    // A duplicate means they're already on the list — treat it as success.
    if (insertError && insertError.code !== "23505") { setError("Something went wrong. Please try again."); return; }
    setDone(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-[28px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Join the waitlist</DialogTitle>
          <DialogDescription>Drivable is in private beta. Leave your email and we'll let you know when it opens.</DialogDescription>
        </DialogHeader>
        {done ? (
          <p role="status" className="rounded-2xl bg-muted p-4 text-sm font-medium">You're on the list. We'll email you when Drivable launches.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="waitlist-email">Email</Label>
              <Input id="waitlist-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!!error} className="h-11 rounded-xl" />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" disabled={saving} className="h-11 w-full rounded-full">{saving ? "Joining…" : "Join waitlist"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
