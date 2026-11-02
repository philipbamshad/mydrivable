import stopSign from "@/assets/stop-sign-approach.webm.asset.json";
import rightOfWay from "@/assets/stop-sign-right-of-way.webm.asset.json";
import laneChange from "@/assets/lane-change.webm.asset.json";
import leftTurnArrow from "@/assets/left-turn-green-arrow.webm.asset.json";
import rightTurnGreen from "@/assets/right-turn-on-green.webm.asset.json";
import rightTurnRed from "@/assets/right-turn-on-red.webm.asset.json";
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
    explanation: "The light is green and the crosswalk is clear, so you can turn right. Keep checking for pedestrians and cyclists as you turn.",
  },
  {
    id: "left-turn-green-arrow", videoUrl: leftTurnArrow.url, pauseAt: 1.5,
    title: "Left turn on green arrow", intent: "Turning left", intentIcon: "left",
    subtitle: "Turning left · green arrow",
    actions,
    correctAction: "go",
    explanation: "A green arrow means a protected turn. Oncoming traffic has a red light, so you can turn left.",
  },
  {
    id: "right-turn-on-red", videoUrl: rightTurnRed.url, pauseAt: 2.0,
    title: "Right turn on red", intent: "Turning right", intentIcon: "right",
    subtitle: "Turning right · red light",
    actions,
    correctAction: "stop",
    explanation: "You must come to a complete stop at the limit line first. Then you may turn right when it's clear, unless a sign prohibits it.",
  },
  {
    id: "stop-sign-approach", videoUrl: stopSign.url, pauseAt: 4.5,
    title: "Stop sign", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · stop sign",
    actions,
    correctAction: "stop",
    explanation: "Come to a complete stop at the limit line, then go only when it's safe.",
  },
  {
    id: "stop-sign-right-of-way", videoUrl: rightOfWay.url, pauseAt: 4.5,
    title: "All-way stop", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · all-way stop · the red car stopped first",
    actions,
    correctAction: "yield",
    explanation: "The red car stopped first, so it goes first. Let it go, then proceed.",
  },
  {
    id: "lane-change", videoUrl: laneChange.url, pauseAt: 1.5,
    title: "Changing lanes", intent: "Changing lanes left", intentIcon: "left",
    subtitle: "Changing lanes · highway",
    actions,
    correctAction: "yield",
    explanation: "Before changing lanes, signal, check your mirrors, and look over your shoulder at your blind spot. Change lanes only when there's a safe gap.",
  },
];
