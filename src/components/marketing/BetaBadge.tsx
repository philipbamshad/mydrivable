import { cn } from "@/lib/utils";

export function BetaBadge({ className }: { className?: string }) {
  return <span className={cn("beta-label inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 align-middle text-[10px] font-semibold leading-4 text-primary", className)}>Beta</span>;
}
