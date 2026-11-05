// Dynamic Question Bank Engine
// Builds a state-aware permit exam pool by interpolating the active StateRules
// into a master library of sign + rule templates, then programmatically
// generating phrasing variations so the per-state pool scales past 150.

import type { Question, StateRules } from "./types";
import { distinctOptions, orderBooleanAnswers } from "./question-quality";

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
    .replace(/\{permitAge\}/g, r.permitMinAge % 1 === 0.5 ? `${Math.floor(r.permitMinAge)}½` : String(r.permitMinAge))
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
  {
    conceptId: "SIGN_TEMPLATES-001", q: "What does a red octagonal sign mean?", options: ["Yield to crossing traffic","Stop","Do not enter this road","Proceed with caution"], correct: 1, explanation: "An octagonal red sign always means STOP — recognizable by shape alone." },
  {
    conceptId: "SIGN_TEMPLATES-002", q: "An inverted (point-down) triangle sign means…", options: ["Stop", "Yield", "Merge", "Warning"], correct: 1, explanation: "Inverted triangle = yield. Slow and stop only if needed." },
  {
    conceptId: "SIGN_TEMPLATES-003", q: "A yellow diamond sign is…", options: ["Regulatory", "Warning", "Guide", "Service"], correct: 1, explanation: "Yellow diamond signs warn of upcoming conditions." },
  {
    conceptId: "SIGN_TEMPLATES-004", q: "An orange diamond sign indicates…", options: ["School crossing ahead","Work zone ahead","Hospital entrance ahead","Detour route has ended"], correct: 1, explanation: "Orange = temporary work zone signage." },
  {
    conceptId: "SIGN_TEMPLATES-005", q: "A fluorescent yellow-green pentagon sign warns of…", options: ["Wildlife crossing ahead","School crossing","Designated truck route","Hospital entrance ahead"], correct: 1, explanation: "Yellow-green pentagon = school zone / school crossing." },
  {
    conceptId: "SIGN_TEMPLATES-006", q: "A blue rectangular sign typically marks…", options: ["Hazard warnings","Motorist services","Temporary construction","Mandatory speed limits"], correct: 1, explanation: "Blue rectangular signs guide drivers to services." },
  {
    conceptId: "SIGN_TEMPLATES-007", q: "Brown signs indicate…", options: ["Temporary construction","Recreation areas","Alternative detour routes","General hazard warnings"], correct: 1, explanation: "Brown signs point to parks, historic sites, and recreation." },
  {
    conceptId: "SIGN_TEMPLATES-008", q: "Green guide signs indicate…", options: ["General hazard warnings","Available motorist services","Directions","Temporary construction zones"], correct: 2, explanation: "Green = directional and distance guidance." },
  {
    conceptId: "SIGN_TEMPLATES-009", q: "A white rectangular sign with black text is…", options: ["A general warning sign","A regulatory sign","A destination guide sign","A motorist service sign"], correct: 1, explanation: "White regulatory signs state the law — speed limits, turn rules, lane use." },
  {
    conceptId: "SIGN_TEMPLATES-010", q: "A red circle with a slash through it means…", options: ["The action is recommended","The action is prohibited","Yield before taking the action","The restriction applies to trucks"], correct: 1, explanation: "Red circle + slash = the depicted action is prohibited." },
  {
    conceptId: "SIGN_TEMPLATES-011", q: "A pennant-shaped sign on the left of the road means…", options: ["School crossing ahead","No passing","Highway ends ahead","Yield to entering traffic"], correct: 1, explanation: "The yellow pennant marks the start of a no-passing zone." },
  {
    conceptId: "SIGN_TEMPLATES-012", q: "Solid white line between lanes means…", options: ["Lane changes are freely permitted","Lane changes are discouraged","The lane is reserved for carpools","The lane is reserved for bicycles"], correct: 1, explanation: "Solid white = stay in lane; cross only when necessary." },
  {
    conceptId: "SIGN_TEMPLATES-013", q: "A broken white line between lanes means…", options: ["Lane changes are prohibited","Change lanes when safe","The lane is reserved for bicycles","The lane is closed for construction"], correct: 1, explanation: "Broken white = lane changes allowed when clear." },
  {
    conceptId: "SIGN_TEMPLATES-014", q: "Solid yellow line on your side means…", options: ["Pass allowed", "No passing", "Bike lane", "Construction"], correct: 1, explanation: "Solid yellow on your side = no passing." },
  {
    conceptId: "SIGN_TEMPLATES-015", q: "A double solid yellow line means…", options: ["Passing is allowed when clear","Passing is allowed after signaling","No passing either way","Only trucks may cross to pass"], correct: 2, explanation: "Double solid yellow = no passing for either direction." },
  {
    conceptId: "SIGN_TEMPLATES-016", q: "Broken yellow line in the center means…", options: ["Passing is always prohibited","Pass when clear","Traffic moves in one direction","The adjacent lane is for bicycles"], correct: 1, explanation: "Broken yellow = passing allowed when the oncoming lane is clear." },
  {
    conceptId: "SIGN_TEMPLATES-017", q: "A flashing yellow signal means…", options: ["Stop before entering the intersection","Proceed cautiously","Wait until the signal turns green","Treat it as an uncontrolled intersection"], correct: 1, explanation: "Flashing yellow = slow and proceed with caution." },
  {
    conceptId: "SIGN_TEMPLATES-018", q: "A flashing red signal means…", options: ["Stop, then go when safe","Slow down without coming to a stop","Yield only to traffic on the right","Wait until the light becomes steady"], correct: 0, explanation: "Flashing red is treated as a stop sign." },
  {
    conceptId: "SIGN_TEMPLATES-019", q: "A red flashing arrow means…", options: ["Turn without making a stop","Stop, then turn when safe","Wait for a steady green arrow","Yield without making a full stop"], correct: 1, explanation: "Red flashing arrow = stop, then proceed if safe for that turning movement." },
  {
    conceptId: "SIGN_TEMPLATES-020", q: "A solid green arrow means…", options: ["Turn after yielding to oncoming cars", "Make the indicated protected turn", "Stop before making the indicated turn", "Wait for a circular green light"], correct: 1, explanation: "Solid green arrow = protected turn; oncoming traffic is held." },
  {
    conceptId: "SIGN_TEMPLATES-021", q: "A flashing yellow arrow for left turn means…", options: ["The turn is protected from traffic","Yield before turning","Wait until a green arrow appears","Stop regardless of approaching traffic"], correct: 1, explanation: "Flashing yellow arrow = turn permitted, yield to oncoming." },
  {
    conceptId: "SIGN_TEMPLATES-022", q: "A steady yellow arrow means…", options: ["Begin the turn before the signal changes","Stop if safe","Treat the turn as permanently prohibited","Stop only when opposing traffic appears"], correct: 1, explanation: "Steady yellow arrow = the protected turn is ending." },
  {
    conceptId: "SIGN_TEMPLATES-023", q: "A 'Right Lane Must Turn' sign means…", options: ["Continue straight if traffic is clear","Turn right","Merge left without making the turn","Turn only when another vehicle turns"], correct: 1, explanation: "A mandatory-movement sign requires the indicated turn." },
  {
    conceptId: "SIGN_TEMPLATES-024", q: "A 'No U-Turn' sign means…", options: ["A U-turn is allowed on green","No U-turn here","A U-turn is allowed after stopping","Only commercial vehicles may U-turn"], correct: 1, explanation: "No U-turn signs prohibit the 180° turn at that location." },
  {
    conceptId: "SIGN_TEMPLATES-025", q: "A 'Wrong Way' sign means…", options: ["Continue until the next intersection","Wrong direction; stop safely","Use this lane only during detours","Yield to vehicles entering from ramps"], correct: 1, explanation: "Wrong Way = you are entering a one-way road the wrong direction." },
  {
    conceptId: "SIGN_TEMPLATES-026", q: "A 'Do Not Enter' sign on a ramp means…", options: ["Enter after yielding to ramp traffic","Entry prohibited","Enter only when the ramp is empty","Enter only to reach the service road"], correct: 1, explanation: "Do Not Enter typically marks the wrong side of a one-way or off-ramp." },
  {
    conceptId: "SIGN_TEMPLATES-027", q: "A diamond-shaped lane marker means…", options: ["A lane for bicycle traffic","An HOV lane","A lane for right turns only","A designated bus loading area"], correct: 1, explanation: "Diamond = HOV / carpool lane." },
  {
    conceptId: "SIGN_TEMPLATES-028", q: "A sign with a deer silhouette warns of…", options: ["Livestock crossing", "Wildlife crossing", "Hunting allowed", "Farm exit"], correct: 1, explanation: "Wildlife crossing — scan the shoulders, especially dawn/dusk." },
  {
    conceptId: "SIGN_TEMPLATES-029", q: "A sign showing a curving arrow with a posted speed means…", options: ["The maximum legal speed","An advisory curve speed","The minimum permitted speed","A speed restriction for trucks"], correct: 1, explanation: "Yellow advisory speed signs recommend a safe curve speed." },
  {
    conceptId: "SIGN_TEMPLATES-030", q: "In good conditions, what does a black-on-white 'Speed Limit 55' sign state?", options: ["The recommended cruising speed","The maximum legal speed","The minimum required speed","A speed recommendation for trucks"], correct: 1, explanation: "Posted speed = legal max; basic speed law still requires slower in poor conditions." },
  {
    conceptId: "SIGN_TEMPLATES-031", q: "A 'Minimum Speed 40' sign means…", options: ["A recommended cruising speed","The normal minimum speed","The maximum permitted speed","A minimum speed only for trucks"], correct: 1, explanation: "Minimum speed signs prohibit traveling below the posted floor without cause." },
  {
    conceptId: "SIGN_TEMPLATES-032", q: "A pavement marking of a bicycle and chevrons (a 'sharrow') means…", options: ["Only bicycles may use this lane","Bicycles share this lane","Bicycles must use the sidewalk","Bicyclists must dismount here"], correct: 1, explanation: "Sharrows mark a shared travel lane." },
  {
    conceptId: "SIGN_TEMPLATES-033", q: "Yellow flashing beacons above a school speed sign mean…", options: ["The school is currently closed","School speed limit applies","Only school buses must slow down","The restriction begins after flashing ends"], correct: 1, explanation: "Flashing beacons activate the reduced school zone limit." },
  {
    conceptId: "SIGN_TEMPLATES-034", q: "A 'Roundabout Ahead' sign tells you to…", options: ["Stop before every roundabout entry","Prepare to yield","Enter ahead of circulating traffic","Wait until the entire circle is empty"], correct: 1, explanation: "Slow on approach; you'll yield to traffic already circulating." },
  {
    conceptId: "SIGN_TEMPLATES-035", q: "An 'X' with 'RR' marks…", options: ["A roadside rest area","A railroad crossing","A mandatory right turn","A road maintenance zone"], correct: 1, explanation: "Crossbuck/RR sign marks a railroad crossing — look, listen, slow." },
  {
    conceptId: "SIGN_TEMPLATES-036", q: "A 'No Turn on Red' sign means…", options: ["Turn right after a complete stop","Wait for green","Turn left after yielding on red","Turn when cross traffic is stopped"], correct: 1, explanation: "No Turn on Red overrides the default right-on-red rule." },
  {
    conceptId: "SIGN_TEMPLATES-037", q: "What does an octagonal sign mean, even when its lettering is obscured?", options: ["Yield", "Stop", "Warning", "Construction"], correct: 1, explanation: "Shape alone signals STOP — recognizable even when snow-covered." },
  {
    conceptId: "SIGN_TEMPLATES-038", q: "A sign showing a truck on a downgrade with a percentage means…", options: ["A designated truck route","A steep grade ahead","A truck inspection station","A road closed to heavy trucks"], correct: 1, explanation: "Downgrade warning — gear down to manage speed without brake fade." },
  {
    conceptId: "SIGN_TEMPLATES-039", q: "Rumble strips on the shoulder are designed to…", options: ["Separate opposing traffic lanes","Warn of lane departure","Identify highway exit-only lanes","Mark the beginning of a passing zone"], correct: 1, explanation: "Rumble strips wake drowsy/distracted drivers leaving the lane." },
  {
    conceptId: "SIGN_TEMPLATES-040", q: "A flagger at a work zone directing traffic has authority…", options: ["Below all permanent signs","Above posted signals","Only while a police officer is present","Only over construction vehicles"], correct: 1, explanation: "Always obey the flagger — they override conflicting signs/signals." },
  {
    conceptId: "SIGN_TEMPLATES-041", q: "A pedestrian signal showing a flashing 'Don't Walk' / upraised hand means…", options: ["Begin crossing if traffic is stopped","Finish crossing; do not start","Stop in the roadway until it changes","Cross only behind turning vehicles"], correct: 1, explanation: "Flashing 'Don't Walk' = do not start crossing; complete if mid-street." },
  {
    conceptId: "SIGN_TEMPLATES-042", q: "A bicycle-shaped traffic signal lens applies to…", options: ["All road users","Bicyclists","Pedestrians only","Transit vehicles"], correct: 1, explanation: "Bike-shaped lenses control bicycle traffic only." },
  {
    conceptId: "SIGN_TEMPLATES-043", q: "A diagonal yellow arrow on the pavement near an exit means…", options: ["The road becomes one-way","Exit-only lane ahead","A U-turn lane begins","A carpool restriction begins"], correct: 1, explanation: "Diagonal arrow = the lane peels off; move over to continue." },
  {
    conceptId: "SIGN_TEMPLATES-044", q: "A square sign with a black truck and route number is…", options: ["A truck speed warning sign","A truck route marker","A truck weight restriction","A prohibition on truck traffic"], correct: 1, explanation: "Truck route signs guide commercial vehicles along approved corridors." },
  {
    conceptId: "SIGN_TEMPLATES-045", q: "A purple-stripe sign on tollways indicates…", options: ["A high-occupancy restriction","Electronic tolling","A transit-only restriction","A temporary construction detour"], correct: 1, explanation: "Purple striping = electronic toll collection lanes (E-ZPass, FasTrak, etc.)." },
  {
    conceptId: "SIGN_TEMPLATES-046", q: "A 'Reduced Speed Ahead' sign means…", options: ["Keep speed until after the new sign","Slow before the new limit","Reduce speed only when traffic slows","Apply the new limit to trucks only"], correct: 1, explanation: "Begin slowing before the lower limit takes effect." },
  {
    conceptId: "SIGN_TEMPLATES-047", q: "A 'Two-Way Traffic' sign warns…", options: ["The road becomes one-way","Oncoming traffic ahead","A carpool lane begins ahead","A passing restriction ends ahead"], correct: 1, explanation: "Divided highway ends — oncoming traffic resumes beside you." },
  {
    conceptId: "SIGN_TEMPLATES-048", q: "A 'Slippery When Wet' sign means…", options: ["Slow only when standing water is visible","Slow in wet conditions","Maintain speed unless traction is lost","Apply the warning only to large trucks"], correct: 1, explanation: "Surface loses traction when wet — slow down." },
  {
    conceptId: "SIGN_TEMPLATES-049", q: "A 'Dead End' sign means…", options: ["A detour route begins","No through road","The one-way restriction ends","The bridge is temporarily closed"], correct: 1, explanation: "Dead End = the road terminates; no through connection." },
  {
    conceptId: "SIGN_TEMPLATES-050", q: "A 'No Outlet' sign means…", options: ["No freeway exit is available","No through connection","The road is closed to local traffic","Only the next street is a cul-de-sac"], correct: 1, explanation: "No Outlet = the area's streets don't connect through." },
];

