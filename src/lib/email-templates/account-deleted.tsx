import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout'
const AccountDeletedEmail = () => (
  <WaitlistEmailLayout preview="Your Drivable account has been deleted" title="Account deleted">
    <Text style={waitlistTextStyle}>Your Drivable account, chat history, and study progress have been permanently deleted. You can no longer sign in with this account.</Text>
    <Text style={waitlistTextStyle}>If you did not request this, contact support@mydrivable.com.</Text>
  </WaitlistEmailLayout>
)
export const template = { component: AccountDeletedEmail, subject: 'Your Drivable account has been deleted', displayName: 'Account deleted', previewData: {} } satisfies TemplateEntry
