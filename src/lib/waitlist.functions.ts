import { createServerFn } from '@tanstack/react-start';
import { getRequest, getCookie, setCookie } from '@tanstack/react-start/server';
import { deliverWaitlistEmails, waitlistSchema } from './waitlist';

export const joinWaitlist = createServerFn({ method: 'POST' }).inputValidator(waitlistSchema).handler(async ({ data }) => {
  const request = getRequest();
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) throw new Error('Please submit using the Drivable waitlist form.');
  if (data.website) return { result: 'joined' as const };
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!serviceKey) throw new Error('Unable to join right now. Please try again.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(serviceKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sign = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))).map(b => b.toString(16).padStart(2, '0')).join('');
  const cookie = getCookie('drivable_waitlist_visitor') ?? '';
  const [id, signature] = cookie.split('.');
  const validId = id && /^[a-f0-9-]{36}$/.test(id) && signature === await sign(id) ? id : crypto.randomUUID();
  setCookie('drivable_waitlist_visitor', `${validId}.${await sign(validId)}`, { httpOnly: true, secure: origin.startsWith('https:'), sameSite: 'lax', path: '/', maxAge: 3600 });
  // Only the hosting edge's IP header is trusted; arbitrary forwarded headers are not.
  const visitorHash = await sign(request.headers.get('cf-connecting-ip') ?? validId);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: rows, error } = await supabaseAdmin.rpc('join_waitlist_checked', { p_email: data.email, p_visitor_hash: visitorHash });
  if (error) { console.error('Waitlist save failed', { code: error.code }); throw new Error('Unable to join right now. Please try again.'); }
  const row = rows?.[0];
  if (!row) throw new Error('Unable to join right now. Please try again.');
  if (row.result === 'duplicate') return { result: 'duplicate' as const };
  if (row.result === 'limited') throw new Error('You can submit up to 3 times per hour. Please try again later.');
  if (row.signup_id && row.signup_time) {
    await deliverWaitlistEmails({ id: row.signup_id, email: data.email, createdAt: row.signup_time }, async payload => {
      const { sendLoggedTemplateEmail } = await import('@/lib/email/send-transactional.server');
      const result = await sendLoggedTemplateEmail(payload);
      if (!result.success && result.reason !== 'email_suppressed') throw new Error('Email not sent');
    }, template => console.error('Waitlist email failed', { signupId: row.signup_id, template }));
  }
  return { result: 'joined' as const };
});