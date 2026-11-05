import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RestrictedProBadge } from "./RestrictedProBadge";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, RefreshCw, Timer, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { getStatePack } from "@/data/dmv";
import { PILLAR_META } from "@/data/dmv/practice-bank";
import { examSummary, examHistoryStats, type ExamQuestion } from "@/lib/mock-exam";
import { examHistoryOptions } from "@/lib/mock-exam.functions";
import { ExamQuestionVisual } from "./ExamQuestionVisual";
import { useStudyAttempts } from "@/lib/use-study-attempt";
import { attemptAccess, type StudyAttempt } from "@/lib/study-attempt";
import { AttemptLock } from "./AttemptLock";
import { RecentResultsCard } from "./RecentResultsCard";
import { StudyQuestionFrame } from "./StudyQuestionFrame";
import { permitRules } from "@/lib/permit-rules";

const card = "bg-card rounded-[28px] border border-border/60 p-8 shadow-lg";

export function PermitExamSimulator({ userId }: { userId: string }) {
  const { isPro, unlockPro, state, under18 } = useUserProfile();
  const store = useStudyAttempts(userId);
  const [attempt, setAttempt] = useState<StudyAttempt | null>(null);
  const freeAttempt = store.attempts.find(a => a.feature === "exam" && a.free_slot);
  const access = attemptAccess(isPro, freeAttempt);
  const begin = async () => { const row = await store.start("exam"); if(row) {setAttempt(row); setRunning(true);} };
  const { data: history } = useSuspenseQuery(examHistoryOptions(userId));
  const [running, setRunning] = useState(false);
  const pack = { rules: permitRules(state, under18) };
  const stats = examHistoryStats(history, pack.rules.name);
  if (running && attempt) { const rules=permitRules(attempt.state, attempt.state === "California" ? attempt.payload.length !== 36 : under18); return <ExamRunner key={attempt.id} attempt={attempt} state={attempt.state} count={attempt.payload.length} minCorrect={rules.minCorrectToPass} passPct={rules.passingScorePct} isPro={isPro} onUpgrade={unlockPro} onExit={() => setRunning(false)} onRestart={() => void begin()} saveError={store.error} onFinish={store.finish} onAnswer={(answer,version) => store.answer({id:attempt.id,version,answer})} />; }
  const recentRows = history
    .filter(row => row.state === null || row.state === pack.rules.name)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3)
    .map(row => ({
      id: row.id,
      date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      primary: `${row.score_pct}%`,
      secondary: row.score_pct >= pack.rules.passingScorePct ? "Passed" : "Not passed",
      tone: (row.score_pct >= pack.rules.passingScorePct ? "success" : "destructive") as "success" | "destructive",
    }));
  return <div className="w-full space-y-4">
    <Card className={card}>
      <div className="flex items-center gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-border bg-muted sm:h-14 sm:w-14"><Timer className="h-6 w-6" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-bold sm:text-xl">{pack.rules.name} DMV Permit Exam</h3><RestrictedProBadge restricted={access === "locked"}/></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Matches the real {pack.rules.name} DMV knowledge test: {pack.rules.questionsCount} questions, {pack.rules.minCorrectToPass} correct to pass.</p></div></div>
      <div className="mt-6 grid grid-cols-2 gap-3"><Stat label="Questions" value={String(pack.rules.questionsCount)} /><Stat label="Pass score" value={`${pack.rules.passingScorePct}%`} /></div>
      <div className="mt-3 grid grid-cols-3 gap-3"><Stat label="Best score" value={stats.best === null ? "—" : `${stats.best}%`} /><Stat label="Last score" value={stats.last === null ? "—" : `${stats.last}%`} /><Stat label="Attempts" value={stats.attempts === null ? "—" : String(stats.attempts)} /></div>
      {access === 'locked' && <AttemptLock onUpgrade={unlockPro}/>}
      <Button variant={access === 'locked' ? 'secondary' : 'default'} disabled={store.busy} onClick={() => void begin()} className="mt-6 h-14 w-full rounded-full text-base font-semibold">{access === 'resume' ? 'Resume your free attempt' : access === 'locked' ? 'View past results' : 'Start full-length exam'}</Button>
      {store.error && <p role="alert" className="mt-3 text-sm text-destructive">{store.error}</p>}
    </Card>
    <RecentResultsCard rows={recentRows} />
  </div>;
}

