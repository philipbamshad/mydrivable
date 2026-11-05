import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ActionButton, WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout'

interface Props { testDate?: string; weakestTopic?: string }

const TestIn7Days = ({ testDate, weakestTopic }: Props) => (
  <WaitlistEmailLayout preview="Your DMV test is in 7 days." title="Your DMV test is in 7 days">
    <Text style={waitlistTextStyle}>Your DMV test is on {testDate || 'your scheduled date'}. Now's a great time to take a full-length mock exam and see where you stand.</Text>
    {weakestTopic && <Text style={waitlistTextStyle}>Your weakest topic: {weakestTopic}. Practice it in the Permit Test Hub.</Text>}
    <ActionButton href="https://mydrivable.com/app?tab=state-exam" label="Take a mock exam" />
  </WaitlistEmailLayout>
)

export const template = { component: TestIn7Days, subject: 'Your DMV test is in 7 days.', displayName: 'Test in 7 days', previewData: { testDate: 'Thursday, November 12, 2026', weakestTopic: 'Intersections & Right of Way' } } satisfies TemplateEntry
