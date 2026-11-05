import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ActionButton, WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout'

const TestTomorrow = () => (
  <WaitlistEmailLayout preview="Your permit test is tomorrow." title="Your permit test is tomorrow">
    <Text style={waitlistTextStyle}>Good luck on your DMV test tomorrow. Do a quick review of the topics most people miss, then get some rest.</Text>
    <ActionButton href="https://mydrivable.com/app?tab=test-hub" label="Quick review" />
  </WaitlistEmailLayout>
)

export const template = { component: TestTomorrow, subject: 'Your permit test is tomorrow.', displayName: 'Test tomorrow', previewData: {} } satisfies TemplateEntry
