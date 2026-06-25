import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = {
  q: string;
  options: string[];
  correct: number;
};

type Module = {
  id: string;
  title: string;
  blurb: string;
  questions: Question[];
};

const MODULES: Module[] = [
  {
    id: "signs",
    title: "Signs & Markings",
    blurb: "Regulatory · Warning · Guide",
    questions: [
      { q: "A red octagonal sign always means…", options: ["Yield", "Stop", "Slow", "Detour"], correct: 1 },
      { q: "A yellow diamond sign indicates…", options: ["Regulation", "Warning", "Construction", "Guide"], correct: 1 },
      { q: "Solid white line between lanes means…", options: ["Passing OK", "Discourages lane change", "HOV only", "Bike lane"], correct: 1 },
      { q: "An upside-down triangle is a…", options: ["Stop sign", "Yield sign", "No-entry sign", "Merge sign"], correct: 1 },
      { q: "Pennant-shaped signs warn of…", options: ["School zone", "No passing zone", "Hospital", "Railroad"], correct: 1 },
    ],
  },
  {
    id: "intersections",
    title: "Intersections & Right-of-Way",
    blurb: "Four-way stops · turns · yielding",
    questions: [
      { q: "At a 4-way stop, who goes first when two arrive together?", options: ["Larger vehicle", "Vehicle on the right", "Left turner", "Whoever honks"], correct: 1 },
      { q: "When turning left at a green light you must yield to…", options: ["Pedestrians only", "Oncoming traffic", "Both pedestrians and oncoming traffic", "Nothing"], correct: 2 },
      { q: "Flashing red light means…", options: ["Slow down", "Yield", "Stop, then proceed if clear", "Caution"], correct: 2 },
      { q: "At an uncontrolled T-intersection, the through road…", options: ["Yields", "Has right of way", "Must stop", "Flashes lights"], correct: 1 },
      { q: "Emergency vehicle approaching with sirens — you must…", options: ["Speed up", "Pull right and stop", "Honk", "Block intersection"], correct: 1 },
    ],
  },
  {
    id: "substances",
    title: "Substance Laws & Refusal Acts",
    blurb: "BAC · implied consent · zero tolerance",
    questions: [
      { q: "Adult per-se BAC limit in most states is…", options: ["0.05", "0.08", "0.10", "0.15"], correct: 1 },
      { q: "Under 21, zero-tolerance BAC is typically…", options: ["0.00–0.02", "0.05", "0.08", "0.10"], correct: 0 },
      { q: "Refusing a breath test under implied consent usually causes…", options: ["A warning", "License suspension", "A small fine", "Nothing"], correct: 1 },
      { q: "An open container in the passenger area is…", options: ["Legal", "Illegal in most states", "OK if sealed", "Up to driver"], correct: 1 },
      { q: "Cannabis impairs which driving skill the most?", options: ["Hearing", "Reaction time and judgment", "Vision color", "Hand strength"], correct: 1 },
    ],
  },
  {
    id: "speed",
    title: "Speed & Lane Constraints",
    blurb: "Limits · safe following · lane discipline",
    questions: [
      { q: "Default residential speed limit is typically…", options: ["15 mph", "25 mph", "35 mph", "45 mph"], correct: 1 },
      { q: "Safe following rule is roughly…", options: ["1 car length", "1 second per 10 mph", "3-second rule", "5-second rule"], correct: 2 },
      { q: "On a multi-lane highway, the left lane is for…", options: ["Slow traffic", "Passing and faster traffic", "Trucks only", "Carpools only"], correct: 1 },
      { q: "Speeding in a school zone usually has…", options: ["Same fine", "Doubled fines", "No fine", "Warning only"], correct: 1 },
      { q: "Basic speed law means you must drive…", options: ["At the limit always", "No faster than safe for conditions", "Faster than traffic", "5 under the limit"], correct: 1 },
    ],
  },
];

export function ModuleQuizCenter() {
  const [active, setActive] = useState<Module | null>(null);

  if (active) return <QuizRunner module={active} onExit={() => setActive(null)} />;

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">Module Quiz Center</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
          5-question targeted drills
        </p>
      </div>

      <div className="space-y-3">
        {MODULES.map((m) => (
          <Card key={m.id} className="glass glow-soft p-4 rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold truncate">{m.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{m.blurb}</p>
              </div>
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
            </div>
            <Button
              onClick={() => setActive(m)}
              className="press w-full mt-4 bg-primary text-primary-foreground hover:bg-primary"
              style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
            >
              Start Section Test
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuizRunner({ module: mod, onExit }: { module: Module; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = mod.questions[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= mod.questions.length) setDone(true);
      else {
        setIdx((n) => n + 1);
        setPicked(null);
      }
    }, 750);
  };

  if (done) {
    const pct = Math.round((score / mod.questions.length) * 100);
    return (
      <div className="h-full overflow-y-auto p-5 space-y-4">
        <button onClick={onExit} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to modules
        </button>
        <Card className="glass glow-strong p-8 rounded-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{mod.title}</p>
          <div
            className="font-display text-6xl font-bold text-primary mt-3"
            style={{ textShadow: "0 0 24px var(--color-primary)" }}
          >
            {pct}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {score} of {mod.questions.length} correct
          </p>
          <Button
            onClick={() => {
              setIdx(0); setPicked(null); setScore(0); setDone(false);
            }}
            className="press mt-6 bg-primary text-primary-foreground hover:bg-primary"
          >
            Retake
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <button onClick={onExit} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Exit quiz
      </button>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{mod.title}</span>
        <span>{idx + 1} / {mod.questions.length}</span>
      </div>
      <Card className="glass p-5 rounded-2xl">
        <h3 className="font-display text-base font-semibold mb-4">{q.q}</h3>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isPicked = picked === i;
            const reveal = picked !== null;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={reveal}
                className={cn(
                  "w-full flex items-center justify-between gap-2 p-3 rounded-xl border text-sm text-left transition-all duration-200",
                  !reveal && "hover:border-primary/40 hover:bg-primary/5 press",
                  reveal && isCorrect && "border-emerald-400/60 bg-emerald-500/20 text-emerald-200",
                  reveal && isPicked && !isCorrect && "border-red-400/60 bg-red-500/20 text-red-200",
                  reveal && !isPicked && !isCorrect && "opacity-50 border-border",
                  !reveal && "border-border bg-card/40"
                )}
              >
                <span>{opt}</span>
                {reveal && isCorrect && <Check className="w-4 h-4" />}
                {reveal && isPicked && !isCorrect && <X className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
