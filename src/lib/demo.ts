import { getStatePack } from '@/data/dmv';
import { type PracticeQuestion } from '@/data/dmv/practice-bank';
import { SIMULATION_CLIPS } from '@/data/simulation-clips';
import { uniqueQuestionSession } from './question-session';

export const DEMO_POLICY = { savesProgress: false, consumesUsage: false, liveAI: false } as const;
export const DEMO_PRACTICE = uniqueQuestionSession(getStatePack('California').questions, 5, () => 0.5);

// Reuse the same authored road-sign specifications and renderer as the study tools.
export const DEMO_SIGNS: PracticeQuestion[] = [
  { q: 'What must you do at this eight-sided sign?', sign: { shape: 'octagon', fill: 'var(--exam-road-red)', stroke: 'var(--exam-road-white)', textColor: 'var(--exam-road-white)', letters: 'STOP' }, options: ['Stop completely', 'Slow down only', 'Do not enter', 'Keep going'], correct: 0, explanation: 'Stop completely at the limit line, before the crosswalk, or before entering the intersection. Proceed only when safe.' },
  { q: 'What does this downward-pointing triangle require?', sign: { shape: 'triangle-down', fill: 'var(--exam-road-white)', stroke: 'var(--exam-road-red)', textColor: 'var(--exam-road-ink)', letters: 'YIELD' }, options: ['Always stop', 'Give the right of way', 'Speed up', 'One-way road'], correct: 1, explanation: 'Slow down and give the right of way to traffic and pedestrians. Stop if necessary.' },
  { q: 'Can you enter a road displaying this sign?', sign: { shape: 'circle', fill: 'var(--exam-road-red)', stroke: 'var(--exam-road-white)', textColor: 'var(--exam-road-white)', letters: 'DO NOT ENTER', bar: true }, options: ['No parking', 'Stop, then enter', 'Do not enter this road', 'Yield ahead'], correct: 2, explanation: 'Do not enter: traffic on this road is traveling toward you. Look for a different entrance.' },
  { q: 'What does this warning sign mean?', sign: { shape: 'diamond', fill: 'var(--exam-road-yellow)', stroke: 'var(--exam-road-ink)', textColor: 'var(--exam-road-ink)', symbol: 'crossroad' }, options: ['Hospital ahead', 'Railroad crossing', 'Dead end', 'Crossroad ahead'], correct: 3, explanation: 'The yellow diamond with a cross warns of an intersection ahead. Watch for vehicles entering or crossing the road.' },
  { q: 'What does this sign warn you about?', sign: { shape: 'pentagon', fill: 'var(--exam-road-school)', stroke: 'var(--exam-road-ink)', textColor: 'var(--exam-road-ink)', symbol: 'school' }, options: ['School area or crossing', 'Highway entrance', 'Bicycle lane', 'No pedestrians'], correct: 0, explanation: 'The five-sided sign warns of a school area or school crossing. Watch for children and follow posted school-zone speed limits.' },
];
export const DEMO_SCENARIO = SIMULATION_CLIPS.find(s => s.id === 'pedestrian-crosswalk');

export { setupReady } from './permit-rules';
