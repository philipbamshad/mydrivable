import { describe, expect, it } from "vitest";
import { DECISION_MS, FEEDBACK_MS, initialDriveStats, recordDecision, driveSummary } from "./simulation-game";

describe("driving game rules", () => {
  it("starts with three lives", () => expect(initialDriveStats().lives).toBe(3));
  it("allows four seconds to decide", () => {
    expect(DECISION_MS).toBe(4000);
    expect(recordDecision(initialDriveStats(), true, 4000).points).toBe(0);
    expect(recordDecision(initialDriveStats(), true, 3999).points).toBe(100);
  });
  it("advances feedback after six seconds", () => expect(FEEDBACK_MS).toBe(6000));
  it("awards 100 base points and at most 100 speed points", () => {
    expect(recordDecision(initialDriveStats(), true, 0).points).toBe(200);
    expect(recordDecision(initialDriveStats(), true, 800).points).toBe(180);
    expect(recordDecision(initialDriveStats(), true, -100).points).toBe(200);
  });
  it("adds 50 points at every third consecutive correct answer", () => {
    let stats = initialDriveStats();
    const points = [];
    for (let i = 0; i < 6; i += 1) {
      const result = recordDecision(stats, true, 2000);
      stats = result.stats;
      points.push(result.points);
    }
    expect(points).toEqual([150, 150, 200, 150, 150, 200]);
    expect(stats.bestStreak).toBe(6);
  });
  it("wrong answers lose a life, earn zero and reset the streak", () => {
    const before = recordDecision(initialDriveStats(), true, 800).stats;
    const result = recordDecision(before, false, 1000);
    expect(result.points).toBe(0);
    expect(result.stats.lives).toBe(2);
    expect(result.stats.streak).toBe(0);
    expect(result.stats.bestStreak).toBe(1);
  });
  it("timeouts lose a life and three timeouts exhaust all lives", () => {
    let stats = initialDriveStats();
    for (let i = 0; i < 3; i += 1) stats = recordDecision(stats, false, null).stats;
    expect(stats.lives).toBe(0);
    expect(stats.score).toBe(0);
    expect(stats.attempted).toBe(3);
  });
  it("calculates accuracy and mean reaction time excluding unanswered timeouts", () => {
    let stats = recordDecision(initialDriveStats(), true, 800).stats;
    stats = recordDecision(stats, false, 1200).stats;
    stats = recordDecision(stats, false, null).stats;
    expect(driveSummary(stats)).toEqual({ accuracy: 33, averageReaction: 1 });
  });
});