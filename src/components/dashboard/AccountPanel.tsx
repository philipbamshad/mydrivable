import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, CheckCircle2, Lock, Sparkles, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useUserProfile, US_STATES } from "@/lib/user-profile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TargetDatePicker } from "@/components/dashboard/TargetDatePicker";
import { useTheme } from "@/lib/theme";
import { EmailRemindersCard } from "@/components/dashboard/EmailRemindersCard";

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { deleteAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type AccountSection = "theme" | "state" | "date" | "email" | "membership" | "delete";

export function AccountPanel({ section }: { section?: AccountSection } = {}) {
  const show = (k: AccountSection) => !section || section === k;
  const { state, setState, isPro, openCheckout, targetDate, setTargetDate } = useUserProfile();
  const { theme } = useTheme();
  const removeAccount = useServerFn(deleteAccount);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const confirmDelete = async () => {
    if (confirmation !== "DELETE" || deleting) return;
    setDeleting(true); setDeleteError(null);
    try {
      const result = await removeAccount({ data: { confirmation: "DELETE" } });
      await supabase.auth.signOut();
      toast.success(result.emailSent ? "Account deleted. A confirmation email has been sent." : "Account deleted. The confirmation email could not be sent.");
      window.location.assign("/");
    } catch { setDeleteError("Unable to finish account deletion. Please try again."); setDeleting(false); }
  };

  const onChangeState = (next: string) => {
    setState(next);
    toast.success(`AI knowledge base recalibrated to ${next}`);
  };




  return (
    <div className="space-y-6">
      {show("theme") && (
<Card className="glass glow-soft p-6 rounded-2xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="grid h-12 w-12 place-items-center rounded-xl bg-muted border border-border shrink-0"
              style={{ boxShadow: "0 0 18px -6px color-mix(in oklab, var(--color-foreground) 35%, transparent)" }}
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Appearance</p>
              <h2 className="font-display text-lg font-bold">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </h2>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </Card>
      )}


      {show("state") && (
<Card className="glass glow-soft p-6 rounded-2xl">
        <h2 className="font-display text-lg font-bold mb-5">Local Rules Engine</h2>

        <div className="grid sm:grid-cols-[260px_1fr] gap-4 items-start">
          <Select value={state || undefined} onValueChange={onChangeState}>
            <SelectTrigger className="press">
              <SelectValue placeholder="Select your state…" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </Card>
      )}

      {show("date") && (
<Card className="glass glow-soft p-6 rounded-2xl">
        <h2 className="font-display text-lg font-bold">DMV Target Date</h2>
        <div className="mt-4">
          <TargetDatePicker value={targetDate} onChange={setTargetDate} />
        </div>
      </Card>
      )}

      {show("membership") && (
<Card className="glass glow-soft p-6 rounded-2xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="grid h-12 w-12 place-items-center rounded-xl bg-muted border border-border shrink-0"
              style={{ boxShadow: "0 0 18px -6px color-mix(in oklab, var(--color-foreground) 35%, transparent)" }}
            >
              {isPro ? <Crown className="w-5 h-5 text-foreground" /> : <Lock className="w-5 h-5 text-foreground" />}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Membership</p>
              <h3 className="font-display text-lg font-bold truncate">
                {isPro ? "Pro Pass · Lifetime" : "Free Tier · Onboarding"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {isPro ? (
                  <>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </Badge>
                    <span className="text-xs text-muted-foreground">$9 one-time · lifetime access</span>
                  </>
                ) : (
                  <Badge className="bg-muted/40 text-muted-foreground border border-border">
                    Practice modules locked
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {isPro ? (
            <Badge className="bg-muted text-foreground border border-border px-3 py-1">
              Lifetime access
            </Badge>
          ) : (
            <Button
              onClick={() => openCheckout()}
              className="press "
            >
              <Sparkles className="w-4 h-4" /> Unlock Pro
            </Button>
          )}

        </div>
      </Card>
      )}

      {show("email") && <EmailRemindersCard />}

      {show("delete") && (
<Card className="p-5">
        <h3 className="font-semibold">Delete my account</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account, chat history, and study progress. This cannot be undone.
        </p>
        <Button onClick={() => setDeleteOpen(true)} variant="outline" className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/10">Delete account</Button>
      </Card>
      )}
      <Dialog open={deleteOpen} onOpenChange={open => { if (!deleting) { setDeleteOpen(open); setConfirmation(""); setDeleteError(null); } }}>
        <DialogContent><DialogHeader><DialogTitle>Delete account?</DialogTitle><DialogDescription>This permanently removes your account and all study data. Type DELETE to confirm.</DialogDescription></DialogHeader>
          <Input aria-label="Deletion confirmation" value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={deleting} />
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" disabled={confirmation !== "DELETE" || deleting} onClick={() => void confirmDelete()}>{deleting ? "Deleting…" : "Permanently delete account"}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
