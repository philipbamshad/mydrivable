# Pro Pass price audit — November 26, 2026

## Result

New Pro Pass checkouts charge **$14.00 USD (1400 cents)**, once, with lifetime access and no subscription. “Pay once, use forever, no recurring fees” remains unchanged. Existing purchasers’ entitlement rows were not modified.

## Every previous monetary-price location found

| Location | Verified current result |
| --- | --- |
| `src/routes/index.tsx` — homepage pricing / Pro card | $14, one-time; verified desktop and mobile |
| `src/lib/user-profile.tsx` — preview and live upgrade-dialog descriptions | Both say $14 one-time, lifetime access |
| `src/components/dashboard/AccountPanel.tsx` — membership card | $14 one-time, lifetime access |
| `src/components/dashboard/ExamProgressChart.tsx` — locked progress upgrade prompt | $14 one-time |
| `src/routes/terms.tsx` — Purchases section | $14; no subscription or recurring charges |
| `src/routes/refunds.tsx` — description metadata and one-time purchase section | Both say $14 |
| `src/routes/privacy.tsx` — Meta purchase disclosure | $14 USD |
| `src/lib/email-templates/order-confirmation.tsx` — email preview | $14.00; rendered email verified |
| `src/lib/order-confirmation.test.ts` — receipt fixture and expected amount | 1400 cents / $14.00 |
| `src/routes/checkout.return.tsx` — Meta Purchase event | value 14, currency USD |
| `src/lib/meta-pixel.test.ts` — Purchase event fixture and expectation | value 14, currency USD |
| `roadmap.md` — two earlier sandbox-payment notes | Removed obsolete monetary literals without changing historical facts |
| Project Free Pass / Pro pricing memory | Updated to $14 USD once; previous buyers keep access |
| Stripe sandbox catalog | New one-time price at 1400 cents; previous price retained, with no checkout lookup key |

The existing permanent catalog key `pro_pass_lifetime_9` stays in the checkout validator, profile checkout key, payment confirmation, webhook fulfillment and historical entitlement rows. Stripe transferred its lookup key to the new price; the suffix is an identifier, not a current amount. Keeping it preserves managed sandbox-to-live catalog synchronization and historical fulfillment.

## Full search scope and remaining non-price matches

Searched all project text, including hidden project records, source, public assets, migrations and every email template, for the requested currency forms, decimal form and cents number. Excluded dependencies, repository internals, generated build/cache files and secret environment files.

No obsolete monetary literal remains in application source or email templates. The remaining number matches are unrelated to money and were intentionally left unchanged:

- `src/routes/reset-password.tsx`: redirect delay in milliseconds.
- `src/styles.css`: color-shade comment.
- `src/components/marketing/VideoShowcase.tsx`: maximum width in pixels.
- `roadmap.md`: historical maximum-width measurement.
- `.lovable/plan/add-a-video-to-the-drivable-site-2026-10-09.md`: historical video-width measurement.
- `public/favicon.svg`: encoded image bytes, not displayed text or price.

Database audit searched serialized content of **all 19 public application tables**, returning match counts only: zero monetary matches in every table. Public function definitions also returned zero matches. No editable database pricing content needed updating. Historical entitlement IDs remain intact. Cookies, FAQ/trust copy, other upgrade prompts and other email templates had no obsolete price to change. Previously issued Stripe receipts and delivered emails were not rewritten.

## Checkout, receipt and access test

- Completed the actual embedded checkout with Stripe’s test card as a disposable Free learner.
- Stripe confirmed `mode=payment`, `status=complete`, `payment_status=paid`, `currency=usd`, total and amount received **1400**, quantity **1**, and **no subscription**.
- Stripe generated an official receipt; its page returned HTTP 200 and contained the current amount.
- Automatic payment fulfillment created active Pro with **no expiry date**; the dashboard read back **Pro** and removed the Free allowance message.
- Existing lifetime-purchase counts/statuses were unchanged before and after testing.
- On the Stripe-confirmed success page, advertising consent permitted a Meta Purchase call with **value 14 / USD** and the session event ID. Reload emitted no further Purchase. Meta’s external receipt of the event was not confirmed.
- The disposable test address’s order email was suppressed; rendered confirmation content independently showed $14.00. Inbox delivery was not tested.
- **147 automated tests passed**; preview compilation reported success; no browser runtime errors in the purchase verification.

## Publishing

These changes are not published. Publishing synchronizes the new Stripe price to live. A checkout guard refuses a stale catalog amount instead of charging the previous price during rollout.