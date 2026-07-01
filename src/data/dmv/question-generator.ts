// Dynamic Question Bank Engine
// Builds a state-aware permit exam pool by interpolating the active StateRules
// into a master library of sign + rule templates, then programmatically
// generating phrasing variations so the per-state pool scales past 150.

import type { Question, StateRules } from "./types";

type Template = Omit<Question, "q" | "explanation"> & {
  q: string;
  explanation: string;
  /** Scenario contexts this template supports. Defaults to ["base"]. */
  scenarios?: string[];
};

/** Interpolate {placeholders} against the active state ruleset. */
function interp(text: string, r: StateRules): string {
  return text
    .replace(/\{state\}/g, r.name)
    .replace(/\{abbr\}/g, r.abbr)
    .replace(/\{bacAdult\}/g, r.bacAdult.toFixed(2))
    .replace(/\{bacU21\}/g, r.bacUnder21.toFixed(2))
    .replace(/\{bacCDL\}/g, r.bacCommercial.toFixed(2))
    .replace(/\{permitAge\}/g, String(r.permitMinAge))
    .replace(/\{provisionalAge\}/g, String(r.provisionalMinAge))
    .replace(/\{fullAge\}/g, String(r.fullLicenseMinAge))
    .replace(/\{supervisedHours\}/g, String(r.supervisedHoursRequired))
    .replace(/\{questionsCount\}/g, String(r.questionsCount))
    .replace(/\{minCorrect\}/g, String(r.minCorrectToPass))
    .replace(/\{passPct\}/g, String(r.passingScorePct))
    .replace(/\{phoneFine\}/g, String(r.firstOffensePhoneFineUSD))
    .replace(/\{handbook\}/g, r.handbookUrl);
}

