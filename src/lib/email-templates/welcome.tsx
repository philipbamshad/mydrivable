import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ActionButton, WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout'

const step = { ...waitlistTextStyle, margin: '4px 0' }

const WelcomeEmail = () => (
  <WaitlistEmailLayout preview="Welcome to Drivable" title="Welcome to Drivable">
    <Text style={waitlistTextStyle}>You're all set to prepare for your permit test and driving test. Here's how to get started:</Text>
    <Text style={step}>1. Set your state and DMV test date.</Text>
    <Text style={step}>2. Take your first full-length mock exam.</Text>
    <Text style={step}>3. Practice your weakest topic in the Permit Test Hub.</Text>
    <Text style={step}>4. Practice real-world decisions in the Driving Test Simulation.</Text>
    <ActionButton href="https://mydrivable.com/app" label="Start practicing" />
  </WaitlistEmailLayout>
)

export const template = { component: WelcomeEmail, subject: 'Welcome to Drivable', displayName: 'Welcome', previewData: {} } satisfies TemplateEntry
