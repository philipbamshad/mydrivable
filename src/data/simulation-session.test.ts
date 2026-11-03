import { describe, expect, it } from "vitest";
import { createSimulationSession } from "./simulation-session";
import { SIMULATION_CLIPS } from "./simulation-clips";

describe("simulation session rules", () => {
  it("contains only the requested scenarios", () => {
    expect(SIMULATION_CLIPS.map((clip) => clip.id)).toEqual([
      "right-turn-on-green", "left-turn-green-arrow", "right-turn-on-red",
      "stop-sign-approach", "stop-sign-right-of-way", "lane-change",
    ]);
  });

  it("shuffles clip order at each start without losing clips", () => {
    const first = createSimulationSession(SIMULATION_CLIPS, () => 0);
    const second = createSimulationSession(SIMULATION_CLIPS, () => 0.999);
    expect(first.map((clip) => clip.id)).not.toEqual(second.map((clip) => clip.id));
    expect(first.map((clip) => clip.id).sort()).toEqual(SIMULATION_CLIPS.map((clip) => clip.id).sort());
  });

  it("keeps the specified action order and original indices across starts", () => {
    for (const clip of createSimulationSession(SIMULATION_CLIPS, () => 0)) {
      const original = SIMULATION_CLIPS.find((source) => source.id === clip.id);
      expect(original).toBeDefined();
      expect(clip.actions.map((action) => action.id)).toEqual(original?.actions.map((action) => action.id));
      const correct = clip.actions.find((action) => action.id === clip.correctAction);
      expect(correct?.originalIndex).toBe(original?.actions.findIndex((action) => action.id === original.correctAction));
      expect(clip.actions.map((action) => action.originalIndex)).toEqual(clip.actions.map((_, index) => index));
    }
  });

  it("does not mutate the authored clips or choices", () => {
    const before = structuredClone(SIMULATION_CLIPS);
    createSimulationSession(SIMULATION_CLIPS, () => 0);
    expect(SIMULATION_CLIPS).toEqual(before);
  });

  it("uses the six requested freeze points", () => {
    expect(SIMULATION_CLIPS.map((clip) => clip.pauseAt)).toEqual([3.5, 1.5, 2, 4.5, 4.5, 1.5]);
  });

  it.each([
    ["right-turn-on-green", ["go", "yield", "stop"], "go"],
    ["left-turn-green-arrow", ["go", "yield", "stop"], "go"],
    ["right-turn-on-red", ["go", "yield", "stop"], "stop"],
    ["stop-sign-approach", ["go", "yield", "stop"], "stop"],
    ["stop-sign-right-of-way", ["go", "yield", "stop"], "stop"],
    ["lane-change", ["go", "yield", "stop"], "yield"],
  ])("preserves authored actions and scoring for %s", (id, actions, correct) => {
    const clip = SIMULATION_CLIPS.find((source) => source.id === id);
    expect(clip?.actions.map((action) => action.id)).toEqual(actions);
    expect(clip?.correctAction).toBe(correct);
  });

  it("offers exactly three fixed actions with a valid correct action", () => {
    SIMULATION_CLIPS.forEach((clip) => {
      expect(clip.pauseAt).toBeGreaterThan(0);
      expect(clip.actions.length).toBe(3);
      expect(clip.actions.some((action) => action.id === clip.correctAction)).toBe(true);
    });
  });
  it.each([
    ["stop-sign-approach", ["stop", "yield"]],
    ["stop-sign-right-of-way", ["stop", "yield"]],
    ["right-turn-on-red", ["stop", "yield"]],
    ["lane-change", ["yield", "go"]],
    ["left-turn-green-arrow", ["go"]],
    ["right-turn-on-green", ["go"]],
  ])("uses the required steps for %s", (id, steps) => {
    expect(SIMULATION_CLIPS.find(clip => clip.id === id)?.steps).toEqual(steps);
  });
});