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
import { Globe, Crown, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const INVOICES = [
  { id: "INV-2026-06", date: "Jun 1, 2026", amount: "$9.00", status: "Paid" },
  { id: "INV-2026-05", date: "May 1, 2026", amount: "$9.00", status: "Paid" },
  { id: "INV-2026-04", date: "Apr 1, 2026", amount: "$9.00", status: "Paid" },
  { id: "INV-2026-03", date: "Mar 1, 2026", amount: "$9.00", status: "Paid" },
];

export function AccountPanel() {
  const [state, setState] = useState("California");
  const [loading, setLoading] = useState(false);

  const onChangeState = (next: string) => {
    setLoading(true);
    setState(next);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Knowledge base recalibrated to ${next}`);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Region selector */}
      <Card className="glass glow-soft p-6 rounded-2xl">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display text-lg font-bold">Local Rules Engine</h2>
          {loading && (
            <span className="text-[11px] uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Recalibrating
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Set your jurisdiction. All quizzes and AI answers conform to local code.
        </p>

        <div className="grid sm:grid-cols-[260px_1fr] gap-4 items-start">
          <Select value={state} onValueChange={onChangeState}>
            <SelectTrigger className="press">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3.5">
            <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/85 leading-relaxed">
              AI Knowledge Base and mock question arrays have dynamically
              recalibrated to match the specific vehicle code and legal
              traffic codes of <span className="font-bold text-primary">{state}</span>.
            </p>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card className="glass glow-soft p-6 rounded-2xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/20 border border-primary/40 shrink-0"
              style={{ boxShadow: "0 0 18px -4px var(--color-primary)" }}>
              <Crown className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Subscription
              </p>
              <h3 className="font-display text-lg font-bold truncate">
                Premium Pro Membership
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </Badge>
                <span className="text-xs text-muted-foreground">$9.00 / month</span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="press">
            Manage Subscription / Cancel
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Billing history
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Invoice</th>
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium">Amount</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-3">{inv.amount}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
