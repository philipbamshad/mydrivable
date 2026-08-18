// State numeric tailoring for the official question pool.
//
// Every question in `official-pool.ts` is authored once with placeholders and
// then materialized per state by substituting the values below, so a single
// authored item yields a valid variation for each of the 50 states
// (speed limits, BAC limits, parking distances, reporting thresholds, and
// point/penalty values all move with the jurisdiction).

import rulesJson from "./state-rules.json";
import { STATE_DRIVING_RULES } from "@/data/states";
import type { StateRules } from "./types";

const RULES = rulesJson as Record<string, StateRules>;

/** Canonical fallback state when the user has not picked one yet. */
export const DEFAULT_STATE_NAME = "California";

export type StateNumerics = {
  stateName: string;
  /** USPS two letter code, used as the `state_code` on every pool row. */
  stateCode: string;
  handbookUrl: string;
  /** Number of questions on the official written exam. */
  examCount: number;
  passPct: number;
  /** Speed limits */
  residential: string;
  urban: string;
  highway: string;
  schoolZone: string;
  schoolZoneFeet: string;
  blindSpeed: string;
  blindFeet: string;
  alley: string;
  railroadSpeed: string;
  railroadFeet: string;
  railroadViewFeet: string;
  /** Alcohol and drugs */
  bacAdult: string;
  bacU21: string;
  bacCommercial: string;
  /** Parking distances */
  hydrantFeet: string;
  crosswalkFeet: string;
  /** Signaling and lighting distances */
  signalFeet: string;
  bikeLaneFeet: string;
  highBeamFeet: string;
  followBeamFeet: string;
  flareFeet: string;
  /** Reporting and penalties */
  accidentThreshold: string;
  reportForm: string;
  reportDays: string;
  teenCrashMultiple: string;
  speedingPoints: string;
  duiPoints: string;
  childMaxAge: string;
  supervisorMinAge: string;
};

type Overrides = Partial<Omit<StateNumerics, "stateName" | "stateCode">>;

/** Values shared by most jurisdictions unless a state overrides them. */
const BASE: Omit<StateNumerics, "stateName" | "stateCode" | "handbookUrl" | "examCount" | "passPct"> = {
  residential: "25 mph",
  urban: "45 mph",
  highway: "65 mph",
  schoolZone: "20 mph",
  schoolZoneFeet: "500 feet",
  blindSpeed: "15 mph",
  blindFeet: "100 feet",
  alley: "15 mph",
  railroadSpeed: "15 mph",
  railroadFeet: "100 feet",
  railroadViewFeet: "400 feet",
  bacAdult: "0.08%",
  bacU21: "0.02%",
  bacCommercial: "0.04%",
  hydrantFeet: "15 feet",
  crosswalkFeet: "20 feet",
  signalFeet: "100 feet",
  bikeLaneFeet: "200 feet",
  highBeamFeet: "500 feet",
  followBeamFeet: "300 feet",
  flareFeet: "100 to 150 feet",
  accidentThreshold: "$1,000",
  reportForm: "an accident report",
  reportDays: "10 days",
  teenCrashMultiple: "3 times",
  speedingPoints: "1 point",
  duiPoints: "2 points",
  childMaxAge: "6",
  supervisorMinAge: "12",
};

