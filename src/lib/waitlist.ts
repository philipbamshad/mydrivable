import { z } from 'zod';

export const WAITLIST_LIMIT = 3;
export const WAITLIST_WINDOW_MS = 60 * 60 * 1000;
export const waitlistEmailSchema = z.string().trim().toLowerCase().email('Enter a valid email').max(255, 'Email is too long');
export const waitlistSchema = z.object({ email: waitlistEmailSchema, website: z.string().max(255).default('') });
export function visitorLimited(submissions: number, startedAt: number, now: number) {
  return now - startedAt < WAITLIST_WINDOW_MS && submissions >= WAITLIST_LIMIT;
}

export async function deliverWaitlistEmails(
  signup: { id: string; email: string; createdAt: string },
  send: (payload: { templateName: string; recipientEmail: string; idempotencyKey: string; templateData: Record<string, string> }) => Promise<void>,
  log: (template: string) => void,
) {
  await Promise.all(['waitlist-confirmation', 'new-waitlist-signup'].map(async templateName => {
    try {
      await send({ templateName, recipientEmail: signup.email, idempotencyKey: `${templateName}-${signup.id}`, templateData: { email: signup.email, signupTime: signup.createdAt } });
    } catch { log(templateName); }
  }));
}