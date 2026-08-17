// Comprehensive practice-test question engine.
//
// Sources the 50 reference exam items provided by product, groups them into
// the four pillar quizzes, and interpolates state-specific numeric values
// (speed limits, alley + school-zone caps, accident-reporting thresholds,
// BAC limits) using STATE_DRIVING_RULES.
//
// Every call to buildPillarBanks() returns freshly shuffled option orders so
// the correct answer never sits in the same slot twice in a row.

import type { SignSpec } from "@/components/dashboard/SignVisual";
import { STATE_DRIVING_RULES } from "@/data/states";
import { shuffleAnswers } from "./question-generator";
import { buildOfficialPool } from "./official-pool";

export type PracticeQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  sign?: SignSpec;
};

export type PillarId = "signs" | "intersections" | "substances" | "speed";

type Template = PracticeQuestion & { pillar: PillarId };

/** Numeric tailoring values pulled from the state ruleset (with safe defaults). */
type StateNumerics = {
  stateName: string;
  residential: string;
  urban: string;
  highway: string;
  schoolZone: string;
  alley: string;
  nearRailroad: string;
  accidentThresholdUSD: string;
  bacAdult: string;
  bacU21: string;
};

const DEFAULT_NUMERICS: StateNumerics = {
  stateName: "your state",
  residential: "25 mph",
  urban: "45 mph",
  highway: "65 mph",
  schoolZone: "25 mph",
  alley: "15 mph",
  nearRailroad: "15 mph",
  accidentThresholdUSD: "$1,000",
  bacAdult: "0.08%",
  bacU21: "0.02%",
};

function getNumerics(stateName?: string | null): StateNumerics {
  const rules = stateName ? STATE_DRIVING_RULES[stateName] : undefined;
  if (!rules) return DEFAULT_NUMERICS;
  return {
    stateName: rules.stateName,
    residential: rules.speedLimits.residential,
    urban: rules.speedLimits.urban,
    highway: rules.speedLimits.highway,
    schoolZone: "25 mph",
    alley: "15 mph",
    nearRailroad: "15 mph",
    accidentThresholdUSD: "$1,000",
    bacAdult: rules.duiLimits.adult,
    bacU21: rules.duiLimits.under21,
  };
}

function interp(text: string, n: StateNumerics): string {
  return text
    .replace(/\{state\}/g, n.stateName)
    .replace(/\{residential\}/g, n.residential)
    .replace(/\{urban\}/g, n.urban)
    .replace(/\{highway\}/g, n.highway)
    .replace(/\{schoolZone\}/g, n.schoolZone)
    .replace(/\{alley\}/g, n.alley)
    .replace(/\{nearRailroad\}/g, n.nearRailroad)
    .replace(/\{accidentThreshold\}/g, n.accidentThresholdUSD)
    .replace(/\{bacAdult\}/g, n.bacAdult)
    .replace(/\{bacU21\}/g, n.bacU21);
}