function ExamRunner({ attempt, state, count, minCorrect, passPct, isPro, onUpgrade, onExit, onRestart, onAnswer, onFinish, saveError }: { attempt: StudyAttempt; state: string; count: number; minCorrect: number; passPct: number; isPro: boolean; onUpgrade: () => void; onExit: () => void; onRestart: () => void; onAnswer: (answer: number,version:number) => void; onFinish:()=>Promise<boolean>; saveError:string|null }) {
  const questions = attempt.payload as ExamQuestion[];
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array.from({length:questions.length}, (_,i) => (attempt.answers[i] as number|undefined) ?? null));
  const [idx, setIdx] = useState(() => Math.min(attempt.version,questions.length-1));
  const [done, setDone] = useState(attempt.completed);
  const [finishing,setFinishing]=useState(false);
  const finishLock=useRef(false);
  const answersRef = useRef(answers);

  const submitLock = useRef(false);

  const q = questions[idx];
  const summary = examSummary(questions, answers, minCorrect);
  const answered = answers.filter(answer => answer !== null).length;
  const correctCount = answers.filter((answer, index) => answer !== null && answer === questions[index]?.correct).length;
  const chosen = answers[idx] ?? null;
  const locked = false;
  const isLast = idx === questions.length - 1;
  const choose = useCallback((answer: number) => {
    if (done || answersRef.current[idx] !== null) return;
    const next=[...answersRef.current]; next[idx]=answer; answersRef.current=next; setAnswers(next);
    onAnswer(answer,idx);
  }, [idx,done,onAnswer]);
  const advance = useCallback(async () => {
    if (answersRef.current[idx] === null || finishLock.current) return;
    if (!isLast) {setIdx(value=>value+1);return;}
    finishLock.current=true;const timer=setTimeout(()=>setFinishing(true),500);
    try{if(await onFinish())setDone(true);}finally{clearTimeout(timer);setFinishing(false);finishLock.current=false;}
  }, [idx,isLast,onFinish]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || (target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName)))) return;
      if (done) return;
      const answer = Number(event.key) - 1;
      if (/^[1-4]$/.test(event.key) && q?.options[answer] !== undefined) { event.preventDefault(); choose(answer); }
      else if (event.key === "Enter" && answersRef.current[idx] !== null) { event.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, [q, idx, done, choose, advance]);
  const restart = () => { if(isPro) onRestart(); else onUpgrade(); };
  if (done) return <div className="w-full space-y-4">
    <Card className={card}>
      <div className="text-center"><h2 className={cn("font-display text-4xl font-bold sm:text-5xl", summary.passed ? "text-success" : "text-destructive")}>{summary.passed ? "Passed" : "Not passed"}</h2><p className="mt-3 font-display text-2xl font-semibold text-progress-text">{summary.correct} / {questions.length} · {summary.pct}%</p></div>
      <div className="relative mt-6"><Meter pct={summary.pct} success={summary.passed} /><span className="absolute -top-1 h-4 w-0.5 bg-foreground" style={{ left: `${passPct}%` }} /><p className="mt-2 text-right text-xs text-muted-foreground">Pass line: {passPct}%</p></div>
      <section className="mt-7"><h3 className="font-display text-lg font-bold">By topic</h3><div className="mt-3 divide-y divide-border">{summary.topics.map(topic => <div key={topic.topic} className="py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{PILLAR_META[topic.topic].title}</span>{topic.needsWork && <Badge className="border border-destructive/30 bg-destructive/10 text-destructive">Needs work</Badge>}</div><span className="text-sm tabular-nums text-progress-text">{topic.pct === null ? "—" : `${topic.pct}%`}</span></div><div className="mt-2"><Meter pct={topic.pct ?? 0} success={!topic.needsWork} /></div>{topic.needsWork && <Button variant="secondary" asChild className="mt-3 rounded-full"><Link to="/app" search={{ tab: "test-hub", topic: topic.topic }}>Practice this<ArrowRight /></Link></Button>}</div>)}</div></section>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={restart} className="h-12 flex-1 rounded-full"><RefreshCw />{isPro ? "Retake exam" : "Upgrade to Pro"}</Button><Button variant="secondary" asChild className="h-12 flex-1 rounded-full"><Link to="/app" search={{ tab: "chat" }}>Back to dashboard</Link></Button></div>
    </Card>
  </div>;
  return <StudyQuestionFrame>
    <div className="study-question-meta flex items-center justify-between gap-3"><Button variant="ghost" onClick={onExit} className="h-8 px-0 text-xs text-muted-foreground"><ArrowLeft />Exit exam</Button><span className="text-right text-xs text-muted-foreground">{state} · {idx + 1} / {questions.length}<span className="ml-2 tabular-nums">· <span className="text-success">{correctCount} correct</span> · <span className="text-destructive">{answered - correctCount} incorrect</span></span></span></div>
    <Meter className="study-progress" pct={answered / questions.length * 100} />
    {q ? <Card className={cn(card, "study-question-card")}>
      <ExamQuestionVisual question={q} /><h3 className="font-display text-lg font-semibold">{q.q}</h3>
      <div className="study-answers">{q.options.map((option, index) => {
        const isCorrect = index === q.correct; const picked = chosen === index; const revealed = chosen !== null;
        return <Button key={index} variant="secondary" onClick={() => choose(index)} disabled={locked || revealed} aria-pressed={picked} className={cn("h-auto min-h-14 justify-start whitespace-normal rounded-2xl border-2 px-4 py-3 text-left text-sm leading-relaxed disabled:opacity-100", !revealed && "border-transparent", revealed && isCorrect && "border-success/60 bg-success/10 text-foreground", revealed && picked && !isCorrect && "border-destructive/60 bg-destructive/10 text-foreground", revealed && !picked && !isCorrect && "border-transparent opacity-60")}><span className="shrink-0 text-xs text-muted-foreground">{index + 1}</span><span>{option}</span>{revealed && isCorrect && <Check className="ml-auto text-success" />}</Button>;
      })}</div>
      {chosen !== null && <div className="study-feedback" aria-live="polite">
        <p className={cn("text-sm font-semibold", chosen === q.correct ? "text-success" : "text-destructive")}>{chosen === q.correct ? "Correct" : "Incorrect"}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.explanation.replace(/\s*Source:.*$/s, "").split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}</p>
        {saveError && <p role="alert" className="mt-3 text-sm text-destructive">{saveError}</p>}
        <div className="study-next"><Button onClick={()=>void advance()} disabled={finishing} className="h-11 rounded-full">{finishing ? "Finishing up…" : isLast ? "See results" : "Next question"}<ArrowRight /></Button></div>
      </div>}
    </Card> : null}
  </StudyQuestionFrame>;
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="flex h-[120px] flex-col items-center justify-center rounded-3xl bg-muted px-2 text-center"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className={cn("mt-1 font-display text-3xl font-bold sm:text-4xl",label.includes("score") && "text-progress-text")}>{value}</p></div>; }
function Meter({ pct, success, className }: { pct: number; success?: boolean; className?: string }) { return <div className={cn("flex h-1.5", className, " overflow-hidden rounded-full bg-muted")}><span className={cn("h-full", "bg-progress")} style={{ width: `${pct}%` }} /></div>; }
