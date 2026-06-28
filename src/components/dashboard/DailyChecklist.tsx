import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { getStatePack } from "@/data/dmv";

const KEY = "drivable-checklist-v2";
const DAILY_COUNT = 5;

type Task = { id: string; label: string };

/** Build the day's state-specific task pool. */
function buildPool(stateName: string | null | undefined): Task[] {
  const { rules } = getStatePack(stateName);
  const s = rules.name;
  return [
    { id: "bac-adult", label: `Memorize ${s}'s adult BAC limit (${rules.bacAdult.toFixed(2)}%)` },
    { id: "bac-u21", label: `Review ${s}'s under-21 BAC rule (${rules.bacUnder21.toFixed(2)}%)` },
    { id: "pass-score", label: `Recall ${s}'s permit pass score (${rules.minCorrectToPass}/${rules.questionsCount})` },
    { id: "permit-age", label: `Confirm ${s}'s learner-permit minimum age (${rules.permitMinAge})` },
    { id: "phone-law", label: rules.handheldPhoneBanAllDrivers
        ? `Read ${s}'s hands-free phone statute`
        : `Read ${s}'s texting-while-driving law` },
    { id: "implied-consent", label: `Review ${s}'s implied-consent (breathalyzer) penalty` },
    { id: "supervised-hours", label: `Log 30 min toward your ${rules.supervisedHoursRequired}-hour supervised drive` },
    { id: "signs", label: "Complete 5 sign-recognition flashcards" },
    { id: "right-of-way", label: "Drill 3 intersection right-of-way scenarios" },
    { id: "parallel", label: "Watch the parallel-parking walkthrough" },
    { id: "3point", label: "Practice the 3-point turn checklist" },
    { id: "mock", label: "Run 1 full-length Mock Permit Exam attempt" },
    { id: "speed", label: "Review default speed limits (residential / highway / school zone)" },
    { id: "handbook", label: `Open the ${s} DMV handbook and read one new section` },
  ];
}

/** Stable pseudo-random hash for (date, state) so the pick is deterministic per day. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDaily(pool: Task[], seed: number, count: number): Task[] {
  const arr = pool.slice();
  // Fisher-Yates with seeded LCG
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function DailyChecklist() {
  const { state, dailyDone, dailyDoneDate, toggleDailyTask } = useUserProfile();
  const stateLabel = state || "Default";

  const today = useMemo(todayKey, []);
  const items = useMemo<Task[]>(() => {
    const pool = buildPool(state);
    return pickDaily(pool, hash(`${today}|${stateLabel}`), DAILY_COUNT);
  }, [today, state, stateLabel]);

  const done = dailyDoneDate === today ? dailyDone : {};
  const setDoneToggle = (id: string) => toggleDailyTask(id, today);

  const completed = items.filter((i) => done[i.id]).length;

  return (
    <Card className="glass glow-soft p-5 rounded-2xl h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-display text-lg font-bold">Daily Study Progression</h3>
        <span className="text-xs text-muted-foreground">{completed}/{DAILY_COUNT}</span>
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-1.5">
        <RefreshCw className="w-3 h-3 text-primary" />
        <span>Refreshes daily · {stateLabel} ruleset</span>
      </p>

      <ul className="space-y-2.5 flex-1">
        {items.map((it) => {
          const isDone = !!done[it.id];
          return (
            <li key={it.id}>
              <button
                onClick={() => setDoneToggle(it.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 press min-h-11",
                  isDone ? "border-primary/40 bg-primary/10" : "border-border bg-card/40 hover:border-primary/30",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center h-6 w-6 shrink-0 rounded-md border transition-all duration-200",
                    isDone ? "border-primary bg-primary text-primary-foreground scale-110" : "border-border bg-background/50",
                  )}
                  style={isDone ? { boxShadow: "0 0 14px var(--color-primary)" } : undefined}
                >
                  {isDone && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className={cn("text-sm transition-all duration-200", isDone && "line-through text-muted-foreground")}>
                  {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 pt-4 border-t border-border">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(completed / DAILY_COUNT) * 100}%`, boxShadow: "0 0 12px var(--color-primary)" }} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-2 text-center">
          New tasks unlock every 24 hours
        </p>
      </div>
    </Card>
  );
}
