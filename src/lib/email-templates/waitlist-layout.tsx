import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';

const NAVY = '#172036';

export function WaitlistEmailLayout({ preview, title, children }: { preview: string; title: string; children: ReactNode }) {
  return <Html lang="en"><Head /><Preview>{preview}</Preview><Body style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Arial, Helvetica, sans-serif' }}><Container style={{ maxWidth: '560px', padding: '32px 24px', margin: '0 auto' }}><Img src="https://mydrivable.com/favicon.png" alt="Drivable" width="56" height="56" /><Text style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Drivable</Text><Heading style={{ fontSize: '24px', lineHeight: '32px', color: '#0f172a' }}>{title}</Heading>{children}<Hr style={{ borderColor: '#e2e8f0', margin: '32px 0 16px' }} /><Text style={{ fontSize: '12px', lineHeight: '20px', color: '#64748b', margin: 0 }}>Questions? Contact <Link href="mailto:support@mydrivable.com" style={{ color: '#64748b', textDecoration: 'underline' }}>support@mydrivable.com</Link> · © Drivable · Drive safe. Drive legal.</Text></Container></Body></Html>;
}

export const waitlistTextStyle = { fontSize: '16px', lineHeight: '26px', color: '#334155' };
export const noteStyle = { fontSize: '13px', lineHeight: '20px', color: '#64748b' };
export const greyBox = { backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '16px 20px', margin: '16px 0' };

export function ActionButton({ href, label }: { href: string; label: string }) {
  return <Section style={{ margin: '24px 0 8px' }}>
    <Button href={href} style={{ backgroundColor: NAVY, color: '#ffffff', fontSize: '15px', fontWeight: 700, borderRadius: '999px', padding: '14px 28px', textDecoration: 'none' }}>{label}</Button>
    <Text style={{ ...noteStyle, marginTop: '16px' }}>Button not working? Copy this link into your browser:<br /><Link href={href} style={{ color: NAVY, wordBreak: 'break-all' }}>{href}</Link></Text>
  </Section>;
}
