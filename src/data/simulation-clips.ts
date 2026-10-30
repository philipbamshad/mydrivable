import stopSign from "@/assets/stop-sign-approach.webm.asset.json";
import rightOfWay from "@/assets/stop-sign-right-of-way.webm.asset.json";
import laneChange from "@/assets/lane-change.webm.asset.json";
import leftTurnArrow from "@/assets/left-turn-green-arrow.webm.asset.json";
import rightTurnGreen from "@/assets/right-turn-on-green.webm.asset.json";
import rightTurnRed from "@/assets/right-turn-on-red.webm.asset.json";
import type { SimulationClip } from "./simulation-session";

export type { SimulationClip } from "./simulation-session";

// Edit pauseAt (seconds) per scenario. Shorter existing videos hold their final frame.
export const SIMULATION_CLIPS: SimulationClip[] = [
  {
    id: "right-turn-on-green", videoUrl: rightTurnGreen.url, pauseAt: 3.5,
    title: "Right turn on green", intent: "Turning right", intentIcon: "right",
    subtitle: "Turning right on green · crosswalk ahead",
    actions: [
      { id: "right", label: "Turn right", icon: "right" },
      { id: "stop", label: "Stop", icon: "stop" },
      { id: "wait", label: "Wait for arrow", icon: "wait" },
    ],
    correctAction: "right",
    explanation: "The light is green and the crosswalk is clear, so you can turn right. Keep checking for pedestrians and cyclists as you turn.",
  },
  {
    id: "left-turn-green-arrow", videoUrl: leftTurnArrow.url, pauseAt: 2.0,
    title: "Left turn on green arrow", intent: "Turning left", intentIcon: "left",
    subtitle: "Turning left · green arrow",
    actions: [
      { id: "left", label: "Turn left", icon: "left" },
      { id: "yield", label: "Yield to oncoming traffic", icon: "yield" },
      { id: "stop", label: "Stop", icon: "stop" },
    ],
    correctAction: "left",
    explanation: "A green arrow means a protected turn. Oncoming traffic has a red light, so you can turn left without yielding to it.",
  },
  {
    id: "right-turn-on-red", videoUrl: rightTurnRed.url, pauseAt: 2.0,
    title: "Right turn on red", intent: "Turning right", intentIcon: "right",
    subtitle: "Turning right · red light",
    actions: [
      { id: "stop", label: "Full stop, then turn", icon: "stop" },
      { id: "slow", label: "Slow down and turn", icon: "right" },
      { id: "right", label: "Turn without stopping", icon: "right" },
    ],
    correctAction: "stop",
    explanation: "In California you can turn right on a red light unless a sign says otherwise, but you must come to a complete stop at the limit line first and yield to pedestrians and cross traffic.",
  },
  {
    id: "stop-sign-approach", videoUrl: stopSign.url, pauseAt: 4.5,
    title: "Stop sign", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · stop sign",
    actions: [
      { id: "stop", label: "Full stop", icon: "stop" },
      { id: "slow", label: "Slow and roll through", icon: "go" },
      { id: "go", label: "Keep going", icon: "go" },
    ],
    correctAction: "stop",
    explanation: "At a stop sign you must come to a complete stop at the limit line (or before the crosswalk), then go only when it's safe.",
  },
  {
    id: "stop-sign-right-of-way", videoUrl: rightOfWay.url, pauseAt: 4.5,
    title: "All-way stop", intent: "Going straight", intentIcon: "go",
    subtitle: "Going straight · all-way stop · the red car stopped first",
    actions: [
      { id: "go", label: "Go first", icon: "go" },
      { id: "yield", label: "Let them go first", icon: "yield" },
    ],
    correctAction: "yield",
    explanation: "At an all-way stop, the vehicle that stops first goes first. The red car was already stopped, so you let it go, then you go.",
  },
  {
    id: "lane-change", videoUrl: laneChange.url, pauseAt: 1.5,
    title: "Changing lanes", intent: "Changing lanes left", intentIcon: "left",
    subtitle: "Changing lanes · highway",
    actions: [
      { id: "check", label: "Signal and check blind spot", icon: "check" },
      { id: "move", label: "Change lanes now", icon: "left" },
      { id: "speed", label: "Speed up and merge", icon: "go" },
    ],
    correctAction: "check",
    explanation: "Before changing lanes, signal, check your mirrors, and look over your shoulder at your blind spot. Change lanes only when there's a safe gap.",
  },
];
