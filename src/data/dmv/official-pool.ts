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
  id: string;
  category: PoolCategory;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type PoolQuestion = {
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
    id: "accident-report",
    category: "emergencyProcedures",
    q: "When must you file {reportForm} with the {stateName} DMV after a collision?",
    options: [
      "Only when a vehicle has to be towed",
      "Any time someone is injured or killed, or property damage is more than {accidentThreshold}",
      "Only when a police officer asks you to",
      "Never, the insurance company always files for you",
    ],
    correct: 1,
    explanation:
      "You must report a collision when there is an injury or death, or when property damage exceeds {accidentThreshold}. The report is due within {reportDays}, separate from any police report.",
  },
  {
    id: "blind-intersection-speed",
    category: "speedLimits",
    q: "What is the speed limit at a blind intersection in {stateName} when no limit is posted?",
    options: ["{blindSpeed}", "20 mph", "25 mph", "30 mph"],
    correct: 0,
    explanation: "The limit at a blind intersection is {blindSpeed} unless a lower limit is posted.",
  },
  {
    id: "flashing-yellow",
    category: "roadSigns",
    q: "A flashing yellow traffic light means…",
    options: [
      "Stop completely, then go",
      "Slow down and proceed with caution",
      "Speed up to clear the intersection",
      "The signal is out, treat it as a four way stop",
    ],
    correct: 1,
    explanation: "Flashing yellow means slow down and cross the intersection carefully.",
  },
  {
    id: "merging-sign",
    category: "roadSigns",
    q: "A yellow diamond sign showing an arrow joining a straight line warns you about…",
    options: [
      "A road that ends ahead",
      "Cars merging into your lane from the side",
      "A divided highway starting",
      "A truck escape ramp",
    ],
    correct: 1,
    explanation: "This is a merge warning: traffic from the side road will join your lane, so adjust speed and space.",
  },
  {
    id: "unattended-hit",
    category: "emergencyProcedures",
    q: "You hit a legally parked car and cannot find the owner. What must you do?",
    options: [
      "Nothing, an unattended vehicle is not a reportable collision",
      "Leave a note with your name, address, and collision details secured to the vehicle, and report the crash",
      "Wait five minutes, then drive away",
      "Tell the nearest business owner and leave",
    ],
    correct: 1,
    explanation:
      "Leave a note with your name, address, and an explanation of the collision attached securely to the vehicle, then notify police or the DMV. Driving off is hit and run.",
  },
  {
    id: "seat-belts",
    category: "emergencyProcedures",
    q: "Why does {stateName} require drivers and passengers to wear seat belts?",
    options: [
      "They keep you from being thrown out of the vehicle and cut injury and death risk in a crash",
      "They only matter on the freeway",
      "They protect the vehicle from damage",
      "They are only needed for children",
    ],
    correct: 0,
    explanation: "Seat belts sharply reduce the risk of serious injury and death, which is why they are mandatory for every seating position.",
  },
  {
    id: "orange-slow",
    category: "roadSigns",
    q: "An orange sign reading SLOW tells you that…",
    options: [
      "A school zone is ahead",
      "Workers and equipment are ahead",
      "The road ends",
      "A weight limit applies",
    ],
    correct: 1,
    explanation: "Orange is the work zone color: workers and equipment are ahead, so reduce speed and be ready to stop.",
  },
  {
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
    id: "common-violation",
    category: "speedLimits",
    q: "What is the most common traffic violation among new drivers?",
    options: ["Speeding", "Illegal parking", "Failing to signal", "Driving without a spare tire"],
    correct: 0,
    explanation: "Speeding is the violation new drivers commit most, and in {stateName} a conviction adds {speedingPoints} to your record.",
  },
  {
    id: "red-circle-slash",
    category: "roadSigns",
    q: "A red circle with a red line through it on a sign means…",
    options: [
      "The action shown inside the circle is prohibited",
      "The action shown is recommended",
      "Yield to the action shown",
      "The sign applies only to trucks",
    ],
    correct: 0,
    explanation: "A red circle and slash always prohibits whatever action is depicted inside it.",
  },
  {
    id: "too-slow",
    category: "speedLimits",
    q: "Driving much slower than the flow of traffic can result in…",
    options: [
      "Nothing, slower is always safer",
      "A ticket or arrest for impeding the normal flow of traffic",
      "A warning only, never a citation",
      "A reduced insurance rate",
    ],
    correct: 1,
    explanation: "Blocking or impeding traffic is a violation. Keep pace with traffic within the posted limit, or move right and use a turn out.",
  },
  {
    id: "pass-bicyclist",
    category: "rightOfWay",
    q: "You want to pass a bicyclist on a narrow two lane road, and a car is coming toward you. What should you do?",
    options: [
      "Sound your horn and pass immediately",
      "Slow down, let the oncoming car pass, then pass the bicyclist with at least three feet of space",
      "Straddle the center line and squeeze between both",
      "Follow closely behind until the bicyclist moves off the road",
    ],
    correct: 1,
    explanation: "Wait behind the bicyclist until the oncoming car clears, then pass with a safe buffer of at least three feet.",
  },
  {
    id: "stop-sign",
    category: "rightOfWay",
    q: "At an intersection with a stop sign, you must stop…",
    options: [
      "Anywhere in the intersection",
      "Completely behind the limit line or crosswalk, then proceed when it is safe",
      "Only if another vehicle is present",
      "Just slowly enough to look both ways",
    ],
    correct: 1,
    explanation: "Come to a complete stop behind the limit line or crosswalk (or before entering the intersection), then yield and proceed when clear.",
  },
  {
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
    id: "yellow-curb",
    category: "parkingRules",
    q: "A yellow painted curb means the space is…",
    options: [
      "A passenger and freight loading zone with time limits",
      "Reserved for police vehicles",
      "A no stopping zone at all times",
      "For disabled parking only",
    ],
    correct: 0,
    explanation:
      "Yellow curbs are loading zones for freight or passengers. Noncommercial drivers are usually held to the posted time limit and must stay with the vehicle.",
  },
  {
    id: "school-bus-yellow",
    category: "rightOfWay",
    q: "A school bus ahead of you turns on flashing yellow lights. You should…",
    options: [
      "Pass quickly before the red lights come on",
      "Slow down and prepare to stop, because red flashing lights mean a full stop",
      "Sound your horn",
      "Change lanes and maintain speed",
    ],
    correct: 1,
    explanation: "Flashing yellow warns that the bus is about to stop. When the red lights flash and the stop arm extends, you must stop in both directions unless divided by a barrier.",
  },
  {
    id: "bike-lane-entry",
    category: "rightOfWay",
    q: "When may you drive in a bicycle lane?",
    options: [
      "Any time traffic is heavy",
      "Within {bikeLaneFeet} of an intersection where you are making a right turn",
      "Only to pass a slow vehicle",
      "Never, under any circumstance",
    ],
    correct: 1,
    explanation: "You may enter a bike lane within {bikeLaneFeet} of a right turn, after yielding to any bicyclist already in the lane.",
  },
  {
    id: "teen-crash-rate",
    category: "emergencyProcedures",
    q: "Compared with older drivers, teen drivers are involved in fatal collisions…",
    options: [
      "About the same amount",
      "About {teenCrashMultiple} more often",
      "Half as often",
      "Only when driving at night",
    ],
    correct: 1,
    explanation: "The {stateName} handbook reports teen drivers crashing roughly {teenCrashMultiple} more often, largely from inexperience, speed, and distraction.",
  },
  {
    id: "school-zone-speed",
    category: "speedLimits",
    q: "When children are present near a school, the speed limit within {schoolZoneFeet} of the school is…",
    options: ["{schoolZone}", "35 mph", "40 mph", "There is no special limit"],
    correct: 0,
    explanation: "In {stateName} the school zone limit is {schoolZone} within {schoolZoneFeet} of the school, unless a lower limit is posted.",
  },
  {
    id: "trolley",
    category: "rightOfWay",
    q: "When you are near an approaching trolley or light rail vehicle, you should…",
    options: [
      "Turn in front of it if you have room",
      "Never turn directly in front of it",
      "Expect it to stop for you",
      "Follow it through the crossing",
    ],
    correct: 1,
    explanation: "Rail vehicles cannot stop or steer around you. Never turn in front of an approaching trolley or light rail train.",
  },
  {
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
    id: "walking-person",
    category: "roadSigns",
    q: "A sign or signal showing a walking person symbol indicates…",
    options: [
      "A pedestrian crossing is active",
      "A hiking trail",
      "A bus stop",
      "A school bus loading area",
    ],
    correct: 0,
    explanation: "The walking person symbol marks an active pedestrian crossing, so scan for people on foot and be ready to yield.",
  },
  {
    id: "first-rain",
    category: "speedLimits",
    q: "On a hot day, when is the road most slippery?",
    options: [
      "After several hours of steady rain",
      "During the first several minutes of rain, as oil mixes with water",
      "Only when it freezes",
      "Just after the rain stops",
    ],
    correct: 1,
    explanation: "Oil rises to the surface and mixes with the first water, so the first few minutes of rain are the most slippery. Slow well below {highway} conditions speed.",
  },
  {
    id: "left-turn-two-way",
    category: "rightOfWay",
    q: "On a two way street, you should begin a left turn from…",
    options: [
      "The right lane",
      "The lane closest to the center line",
      "The shoulder",
      "Any lane, if you signal",
    ],
    correct: 1,
    explanation: "Start a left turn from the lane nearest the center line and finish in the lane just right of the center line on the new street.",
  },
  {
    id: "signal-distance",
    category: "rightOfWay",
    q: "How far before a turn must you signal?",
    options: ["At least {signalFeet}", "At the turn itself", "50 feet", "Signals are optional"],
    correct: 0,
    explanation: "Signal at least {signalFeet} before the turn so drivers and pedestrians can react.",
  },
  {
    id: "cold-medicine",
    category: "alcoholAndDrugs",
    q: "Cold tablets and allergy medicine can…",
    options: [
      "Improve reaction time",
      "Cause severe drowsiness and impair driving",
      "Have no effect on driving",
      "Only affect you if mixed with coffee",
    ],
    correct: 1,
    explanation: "Many cold and allergy medicines cause drowsiness. Read the label and do not drive if it warns against operating machinery.",
  },
  {
    id: "blind-intersection-def",
    category: "speedLimits",
    q: "An intersection is considered blind when…",
    options: [
      "There is no traffic signal",
      "You cannot see {blindFeet} in either direction during the last {blindFeet} before crossing",
      "It has more than four corners",
      "It is on a hill of any grade",
    ],
    correct: 1,
    explanation: "If your view is under {blindFeet} in either direction within the final {blindFeet} of the crossing, it is a blind intersection and the limit is {blindSpeed}.",
  },
  {
    id: "double-parking",
    category: "parkingRules",
    q: "Double parking, that is stopping alongside a parked vehicle, is…",
    options: [
      "Legal for brief stops",
      "Illegal under all standard traffic circumstances",
      "Legal while your flashers are on",
      "Legal for deliveries only",
    ],
    correct: 1,
    explanation: "Double parking blocks a traffic lane and is illegal, even with hazard lights on.",
  },
  {
    id: "hydrant",
    category: "parkingRules",
    q: "You may not park within how many feet of a fire hydrant?",
    options: ["{hydrantFeet}", "5 feet", "30 feet", "50 feet"],
    correct: 0,
    explanation: "Keep at least {hydrantFeet} clear of a fire hydrant so crews can reach it.",
  },
  {
    id: "gridlock",
    category: "rightOfWay",
    q: "You may not enter an intersection if…",
    options: [
      "The light just turned green",
      "You cannot get all the way across before the light turns red",
      "A car is behind you",
      "There is a crosswalk",
    ],
    correct: 1,
    explanation: "Blocking an intersection is illegal. Wait until you can clear it completely, even if the light is green.",
  },
  {
    id: "night-pullover",
    category: "emergencyProcedures",
    q: "An officer signals you to pull over at night. You should…",
    options: [
      "Stop immediately in the traffic lane",
      "Signal, then pull over into a well lit location",
      "Keep driving home",
      "Turn off your lights and stop",
    ],
    correct: 1,
    explanation: "Acknowledge the officer, signal, and pull over promptly in a well lit area where it is safe to stop.",
  },
  {
    id: "school-zone-children",
    category: "speedLimits",
    q: "You are passing a school and children are in the crosswalk. What is the speed limit?",
    options: ["{schoolZone}", "30 mph", "35 mph", "The posted highway limit"],
    correct: 0,
    explanation: "The school zone limit in {stateName} is {schoolZone} unless a lower limit is posted, and you must yield to children crossing.",
  },
  {
    id: "no-u-turn",
    category: "roadSigns",
    q: "A No U Turn sign means…",
    options: [
      "U turns allowed on green",
      "U turns are prohibited at that location, even when the signals are operating",
      "U turns allowed after stopping",
      "U turns allowed only for buses",
    ],
    correct: 1,
    explanation: "A No U Turn sign prohibits the 180 degree turn there regardless of the signal state.",
  },
  {
    id: "windshield",
    category: "emergencyProcedures",
    q: "Keeping your windshield clean inside and outside is important because…",
    options: [
      "It looks better",
      "Dirt and film increase glare and reduce visibility, especially at night",
      "It improves fuel economy",
      "It is only needed in winter",
    ],
    correct: 1,
    explanation: "Interior film and exterior grime scatter light, which magnifies glare from headlights and low sun.",
  },
  {
    id: "unmarked-crosswalk",
    category: "rightOfWay",
    q: "Pedestrians crossing at a corner where no lines are painted…",
    options: [
      "Have no right of way",
      "Still have the right of way, because unmarked crosswalks exist at corners",
      "Must wait for all traffic to clear",
      "May only cross at a signal",
    ],
    correct: 1,
    explanation: "Crosswalks exist at intersections whether or not they are painted, and drivers must yield to pedestrians in them.",
  },
  {
    id: "blind-corner",
    category: "rightOfWay",
    q: "Your view is blocked at a corner. You should…",
    options: [
      "Accelerate through quickly",
      "Edge forward slowly until you can see clearly in both directions",
      "Sound your horn and go",
      "Back up and choose another route",
    ],
    correct: 1,
    explanation: "Creep forward slowly until your line of sight opens up, then proceed when it is clear.",
  },
  {
    id: "license-display",
    category: "emergencyProcedures",
    q: "You must show your driver license…",
    options: [
      "Only at the DMV",
      "To any peace officer who asks for it",
      "Only after a collision",
      "Only when driving out of state",
    ],
    correct: 1,
    explanation: "Carry your license whenever you drive and present it to a peace officer on request.",
  },
  {
    id: "tailgating",
    category: "speedLimits",
    q: "Following another vehicle too closely can…",
    options: [
      "Save fuel with no downside",
      "Frustrate the other driver, raise your rear end collision risk, and earn you a citation",
      "Help traffic move faster safely",
      "Only matter on the freeway",
    ],
    correct: 1,
    explanation: "Tailgating removes your reaction space. Use a three second following gap, and more in rain or at {highway} speeds.",
  },
  {
    id: "railroad-uncontrolled",
    category: "speedLimits",
    q: "Approaching a railroad crossing with no gates or signals and an obstructed view within {railroadViewFeet}, your speed limit within {railroadFeet} of the tracks is…",
    options: ["{railroadSpeed}", "25 mph", "35 mph", "The posted road limit"],
    correct: 0,
    explanation: "When your view of the tracks is blocked, the limit is {railroadSpeed} within {railroadFeet} of the crossing.",
  },
  {
    id: "parking-brake",
    category: "parkingRules",
    q: "When you park on a hill or incline you must…",
    options: [
      "Leave the transmission in neutral",
      "Set the parking brake and turn your wheels",
      "Leave the engine running",
      "Only set the brake if the grade is steep",
    ],
    correct: 1,
    explanation: "Always set the parking brake when parking on a grade, turn the wheels, and leave the vehicle in gear or in park.",
  },
  {
    id: "high-beams",
    category: "emergencyProcedures",
    q: "You must dim your high beams to low beams within…",
    options: [
      "{highBeamFeet} of an oncoming vehicle, and {followBeamFeet} when following one",
      "50 feet of any vehicle",
      "Only when the other driver flashes you",
      "City limits only",
    ],
    correct: 0,
    explanation: "Dim within {highBeamFeet} of an oncoming vehicle and within {followBeamFeet} when following, so you do not blind the other driver.",
  },
  {
    id: "parking-slope",
    category: "parkingRules",
    q: "When parking on a slope, you should turn your wheels so the vehicle would…",
    options: [
      "Roll into the traffic lane",
      "Roll away from traffic and into the curb if the brakes fail",
      "Stay perfectly straight",
      "Roll downhill freely",
    ],
    correct: 1,
    explanation: "Turn the wheels so a runaway vehicle rolls into the curb and away from traffic: downhill turn them toward the curb, uphill turn them away.",
  },
  {
    id: "flares",
    category: "emergencyProcedures",
    q: "If your vehicle breaks down on a highway, emergency flares or flags should be placed…",
    options: [
      "Directly under the bumper",
      "{flareFeet} behind the vehicle",
      "300 yards ahead",
      "Only on the roof",
    ],
    correct: 1,
    explanation: "Place flares or reflective triangles {flareFeet} behind the vehicle so approaching traffic gets early warning.",
  },
  {
    id: "open-container",
    category: "alcoholAndDrugs",
    q: "An open container of alcohol may legally be carried…",
    options: [
      "In the glove box",
      "In the trunk, or in an area not occupied by passengers if there is no trunk",
      "Anywhere, if no one is drinking",
      "In a cup holder with a lid",
    ],
    correct: 1,
    explanation: "Open containers must be in the trunk, or behind the last seat if the vehicle has no trunk. Never in the passenger area.",
  },
  {
    id: "t-intersection",
    category: "rightOfWay",
    q: "At a T intersection with no signs or signals, who has the right of way?",
    options: [
      "The vehicle on the road that ends",
      "Through traffic on the road that continues",
      "Whoever arrives first",
      "The vehicle turning left",
    ],
    correct: 1,
    explanation: "Traffic on the through road has the right of way. Vehicles on the terminating road must yield.",
  },
  {
    id: "mountain-road",
    category: "rightOfWay",
    q: "Two vehicles meet on a steep mountain road too narrow for both. Who has the right of way?",
    options: [
      "The vehicle going downhill",
      "The vehicle going uphill",
      "The larger vehicle",
      "The vehicle that honks first",
    ],
    correct: 1,
    explanation: "The vehicle heading uphill has the right of way, because backing downhill is easier and safer to control.",
  },
  {
    id: "one-way-left-turn",
    category: "rightOfWay",
    q: "Turning left from a one way street onto another one way street, you should…",
    options: [
      "Turn from the far right lane",
      "Turn from the far left lane into any legally open lane",
      "Turn from the center lane only",
      "Use the shoulder",
    ],
    correct: 1,
    explanation: "Begin from the far left lane of the one way street and finish in any lane that is legally open to you.",
  },
  {
    id: "child-unattended",
    category: "emergencyProcedures",
    q: "Leaving a child unattended in a vehicle is illegal when the child is…",
    options: [
      "{childMaxAge} years old or younger, unless supervised by someone at least {supervisorMinAge}",
      "Any age, with no exceptions",
      "Older than 10",
      "Only when the engine is running",
    ],
    correct: 0,
    explanation: "A child {childMaxAge} or younger may not be left in a vehicle without supervision by someone at least {supervisorMinAge} years old.",
  },
  {
    id: "turnouts",
    category: "speedLimits",
    q: "Turn out areas on a two lane highway are used to…",
    options: [
      "Park overnight",
      "Let faster vehicles behind you pass",
      "Make U turns",
      "Load passengers only",
    ],
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
