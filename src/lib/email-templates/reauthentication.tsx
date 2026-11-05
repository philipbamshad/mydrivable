import { Text } from '@react-email/components'
import { WaitlistEmailLayout, greyBox, noteStyle, waitlistTextStyle } from './waitlist-layout'

interface ReauthenticationEmailProps { token: string }

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <WaitlistEmailLayout preview="Your Drivable verification code" title="Your verification code">
    <Text style={waitlistTextStyle}>Enter this code to confirm it's you:</Text>
    <Text style={{ ...greyBox, fontSize: '32px', fontWeight: 700, letterSpacing: '6px', textAlign: 'center' as const, color: '#0f172a', fontFamily: "'Courier New', monospace" }}>{token}</Text>
    <Text style={noteStyle}>This code expires soon. If you didn't request it, contact support@mydrivable.com.</Text>
  </WaitlistEmailLayout>
)
export default ReauthenticationEmail
