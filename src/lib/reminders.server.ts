import { PILLAR_META } from '@/data/dmv/practice-bank'
import { sendLoggedTemplateEmail } from '@/lib/email/send-transactional.server'
import { REMINDER_HOUR, dueReminder, formatTestDate, localDate, localHour, safeTimezone } from './reminder-schedule'

export type ReminderRun = { checked: number; sent: { email: string; kind: '7d' | '1d'; testDate: string }[]; failed: { email: string; kind: string }[] }

/** The daily reminder job. Scheduled runs only touch users whose local time is 9 AM; manual runs (force) skip the hour check. */
export async function runReminderJob({ force = false, now = new Date() }: { force?: boolean; now?: Date } = {}): Promise<ReminderRun> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data: rows, error } = await supabaseAdmin.from('user_profiles')
    .select('user_id, active_state, target_date, timezone, email_reminders, reminder_7d_sent_for_date, reminder_1d_sent_for_date')
    .not('target_date', 'is', null).eq('email_reminders', true)
  if (error) throw new Error(`Could not load profiles: ${error.message}`)
  const run: ReminderRun = { checked: rows?.length ?? 0, sent: [], failed: [] }

  for (const row of rows ?? []) {
    const tz = safeTimezone(row.timezone)
    if (!force && localHour(now, tz) !== REMINDER_HOUR) continue
    const target = row.target_date as string
    const kind = dueReminder({ targetDate: target, today: localDate(now, tz), sent7For: row.reminder_7d_sent_for_date, sent1For: row.reminder_1d_sent_for_date, enabled: row.email_reminders })
    if (!kind) continue

    const { data: u } = await supabaseAdmin.auth.admin.getUserById(row.user_id)
    const email = u?.user?.email
    if (!email || !u.user.email_confirmed_at) continue

    // Claim the send first so overlapping runs can never send twice.
    const column = kind === '7d' ? 'reminder_7d_sent_for_date' : 'reminder_1d_sent_for_date'
    const previous = kind === '7d' ? row.reminder_7d_sent_for_date : row.reminder_1d_sent_for_date
    const { data: claimed } = await supabaseAdmin.from('user_profiles').update({ [column]: target })
      .eq('user_id', row.user_id).eq('target_date', target)
      .or(`${column}.is.null,${column}.neq.${target}`).select('user_id')
    if (!claimed?.length) continue

    let weakestTopic: string | undefined
    if (kind === '7d') {
      const { data: topics } = await supabaseAdmin.from('test_hub_progress').select('topic, last_score')
        .eq('user_id', row.user_id).eq('state', row.active_state).not('last_score', 'is', null)
        .order('last_score', { ascending: true }).limit(1)
      const t = topics?.[0]?.topic as keyof typeof PILLAR_META | undefined
      if (t && PILLAR_META[t] && (topics?.[0]?.last_score ?? 100) < 100) weakestTopic = PILLAR_META[t].title
    }

    const result = await sendLoggedTemplateEmail({
      templateName: kind === '7d' ? 'test-in-7-days' : 'test-tomorrow',
      recipientEmail: email,
      templateData: kind === '7d' ? { testDate: formatTestDate(target), ...(weakestTopic ? { weakestTopic } : {}) } : {},
      idempotencyKey: `reminder-${kind}-${row.user_id}-${target}`,
    })
    if (result.success || result.reason === 'email_suppressed') {
      if (result.success) run.sent.push({ email, kind, testDate: target })
    } else {
      await supabaseAdmin.from('user_profiles').update({ [column]: previous }).eq('user_id', row.user_id)
      run.failed.push({ email, kind })
    }
  }
  return run
}
