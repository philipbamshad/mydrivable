import { createFileRoute } from '@tanstack/react-router'

// Called hourly by the database scheduler; each user is emailed at 9 AM in their own time zone.
export const Route = createFileRoute('/api/public/hooks/reminders')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? ''
        if (!token) return new Response('Unauthorized', { status: 401 })
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const { data } = await supabaseAdmin.from('cron_tokens').select('token').eq('name', 'reminders').maybeSingle()
        if (!data?.token || data.token.length !== token.length) return new Response('Unauthorized', { status: 401 })
        let diff = 0
        for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ data.token.charCodeAt(i)
        if (diff !== 0) return new Response('Unauthorized', { status: 401 })
        const { runReminderJob } = await import('@/lib/reminders.server')
        const run = await runReminderJob()
        return Response.json({ checked: run.checked, sent: run.sent.length, failed: run.failed.length })
      },
    },
  },
})
