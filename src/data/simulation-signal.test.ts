import { describe, expect, it } from "vitest";
import { signalDirection, signalIsActive } from "./simulation-signal";
import { SIMULATION_CLIPS } from "./simulation-clips";

describe("simulation turn signals", () => {
  it.each([
    ["Turning right", "right"], ["Changing lanes right", "right"],
    ["Turning left", "left"], ["Changing lanes left", "left"],
    ["Going straight", null],
  ])("maps %s to %s automatically", (intent, direction) => {
    expect(signalDirection(intent)).toBe(direction);
  });
  it("assigns the requested edges to all six scenarios", () => {
    expect(SIMULATION_CLIPS.map(clip => signalDirection(clip.intent))).toEqual([
      "right", "left", "right", null, null, "left",
    ]);
  });
  it("waits for actual playback", () => {
    expect(signalIsActive(false, "playing")).toBe(false);
    expect(signalIsActive(true, "playing")).toBe(true);
  });
  it("continues while choosing and stops on feedback or exit", () => {
    expect(signalIsActive(true, "decision")).toBe(true);
    expect(signalIsActive(true, "feedback")).toBe(false);
    expect(signalIsActive(true, "ready")).toBe(false);
    expect(signalIsActive(true, "results")).toBe(false);
  });
});