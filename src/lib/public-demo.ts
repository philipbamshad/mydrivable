import { getStatePack, type Question } from '@/data/dmv';
import { buildPillarBanks, type PracticeQuestion } from '@/data/dmv/practice-bank';
import { SIMULATION_CLIPS } from '@/data/simulation-clips';

function canonical<T extends Question>(question: T): T {
  const answer = question.options[question.correct];
  const options = [...question.options].sort();
  return {...question, options, correct: options.findIndex(option => option === answer)};
}
export const DEMO_PRACTICE = getStatePack('California').questions.slice(0,5).map(canonical);
export const DEMO_SIGNS: PracticeQuestion[] = buildPillarBanks('California').signs.filter(q=>q.sign).slice(0,5).map(canonical);
export const DEMO_SCENARIO = SIMULATION_CLIPS.find(clip=>clip.id === 'pedestrian-crosswalk');
export function demoAnswerCorrect(question: Question, answer: number) { return answer === question.correct; }
export function setupReady(state: string, completed: boolean) { return Boolean(state) && completed; }
