import { describe, expect, it } from "vitest";
import { createSimulationSession } from "./simulation-session";
import { SIMULATION_CLIPS } from "./simulation-clips";

describe("simulation session rules", () => {
  it("contains only the requested scenarios", () => {
    expect(SIMULATION_CLIPS.map((clip) => clip.id)).toEqual([
      "stop-sign-approach", "stop-sign-right-of-way", "lane-change",
      "left-turn-green-arrow", "right-turn-on-green", "right-turn-on-red",
    ]);
  });

  it("shuffles clip order at each start without losing clips", () => {
    const first = createSimulationSession(SIMULATION_CLIPS, () => 0);
    const second = createSimulationSession(SIMULATION_CLIPS, () => 0.999);
    expect(first.map((clip) => clip.id)).not.toEqual(second.map((clip) => clip.id));
    expect(first.map((clip) => clip.id).sort()).toEqual(SIMULATION_CLIPS.map((clip) => clip.id).sort());
  });

  it("shuffles answers without fixing the correct answer to option two", () => {
    const first = createSimulationSession(SIMULATION_CLIPS, () => 0);
    const second = createSimulationSession(SIMULATION_CLIPS, () => 0.999);
    for (const clip of first) {
      const original = SIMULATION_CLIPS.find((source) => source.id === clip.id);
      expect(original).toBeDefined();
      expect(clip.actions.map((action) => action.id)).not.toEqual(original?.actions.map((action) => action.id));
      expect(clip.actions.findIndex((action) => action.id === clip.correctAction)).not.toBe(1);
      const correct = clip.actions.find((action) => action.id === clip.correctAction);
      expect(correct?.originalIndex).toBe(original?.actions.findIndex((action) => action.id === original.correctAction));
      expect(clip.actions).not.toEqual(second.find((source) => source.id === clip.id)?.actions);
    }
  });

  it("does not mutate the authored clips or choices", () => {
    const before = structuredClone(SIMULATION_CLIPS);
    createSimulationSession(SIMULATION_CLIPS, () => 0);
    expect(SIMULATION_CLIPS).toEqual(before);
  });

  it("keeps each decision before the existing video ends with 2–4 actions", () => {
    const durations = [5, 5, 2.1, 2.5, 3, 3];
    SIMULATION_CLIPS.forEach((clip, index) => {
      expect(clip.pauseAt).toBeGreaterThan(0);
      expect(clip.pauseAt).toBeLessThan(durations[index]);
      expect(clip.actions.length).toBeGreaterThanOrEqual(2);
      expect(clip.actions.length).toBeLessThanOrEqual(4);
      expect(clip.actions.some((action) => action.id === clip.correctAction)).toBe(true);
    });
  });
});