import { Text } from '@react-email/components'
import { ActionButton, WaitlistEmailLayout, noteStyle, waitlistTextStyle } from './waitlist-layout'

interface SignupEmailProps { siteName?: string; siteUrl?: string; recipient?: string; confirmationUrl: string }

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <WaitlistEmailLayout preview="Confirm your email for Drivable" title="Confirm your email">
    <Text style={waitlistTextStyle}>Welcome to Drivable. Confirm your email to start practicing for your permit test.</Text>
    <ActionButton href={confirmationUrl} label="Confirm email" />
    <Text style={noteStyle}>If you didn't create a Drivable account, you can ignore this email.</Text>
  </WaitlistEmailLayout>
)
export default SignupEmail