// ---------------------------------------------------------------------------
// 50 UNIVERSAL DRIVING-RULE TEMPLATES (with state interpolation where useful)
// ---------------------------------------------------------------------------
const RULE_TEMPLATES: Template[] = [
  {
    conceptId: "RULE_TEMPLATES-001", q: "Two cars arrive at a 4-way stop in {state} together. Who goes first?", options: ["Driver on the left", "Driver on the right", "Larger vehicle", "First vehicle to signal"], correct: 1, explanation: "At a 4-way stop, the car on the right has right-of-way." },
  {
    conceptId: "RULE_TEMPLATES-002", q: "Turning left at a green ball (no arrow), you yield to…", options: ["Only crossing pedestrians","Only oncoming vehicles","Both traffic and pedestrians","Only vehicles already turning"], correct: 2, explanation: "Green ball = permissive turn; yield to oncoming traffic AND pedestrians." },
  {
    conceptId: "RULE_TEMPLATES-003", q: "An emergency vehicle with lights and siren approaches you on a two-lane road. You…", options: ["Continue until the next intersection","Pull right and stop","Stop in your current travel lane","Pull left and wait on the shoulder"], correct: 1, explanation: "Pull right and stop until the emergency vehicle passes." },
  {
    conceptId: "RULE_TEMPLATES-004", q: "Entering a roundabout in {state}, you must…", options: ["Stop even when no traffic is present","Yield to circulating traffic","Yield only to traffic entering on the right","Enter when traffic in the circle slows"], correct: 1, explanation: "Yield to vehicles already in the roundabout." },
  {
    conceptId: "RULE_TEMPLATES-005", q: "A school bus is stopped on an undivided road with red lights flashing. You must…", options: ["Pass slowly if no child is visible","Stop in both directions","Stop only if traveling behind the bus","Stop only after the bus door opens"], correct: 1, explanation: "On an undivided road, both directions must stop." },
  {
    conceptId: "RULE_TEMPLATES-006", q: "On a highway separated by a raised or unpaved median, a school bus on the opposite roadway stops with red lights flashing. What must oncoming traffic do?", options: ["Stop regardless of the road divider","Slow to the school-zone speed limit","No stop required","Stop only when the bus driver signals"], correct: 2, explanation: "On a divided highway with a physical median, oncoming traffic does NOT need to stop." },
  {
    conceptId: "RULE_TEMPLATES-007", q: "Right turn on red in {state} is permitted unless…", options: ["The intersecting road has two lanes","A sign or red arrow prohibits it","The intersection has a marked crosswalk","The signal has just changed to red"], correct: 1, explanation: "Right on red is legal after a full stop unless prohibited by signage or a red arrow." },
  {
    conceptId: "RULE_TEMPLATES-008", q: "The legal adult (21+) BAC limit in {state} is…", options: ["{bacU21}%", "{bacAdult}%", "0.10%", "0.15%"], correct: 1, explanation: "{state} sets the adult per-se limit at {bacAdult}%." },
  {
    conceptId: "RULE_TEMPLATES-009", q: "Under {state}'s zero-tolerance law, the BAC limit for drivers under 21 is…", options: ["0.00%", "{bacU21}%", "{bacAdult}%", "0.05%"], correct: 1, explanation: "{state}'s under-21 limit is {bacU21}%." },
  {
    conceptId: "RULE_TEMPLATES-010", q: "The federal commercial driver BAC limit (also enforced in {state}) is…", options: ["0.02%", "{bacCDL}%", "{bacAdult}%", "0.10%"], correct: 1, explanation: "CDL operators are held to {bacCDL}% nationwide." },
  {
    conceptId: "RULE_TEMPLATES-011", q: "Where should an opened, unsealed container of alcohol be carried in an ordinary passenger vehicle?", options: ["In an unlocked glove compartment","In the trunk","On the rear passenger seat","In the center-console storage area"], correct: 1, explanation: "Keep opened alcohol in the trunk or a non-passenger cargo area, not in the passenger compartment. Consult the {state} handbook for exceptions." },
  {
    conceptId: "RULE_TEMPLATES-012", q: "In good conditions, what is a recommended minimum following gap? Increase it in poor conditions.", options: ["One car length at any road speed","One second for each ten mph","At least three seconds","Five car lengths at any road speed"], correct: 2, explanation: "Use the 3-second rule; extend to 4+ seconds in rain or snow." },
  {
    conceptId: "RULE_TEMPLATES-013", q: "The left lane on a multi-lane highway in {state} is for…", options: ["Slower vehicles traveling through","Passing traffic","All heavy commercial vehicles","Any vehicle traveling at the minimum"], correct: 1, explanation: "Keep right except to pass — codified in most state vehicle codes." },
  {
    conceptId: "RULE_TEMPLATES-014", q: "Where a state posts enhanced work-zone penalties, what can a traffic violation carry?", options: ["The normal fine without an increase","An increased fine","Only the fine for a parking violation","Only the fine for a first offense"], correct: 1, explanation: "Work-zone fines are doubled in most states, {state} included." },
  {
    conceptId: "RULE_TEMPLATES-015", q: "The basic speed law in {state} means…", options: ["Maintain the posted limit in all weather","Choose a safe speed","Stay at the minimum regardless of visibility","Stay five below the limit in all conditions"], correct: 1, explanation: "Even at the posted limit, you must slow for weather, traffic, and visibility." },
  {
    conceptId: "RULE_TEMPLATES-016", q: "If you begin to skid on a wet road, you should…", options: ["Apply firm braking immediately","Ease off; steer toward your path","Steer opposite the intended direction","Apply the parking brake progressively"], correct: 1, explanation: "Steer into the direction of travel and ease off the throttle." },
  {
    conceptId: "RULE_TEMPLATES-017", q: "Hydroplaning can begin around which speed in substantial standing water? Conditions and tires can cause it at lower speeds.", options: ["10 mph","25 mph","35 mph","65 mph"], correct: 2, explanation: "Hydroplaning can begin near 35 mph on wet pavement with worn tires." },
  {
    conceptId: "RULE_TEMPLATES-018", q: "Merging onto a freeway in {state}, you should…", options: ["Stop at the end of the entrance ramp","Match traffic; find a gap","Enter well below the traffic speed","Wait until the entire traffic lane is empty"], correct: 1, explanation: "Use the ramp to match freeway speed, then merge smoothly." },
  {
    conceptId: "RULE_TEMPLATES-019", q: "A pedestrian in a marked crosswalk has…", options: ["No right of way", "The right of way", "Right of way only at signals", "Right of way only at night"], correct: 1, explanation: "Pedestrians in crosswalks have right of way in every state, {state} included." },
  {
    conceptId: "RULE_TEMPLATES-020", q: "When parking on a hill facing downhill with a curb, you turn the wheels…", options: ["Away from the curb", "Toward the curb", "Parallel to the curb", "Toward the center line"], correct: 1, explanation: "Turn the front wheels toward the curb and set the parking brake." },
  {
    conceptId: "RULE_TEMPLATES-021", q: "When parking on a hill facing uphill with a curb, you turn the wheels…", options: ["Away from the curb", "Toward the curb", "Parallel to the curb", "Toward the center line"], correct: 0, explanation: "Uphill with a curb: turn wheels away from the curb (left)." },
  {
    conceptId: "RULE_TEMPLATES-022", q: "Driving in fog, you should use…", options: ["High-beam headlights","Low-beam headlights","Parking lights without headlights","Hazard flashers instead of headlights"], correct: 1, explanation: "Use low beams or fog lights — high beams glare back off the fog." },
  {
    conceptId: "RULE_TEMPLATES-023", q: "With ABS brakes, during an emergency stop you should…", options: ["Pump the brake pedal repeatedly","Hold firm brake pressure","Release the pedal when ABS pulses","Apply the parking brake instead"], correct: 1, explanation: "With ABS, press firmly and hold — the system pulses for you." },
  {
    conceptId: "RULE_TEMPLATES-024", q: "In addition to any state-specific timing or wiper rules, when should headlights be used?", options: ["At night and in low visibility","Only after midnight on unlit roads","Only while driving outside city limits","Only when other drivers flash their lights"], correct: 0, explanation: "Typical state code: headlights from ½ hour after sunset to ½ hour before sunrise, and any time visibility is reduced." },
  {
    conceptId: "RULE_TEMPLATES-025", q: "When following a motorcycle, you should…", options: ["Use the same close gap as in slow traffic","Increase your following gap","Follow beside the motorcycle in its lane","Use high beams to improve its visibility"], correct: 1, explanation: "Motorcycles can stop faster — allow extra following distance (4-second rule)." },
  {
    conceptId: "RULE_TEMPLATES-026", q: "Texting while driving in {state} is…", options: ["Legal if hands-free", "Illegal", "Legal at red lights", "Up to the driver"], correct: 1, explanation: "Texting bans apply in {state} (48 states + DC ban it outright; first-offense base fine ~${phoneFine})." },
  {
    conceptId: "RULE_TEMPLATES-027", q: "If your tire blows out, you should…", options: ["Apply firm braking immediately","Hold steady; ease off the gas","Steer quickly toward the shoulder","Downshift abruptly to reduce speed"], correct: 1, explanation: "Grip the wheel, ease off the gas, coast to slow before braking gently." },
  {
    conceptId: "RULE_TEMPLATES-028", q: "When approaching a stopped emergency vehicle covered by your state’s Move Over law, what should you do when safe?", options: ["Maintain speed while passing in the same lane","Move over or slow down","Change lanes only if an officer directs you","Stop beside the emergency vehicle"], correct: 1, explanation: "Move Over laws now exist in all 50 states — change lanes or slow down." },
  {
    conceptId: "RULE_TEMPLATES-029", q: "Cannabis affects driving by…", options: ["Impairing balance but not judgment","Slowing reactions and judgment","Affecting vision only during night driving","Causing impairment only with alcohol"], correct: 1, explanation: "THC impairs reaction time and distance judgment — DUI applies in {state} regardless of legalization status." },
  {
    conceptId: "RULE_TEMPLATES-030", q: "Performing a three-point turn (K-turn), you should…", options: ["Check mirrors only before starting","Check around before each move","Look forward throughout the maneuver","Rely only on your reversing camera"], correct: 1, explanation: "Always check both directions and mirrors at every stage of the turn." },
  {
    conceptId: "RULE_TEMPLATES-031", q: "A pedestrian using a white cane or guide dog has…", options: ["No right of way", "Absolute right of way", "Right of way only at signals", "Right of way only at crosswalks"], correct: 1, explanation: "Every state code, including {state}, grants absolute right of way." },
  {
    conceptId: "RULE_TEMPLATES-032", q: "Where the posted rule requires three feet of passing clearance, how much space must you give a bicyclist?", options: ["One foot of clearance","Three feet","Two feet of clearance","Four feet of clearance"], correct: 1, explanation: "3-foot passing laws are on the books in 33+ states; the remainder require a 'safe distance'." },
  {
    conceptId: "RULE_TEMPLATES-033", q: "When backing up safely, you should…", options: ["Use mirrors only", "Turn your head and look back", "Reverse quickly to clear", "Trust the backup camera alone"], correct: 1, explanation: "Turn your head and look — cameras and mirrors have blind spots." },
  {
    conceptId: "RULE_TEMPLATES-034", q: "A yellow traffic light means…", options: ["Continue if you are near the limit line","Stop if safe","Stop only when cross traffic begins moving","Continue whenever no pedestrians are present"], correct: 1, explanation: "Yellow = stop if you can do so safely; do NOT accelerate to beat it." },
  {
    conceptId: "RULE_TEMPLATES-035", q: "Which consequences can a first-offense DUI carry? Other penalties depend on state law and circumstances.", options: ["A fine without any licensing consequence","Fines and license penalties","License points instead of any other penalty","A warning if no collision has occurred"], correct: 1, explanation: "Even a first DUI in {state} involves fines, suspension, possible jail, and required alcohol education." },
  {
    conceptId: "RULE_TEMPLATES-036", q: "The liver metabolizes about one standard drink per…", options: ["15 minutes", "1 hour", "3 hours", "Depends on body size"], correct: 1, explanation: "~1 drink per hour. Coffee, food, and cold showers do NOT speed this up." },
  {
    conceptId: "RULE_TEMPLATES-037", q: "Highway hypnosis is best avoided by…", options: ["Continue driving until your next fuel stop","Take regular breaks","Rely on cruise control to maintain attention","Use loud music instead of stopping"], correct: 1, explanation: "Take a break every 2 hours; keep eyes scanning, not fixed." },
  {
    conceptId: "RULE_TEMPLATES-038", q: "When signaling your exit from a roundabout, use…", options: ["No signal when leaving the circle","Signal right before exiting","Signal left throughout the entire circle","Use hazard flashers while exiting"], correct: 1, explanation: "Signal right just before your exit so others know you're leaving." },
  {
    conceptId: "RULE_TEMPLATES-039", q: "Worn tire tread is dangerous because…", options: ["It affects comfort but not braking distance","It reduces traction","It causes problems only on gravel roads","It matters only at highway speeds"], correct: 1, explanation: "Worn tread loses traction and lengthens stops. Legal minimum: 2/32 inch." },
  {
    conceptId: "RULE_TEMPLATES-040", q: "Sharing the road with large trucks, the best practice is…", options: ["Return to the lane as soon as the cab is visible","Avoid the truck’s blind spots","Follow close enough to see beneath the trailer","Pass alongside the trailer at the same speed"], correct: 1, explanation: "Trucks have large No-Zones — don't linger beside them." },
  {
    conceptId: "RULE_TEMPLATES-041", q: "Driving on wet leaves is similar to driving on…", options: ["Dry pavement with normal grip","Ice","Compacted gravel with reliable grip","Dry sand with predictable grip"], correct: 1, explanation: "Wet leaves act like ice — reduce speed and avoid sudden moves." },
  {
    conceptId: "RULE_TEMPLATES-042", q: "Who must use a seat belt?", options: ["The driver but not adult passengers","Occupants covered by state law","Only occupants traveling on highways","Only occupants in vehicles without airbags"], correct: 1, explanation: "{state} requires belts; 49 states require front-seat passenger belts (NH is the lone adult exception)." },
  {
    conceptId: "RULE_TEMPLATES-043", q: "Drowsy driving is most comparable to…", options: ["Ordinary fatigue after physical exercise","Alcohol impairment","Only the distraction of using a radio","Only the effects of driving above the limit"], correct: 1, explanation: "Being awake 18+ hours impairs you like a 0.05% BAC; 24 hours like 0.10%." },
  {
    conceptId: "RULE_TEMPLATES-044", q: "If the service brakes fail, after trying the pedal, how can you slow safely?", options: ["Apply the parking brake all at once","Downshift; brake gradually","Switch the ignition off while moving","Coast until the road becomes level"], correct: 1, explanation: "Pump the pedal, downshift to slow with the engine, then apply the parking brake gradually." },
  {
    conceptId: "RULE_TEMPLATES-045", q: "Refusing a breathalyzer in {state} results in…", options: ["A fine with no effect on driving privileges","A mandatory retest with no suspension","License suspension","Only additional points on the license"], correct: 2, explanation: "{state}'s implied-consent statute imposes a license suspension on refusal." },
  {
    conceptId: "RULE_TEMPLATES-046", q: "The minimum age to apply for a learner's permit in {state} is…", options: ["14", "{permitAge}", "{provisionalAge}", "{fullAge}"], correct: 1, explanation: "{state} permits applications at {permitAge}." },
  {
    conceptId: "RULE_TEMPLATES-047", q: "The minimum age for a full unrestricted license in {state} is…", options: ["{permitAge}", "{provisionalAge}", "{fullAge}", "21"], correct: 2, explanation: "{state} grants full unrestricted licenses at {fullAge}." },
  {
    conceptId: "RULE_TEMPLATES-048", q: "{state} requires how many supervised driving hours before the road test?", options: ["10", "25", "{supervisedHours}", "100"], correct: 2, explanation: "{state} requires {supervisedHours} supervised hours before the road test." },
  {
    conceptId: "RULE_TEMPLATES-049", q: "The {state} written permit exam has…", options: ["{questionsCount} questions; {minCorrectMinus2} correct","{questionsCount} questions; {minCorrect} correct","{questionsCount} questions; {minCorrectPlus2} correct","{questionsCount} questions; {minCorrectMinus4} correct"], correct: 1, explanation: "{state} requires {minCorrect} of {questionsCount} correct ({passPct}%)." },
  {
    conceptId: "RULE_TEMPLATES-050", q: "Approximately what is the state’s first-offense base phone fine, excluding court costs and surcharges?", options: ["${phoneFineLow}","${phoneFineMid}","${phoneFine}","${phoneFineHigh}"], correct: 2, explanation: "Representative first-offense base fine in {state}: ${phoneFine}. Surcharges and court costs are additional — verify the current value with the official handbook." },
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
  q = distinctOptions(q);
  if (q.options.length === 2 && q.options.includes("True") && q.options.includes("False")) return orderBooleanAnswers(q);
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
    ...expandWithVariations(SIGN_TEMPLATES, rules, 4),
    ...expandWithVariations(RULE_TEMPLATES, rules, 4),
  ];
}

export const TEMPLATE_COUNT = SIGN_TEMPLATES.length + RULE_TEMPLATES.length;
