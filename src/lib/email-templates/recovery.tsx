import { Text } from '@react-email/components'
import { ActionButton, WaitlistEmailLayout, noteStyle, waitlistTextStyle } from './waitlist-layout'

interface RecoveryEmailProps { siteName?: string; confirmationUrl: string }

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <WaitlistEmailLayout preview="Reset your Drivable password" title="Reset your password">
    <Text style={waitlistTextStyle}>We received a request to reset your password. Click below to choose a new one.</Text>
    <ActionButton href={confirmationUrl} label="Reset password" />
    <Text style={noteStyle}>This link expires soon. If you didn't request a reset, you can ignore this email. Your password won't change.</Text>
  </WaitlistEmailLayout>
)
export default RecoveryEmail
