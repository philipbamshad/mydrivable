import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

type Maneuver = {
  id: string;
  name: string;
  steps: string[];
  penalties: string[];
};

type Tier = {
  id: string;
  label: string;
  tone: string;
  maneuvers: Maneuver[];
};

const TIERS: Tier[] = [
  {
    id: "basic",
    label: "Basic Operations",
    tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    maneuvers: [
      {
        id: "start",
        name: "Vehicle Start & Pre-Drive Check",
        steps: [
          "Adjust seat, mirrors, steering wheel",
          "Fasten seatbelt before engine on",
          "Verify all gauges & warning lights",
          "Identify hazards before shifting out of park",
        ],
        penalties: [
          "Driving without seatbelt — automatic fail in most states",
          "Failure to identify hazards on pre-drive — instant deduction",
        ],
      },
      {
        id: "lane",
        name: "Lane Change",
        steps: [
          "Signal at least 100 ft before",
          "Mirror check + over-shoulder blind spot",
          "Smooth steering, no swerving",
          "Cancel signal once complete",
        ],
        penalties: [
          "No over-shoulder check — automatic fail (most examiners)",
          "Cutting off another vehicle — automatic fail",
        ],
      },
    ],
  },
  {
    id: "mid",
    label: "Intermediate Adjustments",
    tone: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    maneuvers: [
      {
        id: "parallel",
        name: "Parallel Parking",
        steps: [
          "Signal + align bumpers with lead car",
          "Reverse with full right lock at correct pivot",
          "Counter-steer when rear wheel clears bumper",
          "Final position: within 12 in of curb",
        ],
        penalties: [
          "Touching curb at speed — automatic fail",
          "More than 18 in from curb on final — fail in CA, TX, NY",
        ],
      },
      {
        id: "3pt",
        name: "Three-Point Turn",
        steps: [
          "Confirm legal location (no signs prohibiting U-turn)",
          "Signal right, pull to curb",
          "Signal left, full left lock, advance to opposite curb",
          "Reverse with right lock, then forward to complete",
        ],
        penalties: [
          "Striking curb — automatic fail",
          "Using more than 3 movements — major deduction",
        ],
      },
    ],
  },
  {
    id: "adv",
    label: "Advanced Scenarios",
    tone: "bg-destructive/15 text-destructive border-destructive/40",
    maneuvers: [
      {
        id: "merge",
        name: "Highway Merge",
        steps: [
          "Match flow speed before merging lane ends",
          "Signal, mirror, blind-spot in sequence",
          "Merge into first available gap, not the lane",
          "Maintain 3-second following distance",
        ],
        penalties: [
          "Stopping in merge lane — automatic fail",
          "Forcing another vehicle to brake hard — automatic fail",
        ],
      },
      {
        id: "emer",
        name: "Emergency Stop",
        steps: [
          "Both hands on wheel, firm brake application",
          "Eyes scan mirrors during stop",
          "Activate hazards if stopped in lane",
          "Recover smoothly, signal back to flow",
        ],
        penalties: [
          "Locking wheels on a non-ABS vehicle — automatic fail",
          "Failure to use hazards if stopped in traffic — major deduction",
        ],
      },
    ],
  },
];

export function RoadPrepMatrix() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {TIERS.map((tier) => (
        <section key={tier.id}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-display text-xl font-bold">{tier.label}</h2>
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${tier.tone}`}>
              {tier.maneuvers.length} maneuvers
            </Badge>
          </div>

          <Card className="bg-card border-border overflow-hidden">
            <Accordion type="multiple" className="divide-y divide-border">
              {tier.maneuvers.map((m) => (
                <AccordionItem
                  key={m.id}
                  value={m.id}
                  className="border-0 px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {m.steps.length} steps · {m.penalties.length} critical
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 space-y-4">
                    {/* Steps */}
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        Key mechanical movements
                      </div>
                      <ul className="space-y-2">
                        {m.steps.map((s, i) => {
                          const id = `${m.id}-${i}`;
                          return (
                            <li key={id} className="flex items-start gap-3">
                              <Checkbox
                                checked={!!checked[id]}
                                onCheckedChange={() =>
                                  setChecked((p) => ({ ...p, [id]: !p[id] }))
                                }
                                className="mt-0.5"
                              />
                              <span
                                className={`text-sm ${checked[id] ? "line-through text-muted-foreground" : ""}`}
                              >
                                {s}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Penalty Callout */}
                    <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-display font-bold text-destructive text-sm uppercase tracking-wide">
                          Critical Penalty Callout
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {m.penalties.map((p, i) => (
                          <li
                            key={i}
                            className="text-sm text-destructive-foreground/90 flex gap-2"
                          >
                            <span className="text-destructive">▸</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        Personal training log
                      </div>
                      <Textarea
                        rows={3}
                        placeholder="Logged: 6/24, curb-tap on second attempt. Pivot a half-car later next time."
                        value={notes[m.id] ?? ""}
                        onChange={(e) =>
                          setNotes((p) => ({ ...p, [m.id]: e.target.value }))
                        }
                        className="text-sm resize-none bg-background"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>
      ))}
    </div>
  );
}
