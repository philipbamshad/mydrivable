// Type definitions for the Drivable DMV state ruleset.
// All data lives in `state-rules.json` and `questions-baseline.json`.

export type StateRules = {
  /** Canonical state name, matches what the global profile stores. */
  name: string;
  /** USPS 2-letter abbreviation. */
  abbr: string;
  /** Official DMV / DPS / MVD handbook URL — for audit and citation. */
  handbookUrl: string;

  // ---- Permit exam parameters ----
  /** Number of questions on the official written permit exam. */
  questionsCount: number;
  /** Minimum correct answers to pass. */
  minCorrectToPass: number;
  /** Passing percentage required (derived: minCorrectToPass / questionsCount). */
  passingScorePct: number;

  // ---- Blood Alcohol Concentration thresholds (decimal %) ----
  bacAdult: number;
  bacUnder21: number;
  bacCommercial: number;

  // ---- Graduated Driver License (GDL) ages ----
  /** Minimum age to apply for a learner's permit. */
  permitMinAge: number;
  /** Minimum age for a provisional / intermediate license. */
  provisionalMinAge: number;
  /** Minimum age for a full unrestricted license. */
  fullLicenseMinAge: number;
  /** Required supervised driving hours before road test (0 if not codified). */
  supervisedHoursRequired: number;

  // ---- Distracted driving ----
  /** Hand-held phone use prohibited for all adult drivers. */
  handheldPhoneBanAllDrivers: boolean;
  /** Texting while driving banned for all drivers (true in every US state). */
  textingBanAll: boolean;
  /** Representative first-offense base fine for hand-held/texting violation (USD). Verify current value with state DMV — surcharges/court costs not included. */
  firstOffensePhoneFineUSD: number;

  // ---- Implied consent ----
  /** Plain-language consequence of refusing a breathalyzer (first offense). */
  impliedConsentRefusal: string;

  /** Free-text notes — quirks, exceptions, recent statute changes. */
  notes: string;
};

export type Question = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  /** Optional citation: which state(s) this rule applies to. "*" = federal baseline. */
  source?: string;
};

export type StatePack = {
  rules: StateRules;
  /** Questions seen by the simulator: baseline pool + auto-generated state-fact questions. */
  questions: Question[];
};
