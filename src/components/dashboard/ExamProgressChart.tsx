import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, Trophy, AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile";

const PASS_THRESHOLD = 80;

export function ExamProgressChart() {
  const { isPro, unlockPro, quizScores, state } = useUserProfile();

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
            <Badge variant="outline" className="text-xs bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_18px_-4px_rgb(74,222,128)]">
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

        {/* Bar history */}
        <div className="w-full mt-6">
          <div className="flex items-end justify-between gap-2 h-20 relative">
            {/* threshold line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-primary/50 pointer-events-none"
              style={{ bottom: `${PASS_THRESHOLD}%` }}
            >
              <span className="absolute -top-4 right-0 text-[9px] uppercase tracking-widest text-primary/80">
                Pass {PASS_THRESHOLD}%
              </span>
            </div>
            {Array.from({ length: 6 }).map((_, i) => {
              const v = attempts[i];
              const pct = v ?? 0;
              const has = v !== undefined;
              const pass = has && v >= PASS_THRESHOLD;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md transition-all duration-500"
                    style={{
                      height: `${has ? Math.max(pct, 4) : 4}%`,
                      background: !has
                        ? "var(--color-muted)"
                        : pass
                          ? "linear-gradient(180deg, rgb(74,222,128), rgb(34,197,94))"
                          : "linear-gradient(180deg, rgb(251,191,36), rgb(239,68,68))",
                      boxShadow: has
                        ? pass
                          ? "0 0 14px -2px rgb(74,222,128)"
                          : "0 0 14px -2px rgb(248,113,113)"
                        : "none",
                      opacity: has ? 1 : 0.35,
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground">#{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
        <Stat label="Latest" value={isPro && latest !== null ? `${latest}%` : "—"} />
        <Stat label="Best" value={isPro && best !== null ? `${best}%` : "—"} />
        <Stat label="Avg" value={isPro && avg !== null ? `${avg}%` : "—"} />
      </div>

      {/* Pro lock overlay */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] backdrop-blur-md bg-background/50 transition-opacity duration-500 ${
          isPro ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-hidden={isPro}
      >
        <div className="glass glow-soft rounded-2xl px-6 py-5 max-w-xs text-center border border-primary/30 shadow-[0_0_40px_-8px_oklch(0.72_0.20_240_/_0.55)]">
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center shadow-[0_0_24px_-2px_var(--color-primary)]">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-display text-sm font-bold leading-snug mb-1">
            Unlock Mock Permit Exam Analytics
          </h4>
          <p className="text-xs text-muted-foreground mb-4">with Pro Pass · $9/mo</p>
          <Button
            size="sm"
            onClick={() => unlockPro()}
            className="w-full bg-primary hover:bg-primary text-primary-foreground shadow-[0_0_24px_-2px_oklch(0.72_0.20_240_/_0.75)] hover:shadow-[0_0_36px_-2px_oklch(0.72_0.20_240_/_0.95)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (c * pct) / 100;
  const pass = pct >= threshold;
  const color = !hasData
    ? "var(--color-muted-foreground)"
    : pass
      ? "rgb(74,222,128)"
      : pct >= 60
        ? "rgb(251,191,36)"
        : "rgb(248,113,113)";

  return (
    <div className="relative w-[140px] h-[140px]">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
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
            filter: hasData ? `drop-shadow(0 0 8px ${color})` : "none",
          }}
        />
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
