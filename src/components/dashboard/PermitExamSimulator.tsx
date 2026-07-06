import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  X,
  Lock,
  Sparkles,
  RefreshCw,
  Timer,
  Trophy,
  AlertTriangle,
  BookOpen,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { getStatePack, type Question as Q } from "@/data/dmv";
import { shuffleAnswers } from "@/data/dmv/question-generator";
import { pickUnseenQuestions } from "@/lib/seen-questions";

export function PermitExamSimulator() {
  const { isPro, unlockPro, state, recordQuizScore } = useUserProfile();
  const pack = getStatePack(state);
  const cfg = { count: pack.rules.questionsCount, pass: pack.rules.passingScorePct };
  const pool = pack.questions;
  const [running, setRunning] = useState(false);


  if (!isPro) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="relative overflow-hidden p-10 rounded-2xl border-primary/40 glass-strong glow-strong text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.04 240 / 0.75), oklch(0.22 0.08 240 / 0.55))",
          }}>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 border border-primary/50"
            style={{ boxShadow: "0 0 36px -4px var(--color-primary)" }}>
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            Unlock Full-Length State-Specific Mock Exams with Pro Pass.
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            Simulates the real {state || "state"} DMV permit test, exact question count,
            passing threshold, and randomized each attempt.
          </p>
          <Button
            onClick={() => unlockPro()}
            className="press mt-6 "
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Get Pro Pass · $19 one-time
          </Button>
        </Card>
      </div>
    );
  }

  if (running) {
    return (
      <ExamRunner
        state={state || "your state"}
        count={Math.min(cfg.count, pool.length)}
        passPct={cfg.pass}
        pool={pool}
        onExit={() => setRunning(false)}
        onComplete={(pct) => recordQuizScore(pct)}
      />
    );
  }


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">State Permit Exam Simulator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Full-length mock test calibrated to the {state || "your state"} DMV.
        </p>
      </div>

      <Card className="glass glow-strong p-8 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 border border-primary/40 text-primary shrink-0"
            style={{ boxShadow: "0 0 24px -4px var(--color-primary)" }}>
            <Timer className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-xl font-bold">
                {state || "Default"} DMV Permit Exam
              </h3>
              <Badge className="bg-primary/15 text-primary border-primary/40 border">
                Pro
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {cfg.count} questions · pass at {cfg.pass}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Stat label="Questions" value={`${cfg.count}`} />
          <Stat label="Pass score" value={`${cfg.pass}%`} />
        </div>


        <Button
          onClick={() => setRunning(true)}
          className="press w-full mt-6 "
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Start full-length exam
        </Button>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Each attempt is freshly randomized, you'll never see the same exam twice.
      </p>
    </div>
  );
}

