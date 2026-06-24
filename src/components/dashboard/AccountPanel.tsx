import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Shield, Sparkles, CheckCircle2, Crown } from "lucide-react";

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

export function AccountPanel() {
  const [state, setState] = useState("California");
  const [emails, setEmails] = useState(true);
  const [streak, setStreak] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile */}
      <Card className="lg:col-span-2 p-6 bg-card border-border">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl">
              AM
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Alex Morgan</h2>
              <p className="text-sm text-muted-foreground">alex.morgan@example.com</p>
              <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-wider bg-muted">
                Free plan · Permit Prep
              </Badge>
            </div>
          </div>
          <Button onClick={() => setUpgradeOpen(true)} className="font-semibold">
            <Crown className="w-4 h-4" />
            Upgrade
          </Button>
        </div>

        {/* Geo-location rules engine */}
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-base">Local Rules Engine</h3>
            <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">
              High priority
            </Badge>
          </div>

          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Your state
          </label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="mt-1 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
            <p>
              <span className="text-foreground font-medium">Verification notice:</span>{" "}
              DriveGuide&apos;s AI vector index will switch to{" "}
              <span className="text-primary font-semibold">{state}</span> DMV
              statutes, GDL restrictions, and road-test scoring rubrics. Active
              index updates on next chat message.
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <Pref
            title="Weekly progress emails"
            desc="Recap of mock exam scores and missed topics."
            checked={emails}
            onChange={setEmails}
          />
          <Pref
            title="Maintain practice streak"
            desc="Streak protection — one rest day per week allowed."
            checked={streak}
            onChange={setStreak}
          />
        </div>
      </Card>

      {/* Subscription card */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/40 border-primary/30">
        <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          DriveGuide Pro
        </Badge>
        <div className="font-display font-bold text-3xl mt-3">$8<span className="text-muted-foreground text-base font-normal">/mo</span></div>
        <p className="text-xs text-muted-foreground mt-1">
          Until you pass. Cancel anytime.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {[
            "Unlimited mock exams",
            "Live road-test scoring rubric",
            "Marketplace listing scans (10/mo)",
            "VIN-level health ledger",
            "State law alerts & updates",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full mt-5 font-semibold"
          onClick={() => setUpgradeOpen(true)}
        >
          Start 7-day free trial
        </Button>
      </Card>

      {/* Upgrade modal */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Upgrade to DriveGuide Pro
            </DialogTitle>
            <DialogDescription>
              Unlock unlimited mock exams, live road-test scoring, and full
              marketplace + maintenance tooling. 7 days free, then $8/mo.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="flex justify-between"><span>Pro plan</span><span>$8.00</span></div>
            <div className="flex justify-between text-muted-foreground"><span>7-day trial</span><span>−$8.00</span></div>
            <div className="flex justify-between font-semibold border-t border-border mt-2 pt-2">
              <span>Due today</span><span>$0.00</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUpgradeOpen(false)}>
              Not now
            </Button>
            <Button onClick={() => setUpgradeOpen(false)}>
              Start free trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Pref({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background/40 p-4">
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
