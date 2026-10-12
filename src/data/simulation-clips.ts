import clip1 from "@/assets/sim-clip-1.mp4.asset.json";

export type SimulationClip = {
  id: string;
  videoUrl: string;
  question: string;
  options: string[];
  correct: number; // index into options
  explanation: string;
};

// Add new clips here. Upload the video, import its pointer, and append an entry.
export const SIMULATION_CLIPS: SimulationClip[] = [
  {
    id: "stop-sign-residential",
    videoUrl: clip1.url,
    question: "You are approaching the stop sign ahead. What should you do?",
    options: [
      "Slow down and roll through if no cars are coming",
      "Come to a complete stop at the limit line, look both ways, then proceed when clear",
      "Honk and continue at the same speed",
      "Stop only if there is a car at the intersection",
    ],
    correct: 1,
    explanation:
      "A stop sign always requires a complete stop at the limit line (or before the crosswalk). Check for traffic and pedestrians, then go only when it is safe.",
  },
];
