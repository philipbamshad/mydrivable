import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, Check, Lock, Play, Pause, Save, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Maneuver = {
  id: string;
  name: string;
  steps: string[];
  fails: string[];
};

type Group = { title: string; items: Maneuver[] };

const GROUPS: Group[] = [
  {
    title: "Basic Controls",
    items: [
      {
        id: "start",
        name: "Pre-Drive & Cockpit Setup",
        steps: [
          "Adjust seat, mirrors, and steering wheel",
          "Fasten seatbelt and confirm passengers buckled",
          "Check gauges and warning lights before shifting",
          "Signal, check blind spot, then release brake",
          "Smoothly accelerate into traffic flow",
        ],
        fails: ["Driving without seatbelt", "Leaving parking brake engaged at start"],
      },
      {
        id: "lane",
        name: "Smooth Lane Change",
        steps: [
          "Signal at least 100 ft before",
          "Check mirror, then blind spot over shoulder",
          "Steer smoothly into the lane center",
          "Maintain consistent speed",
          "Cancel signal once fully in lane",
        ],
        fails: ["Failing to check blind spot", "Cutting off a vehicle in the target lane"],
      },
    ],
  },
  {
    title: "Intermediate Scenarios",
    items: [
      {
        id: "parallel",
        name: "Parallel Parking",
        steps: [
          "Check mirrors and signal intention",
          "Pull alongside the front car, 2 ft away",
          "Reverse with full wheel turn — maintain 45-degree angle",
          "Straighten as front clears the lead car",
          "Center within 12 inches of curb",
        ],
        fails: ["Hitting curb hard or another vehicle", "Ending more than 18 inches from the curb"],
      },
      {
        id: "three-point",
        name: "Three-Point Turn",
        steps: [
          "Signal right, pull close to curb, stop",
          "Signal left, check traffic, turn wheel hard left",
          "Reverse with right full lock until aimed back",
          "Check traffic both directions again",
          "Drive forward, straighten in correct lane",
        ],
        fails: ["Wheels touching the curb during turn", "Failing to check for traffic before each move"],
      },
    ],
  },
  {
    title: "Advanced Moves",
    items: [
      {
        id: "highway",
        name: "Highway Merge",
        steps: [
          "Match the flow speed on the on-ramp",
          "Signal early, scan mirror and blind spot",
          "Identify gap in target lane",
          "Time gap, then merge smoothly — no stopping",
          "Maintain speed and adjust spacing",
        ],
        fails: ["Stopping on the on-ramp", "Merging across solid white gore lines"],
      },
      {
        id: "hill",
        name: "Hill Park & Restart",
        steps: [
          "Curb wheels correctly for direction of slope",
          "Set parking brake before shifting to park",
          "Verify wheels are turned into curb (downhill) or away (uphill)",
          "On restart, foot on brake, release parking brake",
          "Signal and check mirrors before pulling away",
        ],
        fails: ["Rolling more than 12 inches when starting", "Wheels curbed the wrong direction"],
      },
    ],
  },
];

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SessionTracker({ maneuverName, maneuverId }: { maneuverName: string; maneuverId: string }) {
  const { addDriveSession } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState("");
  const startedAt = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startedAt.current !== null) {
        setElapsed(Date.now() - startedAt.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      startedAt.current = Date.now() - elapsed;
      setRunning(true);
    }
  };

  const save = () => {
    const hours = elapsed / 3_600_000;
    if (hours < 0.001) {
      toast.error("Run the timer before saving");
      return;
    }
    addDriveSession({ hours, maneuver: maneuverName, note });
    toast.success(`Logged ${formatTime(elapsed)} for ${maneuverName}`);
    setRunning(false);
    setElapsed(0);
    setNote("");
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="press mt-3 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Timer className="w-3.5 h-3.5" /> Session Practice Tracker
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-primary font-bold">
          Log Active Drive Time
        </p>
        <button onClick={() => setOpen(false)} className="text-[10px] text-muted-foreground hover:text-foreground">
          close
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="font-display text-3xl font-bold text-primary tabular-nums"
          style={{ textShadow: "0 0 16px var(--color-primary)" }}>
          {formatTime(elapsed)}
        </div>
        <Button size="sm" onClick={toggle} className="press bg-primary text-primary-foreground hover:bg-primary">
          {running ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Start</>}
        </Button>
        <Button size="sm" variant="outline" onClick={save} className="press">
          <Save className="w-3.5 h-3.5" /> Save
        </Button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`Notes on ${maneuverName.toLowerCase()}…`}
        className="w-full min-h-[60px] rounded-lg bg-background/50 border border-border p-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        data-maneuver={maneuverId}
      />
    </div>
  );
}

