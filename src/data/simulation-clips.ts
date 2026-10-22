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
    question: "You are approaching this stop sign with a car coming toward the intersection. What should you do?",
    options: [
      "Slow down and roll through if the other car is still far away",
      "Come to a complete stop before the stop line, check for traffic and pedestrians, and proceed only when safe",
      "Follow the other car through without stopping",
      "Stop only if the other driver honks",
    ],
    correct: 1,
    explanation: "A stop sign requires a complete stop before the stop line, or before the crosswalk if there is no line. Check all directions, yield as required, and proceed only when it is safe.",
  },
  {
    id: "stop-sign-right-of-way",
    videoUrl: rightOfWay.url,
    question: "The car across from you is already stopped at this all-way stop. If it stopped before you and you are both going straight, who has the right of way?",
    options: [
      "You, because you are approaching the stop line",
      "The other car, because it came to a complete stop first",
      "The larger vehicle always goes first",
      "Whoever accelerates first has the right of way",
    ],
    correct: 1,
    explanation: "At an all-way stop, the vehicle that comes to a complete stop first generally goes first. Stop fully and let the other car proceed, then go when clear. The question specifies who stopped first because a stationary car alone does not establish right of way.",
  },
  {
    id: "lane-change",
    videoUrl: laneChange.url,
    question: "You are about to change lanes on this freeway. What should you do before moving over?",
    options: [
      "Move over immediately if the road ahead looks clear",
      "Signal, check your mirrors and blind spot, and move over only when there is a safe gap",
      "Check only your rearview mirror and change lanes quickly",
      "Honk so drivers in the next lane have to let you in",
    ],
    correct: 1,
    explanation: "Before changing lanes, signal your intention, check your mirrors, and look over your shoulder to check the blind spot. Yield to traffic already in the lane and move over smoothly only when there is enough space.",
  },
  {
    id: "left-turn-green-arrow",
    videoUrl: leftTurnArrow.url,
    question: "You are approaching this intersection and the green left-turn arrow is on. What should you do?",
    options: [
      "Wait for the light to turn fully green before turning",
      "Turn left now — the green arrow is a protected turn",
      "Turn left, but yield to oncoming traffic first",
      "Stop and wait for the intersection to fully clear",
    ],
    correct: 1,
    explanation: "A green left-turn arrow is a protected turn: oncoming traffic is held by a red light, so you may turn left without yielding to it. Still check for pedestrians and cross traffic before completing the turn.",
  },
  {
    id: "right-turn-on-green",
    videoUrl: rightTurnGreen.url,
    question: "You are approaching this intersection to make a right turn and the light is green. What should you do?",
    options: [
      "Speed up to finish the turn before pedestrians step into the crosswalk",
      "Turn right, but yield to pedestrians in the crosswalk as you make the turn",
      "Wait for the light to turn red before turning right",
      "Come to a full stop and wait for the intersection to completely clear",
    ],
    correct: 1,
    explanation: "On a green light you may turn right, but pedestrians crossing the crosswalk have the right of way — check for them (and for bikes) before and during the turn, and complete the turn only when it is safe.",
  },
  {
    id: "right-turn-on-red",
    videoUrl: rightTurnRed.url,
    question: "You want to make a right turn on red here. What should you check before turning?",
    options: [
      "Turn without stopping if no cars are directly in front of you",
      "Stop completely before the line, confirm right turns on red are allowed and there is no prohibiting sign, and yield until traffic, pedestrians, and cyclists are clear",
      "Check only for oncoming cars; pedestrians must wait for you",
      "Turn as soon as the car behind you honks, even if cross traffic is approaching",
    ],
    correct: 1,
    explanation: "First come to a complete stop before the stop line or crosswalk. Check that local rules allow a right turn on red and that there is no No Turn on Red sign. Yield to all conflicting traffic, including oncoming vehicles turning left, and to pedestrians and cyclists. Turn only when the path is clear and safe; a red light does not give you the right of way.",
  },
];
