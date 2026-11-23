import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BetaBadge } from "./BetaBadge";
import { SimulationPreview } from "./SimulationPreview";

export function PracticePreview() {
  return <div className="w-full rounded-lg bg-card p-5 text-left shadow-sm"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground"><span className="min-w-0">California · 12 / 46</span><span className="shrink-0 rounded-full bg-success/10 px-2 py-1 font-semibold text-success">Correct</span></div><p className="mt-4 text-sm font-semibold">A solid green arrow means…</p><p className="mt-3 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success"><Check className="mr-2 inline size-4" />Make the protected turn</p><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Turn in the arrow's direction when the path is clear.</p></div>;
}

export function CoachPreview() {
  return <div className="w-full space-y-3 text-left text-sm"><div className="ml-auto max-w-[85%] rounded-lg bg-marketing-navy p-4 text-marketing-white">Why did I miss this sign question?</div><div className="max-w-[90%] rounded-lg bg-card p-4 shadow-sm"><p className="font-semibold text-success">AI Coach</p><p className="mt-2 leading-relaxed text-muted-foreground">A yellow diamond warns of conditions ahead. Follow any posted speed limit.</p></div></div>;
}

const previews = ["simulation", "practice", "coach"] as const;
export function ProductPreview() {
  const [active, setActive] = useState<string>("simulation");
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if (manual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive(current => previews[(previews.findIndex(p => p === current) + 1) % previews.length] ?? "simulation"), 5000);
    return () => window.clearInterval(timer);
  }, [manual]);
  return <div className="relative mx-auto mt-8 w-full max-w-lg"><Tabs value={active} onValueChange={value => {setActive(value);setManual(true);}}><TabsList aria-label="Product preview" className="grid h-auto w-full grid-cols-[1.25fr_1fr_.8fr] gap-1 bg-transparent p-0"><TabsTrigger value="simulation" className="min-w-0 gap-1 px-1 py-2 text-xs sm:px-3 sm:text-sm">Driving Sim <BetaBadge /></TabsTrigger><TabsTrigger value="practice" className="px-1 py-2 text-xs sm:px-3 sm:text-sm">Practice Test</TabsTrigger><TabsTrigger value="coach" className="px-1 py-2 text-xs sm:px-3 sm:text-sm">AI Coach</TabsTrigger></TabsList><div className="marketing-product-preview mt-3 grid min-h-[280px] items-center sm:min-h-[350px]" role="tabpanel" aria-label={active === "simulation" ? "Driving Sim preview" : active === "practice" ? "Practice Test preview" : "AI Coach preview"}><div key={active} className="marketing-preview-fade w-full">{active === "simulation" ? <SimulationPreview leftTurn /> : <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-8">{active === "practice" ? <PracticePreview /> : <CoachPreview />}</div>}</div></div></Tabs></div>;
}