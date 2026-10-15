import clip1 from "@/assets/sim-clip-1.mp4.asset.json";
import clip2 from "@/assets/sim-clip-2.mp4.asset.json";
import clip3 from "@/assets/sim-clip-3.mp4.asset.json";
import clip4 from "@/assets/sim-clip-4.mp4.asset.json";
import clip5 from "@/assets/sim-clip-5.mp4.asset.json";
import clip6 from "@/assets/sim-clip-6.mp4.asset.json";
import clip7 from "@/assets/sim-clip-7.mp4.asset.json";

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
  {
    id: "freeway-following-distance",
    videoUrl: clip2.url,
    question:
      "You are driving on a busy freeway at highway speed. How much following distance should you keep from the vehicle ahead?",
    options: [
      "About one second, so you never fall behind",
      "About three seconds or more, so you have time to react",
      "Stay as close as possible to keep traffic moving",
      "Following distance does not matter on a freeway",
    ],
    correct: 1,
    explanation:
      "At freeway speeds you need at least a three-second gap to react and stop safely. Add more space in rain, fog, or when following large vehicles.",
  },
  {
    id: "city-green-light",
    videoUrl: clip3.url,
    question:
      "You are approaching a city intersection and the light is green. What should you do?",
    options: [
      "Speed up to get through before it changes",
      "Close your eyes to traffic since green means go",
      "Proceed, but scan left and right for cross traffic before entering",
      "Stop at every green light to be safe",
    ],
    correct: 2,
    explanation:
      "A green light means you may go, but intersections are where most collisions happen. Check for cars running the red light and for pedestrians before entering.",
  },
  {
    id: "pedestrian-crossing-boulevard",
    videoUrl: clip4.url,
    question:
      "You see the yellow pedestrian crossing signs ahead on this busy boulevard. What should you be ready to do?",
    options: [
      "Speed up to clear the crossing quickly",
      "Slow down and yield to pedestrians in or entering the crosswalk",
      "Honk to warn pedestrians to stay back",
      "Change lanes so you do not have to watch the crosswalk",
    ],
    correct: 1,
    explanation:
      "Yellow crossing signs warn that pedestrians may be present. Slow down, watch both sides, and always yield to anyone in or stepping into the crosswalk.",
  },
  {
    id: "red-light-intersection",
    videoUrl: clip5.url,
    question:
      "The traffic signal ahead is red as you approach the intersection. What should you do?",
    options: [
      "Stop before the crosswalk or limit line and wait for green",
      "Slow down and go through if the intersection looks empty",
      "Stop inside the crosswalk so you can see better",
      "Speed up to beat the light before it fully changes",
    ],
    correct: 0,
    explanation:
      "A red light requires a complete stop before the limit line or crosswalk. Never enter the intersection or block the crosswalk while waiting.",
  },
  {
    id: "suburban-bike-lane",
    videoUrl: clip6.url,
    question:
      "You plan to turn right at the upcoming intersection and there is a bike lane along the road. What is the correct way to turn?",
    options: [
      "Turn right immediately without checking the bike lane",
      "Signal, look for cyclists, and yield to them before completing the turn",
      "Drive in the bike lane for several blocks before turning",
      "Honk at cyclists so they clear out of your way",
    ],
    correct: 1,
    explanation:
      "Before turning right across a bike lane, signal early, check your mirrors and blind spot, and yield to any cyclist going straight. Cyclists in the bike lane have the right of way.",
  },
  {
    id: "downtown-double-yellow",
    videoUrl: clip7.url,
    question:
      "You are on a downtown street and notice the double yellow lines down the center. What do they mean?",
    options: [
      "Parking is allowed on both sides of the street",
      "You may pass slower traffic when it is safe",
      "Passing or crossing the lines to pass is not allowed",
      "The lanes change direction depending on the time of day",
    ],
    correct: 2,
    explanation:
      "Solid double yellow lines mean traffic travels in opposite directions and passing is not permitted. You may only cross them to turn into a driveway or side road when safe.",
  },
];
