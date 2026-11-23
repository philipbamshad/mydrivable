import { expect, it } from "vitest";
import { completedDemoTabs, demoResults, untriedDemoTabs } from "./demo-results";
import { DEMO_PRACTICE } from "./demo";
it("returns a 4/5 score and exactly the missed question with its explanation", () => {
  const answers = DEMO_PRACTICE.map((q, i) => i === 0 ? (q.correct + 1) % q.options.length : q.correct);
  const result = demoResults(DEMO_PRACTICE, answers);
  expect(result.correct).toBe(4);
  expect(result.total).toBe(5);
  expect(result.missed).toHaveLength(1);
  expect(result.missed[0]?.question.explanation).toBe(DEMO_PRACTICE[0]?.explanation);
});
it("retains each locally completed tab only once and rejects invalid stored values", () => {
  expect(completedDemoTabs('["practice","practice","coach","invalid"]')).toEqual(["practice", "coach"]);
  expect(completedDemoTabs('{broken')).toEqual([]);
});
it("offers only other untried demo tabs", () => {
  expect(untriedDemoTabs(["practice", "signs"], "coach")).toEqual(["simulation", "progress"]);
});