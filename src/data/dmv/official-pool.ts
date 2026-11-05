// Official handbook question pool.
//
// These items are transcribed from the official state driver handbook question
// set (California reference set) and authored once with {placeholders}. The
// pool is then materialized per state through `state-numerics.ts`, so every
// row carries a `state_code` and the numeric facts (speed limits, BAC limits,
// parking distances, reporting thresholds, point values) always match the
// jurisdiction the learner selected.
//
// Both surfaces read from this single pool:
//   - Mock / practice exams  -> `getStatePack()` in ./index.ts
//   - Sections / topic tabs  -> `buildPillarBanks()` in ./practice-bank.ts

import { getStateNumerics, interpolate, type StateNumerics } from "./state-numerics";
import type { PillarId } from "./practice-bank";

/** Topical categories used to group the pool in the Sections surface. */
export type PoolCategory =
  | "roadSigns"
  | "rightOfWay"
  | "alcoholAndDrugs"
  | "speedLimits"
  | "parkingRules"
  | "emergencyProcedures";

/** Existing four pillar surfaces each category feeds into. */
export const CATEGORY_TO_PILLAR: Record<PoolCategory, PillarId> = {
  roadSigns: "signs",
  rightOfWay: "intersections",
  alcoholAndDrugs: "substances",
  speedLimits: "speed",
  parkingRules: "speed",
  emergencyProcedures: "substances",
};

