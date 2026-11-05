<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the shared Button component and semantic action/status tokens for changed controls so contrast and states remain consistent across themes.
- Keep study navigation and page-heading labels identical, with active-page emphasis rather than permanent promotional marks.
- Create simulation sessions with the pure session shuffler, retaining authored action order and original indices to preserve scoring; replay retains the current session.
- Keep simulation decision timing/results in a pure tested module and stable action IDs through session shuffling; use existing semantic app styles without changing global styles or sibling tabs.
- Serve simulation uploads as CDN-backed WebM assets so autoplay and ended events work in Chromium as well as other modern browsers.
- Keep intent, subtitle and freeze time in each simulation scenario definition so presentation and review use the same source; hold the final frame when an unchanged video ends before its configured freeze time.
- Derive simulation signal direction and activity through the tested intent helper; scope signal tokens and synchronized CSS animations to the video so other tab styles stay unchanged.
- Keep mock-exam wording, topic analytics and limit/scoring rules in the tested exam-only helper; preserve sibling banks and use existing history rows for saved summary statistics.
- Load exam history through authenticated route/query integration and await confirmed attempt writes; topic remediation uses a validated topic search value with existing Test Hub gates.
- Keep Test Hub progress state-scoped in its owner-only table; derive mastery and missed-question recovery in the pure Hub helper, use stable question identities across answer shuffles, and await answer/score saves before advancing.
- Derive Hub mastery from ever-correct identities divided by the canonical topic bank size; latest answer and missed recovery remain separate so later misses cannot erase mastery.
- Use fixed semantic simulation actions with pure timing and scenario data; instruction and legend preferences are browser-only presentation state.
- Author simulation steps in scenario data; aggregate scenario correctness across every required step and reaction averages across individual decisions. Active study layouts share a viewport-bounded question frame so feedback stays visible.
- Resolve Coach jurisdiction from the authenticated profile and consume free usage through the owner-scoped atomic RPC; client request state and browser counters are never authoritative.
- Reserve study sessions atomically in study_attempts; service-only versioned answer commits score the server-authored payload and write history/progress together, preventing duplicate Free slots and answer edits while preserving resume state.
- Read AI allowance from the database local-day RPC; legacy browser counters never gate practice or reset daily credits.
- Supply missing resolved CSS defaults through the Vite compatibility plugin so the preview stylesheet compiler receives the same configuration shape as production.
- Private beta: app access is gated by the database allowlist (is_allowlisted RPC) in the _authenticated route, every server function via requireAllowlisted, /api/chat, and restrictive RLS on user tables; the client check alone is never trusted.
- Public waitlist joins use a same-origin server function and service-only atomic database RPC for duplicate/visitor checks; sends use the existing authenticated App email route with narrowly scoped server credentials so browser callers cannot bypass signup checks.
