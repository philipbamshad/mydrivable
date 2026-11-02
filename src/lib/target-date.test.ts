import { expect, it } from "vitest";
import { targetDateHasPassed } from "./target-date";
it("shows the update notice only after the local target day", () => {
  const today = new Date(2026, 10, 2, 12);
  expect(targetDateHasPassed("2026-11-01", today)).toBe(true);
  expect(targetDateHasPassed("2026-11-02", today)).toBe(false);
  expect(targetDateHasPassed("2026-11-03", today)).toBe(false);
  expect(targetDateHasPassed(null, today)).toBe(false);
});