function ManeuverCard({ m }: { m: Maneuver }) {
  const [checks, setChecks] = useState<boolean[]>(() => m.steps.slice(0, 5).map(() => false));

  return (
    <div className="space-y-4 pt-1">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
          Critical execution steps
        </p>
        <ul className="space-y-2">
          {m.steps.slice(0, 5).map((s, i) => (
            <li key={i}>
              <button
                onClick={() => setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left text-sm transition-all duration-200 press",
                  checks[i] ? "border-primary/40 bg-primary/10" : "border-border bg-card/30 hover:border-primary/30",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center h-5 w-5 rounded-md border transition-all",
                    checks[i] ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                  style={checks[i] ? { boxShadow: "0 0 10px var(--color-primary)" } : undefined}
                >
                  {checks[i] && <Check className="w-3 h-3" />}
                </span>
                <span className={cn(checks[i] && "line-through text-muted-foreground")}>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">
            Critical Test Failure
          </span>
        </div>
        <ul className="space-y-1 text-xs text-red-200/90 list-disc list-inside">
          {m.fails.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <SessionTracker maneuverId={m.id} maneuverName={m.name} />
    </div>
  );
}

export function RoadPrepGuide() {
  const { isPro, unlockPro, driveHours, driveSessions } = useUserProfile();
  const goalHours = 50;
  const pct = Math.min(100, (driveHours / goalHours) * 100);

  return (
    <div className="relative space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold">Behind-the-Wheel Practice</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Maneuver checklists, examiner failure thresholds, and live session logging.
        </p>
      </div>

      <Card className="glass glow-soft p-5 rounded-2xl">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="font-display text-base font-bold">Cumulative Drive Hours</h3>
          <span className="text-xs text-muted-foreground">
            {driveHours.toFixed(1)} / {goalHours} hrs · {driveSessions.length} sessions
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%`, boxShadow: "0 0 12px var(--color-primary)" }} />
        </div>
      </Card>

      <div className={cn("space-y-5 transition-all", !isPro && "blur-sm pointer-events-none select-none")}>
        {GROUPS.map((g) => (
          <Card key={g.title} className="glass glow-soft rounded-2xl p-2 sm:p-4">
            <h3 className="font-display text-base font-bold px-3 pt-2 pb-3">{g.title}</h3>
            <Accordion type="single" collapsible className="w-full">
              {g.items.map((m) => (
                <AccordionItem key={m.id} value={m.id} className="border-border">
                  <AccordionTrigger className="px-3 hover:no-underline">
                    <span className="font-medium">{m.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    <ManeuverCard m={m} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}
      </div>

      {!isPro && (
        <div className="absolute inset-x-0 top-44 grid place-items-center">
          <Card className="glass-strong glow-strong p-8 rounded-2xl text-center max-w-md mx-auto">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 border border-primary/40 mx-auto mb-4"
              style={{ boxShadow: "0 0 24px -4px var(--color-primary)" }}>
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold">Pro Pass required</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Unlock all maneuver checklists and the session tracker.
            </p>
            <Button
              onClick={() => { unlockPro(); toast.success("Pro Pass unlocked"); }}
              className="press mt-5 bg-primary text-primary-foreground hover:bg-primary"
              style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
            >
              Unlock Pro
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
