# Plan: Test Mode Banner

## Finding
- Stripe go-live is fully complete (all 5 steps: account claimed, go-live form, app installed, live keys provisioned, readiness check passed).
- The preview build uses the test publishable key (`pk_test_...` in `.env.development`), so the "test mode" banner always shows in the preview by design.
- The published site (mydrivable.com) uses the live key (`pk_live_...` in `.env.production`), so real payments already work there and the banner does not appear.

## Action
No code change needed. Publish the app so the live build (with the live key, no test banner) is deployed to the published URL.
