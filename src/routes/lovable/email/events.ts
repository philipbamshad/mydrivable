import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'

type Reason = 'bounce' | 'complaint' | 'unsubscribe'
const STATUS = { bounce: 'bounced', complaint: 'complained', unsubscribe: 'suppressed' } as const
const MESSAGE = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
} as const

// Notification-only record in the existing tables; Lovable enforces suppression at send time.
async function record(eventId: string, recipient: string, messageId: string | null | undefined, reason: Reason) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const email = recipient.toLowerCase()
  const { error: suppressError } = await supabaseAdmin
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })
  if (suppressError) {
    console.error('Failed to record suppression', { event_id: eventId, code: suppressError.code, message: suppressError.message })
    throw new Error('suppression write failed')
  }
  const { error: logError } = await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId ?? null,
    template_name: 'system',
    recipient_email: email,
    status: STATUS[reason],
    error_message: MESSAGE[reason],
    metadata: null,
  })
  if (logError) {
    console.error('Failed to log email event', { event_id: eventId, code: logError.code, message: logError.message })
    throw new Error('send log write failed')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': (event) => record(event.event_id, event.data.recipient, event.data.message_id, 'bounce'),
            'email.complaint': (event) => record(event.event_id, event.data.recipient, event.data.message_id, 'complaint'),
            'email.unsubscribed': (event) => record(event.event_id, event.data.recipient, event.data.message_id, 'unsubscribe'),
          },
        })
        return handler(request)
      },
    },
  },
})
