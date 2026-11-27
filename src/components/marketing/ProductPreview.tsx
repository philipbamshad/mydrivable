import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BetaBadge } from "./BetaBadge";
import { CoachChat, DEMO_CARD, DEMO_TAB, DEMO_TAB_LIST, QuestionCard, ScenarioPlayer } from "@/components/demo/DemoPlayers";
import { DEMO_COACH, DEMO_SCENARIOS, type DemoQuestion } from "@/lib/demo";

const PRACTICE: DemoQuestion = { topic: "Traffic signals", q: "What does a solid green arrow mean?", options: ["Yield to oncoming traffic before turning", "Make the protected turn when the path is clear", "Stop, then turn"], correct: 1, explanation: "Turn in the arrow's direction when the path is clear. Oncoming traffic has a red light." };
const previews = ["simulation", "practice", "coach"] as const;

export function ProductPreview() {
  const [active, setActive] = useState<string>("simulation");
  const [manual, setManual] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  useEffect(() => {
    if (manual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive(current => previews[(previews.findIndex(p => p === current) + 1) % previews.length] ?? "simulation"), 5000);
    return () => window.clearInterval(timer);
  }, [manual]);
  const answer = (tab: string) => (i: number) => { setManual(true); setAnswers(a => tab in a ? a : { ...a, [tab]: i }); };
  const sim = DEMO_SCENARIOS[0];
  return <div className="relative mx-auto mt-4 w-full max-w-lg" onPointerDown={() => setManual(true)} onFocusCapture={() => setManual(true)}>
    <Tabs value={active} onValueChange={value => { setActive(value); setManual(true); }}>
      <TabsList aria-label="Product preview" className={DEMO_TAB_LIST}><TabsTrigger value="simulation" className={DEMO_TAB}>Driving Sim <BetaBadge /></TabsTrigger><TabsTrigger value="practice" className={DEMO_TAB}>Practice Test</TabsTrigger><TabsTrigger value="coach" className={DEMO_TAB}>AI Coach</TabsTrigger></TabsList>
      <div className="marketing-product-preview mt-3" role="tabpanel" aria-label={active === "simulation" ? "Driving Sim preview" : active === "practice" ? "Practice Test preview" : "AI Coach preview"}>
        <div key={active} className={`marketing-preview-fade ${DEMO_CARD}`}>
          {active === "simulation" && sim ? <ScenarioPlayer scenario={sim} onAnswer={answer("simulation")} /> : active === "practice" ? <QuestionCard question={PRACTICE} chosen={answers["practice"]} onAnswer={answer("practice")} /> : <CoachChat question={DEMO_COACH} chosen={answers["coach"]} onAnswer={answer("coach")} />}
        </div>
      </div>
    </Tabs>
    {Object.keys(answers).length > 0 && <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"><span className="font-medium">Nice. Create a free account to keep going</span><Button asChild size="sm" className="rounded-full"><Link to="/auth" search={{ mode: "sign-up" }}>Start free<ArrowRight /></Link></Button><Link to="/demo" className="text-primary underline-offset-4 hover:underline">Try the full demo</Link></div>}
  </div>;
}
export function PracticePreview() {
  return <div className="w-full rounded-lg bg-card p-5 text-left shadow-sm"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground"><span className="min-w-0">Question 12</span><span className="shrink-0 rounded-full bg-success/10 px-2 py-1 font-semibold text-success">Correct</span></div><p className="mt-4 text-sm font-semibold">A solid green arrow means…</p><p className="mt-3 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success"><Check className="mr-2 inline size-4" />Make the protected turn</p><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Turn in the arrow's direction when the path is clear.</p></div>;
}

export function CoachPreview() {
  return <div className="w-full space-y-3 text-left text-sm"><div className="ml-auto max-w-[85%] rounded-lg bg-marketing-navy p-4 text-marketing-white">Why did I miss this sign question?</div><div className="max-w-[90%] rounded-lg bg-card p-4 shadow-sm"><p className="font-semibold text-success">AI Coach</p><p className="mt-2 leading-relaxed text-muted-foreground">A yellow diamond warns of conditions ahead. Follow any posted speed limit.</p></div></div>;
}
