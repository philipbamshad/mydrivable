import { Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout';

function NewWaitlistSignup({ email, signupTime }: { email?: string; signupTime?: string }) {
  return <WaitlistEmailLayout preview="A new visitor joined the Drivable waitlist." title="New waitlist signup"><Text style={waitlistTextStyle}>Email: {email ?? 'Unavailable'}</Text><Text style={waitlistTextStyle}>Signup time (UTC): {signupTime ?? 'Unavailable'}</Text></WaitlistEmailLayout>;
}
export const template = { component: NewWaitlistSignup, subject: 'New Drivable waitlist signup', displayName: 'New waitlist signup', to: 'philipbamshad@gmail.com', previewData: { email: 'alex@example.com', signupTime: '2026-11-03T22:25:00Z' } } satisfies TemplateEntry;