// ---------------------------------------------------------------------------
// 50 ROAD-SIGN TEMPLATES
// ---------------------------------------------------------------------------
const SIGN_TEMPLATES: Template[] = [
  { q: "What does a red octagonal sign mean?", options: ["Yield", "Stop completely", "Slow down", "Do not enter"], correct: 1, explanation: "An octagonal red sign always means STOP — recognizable by shape alone." },
  { q: "An inverted (point-down) triangle sign means…", options: ["Stop", "Yield", "Merge", "Warning"], correct: 1, explanation: "Inverted triangle = yield. Slow and stop only if needed." },
  { q: "A yellow diamond sign is…", options: ["Regulatory", "Warning", "Guide", "Service"], correct: 1, explanation: "Yellow diamond signs warn of upcoming conditions." },
  { q: "An orange diamond sign indicates…", options: ["School zone", "Work zone / construction ahead", "Hospital", "Detour ended"], correct: 1, explanation: "Orange = temporary work zone signage." },
  { q: "A fluorescent yellow-green pentagon sign warns of…", options: ["Deer crossing", "School zone or school crossing", "Truck route", "Hospital"], correct: 1, explanation: "Yellow-green pentagon = school zone / school crossing." },
  { q: "A blue rectangular sign typically marks…", options: ["Warnings", "Motorist services (gas, food, lodging)", "Construction", "Speed limit"], correct: 1, explanation: "Blue rectangular signs guide drivers to services." },
  { q: "Brown signs indicate…", options: ["Construction", "Recreational / cultural areas", "Detours", "Warnings"], correct: 1, explanation: "Brown signs point to parks, historic sites, and recreation." },
  { q: "Green guide signs indicate…", options: ["Warnings", "Services", "Directions and mileage", "Construction"], correct: 2, explanation: "Green = directional and distance guidance." },
  { q: "A white rectangular sign with black text is…", options: ["A warning sign", "A regulatory sign (speed limit, lane use)", "A guide sign", "A service sign"], correct: 1, explanation: "White regulatory signs state the law — speed limits, turn rules, lane use." },
  { q: "A red circle with a slash through it means…", options: ["Recommended action", "The action shown is prohibited", "Caution", "Detour"], correct: 1, explanation: "Red circle + slash = the depicted action is prohibited." },
  { q: "A pennant-shaped sign on the left of the road means…", options: ["School zone", "No-passing zone begins", "End of highway", "Yield"], correct: 1, explanation: "The yellow pennant marks the start of a no-passing zone." },
  { q: "Solid white line between lanes means…", options: ["Pass freely", "Lane change discouraged", "HOV only", "Bike lane"], correct: 1, explanation: "Solid white = stay in lane; cross only when necessary." },
  { q: "A broken white line between lanes means…", options: ["No passing", "Lane changes permitted when safe", "Bike lane", "Construction lane"], correct: 1, explanation: "Broken white = lane changes allowed when clear." },
  { q: "Solid yellow line on your side means…", options: ["Pass allowed", "No passing", "Bike lane", "Construction"], correct: 1, explanation: "Solid yellow on your side = no passing." },
  { q: "A double solid yellow line means…", options: ["Pass freely", "Pass only with care", "No passing in either direction", "HOV only"], correct: 2, explanation: "Double solid yellow = no passing for either direction." },
  { q: "Broken yellow line in the center means…", options: ["No passing", "Passing permitted when clear", "One-way only", "Bike lane"], correct: 1, explanation: "Broken yellow = passing allowed when the oncoming lane is clear." },
  { q: "A flashing yellow signal means…", options: ["Stop completely", "Proceed with caution", "Pull over", "Malfunction — stop"], correct: 1, explanation: "Flashing yellow = slow and proceed with caution." },
  { q: "A flashing red signal means…", options: ["Stop, then proceed when safe", "Slow down", "Yield", "Continue at speed"], correct: 0, explanation: "Flashing red is treated as a stop sign." },
  { q: "A red flashing arrow means…", options: ["Go", "Stop, then proceed if clear", "Caution", "Malfunction"], correct: 1, explanation: "Red flashing arrow = stop, then proceed if safe for that turning movement." },
  { q: "A solid green arrow means…", options: ["Yield while turning", "Protected turn — yield to nothing in your path", "Stop", "Caution"], correct: 1, explanation: "Solid green arrow = protected turn; oncoming traffic is held." },
  { q: "A flashing yellow arrow for left turn means…", options: ["Protected turn", "Turn allowed but yield to oncoming traffic", "Stop", "No turn"], correct: 1, explanation: "Flashing yellow arrow = turn permitted, yield to oncoming." },
  { q: "A steady yellow arrow means…", options: ["Go faster", "Protected turn ending — prepare to stop or yield", "No turn", "Sound horn"], correct: 1, explanation: "Steady yellow arrow = the protected turn is ending." },
  { q: "A 'Right Lane Must Turn' sign means…", options: ["Lane is optional", "You must turn right from this lane", "Right turn prohibited", "Yield right"], correct: 1, explanation: "A mandatory-movement sign requires the indicated turn." },
  { q: "A 'No U-Turn' sign means…", options: ["U-turn allowed at green", "No U-turn from this location", "U-turn only with signal", "Turn left only"], correct: 1, explanation: "No U-turn signs prohibit the 180° turn at that location." },
  { q: "A 'Wrong Way' sign means…", options: ["You may continue with care", "You are facing oncoming traffic — stop and turn around", "Detour", "School zone"], correct: 1, explanation: "Wrong Way = you are entering a one-way road the wrong direction." },
  { q: "A 'Do Not Enter' sign on a ramp means…", options: ["Enter slowly", "Entry prohibited — likely an off-ramp", "Carpool only", "Service vehicles only"], correct: 1, explanation: "Do Not Enter typically marks the wrong side of a one-way or off-ramp." },
  { q: "A diamond-shaped lane marker means…", options: ["Bike lane", "HOV / carpool lane", "Bus stop", "Right turn only"], correct: 1, explanation: "Diamond = HOV / carpool lane." },
  { q: "A sign with a deer silhouette warns of…", options: ["Petting zoo", "Wildlife crossing", "Hunting allowed", "Farm exit"], correct: 1, explanation: "Wildlife crossing — scan the shoulders, especially dawn/dusk." },
  { q: "A sign showing a curving arrow with a posted speed means…", options: ["Maximum legal speed", "Advisory safe speed for the curve", "Minimum speed", "Truck speed only"], correct: 1, explanation: "Yellow advisory speed signs recommend a safe curve speed." },
  { q: "A black-on-white 'Speed Limit 55' sign is…", options: ["Advisory", "The legal maximum unless conditions require slower", "A minimum speed", "Suggested speed for trucks"], correct: 1, explanation: "Posted speed = legal max; basic speed law still requires slower in poor conditions." },
  { q: "A 'Minimum Speed 40' sign means…", options: ["Recommended cruising speed", "Going slower than 40 is illegal absent unsafe conditions", "Speed limit", "Truck speed"], correct: 1, explanation: "Minimum speed signs prohibit traveling below the posted floor without cause." },
  { q: "A pavement marking of a bicycle and chevrons (a 'sharrow') means…", options: ["Bike-only lane", "Bicyclists share the lane with cars", "No bikes", "Bus lane"], correct: 1, explanation: "Sharrows mark a shared travel lane." },
  { q: "Yellow flashing beacons above a school speed sign mean…", options: ["School is closed", "Reduced school zone speed limit is in effect", "Yield only", "Children only — adults may exceed"], correct: 1, explanation: "Flashing beacons activate the reduced school zone limit." },
  { q: "A 'Roundabout Ahead' sign tells you to…", options: ["Stop", "Slow and prepare to yield to traffic in the circle", "Speed up to merge", "Honk before entering"], correct: 1, explanation: "Slow on approach; you'll yield to traffic already circulating." },
  { q: "An 'X' with 'RR' marks…", options: ["A reststop", "A railroad crossing", "A right turn", "A repair zone"], correct: 1, explanation: "Crossbuck/RR sign marks a railroad crossing — look, listen, slow." },
  { q: "A 'No Turn on Red' sign means…", options: ["Right on red still allowed", "You must wait for green before turning", "Only left on red", "Honk and turn"], correct: 1, explanation: "No Turn on Red overrides the default right-on-red rule." },
  { q: "An octagonal red sign in any color/shape configuration always means…", options: ["Yield", "Stop", "Warning", "Construction"], correct: 1, explanation: "Shape alone signals STOP — recognizable even when snow-covered." },
  { q: "A sign showing a truck on a downgrade with a percentage means…", options: ["Truck route", "Steep grade ahead — trucks downshift", "Truck weigh station", "No trucks"], correct: 1, explanation: "Downgrade warning — gear down to manage speed without brake fade." },
  { q: "Rumble strips on the shoulder are designed to…", options: ["Decorate the road", "Alert drifting drivers via vibration and sound", "Slow traffic in town", "Mark exits"], correct: 1, explanation: "Rumble strips wake drowsy/distracted drivers leaving the lane." },
  { q: "A flagger at a work zone directing traffic has authority…", options: ["Less than signs", "Above posted signs and signals", "Equal to a pedestrian", "Only over trucks"], correct: 1, explanation: "Always obey the flagger — they override conflicting signs/signals." },
  { q: "A pedestrian signal showing a flashing 'Don't Walk' / upraised hand means…", options: ["Start crossing", "Do not start; finish if already crossing", "Run", "Wait for green"], correct: 1, explanation: "Flashing 'Don't Walk' = do not start crossing; complete if mid-street." },
  { q: "A bicycle-shaped traffic signal lens applies to…", options: ["All drivers", "Bicyclists only", "Pedestrians", "Buses"], correct: 1, explanation: "Bike-shaped lenses control bicycle traffic only." },
  { q: "A diagonal yellow arrow on the pavement near an exit means…", options: ["Wrong way", "Lane will exit — merge left to stay on highway", "U-turn", "HOV starts"], correct: 1, explanation: "Diagonal arrow = the lane peels off; move over to continue." },
  { q: "A square sign with a black truck and route number is…", options: ["A warning", "A designated truck route marker", "A weight limit", "No trucks"], correct: 1, explanation: "Truck route signs guide commercial vehicles along approved corridors." },
  { q: "A purple-stripe sign on tollways indicates…", options: ["HOV lane", "Electronic toll / transponder lane", "Bus lane", "Construction"], correct: 1, explanation: "Purple striping = electronic toll collection lanes (E-ZPass, FasTrak, etc.)." },
  { q: "A 'Reduced Speed Ahead' sign means…", options: ["You may speed now", "Slow before reaching the new posted limit", "Trucks only", "Construction ended"], correct: 1, explanation: "Begin slowing before the lower limit takes effect." },
  { q: "A 'Two-Way Traffic' sign warns…", options: ["The road becomes one-way", "Divided road ends — expect oncoming traffic in the next lane", "HOV starts", "No passing"], correct: 1, explanation: "Divided highway ends — oncoming traffic resumes beside you." },
  { q: "A 'Slippery When Wet' sign means…", options: ["Wash the road", "Reduce speed in rain/snow — traction drops", "Use chains always", "Trucks only"], correct: 1, explanation: "Surface loses traction when wet — slow down." },
  { q: "A 'Dead End' sign means…", options: ["Detour", "Road ends with no through route", "One-way ends", "Bridge out"], correct: 1, explanation: "Dead End = the road terminates; no through connection." },
  { q: "A 'No Outlet' sign means…", options: ["No exit ramp", "Network of roads with no through connection to other streets", "Road closed", "Cul-de-sac only"], correct: 1, explanation: "No Outlet = the area's streets don't connect through." },
];

