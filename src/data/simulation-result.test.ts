import { describe, expect, it } from "vitest";
import { scenarioResultView } from "./simulation-result";
import { recordDecision, finishScenario } from "./simulation-game";

const steps = ["stop", "yield"];
describe("scenario result view", () => {
  it("timeout says No decision made and never marks correct answers with a cross", () => {
    const view = scenarioResultView(steps, finishScenario(steps, [recordDecision("s", null, "stop", 3000, true)]));
    expect(view.heading).toBe("No decision made");
    expect(view.correctAnswer?.map(c => c.action)).toEqual(["stop", "yield"]);
    expect(view.correctAnswer?.every(c => c.mark === "none")).toBe(true);
  });
  it("step-two timeout keeps the first correct choice checked", () => {
    const view = scenarioResultView(steps, finishScenario(steps, [recordDecision("s", "stop", "stop", 800, true), recordDecision("s", null, "yield", 3000, true)]));
    expect(view.heading).toBe("No decision made");
    expect(view.chosen).toEqual([expect.objectContaining({ action: "stop", mark: "check" })]);
  });
  it("wrong choice is a red cross chip followed by the correct steps", () => {
    const view = scenarioResultView(steps, finishScenario(steps, [recordDecision("s", "go", "stop", 800, true)]));
    expect(view.heading).toBe("Incorrect");
    expect(view.chosen[0]).toMatchObject({ action: "go", mark: "cross", tone: "destructive" });
    expect(view.correctAnswer?.length).toBe(2);
  });
  it("correct scenario lists each step with its reaction time", () => {
    const view = scenarioResultView(steps, finishScenario(steps, [recordDecision("s", "stop", "stop", 800, true), recordDecision("s", "yield", "yield", 1200, true)]));
    expect(view.heading).toBe("Correct");
    expect(view.chosen.map(c => c.reactionMs)).toEqual([800, 1200]);
    expect(view.correctAnswer).toBeNull();
  });
});
