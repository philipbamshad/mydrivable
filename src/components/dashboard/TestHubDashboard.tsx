import { useMemo, useRef, useState } from "react";
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
  Sparkles,
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


export function TestHubDashboard() {
  const { isPro, unlockPro, state } = useUserProfile();
  const [active, setActive] = useState<PillarId | null>(null);

  // State-tailored banks: rebuilt when the user's active state changes so
  // numeric values (speed limits, alley, school zone, accident threshold,
  // BAC) always match the current jurisdiction.
  const banks = useMemo(() => buildPillarBanks(state), [state]);

  const pillars: Pillar[] = PILLAR_ORDER.map(({ id, icon }) => ({
    id,
    icon,
    title: PILLAR_META[id].title,
    blurb: PILLAR_META[id].blurb,
  }));

  if (active) {
    const p = pillars.find((x) => x.id === active)!;
    return (
      <QuizRunner
        pillar={p}
        stateName={state}
        onExit={() => setActive(null)}
      />
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Permit Pillar Quiz Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drill the four topics examiners weight most. Endless randomized sets tailored to {state || "your state"}.
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-5 transition-all",
          !isPro && "blur-sm pointer-events-none select-none",
        )}
      >
        {pillars.map((p) => {
          const Icon = p.icon;
          const count = banks[p.id].length;
          return (
            <Card key={p.id} className="glass glow-soft p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 border border-primary/40 text-primary shrink-0"
                  style={{ boxShadow: "0 0 20px -4px var(--color-primary)" }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.blurb}</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-widest border-primary/30 text-primary"
                >
                  {count} qs
                </Badge>
              </div>
              <Button onClick={() => setActive(p.id)} className="press w-full ">
                <Sparkles className="w-4 h-4" /> Start Test
              </Button>
            </Card>
          );
        })}
      </div>

      {!isPro && (
        <div className="absolute inset-0 grid place-items-center">
          <Card className="glass-strong glow-strong p-8 rounded-2xl text-center max-w-md mx-auto">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 border border-primary/40 mx-auto mb-4"
              style={{ boxShadow: "0 0 24px -4px var(--color-primary)" }}
            >
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold">Pro Pass Required</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Unlock all 4 pillar quizzes, endless randomized sets, and instant explanations.
            </p>
            <Button onClick={() => unlockPro()} className="press mt-5 ">
              Unlock Pro — $9
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function QuizRunner({
  pillar,
  stateName,
  onExit,
}: {
  pillar: Pillar;
  stateName?: string | null;
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

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
  };

  const advance = () => {
    if (idx + 1 >= questions.length) {
      const pct = Math.round((score / questions.length) * 100);
      recordQuizScore(pct, "pillar");
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPicked(null);
    }
  };

  const restartFresh = () => {
    setQuestions(buildSet());
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

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
        <Card className="glass glow-strong p-10 rounded-2xl text-center">
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

  const reveal = picked !== null;

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

      <Card className="glass glow-soft p-6 rounded-2xl">
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
                onClick={() => choose(i)}
                disabled={reveal}
                className={cn(
                  "p-3.5 rounded-xl border text-sm font-medium text-left transition-all duration-200 flex items-center justify-between gap-2",
                  !reveal &&
                    "border-border bg-card/40 hover:scale-[1.02] hover:border-primary/50  active:scale-[0.98]",
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
