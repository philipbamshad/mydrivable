import type { SignSpec, SignSymbol } from "@/components/dashboard/SignVisual";

/** What illustration (if any) a question gets. Pure so every sign question can be audited in tests. */
export type QuestionVisual =
  | { kind: "sign"; label: string; spec: SignSpec }
  | { kind: "prohibited"; label: string; inner: "left" | "u" }
  | { kind: "signal"; label: string; lit: "red" | "yellow" | "green" | "none"; arrow?: boolean; rail?: boolean; ped?: "walk" | "hand"; bike?: boolean }
  | { kind: "marking"; label: string; variant: "curb" | "crosswalk" | "line" | "bike" | "exit-arrow"; color: "yellow" | "white" | "red" | "green" | "blue"; dashed?: boolean; double?: boolean };

const C = {
  red: "var(--exam-road-red)", yellow: "var(--exam-road-yellow)", orange: "var(--exam-road-orange)", green: "var(--exam-road-green)",
  blue: "var(--exam-road-blue)", brown: "var(--exam-road-brown)", white: "var(--exam-road-white)", ink: "var(--exam-road-ink)",
  school: "var(--exam-road-school)", purple: "var(--exam-road-purple)",
};

const warn = (label: string, symbol?: SignSymbol, letters?: string): QuestionVisual => ({ kind: "sign", label, spec: { shape: "diamond", fill: C.yellow, stroke: C.ink, textColor: C.ink, symbol, letters } });
const reg = (label: string, letters: string, fill = C.white, textColor = C.ink, symbol?: SignSymbol): QuestionVisual => ({ kind: "sign", label, spec: { shape: "rect", fill, stroke: C.ink, textColor, letters, symbol } });
const STOP: QuestionVisual = { kind: "sign", label: "Stop sign", spec: { shape: "octagon", fill: C.red, stroke: C.white, letters: "STOP", textColor: C.white } };

/** Questions that mention a signal or sign but are not about recognising one. */
const NOT_VISUAL = /how far before a turn|signal your exit|when do you signal|officer signals|emergency vehicle|no signs or signals|rumble strip|school bus|no gates or signals/;

