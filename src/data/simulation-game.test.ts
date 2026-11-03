import { describe, expect, it } from "vitest";
import { DECISION_MS, recordDecision, decisionSummary, stepProgress, finishScenario } from "./simulation-game";

describe("simulation prep rules", () => {
  it("allows 2.5 seconds in timed mode", () => {
    expect(DECISION_MS).toBe(2500);
    expect(recordDecision("stop", "stop", "stop", 2499, true).correct).toBe(true);
    expect(recordDecision("stop", "stop", "stop", 2500, true).selectedAction).toBeNull();
  });
  it("has no deadline in untimed mode", () => {
    expect(recordDecision("stop", "stop", "stop", 20000, false).correct).toBe(true);
    expect(recordDecision("stop", "stop", "stop", 20000, false).reactionMs).toBe(20000);
  });
  it("records timeout as no decision made", () => {
    expect(recordDecision("stop", null, "stop", 5000, true)).toMatchObject({ correct: false, selectedAction: null, reactionMs: null });
  });
  it("tracks wrong decisions and preserves frozen review frames", () => {
    const wrong = recordDecision("stop", "go", "stop", 1400, true, "frame-data");
    expect(wrong).toMatchObject({ correct: false, selectedAction: "go", reactionMs: 1400, thumbnail: "frame-data" });
    expect(decisionSummary([wrong]).missed).toEqual([wrong]);
  });
  it("calculates accuracy and average decision time excluding timeouts", () => {
    const decisions = [recordDecision("a", "stop", "stop", 800, true), recordDecision("b", "go", "stop", 1200, true), recordDecision("c", null, "stop", 5000, true)];
    expect(decisionSummary(decisions)).toMatchObject({ accuracy: 33, averageReaction: 1, completed: 2 });
    expect(decisionSummary(decisions).missed.map((decision) => decision.scenarioId)).toEqual(["b", "c"]);
  });
  it("advances only after a correct first step", () => {
    expect(stepProgress(["stop", "yield"], [recordDecision("a", "stop", "stop", 800, true)])).toBe("next");
    expect(stepProgress(["stop", "yield"], [recordDecision("a", "go", "stop", 800, true)])).toBe("finished");
    expect(stepProgress(["stop", "yield"], [recordDecision("a", null, "stop", 2500, true)])).toBe("finished");
  });
  it("requires both steps for scenario correctness", () => {
    const first = recordDecision("a", "stop", "stop", 1000, true);
    expect(finishScenario(["stop", "yield"], [first]).correct).toBe(false);
    expect(finishScenario(["stop", "yield"], [first, recordDecision("a", "yield", "yield", 2499, true)]).correct).toBe(true);
    expect(finishScenario(["stop", "yield"], [first, recordDecision("a", "go", "yield", 1000, true)]).correct).toBe(false);
  });
  it("averages all decisions, not scenario averages", () => {
    const two = finishScenario(["stop", "yield"], [recordDecision("a", "stop", "stop", 500, true), recordDecision("a", "yield", "yield", 1500, true)]);
    const one = finishScenario(["go"], [recordDecision("b", "go", "go", 2000, true)]);
    expect(decisionSummary([two, one]).averageReaction).toBeCloseTo(4 / 3);
    expect(decisionSummary([two, one]).accuracy).toBe(100);
    expect(decisionSummary([two, one]).completed).toBe(2);
  });
});