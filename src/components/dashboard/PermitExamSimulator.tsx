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

type Q = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

// State-specific DMV permit exam configuration (length + passing %).
const STATE_EXAM: Record<string, { count: number; pass: number }> = {
  California: { count: 46, pass: 83 },
  Texas: { count: 30, pass: 80 },
  Florida: { count: 50, pass: 80 },
  "New York": { count: 20, pass: 70 },
  Illinois: { count: 35, pass: 80 },
  Washington: { count: 40, pass: 80 },
  Georgia: { count: 40, pass: 75 },
  Pennsylvania: { count: 18, pass: 83 },
  Ohio: { count: 40, pass: 75 },
  Michigan: { count: 50, pass: 80 },
  Arizona: { count: 30, pass: 80 },
  Massachusetts: { count: 25, pass: 72 },
  "New Jersey": { count: 50, pass: 80 },
  Virginia: { count: 35, pass: 80 },
  "North Carolina": { count: 25, pass: 80 },
};

const DEFAULT_EXAM = { count: 25, pass: 80 };

// Broad randomized question pool drawing from every pillar.
const POOL: Q[] = [
  { q: "What does a red octagonal sign mean?", options: ["Yield", "Stop completely", "Slow", "Do not enter"], correct: 1, explanation: "Red octagon = full stop behind the line." },
  { q: "An inverted (point-down) triangle sign means…", options: ["Stop", "Yield", "Merge", "Warning"], correct: 1, explanation: "Inverted triangle = yield. Slow down, stop only if needed." },
  { q: "A yellow diamond sign is…", options: ["Regulatory", "Warning", "Guide", "Service"], correct: 1, explanation: "Yellow diamond signs warn of upcoming conditions." },
  { q: "Solid white line between lanes means…", options: ["Pass freely", "Lane change discouraged", "HOV", "Bike lane"], correct: 1, explanation: "Solid white = lane change discouraged; cross only when needed." },
  { q: "Solid yellow line on your side means…", options: ["Pass allowed", "No passing", "Bike lane", "Construction"], correct: 1, explanation: "Solid yellow on your side = no passing." },
  { q: "Green guide signs indicate…", options: ["Warnings", "Services", "Directions/mileage", "Construction"], correct: 2, explanation: "Green signs guide drivers — directions, exits, mileage." },
  { q: "Flashing yellow signal means…", options: ["Stop completely", "Proceed with caution", "Pull over", "Malfunction — stop"], correct: 1, explanation: "Flashing yellow = proceed with caution." },
  { q: "Flashing red signal means…", options: ["Stop, then proceed when safe", "Slow down", "Yield", "Continue"], correct: 0, explanation: "Flashing red is treated as a stop sign." },
  { q: "Two cars arrive at a 4-way stop together. Who goes first?", options: ["Left", "Right", "Larger vehicle", "Whoever honks"], correct: 1, explanation: "At a 4-way stop, the car on the right has right-of-way." },
  { q: "Turning left at a green (no arrow), you yield to…", options: ["Only pedestrians", "Only oncoming traffic", "Oncoming traffic AND pedestrians", "Nothing"], correct: 2, explanation: "Green ball = permissive; yield to oncoming traffic AND pedestrians." },
  { q: "Emergency vehicle with lights and sirens approaches. You…", options: ["Speed up", "Pull right and stop", "Honk", "Continue"], correct: 1, explanation: "Pull to the right edge of the road and stop." },
  { q: "Entering a roundabout, you must…", options: ["Stop fully", "Yield to traffic in the circle", "Honk", "Speed up"], correct: 1, explanation: "Yield to traffic already in the roundabout." },
  { q: "School bus stopped with flashing red lights on undivided road…", options: ["Pass slowly left", "Stop in both directions", "Only stop if behind", "Honk and continue"], correct: 1, explanation: "Both directions must stop on an undivided road." },
  { q: "Right turn on red is permitted unless…", options: ["Always permitted", "A sign prohibits it or red arrow shown", "Only daytime", "Only with passenger"], correct: 1, explanation: "Right on red is legal after a full stop unless prohibited." },
  { q: "Standard adult BAC limit in most states…", options: ["0.05%", "0.08%", "0.10%", "0.15%"], correct: 1, explanation: "0.08% is the federal standard for adults." },
  { q: "Under-21 BAC limit (zero tolerance) is typically…", options: ["0.00–0.02%", "0.05%", "0.08%", "0.10%"], correct: 0, explanation: "Most states: 0.00–0.02% for under-21." },
  { q: "Refusing a breathalyzer under implied consent results in…", options: ["Warning", "Automatic license suspension", "Small fine", "Nothing"], correct: 1, explanation: "Implied consent = refusal triggers automatic suspension." },
  { q: "Open container in the passenger area is…", options: ["Legal if not drinking", "Illegal in nearly every state", "Legal if sealed", "Up to driver"], correct: 1, explanation: "Open containers are prohibited in nearly every state." },
  { q: "Default residential speed limit (unposted) is typically…", options: ["15 mph", "25 mph", "35 mph", "45 mph"], correct: 1, explanation: "Most states default residential streets to 25 mph." },
  { q: "Safe following distance rule…", options: ["1 car length", "1 second per 10 mph", "3-second rule", "5 car lengths"], correct: 2, explanation: "Use the 3-second rule; extend in rain/snow." },
  { q: "Left lane on a multi-lane highway is for…", options: ["Slow traffic", "Passing/faster traffic", "Trucks", "Carpool only"], correct: 1, explanation: "Keep right except to pass." },
  { q: "School/work zone fines are typically…", options: ["Same as normal", "Doubled or higher", "None", "Warning only"], correct: 1, explanation: "School/work zone fines are typically doubled." },
  { q: "Basic speed law means…", options: ["Always drive posted limit", "No faster than safe for conditions", "Drive minimum", "5 under limit"], correct: 1, explanation: "Drive no faster than is safe for conditions." },
  { q: "If you skid on a wet road, you should…", options: ["Slam brakes", "Steer into skid, ease off gas", "Turn opposite", "Pull parking brake"], correct: 1, explanation: "Steer where you want to go and ease off the gas." },
  { q: "Hydroplaning can start around…", options: ["10 mph", "25 mph", "35+ mph", "65+ mph"], correct: 2, explanation: "Hydroplaning can start near 35 mph on wet roads." },
  { q: "Merging onto a freeway you should…", options: ["Stop at ramp end", "Match traffic speed and merge in a gap", "Honk and force in", "Wait for empty lane"], correct: 1, explanation: "Match speed of freeway traffic and merge smoothly." },
  { q: "A pedestrian at a marked crosswalk has…", options: ["No right of way", "Right of way", "Right of way only at lights", "Right of way at night only"], correct: 1, explanation: "Pedestrians in crosswalks have right of way." },
  { q: "When parking on a hill facing downhill with a curb…", options: ["Turn wheels left toward curb", "Turn wheels right toward curb", "Wheels straight", "Pull e-brake only"], correct: 1, explanation: "Downhill with curb: turn wheels into the curb (right)." },
  { q: "When parking on a hill facing uphill with a curb…", options: ["Wheels left away from curb", "Wheels right toward curb", "Wheels straight", "Doesn't matter"], correct: 0, explanation: "Uphill with curb: turn wheels away from the curb (left)." },
  { q: "Driving in fog you should use…", options: ["High beams", "Low beams or fog lights", "Hazards while moving", "No lights"], correct: 1, explanation: "Low beams/fog lights; high beams glare back." },
  { q: "ABS brakes during emergency stop — you should…", options: ["Pump brakes", "Press and hold firmly", "Ease off and re-apply", "Use parking brake"], correct: 1, explanation: "With ABS, press and hold firmly; the system pulses for you." },
  { q: "A double solid yellow line means…", options: ["Pass freely", "Pass only with care", "No passing in either direction", "HOV only"], correct: 2, explanation: "Double solid yellow = no passing either direction." },
  { q: "A 'No Turn on Red' sign means…", options: ["Right on red ok after stop", "Right on red prohibited", "Left turn only", "Yield on red"], correct: 1, explanation: "Right on red is prohibited where posted." },
  { q: "Headlights are required from…", options: ["Sunset to sunrise / low visibility", "Only after midnight", "Only in rain", "Only on highways"], correct: 0, explanation: "Headlights required from sunset to sunrise and in low visibility." },
  { q: "When following a motorcycle you should…", options: ["Tailgate to be seen", "Allow extra following distance", "Pass aggressively", "Use high beams"], correct: 1, explanation: "Motorcycles can stop faster — allow extra following distance." },
  { q: "Texting while driving is…", options: ["Legal if hands-free", "Illegal in nearly every state", "Legal at lights", "Up to driver"], correct: 1, explanation: "Texting while driving is illegal in nearly every state." },
  { q: "A flashing yellow arrow for left turn means…", options: ["Protected turn", "Turn allowed but yield to oncoming", "Stop", "No turn"], correct: 1, explanation: "Flashing yellow arrow = turn permitted, yield to oncoming traffic." },
  { q: "On a 4-lane divided highway, school bus stops with flashing reds. Oncoming traffic must…", options: ["Stop", "Slow only", "Not required to stop", "Honk"], correct: 2, explanation: "On a divided highway, oncoming traffic does NOT need to stop." },
  { q: "If your tire blows out you should…", options: ["Slam brakes", "Grip wheel, ease off gas, coast to side", "Turn sharply", "Pull e-brake"], correct: 1, explanation: "Grip the wheel firmly, ease off gas, slow gradually." },
  { q: "Minimum safe distance behind an emergency vehicle is typically…", options: ["100 ft / 30 m", "500 ft / 150 m", "1 car length", "10 ft"], correct: 1, explanation: "Most states require 500 ft (~150 m) following distance behind emergency vehicles." },
  { q: "BAC for commercial drivers is…", options: ["0.02%", "0.04%", "0.08%", "0.10%"], correct: 1, explanation: "Commercial drivers: 0.04% federal limit." },
  { q: "Move Over laws require you to…", options: ["Speed up past stopped emergency vehicles", "Change lanes away or slow down", "Honk", "Stop completely"], correct: 1, explanation: "Move Over: change lanes away from stopped emergency vehicles, or slow significantly." },
  { q: "A solid green arrow means…", options: ["Yield while turning", "Protected turn — yield to nothing in your path", "Stop", "Caution"], correct: 1, explanation: "Solid green arrow = protected turn; oncoming traffic is stopped." },
  { q: "Cannabis affects driving by…", options: ["Improving reflexes", "Slowing reaction and impairing judgment", "Sharpening vision", "Nothing"], correct: 1, explanation: "THC slows reaction and impairs judgment of speed/distance." },
  { q: "Three-point turn (K-turn) requires you to check…", options: ["Mirror only", "Both directions and mirrors", "Just forward", "Nothing if road is empty"], correct: 1, explanation: "Always check both directions and mirrors before each move." },
  { q: "Pedestrian holding a white cane has…", options: ["No right of way", "Absolute right of way", "RoW only at lights", "RoW only at crosswalks"], correct: 1, explanation: "A pedestrian with a white cane or guide dog has absolute right of way." },
  { q: "When passing a bicyclist most states require…", options: ["1 foot", "3 feet of clearance", "Honk while passing", "Pass in same lane closely"], correct: 1, explanation: "Most states require at least 3 feet of clearance." },
  { q: "Backing up safely you should…", options: ["Use mirrors only", "Turn your head and look back", "Reverse fast to clear", "Trust the backup camera alone"], correct: 1, explanation: "Always turn your head and look — camera/mirrors have blind spots." },
  { q: "Yellow traffic light means…", options: ["Speed up", "Stop if you can do so safely", "Continue at speed", "Yield to opposite"], correct: 1, explanation: "Yellow = stop if you can do so safely." },
  { q: "First-offense DUI typically includes…", options: ["Warning", "Fines, suspension, possible jail, education", "Just points", "Nothing"], correct: 1, explanation: "Even first DUI involves fines, suspension, possible jail, mandatory education." },
  { q: "Liver metabolizes about one standard drink per…", options: ["15 min", "1 hour", "3 hours", "Depends on size"], correct: 1, explanation: "~1 drink per hour. Coffee and food do not speed this up." },
  { q: "Highway hypnosis is best avoided by…", options: ["Driving longer", "Frequent breaks, varying focus", "Cruise control max", "Loud music alone"], correct: 1, explanation: "Take breaks every 2 hours; keep eyes scanning, not fixed." },
  { q: "Roundabout: signal usage when exiting…", options: ["No signal needed", "Right turn signal before exit", "Left signal entering", "Hazards"], correct: 1, explanation: "Signal right before your exit so others know you're leaving." },
  { q: "Driving with worn tire tread is dangerous because…", options: ["Better grip", "Loss of traction, longer stops, hydroplane risk", "Lower fuel use", "It is fine"], correct: 1, explanation: "Worn tread loses traction, lengthens stops, raises hydroplane risk." },
  { q: "Sharing the road with large trucks — best practice…", options: ["Cut in front close after passing", "Avoid blind spots (No-Zones)", "Tailgate to draft", "Pass on right shoulder"], correct: 1, explanation: "Trucks have large blind spots; avoid lingering beside them." },
  { q: "Driving on wet leaves is similar to…", options: ["Dry pavement", "Ice — reduced traction", "Gravel only", "Sand"], correct: 1, explanation: "Wet leaves act like ice — reduce speed and avoid sudden moves." },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PermitExamSimulator() {
  const { isPro, unlockPro, state, recordQuizScore } = useUserProfile();
  const cfg = (state && STATE_EXAM[state]) || DEFAULT_EXAM;
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
            Simulates the real {state || "state"} DMV permit test — exact question count,
            passing threshold, and randomized each attempt.
          </p>
          <Button
            onClick={() => unlockPro()}
            className="press mt-6 bg-primary text-primary-foreground hover:bg-primary"
            style={{ boxShadow: "0 0 24px -2px var(--color-primary)" }}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Upgrade to Pro · $9 / mo
          </Button>
        </Card>
      </div>
    );
  }

  if (running) {
    return (
      <ExamRunner
        state={state || "your state"}
        count={Math.min(cfg.count, POOL.length)}
        passPct={cfg.pass}
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

        <div className="grid grid-cols-3 gap-3 mt-6">
          <Stat label="Questions" value={`${cfg.count}`} />
          <Stat label="Pass score" value={`${cfg.pass}%`} />
          <Stat label="Pool size" value={`${POOL.length}+`} />
        </div>

        <Button
          onClick={() => setRunning(true)}
          className="press w-full mt-6 bg-primary text-primary-foreground hover:bg-primary"
          style={{ boxShadow: "0 0 24px -2px var(--color-primary)" }}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Start full-length exam
        </Button>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Each attempt is freshly randomized — you'll never see the same exam twice.
      </p>
    </div>
  );
}

function ExamRunner({
  state,
  count,
  passPct,
  onExit,
  onComplete,
}: {
  state: string;
  count: number;
  passPct: number;
  onExit: () => void;
  onComplete: (pct: number) => void;
}) {
  const lastSetRef = useRef<string>("");
  const buildSet = () => {
    let candidate: Q[] = [];
    let key = "";
    let tries = 0;
    do {
      candidate = shuffle(POOL).slice(0, count);
      key = candidate.map((q) => q.q).join("|");
      tries++;
    } while (key === lastSetRef.current && tries < 5);
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
              className="press bg-primary text-primary-foreground hover:bg-primary"
              style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
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
                    "border-border bg-card/40 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_20px_-2px_var(--color-primary)] active:scale-[0.97]",
                  reveal && isCorrect &&
                    "border-emerald-400 bg-emerald-500/25 text-emerald-100 shadow-[0_0_24px_-2px_rgb(74,222,128)]",
                  reveal && isPicked && !isCorrect &&
                    "border-red-400 bg-red-500/25 text-red-100 shadow-[0_0_24px_-2px_rgb(248,113,113)]",
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
              className="press mt-4 bg-primary text-primary-foreground hover:bg-primary"
              style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
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
