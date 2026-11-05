// Pure date rules for DMV test-date reminder emails.
export const DEFAULT_TIMEZONE = "America/Los_Angeles";
export const REMINDER_HOUR = 9;

export function safeTimezone(tz: string | null | undefined): string {
  if (!tz) return DEFAULT_TIMEZONE;
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return tz; } catch { return DEFAULT_TIMEZONE; }
}

function parts(now: Date, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: safeTimezone(tz), year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(now).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}
export const localDate = (now: Date, tz: string) => parts(now, tz).date;
export const localHour = (now: Date, tz: string) => parts(now, tz).hour;

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

export type ReminderKind = "7d" | "1d";

/** Which reminder (if any) is due today for this user. Already-sent markers are per target date. */
export function dueReminder(p: { targetDate: string | null; today: string; sent7For: string | null; sent1For: string | null; enabled: boolean }): ReminderKind | null {
  if (!p.enabled || !p.targetDate) return null;
  const days = daysBetween(p.today, p.targetDate);
  if (days === 7 && p.sent7For !== p.targetDate) return "7d";
  if (days === 1 && p.sent1For !== p.targetDate) return "1d";
  return null;
}

export function formatTestDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
