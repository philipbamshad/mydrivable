import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  X,
  TrafficCone,
  GitFork,
  Beer,
  Gauge,
  RefreshCw,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { SignVisual } from "./SignVisual";
import { shuffleAnswers } from "@/data/dmv/question-generator";
import {
  buildPillarBanks,
  PILLAR_META,
  type PillarId,
  type PracticeQuestion,
} from "@/data/dmv/practice-bank";
import { pickUnseenQuestions } from "@/lib/seen-questions";

type Question = PracticeQuestion;

type Pillar = {
  id: PillarId;
  title: string;
  blurb: string;
  icon: typeof TrafficCone;
};

const PILLAR_ORDER: { id: PillarId; icon: typeof TrafficCone }[] = [
  { id: "signs", icon: TrafficCone },
  { id: "intersections", icon: GitFork },
  { id: "substances", icon: Beer },
  { id: "speed", icon: Gauge },
];

const FREE_PILLAR_LIFETIME_LIMIT = 3;

export function TestHubDashboard() {
  const { isPro, unlockPro, state, freeUsage, bumpFreeUsage } = useUserProfile();
  const [active, setActive] = useState<PillarId | null>(null);


  const pillars: Pillar[] = PILLAR_ORDER.map(({ id, icon }) => ({
    id,
    icon,
    title: PILLAR_META[id].title,
    blurb: PILLAR_META[id].blurb,
  }));

  const usage = freeUsage.pillars;

  if (active) {
    const p = pillars.find((x) => x.id === active)!;
    return (
      <QuizRunner
        pillar={p}
        stateName={state}
        isPro={isPro}
        pillarUsed={usage[active] ?? 0}
        lifetimeLimit={FREE_PILLAR_LIFETIME_LIMIT}
        onAnswered={() => bumpFreeUsage(`pillar:${active}`)}
        onUpgrade={() => unlockPro()}
        onExit={() => setActive(null)}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {pillars.map((p) => {
          const Icon = p.icon;
          const used = usage[p.id] ?? 0;
          const remaining = Math.max(0, FREE_PILLAR_LIFETIME_LIMIT - used);
          const locked = !isPro && remaining <= 0;
          return (
            <Card key={p.id} className="relative bg-card rounded-[28px] border border-border/60 p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-[18px] border border-primary/30 bg-primary/5 text-primary shrink-0"
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base sm:text-lg font-bold">{p.title}</h3>
                    <Badge className="bg-primary/15 text-primary border-primary/40 border">
                      {isPro ? "Pro" : "Free preview"}
                    </Badge>
                  </div>
                </div>
              </div>
              {!isPro && (
                <p className="text-[11px] text-muted-foreground bg-muted rounded-xl px-3 py-2">
                  {locked
                    ? "Free limit reached for this section."
                    : `${remaining} of ${FREE_PILLAR_LIFETIME_LIMIT} free lifetime questions left`}
                </p>
              )}
              <Button
                onClick={() => (locked ? unlockPro() : setActive(p.id))}
                className="press w-full rounded-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
              >
                {locked ? (
                  <>
                    <Lock className="w-4 h-4" /> Unlock with Pro Pass
                  </>
                ) : (
                  "Start Test"
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PillarPaywall({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="max-w-xl mx-auto p-5">
      <div className="rounded-[28px] border border-primary/30 bg-card px-6 py-8 text-center shadow-lg">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-primary/15">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground leading-snug">
          You've answered your 3 free lifetime questions for this quiz section. Upgrade to Pro Pass to unlock unlimited questions, practice modes, and get full explanations! [Get Pro Pass — $9]
        </p>
        <Button onClick={onUpgrade} className="press mt-5 rounded-full">
          Get Pro Pass — $9
        </Button>
      </div>
    </div>
  );
}

function QuizRunner({
  pillar,
  stateName,
  isPro,
  pillarUsed,
  lifetimeLimit,
  onAnswered,
  onUpgrade,
  onExit,
}: {
  pillar: Pillar;
  stateName?: string | null;
  isPro: boolean;
  pillarUsed: number;
  lifetimeLimit: number;
  onAnswered: () => void;
  onUpgrade: () => void;
  onExit: () => void;
}) {
  const { recordQuizScore } = useUserProfile();
  const lastSetRef = useRef<string>("");

  const buildSet = () => {
    // Rebuild banks fresh every set so answer positions re-shuffle every load.
    const bank = buildPillarBanks(stateName)[pillar.id];
    const take = Math.min(8, bank.length);
    // Pull ONLY from questions the user hasn't already seen for this pillar
    // and state. Auto-resets when the pool is exhausted.
    let candidate: Question[] = [];
    let key = "";
    let tries = 0;
    do {
      const picked = pickUnseenQuestions(`pillar:${pillar.id}`, stateName, bank, take);
      candidate = picked.map((q) => shuffleAnswers(q) as Question);
      key = candidate.map((q) => q.q).join("|");
      tries++;
    } while (key === lastSetRef.current && tries < 3);
    lastSetRef.current = key;
    return candidate;
  };

  const [questions, setQuestions] = useState<Question[]>(() => buildSet());
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const reveal = picked !== null;
  // Strict per-section lifetime gate: only lock once the user has actually
  // used all 3 free questions in THIS section. Other sections stay unlocked.
  const freeLocked = !isPro && pillarUsed >= lifetimeLimit;

  // Guard against `recordQuizScore` being called twice from a single render
  // path when the last answer both completes the set and triggers advance.
  const completedRef = useRef(false);
  useEffect(() => {
    completedRef.current = false;
  }, [pillar.id]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
    onAnswered();
  };

  const advance = () => {
    if (idx + 1 >= questions.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        const pct = Math.round((score / questions.length) * 100);
        recordQuizScore(pct, "pillar");
      }
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPicked(null);
    }
  };

  const restartFresh = () => {
    completedRef.current = false;
    setQuestions(buildSet());
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (freeLocked) {
    return (
      <div className="max-w-3xl mx-auto p-5 space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to pillars
          </button>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {pillar.title}
          </span>
        </div>
        <PillarPaywall onUpgrade={onUpgrade} />
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto p-5 space-y-5">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to pillars
        </button>
        <Card className="bg-card border border-border/60 shadow-lg p-10 rounded-[28px] text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {pillar.title}
          </p>
          <div
            className="font-display text-7xl font-bold text-primary mt-3"
            style={{ textShadow: "0 0 28px var(--color-primary)" }}
          >
            {pct}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {score} of {questions.length} correct
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={restartFresh} className="press ">
              <RefreshCw className="w-4 h-4" /> New Set
            </Button>
            <Button variant="outline" className="press" onClick={onExit}>
              Exit
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-5 space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exit
        </button>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {pillar.title} · {idx + 1} / {questions.length}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${((idx + (reveal ? 1 : 0)) / questions.length) * 100}%`,
            boxShadow: "0 0 12px var(--color-primary)",
          }}
        />
      </div>

      <Card className="glass glow-soft p-6 rounded-[32px]">
        {q.sign && (
          <div className="grid place-items-center mb-5">
            <SignVisual s={q.sign} />
          </div>
        )}
        <h3 className="font-display text-lg font-semibold mb-4">{q.q}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isPicked = picked === i;
            return (
              <button
                key={i}
                style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                onClick={() => choose(i)}
                disabled={reveal}
                className={cn(
                  "p-3.5 rounded-xl border text-sm font-medium text-left transition-all duration-200 flex items-center justify-between gap-2 fade-in-up",
                  !reveal &&
                    "border-border bg-card/40 hover:-translate-y-1 hover:scale-[1.02] hover:border-accent-orange/60 active:scale-[0.98]",
                  reveal && isCorrect && "border-emerald-400 bg-emerald-500/25 text-emerald-100 ",
                  reveal &&
                    isPicked &&
                    !isCorrect &&
                    "border-red-400 bg-red-500/25 text-red-100  animate-pulse",
                  reveal && !isPicked && !isCorrect && "opacity-40 border-border",
                )}
              >
                <span>{opt}</span>
                {reveal && isCorrect && <Check className="w-4 h-4" />}
                {reveal && isPicked && !isCorrect && <X className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {reveal && (
          <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary font-bold mb-2">
              Explanation
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">{q.explanation}</p>
            <Button onClick={advance} className="press mt-4 ">
              {idx + 1 >= questions.length ? "See score" : "Next question"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
