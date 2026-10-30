import { describe, it, expect } from "vitest";
import { getStatePack } from "@/data/dmv";
import { buildExamPool, directQuestion, examSummary, examHistoryStats, mayAnswerExam } from "./mock-exam";

describe("mock exam rules", () => {
  it("uses 46 California questions and requires 38 correct, displayed as 83%", () => {
    expect(getStatePack("California").rules).toMatchObject({ questionsCount: 46, minCorrectToPass: 38, passingScorePct: 83 });
    const questions = Array.from({ length: 46 }, () => ({ q: "q", options: ["a", "b"], correct: 0, explanation: "", topic: "signs" as const }));
    expect(examSummary(questions, Array.from({ length: 46 }, (_, i) => i < 38 ? 0 : 1), 38)).toMatchObject({ correct: 38, pct: 83, passed: true });
    expect(examSummary(questions, Array.from({ length: 46 }, (_, i) => i < 37 ? 0 : 1), 38).passed).toBe(false);
  });
  it("marks topic scores below 80% as needing work, not 80%", () => {
    const questions = Array.from({ length: 5 }, () => ({ q: "q", options: ["a", "b"], correct: 0, explanation: "", topic: "signs" as const }));
    expect(examSummary(questions, [0, 0, 0, 1, 1], 4).topics[0]).toMatchObject({ pct: 60, needsWork: true });
    expect(examSummary(questions, [0, 0, 0, 0, 1], 4).topics[0]).toMatchObject({ pct: 80, needsWork: false });
  });
  it("keeps the 20-question lifetime limit and does not recharge changed answers", () => {
    expect(mayAnswerExam(false, 19, null)).toBe(true);
    expect(mayAnswerExam(false, 20, null)).toBe(false);
    expect(mayAnswerExam(false, 20, 0)).toBe(true);
    expect(mayAnswerExam(true, 20, null)).toBe(true);
  });
  it("aggregates every saved attempt, in time order, scoped to state", () => {
    const rows = [{ id: "a", score_pct: 91, state: "California", created_at: "2026-10-01" }, { id: "b", score_pct: 87, state: "California", created_at: "2026-10-02" }, { id: "c", score_pct: 100, state: "Texas", created_at: "2026-10-03" }];
    expect(examHistoryStats(rows, "California")).toEqual({ best: 91, last: 87, attempts: 2 });
    expect(examHistoryStats([], "California")).toEqual({ best: null, last: null, attempts: null });
  });
  it("keeps every exam question topic-tagged and removes filler without altering answers", () => {
    const pool = buildExamPool("California");
    expect(pool.length).toBeGreaterThanOrEqual(46);
    expect(pool.every(q => !/During your morning drive|Imagine you are behind|While preparing for/i.test(q.q))).toBe(true);
    const original = getStatePack("California").questions.find(q => /Solid white line between lanes/.test(q.q));
    const normalized = pool.find(q => /Solid white line between lanes/.test(q.q));
    expect(original).toBeDefined();
    expect(normalized?.options[normalized.correct]).toBe(original?.options[original.correct]);
    expect(pool.every(q => q.correct >= 0 && q.correct < q.options.length)).toBe(true);
  });
});