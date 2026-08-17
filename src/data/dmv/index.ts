import baseline from "./questions-baseline.json";
import rulesJson from "./state-rules.json";
import { buildQuestionBank } from "./question-generator";
import type { Question, StateRules, StatePack } from "./types";



export type { Question, StateRules, StatePack } from "./types";

const RULES = rulesJson as Record<string, StateRules>;
const BASELINE = baseline as Question[];

/** Default ruleset used when no state is selected. Federal-baseline values. */
export const DEFAULT_RULES: StateRules = {
  name: "Default",
  abbr: "US",
  handbookUrl: "https://www.transportation.gov/",
  questionsCount: 25,
  minCorrectToPass: 20,
  passingScorePct: 80,
  bacAdult: 0.08,
  bacUnder21: 0.02,
  bacCommercial: 0.04,
  permitMinAge: 15,
  provisionalMinAge: 16,
  fullLicenseMinAge: 18,
  supervisedHoursRequired: 50,
  handheldPhoneBanAllDrivers: false,
  textingBanAll: true,
  firstOffensePhoneFineUSD: 100,
  impliedConsentRefusal: "License suspension on first refusal (length varies by state).",
  notes: "Federal-baseline defaults. Set your state in Settings for accurate values.",
};

/** Build a small set of state-fact questions auto-derived from the ruleset. */
function buildStateFactQuestions(r: StateRules): Question[] {
  const pctOptions = Array.from(new Set([70, 72, 75, 80, 83, 85, 88]))
    .sort((a, b) => a - b)
    .map((n) => `${n}%`);
  const bacAdultOptions = ["0.05%", "0.08%", "0.10%", "0.15%"];
  const bacUnder21Options = ["0.00%", "0.01%", "0.02%", "0.05%"];
  const ageOptions = [14, 15, 16, 17].map((n) => `${n}`);

  const passingIdx = pctOptions.indexOf(`${r.passingScorePct}%`);
  const bacAdultIdx = bacAdultOptions.indexOf(`${r.bacAdult.toFixed(2)}%`);
  const bacUnder21Idx = bacUnder21Options.indexOf(
    `${r.bacUnder21.toFixed(2)}%`,
  );
  const permitAgeIdx = ageOptions.indexOf(`${Math.floor(r.permitMinAge)}`);

  const out: Question[] = [];

  if (passingIdx >= 0) {
    out.push({
      q: `What passing score is required on the ${r.name} written permit exam?`,
      options: pctOptions,
      correct: passingIdx,
      explanation: `${r.name} requires ${r.minCorrectToPass} of ${r.questionsCount} correct (${r.passingScorePct}%). Source: ${r.handbookUrl}`,
      source: r.abbr,
    });
  }
  if (bacAdultIdx >= 0) {
    out.push({
      q: `What is the legal BAC limit for adult drivers (21+) in ${r.name}?`,
      options: bacAdultOptions,
      correct: bacAdultIdx,
      explanation: `${r.name}'s adult BAC threshold is ${r.bacAdult.toFixed(
        2,
      )}%${r.bacAdult === 0.05 ? " — the lowest in the US." : "."} Source: ${r.handbookUrl}`,
      source: r.abbr,
    });
  }
  if (bacUnder21Idx >= 0) {
    out.push({
      q: `Under ${r.name}'s zero-tolerance law, the BAC limit for drivers under 21 is…`,
      options: bacUnder21Options,
      correct: bacUnder21Idx,
      explanation: `${r.name} sets the under-21 limit at ${r.bacUnder21.toFixed(
        2,
      )}%. Source: ${r.handbookUrl}`,
      source: r.abbr,
    });
  }
  if (permitAgeIdx >= 0) {
    out.push({
      q: `What is the minimum age to apply for a learner's permit in ${r.name}?`,
      options: ageOptions,
      correct: permitAgeIdx,
      explanation: `${r.name} permits applications at ${r.permitMinAge}. Source: ${r.handbookUrl}`,
      source: r.abbr,
    });
  }

  out.push({
    q: `In ${r.name}, holding your phone in your hand while driving is…`,
    options: [
      "Always legal",
      "Legal except for texting",
      "Prohibited for all drivers",
      "Prohibited only for drivers under 18",
    ],
    correct: r.handheldPhoneBanAllDrivers ? 2 : r.textingBanAll ? 1 : 0,
    explanation: r.handheldPhoneBanAllDrivers
      ? `${r.name} has a hands-free law for all drivers. First-offense base fine ~$${r.firstOffensePhoneFineUSD}. Source: ${r.handbookUrl}`
      : r.textingBanAll
        ? `${r.name} bans texting/manual data entry for all drivers; voice calls are still legal hand-held. First-offense base fine ~$${r.firstOffensePhoneFineUSD}. Source: ${r.handbookUrl}`
        : `${r.name} has no statewide texting/phone ban. Local ordinances may still apply.`,
    source: r.abbr,
  });

  out.push({
    q: `Refusing a breathalyzer in ${r.name} results in…`,
    options: [
      "Only a warning",
      "Small fine, no license action",
      r.impliedConsentRefusal,
      "Nothing — you can always refuse",
    ],
    correct: 2,
    explanation: `${r.name} implied-consent law: ${r.impliedConsentRefusal} Source: ${r.handbookUrl}`,
    source: r.abbr,
  });

  return out;
}

/**
 * Build the full pack (rules + question pool) for a given state name.
 *
 * Order of the pool: the official handbook questions for that state code
 * first (the same rows the Sections tab uses), then auto derived state fact
 * questions, then the generated template bank, then the shared baseline.
 * With no state selected we default to California, per product.
 */
export function getStatePack(stateName: string | null | undefined): StatePack {
  const resolvedName =
    stateName && RULES[stateName] ? stateName : DEFAULT_STATE_NAME;
  const rules = RULES[resolvedName] ?? DEFAULT_RULES;
  const official = buildOfficialPool(resolvedName).map<Question>((q) => ({
    q: q.q,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    source: q.state_code,
  }));
  const stateFacts = buildStateFactQuestions(rules);
  const generated = buildQuestionBank(rules);
  return {
    rules,
    questions: [...official, ...stateFacts, ...generated, ...BASELINE],
  };
}


/** Sorted list of every state name in the dataset. */
export const ALL_STATES: string[] = Object.keys(RULES).sort();