function ExamRunner({
  state,
  count,
  passPct,
  pool,
  onExit,
  onComplete,
}: {
  state: string;
  count: number;
  passPct: number;
  pool: Q[];
  onExit: () => void;
  onComplete: (pct: number) => void;
}) {
  const lastSetRef = useRef<string>("");
  const buildSet = () => {
    // Pull exclusively from unseen questions for this state's full exam
    // bucket. Auto-resets when the pool is exhausted so the next attempt
    // starts fresh with a fully randomized order.
    let candidate: Q[] = [];
    let key = "";
    let tries = 0;
    do {
      const picked = pickUnseenQuestions("exam:full", state, pool, count);
      candidate = picked.map((q) => shuffleAnswers(q) as Q);
      key = candidate.map((q) => q.q).join("|");
      tries++;
    } while (key === lastSetRef.current && tries < 3);
    lastSetRef.current = key;
    return candidate;
  };

  const [questions, setQuestions] = useState<Q[]>(() => buildSet());
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(count).fill(null));
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const q = questions[idx];
  const reveal = picked !== null;

  const choose = (i: number) => {
    if (reveal) return;
    setPicked(i);
    setAnswers((prev) => {
      const next = prev.slice();
      next[idx] = i;
      return next;
    });
    if (i === q.correct) setScore((s) => s + 1);
  };

  const advance = () => {
    if (idx + 1 >= questions.length) {
      const pct = Math.round((score / questions.length) * 100);
      onComplete(pct);
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPicked(null);
    }
  };

  const restartFresh = () => {
    const next = buildSet();
    setQuestions(next);
    setAnswers(Array(next.length).fill(null));
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setReviewing(false);
  };

  if (done && reviewing) {
    return (
      <ReviewScreen
        state={state}
        questions={questions}
        answers={answers}
        onBack={() => setReviewing(false)}
        onExit={onExit}
      />
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= passPct;
    return (
      <div className="max-w-2xl mx-auto p-5 space-y-5">
        <button onClick={onExit} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to exam
        </button>
        <Card className="glass glow-strong p-10 rounded-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {state} DMV Mock Exam
          </p>
          <div
            className="font-display text-7xl font-bold mt-3"
            style={{
              color: passed ? "rgb(74,222,128)" : "rgb(248,113,113)",
              textShadow: `0 0 28px ${passed ? "rgb(74,222,128)" : "rgb(248,113,113)"}`,
            }}
          >
            {pct}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {score} of {questions.length} correct · pass at {passPct}%
          </p>
          <Badge
            className={cn(
              "mt-4 border",
              passed
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/15 text-amber-300 border-amber-500/40",
            )}
          >
            {passed ? <><Trophy className="w-3 h-3 mr-1" /> Exam Ready</> : <><AlertTriangle className="w-3 h-3 mr-1" /> Not Ready</>}
          </Badge>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Button
              onClick={() => setReviewing(true)}
              className="press "
            >
              <BookOpen className="w-4 h-4" /> Review Answers
            </Button>
            <Button
              variant="outline"
              onClick={restartFresh}
              className="press"
            >
              <RefreshCw className="w-4 h-4" /> Take Another Test
            </Button>
            <Button variant="ghost" className="press" onClick={onExit}>Exit</Button>
          </div>
        </Card>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto p-5 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Exit exam
        </button>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {state} · {idx + 1} / {questions.length}
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
                    "border-border bg-card/40 hover:scale-[1.02] hover:border-primary/50  active:scale-[0.97]",
                  reveal && isCorrect &&
                    "border-emerald-400 bg-emerald-500/25 text-emerald-100 ",
                  reveal && isPicked && !isCorrect &&
                    "border-red-400 bg-red-500/25 text-red-100 ",
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
          <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary font-bold mb-2">
              Explanation
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">{q.explanation}</p>
            <Button
              onClick={advance}
              className="press mt-4 "
            >
              {idx + 1 >= questions.length ? "Finish exam" : "Next question"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function ReviewScreen({
  state,
  questions,
  answers,
  onBack,
  onExit,
}: {
  state: string;
  questions: Q[];
  answers: (number | null)[];
  onBack: () => void;
  onExit: () => void;
}) {
  const correctCount = questions.reduce(
    (n, q, i) => n + (answers[i] === q.correct ? 1 : 0),
    0,
  );
  const skippedCount = answers.filter((a) => a === null).length;

  return (
    <div className="max-w-3xl mx-auto p-5 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to results
        </button>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {state} · Answer Review
        </span>
      </div>

      <Card className="glass glow-soft p-5 rounded-2xl">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Correct" value={`${correctCount}`} />
          <Stat label="Incorrect" value={`${questions.length - correctCount - skippedCount}`} />
          <Stat label="Skipped" value={`${skippedCount}`} />
        </div>
      </Card>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const pick = answers[i];
          const isCorrect = pick === q.correct;
          const isSkipped = pick === null;
          return (
            <Card
              key={i}
              className={cn(
                "glass p-5 rounded-2xl border transition-all duration-200",
                isSkipped
                  ? "border-muted-foreground/30"
                  : isCorrect
                  ? "border-emerald-500/40 "
                  : "border-red-500/40 ",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mt-1 shrink-0">
                    Q{i + 1}
                  </span>
                  <h3 className="font-display text-base font-semibold leading-snug">
                    {q.q}
                  </h3>
                </div>
                <Badge
                  className={cn(
                    "border shrink-0",
                    isSkipped
                      ? "bg-muted/30 text-muted-foreground border-muted-foreground/30"
                      : isCorrect
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                      : "bg-red-500/15 text-red-300 border-red-500/40",
                  )}
                >
                  {isSkipped ? (
                    <><MinusCircle className="w-3 h-3 mr-1" /> Skipped</>
                  ) : isCorrect ? (
                    <><Check className="w-3 h-3 mr-1" /> Correct</>
                  ) : (
                    <><X className="w-3 h-3 mr-1" /> Incorrect</>
                  )}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, j) => {
                  const optCorrect = j === q.correct;
                  const optPicked = pick === j;
                  return (
                    <div
                      key={j}
                      className={cn(
                        "p-3 rounded-xl border text-sm flex items-center justify-between gap-2 transition-all duration-200",
                        optCorrect &&
                          "border-emerald-400 bg-emerald-500/20 text-emerald-100",
                        optPicked && !optCorrect &&
                          "border-red-400 bg-red-500/20 text-red-100",
                        !optCorrect && !optPicked && "border-border bg-card/40 opacity-60",
                      )}
                    >
                      <span>{opt}</span>
                      {optCorrect && <Check className="w-4 h-4 shrink-0" />}
                      {optPicked && !optCorrect && <X className="w-4 h-4 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-primary font-bold mb-2">
                  Step-by-step explanation
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  <span className="font-semibold text-foreground">Correct answer: </span>
                  {q.options[q.correct]}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                  {q.explanation}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 justify-center pt-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="press"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </Button>
        <Button
          onClick={onExit}
          className="press "
        >
          Done
        </Button>
      </div>
    </div>
  );
}

