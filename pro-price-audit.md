# Drivable pricing and Free Pass audit — November 27, 2026

## Result

Pro Pass is **$24 USD once (2400 cents)** with lifetime access and no subscription. Existing lifetime purchasers retain access. Old Stripe prices are retained without checkout lookup keys; new checkouts resolve the permanent `pro_pass_lifetime_9` catalog key to the current amount.

## Every outdated price or Free-plan description found

| Location | Updated result |
| --- | --- |
| Homepage pricing / Pro card (`src/routes/index.tsx`) | $24 one-time. Exact requested four Free bullets and eight Pro bullets. |
| Checkout preview/live descriptions (`src/lib/user-profile.tsx`) | $24 one-time payment, lifetime access. |
| Checkout price guard (`src/lib/payments.functions.ts`, `src/lib/order-confirmation.ts`) | Requires a one-time USD price of 2400 cents for new checkouts. Historical fulfillment stays amount-independent. |
| Account/settings membership (`src/components/dashboard/AccountPanel.tsx`) | Current Free allowances and $24 upgrade offer; existing Pro displays lifetime access without falsely replacing the amount they paid. |
| Progress upgrade prompt (`src/components/dashboard/ExamProgressChart.tsx`) | $24 one-time. |
| Terms purchases (`src/routes/terms.tsx`) | $24, one-time/lifetime, no recurring charges; current Free limits and existing-buyer protection. |
| Refunds copy and description (`src/routes/refunds.tsx`) | $24 once; no subscription. Existing all-sales-final policy retained. |
| Privacy advertising disclosure (`src/routes/privacy.tsx`) | Current Purchase value is $24 USD; no personal fields added. |
| Order-confirmation template preview (`src/lib/email-templates/order-confirmation.tsx`) | $24.00 preview; receipts continue using the actual Stripe-confirmed amount. Updated unlocked-feature list includes study plan. |
| Receipt/price tests (`src/lib/order-confirmation.test.ts`) | 2400 cents / $24.00; historical payment eligibility remains tested. |
| Meta success event / tests (`src/routes/checkout.return.tsx`, `src/lib/meta-pixel.test.ts`) | Purchase value 24, currency USD, after confirmed payment and advertising consent; once per checkout. |
| Free AI allowance/message (`src/lib/entitlements.server.ts`, `src/lib/entitlements.test.ts`, `src/components/chat/ChatWindow.tsx`, `src/lib/study-attempt.ts`) | Three questions per local day, midnight reset, calm priced upgrade action. |
| Free exam authoring (`src/lib/study-attempt.functions.ts`) | New Free exams contain exactly 15 questions; Pro retains the real state/legacy age format. |
| Topic authoring (`src/lib/study-attempt.functions.ts`) | New Free topic quizzes contain exactly ten questions; Pro can practice the full canonical topic bank. |
| Exam start/results (`src/components/dashboard/PermitExamSimulator.tsx`) | Clearly labeled Sample exam, 15-question score, requested upgrade message and $24 button. |
| Hub topic/review displays (`src/components/dashboard/TestHubDashboard.tsx`) | One quiz per topic, locked count/blurred review preview, calm topic-limit upgrades. |
| Shared lock (`src/components/dashboard/AttemptLock.tsx`) | Feature-specific explanation; Get Pro – $24 once. |
| Simulation results/lock (`src/routes/_authenticated/app.simulation.tsx`) | One Free run, unlimited Pro, priced upgrade and navigation retained. |
| Welcome email (`src/lib/email-templates/welcome.tsx`) | Sample exam rather than a free full exam; ten-question topics, three daily Coach questions, one sim run, $24 Pro. |
| Seven-day reminder (`src/lib/email-templates/test-in-7-days.tsx`) | Available Free sample or unlimited full-length exams with $24 Pro. |
| Demo account prompts (`src/routes/demo.tsx`) | Saving progress is Free; unlimited exams and test-date plan are explicitly Pro. Demo gameplay stays fully free. |
| Previous audit and historical roadmap notes | Superseded current-price statements removed; historical tests described without relabeling past charges. |
| Shared plan rules and study-plan display | Tested question counts/daily allowance; authenticated Pro-only study-plan read, Free locked preview. |
| Database functions (`drizzle/migrations/0015_free_coach_three_daily_and_study_sizes.sql`) | Atomic three-credit daily cap; authoritative new Free payload sizes; reservations/resume and existing results preserved. |

“Pay once, use forever, no recurring fees” is retained on pricing, Terms and order email. Other FAQ/trust copy, Cookies content and email templates contain no obsolete monetary price or misleading specific Free allowance to change. General descriptions of full-length exams still describe the Pro feature accurately.

## Full audit scope and exceptions

Searched project source, hidden project documents, public text/assets, current and historical migrations, every email template and **all 19 public application tables**, excluding repository internals, dependencies, caches/build output and secrets. Database searches returned counts only, not personal records. All 19 tables and current public function definitions had **zero obsolete-price/old-plan-description matches**. No database content needed rewriting.

The only remaining requested number matches outside historical Stripe objects are unrelated to money:
- `src/styles.css`: a color-shade comment.
- `src/routes/reset-password.tsx`: a redirect delay in milliseconds.
- `src/data/simulation-game.test.ts`: reaction-time fixtures in milliseconds.
- Encoded favicon image data may contain incidental digit sequences, not price text.

These were deliberately not changed. Applied historical migration files remain historical records; the additive migration supersedes the previous AI rule rather than modifying an already-applied migration. Permanent historical price IDs remain unchanged. Previously delivered emails and issued Stripe receipts were not rewritten or misrepresented.

## End-to-end verification

- Disposable Free account completed its **15-question sample exam**, all **four ten-question topic quizzes**, and **one ten-scenario simulation run**. Confirmed completion saved scores, locked each allowance and preserved View past results / navigation.
- Free Hub showed the actual missed-question count and locked blurred preview; test-date study plan returned a locked response. Direct server review request was rejected.
- Sent three real AI Coach questions. UI showed two remaining, then one, then the daily limit message. Direct fourth request returned **402**; persisted usage remained three. Existing local-day bucket/reset logic is retained.
- Completed actual embedded Stripe test checkout: **2400 cents USD charged/received**, paid Charge and succeeded PaymentIntent, `mode=payment`, **no subscription**. Official receipt returned HTTP 200 with the current amount.
- Automatic fulfillment granted active sandbox Pro with **no expiry**. The UI then opened missed review with explanations, a **46-question California full exam**, the complete topic bank, the study plan, simulation after the used Free run, and Coach after the daily cap.
- Existing owner Pro account retained full exam, review, study-plan, simulation and unrestricted Coach access on desktop/mobile. Existing live lifetime buyer count remained unchanged. No existing purchaser entitlement was edited.
- Consented Meta Purchase emitted **24 / USD** with checkout event ID; reload emitted no repeat. Meta SDK network was intercepted for deterministic observation; external Meta receipt is not claimed.
- Desktop/mobile Free and Pro layouts and pricing checked; no horizontal overflow. No runtime errors occurred in Free completion tests.
- Rendered order, welcome and reminder emails contain the current price and no obsolete price. Disposable-account delivery is suppressed; inbox delivery was not tested.
- **159 tests passed across 25 files.** Preview compilation succeeded.

## Publishing

Not published. Publishing synchronizes the new Stripe catalog to live. Until synchronization, the checkout guard refuses a stale amount rather than charging the previous price. The new server/database Free limits are already applied; demos remain excluded from allowances.
