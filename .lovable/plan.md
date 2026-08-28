Add a distinct white shade behind the sidebar info cards

Update the DMV Target Date and Active State cards in the collapsible sidebar so they sit on a slightly different white surface instead of the current semi-transparent secondary wash. This matches the cleaner card look in the reference screenshot.

Plan:
1. In `src/components/chat/ThreadSidebar.tsx`, locate the two info card trigger buttons inside `createInfoCards`.
2. Change their background from `bg-secondary/70 hover:bg-secondary` to `bg-muted hover:bg-secondary` so each card has a solid, subtle off-white backing that separates it from the white sidebar panel.
3. Keep the existing rounded-2xl, border, press, padding, typography, and popover behavior unchanged.
4. Verify the preview so the two cards show the new shade without changing collapsed state behavior.
