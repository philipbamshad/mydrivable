import { describe, expect, it } from "vitest";
import { questionVisual } from "./question-visual";
import { buildExamPool } from "./mock-exam";

describe("question visuals", () => {
  it("every sign image shows a symbol or text, never a blank shape", () => {
    for (const state of ["CA", "TX", "NY", "FL"]) for (const q of buildExamPool(state)) {
      const v = questionVisual(q);
      if (v?.kind === "sign") expect(Boolean(v.spec.letters || v.spec.symbol), q.q).toBe(true);
    }
  });
  it("merge sign shows the merging arrow", () => {
    const v = questionVisual({ q: "A yellow diamond sign showing an arrow joining a straight line warns you about…" });
    expect(v?.kind === "sign" && v.spec.symbol).toBe("merge");
  });
  it("turn-signal timing questions get no traffic light", () => {
    expect(questionVisual({ q: "How far before a turn must you signal?" })).toBeNull();
  });
  it("railroad flashing red shows crossing lights, not a sign", () => {
    expect(questionVisual({ q: "A flashing red light at a railroad crossing means…", sign: { shape: "circle", fill: "#dc2626", stroke: "#fff", letters: "RR" } })?.kind).toBe("signal");
  });
});
