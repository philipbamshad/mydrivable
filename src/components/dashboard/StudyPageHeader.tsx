import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function StudyPageHeader({ title, subtitle, isPro, onUpgrade, actions }: {
  title: ReactNode;
  subtitle?: string;
  isPro: boolean;
  onUpgrade: () => void;
  actions?: ReactNode;
}) {
  return <header className="relative z-10 mx-auto w-full max-w-[960px] shrink-0 bg-background pl-14 pr-4 pb-4 pt-6 md:px-8">
    <div className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <h1 className="min-w-0 whitespace-normal font-display text-xl font-bold leading-tight">{title}</h1>
      <div className="flex shrink-0 items-center gap-3">
        {!isPro && <Button onClick={onUpgrade} className="h-8 shrink-0 rounded-full bg-action px-3 text-sm font-semibold text-action-foreground hover:bg-action-hover">Upgrade</Button>}
        {actions}
      </div>
    </div>
    {subtitle && <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>}
  </header>;
}