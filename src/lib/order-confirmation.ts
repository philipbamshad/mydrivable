/** Only Stripe-confirmed, environment-matched payments can grant access or send receipts. */
export function isConfirmedPayment(session: { mode?: string; payment_status?: string; livemode?: boolean }, environment: 'sandbox' | 'live') {
  return session.mode === 'payment' && session.payment_status === 'paid' && session.livemode === (environment === 'live')
}

export function orderConfirmationDetails(session: { id: string; amount_total?: number | null; currency?: string | null; created: number }, charge: { created?: number; receipt_url?: string | null; payment_method_details?: { card?: { brand?: string; last4?: string } | null } | null }) {
  const card = charge.payment_method_details?.card
  const brands: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover', diners: 'Diners Club', jcb: 'JCB', unionpay: 'UnionPay' }
  return {
    amountPaid: new Intl.NumberFormat('en-US', { style: 'currency', currency: (session.currency || 'usd').toUpperCase() }).format((session.amount_total ?? 0) / 100),
    orderDate: new Date((charge.created ?? session.created) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' }),
    orderNumber: `DRV-${session.id.slice(-8).toUpperCase()}`,
    paymentMethod: card?.brand && /^\d{4}$/.test(card.last4 ?? '') ? `${brands[card.brand] ?? 'Card'} •••• ${card.last4}` : undefined,
    receiptUrl: charge.receipt_url?.startsWith('https://pay.stripe.com/receipts/') ? charge.receipt_url : undefined,
  }
}