import * as React from 'react'
import { render } from '@react-email/render'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'mydrivable'
const SENDER_DOMAIN = 'notify.mydrivable.com'
const FROM_DOMAIN = 'mydrivable.com'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function resolveUnsubscribeToken(
  supabase: SupabaseClient<any, any>,
  normalizedEmail: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existing?.token && !existing.used_at) return existing.token as string
  if (existing?.used_at) return null

  const token = generateToken()
  await supabase
    .from('email_unsubscribe_tokens')
    .upsert(
      { token, email: normalizedEmail },
      { onConflict: 'email', ignoreDuplicates: true },
    )

  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalizedEmail)
    .maybeSingle()
  return (stored?.token as string) ?? null
}

/**
 * Enqueue a registered transactional email directly (server side, no user JWT).
 * Use from webhooks, cron, or other trusted server contexts.
 */
export async function enqueueTransactionalEmail(params: {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
}): Promise<{ success: boolean; reason?: string }> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('enqueueTransactionalEmail: missing env')
    return { success: false, reason: 'server_misconfigured' }
  }

  const template = TEMPLATES[params.templateName]
  if (!template) {
    console.error('enqueueTransactionalEmail: template not found', params.templateName)
    return { success: false, reason: 'template_not_found' }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const effectiveRecipient = template.to || params.recipientEmail
  if (!effectiveRecipient) return { success: false, reason: 'missing_recipient' }

  const normalizedEmail = effectiveRecipient.toLowerCase()
  const messageId = crypto.randomUUID()
  const idempotencyKey = params.idempotencyKey || messageId

  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()
  if (suppressed) {
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: params.templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
    })
    return { success: false, reason: 'email_suppressed' }
  }

  const unsubscribeToken = await resolveUnsubscribeToken(supabase, normalizedEmail)
  if (!unsubscribeToken) return { success: false, reason: 'unsubscribe_token_unavailable' }

  const templateData = params.templateData ?? {}
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const plainText = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: params.templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: plainText,
      purpose: 'transactional',
      label: params.templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('enqueueTransactionalEmail: enqueue failed', enqueueError)
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: params.templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return { success: false, reason: 'enqueue_failed' }
  }

  return { success: true }
}
