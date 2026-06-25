import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL = [
  { id: 1, label: "Review Night Curfew Laws", done: false },
  { id: 2, label: "Log Parallel Parking Attempt", done: true },
  { id: 3, label: "Complete 5 Sign Quizzes", done: false },
];

export function DailyChecklist() {
  const [items, setItems] = useState(INITIAL);
  const done = items.filter((i) => i.done).length;

  return (
    <Card className="glass glow-soft p-5 rounded-2xl h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-display text-lg font-bold">Daily Study Progression</h3>
        <span className="text-xs text-muted-foreground">{done}/{items.length}</span>
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Three targets to ship today
      </p>

      <ul className="space-y-3 flex-1">
        {items.map((it) => (
          <li key={it.id}>
            <button
              onClick={() =>
                setItems((prev) =>
                  prev.map((p) => (p.id === it.id ? { ...p, done: !p.done } : p))
                )
              }
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 press",
                it.done
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-card/40 hover:border-primary/30"
              )}
            >
              <span
                className={cn(
                  "grid place-items-center h-6 w-6 rounded-md border transition-all duration-200",
                  it.done
                    ? "border-primary bg-primary text-primary-foreground scale-110"
                    : "border-border bg-background/50"
                )}
                style={
                  it.done
                    ? { boxShadow: "0 0 14px var(--color-primary)" }
                    : undefined
                }
              >
                {it.done && <Check className="w-3.5 h-3.5" />}
              </span>
              <span
                className={cn(
                  "text-sm transition-all duration-200",
                  it.done && "line-through text-muted-foreground"
                )}
              >
                {it.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-border">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${(done / items.length) * 100}%`,
              boxShadow: "0 0 12px var(--color-primary)",
            }}
          />
        </div>
      </div>
    </Card>
  );
}