/** Per state deltas taken from each official driver handbook. */
const OVERRIDES: Record<string, Overrides> = {
  California: {
    schoolZone: "25 mph",
    schoolZoneFeet: "500 feet",
    bacU21: "0.01%",
    reportForm: "an SR 1 report",
    reportDays: "10 days",
    teenCrashMultiple: "4 times",
    speedingPoints: "1 point",
    duiPoints: "2 points",
  },
  "New York": {
    schoolZone: "15 mph",
    accidentThreshold: "$1,000",
    reportForm: "an MV 104 report",
    signalFeet: "100 feet",
    speedingPoints: "3 points",
    duiPoints: "0 points (a DWI conviction is handled as a revocation, not points)",
  },
  Texas: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,000",
    reportForm: "a CR 2 report",
    highway: "75 mph",
    speedingPoints: "2 points",
  },
  Florida: {
    schoolZone: "20 mph",
    accidentThreshold: "$500",
    reportForm: "a crash report",
    highway: "70 mph",
    speedingPoints: "3 points",
    duiPoints: "4 points",
  },
  Illinois: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,500",
    reportForm: "an Illinois motorist report",
    speedingPoints: "5 points",
  },
  Pennsylvania: {
    schoolZone: "15 mph",
    accidentThreshold: "$500",
    reportForm: "a driver accident report",
    speedingPoints: "2 points",
  },
  Ohio: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,000",
    reportForm: "a crash report",
    speedingPoints: "2 points",
  },
  Georgia: {
    schoolZone: "25 mph",
    accidentThreshold: "$500",
    reportForm: "a crash report",
    speedingPoints: "2 points",
  },
  Michigan: {
    schoolZone: "25 mph",
    accidentThreshold: "$1,000",
    reportForm: "a traffic crash report",
    speedingPoints: "2 points",
  },
  "North Carolina": {
    schoolZone: "25 mph",
    accidentThreshold: "$1,000",
    reportForm: "a crash report",
    speedingPoints: "2 points",
  },
  Arizona: {
    schoolZone: "15 mph",
    accidentThreshold: "$2,000",
    reportForm: "a crash report",
  },
  Washington: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,000",
    reportForm: "a collision report",
  },
  Nevada: {
    schoolZone: "15 mph",
    accidentThreshold: "$750",
    reportForm: "an SR 1 report",
  },
  "New Jersey": {
    schoolZone: "25 mph",
    accidentThreshold: "$500",
    reportForm: "an NJTR 1 report",
  },
  Massachusetts: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,000",
    reportForm: "a crash operator report",
  },
  Virginia: {
    schoolZone: "25 mph",
    accidentThreshold: "$1,500",
    reportForm: "a crash report",
  },
  Colorado: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,000",
    reportForm: "an accident report",
  },
  Oregon: {
    schoolZone: "20 mph",
    accidentThreshold: "$2,500",
    reportForm: "an Oregon traffic accident and insurance report",
    reportDays: "72 hours",
  },
  Utah: {
    schoolZone: "20 mph",
    accidentThreshold: "$2,500",
    reportForm: "a crash report",
  },
  Tennessee: {
    schoolZone: "15 mph",
    accidentThreshold: "$1,500",
    reportForm: "a crash report",
  },
  Indiana: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,000",
    reportForm: "a crash report",
  },
  Missouri: {
    schoolZone: "20 mph",
    accidentThreshold: "$500",
    reportForm: "an accident report",
  },
  Maryland: {
    schoolZone: "25 mph",
    accidentThreshold: "$1,000",
    reportForm: "a crash report",
  },
  Wisconsin: {
    schoolZone: "15 mph",
    accidentThreshold: "$1,000",
    reportForm: "an MV 4000 report",
  },
  Minnesota: {
    schoolZone: "20 mph",
    accidentThreshold: "$1,000",
    reportForm: "a crash report",
  },
};

/** Resolve the full numeric profile for a state name (defaults to California). */
export function getStateNumerics(stateName?: string | null): StateNumerics {
  const name = (stateName && RULES[stateName] && stateName) || DEFAULT_STATE_NAME;
  const rules = RULES[name];
  const driving = STATE_DRIVING_RULES[name];

  return {
    ...BASE,
    ...(driving
      ? {
          residential: driving.speedLimits.residential,
          urban: driving.speedLimits.urban,
          highway: driving.speedLimits.highway,
          bacAdult: driving.duiLimits.adult,
          bacU21: driving.duiLimits.under21,
        }
      : {}),
    ...(rules
      ? {
          bacAdult: `${rules.bacAdult.toFixed(2)}%`,
          bacU21: `${rules.bacUnder21.toFixed(2)}%`,
          bacCommercial: `${rules.bacCommercial.toFixed(2)}%`,
        }
      : {}),
    ...(OVERRIDES[name] ?? {}),
    stateName: name,
    stateCode: rules?.abbr ?? "US",
    handbookUrl: rules?.handbookUrl ?? "https://www.usa.gov/motor-vehicle-services",
    examCount: rules?.questionsCount ?? 25,
    passPct: rules?.passingScorePct ?? 80,
  };
}

/** Substitute {placeholders} in authored copy against a state's numerics. */
export function interpolate(text: string, n: StateNumerics): string {
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const value = (n as unknown as Record<string, unknown>)[key];
    return value === undefined ? whole : String(value);
  });
}
