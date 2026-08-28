Style the Mock Permit Exam and Test Hub tabs like the sign-in/product cards, with a blue and orange ambient glow behind the tab content.

Update the two practice tabs so they feel less plain and match the glassy, rounded card aesthetic shown in the reference. Keep all existing functionality (question limits, scoring, buttons, flows) intact.

Plan:
1. Add an ambient blue and orange glow behind the tab content in `src/routes/_authenticated/app.index.tsx`. Add a subtle, non-interactive radial gradient layer inside the `TabsContent` wrappers for `test-hub` and `state-exam` so the background has soft blue and warm orange halos similar to the sign-in page.
2. Refresh `src/components/dashboard/TestHubDashboard.tsx` overview cards to match the reference style: cleaner white/off-white rounded-[28px] cards, outlined icon containers, shaded free-limit indicator, and a rounded full-width primary CTA. Apply the same card style to the pillar paywall and quiz results screens.
3. Refresh `src/components/dashboard/PermitExamSimulator.tsx` start card and running question card to use the same rounded-[28px] card style, stat tiles with a subtle shaded background, and the blue/orange glow. Keep the existing progress bar, answer states, and review screen layout, just polish surfaces and shadows.
4. Ensure all interactive states (hover, active, correct/incorrect answer feedback, disabled) remain functional and accessible.
5. Build and preview to confirm the new glow and card styling appear on both tabs without breaking layout or scroll behavior.
