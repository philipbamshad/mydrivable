import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

type Shape = "octagon" | "triangle-down" | "diamond" | "circle" | "pennant" | "rect";

type Sign = {
  shape: Shape;
  fill: string;
  stroke: string;
  label: string;
  letters?: string;
  options: string[];
  correct: number;
};

const DECK: Sign[] = [
  {
    shape: "octagon", fill: "#dc2626", stroke: "#fff", letters: "STOP",
    label: "Stop",
    options: ["Yield", "Stop", "Do Not Enter", "No Parking"], correct: 1,
  },
  {
    shape: "triangle-down", fill: "#fff", stroke: "#dc2626", letters: "YIELD",
    label: "Yield",
    options: ["Stop", "Merge", "Yield", "Slow"], correct: 2,
  },
  {
    shape: "diamond", fill: "#facc15", stroke: "#000", letters: "🚶",
    label: "Pedestrian Crossing",
    options: ["School Zone", "Pedestrian Crossing", "Falling Rocks", "Slippery"], correct: 1,
  },
  {
    shape: "circle", fill: "#facc15", stroke: "#000", letters: "RR",
    label: "Railroad Crossing Ahead",
    options: ["Roundabout", "Railroad Crossing", "Rest Area", "Highway Exit"], correct: 1,
  },
  {
    shape: "pennant", fill: "#facc15", stroke: "#000", letters: "NO PASS",
    label: "No Passing Zone",
    options: ["No Passing Zone", "End of Lane", "Construction", "Warning"], correct: 0,
  },
  {
    shape: "rect", fill: "#fff", stroke: "#000", letters: "55",
    label: "Speed Limit 55",
    options: ["Minimum Speed", "Distance to Exit", "Speed Limit", "Lane Number"], correct: 2,
  },
  {
    shape: "diamond", fill: "#facc15", stroke: "#000", letters: "⚠",
    label: "General Warning",
    options: ["Regulatory", "Guide", "Warning", "Service"], correct: 2,
  },
  {
    shape: "rect", fill: "#dc2626", stroke: "#fff", letters: "DO NOT ENTER",
    label: "Do Not Enter",
    options: ["Wrong Way", "Do Not Enter", "Stop Ahead", "One Way"], correct: 1,
  },
];

function SignShape({ s }: { s: Sign }) {
  const size = 200;
  const common = "drop-shadow(0 0 28px rgba(59,130,246,0.5))";
  return (
    <div className="grid place-items-center" style={{ width: size, height: size, filter: common }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-label={s.label}>
        {s.shape === "octagon" && (
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
            fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "triangle-down" && (
          <polygon points="5,15 95,15 50,92" fill={s.fill} stroke={s.stroke} strokeWidth="4" />
        )}
        {s.shape === "diamond" && (
          <polygon points="50,5 95,50 50,95 5,50" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "circle" && (
          <circle cx="50" cy="50" r="45" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "pennant" && (
          <polygon points="5,15 95,40 5,65" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.shape === "rect" && (
          <rect x="10" y="10" width="80" height="80" rx="4" fill={s.fill} stroke={s.stroke} strokeWidth="3" />
        )}
        {s.letters && (
          <text x="50" y="55" textAnchor="middle"
            fontSize={s.letters.length > 6 ? 9 : s.letters.length > 3 ? 14 : 22}
            fontWeight="800" fill={s.stroke === "#fff" ? "#fff" : "#000"}
            style={{ fontFamily: "system-ui" }}>
            {s.letters}
          </text>
        )}
      </svg>
    </div>
  );
}

export function SignQuiz() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const sign = DECK[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === sign.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= DECK.length) setDone(true);
      else {
        setIdx((n) => n + 1);
        setPicked(null);
      }
    }, 800);
  };

  const reset = () => { setIdx(0); setPicked(null); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / DECK.length) * 100);
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass glow-strong p-10 rounded-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Sign Quiz Complete
          </p>
          <div className="font-display text-7xl font-bold text-primary mt-3"
            style={{ textShadow: "0 0 28px var(--color-primary)" }}>
            {pct}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {score} of {DECK.length} signs identified
          </p>
          <Button onClick={reset}
            className="press mt-6 bg-primary text-primary-foreground hover:bg-primary">
            <RefreshCw className="w-4 h-4" />
            Run again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Real-Time Sign Quiz</h2>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
            Visual recognition drill
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {idx + 1} / {DECK.length} · {score} correct
        </span>
      </div>

      <Card className="glass glow-soft p-8 rounded-2xl">
        <div className="grid place-items-center py-4">
          <SignShape s={sign} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {sign.options.map((opt, i) => {
            const isCorrect = i === sign.correct;
            const isPicked = picked === i;
            const reveal = picked !== null;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={reveal}
                className={cn(
                  "p-4 rounded-xl border text-sm font-medium transition-all duration-200",
                  !reveal && "border-border bg-card/40 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_20px_-2px_var(--color-primary)] active:scale-[0.97]",
                  reveal && isCorrect && "border-emerald-400 bg-emerald-500/25 text-emerald-100 shadow-[0_0_24px_-2px_rgb(74,222,128)]",
                  reveal && isPicked && !isCorrect && "border-red-400 bg-red-500/25 text-red-100 shadow-[0_0_24px_-2px_rgb(248,113,113)]",
                  reveal && !isPicked && !isCorrect && "opacity-40 border-border"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${((idx + (picked !== null ? 1 : 0)) / DECK.length) * 100}%`,
            boxShadow: "0 0 12px var(--color-primary)",
          }} />
      </div>
    </div>
  );
}
