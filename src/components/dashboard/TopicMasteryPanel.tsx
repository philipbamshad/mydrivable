import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrafficCone, Signpost, Beer, Gauge, Target } from "lucide-react";
import type { ReactNode } from "react";

type Pillar = {
  id: string;
  label: string;
  icon: ReactNode;
  accuracy: number;
  questionsLeft: number;
};

const PILLARS: Pillar[] = [
  { id: "signs", label: "Signs & Markings", icon: <Signpost className="w-4 h-4" />, accuracy: 91, questionsLeft: 8 },
  { id: "row", label: "Right-of-Way & Intersections", icon: <TrafficCone className="w-4 h-4" />, accuracy: 67, questionsLeft: 14 },
  { id: "subs", label: "Controlled Substances & Laws", icon: <Beer className="w-4 h-4" />, accuracy: 42, questionsLeft: 22 },
  { id: "speed", label: "Speed & Lane Constraints", icon: <Gauge className="w-4 h-4" />, accuracy: 78, questionsLeft: 10 },
];

function toneFor(a: number) {
  if (a < 50) return { bar: "bg-destructive", text: "text-destructive", badge: "Needs work" };
  if (a < 80) return { bar: "bg-amber-400", text: "text-amber-300", badge: "Sharpen" };
  return { bar: "bg-emerald-400", text: "text-emerald-300", badge: "Mastered" };
}

export function TopicMasteryPanel({
  onFocus,
}: {
  onFocus?: (pillarId: string, label: string) => void;
}) {
  return (
    <aside className="w-full lg:w-2/5 shrink-0 border-l border-border bg-card/40 backdrop-blur flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-base">Topic Mastery Dock</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Your 4 study pillars. Tap focus to drive the chat at that module.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {PILLARS.map((p) => {
          const tone = toneFor(p.accuracy);
          return (
            <div
              key={p.id}
              className="rounded-lg border border-border bg-background/60 p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted text-foreground">
                    {p.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      {p.questionsLeft} questions left
                    </div>
                  </div>
                </div>
                <span className={`font-display font-bold text-lg ${tone.text}`}>
                  {p.accuracy}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                <div
                  className={`h-full ${tone.bar} transition-all`}
                  style={{ width: `${p.accuracy}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase tracking-widest font-semibold ${tone.text}`}>
                  {tone.badge}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onFocus?.(p.id, p.label)}
                >
                  Focus this module
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// keep Progress import for typing parity even if unused inline
void Progress;
