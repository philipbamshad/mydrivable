import { Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout';

function WaitlistConfirmation() {
  return <WaitlistEmailLayout preview="Thanks for joining the Drivable waitlist." title="You're on the Drivable waitlist"><Text style={waitlistTextStyle}>Thanks for joining the Drivable waitlist. We'll email you as soon as Drivable launches, with preparation for your permit test and driving test, state-specific practice, full-length mock permit exams, a real-world Driving Test Simulation, and an AI coach built on your official DMV handbook.</Text><Text style={waitlistTextStyle}>— The Drivable team</Text></WaitlistEmailLayout>;
}
export const template = { component: WaitlistConfirmation, subject: "You're on the Drivable waitlist", displayName: 'Waitlist confirmation', previewData: {} } satisfies TemplateEntry;