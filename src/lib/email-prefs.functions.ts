import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAllowlisted } from './allowlist-middleware'

/** Saves the browser time zone and sends the welcome email once, after the account's email is confirmed. */
export const syncAccount = createServerFn({ method: 'POST' })
  .middleware([requireAllowlisted])
  .inputValidator(z.object({ timezone: z.string().min(1).max(64) }))
  .handler(async ({ data, context }) => {
    const { safeTimezone } = await import('./reminder-schedule')
    const tz = safeTimezone(data.timezone)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: existing } = await supabaseAdmin.from('user_profiles').select('user_id').eq('user_id', context.userId).maybeSingle()
    if (existing) await supabaseAdmin.from('user_profiles').update({ timezone: tz }).eq('user_id', context.userId)
    else await supabaseAdmin.from('user_profiles').insert({ user_id: context.userId, timezone: tz })

    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId)
    const email = u?.user?.email
    if (!email || !u?.user?.email_confirmed_at) return { welcomeSent: false }
    const { data: claimed } = await supabaseAdmin.from('user_profiles').update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('user_id', context.userId).is('welcome_email_sent_at', null).select('user_id')
    if (!claimed?.length) return { welcomeSent: false }
    const { sendLoggedTemplateEmail } = await import('@/lib/email/send-transactional.server')
    const result = await sendLoggedTemplateEmail({ templateName: 'welcome', recipientEmail: email, idempotencyKey: `welcome-${context.userId}` })
    if (!result.success && result.reason !== 'email_suppressed') {
      await supabaseAdmin.from('user_profiles').update({ welcome_email_sent_at: null }).eq('user_id', context.userId)
    }
    return { welcomeSent: result.success }
  })

export const getEmailReminders = createServerFn({ method: 'GET' })
  .middleware([requireAllowlisted])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from('user_profiles').select('email_reminders').eq('user_id', context.userId).maybeSingle()
    return { enabled: data?.email_reminders ?? true }
  })

export const setEmailReminders = createServerFn({ method: 'POST' })
  .middleware([requireAllowlisted])
  .inputValidator(z.object({ enabled: z.boolean() }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from('user_profiles').update({ email_reminders: data.enabled }).eq('user_id', context.userId)
    if (error) throw new Error('Could not save your email setting.')
    return { enabled: data.enabled }
  })

export const runReminderJobNow = createServerFn({ method: 'POST' })
  .middleware([requireAllowlisted])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc('is_admin')
    if (admin !== true) throw new Error('Forbidden')
    const { runReminderJob } = await import('./reminders.server')
    return runReminderJob({ force: true })
  })

const TESTABLE_TEMPLATES = [
  'waitlist-confirmation',
  'new-waitlist-signup',
  'order-confirmation',
  'welcome',
  'test-in-7-days',
  'test-tomorrow',
  'launch-announcement',
] as const

/** Admin-only: sends one app email template (or all of them) to the admin's own inbox for review. */
export const sendTestEmails = createServerFn({ method: 'POST' })
  .middleware([requireAllowlisted])
  .inputValidator(z.object({ templateName: z.enum(TESTABLE_TEMPLATES).optional() }))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc('is_admin')
    if (admin !== true) throw new Error('Forbidden')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId)
    const email = u?.user?.email
    if (!email) throw new Error('No admin email found')
    const { TEMPLATES } = await import('@/lib/email-templates/registry')
    const { sendLoggedTemplateEmail } = await import('@/lib/email/send-transactional.server')
    const names = data.templateName ? [data.templateName] : [...TESTABLE_TEMPLATES]
    const results: { template: string; ok: boolean; reason?: string }[] = []
    for (const name of names) {
      const entry = TEMPLATES[name]
      if (!entry) { results.push({ template: name, ok: false, reason: 'not_registered' }); continue }
      const r = await sendLoggedTemplateEmail({
        templateName: name,
        recipientEmail: entry.to ?? email,
        templateData: entry.previewData ?? {},
        idempotencyKey: `test-${name}-${context.userId}-${Date.now()}`,
      })
      results.push({ template: name, ok: r.success, reason: r.reason })
    }
    return { sentTo: email, results }
  })

export const getAdminStatus = createServerFn({ method: 'GET' })
  .middleware([requireAllowlisted])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc('is_admin')
    return { admin: admin === true }
  })
