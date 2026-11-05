import { sendTemplateEmail } from '@/lib/email-templates/send-email'

/**
 * Server-only: sends a registered app email through Lovable's managed email API
 * and records the outcome in the existing email_send_log table.
 * Use from webhooks, server functions, or other trusted server contexts.
 */
export async function sendLoggedTemplateEmail(params: {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
}): Promise<{ success: boolean; reason?: string }> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const log = async (status: 'sent' | 'suppressed' | 'failed', error_message?: string) => {
    const { error } = await supabaseAdmin.from('email_send_log').insert({
      message_id: null,
      template_name: params.templateName,
      recipient_email: params.recipientEmail,
      status,
      ...(error_message ? { error_message } : {}),
    })
    if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
  }

  try {
    const result = await sendTemplateEmail(params.templateName, params.recipientEmail, {
      templateData: params.templateData,
      idempotencyKey: params.idempotencyKey,
    })
    if (result.sent) {
      await log('sent')
      return { success: true }
    }
    await log('suppressed')
    return { success: false, reason: 'email_suppressed' }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('App email send failed', { template: params.templateName, message })
    await log('failed', message.slice(0, 500))
    return { success: false, reason: 'send_failed' }
  }
}
