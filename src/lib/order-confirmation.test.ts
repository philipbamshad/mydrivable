import { describe, expect, it } from 'vitest'
import { isConfirmedPayment, orderConfirmationDetails } from './order-confirmation'

describe('Pro Pass confirmed payment receipts', () => {
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
  it('formats the $9 payment and exposes only card brand and four digits', () => {
    const details = orderConfirmationDetails({ id: 'cs_test_3f9a2c7b', amount_total: 900, currency: 'usd', created: 1793851200 }, { payment_method_details: { card: { brand: 'visa', last4: '4242' } }, receipt_url: 'https://pay.stripe.com/receipts/test' })
    expect(details.amountPaid).toBe('$9.00')
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