// ---------------------------------------------------------------------------
// 50 UNIVERSAL DRIVING-RULE TEMPLATES (with state interpolation where useful)
// ---------------------------------------------------------------------------
const RULE_TEMPLATES: Template[] = [
  { q: "Two cars arrive at a 4-way stop in {state} together. Who goes first?", options: ["Driver on the left", "Driver on the right", "Larger vehicle", "Whoever honks"], correct: 1, explanation: "At a 4-way stop, the car on the right has right-of-way." },
  { q: "Turning left at a green ball (no arrow), you yield to…", options: ["Only pedestrians", "Only oncoming traffic", "Oncoming traffic AND pedestrians", "Nothing"], correct: 2, explanation: "Green ball = permissive turn; yield to oncoming traffic AND pedestrians." },
  { q: "An emergency vehicle with lights and siren approaches you on a two-lane road. You…", options: ["Speed up", "Pull to the right edge and stop", "Honk", "Continue at speed"], correct: 1, explanation: "Pull right and stop until the emergency vehicle passes." },
  { q: "Entering a roundabout in {state}, you must…", options: ["Stop fully", "Yield to traffic already circulating", "Honk", "Speed up to merge"], correct: 1, explanation: "Yield to vehicles already in the roundabout." },
  { q: "A school bus is stopped on an undivided road with red lights flashing. You must…", options: ["Pass slowly on the left", "Stop in both directions", "Stop only if behind the bus", "Honk and continue"], correct: 1, explanation: "On an undivided road, both directions must stop." },
  { q: "On a 4-lane divided highway, a school bus stops with reds flashing. Oncoming traffic must…", options: ["Stop", "Slow only", "Not required to stop", "Honk"], correct: 2, explanation: "On a divided highway with a physical median, oncoming traffic does NOT need to stop." },
  { q: "Right turn on red in {state} is permitted unless…", options: ["Always permitted", "A sign prohibits it or a red arrow is shown", "Only during daytime", "Only with a passenger"], correct: 1, explanation: "Right on red is legal after a full stop unless prohibited by signage or a red arrow." },
  { q: "The legal adult (21+) BAC limit in {state} is…", options: ["{bacU21}%", "{bacAdult}%", "0.10%", "0.15%"], correct: 1, explanation: "{state} sets the adult per-se limit at {bacAdult}%." },
  { q: "Under {state}'s zero-tolerance law, the BAC limit for drivers under 21 is…", options: ["0.00%", "{bacU21}%", "{bacAdult}%", "0.05%"], correct: 1, explanation: "{state}'s under-21 limit is {bacU21}%." },
  { q: "The federal commercial driver BAC limit (also enforced in {state}) is…", options: ["0.02%", "{bacCDL}%", "{bacAdult}%", "0.10%"], correct: 1, explanation: "CDL operators are held to {bacCDL}% nationwide." },
  { q: "An open container in the passenger area of a moving vehicle is…", options: ["Legal if no one is drinking", "Illegal in nearly every state, including {state}", "Legal if sealed", "Up to the driver"], correct: 1, explanation: "Open-container laws apply in {state} per the federal 23 USC 154 incentive." },
  { q: "The safe following distance rule is…", options: ["1 car length", "1 second per 10 mph", "The 3-second rule (more in poor weather)", "5 car lengths"], correct: 2, explanation: "Use the 3-second rule; extend to 4+ seconds in rain or snow." },
  { q: "The left lane on a multi-lane highway in {state} is for…", options: ["Slow traffic", "Passing or faster traffic", "Trucks", "Carpool only"], correct: 1, explanation: "Keep right except to pass — codified in most state vehicle codes." },
  { q: "Fines in {state} work zones are typically…", options: ["The same as normal", "Doubled or higher", "Waived", "Warnings only"], correct: 1, explanation: "Work-zone fines are doubled in most states, {state} included." },
  { q: "The basic speed law in {state} means…", options: ["Always drive the posted limit", "Drive no faster than is safe for current conditions", "Drive the minimum", "Drive 5 under the limit"], correct: 1, explanation: "Even at the posted limit, you must slow for weather, traffic, and visibility." },
  { q: "If you begin to skid on a wet road, you should…", options: ["Slam the brakes", "Steer where you want to go and ease off the gas", "Turn opposite the skid", "Pull the parking brake"], correct: 1, explanation: "Steer into the direction of travel and ease off the throttle." },
  { q: "Hydroplaning can start at speeds as low as…", options: ["10 mph", "25 mph", "35+ mph", "65+ mph"], correct: 2, explanation: "Hydroplaning can begin near 35 mph on wet pavement with worn tires." },
  { q: "Merging onto a freeway in {state}, you should…", options: ["Stop at the end of the ramp", "Match traffic speed and merge into a gap", "Honk and force in", "Wait for an empty lane"], correct: 1, explanation: "Use the ramp to match freeway speed, then merge smoothly." },
  { q: "A pedestrian in a marked crosswalk has…", options: ["No right of way", "The right of way", "Right of way only at signals", "Right of way only at night"], correct: 1, explanation: "Pedestrians in crosswalks have right of way in every state, {state} included." },
  { q: "When parking on a hill facing downhill with a curb, you turn the wheels…", options: ["Left, toward the curb", "Right, toward the curb", "Straight", "It doesn't matter"], correct: 1, explanation: "Downhill with a curb: turn wheels into the curb (right)." },
  { q: "When parking on a hill facing uphill with a curb, you turn the wheels…", options: ["Left, away from the curb", "Right, toward the curb", "Straight", "It doesn't matter"], correct: 0, explanation: "Uphill with a curb: turn wheels away from the curb (left)." },
  { q: "Driving in fog, you should use…", options: ["High beams", "Low beams or fog lights", "Hazards while moving", "No lights"], correct: 1, explanation: "Use low beams or fog lights — high beams glare back off the fog." },
  { q: "With ABS brakes, during an emergency stop you should…", options: ["Pump the brakes", "Press and hold firmly while steering", "Ease off and re-apply", "Use the parking brake"], correct: 1, explanation: "With ABS, press firmly and hold — the system pulses for you." },
  { q: "Headlights in {state} are required…", options: ["From sunset to sunrise and in low visibility", "Only after midnight", "Only in rain", "Only on highways"], correct: 0, explanation: "Typical state code: headlights from ½ hour after sunset to ½ hour before sunrise, and any time visibility is reduced." },
  { q: "When following a motorcycle, you should…", options: ["Tailgate to stay visible", "Allow extra following distance", "Pass aggressively", "Use high beams"], correct: 1, explanation: "Motorcycles can stop faster — allow extra following distance (4-second rule)." },
  { q: "Texting while driving in {state} is…", options: ["Legal if hands-free", "Illegal", "Legal at red lights", "Up to the driver"], correct: 1, explanation: "Texting bans apply in {state} (48 states + DC ban it outright; first-offense base fine ~${phoneFine})." },
  { q: "If your tire blows out, you should…", options: ["Slam the brakes", "Grip the wheel, ease off the gas, coast to the side", "Turn sharply", "Pull the parking brake"], correct: 1, explanation: "Grip the wheel, ease off the gas, coast to slow before braking gently." },
  { q: "{state}'s Move Over law requires you to…", options: ["Speed up past stopped emergency vehicles", "Change lanes away or slow significantly", "Honk", "Stop completely"], correct: 1, explanation: "Move Over laws now exist in all 50 states — change lanes or slow down." },
  { q: "Cannabis affects driving by…", options: ["Improving reflexes", "Slowing reaction time and impairing judgment", "Sharpening vision", "Having no effect"], correct: 1, explanation: "THC impairs reaction time and distance judgment — DUI applies in {state} regardless of legalization status." },
  { q: "Performing a three-point turn (K-turn), you should…", options: ["Check mirrors only", "Check both directions and mirrors before each move", "Just look forward", "Skip checks if the road is empty"], correct: 1, explanation: "Always check both directions and mirrors at every stage of the turn." },
  { q: "A pedestrian using a white cane or guide dog has…", options: ["No right of way", "Absolute right of way", "Right of way only at signals", "Right of way only at crosswalks"], correct: 1, explanation: "Every state code, including {state}, grants absolute right of way." },
  { q: "Passing a bicyclist in {state}, you must allow at least…", options: ["1 foot", "3 feet of clearance", "Honk while passing", "Pass closely in the same lane"], correct: 1, explanation: "3-foot passing laws are on the books in 33+ states; the remainder require a 'safe distance'." },
  { q: "When backing up safely, you should…", options: ["Use mirrors only", "Turn your head and look back", "Reverse quickly to clear", "Trust the backup camera alone"], correct: 1, explanation: "Turn your head and look — cameras and mirrors have blind spots." },
  { q: "A yellow traffic light means…", options: ["Speed up", "Stop if you can do so safely", "Continue at speed", "Yield to opposing traffic"], correct: 1, explanation: "Yellow = stop if you can do so safely; do NOT accelerate to beat it." },
  { q: "A first-offense DUI in {state} typically includes…", options: ["A warning", "Fines, license suspension, possible jail, and mandatory education", "Just license points", "Nothing"], correct: 1, explanation: "Even a first DUI in {state} involves fines, suspension, possible jail, and required alcohol education." },
  { q: "The liver metabolizes about one standard drink per…", options: ["15 minutes", "1 hour", "3 hours", "Depends on body size"], correct: 1, explanation: "~1 drink per hour. Coffee, food, and cold showers do NOT speed this up." },
  { q: "Highway hypnosis is best avoided by…", options: ["Driving longer stretches", "Taking frequent breaks and varying focus", "Maxing out cruise control", "Loud music alone"], correct: 1, explanation: "Take a break every 2 hours; keep eyes scanning, not fixed." },
  { q: "When signaling your exit from a roundabout, use…", options: ["No signal", "A right-turn signal just before your exit", "A left signal", "Hazards"], correct: 1, explanation: "Signal right just before your exit so others know you're leaving." },
  { q: "Worn tire tread is dangerous because…", options: ["It improves grip", "It loses traction, lengthens stops, and raises hydroplane risk", "It lowers fuel use", "It is fine in {state}"], correct: 1, explanation: "Worn tread loses traction and lengthens stops. Legal minimum: 2/32 inch." },
  { q: "Sharing the road with large trucks, the best practice is…", options: ["Cut in close after passing", "Avoid blind spots (No-Zones) on all four sides", "Tailgate to draft", "Pass on the right shoulder"], correct: 1, explanation: "Trucks have large No-Zones — don't linger beside them." },
  { q: "Driving on wet leaves is similar to driving on…", options: ["Dry pavement", "Ice — reduced traction", "Gravel only", "Sand"], correct: 1, explanation: "Wet leaves act like ice — reduce speed and avoid sudden moves." },
  { q: "Seat belts in {state} are required for…", options: ["The driver only", "All occupants (front seat at minimum)", "Adults only", "Optional use"], correct: 1, explanation: "{state} requires belts; 49 states require front-seat passenger belts (NH is the lone adult exception)." },
  { q: "Drowsy driving is most comparable to…", options: ["Texting", "Driving drunk", "Speeding", "Nothing"], correct: 1, explanation: "Being awake 18+ hours impairs you like a 0.05% BAC; 24 hours like 0.10%." },
  { q: "If your brakes fail, you should…", options: ["Slam the parking brake", "Pump pedal, downshift, then apply the parking brake gradually", "Turn off the engine", "Open the door and jump"], correct: 1, explanation: "Pump the pedal, downshift to slow with the engine, then apply the parking brake gradually." },
  { q: "Refusing a breathalyzer in {state} results in…", options: ["Only a warning", "A small fine, no license action", "License suspension under the implied-consent law", "Nothing — you can always refuse"], correct: 2, explanation: "{state}'s implied-consent statute imposes a license suspension on refusal." },
  { q: "The minimum age to apply for a learner's permit in {state} is…", options: ["14", "{permitAge}", "{provisionalAge}", "{fullAge}"], correct: 1, explanation: "{state} permits applications at {permitAge}." },
  { q: "The minimum age for a full unrestricted license in {state} is…", options: ["{permitAge}", "{provisionalAge}", "{fullAge}", "21"], correct: 2, explanation: "{state} grants full unrestricted licenses at {fullAge}." },
  { q: "{state} requires how many supervised driving hours before the road test?", options: ["10", "25", "{supervisedHours}", "100"], correct: 2, explanation: "{state} requires {supervisedHours} supervised hours before the road test." },
  { q: "The {state} written permit exam has…", options: ["10 questions, pass with 7", "{questionsCount} questions, pass with {minCorrect} correct ({passPct}%)", "100 questions, pass with 60", "Unlimited questions"], correct: 1, explanation: "{state} requires {minCorrect} of {questionsCount} correct ({passPct}%)." },
  { q: "A first-offense handheld phone violation in {state} carries a base fine around…", options: ["No fine", "$25", "${phoneFine} (plus surcharges and court costs)", "$1,000"], correct: 2, explanation: "Representative first-offense base fine in {state}: ${phoneFine}. Surcharges and court costs are additional — verify the current value with the official handbook." },
];

