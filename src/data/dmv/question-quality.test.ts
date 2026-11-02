import { expect, it } from "vitest";
import { getStatePack, ALL_STATES } from "./index";
import { buildPillarBanks } from "./practice-bank";
import { buildExamPool } from "@/lib/mock-exam";
import { shuffleAnswers } from "./question-generator";

it("always places True before False while preserving the answer", () => {
  for (let i = 0; i < 20; i++) {
    const q = shuffleAnswers({ q: "A full stop is required.", options: ["False", "True"], correct: 1, explanation: "Stop completely." });
    expect(q.options).toEqual(["True", "False"]);
    expect(q.correct).toBe(0);
  }
});
it("keeps all state question choices distinct with one keyed answer", () => {
  for (const state of ALL_STATES) {
    const banks = buildPillarBanks(state);
    for (const q of [...getStatePack(state).questions, ...Object.values(banks).flat()]) {
      expect(q.correct, q.q).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.q).toBeLessThan(q.options.length);
      expect(new Set(q.options).size, `${state}: ${q.q}`).toBe(q.options.length);
    }
  }
});
it("removes the sealed-container ambiguity and contradictory downhill direction", () => {
  const pool = buildExamPool("California");
  const containers = pool.filter(q => /open container|opened.*alcohol/i.test(q.q));
  expect(containers.length).toBeGreaterThan(0);
  for (const q of containers) expect(q.options.some(o => /sealed|with a lid/i.test(o))).toBe(false);
  const downhill = pool.filter(q => /facing downhill with a curb/i.test(q.q));
  expect(downhill.length).toBeGreaterThan(0);
  for (const q of downhill) {
    expect(q.options[q.correct]).toBe("Toward the curb");
    expect(q.options).not.toContain("Turn wheels left toward curb");
  }
});