type PoolTemplate = {
  conceptId: string;
  id: string;
  category: PoolCategory;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type PoolQuestion = {
  conceptId: string;
  id: string;
  /** USPS code this materialized row belongs to. */
  state_code: string;
  category: PoolCategory;
  pillar: PillarId;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

// ---------------------------------------------------------------------------
// Authored pool (49 official items)
// ---------------------------------------------------------------------------
const POOL: PoolTemplate[] = [
  {
    conceptId: "accident-report",
    id: "accident-report",
    category: "emergencyProcedures",
    q: "When must you file {reportForm} with the {stateName} DMV after a collision?",
    options: ["Only if a vehicle must be towed","Injury, death, or damage over {accidentThreshold}","Only if police attend and request a report","Only if the other driver has no insurance"],
    correct: 1,
    explanation:
      "You must report a collision when there is an injury or death, or when property damage exceeds {accidentThreshold}. The report is due within {reportDays}, separate from any police report.",
  },
  {
    conceptId: "blind-intersection-speed",
    id: "blind-intersection-speed",
    category: "speedLimits",
    q: "What is the speed limit at a blind intersection in {stateName} when no limit is posted?",
    options: ["{blindSpeed}", "20 mph", "25 mph", "30 mph"],
    correct: 0,
    explanation: "The limit at a blind intersection is {blindSpeed} unless a lower limit is posted.",
  },
  {
    conceptId: "flashing-yellow",
    id: "flashing-yellow",
    category: "roadSigns",
    q: "A flashing yellow traffic light means…",
    options: ["Stop before entering the intersection","Proceed cautiously","Wait until the signal turns green","Treat it as an uncontrolled intersection"],
    correct: 1,
    explanation: "Flashing yellow means slow down and cross the intersection carefully.",
  },
  {
    conceptId: "merging-sign",
    id: "merging-sign",
    category: "roadSigns",
    q: "A yellow diamond sign showing an arrow joining a straight line warns you about…",
    options: ["A road ends beyond the intersection","Traffic merges ahead","A divided highway begins ahead","A truck escape ramp begins ahead"],
    correct: 1,
    explanation: "This is a merge warning: traffic from the side road will join your lane, so adjust speed and space.",
  },
  {
    conceptId: "unattended-hit",
    id: "unattended-hit",
    category: "emergencyProcedures",
    q: "You hit a legally parked car and cannot find the owner. What must you do?",
    options: ["Notify only your insurance company","Leave identification and report it","Wait briefly, then report only if contacted","Give your details only to a nearby business"],
    correct: 1,
    explanation:
      "Leave a note with your name, address, and an explanation of the collision attached securely to the vehicle, then notify police or the DMV. Driving off is hit and run.",
  },
  {
    conceptId: "seat-belts",
    id: "seat-belts",
    category: "emergencyProcedures",
    q: "Why does {stateName} require drivers and passengers to wear seat belts?",
    options: ["They protect only at highway speeds","They reduce crash injuries","They mainly prevent damage to the vehicle","They are useful only without an airbag"],
    correct: 1,
    explanation: "Seat belts sharply reduce the risk of serious injury and death, which is why they are mandatory for every seating position.",
  },
  {
    conceptId: "orange-slow",
    id: "orange-slow",
    category: "roadSigns",
    q: "An orange sign reading SLOW tells you that…",
    options: ["A school crossing is ahead","Road work ahead","The road terminates just ahead","A truck weight restriction begins"],
    correct: 1,
    explanation: "Orange is the work zone color: workers and equipment are ahead, so reduce speed and be ready to stop.",
  },
  {
    conceptId: "no-left-turn",
    id: "no-left-turn",
    category: "roadSigns",
    q: "A red circle with a slash across a left pointing arrow means…",
    options: [
      "Left turns only",
      "No left turn is permitted",
      "Left turn allowed after stopping",
      "Left lane must exit",
    ],
    correct: 1,
    explanation: "A red circle with a slash prohibits the movement pictured inside, so no left turn is allowed here.",
  },
  {
    conceptId: "common-violation",
    id: "common-violation",
    category: "speedLimits",
    q: "What is the most common traffic violation among new drivers?",
    options: ["Speeding","Illegal parking","Failing to signal","Following too closely"],
    correct: 0,
    explanation: "Speeding is the violation new drivers commit most, and in {stateName} a conviction adds {speedingPoints} to your record.",
  },
  {
    conceptId: "red-circle-slash",
    id: "red-circle-slash",
    category: "roadSigns",
    q: "A red circle with a red line through it on a sign means…",
    options: ["The action is recommended","The action is prohibited","Yield before taking the action","The restriction applies to trucks"],
    correct: 1,
    explanation: "A red circle and slash always prohibits whatever action is depicted inside it.",
  },
  {
    conceptId: "too-slow",
    id: "too-slow",
    category: "speedLimits",
    q: "Driving much slower than the flow of traffic can result in…",
    options: ["Automatic permission to use the shoulder","An impeding-traffic citation","An exemption from minimum-speed rules","A penalty only after a collision occurs"],
    correct: 1,
    explanation: "Blocking or impeding traffic is a violation. Keep pace with traffic within the posted limit, or move right and use a turn out.",
  },
  {
    conceptId: "pass-bicyclist",
    id: "pass-bicyclist",
    category: "rightOfWay",
    q: "You want to pass a bicyclist on a narrow two lane road, and a car is coming toward you. What should you do?",
    options: ["Pass before the oncoming vehicle arrives","Wait, then pass with legal clearance","Share the remaining space with both vehicles","Proceed once the bicyclist moves to the edge"],
    correct: 1,
    explanation: "Wait behind the bicyclist until the oncoming car clears, then pass with a safe buffer of at least three feet.",
  },
  {
    conceptId: "stop-sign",
    id: "stop-sign",
    category: "rightOfWay",
    q: "At an intersection with a stop sign, you must stop…",
    options: ["After entering the marked crosswalk","Before the line or crosswalk","Only when another vehicle approaches","After rolling forward to the road edge"],
    correct: 1,
    explanation: "Come to a complete stop behind the limit line or crosswalk (or before entering the intersection), then yield and proceed when clear.",
  },
  {
    conceptId: "railroad-flashing-red",
    id: "railroad-flashing-red",
    category: "emergencyProcedures",
    q: "Flashing red lights at a railroad crossing mean…",
    options: [
      "Slow down and continue if you see no train",
      "Stop completely, a train is approaching",
      "Proceed if the gate is up",
      "Yield to vehicles behind you",
    ],
    correct: 1,
    explanation: "Flashing red lights mean stop and stay stopped until the lights stop flashing and the crossing is clear.",
  },
  {
    conceptId: "yellow-curb",
    id: "yellow-curb",
    category: "parkingRules",
    q: "A yellow painted curb means the space is…",
    options: ["Time-limited loading","Police vehicle parking","A full-time no-stopping zone","Reserved accessible parking"],
    correct: 0,
    explanation:
      "Yellow curbs are loading zones for freight or passengers. Noncommercial drivers are usually held to the posted time limit and must stay with the vehicle.",
  },
  {
    conceptId: "school-bus-yellow",
    id: "school-bus-yellow",
    category: "rightOfWay",
    q: "A school bus ahead of you turns on flashing yellow lights. You should…",
    options: ["Pass before the red lights begin flashing","Slow; prepare to stop","Stop only after the bus door has opened","Maintain speed until children are visible"],
    correct: 1,
    explanation: "Flashing yellow warns that the bus is about to stop. When the red lights flash and the stop arm extends, you must stop in both directions unless divided by a barrier.",
  },
  {
    conceptId: "bike-lane-entry",
    id: "bike-lane-entry",
    category: "rightOfWay",
    q: "When may you drive in a bicycle lane?",
    options: ["Whenever the adjacent traffic lane is stopped","Within {bikeLaneFeet} before your right turn","Whenever you need to pass a slow vehicle","Only after completing a right turn"],
    correct: 1,
    explanation: "You may enter a bike lane within {bikeLaneFeet} of a right turn, after yielding to any bicyclist already in the lane.",
  },
  {
    conceptId: "teen-crash-rate",
    id: "teen-crash-rate",
    category: "emergencyProcedures",
    q: "Compared with older drivers, teen drivers are involved in fatal collisions…",
    options: ["At roughly the same rate","About {teenCrashMultiple} as often","At roughly half the rate","At a rate lower than all older groups"],
    correct: 1,
    explanation: "The {stateName} handbook reports teen drivers crashing roughly {teenCrashMultiple} more often, largely from inexperience, speed, and distraction.",
  },
  {
    conceptId: "school-zone-speed",
    id: "school-zone-speed",
    category: "speedLimits",
    q: "When children are present near a school, the speed limit within {schoolZoneFeet} of the school is…",
    options: ["{schoolZone}", "35 mph", "40 mph", "There is no special limit"],
    correct: 0,
    explanation: "In {stateName} the school zone limit is {schoolZone} within {schoolZoneFeet} of the school, unless a lower limit is posted.",
  },
  {
    conceptId: "trolley",
    id: "trolley",
    category: "rightOfWay",
    q: "When you are near an approaching trolley or light rail vehicle, you should…",
    options: ["Turn ahead if the signal is green", "Never turn directly in front of it", "Expect it to yield to turning cars", "Cross when the trolley starts slowing"],
    correct: 1,
    explanation: "Rail vehicles cannot stop or steer around you. Never turn in front of an approaching trolley or light rail train.",
  },
  {
    conceptId: "prescription-dui",
    id: "prescription-dui",
    category: "alcoholAndDrugs",
    q: "Driving while impaired by a legal prescription or over the counter medicine is…",
    options: [
      "Legal, because the drug is legal",
      "Illegal, impairment by any drug is a DUI",
      "Legal if you are under the {bacAdult} BAC limit",
      "Legal with a doctor's note",
    ],
    correct: 1,
    explanation: "A DUI covers impairment from any substance, including prescriptions and over the counter medicine. In {stateName} a conviction adds {duiPoints} to your record.",
  },
  {
    conceptId: "walking-person",
    id: "walking-person",
    category: "roadSigns",
    q: "A sign or signal showing a walking person symbol indicates…",
    options: ["Pedestrians may cross","A pedestrian trail begins","A bus loading area begins","A school bus stop is ahead"],
    correct: 0,
    explanation: "The walking person symbol marks an active pedestrian crossing, so scan for people on foot and be ready to yield.",
  },
  {
    conceptId: "first-rain",
    id: "first-rain",
    category: "speedLimits",
    q: "On a hot day, when is the road most slippery?",
    options: ["After several hours of steady rainfall","When rain first begins","Only after the roadway starts freezing","Just after all surface water has drained"],
    correct: 1,
    explanation: "Oil rises to the surface and mixes with the first water, so the first few minutes of rain are the most slippery. Slow well below {highway} conditions speed.",
  },
  {
    conceptId: "left-turn-two-way",
    id: "left-turn-two-way",
    category: "rightOfWay",
    q: "On a two way street, you should begin a left turn from…",
    options: ["The lane nearest the right curb","The lane nearest the center line","The paved shoulder beside your lane","Any lane with a clear view of traffic"],
    correct: 1,
    explanation: "Start a left turn from the lane nearest the center line and finish in the lane just right of the center line on the new street.",
  },
  {
    conceptId: "signal-distance",
    id: "signal-distance",
    category: "rightOfWay",
    q: "How far before a turn must you signal?",
    options: ["{signalFeet}","50 feet","150 feet","300 feet"],
    correct: 0,
    explanation: "Signal at least {signalFeet} before the turn so drivers and pedestrians can react.",
  },
  {
    conceptId: "cold-medicine",
    id: "cold-medicine",
    category: "alcoholAndDrugs",
    q: "Cold tablets and allergy medicine can…",
    options: ["Improve alertness without side effects","Cause drowsiness","Affect driving only when taken with food","Affect driving only after several doses"],
    correct: 1,
    explanation: "Many cold and allergy medicines cause drowsiness. Read the label and do not drive if it warns against operating machinery.",
  },
  {
    conceptId: "blind-intersection-def",
    id: "blind-intersection-def",
    category: "speedLimits",
    q: "Within the final {blindFeet} of a crossing, what makes the intersection blind?",
    options: ["No traffic signal controls the crossing","Your view is obstructed within {blindFeet}","More than four roads join at the crossing","A hill is present regardless of visibility"],
    correct: 1,
    explanation: "If your view is under {blindFeet} in either direction within the final {blindFeet} of the crossing, it is a blind intersection and the limit is {blindSpeed}.",
  },
  {
    conceptId: "double-parking",
    id: "double-parking",
    category: "parkingRules",
    q: "Double parking, that is stopping alongside a parked vehicle, is…",
    options: ["Permitted for very brief stops","Prohibited","Permitted with hazard flashers on","Permitted for commercial deliveries"],
    correct: 1,
    explanation: "Double parking blocks a traffic lane and is illegal, even with hazard lights on.",
  },
  {
    conceptId: "hydrant",
    id: "hydrant",
    category: "parkingRules",
    q: "You may not park within how many feet of a fire hydrant?",
    options: ["{hydrantFeet}", "5 feet", "30 feet", "50 feet"],
    correct: 0,
    explanation: "Keep at least {hydrantFeet} clear of a fire hydrant so crews can reach it.",
  },
  {
    conceptId: "gridlock",
    id: "gridlock",
    category: "rightOfWay",
    q: "You may not enter an intersection if…",
    options: ["A traffic light has just turned green","You cannot clear it","Another vehicle is waiting behind you","A pedestrian crosswalk is marked ahead"],
    correct: 1,
    explanation: "Blocking an intersection is illegal. Wait until you can clear it completely, even if the light is green.",
  },
  {
    conceptId: "night-pullover",
    id: "night-pullover",
    category: "emergencyProcedures",
    q: "An officer signals you to pull over at night. What should you do?",
    options: ["Stop immediately within your lane","Signal; pull over safely","Continue to a destination you recognize","Stop only at the next highway exit"],
    correct: 1,
    explanation: "Acknowledge the officer, signal, and pull over promptly in a well lit area where it is safe to stop.",
  },
  {
    conceptId: "school-zone-children",
    id: "school-zone-children",
    category: "speedLimits",
    q: "You are passing a school and children are in the crosswalk. What is the speed limit?",
    options: ["{schoolZone}", "30 mph", "35 mph", "The posted highway limit"],
    correct: 0,
    explanation: "The school zone limit in {stateName} is {schoolZone} unless a lower limit is posted, and you must yield to children crossing.",
  },
  {
    conceptId: "no-u-turn",
    id: "no-u-turn",
    category: "roadSigns",
    q: "A No U Turn sign means…",
    options: ["A U-turn is allowed on green","No U-turn here","A U-turn is allowed after stopping","Only commercial vehicles may U-turn"],
    correct: 1,
    explanation: "A No U Turn sign prohibits the 180 degree turn there regardless of the signal state.",
  },
  {
    conceptId: "windshield",
    id: "windshield",
    category: "emergencyProcedures",
    q: "Keeping your windshield clean inside and outside is important because…",
    options: ["It primarily improves the vehicle’s appearance","It reduces glare","It mainly prevents headlights from overheating","It matters only while driving in winter"],
    correct: 1,
    explanation: "Interior film and exterior grime scatter light, which magnifies glare from headlights and low sun.",
  },
  {
    conceptId: "unmarked-crosswalk",
    id: "unmarked-crosswalk",
    category: "rightOfWay",
    q: "Pedestrians crossing at a corner where no lines are painted…",
    options: ["Must always wait for all vehicles to pass","Can have right of way","Have rights only when lines are painted","May cross only when a signal is present"],
    correct: 1,
    explanation: "Crosswalks exist at intersections whether or not they are painted, and drivers must yield to pedestrians in them.",
  },
  {
    conceptId: "blind-corner",
    id: "blind-corner",
    category: "rightOfWay",
    q: "Your view is blocked at a corner. You should…",
    options: ["Proceed when traffic noise seems absent","Creep forward to see","Rely on the driver behind you to signal","Enter when you can see in one direction"],
    correct: 1,
    explanation: "Creep forward slowly until your line of sight opens up, then proceed when it is clear.",
  },
  {
    conceptId: "license-display",
    id: "license-display",
    category: "emergencyProcedures",
    q: "You must show your driver license…",
    options: ["Only while renewing it at the DMV","When an officer lawfully requests it","Only after a reportable traffic collision","Only when driving outside your home state"],
    correct: 1,
    explanation: "Carry your license whenever you drive and present it to a peace officer on request.",
  },
  {
    conceptId: "tailgating",
    id: "tailgating",
    category: "speedLimits",
    q: "Following another vehicle too closely can…",
    options: ["Improve traffic flow without added risk","Raise collision risk","Reduce stopping distance in an emergency","Cause problems only on high-speed roads"],
    correct: 1,
    explanation: "Tailgating removes your reaction space. Use a three second following gap, and more in rain or at {highway} speeds.",
  },
  {
    conceptId: "railroad-uncontrolled",
    id: "railroad-uncontrolled",
    category: "speedLimits",
    q: "Approaching a railroad crossing with no gates or signals and an obstructed view within {railroadViewFeet}, your speed limit within {railroadFeet} of the tracks is…",
    options: ["{railroadSpeed}", "25 mph", "35 mph", "The posted road limit"],
    correct: 0,
    explanation: "When your view of the tracks is blocked, the limit is {railroadSpeed} within {railroadFeet} of the crossing.",
  },
  {
    conceptId: "parking-brake",
    id: "parking-brake",
    category: "parkingRules",
    q: "When you park on a hill or incline you must…",
    options: ["Leave the transmission in neutral","Set the brake; angle the wheels","Rely only on placing the car in gear","Set the brake only on a very steep grade"],
    correct: 1,
    explanation: "Always set the parking brake when parking on a grade, turn the wheels, and leave the vehicle in gear or in park.",
  },
  {
    conceptId: "high-beams",
    id: "high-beams",
    category: "emergencyProcedures",
    q: "You must dim your high beams to low beams within…",
    options: ["{highBeamFeet} oncoming; {followBeamFeet} following","{followBeamFeet} oncoming; {highBeamFeet} following","100 feet oncoming; 100 feet following","1,000 feet oncoming; 1,000 feet following"],
    correct: 0,
    explanation: "Dim within {highBeamFeet} of an oncoming vehicle and within {followBeamFeet} when following, so you do not blind the other driver.",
  },
  {
    conceptId: "parking-slope",
    id: "parking-slope",
    category: "parkingRules",
    q: "When parking on a slope, you should turn your wheels so the vehicle would…",
    options: ["Roll toward the moving traffic lane","Roll toward the curb","Remain parallel to the traffic lane","Roll freely along the downhill grade"],
    correct: 1,
    explanation: "Turn the wheels so a runaway vehicle rolls into the curb and away from traffic: downhill turn them toward the curb, uphill turn them away.",
  },
  {
    conceptId: "flares",
    id: "flares",
    category: "emergencyProcedures",
    q: "When safe and permitted, where should warning devices be placed behind a disabled vehicle?",
    options: ["Directly beside the rear bumper","{flareFeet} behind","300 yards ahead of the vehicle","Only beside the driver-side door"],
    correct: 1,
    explanation: "Place flares or reflective triangles {flareFeet} behind the vehicle so approaching traffic gets early warning.",
  },
  {
    conceptId: "open-container",
    id: "open-container",
    category: "alcoholAndDrugs",
    q: "Where should an opened, unsealed container of alcohol be carried in an ordinary passenger vehicle?",
    options: ["In an unlocked glove compartment","In the trunk","On the rear passenger seat","In the center-console storage area"],
    correct: 1,
    explanation: "Open containers must be in the trunk, or behind the last seat if the vehicle has no trunk. Never in the passenger area.",
  },
  {
    conceptId: "t-intersection",
    id: "t-intersection",
    category: "rightOfWay",
    q: "At a T intersection with no signs or signals, who has the right of way?",
    options: ["Traffic on the terminating road","Traffic on the through road","The vehicle that first sounds a signal","The vehicle making a left turn"],
    correct: 1,
    explanation: "Traffic on the through road has the right of way. Vehicles on the terminating road must yield.",
  },
  {
    conceptId: "mountain-road",
    id: "mountain-road",
    category: "rightOfWay",
    q: "Two vehicles meet on a steep mountain road too narrow for both. Who has the right of way?",
    options: [
      "The vehicle going downhill",
      "The vehicle going uphill",
      "The larger vehicle",
      "The vehicle nearest a turnout",
    ],
    correct: 1,
    explanation: "The vehicle heading uphill has the right of way, because backing downhill is easier and safer to control.",
  },
  {
    conceptId: "one-way-left-turn",
    id: "one-way-left-turn",
    category: "rightOfWay",
    q: "From which lane should you begin a left turn from a one-way street onto another one-way street?",
    options: ["Begin from the far-right traffic lane","Begin from the far-left lane","Begin from any unoccupied through lane","Begin from the shoulder when available"],
    correct: 1,
    explanation: "Begin from the far left lane of the one way street and finish in any lane that is legally open to you.",
  },
  {
    conceptId: "child-unattended",
    id: "child-unattended",
    category: "emergencyProcedures",
    q: "Without supervision by someone at least {supervisorMinAge}, which age is covered by the unattended-child rule?",
    options: ["{childMaxAge} or younger, no supervision","Any age whenever the vehicle is legally parked","Only children older than ten without supervision","Only children in a vehicle with its engine running"],
    correct: 0,
    explanation: "A child {childMaxAge} or younger may not be left in a vehicle without supervision by someone at least {supervisorMinAge} years old.",
  },
  {
    conceptId: "turnouts",
    id: "turnouts",
    category: "speedLimits",
    q: "Turn out areas on a two lane highway are used to…",
    options: ["Temporary overnight parking","Letting others pass","Making a turn across opposing traffic","Loading passengers beside moving traffic"],
    correct: 1,
    explanation: "If five or more vehicles are stacked behind you, use a turn out or pull over safely to let them pass.",
  },
];

/**
 * Materialize the official pool for one state. Every row is stamped with that
 * state's `state_code` and every numeric fact is interpolated for it, so
 * filtering by state code returns only questions valid in that jurisdiction.
 */
export function buildOfficialPool(stateName?: string | null): PoolQuestion[] {
  const n: StateNumerics = getStateNumerics(stateName);
  return POOL.map((t) => ({
    id: `${n.stateCode}-${t.id}`,
    conceptId: t.conceptId,
    state_code: n.stateCode,
    category: t.category,
    pillar: CATEGORY_TO_PILLAR[t.category],
    q: interpolate(t.q, n),
    options: t.options.map((o) => interpolate(o, n)),
    correct: t.correct,
    explanation: interpolate(t.explanation, n),
  }));
}

/** Official pool for a state, filtered strictly by USPS state code. */
export function getPoolByStateCode(stateName: string | null | undefined, stateCode: string): PoolQuestion[] {
  return buildOfficialPool(stateName).filter((q) => q.state_code === stateCode);
}

/** Official pool grouped by topical category. */
export function buildOfficialPoolByCategory(
  stateName?: string | null,
): Record<PoolCategory, PoolQuestion[]> {
  const out: Record<PoolCategory, PoolQuestion[]> = {
    roadSigns: [],
    rightOfWay: [],
    alcoholAndDrugs: [],
    speedLimits: [],
    parkingRules: [],
    emergencyProcedures: [],
  };
  for (const q of buildOfficialPool(stateName)) out[q.category].push(q);
  return out;
}

export const CATEGORY_LABELS: Record<PoolCategory, string> = {
  roadSigns: "Road Signs",
  rightOfWay: "Right of Way",
  alcoholAndDrugs: "Alcohol & Drugs",
  speedLimits: "Speed Limits",
  parkingRules: "Parking Rules",
  emergencyProcedures: "Emergency Procedures",
};
