import { describe, expect, it } from 'vitest';
import { deliverWaitlistEmails, visitorLimited, waitlistSchema } from './waitlist';

describe('waitlist rules', () => {
  it('normalizes valid email and rejects malformed email', () => {
    expect(waitlistSchema.parse({ email: '  Alex@Example.com ' }).email).toBe('alex@example.com');
    expect(waitlistSchema.safeParse({ email: 'bad-email' }).success).toBe(false);
  });
  it('limits at three submissions within one hour', () => {
    expect(visitorLimited(2, 0, 3599999)).toBe(false);
    expect(visitorLimited(3, 0, 3599999)).toBe(true);
  });
  it('allows a fresh hour', () => expect(visitorLimited(3, 0, 3600000)).toBe(false));
  it('attempts both event emails with unique event-derived keys', async () => {
    const sends: string[] = [];
    await deliverWaitlistEmails({ id: 'signup', email: 'alex@example.com', createdAt: 'now' }, async p => { sends.push(p.idempotencyKey); }, () => {});
    expect(sends).toEqual(['waitlist-confirmation-signup', 'new-waitlist-signup-signup']);
  });
  it('logs failure without throwing or preventing the other email', async () => {
    const logs: string[] = []; const sends: string[] = [];
    await deliverWaitlistEmails({ id: 'signup', email: 'alex@example.com', createdAt: 'now' }, async p => { sends.push(p.templateName); if (p.templateName === 'waitlist-confirmation') throw new Error('failed'); }, p => logs.push(p));
    expect(logs).toEqual(['waitlist-confirmation']); expect(sends).toHaveLength(2);
  });
});