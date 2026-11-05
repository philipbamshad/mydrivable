import { Text } from '@react-email/components'
import { ActionButton, WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout'

interface InviteEmailProps { siteName?: string; siteUrl?: string; confirmationUrl: string }

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <WaitlistEmailLayout preview="You've been invited to Drivable" title="You've been invited">
    <Text style={waitlistTextStyle}>You've been invited to join Drivable, state-specific permit test prep with full-length mock exams and an AI coach built on your official DMV handbook.</Text>
    <ActionButton href={confirmationUrl} label="Accept invite" />
  </WaitlistEmailLayout>
)
export default InviteEmail
