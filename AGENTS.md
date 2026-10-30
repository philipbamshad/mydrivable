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
