import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";

const DAILY_COUNT = 5;
const PREV_KEY = "drivable-daily-prev-v1";

type Task = { id: string; label: string };

/** Punchy, action-oriented daily task pool. The 5 starter items lead the
 *  pool and are picked first on the very first day the user opens the app. */
function buildPool(state: string): Task[] {
  const s = state;
  return [
    // ---- Starter set (leads the pool on day 1) ----
    { id: "speed-5", label: `Master 5 speed limit laws for ${s}` },
    { id: "hands-free", label: `Review ${s}'s hands-free mobile phone law` },
    { id: "quiz-1", label: "Pass 1 targeted practice quiz section" },
    { id: "ai-scenario", label: "Complete a scenario drill with your AI Coach" },
    { id: "implied-consent", label: "Review the implied-consent breathalyzer rule" },

    // ---- Rotating pool ----
    { id: "bac-adult", label: `Lock in ${s}'s adult BAC limit` },
    { id: "bac-u21", label: `Nail ${s}'s under-21 zero-tolerance BAC rule` },
    { id: "permit-age", label: `Confirm ${s}'s minimum learner-permit age` },
    { id: "signs-10", label: "Blitz 10 sign-recognition flashcards" },
    { id: "row-3", label: "Drill 3 right-of-way intersection scenarios" },
    { id: "parallel", label: "Rehearse the parallel-parking checklist" },
    { id: "3point", label: "Walk through a 3-point turn step by step" },
    { id: "mock-attempt", label: "Attempt 1 full-length Mock Permit Exam" },
    { id: "school-zone", label: `Review ${s}'s school-zone speed rule` },
    { id: "handbook-section", label: `Read one new section of the ${s} driver handbook` },
    { id: "night-drive", label: "Review night-driving visibility and headlight rules" },
    { id: "wet-road", label: "Study wet-road braking and hydroplaning recovery" },
    { id: "merge", label: "Practice highway on-ramp merging technique" },
    { id: "supervised-30", label: "Log 30 minutes of supervised drive time" },
    { id: "roundabout", label: "Review the yield rules for entering a roundabout" },
    { id: "school-bus", label: "Review when to stop for a school bus with red lights" },
    { id: "hill-park", label: "Rehearse uphill and downhill parking wheel positions" },
    { id: "signs-quiz", label: "Take a 5-question Signs & Markings mini-quiz" },
    { id: "brake-fail", label: "Walk through the brake-failure response steps" },
    { id: "distracted", label: "Review the 3 biggest distracted-driving triggers" },
  ];
}

/** Stable pseudo-random hash for (date, state) so the daily pick is
 *  deterministic within a day but rotates across days and states. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDaily(pool: Task[], seed: number, count: number, exclude: Set<string>): Task[] {
  // Prefer items not used yesterday. Fall back to full pool if we don't
  // have enough non-repeating candidates.
  let fresh = pool.filter((t) => !exclude.has(t.id));
  if (fresh.length < count) fresh = pool.slice();

  // Fisher-Yates with a seeded LCG for deterministic per-day ordering.
  const arr = fresh.slice();
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type PrevRecord = { date: string; ids: string[] };

function loadPrev(): PrevRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREV_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v && typeof v.date === "string" && Array.isArray(v.ids)) return v as PrevRecord;
  } catch {
    // ignore
  }
  return null;
}

function savePrev(rec: PrevRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREV_KEY, JSON.stringify(rec));
  } catch {
    // ignore
  }
}

export function DailyChecklist() {
  const { state, dailyDone, dailyDoneDate, toggleDailyTask } = useUserProfile();
  const stateLabel = state || "your state";

  const today = useMemo(todayKey, []);

  const items = useMemo<Task[]>(() => {
    const pool = buildPool(stateLabel);
    const prev = loadPrev();
    // Exclude yesterday's picks so no task repeats back-to-back.
    const exclude =
      prev && prev.date !== today ? new Set(prev.ids) : new Set<string>();

    const picks = pickDaily(pool, hash(`${today}|${stateLabel}`), DAILY_COUNT, exclude);

    // Persist today's picks so tomorrow can exclude them.
    if (!prev || prev.date !== today) {
      savePrev({ date: today, ids: picks.map((p) => p.id) });
    }
    return picks;
  }, [today, stateLabel]);

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
        <span>Refreshes daily · {stateLabel}</span>
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
