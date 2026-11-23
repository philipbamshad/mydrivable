import { getStatePack } from '@/data/dmv';

/** Self-reported age selects exam format, never permissions or plan access. */
export function permitRules(state: string, under18: boolean | null) {
  const rules = getStatePack(state).rules;
  if (state === 'California' && under18 === false) {
    return { ...rules, questionsCount: 36, minCorrectToPass: 30, passingScorePct: 83 };
  }
  return rules;
}