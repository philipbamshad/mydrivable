import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Clock,
  Minus,
  Plus,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUserProfile } from "@/lib/user-profile";

// ---------------- Section 1: Hours log ----------------

function HoursLogger() {
  const { driveHours, addDriveSession } = useUserProfile();
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<"hours" | "minutes">("hours");

  const adjust = (sign: 1 | -1) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a positive number first.");
      return;
    }
    const minutes = Math.round((unit === "hours" ? n * 60 : n)) * sign;
    if (sign === -1 && Math.abs(minutes) / 60 > driveHours) {
      toast.error("Can't subtract more than your current total.");
      return;
    }
    addDriveSession({
      minutes,
      environment: "city",
      conditions: "day",
      maneuvers: [],
      note: sign === 1 ? "Quick log" : "Manual correction",
      supervisorApproved: false,
    });
    toast.success(
      sign === 1
        ? `Added ${n} ${unit} to your log.`
        : `Subtracted ${n} ${unit} from your log.`,
    );
    setValue("");
  };

  return (
    <Card className="glass glow-soft rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
            Hours Logged
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Track total time behind the wheel.
          </p>
        </div>
        <Clock className="w-5 h-5 text-primary" />
      </div>

      <div className="flex items-baseline gap-2 mb-6">
        <span
          className="font-display text-5xl font-bold text-primary"
          style={{ textShadow: "0 0 24px var(--color-primary)" }}
        >
          {driveHours.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
          total hrs
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.25}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={unit === "hours" ? "e.g. 1.5" : "e.g. 45"}
            className="bg-background/50 border-border focus-visible:ring-primary"
          />
          <div className="flex rounded-md border border-border overflow-hidden shrink-0">
            {(["hours", "minutes"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={cn(
                  "px-3 text-[11px] uppercase tracking-[0.18em] font-bold press transition-all",
                  unit === u
                    ? "bg-primary/15 text-primary"
                    : "bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {u === "hours" ? "Hrs" : "Min"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => adjust(1)}
            className="press bg-primary text-primary-foreground hover:bg-primary"
            style={{ boxShadow: "0 0 18px -4px var(--color-primary)" }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add
          </Button>
          <Button
            onClick={() => adjust(-1)}
            variant="outline"
            className="press border-border hover:border-primary/50"
          >
            <Minus className="w-4 h-4 mr-1.5" /> Subtract
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------- Section 2: Scenario Simulator ----------------

type Choice = { id: string; text: string; correct: boolean; tip: string };
type Scenario = {
  id: string;
  title: string;
  setup: string;
  prompt: string;
  choices: Choice[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "freeway-merge",
    title: "Merging onto a Freeway",
    setup:
      "You're on a short on-ramp. Traffic in the right lane is moving at 65 mph and there's a tight gap two cars ahead.",
    prompt: "What's your safest move?",
    choices: [
      {
        id: "a",
        text: "Match freeway speed on the ramp, signal early, and merge into the gap.",
        correct: true,
        tip: "Matching the flow of traffic lets you slip in smoothly without forcing other drivers to brake — the defensive choice every time.",
      },
      {
        id: "b",
        text: "Slow down at the end of the ramp and wait for a bigger opening.",
        correct: false,
        tip: "Stopping on a ramp is dangerous — you lose the runway you need to match speed and risk a rear-end collision.",
      },
      {
        id: "c",
        text: "Speed past traffic and merge into the left lane.",
        correct: false,
        tip: "Cutting across multiple lanes from a merge is illegal in most states and unpredictable to other drivers.",
      },
    ],
  },
  {
    id: "tailgater",
    title: "Handling a Tailgater",
    setup:
      "You're going the speed limit on a two-lane road. A driver is right on your bumper, flashing their lights.",
    prompt: "What's the right response?",
    choices: [
      {
        id: "a",
        text: "Tap your brakes to send them a message.",
        correct: false,
        tip: "Brake-checking provokes road rage and can cause a crash you'd be liable for. Never escalate.",
      },
      {
        id: "b",
        text: "Stay calm, increase your following distance to the car ahead, and move over when it's safe.",
        correct: true,
        tip: "More space ahead gives you a buffer if you need to brake gradually instead of suddenly. Letting them pass removes the threat entirely.",
      },
      {
        id: "c",
        text: "Speed up to put distance between you.",
        correct: false,
        tip: "You'd be breaking the speed limit and they'll likely keep pace. Defensive driving means controlling space, not racing.",
      },
    ],
  },
  {
    id: "blind-intersection",
    title: "Approaching a Blind Intersection",
    setup:
      "You're approaching a four-way intersection with parked cars and shrubs blocking the cross street. You have the right of way.",
    prompt: "How do you proceed?",
    choices: [
      {
        id: "a",
        text: "Maintain speed since you have the right of way.",
        correct: false,
        tip: "Right of way doesn't protect you from a driver who doesn't see you. Visibility wins over right of way every time.",
      },
      {
        id: "b",
        text: "Cover the brake, slow down, and scan left-right-left before entering.",
        correct: true,
        tip: "Covering the brake cuts your reaction time, and the slow approach buys you space to react to anyone running the cross street.",
      },
      {
        id: "c",
        text: "Honk to alert other drivers.",
        correct: false,
        tip: "A horn doesn't make you visible — it just notifies. You still need to slow down and scan.",
      },
    ],
  },
  {
    id: "wet-road",
    title: "Sudden Rain on the Highway",
    setup:
      "It starts pouring while you're cruising at 70 mph. The road surface looks glossy and your wipers can barely keep up.",
    prompt: "Best response?",
    choices: [
      {
        id: "a",
        text: "Ease off the gas gradually, increase following distance, and turn on low-beam headlights.",
        correct: true,
        tip: "Gradual deceleration prevents hydroplaning and low-beams improve your visibility to others without glaring off the rain.",
      },
      {
        id: "b",
        text: "Brake firmly to drop to a safe speed quickly.",
        correct: false,
        tip: "Hard braking on wet pavement is the fastest way to lose traction and skid. Always shed speed slowly in the rain.",
      },
      {
        id: "c",
        text: "Switch on your high-beams to see better.",
        correct: false,
        tip: "High-beams reflect off the rain and reduce your visibility. Low-beams (or fog lights) are the right call.",
      },
    ],
  },
  {
    id: "yellow-light",
    title: "Yellow Light Decision",
    setup:
      "You're 80 feet from a signal when it turns yellow. You're going 35 mph and there's a car close behind you.",
    prompt: "What do you do?",
    choices: [
      {
        id: "a",
        text: "Slam the brakes to stop before the line.",
        correct: false,
        tip: "Slamming the brakes with a car close behind invites a rear-end collision. The right call depends on whether you can stop safely.",
      },
      {
        id: "b",
        text: "Assess: if you can stop smoothly, do it. If not, maintain speed and clear the intersection before red.",
        correct: true,
        tip: "Yellow means 'clear if you can't safely stop.' Check your stopping distance and the car behind before deciding.",
      },
      {
        id: "c",
        text: "Accelerate hard to beat the light.",
        correct: false,
        tip: "Speeding through a yellow is reckless and gets you a ticket if it turns red mid-intersection.",
      },
    ],
  },
];

function ScenarioSimulator() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [picked, setPicked] = useState<string | null>(null);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId)!,
    [scenarioId],
  );

  const selected = picked ? scenario.choices.find((c) => c.id === picked) : null;

  const pickScenario = (id: string) => {
    setScenarioId(id);
    setPicked(null);
  };

  return (
    <Card className="glass glow-soft rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
            Scenario Simulator
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Practice defensive decisions before you meet them on the road.
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => pickScenario(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-[11px] font-medium press transition-all",
                active
                  ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_-3px_var(--color-primary)]"
                  : "border-border bg-card/40 text-muted-foreground hover:border-primary/40",
              )}
            >
              {s.title}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-4 mb-4">
        <p className="font-display text-base font-semibold mb-1.5">
          {scenario.title}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {scenario.setup}
        </p>
        <p className="text-sm mt-3 font-medium">{scenario.prompt}</p>
      </div>

      <div className="space-y-2">
        {scenario.choices.map((c) => {
          const isPicked = picked === c.id;
          const reveal = isPicked && selected;
          const state = !reveal
            ? "idle"
            : c.correct
              ? "correct"
              : "wrong";
          return (
            <button
              key={c.id}
              onClick={() => setPicked(c.id)}
              disabled={picked !== null && c.correct && selected?.correct}
              className={cn(
                "w-full text-left rounded-xl border p-3 press transition-all",
                state === "idle" &&
                  "border-border bg-background/40 hover:border-primary/40",
                state === "correct" &&
                  "border-emerald-500/60 bg-emerald-500/10",
                state === "wrong" && "border-red-500/60 bg-red-500/10",
              )}
            >
              <div className="flex items-start gap-2.5">
                {state === "correct" ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                ) : state === "wrong" ? (
                  <XCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
                ) : (
                  <span className="w-4 h-4 mt-0.5 rounded-full border border-border shrink-0" />
                )}
                <span className="text-sm leading-relaxed">{c.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-3.5 text-sm leading-relaxed",
            selected.correct
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
              : "border-amber-500/40 bg-amber-500/10 text-amber-100",
          )}
        >
          <p
            className={cn(
              "text-[10px] uppercase tracking-[0.25em] font-bold mb-1",
              selected.correct ? "text-emerald-300" : "text-amber-300",
            )}
          >
            {selected.correct ? "Safe choice" : "Try again"}
          </p>
          <p>{selected.tip}</p>
          {!selected.correct && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPicked(null)}
              className="press mt-3 border-amber-500/40 hover:border-amber-400"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" /> Try again
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

// ---------------- Section 3: Minimalist Checklist ----------------

const CHECKLIST_SKILLS: { id: string; name: string }[] = [
  { id: "changing-lanes", name: "Changing Lanes" },
  { id: "freeway-driving", name: "Freeway Driving" },
  { id: "parallel", name: "Parallel Parking" },
  { id: "three-point", name: "Three-Point Turns" },
  { id: "reverse", name: "Reversing in a Straight Line" },
  { id: "hill", name: "Hill Park & Restart" },
  { id: "night", name: "Night Driving" },
  { id: "weather", name: "Adverse Weather" },
  { id: "merge", name: "Highway Merging" },
  { id: "roundabout", name: "Roundabouts" },
];

function ManeuverChecklist() {
  const { skillMastery, setSkillMastery } = useUserProfile();

  const done = CHECKLIST_SKILLS.filter(
    (s) => skillMastery[s.id]?.mastered,
  ).length;

  return (
    <Card className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
            Maneuvers Checklist
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tick off skills as you practice them in the real world.
          </p>
        </div>
        <span className="font-display text-sm text-muted-foreground">
          <span className="text-primary font-bold">{done}</span> /{" "}
          {CHECKLIST_SKILLS.length}
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CHECKLIST_SKILLS.map((s) => {
          const checked = !!skillMastery[s.id]?.mastered;
          return (
            <li key={s.id}>
              <label
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 cursor-pointer press transition-all",
                  checked
                    ? "border-primary/50 bg-primary/[0.07]"
                    : "border-border bg-card/40 hover:border-primary/30",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) =>
                    setSkillMastery(s.id, { mastered: !!v })
                  }
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    checked && "text-primary",
                  )}
                >
                  {s.name}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// ---------------- Main export ----------------

export function RoadPrepGuide() {
  return (
    <div className="space-y-5">
      <HoursLogger />
      <ScenarioSimulator />
      <ManeuverChecklist />
    </div>
  );
}
