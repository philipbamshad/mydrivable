import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

function ReadinessRing({ value }: { value: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            filter: "drop-shadow(0 0 8px var(--color-primary))",
            transition: "stroke-dashoffset 600ms ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="font-display text-3xl font-bold text-primary"
          style={{ textShadow: "0 0 18px var(--color-primary)" }}
        >
          {value}%
        </div>
      </div>
    </div>
  );
}

export function HeaderWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <Card className="glass glow-soft p-5 rounded-2xl flex items-center gap-5">
        <ReadinessRing value={84} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Permit Readiness Index
          </p>
          <h3 className="font-display text-xl font-bold mt-1">On Track</h3>
          <p className="text-xs text-muted-foreground mt-1">
            6 pts above pass line · trending up
          </p>
        </div>
      </Card>

      <Card className="glass glow-soft p-5 rounded-2xl flex items-center gap-5">
        <div className="relative h-[120px] w-[120px] grid place-items-center rounded-2xl bg-primary/10 border border-primary/30">
          <CalendarDays className="w-8 h-8 text-primary" />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 28px var(--color-primary)" }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            DMV Target Date
          </p>
          <h3 className="font-display text-3xl font-bold mt-1">October 14</h3>
          <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
            111 days left
          </span>
        </div>
      </Card>
    </div>
  );
}
