import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAllowlisted } from './allowlist-middleware'
export const deleteAccount = createServerFn({ method: 'POST' })
  .middleware([requireAllowlisted])
  .inputValidator(z.object({ confirmation: z.literal('DELETE') }))
  .handler(async ({ context }) => {
    const { data: verified, error: verificationError } = await context.supabase.auth.getUser()
    if (verificationError || verified.user?.id !== context.userId || !verified.user.email) throw new Error('Please sign in again before deleting your account.')
    const email = verified.user.email
    const { error: cleanupError } = await context.supabase.rpc('delete_own_app_data')
    if (cleanupError) throw new Error('Unable to delete your data. Please try again.')
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId)
    if (error) throw new Error('Your study data was removed, but account deletion failed. Please retry.')
    const { sendLoggedTemplateEmail } = await import('./email/send-transactional.server')
    const outcome = await sendLoggedTemplateEmail({ templateName: 'account-deleted', recipientEmail: email, idempotencyKey: `account-deleted-${context.userId}` })
    return { deleted: true, emailSent: outcome.success }
  })
