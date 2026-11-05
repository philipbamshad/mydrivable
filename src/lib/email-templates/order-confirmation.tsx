import { Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ActionButton, WaitlistEmailLayout, greyBox, noteStyle, waitlistTextStyle } from './waitlist-layout'

interface OrderConfirmationProps { name?: string; appUrl?: string; orderDate?: string; orderNumber?: string }

const UNLOCKED = [
  'Unlimited full-length state-specific Mock Permit Exams',
  'Unlimited AI Coach chat synced to your DMV handbook',
  'Unlimited practice in all 4 Permit Test Hub topics, including Review missed questions',
  'Unlimited Driving Test Simulation',
  'All 50 state rule packs',
]
const row = { fontSize: '14px', lineHeight: '22px', color: '#334155', margin: 0 }

const OrderConfirmationEmail = ({ appUrl, orderDate, orderNumber }: OrderConfirmationProps) => (
  <WaitlistEmailLayout preview="Your Drivable Pro Pass is active" title="Your Pro Pass is active">
    <Text style={waitlistTextStyle}>Thanks for your purchase. Your Pro Pass is now active, with lifetime access to everything Drivable offers.</Text>
    <Section style={greyBox}>
      <Text style={{ ...row, fontWeight: 700, color: '#0f172a' }}>Pro Pass · One-time payment · $9.00</Text>
      {orderDate && <Text style={row}>Order date: {orderDate}</Text>}
      {orderNumber && <Text style={row}>Order number: {orderNumber}</Text>}
    </Section>
    <Text style={{ ...waitlistTextStyle, marginBottom: '4px', fontWeight: 700 }}>What's unlocked</Text>
    {UNLOCKED.map(item => <Text key={item} style={{ ...row, margin: '2px 0' }}>• {item}</Text>)}
    <ActionButton href={appUrl || 'https://mydrivable.com/app'} label="Start practicing" />
    <Text style={noteStyle}>This was a one-time payment. You won't be charged again.</Text>
  </WaitlistEmailLayout>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: 'Your Drivable Pro Pass is active',
  displayName: 'Pro Pass order confirmation',
  previewData: { appUrl: 'https://mydrivable.com/app', orderDate: 'November 5, 2026', orderNumber: 'DRV-3F9A2C7B' },
} satisfies TemplateEntry
