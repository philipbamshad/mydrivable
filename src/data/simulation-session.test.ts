import { describe, expect, it } from "vitest";
import { createSimulationSession } from "./simulation-session";
import { SIMULATION_CLIPS } from "./simulation-clips";

describe("simulation session rules", () => {
  it("contains only the requested scenarios", () => {
    expect(SIMULATION_CLIPS.map((clip) => clip.id)).toEqual([
      "stop-sign-approach", "stop-sign-right-of-way", "lane-change", "left-turn-green-arrow",
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
      expect(clip.options).not.toEqual(original?.options);
      expect(clip.correct).not.toBe(1);
      expect(clip.options[clip.correct]).toBe(original?.options[original.correct]);
      expect(clip.options).not.toEqual(second.find((source) => source.id === clip.id)?.options);
    }
  });

  it("does not mutate the authored clips or choices", () => {
    const before = structuredClone(SIMULATION_CLIPS);
    createSimulationSession(SIMULATION_CLIPS, () => 0);
    expect(SIMULATION_CLIPS).toEqual(before);
  });
});