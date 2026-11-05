import { Text } from '@react-email/components'
import { ActionButton, WaitlistEmailLayout, noteStyle, waitlistTextStyle } from './waitlist-layout'

interface MagicLinkEmailProps { siteName?: string; confirmationUrl: string }

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <WaitlistEmailLayout preview="Your Drivable sign-in link" title="Sign in to Drivable">
    <Text style={waitlistTextStyle}>Click below to sign in to Drivable. No password needed.</Text>
    <ActionButton href={confirmationUrl} label="Sign in" />
    <Text style={noteStyle}>This link works once and expires soon. If you didn't request it, you can ignore this email.</Text>
  </WaitlistEmailLayout>
)
export default MagicLinkEmail
