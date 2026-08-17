import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import type { TemplateEntry } from './registry'

interface OrderConfirmationProps {
  name?: string
  appUrl?: string
}

const OrderConfirmationEmail = ({
  name,
  appUrl = 'https://mydrivable.com/app',
}: OrderConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You are in. Welcome to Drivable Pro Pass, lifetime access.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Pro Pass 🚗</Heading>
        <Text style={text}>Hi,</Text>
        <Text style={text}>
          Thank you for purchasing the <strong>Drivable Pro Pass</strong>. Your
          account has been upgraded and you now have lifetime, unlimited access
          to everything Drivable offers.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>What is now unlocked</Text>
          <Text style={bullet}>• Unlimited full length mock permit exams</Text>
          <Text style={bullet}>• Targeted quizzes on every topic and weak spot</Text>
          <Text style={bullet}>• Personal AI permit coach, available anytime</Text>
          
        </Section>

        <Section style={{ textAlign: 'center', marginTop: '28px' }}>
          <Button style={button} href={appUrl}>
            Jump back in
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          This is a one time confirmation for your Pro Pass purchase. If you did
          not make this purchase, reply to this email and we will help right away.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: 'Your Drivable Pro Pass is active 🎉',
  displayName: 'Pro Pass order confirmation',
  previewData: { name: 'Alex', appUrl: 'https://mydrivable.com/app' },
} satisfies TemplateEntry

export default OrderConfirmationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: '#0f172a',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 24px',
}

const h1 = {
  fontSize: '26px',
  lineHeight: '32px',
  fontWeight: 700,
  margin: '0 0 16px',
  color: '#0f172a',
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#334155',
  margin: '0 0 14px',
}

const card = {
  backgroundColor: '#f1f5f9',
  borderRadius: '12px',
  padding: '20px 22px',
  margin: '24px 0 8px',
}

const cardTitle = {
  fontSize: '14px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#1e40af',
  margin: '0 0 10px',
}

const bullet = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#0f172a',
  margin: '4px 0',
}

const button = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  padding: '12px 22px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0 16px',
}

const footer = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#64748b',
  margin: 0,
}
