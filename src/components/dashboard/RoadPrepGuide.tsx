import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
        ],
        fails: [
          "Driving without seatbelt",
          "Leaving parking brake engaged at start",
        ],
      },
      {
        id: "lane",
        name: "Smooth Lane Change",
        steps: [
          "Signal at least 100 ft before",
          "Check mirror, then blind spot over shoulder",
          "Steer smoothly into the lane center",
          "Cancel signal once fully in lane",
        ],
        fails: [
          "Failing to check blind spot",
          "Cutting off a vehicle in the target lane",
        ],
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
          "Pull alongside the front car, 2 ft away",
          "Reverse with full wheel turn toward curb",
          "Straighten as front clears the lead car",
          "Center between cars, within 12 inches of curb",
        ],
        fails: [
          "Hitting curb hard or another vehicle",
          "Ending more than 18 inches from the curb",
        ],
      },
      {
        id: "three-point",
        name: "Three-Point Turn",
        steps: [
          "Signal right, pull close to curb, stop",
          "Signal left, check traffic, turn wheel hard left",
          "Reverse with right full lock until aimed back",
          "Drive forward, straighten in correct lane",
        ],
        fails: [
          "Wheels touching the curb during turn",
          "Failing to check for traffic before each move",
        ],
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
          "Time gap, then merge smoothly — no stopping",
          "Maintain speed and adjust spacing",
        ],
        fails: [
          "Stopping on the on-ramp",
          "Merging across solid white gore lines",
        ],
      },
      {
        id: "hill",
        name: "Hill Park & Restart",
        steps: [
          "Curb wheels correctly for direction of slope",
          "Set parking brake before shifting to park",
          "On restart, foot on brake, release parking brake",
          "Signal and check mirrors before pulling away",
        ],
        fails: [
          "Rolling more than 12 inches when starting",
          "Wheels curbed the wrong direction",
        ],
      },
    ],
  },
];

function ManeuverCard({ m }: { m: Maneuver }) {
  const [checks, setChecks] = useState<boolean[]>(() => m.steps.map(() => false));
  const [note, setNote] = useState("");

  useEffect(() => {
    const k = `rp-note-${m.id}`;
    const v = typeof window !== "undefined" ? window.localStorage.getItem(k) : null;
    if (v) setNote(v);
  }, [m.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`rp-note-${m.id}`, note);
    }
  }, [m.id, note]);

  return (
    <div className="space-y-4 pt-1">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
          Execution checklist
        </p>
        <ul className="space-y-2">
          {m.steps.map((s, i) => (
            <li key={i}>
              <button
                onClick={() =>
                  setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))
                }
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left text-sm transition-all duration-200 press",
                  checks[i]
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-card/30 hover:border-primary/30"
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center h-5 w-5 rounded-md border transition-all",
                    checks[i]
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                  style={checks[i] ? { boxShadow: "0 0 10px var(--color-primary)" } : undefined}
                >
                  {checks[i] && <Check className="w-3 h-3" />}
                </span>
                <span className={cn(checks[i] && "line-through text-muted-foreground")}>
                  {s}
                </span>
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

      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
          Session notes
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Log what felt off, what to repeat next session…"
          className="w-full min-h-[88px] rounded-xl bg-card/50 border border-border p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
    </div>
  );
}

export function RoadPrepGuide() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold">Behind-the-Wheel Action Checklists</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Practical maneuvers with examiner failure thresholds.
        </p>
      </div>

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
  );
}
