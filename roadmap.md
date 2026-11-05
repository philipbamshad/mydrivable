# Design improvements

# Checkout and first-sign-in fixes
- [x] Stable router-aware embedded checkout with explicit errors and validated inputs; sandbox and published live forms load. Original Seroval failure was not reproduced before edits.
- [ ] Sandbox purchase/Pro/email verification: Stripe form did not complete automated submission; no new confirmed payment or email. Recipient inbox delivery requires user confirmation.
- [x] Required first-sign-in state and age setup; optional test date, saved and used throughout. Verified adult California server-authored exam has 36 questions and existing attempts retain their format.
- [x] Restriction-only badges, unattempted topic labels, primary locked-screen upgrade and removed duplicate results upgrades.
- [x] Include historical exam misses in both review count and playable review payload without resurrecting recovered identities; simulation header Upgrade.
- [x] Mobile settings/account/sign-out work through one independent panel; cache cleared and navigation replaced. Instrumented Free/Pro sign-out produced zero clipboard writes; none existed in source.
- [x] Free/Pro exam, Hub and simulation desktop/mobile checks; Pro practice answer persisted and adult exam started. All 102 tests pass and build OK. Nothing published.

# Homepage menu and beta access
- [x] Remove homepage Log in link; retain waitlist and /auth sign-in.
- [x] Add ngfinanceai@gmail.com to app allowlist without new admin sections.
- [ ] Send Invite auth email: blocked because this email already has a confirmed account; invitation service returned email_exists. Existing account can sign in.

# Progress colors and restricted badges
- [x] Restrict Pro badges to Free locked/limited features, preserving sidebar plan and homepage pricing.
- [x] Shared blue progress/highlight/sidebar tokens; navy buttons and green/red answer states unchanged.
- [x] Checked Coach, exam, Hub, simulation and Admin with owner Pro and Free test sessions; no Pro feature badges for Pro, lock+Pro only at restrictions for Free. Blue text contrast 4.65–7.44:1; 97 tests passed.

# Instant durable study answers
- [x] Immediate feedback and usable Next controls in exam, Hub and simulation.
- [x] Persistent owner-scoped queue, three retries, entry replay and authenticated keepalive with idempotent version checks; offline browser test retained two answers and replay cleared both.
- [x] Confirmed completion and end-only cache refresh; latency with one-second saves: exam 5.3ms, Hub 5.5ms, simulation 18.7ms. Existing atomic mastery/scoring writes remain in the single background commit.

# November private-beta fixes
- [x] Coach driving-test coverage, newest-message scrolling and solid header.
- [x] Correct new permit-age questions, unique concept sessions, 191 revised answer sets and complete changed-question list; exam misses now save in Hub review.
- [ ] Legacy saved malformed permit-age attempts and historical exam misses: controlled one-time repair/replay remains unverified; do not overwrite existing progress.
- [x] Neutral octagonal simulation controls, mobile stats/toggle and matching progress bars/tab titles.
- [x] Admin waitlist count/disabled launch control; confirmed account deletion and App email implemented. Real deletion/email delivery deliberately not exercised on existing users.
- [x] Homepage beta badge, concise feature heading, your-state wording and Log in link.
- [x] All 94 tests passed; authenticated exam answer persisted with feedback, Hub review available and mobile simulation has no overflow.

# Pro Pass receipt update and sandbox test
- [x] Add actual paid amount, safe card label and optional official Stripe receipt; send only on confirmed success.
- [x] Test $9 sandbox payment with pm_card_visa through the real Stripe success webhook; verify sent email, receipt and Pro UI, then restore Free without deleting Stripe test payment. Inbox arrival cannot be observed.

# Permit and driving prep plans
- [x] Update simulation counts/statistics, branding, homepage plans and existing welcome/waitlist/order App emails; launch campaign remains skipped by prior user choice.
- [x] Enforce five daily AI questions and one reserved, resumable free attempt per exam, Hub topic and simulation; server-authored scoring and atomic topic progress.
- [x] Add philipbamshad+free@gmail.com without Pro; verify sixth AI endpoint denial/new-local-day allowance, Free full-length exam/all topics/simulation completion locks and refresh resume, direct-write refusal, owner repeated Pro starts and email rendering.

# Waitlist App emails
- [x] Save validated signups through a protected server action with duplicate, honeypot and three-per-hour visitor checks.
- [x] Send branded confirmation and fixed-owner notification using Lovable App emails; retain signups when sending fails.
- [x] Test the real confirmation address, duplicate/honeypot behavior and both successful send records; clean up only the test signup. Inbox arrival requires recipient confirmation.

