import stopSign from "@/assets/stop-sign-approach.webm.asset.json";
import rightOfWay from "@/assets/stop-sign-right-of-way.webm.asset.json";
import laneChange from "@/assets/lane-change.webm.asset.json";
import leftTurnArrow from "@/assets/left-turn-green-arrow.webm.asset.json";
import rightTurnGreen from "@/assets/right-turn-on-green.webm.asset.json";
import rightTurnRed from "@/assets/right-turn-on-red.webm.asset.json";
import type { SimulationClip } from "./simulation-session";

export type { SimulationClip } from "./simulation-session";

export const SIMULATION_CLIPS: SimulationClip[] = [
  {
    id: "stop-sign-approach",
    videoUrl: stopSign.url,
    pauseAt: 4.7,
    title: "Approaching a stop sign",
    actions: [
      { id: "go", label: "Go", icon: "go" },
      { id: "stop", label: "Stop", icon: "stop" },
      { id: "turn", label: "Turn right", icon: "right" },
    ],
    correctAction: "stop",
    explanation: "Come to a complete stop before the line or crosswalk. Check traffic and pedestrians, yield as required, and proceed only when safe.",
  },
  {
    id: "stop-sign-right-of-way",
    videoUrl: rightOfWay.url,
    pauseAt: 4.7,
    title: "All-way stop · the car opposite stopped first",
    actions: [
      { id: "go", label: "Go", icon: "go" },
      { id: "yield", label: "Yield", icon: "yield" },
      { id: "turn", label: "Turn left", icon: "left" },
    ],
    correctAction: "yield",
    explanation: "Stop fully and yield to the car opposite: it stopped first and you are both going straight. Go only after it proceeds and the intersection is clear.",
  },
  {
    id: "lane-change",
    videoUrl: laneChange.url,
    pauseAt: 1.9,
    title: "About to change lanes",
    actions: [
      { id: "move", label: "Move over", icon: "right" },
      { id: "check", label: "Check", icon: "check" },
      { id: "stop", label: "Stop", icon: "stop" },
    ],
    correctAction: "check",
    explanation: "Signal, check your mirrors, and look over your shoulder for the blind spot. Yield to vehicles already in the lane and move only into a safe gap.",
  },
  {
    id: "left-turn-green-arrow",
    videoUrl: leftTurnArrow.url,
    pauseAt: 2.3,
    title: "Green left-turn arrow",
    actions: [
      { id: "wait", label: "Wait", icon: "wait" },
      { id: "left", label: "Turn left", icon: "left" },
      { id: "right", label: "Turn right", icon: "right" },
    ],
    correctAction: "left",
    explanation: "The green arrow gives you a protected left turn; oncoming traffic is held at red. Check for pedestrians and any traffic still in the intersection before turning.",
  },
  {
    id: "right-turn-on-green",
    videoUrl: rightTurnGreen.url,
    pauseAt: 2.8,
    title: "Turning right on green · crosswalk ahead",
    actions: [
      { id: "go", label: "Go", icon: "go" },
      { id: "yield", label: "Yield", icon: "yield" },
      { id: "wait", label: "Wait", icon: "wait" },
    ],
    correctAction: "yield",
    explanation: "Check and yield to pedestrians and cyclists before and during your right turn. The green light permits the turn, but does not give you priority over people crossing.",
  },
  {
    id: "right-turn-on-red",
    videoUrl: rightTurnRed.url,
    pauseAt: 2.8,
    title: "Approaching a right turn on red · not stopped yet",
    actions: [
      { id: "right", label: "Turn right", icon: "right" },
      { id: "stop", label: "Stop", icon: "stop" },
      { id: "go", label: "Go", icon: "go" },
    ],
    correctAction: "stop",
    explanation: "Stop fully before the line, then confirm local rules allow right on red and no sign prohibits it. Yield to conflicting traffic, pedestrians and cyclists; turn only when the path is clear.",
  },
];