// ---------------------------------------------------------------------------
// PROGRAMMATIC VARIATIONS
// ---------------------------------------------------------------------------
const SCENARIO_PREFIXES = [
  "", // base
  "On a clear afternoon in {state}, ",
  "During your morning commute, ",
  "While driving home from school, ",
  "Mid-storm on a rainy {state} highway, ",
  "At dusk on a quiet residential street, ",
];

function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Shuffle a question's answer options and remap the `correct` index so the
 * right answer lands in an unpredictable position on every load.
 */
export function shuffleAnswers(q: Question): Question {
  const indices = q.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return {
    ...q,
    options: indices.map((i) => q.options[i]),
    correct: indices.indexOf(q.correct),
  };
}



/** Apply scenario prefixes to multiply the pool. */
function expandWithVariations(
  templates: Template[],
  rules: StateRules,
  perTemplate: number,
): Question[] {
  const out: Question[] = [];
  const used = new Set<string>();
  for (const t of templates) {
    for (let i = 0; i < perTemplate; i++) {
      const prefix = SCENARIO_PREFIXES[i % SCENARIO_PREFIXES.length];
      const qText = prefix
        ? interp(prefix, rules) + lower(interp(t.q, rules))
        : interp(t.q, rules);
      if (used.has(qText)) continue;
      used.add(qText);
      out.push(
        shuffleAnswers({
          q: qText,
          options: t.options.map((o) => interp(o, rules)),
          correct: t.correct,
          explanation: interp(t.explanation, rules),
          source: rules.abbr,
        }),
      );
    }
  }
  return out;
}

/**
 * Build the full, state-aware question bank.
 * Combines 50 sign templates + 50 rule templates × 2 phrasings ≈ 200 questions
 * per state, every entry interpolated with the active StateRules.
 */
export function buildQuestionBank(rules: StateRules): Question[] {
  return [
    ...expandWithVariations(SIGN_TEMPLATES, rules, 2),
    ...expandWithVariations(RULE_TEMPLATES, rules, 2),
  ];
}

export const TEMPLATE_COUNT = SIGN_TEMPLATES.length + RULE_TEMPLATES.length;
