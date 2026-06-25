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
import { Globe, Crown, CheckCircle2, Lock, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserProfile, US_STATES } from "@/lib/user-profile";
import { useState } from "react";
import { createPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export function AccountPanel() {
  const { state, setState, isPro, openCheckout, targetDate, setTargetDate } = useUserProfile();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const onChangeState = (next: string) => {
    setState(next);
    toast.success(`AI knowledge base recalibrated to ${next}`);
  };

  const onManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const result = await createPortalSession({
        data: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/app`,
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open billing portal");
    } finally {
      setLoadingPortal(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card className="glass glow-soft p-6 rounded-2xl">
        <h2 className="font-display text-lg font-bold">Local Rules Engine</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Set your jurisdiction. All quizzes and AI answers conform to local code.
        </p>

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

          <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3.5">
            <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/85 leading-relaxed">
              {state
                ? <>AI Knowledge Base and question banks have dynamically recalibrated to match the vehicle code and traffic statutes of <span className="font-bold text-primary">{state}</span>.</>
                : <>AI Knowledge Base switches dynamic regulatory definitions based on the territory specified here.</>}
            </p>
          </div>
        </div>
      </Card>

      <Card className="glass glow-soft p-6 rounded-2xl">
        <h2 className="font-display text-lg font-bold">DMV Target Date</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Set the day you plan to take the exam — drives the countdown on your dashboard.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={targetDate ?? ""}
            onChange={(e) => setTargetDate(e.target.value || null)}
            className="rounded-md bg-card/60 border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          {targetDate && (
            <button onClick={() => setTargetDate(null)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
              clear
            </button>
          )}
        </div>
      </Card>

      <Card className="glass glow-soft p-6 rounded-2xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="grid h-12 w-12 place-items-center rounded-xl bg-primary/20 border border-primary/40 shrink-0"
              style={{ boxShadow: "0 0 18px -4px var(--color-primary)" }}
            >
              {isPro ? <Crown className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-primary" />}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Subscription</p>
              <h3 className="font-display text-lg font-bold truncate">
                {isPro ? "Premium Pro Membership" : "Free Tier · Onboarding"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {isPro ? (
                  <>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </Badge>
                    <span className="text-xs text-muted-foreground">$9.00 / month</span>
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
            <Button variant="outline" className="press">Manage Subscription</Button>
          ) : (
            <Button
              onClick={() => { unlockPro(); toast.success("Pro Pass unlocked"); }}
              className="press bg-primary text-primary-foreground hover:bg-primary"
              style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
            >
              <Sparkles className="w-4 h-4" /> Unlock Pro
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
