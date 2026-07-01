import { useRef, useState } from "react";
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
import { SignVisual, type SignSpec } from "./SignVisual";
import { toast } from "sonner";

type Question = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  sign?: SignSpec;
};

type Pillar = {
  id: string;
  title: string;
  blurb: string;
  icon: typeof TrafficCone;
  bank: Question[];
};

const PILLARS: Pillar[] = [
  {
    id: "signs",
    title: "Signs & Markings",
    blurb: "Regulatory · Warning · Guide · Sign recognition drills",
    icon: TrafficCone,
    bank: [
      {
        q: "What does this sign mean?",
        sign: { shape: "octagon", fill: "#dc2626", stroke: "#fff", letters: "STOP" },
        options: ["Yield", "Stop", "Do Not Enter", "Slow"],
        correct: 1,
        explanation:
          "A red octagon ALWAYS means a full stop. You must come to a complete halt behind the line, then proceed when safe.",
      },
      {
        q: "What does this sign mean?",
        sign: { shape: "triangle-down", fill: "#fff", stroke: "#dc2626", letters: "YIELD" },
        options: ["Stop", "Merge", "Yield", "Caution"],
        correct: 2,
        explanation:
          "An inverted triangle is a yield sign. Slow down, give the right of way to traffic and pedestrians, and stop only if needed.",
      },
      {
        q: "What does this yellow diamond sign indicate?",
        sign: { shape: "diamond", fill: "#facc15", stroke: "#000", letters: "⚠" },
        options: ["Regulation", "Warning", "Guide", "Service"],
        correct: 1,
        explanation:
          "Yellow diamond = warning. Something ahead (curve, pedestrian, animal crossing) requires extra attention.",
      },
      {
        q: "What does this sign mean?",
        sign: { shape: "pennant", fill: "#facc15", stroke: "#000", letters: "NO PASS" },
        options: ["No Passing Zone", "End of Lane", "Construction", "Merge"],
        correct: 0,
        explanation:
          "The yellow pennant on the left side of the road marks the start of a no-passing zone. Stay in lane until it ends.",
      },
      {
        q: "What does this sign mean?",
        sign: { shape: "rect", fill: "#dc2626", stroke: "#fff", letters: "DO NOT ENTER" },
        options: ["One Way", "Do Not Enter", "Stop Ahead", "Wrong Way"],
        correct: 1,
        explanation:
          "A red square with white bar means Do Not Enter, you are about to enter traffic going the opposite direction.",
      },
      {
        q: "What does this sign mean?",
        sign: { shape: "circle", fill: "#facc15", stroke: "#000", letters: "RR" },
        options: ["Roundabout", "Railroad Crossing", "Rest Area", "Highway Exit"],
        correct: 1,
        explanation:
          "A yellow circle with RR is the railroad crossing advance warning. Slow down, look, listen, be prepared to stop.",
      },
      {
        q: "A solid white line between two lanes of traffic means…",
        options: [
          "Passing strongly encouraged",
          "Lane changes are discouraged",
          "HOV lane only",
          "Bike lane only",
        ],
        correct: 1,
        explanation:
          "A solid white line means lane changes are discouraged. Cross only when necessary and safe. Double solid white = lane change prohibited.",
      },
      {
        q: "A solid yellow line on YOUR side of the centerline means…",
        options: [
          "Passing allowed",
          "Passing prohibited on your side",
          "Bike lane",
          "Construction zone",
        ],
        correct: 1,
        explanation:
          "Solid yellow on your side = no passing. Only cross when the line on your side is broken/dashed.",
      },
      {
        q: "What color identifies guide signs (directions, mileage, exits)?",
        options: ["Yellow", "Red", "Green", "Orange"],
        correct: 2,
        explanation:
          "Green signs guide drivers, destinations, mileage, exits. Orange = construction, blue = services, brown = recreation.",
      },
      {
        q: "What does this sign warn of?",
        sign: { shape: "diamond", fill: "#facc15", stroke: "#000", letters: "🚶" },
        options: ["School zone", "Pedestrian crossing", "Falling rocks", "Slippery road"],
        correct: 1,
        explanation:
          "The walker symbol on a yellow diamond is a pedestrian crossing warning. Be ready to yield to people on foot.",
      },
      {
        q: "What is the meaning of a flashing yellow traffic signal?",
        options: [
          "Stop completely",
          "Proceed with caution",
          "Pull over for emergency",
          "Signal malfunction, stop",
        ],
        correct: 1,
        explanation:
          "Flashing yellow = proceed with caution, others may not have right-of-way. Flashing red = treat as stop sign.",
      },
      {
        q: "A school zone speed limit sign typically applies when…",
        options: [
          "Always, 24/7",
          "Only when children are present or during posted hours",
          "Only on weekdays",
          "Only when officers are visible",
        ],
        correct: 1,
        explanation:
          "Reduced school-zone limits apply when children are present or during the posted times (often flashing lights / signage indicates active hours).",
      },
    ],
  },
  {
    id: "intersections",
    title: "Intersections & Right-of-Way",
    blurb: "Four-way stops · turns · yielding · merging",
    icon: GitFork,
    bank: [
      {
        q: "Two cars arrive at a 4-way stop at the same time. Who has the right of way?",
        options: [
          "The larger vehicle",
          "The car on the right",
          "The car turning left",
          "Whoever honks first",
        ],
        correct: 1,
        explanation:
          "When two vehicles arrive simultaneously at a 4-way stop, the driver on the right has the right-of-way.",
      },
      {
        q: "When turning left at a green light (no arrow), you must yield to…",
        options: [
          "Only pedestrians",
          "Only oncoming traffic",
          "Both oncoming traffic AND pedestrians",
          "Nothing, you have the light",
        ],
        correct: 2,
        explanation:
          "Green ball is permissive, you must yield to oncoming traffic AND pedestrians in the crosswalk before turning.",
      },
      {
        q: "A flashing red light means…",
        options: [
          "Slow down and continue",
          "Yield to oncoming traffic",
          "Stop fully, then proceed when safe",
          "Caution, signal broken",
        ],
        correct: 2,
        explanation:
          "Flashing red is treated exactly like a stop sign, full stop, then proceed when safe.",
      },
      {
        q: "An emergency vehicle approaches with lights and sirens. You should…",
        options: [
          "Speed up to clear the way",
          "Pull to the right edge of the road and stop",
          "Honk to warn other drivers",
          "Continue at normal speed",
        ],
        correct: 1,
        explanation:
          "Pull to the right and stop until the emergency vehicle passes. Never block an intersection.",
      },
      {
        q: "At an uncontrolled intersection where a road ends at a 'T', who has the right of way?",
        options: [
          "The vehicle on the terminating road",
          "The through-road traffic",
          "Whoever arrived first",
          "Either, no rule applies",
        ],
        correct: 1,
        explanation:
          "Through-road traffic has the right of way. Traffic on the terminating road must yield before entering.",
      },
      {
        q: "When entering a roundabout, you must…",
        options: [
          "Stop fully before entering",
          "Yield to traffic already inside the circle",
          "Honk to announce yourself",
          "Speed up to merge",
        ],
        correct: 1,
        explanation:
          "Roundabouts use yield-on-entry. Traffic already circulating has the right of way; enter only in a safe gap.",
      },
      {
        q: "A school bus is stopped with its red lights flashing on an undivided road. You should…",
        options: [
          "Pass slowly on the left",
          "Stop in both directions",
          "Stop only if you are behind the bus",
          "Honk and continue",
        ],
        correct: 1,
        explanation:
          "On an undivided road, traffic in BOTH directions must stop until the red lights stop flashing.",
      },
      {
        q: "You're at a green light but the intersection is blocked. You should…",
        options: [
          "Enter anyway, you have the green",
          "Wait until you can clear it without stopping inside",
          "Honk at the cars ahead",
          "Turn right instead",
        ],
        correct: 1,
        explanation:
          "'Don't block the box', never enter an intersection unless you can fully clear it. Blocking is illegal in most states.",
      },
      {
        q: "Right turn on red is permitted unless…",
        options: [
          "Always permitted",
          "A sign prohibits it OR a red arrow is displayed",
          "Only during daytime",
          "Only with a passenger",
        ],
        correct: 1,
        explanation:
          "Right on red is legal after a full stop UNLESS a 'No Turn on Red' sign is posted or the signal shows a red arrow.",
      },
      {
        q: "When two cars approach each other on a narrow mountain road and one must back up…",
        options: [
          "The vehicle going downhill backs up",
          "The vehicle going uphill backs up",
          "The smaller vehicle backs up",
          "Whoever arrived first goes first",
        ],
        correct: 0,
        explanation:
          "The vehicle going downhill yields and backs up, the uphill vehicle has the harder restart and right-of-way.",
      },
    ],
  },
  {
    id: "substances",
    title: "Substance Laws",
    blurb: "BAC · implied consent · zero tolerance · DUI",
    icon: Beer,
    bank: [
      {
        q: "The standard per-se adult BAC limit in most U.S. states is…",
        options: ["0.05%", "0.08%", "0.10%", "0.15%"],
        correct: 1,
        explanation:
          "0.08% BAC is the federal standard for adult drivers. Utah has lowered it to 0.05%. Commercial drivers: 0.04%.",
      },
      {
        q: "Under zero-tolerance laws, the BAC limit for drivers under 21 is typically…",
        options: ["0.00–0.02%", "0.05%", "0.08%", "0.10%"],
        correct: 0,
        explanation:
          "Most states set the under-21 limit at 0.00–0.02%, essentially any detectable alcohol can result in license suspension.",
      },
      {
        q: "Under implied consent laws, refusing a breathalyzer typically results in…",
        options: [
          "A warning",
          "Automatic license suspension",
          "A small fine",
          "Nothing, it's your right",
        ],
        correct: 1,
        explanation:
          "By accepting a driver's license, you 'imply consent' to chemical testing. Refusal triggers automatic license suspension, often longer than a DUI conviction.",
      },
      {
        q: "An open alcohol container in the passenger area is…",
        options: [
          "Legal if you're not drinking",
          "Illegal in nearly every state",
          "Legal if sealed",
          "Up to the driver",
        ],
        correct: 1,
        explanation:
          "Almost every state prohibits open containers in the passenger compartment of a moving vehicle, even for passengers.",
      },
      {
        q: "Cannabis impairment most affects which driving skill?",
        options: [
          "Hearing",
          "Reaction time and judgment",
          "Color vision",
          "Hand strength",
        ],
        correct: 1,
        explanation:
          "THC slows reaction time, impairs short-term memory, and damages judgment of speed and distance, all critical to safe driving.",
      },
      {
        q: "Mixing alcohol with prescription medication…",
        options: [
          "Has no effect on driving",
          "Can dramatically increase impairment",
          "Cancels out the alcohol",
          "Is only an issue at high doses",
        ],
        correct: 1,
        explanation:
          "Many medications amplify alcohol's impairing effects. Always read warning labels and never combine without checking with a doctor.",
      },
      {
        q: "A first-offense DUI conviction typically includes…",
        options: [
          "Just a fine",
          "Fines, license suspension, possible jail, mandatory education",
          "Only license points",
          "Warning letter",
        ],
        correct: 1,
        explanation:
          "Even a first DUI typically involves fines, license suspension, possible jail time, mandatory alcohol education, and dramatically higher insurance for years.",
      },
      {
        q: "How long does the body take to eliminate one standard drink?",
        options: ["15 minutes", "About 1 hour", "3 hours", "Depends only on size"],
        correct: 1,
        explanation:
          "The liver metabolizes roughly one standard drink per hour. Coffee, cold showers, and food do NOT speed this up.",
      },
    ],
  },
  {
    id: "speed",
    title: "Speed & Lane Constraints",
    blurb: "Limits · safe following · lane discipline",
    icon: Gauge,
    bank: [
      {
        q: "Default residential speed limit (unposted) is typically…",
        options: ["15 mph", "25 mph", "35 mph", "45 mph"],
        correct: 1,
        explanation:
          "Most states default residential streets to 25 mph unless posted otherwise. School zones and alleys are often lower.",
      },
      {
        q: "The safe following distance rule of thumb is…",
        options: [
          "1 car length",
          "1 second per 10 mph",
          "The 3-second rule",
          "5 car lengths regardless of speed",
        ],
        correct: 2,
        explanation:
          "The 3-second rule: pick a fixed point, count to 3 after the vehicle ahead passes it. In rain/snow, extend to 4–6 seconds.",
      },
      {
        q: "On a multi-lane highway, the leftmost lane is generally for…",
        options: [
          "Slow traffic",
          "Passing and faster through-traffic",
          "Trucks only",
          "Carpools only",
        ],
        correct: 1,
        explanation:
          "Left lane = passing and faster traffic. Keep right except to pass, slow drivers in the left lane cause crashes.",
      },
      {
        q: "Penalties for speeding in a school zone are typically…",
        options: [
          "Same as regular speeding",
          "Doubled or higher",
          "No fine",
          "Just a warning",
        ],
        correct: 1,
        explanation:
          "School zones, work zones, and safety corridors typically carry doubled (or higher) fines.",
      },
      {
        q: "The 'basic speed law' means you must drive…",
        options: [
          "Exactly the posted limit",
          "No faster than is safe for conditions",
          "At least the minimum posted speed",
          "5 mph under the limit",
        ],
        correct: 1,
        explanation:
          "Even at the posted limit, you can be cited if conditions (rain, fog, traffic) make that speed unsafe. Adjust to conditions.",
      },
      {
        q: "When you skid on a wet road, you should…",
        options: [
          "Slam the brakes",
          "Steer in the direction of the skid, ease off the gas",
          "Turn the wheel sharply the other way",
          "Pull the parking brake",
        ],
        correct: 1,
        explanation:
          "Steer where you want to go (into the skid), ease off the accelerator, and avoid hard braking, let traction recover.",
      },
      {
        q: "Hydroplaning is most likely to begin at speeds of about…",
        options: ["10 mph", "25 mph", "35+ mph", "65+ mph"],
        correct: 2,
        explanation:
          "Hydroplaning can start near 35 mph on wet roads with worn tires. Slow down in rain, water depth + speed + tread wear = lift-off.",
      },
      {
        q: "When merging onto a freeway from an on-ramp you should…",
        options: [
          "Stop at the end of the ramp",
          "Match traffic speed and merge into a gap",
          "Honk and force in",
          "Wait until the lane is empty",
        ],
        correct: 1,
        explanation:
          "Use the on-ramp to match the speed of freeway traffic, then merge smoothly. Stopping on an on-ramp is dangerous and often illegal.",
      },
    ],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TestHubDashboard() {
  const { isPro, unlockPro } = useUserProfile();
  const [active, setActive] = useState<Pillar | null>(null);

  if (active) {
    return <QuizRunner pillar={active} onExit={() => setActive(null)} />;
  }

  return (
    <div className="relative max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Permit Pillar Quiz Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drill the four topics examiners weight most. Endless randomized sets.
        </p>
      </div>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-5 transition-all", !isPro && "blur-sm pointer-events-none select-none")}>
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.id} className="glass glow-soft p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 border border-primary/40 text-primary shrink-0"
                  style={{ boxShadow: "0 0 20px -4px var(--color-primary)" }}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.blurb}</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/30 text-primary">
                  {p.bank.length} qs
                </Badge>
              </div>
              <Button
                onClick={() => setActive(p)}
                className="press w-full "
              >
                <Sparkles className="w-4 h-4" /> Start Test
              </Button>
            </Card>
          );
        })}
      </div>

      {!isPro && (
        <div className="absolute inset-0 grid place-items-center">
          <Card className="glass-strong glow-strong p-8 rounded-2xl text-center max-w-md mx-auto">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 border border-primary/40 mx-auto mb-4"
              style={{ boxShadow: "0 0 24px -4px var(--color-primary)" }}>
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold">Pro Pass Required</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Unlock all 4 pillar quizzes, endless randomized sets, and instant explanations.
            </p>
            <Button
              onClick={() => unlockPro()}

              className="press mt-5 "
            >
              Unlock Pro
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function QuizRunner({ pillar, onExit }: { pillar: Pillar; onExit: () => void }) {
  const { recordQuizScore } = useUserProfile();
  const lastSetRef = useRef<string>("");
  const TAKE = Math.min(8, pillar.bank.length);

  const buildSet = () => {
    let candidate: Question[];
    let key = "";
    let tries = 0;
    do {
      candidate = shuffle(pillar.bank).slice(0, TAKE);
      key = candidate.map((q) => q.q).join("|");
      tries++;
    } while (key === lastSetRef.current && tries < 5);
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
      const pct = Math.round(((score + (picked === q.correct ? 0 : 0)) / questions.length) * 100);
      recordQuizScore(pct);
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
        <button onClick={onExit} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to pillars
        </button>
        <Card className="glass glow-strong p-10 rounded-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{pillar.title}</p>
          <div className="font-display text-7xl font-bold text-primary mt-3"
            style={{ textShadow: "0 0 28px var(--color-primary)" }}>
            {pct}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {score} of {questions.length} correct
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={restartFresh}
              className="press "
          >
              <RefreshCw className="w-4 h-4" /> New Set
            </Button>
            <Button variant="outline" className="press" onClick={onExit}>Exit</Button>
          </div>
        </Card>
      </div>
    );
  }

  const reveal = picked !== null;

  return (
    <div className="max-w-3xl mx-auto p-5 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Exit
        </button>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {pillar.title} · {idx + 1} / {questions.length}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${((idx + (reveal ? 1 : 0)) / questions.length) * 100}%`,
            boxShadow: "0 0 12px var(--color-primary)",
          }} />
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
                  reveal && isCorrect &&
                    "border-emerald-400 bg-emerald-500/25 text-emerald-100 ",
                  reveal && isPicked && !isCorrect &&
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
            <Button onClick={advance}
              className="press mt-4 "
          >
              {idx + 1 >= questions.length ? "See score" : "Next question"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

