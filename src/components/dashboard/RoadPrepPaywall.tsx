import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Car, Timer, ListChecks, RotateCcw } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile";

export function RoadPrepPaywall() {
  const { openCheckout } = useUserProfile();

  return (
    <div className="max-w-3xl mx-auto">
      <Card
        className="glass glow-soft relative overflow-hidden rounded-3xl border border-primary/40 p-8 sm:p-10"
        style={{ boxShadow: "0 0 60px -10px var(--color-primary)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 70%)",
          }}
        />

        <div className="relative space-y-6">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border border-primary/50 uppercase tracking-[0.2em] text-[10px]">
              <Crown className="w-3 h-3" /> Pro
            </Badge>
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Premium Feature
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Unlock the Interactive Driving Tracker &amp; Simulator
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Behind-the-Wheel is a Pro toolkit. Log supervised drive time, run
              an endless scenario simulator, and tick off the maneuvers you've
              actually nailed in the real world.
            </p>
          </div>

          <ul className="grid sm:grid-cols-1 gap-3 pt-2">
            {[
              { icon: Car, label: "🚗 Infinite Driving Scenario Simulator" },
              { icon: Timer, label: "⏱️ Simple Add / Subtract Log for Supervised Hours" },
              { icon: ListChecks, label: "📋 Essential Maneuvers Checklist" },
            ].map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 border border-primary/40 shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </span>
                <span className="text-sm font-medium">{f.label}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Button
              onClick={() => openCheckout()}
              className="press  h-11 px-6 text-sm font-semibold"
              style={{ boxShadow: "0 0 22px -2px var(--color-primary)" }}
            >
              <Sparkles className="w-4 h-4" /> Upgrade to Pro
            </Button>
            <Button
              variant="ghost"
              className="press h-11 px-4 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-4 h-4" /> Restore Purchase
            </Button>
            <span className="text-xs text-muted-foreground">
              $9 / month · cancel anytime
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
