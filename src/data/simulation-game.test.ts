import { describe, expect, it } from "vitest";
import { DECISION_MS, recordDecision, decisionSummary } from "./simulation-game";

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
});