import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ActionButton, WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout'

const LaunchAnnouncement = () => (
  <WaitlistEmailLayout preview="Drivable is live" title="Drivable is live">
    <Text style={waitlistTextStyle}>Thanks for joining the waitlist. Drivable is now open, with state-specific practice, full-length mock permit exams, a driving test simulation, and an AI coach built on your official DMV handbook.</Text>
    <ActionButton href="https://mydrivable.com/auth" label="Create your account" />
    <Text style={waitlistTextStyle}>— The Drivable team</Text>
  </WaitlistEmailLayout>
)

export const template = {
  component: LaunchAnnouncement,
  subject: 'Drivable is live',
  displayName: 'Launch announcement',
  previewData: {},
} satisfies TemplateEntry
