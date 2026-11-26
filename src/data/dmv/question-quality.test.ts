import { expect, it, vi } from "vitest";
import { getStatePack, ALL_STATES } from "./index";
import { buildPillarBanks } from "./practice-bank";
import { buildExamPool } from "@/lib/mock-exam";
import { shuffleAnswers } from "./question-generator";

it("randomizes correct multiple-choice positions while preserving the keyed answer", () => {
  const positions = new Set<number>();
  for (const random of [0, 0.4, 0.99]) {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(random);
    const q = shuffleAnswers({ q: "What must you do at a flashing red light?", options: ["Stop, then go when safe", "Slow without stopping", "Wait for a steady signal"], correct: 0, explanation: "Stop completely." });
    expect(q.options[q.correct]).toBe("Stop, then go when safe");
    positions.add(q.correct);
    spy.mockRestore();
  }
  expect(positions.size).toBe(3);
});
it("keeps all state question choices distinct with one keyed answer", () => {
  for (const state of ALL_STATES) {
    const banks = buildPillarBanks(state);
    for (const q of [...getStatePack(state).questions, ...Object.values(banks).flat()]) {
      expect(q.correct, q.q).toBeGreaterThanOrEqual(0);
      expect(q.options.length, `${state}: ${q.q}`).toBeLessThanOrEqual(4);
      expect(q.options.length, `${state}: ${q.q}`).toBeGreaterThanOrEqual(3);
      expect(q.options.some(o => /^(true|false|yes|no)$/i.test(o.trim())), `${state}: ${q.q}`).toBe(false);
      expect(q.options.some(o => /^(all|none) of the above$/i.test(o.trim())), `${state}: ${q.q}`).toBe(false);
      expect(q.options.some(o => /[{}]/.test(o)), `${state}: ${q.q}`).toBe(false);
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