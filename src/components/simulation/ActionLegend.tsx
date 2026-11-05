import { ArrowUp, Triangle, Octagon } from "lucide-react";
import type { SimulationAction } from "@/data/simulation-session";

export const ACTION_ICONS = { go: ArrowUp, yield: Triangle, stop: Octagon };
export const STANDARD_ACTIONS: SimulationAction[] = [
  { id: "go", label: "Go", icon: "go" },
  { id: "yield", label: "Yield", icon: "yield" },
  { id: "stop", label: "Stop", icon: "stop" },
];
const meanings = {
  go: "Proceed with your intended move (straight, turn, or lane change)",
  yield: "Slow down, give way, and go only when it's clear",
  stop: "Come to a complete stop",
};

export function ActionLegend() {
  return <dl className="space-y-5">{STANDARD_ACTIONS.map(action => {
    const Icon = ACTION_ICONS[action.icon as keyof typeof ACTION_ICONS];
    return <div key={action.id} className="flex items-start gap-3"><Icon className="sim-action-ic mt-0.5 h-6 w-6 shrink-0" data-action={action.id} aria-hidden="true" /><div><dt className="text-sm font-semibold">{action.label}</dt><dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{meanings[action.id as keyof typeof meanings]}</dd></div></div>;
  })}</dl>;
}