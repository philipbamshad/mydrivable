import { describe, expect, it } from "vitest";
import { dueReminder, localDate, localHour } from "./reminder-schedule";

const base = { today: "2026-11-05", sent7For: null, sent1For: null, enabled: true };

describe("test date reminders", () => {
  it("sends the 7-day reminder exactly 7 days before", () => expect(dueReminder({ ...base, targetDate: "2026-11-12" })).toBe("7d"));
  it("does not resend the 7-day reminder for the same date", () => expect(dueReminder({ ...base, targetDate: "2026-11-12", sent7For: "2026-11-12" })).toBeNull());
  it("resends after the date changes", () => expect(dueReminder({ ...base, targetDate: "2026-11-12", sent7For: "2026-11-10" })).toBe("7d"));
  it("sends the 1-day reminder the day before", () => expect(dueReminder({ ...base, targetDate: "2026-11-06" })).toBe("1d"));
  it("sends nothing for past dates", () => expect(dueReminder({ ...base, targetDate: "2026-11-01" })).toBeNull());
  it("sends nothing 3 days away", () => expect(dueReminder({ ...base, targetDate: "2026-11-08" })).toBeNull());
  it("sends nothing when reminders are off", () => expect(dueReminder({ ...base, targetDate: "2026-11-12", enabled: false })).toBeNull());
  it("uses the user's time zone", () => {
    const now = new Date("2026-11-05T17:00:00Z");
    expect(localDate(now, "America/Los_Angeles")).toBe("2026-11-05");
    expect(localHour(now, "America/Los_Angeles")).toBe(9);
    expect(localDate(new Date("2026-11-05T03:00:00Z"), "America/Los_Angeles")).toBe("2026-11-04");
  });
});
