import { getStatePack } from '@/data/dmv';

/** Drivable uses the under-18 permit format for every learner and every state. */
export function permitRules(state: string) {
  return getStatePack(state).rules;
}

export function setupReady(state: string | null, completedAt: string | null) {
  return Boolean(state && completedAt);
}
