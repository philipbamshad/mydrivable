import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, Trophy, AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile";
import { getStatePack } from "@/data/dmv";

export function ExamProgressChart() {
  const { isPro, unlockPro, quizScores, state } = useUserProfile();
  const PASS_THRESHOLD = getStatePack(state).rules.passingScorePct;

  // Treat the most recent quiz scores as mock-exam attempts.
  const attempts = quizScores.slice(-6);
  const latest = attempts.length ? attempts[attempts.length - 1] : null;
  const best = attempts.length ? Math.max(...attempts) : null;
  const avg = attempts.length
    ? Math.round(attempts.reduce((a, n) => a + n, 0) / attempts.length)
    : null;

  const ready = latest !== null && latest >= PASS_THRESHOLD;

  return (
    <Card className="p-5 glass glow-soft h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">Mock Permit Exam Analytics</h3>
          <p className="text-xs text-muted-foreground">
            {state ? `${state} DMV · ` : ""}pass threshold {PASS_THRESHOLD}%
          </p>
        </div>
        {isPro ? (
          attempts.length === 0 ? (
            <Badge variant="outline" className="text-xs bg-primary/15 text-primary border-primary/30">
              No attempts yet
            </Badge>
          ) : ready ? (
            <Badge variant="outline" className="text-xs bg-emerald-500/15 text-emerald-300 border-emerald-500/40 ">
              <Trophy className="w-3 h-3 mr-1" /> Exam Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-amber-500/15 text-amber-300 border-amber-500/40">
              <AlertTriangle className="w-3 h-3 mr-1" /> Not Ready
            </Badge>
          )
        ) : (
          <Badge variant="outline" className="text-xs bg-primary/15 text-primary border-primary/30">
            <Lock className="w-3 h-3 mr-1" /> Pro
          </Badge>
        )}
      </div>

      {/* Latest score gauge */}
      <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center">
        <ScoreDial value={latest ?? 0} threshold={PASS_THRESHOLD} hasData={latest !== null} />
        {latest === null && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            No attempts yet · take your first mock exam
          </p>
        )}

        {/* Line chart history */}
        <div className="w-full mt-6">
          <ScoreLineChart attempts={attempts} threshold={PASS_THRESHOLD} slots={6} />
        </div>
      </div>


      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
        <Stat label="Latest" value={latest !== null ? `${latest}%` : "—"} />
        <Stat label="Best" value={best !== null ? `${best}%` : "—"} />
        <Stat label="Avg" value={avg !== null ? `${avg}%` : "—"} />
      </div>

      {/* Pro lock overlay */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] backdrop-blur-md bg-background/50 transition-opacity duration-500 ${
          isPro ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-hidden={isPro}
      >
        <div className="glass glow-soft rounded-2xl px-6 py-5 max-w-xs text-center border border-primary/30 ">
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center ">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-display text-sm font-bold leading-snug mb-1">
            Unlock Mock Permit Exam Analytics
          </h4>
          <p className="text-xs text-muted-foreground mb-4">with Pro Pass · $9/mo</p>
          <Button
            size="sm"
            onClick={() => unlockPro()}
            className="w-full    transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ScoreDial({ value, threshold, hasData }: { value: number; threshold: number; hasData: boolean }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const pct = hasData ? Math.min(100, Math.max(0, value)) : 0;
  const offset = c - (c * pct) / 100;
  const pass = pct >= threshold;
  const color = !hasData
    ? "var(--color-muted-foreground)"
    : pass
      ? "rgb(74,222,128)"
      : pct >= 60
        ? "rgb(251,191,36)"
        : "rgb(248,113,113)";

  // Empty-state: keep the cool outline, but no fake fill.
  const emptyDash = hasData ? undefined : `2 6`;

  return (
    <div className="relative w-[140px] h-[140px]">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        {hasData ? (
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.6s ease-out, stroke 0.3s",

            }}
          />
        ) : (
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--color-primary)"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={emptyDash}
            style={{}}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl font-bold" style={{ color }}>
          {hasData ? `${pct}%` : "—"}
        </div>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
          Latest
        </div>
      </div>
    </div>
  );
}

function ScoreLineChart({
  attempts,
  threshold,
  slots,
}: {
  attempts: number[];
  threshold: number;
  slots: number;
}) {
  const W = 300;
  const H = 110;
  const padX = 14;
  const padTop = 10;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const xAt = (i: number) =>
    padX + (slots === 1 ? innerW / 2 : (i / (slots - 1)) * innerW);
  const yAt = (v: number) => padTop + (1 - Math.min(100, Math.max(0, v)) / 100) * innerH;
  const yThreshold = yAt(threshold);

  const points = attempts.map((v, i) => ({ i, v, x: xAt(i), y: yAt(v) }));
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-28"
      role="img"
      aria-label="Mock exam score history"
    >
      <defs>
        <linearGradient id="score-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Pass threshold line */}
      <line
        x1={padX}
        x2={W - padX}
        y1={yThreshold}
        y2={yThreshold}
        stroke="var(--color-primary)"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text
        x={W - padX}
        y={yThreshold - 4}
        textAnchor="end"
        className="fill-primary"
        style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}
      >
        Pass {threshold}%
      </text>

      {/* Filled area under line */}
      {points.length > 1 && (
        <path
          d={`${path} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${padTop + innerH} Z`}
          fill="url(#score-fill)"
        />
      )}

      {/* Line */}
      {points.length > 1 && (
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{}}
        />
      )}

      {/* Empty-state hint */}
      {points.length === 0 && (
        <text
          x={W / 2}
          y={padTop + innerH / 2 + 3}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          Awaiting first attempt
        </text>
      )}

      {/* Single-point marker */}
      {points.length === 1 && (
        <circle
          cx={points[0].x}
          cy={points[0].y}
          r={5}
          fill={points[0].v >= threshold ? "rgb(74,222,128)" : points[0].v >= 60 ? "rgb(251,191,36)" : "rgb(248,113,113)"}
          stroke="var(--color-background)"
          strokeWidth="1.5"
          style={{}}
        />
      )}

      {/* Score dots */}
      {points.length > 1 && points.map((p) => {
        const pass = p.v >= threshold;
        const color = pass ? "rgb(74,222,128)" : p.v >= 60 ? "rgb(251,191,36)" : "rgb(248,113,113)";
        return (
          <g key={p.i}>
            <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="var(--color-background)" strokeWidth="1.5"
              style={{}} />
          </g>
        );
      })}

      {/* X-axis attempt labels */}
      {Array.from({ length: slots }).map((_, i) => (
        <text
          key={i}
          x={xAt(i)}
          y={H - 6}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 9 }}
        >
          #{i + 1}
        </text>
      ))}
    </svg>
  );
}


function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
  );
}
