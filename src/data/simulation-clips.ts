import stopSign from "@/assets/stop-sign-approach.webm.asset.json";
import rightOfWay from "@/assets/stop-sign-right-of-way.webm.asset.json";
import laneChange from "@/assets/lane-change.webm.asset.json";
import leftTurnArrow from "@/assets/left-turn-green-arrow.webm.asset.json";
import rightTurnGreen from "@/assets/right-turn-on-green.webm.asset.json";
import rightTurnRed from "@/assets/right-turn-on-red.webm.asset.json";
import pedestrianCrosswalk from "@/assets/pedestrian-crosswalk.webm.asset.json";
import flashingRedLight from "@/assets/flashing-red-light.webm.asset.json";
import leftTurnSolidGreen from "@/assets/left-turn-solid-green.webm.asset.json";
import noTurnOnRed from "@/assets/no-turn-on-red.webm.asset.json";
import type { SimulationClip } from "./simulation-session";

const actions = [
  { id: "go", label: "Go", icon: "go" as const },
  { id: "yield", label: "Yield", icon: "yield" as const },
  { id: "stop", label: "Stop", icon: "stop" as const },
];

export type { SimulationClip } from "./simulation-session";

// Edit pauseAt (seconds) per scenario. Shorter existing videos hold their final frame.
export const SIMULATION_CLIPS: SimulationClip[] = [
  {
    id: "right-turn-on-green", videoUrl: rightTurnGreen.url, pauseAt: 3.5,
    title: "Right turn on green", intent: "Turning right", intentIcon: "right",
    subtitle: "Turning right on green · crosswalk ahead",
    actions,
    correctAction: "go",
    steps: ["go"],
    explanation: "The light is green and the crosswalk is clear, so you can turn right. Keep checking for pedestrians and cyclists as you turn.",
  },
  {
    id: "left-turn-green-arrow", videoUrl: leftTurnArrow.url, pauseAt: 1.5,
    title: "Left turn on green arrow", intent: "Turning left", intentIcon: "left",
    subtitle: "Turning left · green arrow",
    actions,
    correctAction: "go",
    steps: ["go"],
    explanation: "A green arrow means a protected turn. Oncoming traffic has a red light, so you can turn left.",
  },
  {
    id: "right-turn-on-red", videoUrl: rightTurnRed.url, pauseAt: 2.0,
    title: "Right turn on red", intent: "Turning right", intentIcon: "right",
    subtitle: "Turning right · red light",
    actions,
    correctAction: "stop",
    steps: ["stop", "yield"],
    explanation: "You must stop completely at the limit line first. Then yield to cross traffic and pedestrians, and turn right only when it's clear, unless a sign prohibits it.",
  },
  {
    id: "stop-sign-approach", videoUrl: stopSign.url, pauseAt: 4.5,
    title: "Stop sign", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · stop sign",
    actions,
    correctAction: "stop",
    steps: ["stop", "yield"],
    explanation: "Come to a complete stop at the limit line. A car is already at the intersection, so let it go first, then proceed when it's clear.",
  },
  {
    id: "stop-sign-right-of-way", videoUrl: rightOfWay.url, pauseAt: 4.5,
    title: "All-way stop", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · all-way stop · the red car stopped first",
    actions,
    correctAction: "stop",
    steps: ["stop", "yield"],
    explanation: "Stop completely first. The red car stopped before you, so it has the right of way. Let it go, then proceed.",
  },
  {
    id: "lane-change", videoUrl: laneChange.url, pauseAt: 1.5,
    title: "Changing lanes", intent: "Changing lanes left", intentIcon: "left",
    subtitle: "Changing lanes · highway",
    actions,
    correctAction: "yield",
    steps: ["yield", "go"],
    explanation: "First signal, check your mirrors, and look over your shoulder at your blind spot. Once there's a safe gap, change lanes smoothly.",
  },
  {
    id: "pedestrian-crosswalk", videoUrl: pedestrianCrosswalk.url, pauseAt: 1.5,
    title: "Pedestrian in the crosswalk", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · pedestrian in your lane",
    actions,
    correctAction: "stop",
    steps: ["stop"],
    explanation: "A pedestrian is in the crosswalk. Stop and wait until they’ve finished crossing and it’s safe before you go.",
  },
  {
    id: "left-turn-solid-green", videoUrl: leftTurnSolidGreen.url, pauseAt: 0.75,
    title: "Left turn on solid green", intent: "Turning left", intentIcon: "left",
    subtitle: "Turning left · solid green · oncoming traffic",
    actions,
    correctAction: "yield",
    steps: ["yield"],
    explanation: "The light is solid green with no arrow, so this is not a protected turn. Yield to oncoming traffic and turn only when there’s a safe gap.",
  },
  {
    id: "flashing-red-light", videoUrl: flashingRedLight.url, pauseAt: 1.5,
    title: "Flashing red light", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · flashing red light",
    actions,
    correctAction: "stop",
    steps: ["stop", "go"],
    explanation: "A flashing red light works like a stop sign. Come to a complete stop, then go when it’s safe. The intersection is clear, so you can proceed.",
  },
  {
    id: "no-turn-on-red", videoUrl: noTurnOnRed.url, pauseAt: 3.0,
    title: "No turn on red", intent: "Turning right", intentIcon: "right",
    subtitle: "Turning right · red light · No Turn on Red sign",
    actions,
    correctAction: "stop",
    steps: ["stop"],
    explanation: "Right turns on red are normally allowed after a full stop, but this sign prohibits it. Stop at the limit line and wait for a green light before turning.",
  },
];
