import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Target, ListChecks } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile";

function ReadinessRing({ value }: { value: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-border)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-primary)" strokeWidth={stroke}
          fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 8px var(--color-primary))", transition: "stroke-dashoffset 600ms ease" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="font-display text-3xl font-bold text-primary" style={{ textShadow: "0 0 18px var(--color-primary)" }}>
          {value}%
        </div>
      </div>
    </div>
  );
}

function EmptyRing({ icon: Icon }: { icon: typeof Target }) {
  return (
    <div className="relative h-[120px] w-[120px] grid place-items-center rounded-full border-2 border-dashed border-border">
      <Icon className="w-7 h-7 text-muted-foreground" />
    </div>
  );
}

export function HeaderWidgets() {
  const { readiness, targetDate, setTargetDate } = useUserProfile();
  const [editing, setEditing] = useState(false);

  const daysLeft = useMemo(() => {
    if (!targetDate) return null;
    const diff = Math.ceil((+new Date(targetDate) - Date.now()) / 86400000);
    return diff;
  }, [targetDate]);

  const targetLabel = useMemo(() => {
    if (!targetDate) return null;
    return new Date(targetDate).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }, [targetDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <Card className="glass glow-soft p-5 rounded-2xl flex items-center gap-5">
        {readiness === null ? (
          <>
            <EmptyRing icon={ListChecks} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Calculated Readiness Index
              </p>
              <h3 className="font-display text-lg font-bold mt-1">No data yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Take your first quiz to calculate readiness.
              </p>
            </div>
          </>
        ) : (
          <>
            <ReadinessRing value={readiness} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Calculated Readiness Index
              </p>
              <h3 className="font-display text-xl font-bold mt-1">
                {readiness >= 80 ? "On Track" : readiness >= 60 ? "Building" : "Early days"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Avg of {readiness}% across your quizzes · pass line 80%
              </p>
            </div>
          </>
        )}
      </Card>

      <Card className="glass glow-soft p-5 rounded-2xl flex items-center gap-5">
        {!targetDate ? (
          <>
            <EmptyRing icon={CalendarDays} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                DMV Target Date
              </p>
              <h3 className="font-display text-lg font-bold mt-1">Not set</h3>
              {editing ? (
                <input
                  type="date"
                  autoFocus
                  onChange={(e) => {
                    if (e.target.value) {
                      setTargetDate(e.target.value);
                      setEditing(false);
                    }
                  }}
                  className="mt-2 rounded-md bg-card/60 border border-border px-2 py-1 text-sm focus:outline-none focus:border-primary"
                />
              ) : (
                <Button size="sm" onClick={() => setEditing(true)} className="press mt-2 bg-primary text-primary-foreground hover:bg-primary">
                  Set Target Date
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="relative h-[120px] w-[120px] grid place-items-center rounded-2xl bg-primary/10 border border-primary/30">
              <CalendarDays className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: "inset 0 0 28px var(--color-primary)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                DMV Target Date
              </p>
              <h3 className="font-display text-3xl font-bold mt-1">{targetLabel}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
                  {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : "Past due"}
                </span>
                <button
                  onClick={() => setTargetDate(null)}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  change
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
