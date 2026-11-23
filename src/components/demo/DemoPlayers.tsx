import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamQuestionVisual } from "@/components/dashboard/ExamQuestionVisual";
import { ACTION_ICONS } from "@/components/simulation/ActionLegend";
import { DEMO_ACTIONS, DEMO_COACH_REPLY, type DemoQuestion, type DemoScenario } from "@/lib/demo";
import { cn } from "@/lib/utils";

/** Shared card + pill-tab styles so the homepage preview and /demo look identical. */
export const DEMO_CARD = "rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6";
export const DEMO_TAB_LIST = "flex h-auto w-full flex-wrap justify-center gap-1 bg-transparent p-0";
export const DEMO_TAB = "min-h-9 gap-1 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none sm:text-sm";

const tone = { go: "text-marketing-green border-marketing-green/30", yield: "text-marketing-amber border-marketing-amber/30", stop: "text-marketing-red border-marketing-red/30" } as const;
const label = { go: "Go", yield: "Yield", stop: "Stop" } as const;

function Feedback({ correct, text, answer }: { correct: boolean; text: string; answer?: string }) {
  return <div role="status" className="mt-3 text-left"><p className={cn("text-sm font-semibold", correct ? "text-success" : "text-destructive")}>{correct ? "Correct" : `Incorrect${answer ? ` · Correct answer: ${answer}` : ""}`}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}

export function ScenarioPlayer({ scenario, onAnswer, playFirst = false }: { scenario: DemoScenario; onAnswer: (index: number) => void; playFirst?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"ready" | "playing" | "decision">(playFirst ? "ready" : "decision");
  const [chosen, setChosen] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const { clip } = scenario;
  const start = () => { setPhase("playing"); const el = video.current; if (el) { el.currentTime = 0; void el.play().catch(() => setPhase("decision")); } };
  const freeze = () => { video.current?.pause(); setPhase(p => p === "playing" ? "decision" : p); };
  const Arrow = scenario.signal === "left" ? ArrowLeft : ArrowRight;
  return <div>
    <div className={cn("relative aspect-video overflow-hidden rounded-xl bg-muted", scenario.signal === "left" ? "marketing-left-turn-preview" : "marketing-right-turn-preview")}>
      <video ref={video} src={playFirst ? clip.videoUrl : `${clip.videoUrl}#t=${clip.pauseAt}`} muted playsInline preload="auto" aria-label={clip.title} className="h-full w-full object-cover" onTimeUpdate={e => { if (phase === "playing" && e.currentTarget.currentTime >= clip.pauseAt) freeze(); }} onEnded={freeze} onError={() => setError(true)} />
      <div aria-hidden="true" className="marketing-preview-signal-glow pointer-events-none absolute inset-0 rounded-[inherit]" />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-marketing-navy/90 px-3 py-1 text-xs font-semibold text-marketing-white"><Arrow aria-hidden="true" className="marketing-preview-signal-arrow size-3.5" />{clip.intent}</span>
      {phase === "ready" && <div className="absolute inset-0 grid place-items-center bg-card/40"><Button onClick={start}><Play />Play scenario</Button></div>}
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-destructive">Unable to load this clip. You can still answer.</p>}
    <p className="mt-3 text-left text-sm text-muted-foreground">{phase === "playing" ? "Watch the road…" : clip.subtitle}</p>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {DEMO_ACTIONS.map((id, i) => { const Icon = ACTION_ICONS[id]; return <Button key={id} type="button" variant="outline" aria-label={label[id]} data-action={id} disabled={phase !== "decision" || chosen !== null} onClick={() => { setChosen(i); onAnswer(i); }} className={cn("h-auto gap-2 rounded-lg bg-card py-2 text-xs font-semibold disabled:opacity-100", tone[id], chosen === i && "ring-2 ring-ring", phase !== "decision" && "opacity-60 disabled:opacity-60")}><Icon className="size-4" />{label[id]}</Button>; })}
    </div>
    {chosen !== null && <Feedback correct={DEMO_ACTIONS[chosen] === scenario.correct} text={scenario.explanation} answer={label[scenario.correct]} />}
  </div>;
}

export function QuestionCard({ question, onAnswer, chosen }: { question: DemoQuestion; onAnswer: (index: number) => void; chosen?: number }) {
  return <div className="text-left">
    {question.sign && <div className="mb-3 flex justify-center"><ExamQuestionVisual question={question} /></div>}
    <h3 className="font-display text-base font-semibold leading-relaxed sm:text-lg">{question.q}</h3>
    <div className="mt-3 grid gap-2">{question.options.map((answer, i) => <Button key={answer} type="button" variant="outline" disabled={chosen !== undefined} onClick={() => onAnswer(i)} className={cn("h-auto min-h-11 justify-start whitespace-normal rounded-lg px-3 py-2 text-left text-sm disabled:opacity-100", chosen !== undefined && i === question.correct && "border-success bg-success/10 text-success", chosen === i && i !== question.correct && "border-destructive bg-destructive/10 text-destructive")}>{answer}{chosen !== undefined && i === question.correct && <Check className="ml-auto shrink-0" />}</Button>)}</div>
    {chosen !== undefined && <Feedback correct={chosen === question.correct} text={question.explanation} />}
  </div>;
}

function TypedReply({ text }: { text: string }) {
  const words = text.split(" ");
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(words.length); return; }
    const t = window.setInterval(() => setCount(c => { if (c >= words.length) { window.clearInterval(t); return c; } return c + 1; }), 70);
    return () => window.clearInterval(t);
  }, [words.length]);
  return <p className="mt-1 leading-relaxed text-muted-foreground" aria-live="polite">{words.slice(0, count).join(" ")}</p>;
}

export function CoachChat({ question, chosen, onAnswer }: { question: DemoQuestion; chosen?: number; onAnswer: (index: number) => void }) {
  return <div>
    <QuestionCard question={question} chosen={chosen} onAnswer={onAnswer} />
    {chosen !== undefined && <div className="mt-4 space-y-3 text-left text-sm"><div className="ml-auto max-w-[85%] rounded-lg bg-marketing-navy p-3 text-marketing-white">Why is that the answer?</div><div className="max-w-[90%] rounded-lg bg-muted p-3"><p className="font-semibold text-success">AI Coach</p><TypedReply text={DEMO_COACH_REPLY} /></div></div>}
  </div>;
}
