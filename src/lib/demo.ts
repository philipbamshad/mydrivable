import { type PracticeQuestion } from '@/data/dmv/practice-bank';
import { SIMULATION_CLIPS, type SimulationClip } from '@/data/simulation-clips';

export const DEMO_POLICY = { savesProgress: false, consumesUsage: false, liveAI: false } as const;
export type DemoQuestion = PracticeQuestion & { topic: string };

// State-neutral questions: no state names or state-specific numbers.
export const DEMO_PRACTICE: DemoQuestion[] = [
  { topic: 'Right of way', q: 'You reach an intersection with no signs or signals at the same time as a car on your right. Who goes first?', options: ['You do', 'The car on your right', 'Whoever is larger', 'Whoever honks first'], correct: 1, explanation: 'When two drivers arrive at the same time at an uncontrolled intersection, yield to the vehicle on your right.' },
  { topic: 'Speed and visibility', q: 'You are approaching a blind intersection where you cannot see cross traffic. What should you do?', options: ['Keep your speed and honk', 'Slow down and be ready to stop', 'Speed up to clear it quickly', 'Flash your headlights'], correct: 1, explanation: 'When you cannot see cross traffic, slow down enough that you can stop if a vehicle or pedestrian appears.' },
  { topic: 'Traffic signals', q: 'What does a flashing yellow traffic light mean?', options: ['Stop and wait for green', 'Proceed with caution', 'The light is broken; stop', 'Speed up before it turns red'], correct: 1, explanation: 'A flashing yellow light means slow down and proceed carefully, watching for other traffic and pedestrians.' },
  { topic: 'Emergency vehicles', q: 'An emergency vehicle with sirens and flashing lights approaches from behind. What should you do?', options: ['Speed up to stay ahead', 'Stop in your lane immediately', 'Pull to the right edge and stop', 'Keep driving normally'], correct: 2, explanation: 'Pull over to the right edge of the road and stop until the emergency vehicle has passed, unless you are in an intersection.' },
  { topic: 'Pedestrians', q: 'A pedestrian is crossing in a marked crosswalk ahead of you. What must you do?', options: ['Honk so they hurry', 'Drive around them', 'Stop and let them finish crossing', 'Proceed if they are not in your lane yet'], correct: 2, explanation: 'Pedestrians in a crosswalk have the right of way. Stop and wait until they have safely crossed.' },
];

export const DEMO_SIGNS: DemoQuestion[] = [
  { topic: 'Road signs', q: 'What must you do at this eight-sided sign?', sign: { shape: 'octagon', fill: 'var(--exam-road-red)', stroke: 'var(--exam-road-white)', textColor: 'var(--exam-road-white)', letters: 'STOP' }, options: ['Slow down and proceed if clear', 'Yield only to vehicles on the right', 'Come to a complete halt before proceeding safely', 'Continue without changing speed'], correct: 2, explanation: 'Stop completely at the stop line, before the crosswalk, or before entering the intersection. Proceed only when safe.' },
  { topic: 'Road signs', q: 'What does this downward-pointing triangle require?', sign: { shape: 'triangle-down', fill: 'var(--exam-road-white)', stroke: 'var(--exam-road-red)', textColor: 'var(--exam-road-ink)', letters: 'YIELD' }, options: ['Always stop', 'Give the right of way', 'Speed up', 'One-way road'], correct: 1, explanation: 'Slow down and give the right of way to traffic and pedestrians. Stop if necessary.' },
  { topic: 'Road signs', q: 'What must you do when you see this sign at a roadway entrance?', sign: { shape: 'circle', fill: 'var(--exam-road-red)', stroke: 'var(--exam-road-white)', textColor: 'var(--exam-road-white)', letters: 'DO NOT ENTER', bar: true }, options: ['Choose a different route', 'Proceed after yielding', 'Park beside the sign', 'Continue against one-way traffic'], correct: 0, explanation: 'Do not enter: traffic on this road is traveling toward you. Look for a different entrance.' },
  { topic: 'Warning signs', q: 'What does this warning sign mean?', sign: { shape: 'diamond', fill: 'var(--exam-road-yellow)', stroke: 'var(--exam-road-ink)', textColor: 'var(--exam-road-ink)', symbol: 'crossroad' }, options: ['Hospital ahead', 'Railroad crossing', 'Dead end', 'Crossroad ahead'], correct: 3, explanation: 'The yellow diamond with a cross warns of an intersection ahead. Watch for vehicles entering or crossing the road.' },
  { topic: 'School zones', q: 'What does this sign warn you about?', sign: { shape: 'pentagon', fill: 'var(--exam-road-school)', stroke: 'var(--exam-road-ink)', textColor: 'var(--exam-road-ink)', symbol: 'school' }, options: ['School area or crossing', 'Highway entrance', 'Bicycle lane', 'No pedestrians'], correct: 0, explanation: 'The five-sided sign warns of a school area or school crossing. Watch for children and follow posted school-zone speed limits.' },
];

export const DEMO_COACH: DemoQuestion = { topic: 'Warning signs', q: 'What does a yellow, diamond-shaped sign mean?', options: ['You must stop', 'A service or attraction nearby', 'A warning of conditions ahead'], correct: 2, explanation: 'Yellow diamond signs warn of conditions ahead.' };
export const DEMO_COACH_REPLY = 'A yellow diamond sign warns of conditions ahead, like curves, merges or crossings. Slow down and be ready to react.';

export type DemoScenario = { clip: SimulationClip; correct: 'go' | 'yield' | 'stop'; explanation: string; topic: string; signal: 'left' | 'right' };
const clip = (id: string) => { const c = SIMULATION_CLIPS.find(s => s.id === id); if (!c) throw new Error(`Missing clip ${id}`); return c; };
export const DEMO_SCENARIOS: DemoScenario[] = [
  { clip: clip('left-turn-green-arrow'), correct: 'go', signal: 'left', topic: 'Green arrows', explanation: 'A green arrow means a protected turn. Go when the path is clear.' },
  { clip: clip('no-turn-on-red'), correct: 'stop', signal: 'right', topic: 'Turning on red', explanation: 'The sign means no turn on red. Wait for the green light.' },
  { clip: clip('left-turn-solid-green'), correct: 'yield', signal: 'left', topic: 'Left turns on green', explanation: "A solid green isn't a green arrow. Yield to oncoming traffic before turning." },
];
export const DEMO_ACTIONS = ['go', 'yield', 'stop'] as const;
/** Scenarios expressed as questions so results and progress use the same scoring helper. */
export const DEMO_SCENARIO_QUESTIONS: DemoQuestion[] = DEMO_SCENARIOS.map(s => ({ topic: s.topic, q: s.clip.title, options: ['Go', 'Yield', 'Stop'], correct: DEMO_ACTIONS.indexOf(s.correct), explanation: s.explanation }));

export { setupReady } from './permit-rules';
