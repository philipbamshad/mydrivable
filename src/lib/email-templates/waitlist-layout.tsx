import { Body, Container, Head, Heading, Html, Img, Preview, Text } from '@react-email/components';
import type { ReactNode } from 'react';

export function WaitlistEmailLayout({ preview, title, children }: { preview: string; title: string; children: ReactNode }) {
  return <Html lang="en"><Head /><Preview>{preview}</Preview><Body style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Arial, Helvetica, sans-serif' }}><Container style={{ maxWidth: '560px', padding: '32px 24px', margin: '0 auto' }}><Img src="https://mydrivable.com/favicon.png" alt="Drivable" width="56" height="56" /><Text style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Drivable</Text><Heading style={{ fontSize: '24px', lineHeight: '32px', color: '#0f172a' }}>{title}</Heading>{children}</Container></Body></Html>;
}

export const waitlistTextStyle = { fontSize: '16px', lineHeight: '26px', color: '#334155' };