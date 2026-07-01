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
            className="press"
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
      { id: "a", text: "Match freeway speed on the ramp, signal early, and merge into the gap.", correct: true, tip: "Matching the flow of traffic lets you slip in smoothly without forcing other drivers to brake, the defensive choice every time." },
      { id: "b", text: "Slow down at the end of the ramp and wait for a bigger opening.", correct: false, tip: "Stopping on a ramp is dangerous, you lose the runway you need to match speed and risk a rear-end collision." },
      { id: "c", text: "Speed past traffic and merge into the left lane.", correct: false, tip: "Cutting across multiple lanes from a merge is illegal in most states and unpredictable to other drivers." },
    ],
  },
  {
    id: "tailgater",
    title: "Handling a Tailgater",
    setup: "You're going the speed limit on a two-lane road. A driver is right on your bumper, flashing their lights.",
    prompt: "What's the right response?",
    choices: [
      { id: "a", text: "Tap your brakes to send them a message.", correct: false, tip: "Brake-checking provokes road rage and can cause a crash you'd be liable for. Never escalate." },
      { id: "b", text: "Stay calm, increase your following distance to the car ahead, and move over when it's safe.", correct: true, tip: "More space ahead gives you a buffer if you need to brake gradually instead of suddenly. Letting them pass removes the threat entirely." },
      { id: "c", text: "Speed up to put distance between you.", correct: false, tip: "You'd be breaking the speed limit and they'll likely keep pace. Defensive driving means controlling space, not racing." },
    ],
  },
  {
    id: "blind-intersection",
    title: "Approaching a Blind Intersection",
    setup: "You're approaching a four-way intersection with parked cars and shrubs blocking the cross street. You have the right of way.",
    prompt: "How do you proceed?",
    choices: [
      { id: "a", text: "Maintain speed since you have the right of way.", correct: false, tip: "Right of way doesn't protect you from a driver who doesn't see you. Visibility wins over right of way every time." },
      { id: "b", text: "Cover the brake, slow down, and scan left-right-left before entering.", correct: true, tip: "Covering the brake cuts your reaction time, and the slow approach buys you space to react to anyone running the cross street." },
      { id: "c", text: "Honk to alert other drivers.", correct: false, tip: "A horn doesn't make you visible, it just notifies. You still need to slow down and scan." },
    ],
  },
  {
    id: "wet-road",
    title: "Sudden Rain on the Highway",
    setup: "It starts pouring while you're cruising at 70 mph. The road surface looks glossy and your wipers can barely keep up.",
    prompt: "Best response?",
    choices: [
      { id: "a", text: "Ease off the gas gradually, increase following distance, and turn on low-beam headlights.", correct: true, tip: "Gradual deceleration prevents hydroplaning and low-beams improve your visibility to others without glaring off the rain." },
      { id: "b", text: "Brake firmly to drop to a safe speed quickly.", correct: false, tip: "Hard braking on wet pavement is the fastest way to lose traction and skid. Always shed speed slowly in the rain." },
      { id: "c", text: "Switch on your high-beams to see better.", correct: false, tip: "High-beams reflect off the rain and reduce your visibility. Low-beams (or fog lights) are the right call." },
    ],
  },
  {
    id: "yellow-light",
    title: "Yellow Light Decision",
    setup: "You're 80 feet from a signal when it turns yellow. You're going 35 mph and there's a car close behind you.",
    prompt: "What do you do?",
    choices: [
      { id: "a", text: "Slam the brakes to stop before the line.", correct: false, tip: "Slamming the brakes with a car close behind invites a rear-end collision. The right call depends on whether you can stop safely." },
      { id: "b", text: "Assess: if you can stop smoothly, do it. If not, maintain speed and clear the intersection before red.", correct: true, tip: "Yellow means 'clear if you can't safely stop.' Check your stopping distance and the car behind before deciding." },
      { id: "c", text: "Accelerate hard to beat the light.", correct: false, tip: "Speeding through a yellow is reckless and gets you a ticket if it turns red mid-intersection." },
    ],
  },
  {
    id: "turn-signal-timing",
    title: "Turn Signal Timing",
    setup: "You're approaching a right turn at a residential intersection about 200 feet ahead.",
    prompt: "When should you start your turn signal?",
    choices: [
      { id: "a", text: "Right as you begin the turn.", correct: false, tip: "Signaling at the turn gives drivers behind you no warning to slow down, it's also illegal in most states." },
      { id: "b", text: "At least 100 feet before the turn.", correct: true, tip: "Most state laws require signaling at least 100 feet ahead (about 5 seconds at city speed) so drivers behind and ahead can react." },
      { id: "c", text: "Only if there's a car behind you.", correct: false, tip: "Signal every time, pedestrians, cyclists, and cross-traffic depend on it too." },
    ],
  },
  {
    id: "roundabout",
    title: "Entering a Roundabout",
    setup: "You approach a single-lane roundabout. A car is already circulating from your left.",
    prompt: "What do you do?",
    choices: [
      { id: "a", text: "Yield to the circulating car, then enter when there's a safe gap.", correct: true, tip: "Traffic already in the roundabout always has the right of way. Yield, find a gap, and merge smoothly without stopping if possible." },
      { id: "b", text: "Stop completely and wait for the roundabout to clear.", correct: false, tip: "Roundabouts aren't stop signs, stopping unnecessarily creates rear-end risk. Yield and flow when safe." },
      { id: "c", text: "Enter quickly to claim your spot.", correct: false, tip: "You don't have right of way on entry. Forcing in causes crashes and is the #1 roundabout violation." },
    ],
  },
  {
    id: "lane-choice-highway",
    title: "Choosing a Highway Lane",
    setup: "You're cruising on a three-lane highway at the speed limit, not passing anyone.",
    prompt: "Which lane should you be in?",
    choices: [
      { id: "a", text: "The far-left lane, it's the fastest.", correct: false, tip: "The left lane is for passing only in most states. Cruising there blocks faster traffic and can earn you a ticket." },
      { id: "b", text: "The middle or right lane, leaving the left for passing.", correct: true, tip: "Keep right except to pass. The middle lane is fine for steady travel, and the right lane is the default cruising lane." },
      { id: "c", text: "Whichever lane has the fewest cars.", correct: false, tip: "Lane choice is about traffic law and predictability, not convenience. Stay right, use left to pass." },
    ],
  },
  {
    id: "four-way-stop",
    title: "Four-Way Stop Arrival",
    setup: "You and another car arrive at a four-way stop at exactly the same time. The other car is to your right.",
    prompt: "Who goes first?",
    choices: [
      { id: "a", text: "You do, your direction has priority.", correct: false, tip: "There's no directional priority at a four-way stop. When tied, the car on the right goes first." },
      { id: "b", text: "The car on the right goes first.", correct: true, tip: "Standard rule: when two cars arrive at the same time, yield to the car on your right." },
      { id: "c", text: "Whoever waves the other through first.", correct: false, tip: "Waving creates confusion and liability. Follow the rule, not gestures, the car on the right has the right of way." },
    ],
  },
  {
    id: "school-zone",
    title: "School Zone Speed",
    setup: "You're driving through a school zone at 2:45 PM and the yellow lights are flashing.",
    prompt: "What's the right action?",
    choices: [
      { id: "a", text: "Slow to the posted school-zone speed limit (usually 15-25 mph).", correct: true, tip: "Flashing lights mean the reduced speed limit is active. Kids can dart out unpredictably, slower speed = shorter stopping distance." },
      { id: "b", text: "Maintain the regular street speed limit.", correct: false, tip: "Flashing lights override the regular limit. Ignoring them is a serious moving violation with doubled fines." },
      { id: "c", text: "Stop completely and wait for the lights to turn off.", correct: false, tip: "You don't need to stop, just slow down to the posted reduced limit and stay alert for pedestrians." },
    ],
  },
  {
    id: "pedestrian-crosswalk",
    title: "Pedestrian at a Crosswalk",
    setup: "A pedestrian steps off the curb into an unmarked crosswalk on a residential street.",
    prompt: "What's required?",
    choices: [
      { id: "a", text: "Honk to warn them and keep driving.", correct: false, tip: "Pedestrians have right of way in any crosswalk, marked or not. Honking instead of yielding is both illegal and rude." },
      { id: "b", text: "Stop and yield until they're safely across.", correct: true, tip: "Every intersection has an unmarked crosswalk by law. Yield until the pedestrian is fully clear of your lane." },
      { id: "c", text: "Only stop if they're already in your lane.", correct: false, tip: "You must yield as soon as they enter the crosswalk, not wait until they're in your path." },
    ],
  },
  {
    id: "fog",
    title: "Driving in Heavy Fog",
    setup: "You're on a rural road and fog has rolled in. Visibility drops to about 100 feet.",
    prompt: "Best practice?",
    choices: [
      { id: "a", text: "Turn on high-beams to see further.", correct: false, tip: "High-beams reflect off fog droplets and reduce your visibility. Use low-beams or fog lights." },
      { id: "b", text: "Slow down, use low-beams, and increase following distance.", correct: true, tip: "Speed should match visibility. Low-beams cut under the fog, and extra following distance gives you time to react." },
      { id: "c", text: "Use hazard lights while moving.", correct: false, tip: "Hazards while driving is illegal in many states and confuses drivers behind you. Save them for stopped vehicles." },
    ],
  },
  {
    id: "emergency-vehicle",
    title: "Emergency Vehicle Approaching",
    setup: "You hear sirens and see an ambulance approaching from behind with lights flashing.",
    prompt: "What should you do?",
    choices: [
      { id: "a", text: "Speed up to get out of the way.", correct: false, tip: "Speeding up is dangerous and often illegal. Pull over and stop, that's what the siren is asking for." },
      { id: "b", text: "Pull to the right shoulder and stop until it passes.", correct: true, tip: "Move-over laws require yielding to emergency vehicles by pulling right and stopping. This clears the lane safely." },
      { id: "c", text: "Stop immediately in your lane.", correct: false, tip: "Stopping mid-lane blocks the emergency vehicle. Always pull over to the right shoulder first." },
    ],
  },
  {
    id: "left-turn-arrow",
    title: "Unprotected Left Turn",
    setup: "You're in the left-turn lane at a green light (solid green, no arrow). Oncoming traffic is steady.",
    prompt: "How do you handle it?",
    choices: [
      { id: "a", text: "Pull into the intersection and wait for a safe gap.", correct: true, tip: "Enter the intersection so you can clear it on yellow if needed. Yield to oncoming traffic until a safe gap opens." },
      { id: "b", text: "Wait behind the line until oncoming traffic clears completely.", correct: false, tip: "Waiting behind the line means you may never get through. Enter the intersection so you can complete the turn." },
      { id: "c", text: "Turn immediately, you have the green.", correct: false, tip: "Solid green for a left turn means yield to oncoming traffic. Turning without yielding causes head-on crashes." },
    ],
  },
  {
    id: "school-bus",
    title: "School Bus with Flashing Lights",
    setup: "You're behind a school bus on a two-lane road. It stops and extends its stop sign with red flashing lights.",
    prompt: "What's required?",
    choices: [
      { id: "a", text: "Stop and stay stopped until the lights stop flashing.", correct: true, tip: "On undivided roads, all traffic in both directions must stop until the red lights stop flashing and the stop sign retracts." },
      { id: "b", text: "Slow down and pass carefully on the left.", correct: false, tip: "Passing a stopped school bus with flashing red lights is illegal and extremely dangerous, kids cross unpredictably." },
      { id: "c", text: "Stop only if you see children.", correct: false, tip: "You must stop whether or not you see children. The flashing red lights are the legal trigger." },
    ],
  },
  {
    id: "merging-traffic",
    title: "Car Merging Into Your Lane",
    setup: "You're in the right lane of a freeway. A car on the on-ramp is signaling to merge into your lane.",
    prompt: "Best response?",
    choices: [
      { id: "a", text: "Hold your speed, they need to yield to you.", correct: false, tip: "Technically merging traffic yields, but defensive drivers help create space. Forcing them off the ramp causes crashes." },
      { id: "b", text: "Adjust your speed or change lanes if safe to make room.", correct: true, tip: "Cooperative merging keeps traffic flowing smoothly. Move left if possible, or adjust speed to open a gap." },
      { id: "c", text: "Speed up to close the gap so they go behind you.", correct: false, tip: "Speeding up to block a merger is aggressive and a leading cause of merge-area crashes." },
    ],
  },
  {
    id: "parallel-parking",
    title: "Parallel Parking Setup",
    setup: "You found a parallel spot between two cars on a busy street.",
    prompt: "What's the first step?",
    choices: [
      { id: "a", text: "Signal, pull up parallel to the car in front of the spot, leaving about 2 feet of space.", correct: true, tip: "Aligning with the front car gives you the proper pivot point. Signal so traffic behind knows you're parking." },
      { id: "b", text: "Pull directly into the spot nose-first.", correct: false, tip: "Nose-first into a parallel spot rarely fits and blocks the lane. Always back in from alongside." },
      { id: "c", text: "Reverse straight into the spot from behind.", correct: false, tip: "You need the angle from alongside to swing in cleanly. Reversing straight in won't clear the rear car." },
    ],
  },
];

