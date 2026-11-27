import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ActionButton, WaitlistEmailLayout, waitlistTextStyle } from './waitlist-layout'

const step = { ...waitlistTextStyle, margin: '4px 0' }

const WelcomeEmail = () => (
  <WaitlistEmailLayout preview="Welcome to Drivable" title="Welcome to Drivable">
    <Text style={waitlistTextStyle}>You're all set to prepare for your permit test and driving test. Here's how to get started:</Text>
    <Text style={step}>1. Set your state and DMV test date.</Text>
    <Text style={step}>2. Take your 15-question sample exam.</Text>
    <Text style={step}>3. Try one 10-question quiz per topic in the Permit Test Hub.</Text>
    <Text style={step}>4. Try your free Driving Test Sim run (Beta) and 3 AI Coach questions a day.</Text>
    <Text style={step}>Pro Pass is $24 once: unlimited practice, full-length exams, missed-question review and a study plan. Pay once, use forever, no recurring fees.</Text>
    <ActionButton href="https://mydrivable.com/app" label="Start practicing" />
  </WaitlistEmailLayout>
)

export const template = { component: WelcomeEmail, subject: 'Welcome to Drivable', displayName: 'Welcome', previewData: {} } satisfies TemplateEntry
