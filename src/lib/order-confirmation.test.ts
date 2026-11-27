import { describe, expect, it } from 'vitest'
import { isConfirmedPayment, isCurrentProPrice, orderConfirmationDetails } from './order-confirmation'

describe('Pro Pass confirmed payment receipts', () => {
  it('allows new checkouts only at 2400 cents USD as a one-time price', () => {
    expect(isCurrentProPrice({ type: 'one_time', currency: 'usd', unit_amount: 2400, recurring: null })).toBe(true)
    expect(isCurrentProPrice({ type: 'one_time', currency: 'usd', unit_amount: 1000, recurring: null })).toBe(false)
    expect(isCurrentProPrice({ type: 'one_time', currency: 'eur', unit_amount: 2400, recurring: null })).toBe(false)
  })
  it('rejects subscriptions even when the amount is 2400 cents', () => {
    expect(isCurrentProPrice({ type: 'recurring', currency: 'usd', unit_amount: 2400, recurring: { interval: 'month' } })).toBe(false)
  })
  it('keeps confirmed past purchases eligible independent of the current catalog price', () => {
    const historical = { mode: 'payment', payment_status: 'paid', livemode: true, metadata: { priceId: 'pro_pass_lifetime_9' }, amount_total: 1000 }
    expect(isConfirmedPayment(historical, 'live')).toBe(true)
    expect(isCurrentProPrice({ type: 'one_time', currency: 'usd', unit_amount: historical.amount_total })).toBe(false)
  })
  it('requires paid status before fulfilling', () => {
    expect(isConfirmedPayment({ mode: 'payment', payment_status: 'unpaid', livemode: false }, 'sandbox')).toBe(false)
    expect(isConfirmedPayment({ mode: 'payment', payment_status: 'paid', livemode: false }, 'sandbox')).toBe(true)
  })
  it('never treats sandbox payments as live sales', () => {
    expect(isConfirmedPayment({ mode: 'payment', payment_status: 'paid', livemode: false }, 'live')).toBe(false)
  })
  it('uses the payment date in the business local timezone', () => {
    expect(orderConfirmationDetails({ id: 'pi_test', created: 1793857946 }, {}).orderDate).toBe('November 4, 2026')
  })
  it('formats the $24 payment and exposes only card brand and four digits', () => {
    const details = orderConfirmationDetails({ id: 'cs_test_3f9a2c7b', amount_total: 2400, currency: 'usd', created: 1793851200 }, { payment_method_details: { card: { brand: 'visa', last4: '4242' } }, receipt_url: 'https://pay.stripe.com/receipts/test' })
    expect(details.amountPaid).toBe('$24.00')
    expect(details.paymentMethod).toBe('Visa •••• 4242')
    expect(details.orderNumber).toBe('DRV-3F9A2C7B')
    expect(details.receiptUrl).toBe('https://pay.stripe.com/receipts/test')
  })
  it('omits absent receipts and rejects a full card number', () => {
    const details = orderConfirmationDetails({ id: 'cs_test', created: 1793851200 }, { payment_method_details: { card: { brand: 'visa', last4: '4242424242424242' } } })
    expect(details.paymentMethod).toBeUndefined()
    expect(details.receiptUrl).toBeUndefined()
  })
})