# Compact practice and two-step simulation
- [x] Fit active simulation, exam and Hub questions in the available window; fix tablet heading/menu spacing.
- [x] Add authored two-step decisions, fresh timers and scenario-level results with all-decision reaction averages.
- [x] Test all scenarios timed/untimed at 1440×820, 1280×720, 390×844 and 768×700; check exam/Hub feedback visibility.
 
# App-wide professional polish
- [x] Calm tone, truthful homepage and consistent answer/exam wording.
- [x] Active-state AI, supported image uploads and atomic five-message free cap.
- [x] Improve ambiguous/joke answer choices, True/False order and STOP visuals; automated distinct-choice checks passed.
- [x] Ever-correct topic mastery and past DMV date notice.
- [x] Fixed three-action simulation, instructions/legend, 2.5-second timing and mobile layout.
- [x] Verify signup/signin/cookies, saved exams, Hub progress, Active-state AI and simulation on desktop/mobile; 44 rule tests passed.
- [x] Purchase-to-Pro test: confirmed $9 sandbox payment, automatic Stripe webhook upgrade and email send, official receipt and restored Free UI.
- [ ] Complete manual factual review of every state question: current tests establish unique choices, not handbook accuracy.
- [ ] Complete remaining account/date/image flow checks: signout, changing target date, and a live uploaded-image reply remain unverified.
- [x] Tighten homepage spacing and reduce competing motion.
- [x] Improve sign-in, sidebar, and chat readability.
- [x] Unify study-page labels and active navigation emphasis.
- [x] Verify signed-in screens and compact layouts.

# Simulation videos
- [x] Replace the simulation with the three supplied videos and scenario-specific questions.
- [x] Trim the lane-change video before the maneuver.
- [x] Randomize clip and answer order on each start, preserving correct-answer scoring.
- [x] Test the rules and verify the signed-in simulation flow.
- [x] Add an exit control to the simulation matching the other study tabs.
- [x] Add the uploaded left-turn green-arrow clip (starts after the first road arrow, cut at the stop line) with a protected-turn question.
- [x] Add the uploaded right-turn-on-green clip with a yield-to-pedestrians question.
- [x] Add the uploaded right-turn-on-red clip, cut at three seconds before the line, with safe-turn checks; verify playback and scoring.

# Driving simulation game
- [x] Convert existing clips to timed action scenarios and preserve session randomization.
- [x] Build simulation-only immersive video, countdown, HUD, feedback, sound and results.
- [x] Test scoring rules and verify signed-in gameplay on desktop and mobile.

# Simulation test prep redesign
- [x] Replace arcade presentation with existing exam styling, optional five-second timing and manual feedback.
- [x] Add accuracy/decision-time results and frozen-frame missed-scenario review.
- [x] Verify timed and untimed flows, completion, retry and mobile layout without changing other pages or global styles.

# Simulation scenario update
- [x] Replace the six scenario definitions and freeze times, keeping existing videos.
- [x] Add intent badges/subtitles and equal-height wrapping actions in the specified order.
- [x] Test scenario rules and verify signed-in playback, feedback and compact layout.

# Simulation turn signals
- [x] Add intent-derived edge glow and synchronized arrow, active only during playback/decision.
- [x] Verify all six directions, feedback removal and steady reduced-motion display.

# Mock Permit Exam upgrade
- [x] Add saved best/last/attempt statistics and state-appropriate exam description.
- [x] Add concise exam-only questions, sign/signal/marking visuals, keyboard answers, flags and pre-submit navigation without answer feedback.
- [x] Add pass results, topic breakdown/practice links, missed-answer explanations and saved attempts.
- [x] Test pass/topic/free-limit rules and verify signed-in completion, saved history and topic navigation.

# Permit Test Hub upgrade
- [x] Add saved per-topic mastery, last scores, recommendations and missed-question tracking.
- [x] Upgrade practice feedback, visuals, keyboard answers and mastery results within existing Hub style.
- [x] Test mastery/missed-question/free-limit rules and verify signed-in practice, persistence and review.

# Spacing and layout pass
- [x] Content-height question cards, single-column answers, right-aligned Next, 4px progress bars (exam + Hub).
- [x] Sign images: contained 160/120px boxes; every sign shows its real symbol.
- [x] App-wide spacing pass: 16/24px padding, 24px under headers, 900px max width, checked at 1440/1280/768/375.

# Simulation look and clarity
- [x] Solid action buttons (octagon Stop), freeze-only prompt/countdown/step label, 10% freeze overlay.
- [x] Two-step check badge and "Correct. Now choose your next action."; result chips per step; timeout never marks correct answers ✕.
- [x] Update How it works text/icon and full-width progress bar; test all 6 scenarios timed/untimed.
