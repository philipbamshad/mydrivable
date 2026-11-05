import { Text } from '@react-email/components'
import { ActionButton, WaitlistEmailLayout, noteStyle, waitlistTextStyle } from './waitlist-layout'

interface EmailChangeEmailProps { siteName?: string; oldEmail?: string; email?: string; newEmail?: string; confirmationUrl: string }

export const EmailChangeEmail = ({ confirmationUrl }: EmailChangeEmailProps) => (
  <WaitlistEmailLayout preview="Confirm your new email for Drivable" title="Confirm your new email">
    <Text style={waitlistTextStyle}>Confirm this new email address for your Drivable account.</Text>
    <ActionButton href={confirmationUrl} label="Confirm new email" />
    <Text style={noteStyle}>If you didn't request this change, contact support@mydrivable.com right away.</Text>
  </WaitlistEmailLayout>
)
export default EmailChangeEmail