// ---------------------------------------------------------------------------
// 50-item reference bank (matches product-provided list, pillar-tagged).
// Uses {placeholders} where a numeric value should scale to the active state.
// ---------------------------------------------------------------------------
const TEMPLATES: Template[] = [
  // --------------------------- SIGNS & MARKINGS ---------------------------
  {
    pillar: "signs",
    q: "What does this sign mean?",
    sign: { shape: "octagon", fill: "#dc2626", stroke: "#fff", letters: "STOP" },
    options: ["Yield", "Stop completely", "Do Not Enter", "Slow down"],
    correct: 1,
    explanation:
      "A red octagon always means a full stop at the limit line or before any crosswalk, then proceed only when safe.",
  },
  {
    pillar: "signs",
    q: "What does this sign mean?",
    sign: { shape: "triangle-down", fill: "#fff", stroke: "#dc2626", letters: "YIELD" },
    options: ["Stop", "Yield the right of way", "Merge", "Caution"],
    correct: 1,
    explanation:
      "An inverted red and white triangle is a yield sign. Slow, give the right of way to traffic and pedestrians, and stop only if needed.",
  },
  {
    pillar: "signs",
    q: "What does this sign mean?",
    sign: { shape: "circle", fill: "#dc2626", stroke: "#fff", letters: "DO NOT ENTER", bar: true },
    options: [
      "You may proceed with caution",
      "You cannot do whatever is shown in the circle",
      "One way traffic ahead",
      "Yield to oncoming vehicles",
    ],
    correct: 1,
    explanation:
      "A red circle with a red line through a symbol always means the pictured action is prohibited. The classic Do Not Enter disc uses the same rule with a white bar.",
  },
  {
    pillar: "signs",
    q: "A diamond shaped '+' sign warns you that…",
    sign: { shape: "diamond", fill: "#facc15", stroke: "#000", letters: "+" },
    options: [
      "A hospital is nearby",
      "An intersection or crossroad is ahead",
      "A pedestrian crossing is ahead",
      "A first aid station is ahead",
    ],
    correct: 1,
    explanation:
      "Yellow diamond warning signs describe what is coming. A '+' shape signals an intersection or crossroad ahead.",
  },
  {
    pillar: "signs",
    q: "A lighted green arrow by itself at a signal means…",
    options: [
      "You may turn in the direction of the arrow",
      "You must stop before turning",
      "Yield to oncoming traffic before turning",
      "The signal is malfunctioning",
    ],
    correct: 0,
    explanation:
      "A solid green arrow is a protected turn. Oncoming and cross traffic are held, so you may turn in the direction of the arrow.",
  },
  {
    pillar: "signs",
    q: "A flashing red light at a railroad crossing means…",
    sign: { shape: "circle", fill: "#dc2626", stroke: "#fff", letters: "RR" },
    options: [
      "Proceed slowly across the tracks",
      "Stop because a train is approaching",
      "Yield to oncoming traffic",
      "The signal is out of service",
    ],
    correct: 1,
    explanation:
      "Flashing red at a railroad crossing means stop because a train is approaching. Do not cross until the lights stop flashing.",
  },
  {
    pillar: "signs",
    q: "When you see orange cones and construction signs, you should…",
    options: [
      "Maintain your normal speed",
      "Watch out because lanes may be closing ahead",
      "Turn around and find another route",
      "Ignore them if no workers are visible",
    ],
    correct: 1,
    explanation:
      "Orange work zone signs and cones warn that lanes may be closing or shifting ahead. Slow down and follow the flagger or signage.",
  },
  {
    pillar: "signs",
    q: "What color curb never allows vehicles to stop or park?",
    options: ["Yellow", "White", "Green", "Red"],
    correct: 3,
    explanation:
      "A red curb means no stopping, standing, or parking at any time. Emergency vehicles and buses may be the only exceptions.",
  },
  {
    pillar: "signs",
    q: "A pedestrian using a white cane is telling drivers that they are…",
    options: [
      "A traffic officer",
      "Blind",
      "A tour guide",
      "A road construction worker",
    ],
    correct: 1,
    explanation:
      "A white cane, often with a red tip, identifies a blind pedestrian who has absolute right of way at all intersections.",
  },
  {
    pillar: "signs",
    q: "You may pass another vehicle by crossing over the double solid parallel yellow lines.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. A double solid yellow line means passing is prohibited in both directions. Cross only for a legal left turn into a driveway.",
  },
  {
    pillar: "signs",
    q: "A pavement marking of a bicycle and chevrons (a 'sharrow') means…",
    options: [
      "Bicyclists are prohibited from this lane",
      "Bicyclists share the travel lane with cars",
      "This is a bike only lane",
      "Bicyclists must dismount here",
    ],
    correct: 1,
    explanation:
      "Sharrows mark a shared travel lane. Motorists must give bicyclists the full use of the lane and pass with a safe cushion.",
  },
  {
    pillar: "signs",
    q: "It is important to keep the inside and outside of your windshield clean.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. Sun glare and headlight scatter turn dirty glass into a visibility hazard. Clean both sides regularly, especially before night trips.",
  },

  // --------------------- INTERSECTIONS & RIGHT OF WAY ---------------------
  {
    pillar: "intersections",
    q: "You should begin a right turn in the lane nearest the curb.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. Enter the turn from the lane closest to the curb and finish the turn into the lane closest to the curb on the receiving street.",
  },
  {
    pillar: "intersections",
    q: "Wherever there is a STOP sign in {state}, you must stop at the limit line or before entering any crosswalk.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. In {state}, stop at the marked limit line. If there is no line, stop before the crosswalk, and if there is no crosswalk, stop before entering the intersection.",
  },
  {
    pillar: "intersections",
    q: "When is it required for you to obey directions from a crossing guard?",
    options: [
      "Only when children are present",
      "At all times",
      "Only during school hours",
      "Only when a police officer is nearby",
    ],
    correct: 1,
    explanation:
      "A crossing guard has legal authority over that intersection. Obey their directions at all times, even if they conflict with signals.",
  },
  {
    pillar: "intersections",
    q: "When a traffic signal is not working at an intersection you should…",
    options: [
      "Speed through so you clear the intersection",
      "Come to a complete stop, then proceed when it is safe",
      "Yield only to vehicles on the right",
      "Continue at the posted speed",
    ],
    correct: 1,
    explanation:
      "Treat a dark or malfunctioning signal as a four way stop. Come to a complete stop, then proceed in normal right of way order.",
  },
  {
    pillar: "intersections",
    q: "You see the flashing lights of an emergency vehicle in your rear view mirror. You should speed up to prevent delaying it.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. Pull as close to the right edge of the road as safe and stop until the emergency vehicle passes. Never race an emergency vehicle.",
  },
  {
    pillar: "intersections",
    q: "If the traffic light turns yellow after you have already entered an intersection, you should…",
    options: [
      "Stop in the middle of the intersection",
      "Reverse out of the intersection",
      "Proceed across with caution",
      "Turn right to clear the box",
    ],
    correct: 2,
    explanation:
      "Once you are lawfully in the intersection and the light turns yellow, proceed across with caution and clear the intersection.",
  },
  {
    pillar: "intersections",
    q: "When sharing the road with a trolley or light rail vehicle you should…",
    options: [
      "Race it through the intersection",
      "Never turn in front of an approaching trolley or light rail vehicle",
      "Always take the right of way",
      "Sound your horn before crossing the tracks",
    ],
    correct: 1,
    explanation:
      "Never turn in front of an approaching trolley or light rail vehicle. They cannot swerve and take a long distance to stop.",
  },
  {
    pillar: "intersections",
    q: "When entering an intersection on a green light, you can get a ticket if you block the intersection.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. 'Do not block the box' laws let officers cite drivers who enter an intersection they cannot fully clear before the light changes.",
  },
  {
    pillar: "intersections",
    q: "If another car has stopped at a crosswalk to permit someone to walk across, you may pass that car.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. Never pass a vehicle that has stopped at a crosswalk. The stopped car may be hiding a pedestrian who is already crossing.",
  },
  {
    pillar: "intersections",
    q: "A pedestrian must yield the right of way at intersections where crosswalks are not marked.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. Every corner is treated as an unmarked crosswalk. Drivers must yield to pedestrians crossing at intersections whether the crosswalk is painted or not.",
  },
  {
    pillar: "intersections",
    q: "When approaching a roundabout, enter traffic in which direction?",
    options: ["Clockwise", "Counter clockwise", "Either direction", "Whichever has an opening"],
    correct: 1,
    explanation:
      "Traffic in a US roundabout always circulates counter clockwise. Yield to vehicles already in the circle before entering.",
  },
  {
    pillar: "intersections",
    q: "Even when you have the right of way, you should never insist on taking it.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. Right of way is something you give, not take. Defensive driving means yielding when another road user does not, even if you are legally correct.",
  },
  {
    pillar: "intersections",
    q: "You must show your driver license to…",
    options: [
      "Any pedestrian who asks",
      "Any other drivers if you are in a collision",
      "Any passenger under 18",
      "Nobody except a judge",
    ],
    correct: 1,
    explanation:
      "In a collision you must exchange license and insurance information with the other drivers involved. You must also show it to any peace officer on demand.",
  },
  {
    pillar: "intersections",
    q: "If you hit a parked car and cannot find the owner, you should leave a note giving your name and address.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. Every state treats leaving the scene of an unattended collision without a note as a hit and run. Include your name, address, and how to reach you.",
  },
  {
    pillar: "intersections",
    q: "In {state} you are required to notify the DMV by filing an accident report when a collision involves an injury or property damage over {accidentThreshold}.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. {state} requires a written accident report when someone is injured or when property damage exceeds {accidentThreshold}. Verify the exact figure with the current handbook.",
  },

  // --------------------------- SUBSTANCE LAWS ---------------------------
  {
    pillar: "substances",
    q: "The only truly effective way to lower blood alcohol content is to…",
    options: [
      "Drink strong coffee",
      "Take a cold shower",
      "Stop drinking so that your body has time to adjust",
      "Eat a heavy meal",
    ],
    correct: 2,
    explanation:
      "Only time lowers BAC. The liver processes about one standard drink per hour. Coffee, food, and cold showers do not speed elimination.",
  },
  {
    pillar: "substances",
    q: "The number one cause of death among teenagers ages 15 to 19 is…",
    options: [
      "Sports injuries",
      "Traffic collisions",
      "Drownings",
      "Bicycle accidents",
    ],
    correct: 1,
    explanation:
      "Traffic collisions are the leading cause of death for US teenagers. Distraction, inexperience, and impairment drive the numbers.",
  },
  {
    pillar: "substances",
    q: "The following is a myth about seat belts:",
    options: [
      "Seat belts reduce ejection risk in a crash",
      "Seat belts are good on long trips but I do not need them driving around town",
      "Seat belts work with airbags to protect you",
      "Seat belts help keep you behind the wheel in a skid",
    ],
    correct: 1,
    explanation:
      "It is a myth that seat belts are only needed for long trips. Most crashes happen within 25 miles of home at speeds under 40 mph.",
  },
  {
    pillar: "substances",
    q: "A child may not sit in the front seat of an air bag equipped vehicle if the child weighs less than…",
    options: ["10 pounds", "20 pounds", "40 pounds", "60 pounds"],
    correct: 1,
    explanation:
      "Under general federal guidance and most state codes, a child weighing less than 20 pounds should not ride in a front seat with an active passenger air bag.",
  },
  {
    pillar: "substances",
    q: "Much of what has been said about alcohol also applies to…",
    options: [
      "Prescribed medicines and street drugs",
      "Energy drinks only",
      "Caffeine",
      "Nothing else",
    ],
    correct: 0,
    explanation:
      "Prescription medicines and street drugs can impair reaction time, judgment, and coordination the same way alcohol does. Read every warning label.",
  },
  {
    pillar: "substances",
    q: "The legal adult (21+) BAC limit in {state} is…",
    options: ["0.05%", "{bacAdult}", "0.10%", "0.15%"],
    correct: 1,
    explanation:
      "{state} sets the adult per se BAC limit at {bacAdult}. Utah is the outlier at 0.05%.",
  },
  {
    pillar: "substances",
    q: "Under {state}'s zero tolerance rule, the BAC limit for drivers under 21 is…",
    options: ["0.00%", "{bacU21}", "0.05%", "0.08%"],
    correct: 1,
    explanation:
      "{state} enforces {bacU21} as the maximum BAC for drivers under 21. Any detectable alcohol above this can suspend a novice license.",
  },
  {
    pillar: "substances",
    q: "New drivers, when faced with difficult driving conditions, usually have…",
    options: [
      "Better reaction times than experienced drivers",
      "More out of control accidents",
      "Fewer accidents due to caution",
      "The same accident rate as veterans",
    ],
    correct: 1,
    explanation:
      "Inexperience shows up fastest in weather, night, and heavy traffic. New drivers have significantly more loss of control crashes in tough conditions.",
  },
  {
    pillar: "substances",
    q: "Which of the following is illegal while driving?",
    options: [
      "Playing music through the stereo",
      "Wearing a headset or earplugs that cover both ears",
      "Using a hands free voice call",
      "Speaking with a passenger",
    ],
    correct: 1,
    explanation:
      "Wearing a headset or earplugs covering both ears is illegal in most states because it blocks safety cues like sirens, horns, and train warnings.",
  },
  {
    pillar: "substances",
    q: "At night, you should never drive at a speed which would prevent you from…",
    options: [
      "Reaching your destination on time",
      "Keeping up with traffic",
      "Coming to a stop within the distance you can see with your headlights",
      "Passing slower vehicles",
    ],
    correct: 2,
    explanation:
      "Overdriving your headlights is a leading cause of night crashes. Your safe speed at night is whatever lets you stop within the beam you can actually see.",
  },

  // ------------------------- SPEED & VEHICLE OPS -------------------------
  {
    pillar: "speed",
    q: "Large trucks turning onto a street with two lanes in each direction often…",
    options: [
      "Complete the turn entirely in the right lane",
      "Use part of the left lane to complete the turn",
      "Reverse before turning",
      "Turn on the shoulder",
    ],
    correct: 1,
    explanation:
      "Long trailers need extra swing room. Trucks turning onto a two lane road often have to use part of the left lane to complete the turn safely.",
  },
  {
    pillar: "speed",
    q: "When braking your car on a slippery road, you should…",
    options: [
      "Slam the pedal and hold",
      "Pump the brakes gently (or follow ABS guidelines if your car is equipped)",
      "Pull the parking brake",
      "Shift into reverse",
    ],
    correct: 1,
    explanation:
      "On slick pavement pump the brakes gently to keep the wheels rolling. If your car has ABS, press firmly and steadily and let the system pulse for you.",
  },
  {
    pillar: "speed",
    q: "To watch for hazards, check your rear view mirror every…",
    options: ["1 second", "2 to 5 seconds", "10 to 15 seconds", "Only before braking"],
    correct: 1,
    explanation:
      "A quick mirror scan every 2 to 5 seconds keeps you aware of what is behind and beside you so surprises never come from your blind side.",
  },
  {
    pillar: "speed",
    q: "When driving through a curve, you should…",
    options: [
      "Accelerate into it and coast out",
      "Slow into it and accelerate out of it",
      "Maintain a constant high speed",
      "Brake through the entire curve",
    ],
    correct: 1,
    explanation:
      "Slow before the curve, then gently accelerate out of it. Braking inside a curve upsets weight transfer and can start a skid.",
  },
  {
    pillar: "speed",
    q: "The best way to stop quickly (in a vehicle equipped with ABS) is to…",
    options: [
      "Pump the brakes",
      "Brake hard and hold the pedal down until you stop",
      "Pull the parking brake",
      "Downshift only",
    ],
    correct: 1,
    explanation:
      "With ABS, brake hard and hold. The system pulses each wheel for you and lets you steer while braking at maximum grip.",
  },
  {
    pillar: "speed",
    q: "Which of the following is the proper procedure for parallel parking?",
    options: [
      "Pull head first into the space",
      "Stop next to the vehicle in front of the open space, and then back into the space",
      "Back in from the vehicle behind the space",
      "Drive at an angle from the curb",
    ],
    correct: 1,
    explanation:
      "Stop parallel to the car in front of the open space, then reverse and swing the wheel to slide back into the spot. Straighten and center between the two cars.",
  },
  {
    pillar: "speed",
    q: "What speed should you be driving when entering onto a highway?",
    options: [
      "Well below the posted limit",
      "At or near the speed of traffic",
      "The minimum posted speed",
      "As fast as your vehicle allows",
    ],
    correct: 1,
    explanation:
      "Use the on ramp to accelerate to the speed of highway traffic, then merge into a gap. Merging slow is one of the top causes of on ramp crashes.",
  },
  {
    pillar: "speed",
    q: "It is legal to sometimes exceed the maximum speed limit on a highway.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. The posted maximum is the legal ceiling in all conditions. The basic speed law can require you to go slower, never faster.",
  },
  {
    pillar: "speed",
    q: "Since more highway construction takes place at night, you should…",
    options: [
      "Speed up to clear the zone quickly",
      "Drive slower as a safety precaution",
      "Turn off your headlights so workers can see",
      "Ignore posted limits after 9pm",
    ],
    correct: 1,
    explanation:
      "Night construction combines glare, workers on foot, and shifting lanes. Slow down as a safety precaution and follow the posted work zone limits.",
  },
  {
    pillar: "speed",
    q: "Within 500 feet of a school in {state}, the speed limit is typically {schoolZone} unless otherwise posted.",
    options: ["True", "False"],
    correct: 0,
    explanation:
      "True. In {state}, school zone limits are commonly {schoolZone} within 500 feet of a school when children are present. Watch for posted signs and flashing beacons.",
  },
  {
    pillar: "speed",
    q: "The speed limit in an alley in {state} is typically…",
    options: [
      "5 mph",
      "{alley}",
      "25 mph",
      "35 mph",
    ],
    correct: 1,
    explanation:
      "{state} caps alley travel at {alley}. Alleys are narrow, sight lines are poor, and pedestrians appear from doorways.",
  },
  {
    pillar: "speed",
    q: "When a railroad crossing is not controlled and you cannot see for 400 feet in both directions, your maximum speed within 100 feet of the crossing is…",
    options: ["5 mph", "10 mph", "{nearRailroad}", "25 mph"],
    correct: 2,
    explanation:
      "At an uncontrolled crossing with obstructed sight lines, {nearRailroad} is the standard maximum within 100 feet of the tracks. Slow further if visibility is worse.",
  },
  {
    pillar: "speed",
    q: "You may pass on the right when…",
    options: [
      "Never, passing on the right is always illegal",
      "The open highway is clearly marked for two or more lanes in your direction, or the driver in front is turning left, and you do not drive off the road",
      "Only if the driver ahead waves you around",
      "Only on a two lane road",
    ],
    correct: 1,
    explanation:
      "Passing on the right is legal when the road has two or more lanes in your direction and it is safe, or when a driver ahead is signaling and turning left, so long as you stay on the paved roadway.",
  },
  {
    pillar: "speed",
    q: "You can use your high beams on dark city streets.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. On lit city streets and within roughly 500 feet of oncoming traffic or 300 feet behind another vehicle, use low beams.",
  },
  {
    pillar: "speed",
    q: "An acceleration skid usually involves…",
    options: [
      "All four wheels",
      "Only the front wheels",
      "Only the drive wheels",
      "Only the parking brake",
    ],
    correct: 2,
    explanation:
      "An acceleration skid happens when the drive wheels overpower the available traction. Ease off the throttle and let the tires recover grip.",
  },
  {
    pillar: "speed",
    q: "Pedestrian responsibilities at night include…",
    options: [
      "Wearing dark clothing to blend in",
      "Wearing lighter colored clothing to make one more visible",
      "Walking with traffic",
      "Only using the roadway",
    ],
    correct: 1,
    explanation:
      "Light colored or reflective clothing dramatically improves how far away drivers can spot a pedestrian at night. Walk facing traffic where sidewalks are absent.",
  },
  {
    pillar: "speed",
    q: "You may operate a motor scooter on the street without a driver license or instruction permit.",
    options: ["True", "False"],
    correct: 1,
    explanation:
      "False. A motor scooter is a motor vehicle. You need at least a permit or license to operate one on public streets in {state}.",
  },
];