function ScenarioSimulator() {
  const [scenarioId, setScenarioId] = useState<string>(
    () => SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)].id,
  );
  const [picked, setPicked] = useState<string | null>(null);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId)!,
    [scenarioId],
  );
  const selected = picked
    ? scenario.choices.find((c) => c.id === picked) ?? null
    : null;

  const nextScenario = () => {
    const pool = SCENARIOS.filter((s) => s.id !== scenarioId);
    const next = pool[Math.floor(Math.random() * pool.length)];
    setScenarioId(next.id);
    setPicked(null);
  };

  const correctChoice = scenario.choices.find((c) => c.correct)!;

  return (
    <Card className="glass glow-soft rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
            Scenario Simulator
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            One scenario at a time, answer, learn, move on.
          </p>
        </div>
        <Sparkles className="w-5 h-5 text-primary" />
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
          let state: "idle" | "correct" | "wrong" | "reveal-correct" = "idle";
          if (selected) {
            if (isPicked && c.correct) state = "correct";
            else if (isPicked && !c.correct) state = "wrong";
            else if (!selected.correct && c.correct) state = "reveal-correct";
          }
          return (
            <button
              key={c.id}
              onClick={() => !selected && setPicked(c.id)}
              disabled={!!selected}
              className={cn(
                "w-full text-left rounded-xl border p-3 transition-all",
                !selected && "press hover:border-primary/40",
                state === "idle" && "border-border bg-background/40",
                (state === "correct" || state === "reveal-correct") &&
                  "border-emerald-500/60 bg-emerald-500/10",
                state === "wrong" && "border-red-500/60 bg-red-500/10",
              )}
            >
              <div className="flex items-start gap-2.5">
                {state === "correct" || state === "reveal-correct" ? (
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
              : "border-red-500/40 bg-red-500/10 text-red-100",
          )}
        >
          <p
            className={cn(
              "text-[10px] uppercase tracking-[0.25em] font-bold mb-1",
              selected.correct ? "text-emerald-300" : "text-red-300",
            )}
          >
            {selected.correct ? "Correct" : "Not quite"}
          </p>
          <p>
            {selected.correct ? selected.tip : correctChoice.tip}
          </p>
          {!selected.correct && (
            <p className="mt-2 text-xs text-red-200/80">
              <span className="font-semibold text-emerald-300">
                Correct answer:
              </span>{" "}
              {correctChoice.text}
            </p>
          )}
          <Button
            onClick={nextScenario}
            className="press mt-4 w-full "
          >
            Next Scenario <RefreshCw className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}
    </Card>
  );
}

// ---------------- Section 3: Minimalist Checklist ----------------

const CHECKLIST_SKILLS: { id: string; name: string }[] = [
  { id: "residential-turns", name: "Residential Turns (Right & Left)" },
  { id: "full-stop-start", name: "Full Stop & Start" },
  { id: "traffic-management", name: "Traffic Management" },
  { id: "lane-changes", name: "Lane Changes (Left & Right)" },
  { id: "reverse-straight", name: "Reverse Straight" },
  { id: "canyon-driving", name: "Canyon Driving" },
  { id: "turn-traffic", name: "Turn Traffic (Left & Right Traffic)" },
  { id: "specialized-conditions", name: "Specialized Conditions (Night & Rain Driving)" },
  { id: "parking-maneuvers", name: "Parking Maneuvers (Diagonal & Parallel Parking)" },
  { id: "uturn-3point", name: "U-Turn & 3-Point Turn" },
  { id: "freeway-highway", name: "Freeway & Highway Driving" },
  { id: "dmv-drive-test", name: "DMV Drive Test Practice" },
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
