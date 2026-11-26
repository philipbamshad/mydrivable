import { getStateNumerics, interpolate } from './state-numerics';
import { canonicalConcept } from './question-concepts';

type QuestionLike = { conceptId?: string; q: string; options: string[]; correct: number; explanation: string };
export const BINARY_REPLACEMENTS = [
  {
    "conceptId": "TEMPLATES-010",
    "q": "What do double solid yellow center lines mean for passing?",
    "options": [
      "Passing is prohibited in both directions",
      "Passing is permitted when the road is clear",
      "Passing is permitted after signaling"
    ],
    "match": "double solid yellow line means passing"
  },
  {
    "conceptId": "TEMPLATES-012",
    "q": "Why should you clean both sides of your windshield?",
    "options": [
      "To reduce glare and improve visibility",
      "To reduce glare only during daytime trips",
      "To improve visibility only during rainy trips"
    ],
    "match": "Sun glare and headlight scatter"
  },
  {
    "conceptId": "TEMPLATES-013",
    "q": "Which lane should you use to begin an ordinary right turn?",
    "options": [
      "The lane nearest the right curb",
      "The lane nearest the center line",
      "Any lane with room to complete the turn"
    ],
    "match": "Enter the turn from the lane closest"
  },
  {
    "conceptId": "TEMPLATES-014",
    "q": "Where must you stop at a STOP sign when a limit line is marked?",
    "options": [
      "Before crossing the marked limit line",
      "After crossing the line but before traffic",
      "At the road edge beyond the crosswalk"
    ],
    "match": "stop at the marked limit line"
  },
  {
    "conceptId": "TEMPLATES-017",
    "q": "An emergency vehicle approaches from behind with flashing lights. What should you do?",
    "options": [
      "Pull safely to the right edge and stop",
      "Maintain your speed until it passes you",
      "Speed up until the next road opens up"
    ],
    "match": "Pull as close to the right edge"
  },
  {
    "conceptId": "TEMPLATES-020",
    "q": "The light is green, but traffic prevents you from clearing the intersection. What should you do?",
    "options": [
      "Wait before entering until the exit is clear",
      "Enter and wait behind the vehicle ahead",
      "Enter and move toward the crosswalk to wait"
    ],
    "match": "Do not block the box"
  },
  {
    "conceptId": "TEMPLATES-021",
    "q": "A vehicle is stopped at a crosswalk for a pedestrian. What should you do?",
    "options": [
      "Stop behind it and wait for the crossing to clear",
      "Pass slowly after checking the adjacent lane",
      "Pass after sounding your horn to warn walkers"
    ],
    "match": "Never pass a vehicle that has stopped at a crosswalk"
  },
  {
    "conceptId": "TEMPLATES-022",
    "q": "How should you treat pedestrians crossing at an unmarked intersection crosswalk?",
    "options": [
      "Yield to pedestrians using the crosswalk",
      "Proceed because only painted crossings count",
      "Yield only if a pedestrian signal is present"
    ],
    "match": "Every corner is treated as an unmarked crosswalk"
  },
  {
    "conceptId": "TEMPLATES-024",
    "q": "Another driver fails to yield even though you have the right of way. What should you do?",
    "options": [
      "Yield when necessary to avoid a collision",
      "Continue because your legal priority protects you",
      "Sound your horn and maintain your current speed"
    ],
    "match": "Right of way is something you give"
  },
  {
    "conceptId": "TEMPLATES-026",
    "q": "You hit an unattended parked car and cannot find its owner. What should you do?",
    "options": [
      "Leave a note with your name and contact details",
      "Notify your insurer without leaving your details",
      "Wait briefly and leave if the owner does not return"
    ],
    "match": "Every state treats leaving the scene of an unattended collision"
  },
  {
    "conceptId": "TEMPLATES-027",
    "q": "When does {state} require a written collision report under the handbook rule?",
    "options": [
      "When injury occurs or damage exceeds {accidentThreshold}",
      "Only when damage exceeds twice {accidentThreshold}",
      "Only when an officer requests a report at the scene"
    ],
    "match": "requires a written accident report"
  },
  {
    "conceptId": "TEMPLATES-045",
    "q": "What does the posted maximum speed limit allow?",
    "options": [
      "No faster travel, even when road conditions are good",
      "Faster travel when passing a slower highway vehicle",
      "Faster travel when matching the speed of other traffic"
    ],
    "match": "The posted maximum is the legal ceiling"
  },
  {
    "conceptId": "TEMPLATES-047",
    "q": "What speed commonly applies near a {state} school when children are present, unless signs say otherwise?",
    "options": [
      "{schoolZone} near the school when children are present",
      "35 mph near the school when children are present",
      "40 mph near the school when children are present"
    ],
    "match": "school zone limits are commonly"
  },
  {
    "conceptId": "TEMPLATES-051",
    "q": "Which headlights should you use on lit city streets or near other vehicles at night?",
    "options": [
      "Low beams to reduce glare for other road users",
      "High beams to improve the view for other road users",
      "Parking lights to reduce glare for other road users"
    ],
    "match": "On lit city streets and within roughly"
  },
  {
    "conceptId": "TEMPLATES-054",
    "q": "What authorization is needed to operate a motor scooter on public streets in {state}?",
    "options": [
      "A valid license or instruction permit",
      "Only proof that the scooter is insured",
      "Only permission from the scooter owner"
    ],
    "match": "A motor scooter is a motor vehicle"
  }
] as const;

export function isBinaryQuestion(question: Pick<QuestionLike, 'options'>): boolean {
  return question.options.length === 2 && question.options.every(option => /^(true|false|yes|no)$/i.test(option.trim()));
}

/** Retain the saved correct slot so answers, scores and queued numeric choices remain valid. */
export function upgradeBinaryQuestion<T extends QuestionLike>(question: T, state?: string): T & { conceptId?: string } {
  if (!isBinaryQuestion(question)) return question;
  const rule = BINARY_REPLACEMENTS.find(rule => question.explanation.toLowerCase().includes(rule.match.toLowerCase()));
  if (!rule) throw new Error(`Unmapped legacy binary question: ${question.q}`);
  const numerics = getStateNumerics(state);
  const format = (text: string) => interpolate(text.replace(/\{state\}/g, numerics.stateName), numerics);
  const correct = question.correct;
  const options = rule.options.map(format);
  const correctText = options.shift();
  if (!correctText || correct < 0 || correct > 1) throw new Error('Invalid legacy answer');
  options.splice(correct, 0, correctText);
  return { ...question, conceptId: question.conceptId ?? canonicalConcept(rule.conceptId), q: format(rule.q), options };
}