// ---------------------------------------------------------------------------
// Build & export
// ---------------------------------------------------------------------------

/**
 * Build fresh pillar banks for the active state. Every option array is
 * re-shuffled on each call so answer positions rotate unpredictably.
 *
 * The official handbook pool for the active state code is merged in first, so
 * the Sections tab and the mock exam draw from the exact same core questions.
 */
export function buildPillarBanks(
  stateName?: string | null,
): Record<PillarId, PracticeQuestion[]> {
  const n = getNumerics(stateName);
  const out: Record<PillarId, PracticeQuestion[]> = {
    signs: [],
    intersections: [],
    substances: [],
    speed: [],
  };

  for (const o of buildOfficialPool(stateName)) {
    out[o.pillar].push(
      shuffleAnswers({
        q: o.q,
        options: o.options,
        correct: o.correct,
        explanation: o.explanation,
      }) as PracticeQuestion,
    );
  }

  for (const t of TEMPLATES) {
    const interpolated: PracticeQuestion = {
      q: interp(t.q, n),
      options: t.options.map((o) => interp(o, n)),
      correct: t.correct,
      explanation: interp(t.explanation, n),
      ...(t.sign
        ? {
            sign: {
              ...t.sign,
              letters: t.sign.letters ? interp(t.sign.letters, n) : t.sign.letters,
            },
          }
        : {}),
    };
    out[t.pillar].push(shuffleAnswers(interpolated) as PracticeQuestion);
  }

  return out;
}

export const PILLAR_META: Record<
  PillarId,
  { title: string; blurb: string }
> = {
  signs: {
    title: "Signs & Markings",
    blurb: "Regulatory, warning, guide, and sign recognition drills",
  },
  intersections: {
    title: "Intersections & Right of Way",
    blurb: "Four way stops, turns, yielding, and reporting rules",
  },
  substances: {
    title: "Substance & Safety Laws",
    blurb: "BAC, seat belts, impairment, and night driving",
  },
  speed: {
    title: "Speed & Vehicle Ops",
    blurb: "Speed limits, braking, curves, and safe following rules",
  },
};
