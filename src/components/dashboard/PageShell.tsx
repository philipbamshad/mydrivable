import type { ReactNode } from "react";

/**
 * Shared app page layout: one centered content container (max 960px, 32px side
 * padding on desktop, 16px on mobile) with the page title aligned to the
 * container's left edge and 32px between the header and the first card.
 * Content stays at the top under the header on tall screens.
 */
export function PageShell({ title, headerRight, children }: { title: string; headerRight?: ReactNode; children: ReactNode }) {
  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex min-h-full w-full max-w-[960px] flex-col px-4 pb-8 pt-6 md:px-8">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <h1 className="min-w-0 truncate font-display text-xl font-bold leading-tight">{title}</h1>
          {headerRight}
        </header>
        <div className="mt-8 flex-1">{children}</div>
      </div>
    </div>
  );
}