export function questionVisual(question: { q: string; sign?: SignSpec }): QuestionVisual | null {
  const t = question.q.toLowerCase();
  if (NOT_VISUAL.test(t)) return null;

  if (/railroad/.test(t) && /flashing red/.test(t)) return { kind: "signal", label: "Railroad crossing flashing red lights", lit: "red", rail: true };
  if (/\bstop sign\b|octagon/.test(t)) return STOP;
  if (question.sign) return { kind: "sign", label: question.sign.letters === "STOP" ? "Stop sign" : "Road sign", spec: question.sign };

  if (/red circle.*(?:slash|line through)|no[ -]u[ -]turn|no left turn/.test(t)) {
    const u = /u[ -]turn/.test(t);
    return { kind: "prohibited", label: u ? "No U-turn sign" : "No left turn sign", inner: u ? "u" : "left" };
  }

  // Signals
  if (/don't walk|upraised hand/.test(t)) return { kind: "signal", label: "Pedestrian signal showing an upraised hand", lit: "none", ped: "hand" };
  if (/walking person/.test(t)) return { kind: "signal", label: "Pedestrian signal showing a walking person", lit: "none", ped: "walk" };
  if (/bicycle-shaped/.test(t)) return { kind: "signal", label: "Bicycle traffic signal", lit: "green", bike: true };
  if (/(?:green|yellow|red) arrow/.test(t) && !/pavement/.test(t)) {
    const lit = /green/.test(t) ? "green" : /yellow/.test(t) ? "yellow" : "red";
    return { kind: "signal", label: `${lit[0].toUpperCase()}${lit.slice(1)} arrow signal`, lit, arrow: true };
  }
  if (/traffic light|traffic signal|flashing (?:yellow|red) (?:signal|light)|signal means|light turns/.test(t)) {
    if (/not working/.test(t)) return { kind: "signal", label: "Traffic signal that is not working", lit: "none" };
    const lit = /green/.test(t) ? "green" : /yellow/.test(t) ? "yellow" : "red";
    return { kind: "signal", label: `${/flashing/.test(t) ? "Flashing " : ""}${lit} traffic signal`, lit };
  }

  // Pavement markings
  if (/arrow on the pavement/.test(t)) return { kind: "marking", label: "Diagonal arrow pavement marking", variant: "exit-arrow", color: "white" };
  if (/what color curb/.test(t)) return null;
  if (/painted curb|(?:red|yellow|white|green|blue) curb/.test(t)) {
    const color = /green/.test(t) ? "green" : /yellow/.test(t) ? "yellow" : /blue/.test(t) ? "blue" : /white/.test(t) ? "white" : "red";
    return { kind: "marking", label: `${color} curb`, variant: "curb", color };
  }
  if (/crosswalk marking|crosswalk lines/.test(t)) return { kind: "marking", label: "Crosswalk markings", variant: "crosswalk", color: "white" };
  if (/sharrow|bike lane marking/.test(t)) return { kind: "marking", label: "Bike lane marking", variant: "bike", color: "white" };
  if (/lane line|yellow line|white line|parallel yellow|lane marking|pavement/.test(t)) {
    return { kind: "marking", label: "Lane line markings", variant: "line", color: /white/.test(t) ? "white" : "yellow", dashed: /broken|dashed/.test(t), double: /double|parallel/.test(t) };
  }

  // Named signs
  if (/inverted.*triangle|yield sign/.test(t)) return { kind: "sign", label: "Yield sign", spec: { shape: "triangle-down", fill: C.white, stroke: C.red, letters: "YIELD", textColor: C.red } };
  if (/wrong way/.test(t)) return reg("Wrong Way sign", "WRONG\nWAY", C.red, C.white);
  if (/do not enter/.test(t)) return { kind: "sign", label: "Do Not Enter sign", spec: { shape: "circle", fill: C.red, stroke: C.white, letters: "DO NOT ENTER", bar: true, textColor: C.white } };
  if (/no turn on red/.test(t)) return reg("No Turn on Red sign", "NO TURN\nON RED");
  if (/right lane must turn/.test(t)) return reg("Right Lane Must Turn sign", "RIGHT LANE\nMUST\nTURN RIGHT");
  if (/minimum speed/.test(t)) return reg("Minimum speed sign", "MINIMUM\nSPEED\n40");
  if (/school speed|beacons/.test(t)) return reg("School speed limit sign", "SCHOOL\nSPEED LIMIT\n25\nWHEN FLASHING");
  if (/speed limit 55/.test(t)) return reg("Speed limit sign", "SPEED\nLIMIT\n55");
  if (/reduced speed ahead/.test(t)) return reg("Reduced Speed Ahead sign", "REDUCED\nSPEED\nAHEAD");
  if (/white rectangular/.test(t)) return reg("Regulatory sign", "SPEED\nLIMIT\n35");
  if (/blue rectangular/.test(t)) return reg("Motorist services sign", "GAS\nFOOD\nLODGING", C.blue, C.white);
  if (/brown sign/.test(t)) return reg("Recreation sign", "STATE\nPARK", C.brown, C.white);
  if (/green guide/.test(t)) return reg("Guide sign", "EXIT 12\nMAIN ST →", C.green, C.white);
  if (/purple/.test(t)) return { kind: "sign", label: "Electronic toll lane sign", spec: { shape: "rect", fill: C.purple, stroke: C.ink, textColor: C.white, letters: "TOLL TAG\nONLY" } };
  if (/truck route|black truck/.test(t)) return reg("Truck route sign", "ROUTE 99", C.white, C.ink, "truck");
  if (/pennant/.test(t)) return { kind: "sign", label: "No passing zone sign", spec: { shape: "pennant", fill: C.yellow, stroke: C.ink, textColor: C.ink, letters: "NO\nPASSING\nZONE" } };
  if (/pentagon/.test(t)) return { kind: "sign", label: "School zone sign", spec: { shape: "pentagon", fill: C.school, stroke: C.ink, symbol: "school" } };

  // Warning signs
  if (/orange (?:sign|diamond)|construction signs/.test(t)) return { kind: "sign", label: "Work zone sign", spec: { shape: "diamond", fill: C.orange, stroke: C.ink, textColor: C.ink, letters: /reading slow/.test(t) ? "SLOW" : "ROAD\nWORK\nAHEAD" } };
  if (/arrow joining|merge sign/.test(t)) return warn("Merge warning sign", "merge");
  if (/'\+'|crossroad/.test(t)) return warn("Crossroad warning sign", "crossroad");
  if (/curving arrow/.test(t)) return warn("Curve warning sign with advisory speed", "curve-speed");
  if (/deer silhouette|deer crossing sign/.test(t)) return warn("Deer crossing sign", "deer");
  if (/truck on a downgrade/.test(t)) return warn("Steep grade sign", "truck-grade");
  if (/slippery when wet/.test(t)) return warn("Slippery When Wet sign", "slippery");
  if (/two-way/.test(t)) return warn("Two-Way Traffic sign", "two-way");
  if (/roundabout ahead/.test(t)) return warn("Roundabout Ahead sign", "roundabout");
  if (/dead end/.test(t)) return warn("Dead End sign", undefined, "DEAD\nEND");
  if (/no outlet/.test(t)) return warn("No Outlet sign", undefined, "NO\nOUTLET");
  if (/pedestrian/.test(t) && /sign/.test(t)) return warn("Pedestrian crossing sign", "pedestrian");
  if (/yellow diamond|warning sign/.test(t)) return warn("Curve warning sign", "curve");
  return null;
}
