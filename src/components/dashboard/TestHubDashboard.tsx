import { useEffect, useMemo, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, TrafficCone, GitFork, Beer, Gauge, RefreshCw, Lock, BookOpen, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { StudyQuestionFrame } from "./StudyQuestionFrame";
import { HubQuestionVisual } from "./HubQuestionVisual";
import { buildPillarBanks, PILLAR_META, type PillarId } from "@/data/dmv/practice-bank";
import { HUB_TOPICS, hubQuestion, emptyTopic, topicStats, weakestTopic, missedQuestions, type HubQuestion, type TopicProgress } from "@/lib/test-hub";
import { useStudyAttempts } from "@/lib/use-study-attempt";
import { attemptAccess, type StudyAttempt, type StudyFeature } from "@/lib/study-attempt";
import { AttemptLock } from "./AttemptLock";
import { hubProgressOptions } from "@/lib/test-hub.functions";

const ICONS = { signs: TrafficCone, intersections: GitFork, substances: Beer, speed: Gauge };
const actionClass = "bg-action text-action-foreground hover:bg-action-hover rounded-full";

export function TestHubDashboard({ initialTopic, userId }: { initialTopic?: PillarId; userId: string }) {
  const { isPro, unlockPro, state } = useUserProfile();
  const store=useStudyAttempts(userId);
  const [attempt,setAttempt]=useState<StudyAttempt|null>(null);
  const begin=async (topic:StudyFeature) => { if(topic === "review" && !isPro) {unlockPro();return;} const row=await store.start(topic);if(row){setAttempt(row);setActive(row.feature as PillarId|"review");} };
  const { data: rows } = useSuspenseQuery(hubProgressOptions(userId));
  const progress = HUB_TOPICS.map(topic => rows.find(row => row.state === state && row.progress.topic === topic)?.progress ?? emptyTopic(topic));
  const [active, setActive] = useState<PillarId | "review" | null>(null);
  const missed = missedQuestions(progress);
  const banks = useMemo(() => {
    const raw = buildPillarBanks(state);
    return Object.fromEntries(HUB_TOPICS.map(topic => [topic, [...new Map(raw[topic].map(q => { const item = hubQuestion(q, topic); return [item.key, item]; })).values()]])) as Record<PillarId, HubQuestion[]>;
  }, [state]);
  const totals = Object.fromEntries(HUB_TOPICS.map(topic => [topic, banks[topic].length]));
  const weakest = weakestTopic(progress, totals);

  if (active && attempt) return <QuizRunner key={attempt.id} mode={active} banks={banks} missed={missed} progress={progress}
    attempt={attempt} isPro={isPro} stateName={attempt.state} onExit={() => setActive(null)} onUpgrade={unlockPro}
    onRestart={() => void begin(active)} onAnswer={async (answer) => {const row=await store.answer({id:attempt.id,version:attempt.version,answer});if(!row)throw new Error('Unable to save');setAttempt(row);}} />;

  return <div className="w-full space-y-4">
    {store.error && <p role="alert" className="text-sm text-destructive">{store.error}</p>}
    {initialTopic && <Button disabled={store.busy} onClick={()=>void begin(initialTopic)} className={actionClass}>Practice {PILLAR_META[initialTopic].title}</Button>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card rounded-[28px] border-border/60 p-4 sm:p-6 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2"><Target className="h-5 w-5" /><h2 className="font-display font-bold">Recommended for you</h2></div>
        <p className="font-semibold">{PILLAR_META[weakest].title}</p>
        <p className="text-sm text-muted-foreground">Mastery {topicStats(progress.find(p => p.topic === weakest) ?? emptyTopic(weakest), banks[weakest].length).mastery}%</p>
        <Button className={cn(actionClass, "mt-auto h-11")} disabled={store.busy} onClick={() => void begin(weakest)}>Practice now</Button>
      </Card>
      <Card className="bg-card rounded-[28px] border-border/60 p-4 sm:p-6 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5" /><h2 className="font-display font-bold">Review missed questions</h2></div>
        <p className="font-semibold">{missed.length} {missed.length === 1 ? "question" : "questions"}</p>
        <p className="text-sm text-muted-foreground">{missed.length ? "Your missed questions, across all topics." : "No missed questions to review."}</p>
        <Button variant="outline" className="mt-auto rounded-full h-11" disabled={isPro && !missed.length || store.busy} onClick={() => void begin("review")}>{!isPro && <Lock/>}{isPro ? "Review questions" : "Upgrade to Pro"}</Button>
      </Card>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {HUB_TOPICS.map(topic => {
        const Icon = ICONS[topic];
        const stats = topicStats(progress.find(p => p.topic === topic) ?? emptyTopic(topic), banks[topic].length);
        const access=attemptAccess(isPro,store.attempts.find(a=>a.feature===topic && a.free_slot));
        const locked=access==="locked";
        return <Card key={topic} className="bg-card rounded-[28px] border-border/60 p-4 sm:p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[18px] border border-border bg-muted shrink-0"><Icon className="w-5 h-5" /></span>
            <div className="min-w-0"><div className="flex items-center flex-wrap gap-2"><h3 className="font-display text-base font-bold">{PILLAR_META[topic].title}</h3><Badge className="bg-muted text-foreground border-border">Pro</Badge></div><p className="text-sm text-muted-foreground mt-1">{banks[topic].length} questions</p></div>
          </div>
          <div className="space-y-2"><div className="flex items-center justify-between gap-2 text-sm"><span>Mastery {stats.mastery}%</span>{stats.mastered ? <Badge variant="outline" className="text-success border-success/30"><Check className="h-3 w-3 mr-1" />Mastered</Badge> : stats.needsWork ? <Badge variant="outline" className="text-muted-foreground">Needs work</Badge> : null}</div><Meter value={stats.mastery} /></div>
          <p className="text-sm text-muted-foreground">Last score <span className="text-foreground font-semibold">{stats.lastScore === null ? "—" : `${stats.lastScore}%`}</span></p>
          {locked && <AttemptLock onUpgrade={unlockPro}/>}
          <Button disabled={store.busy} onClick={() => void begin(topic)} className={cn(actionClass, "w-full h-11 mt-auto font-semibold")}>{locked ? "View past results" : access === "resume" ? "Resume your free attempt" : stats.practiced ? "Continue" : "Start Test"}</Button>
        </Card>;
      })}
    </div>
  </div>;
}

function Meter({ value, className }: { value: number; className?: string }) {
  return <div className={cn("h-1.5 rounded-full bg-muted overflow-hidden", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-action rounded-full transition-all" style={{ width: `${value}%` }} /></div>;
}

function QuizRunner({ mode, banks, missed, progress, stateName, isPro, onUpgrade, onExit, attempt, onRestart, onAnswer }: {
  mode: PillarId | "review"; banks: Record<PillarId, HubQuestion[]>; missed: HubQuestion[]; progress: TopicProgress[];
  stateName: string; isPro: boolean; onUpgrade: () => void; onExit: () => void; attempt:StudyAttempt;
  onRestart:()=>void; onAnswer:(answer:number)=>Promise<void>;
}) {
  const questions=attempt.payload as HubQuestion[];
  const [idx,setIdx]=useState(()=>Math.min(attempt.version,questions.length-1));
  const [picked,setPicked]=useState<number|null>(null);
  const [score,setScore]=useState(()=>attempt.answers.filter((a,i)=>a===questions[i]?.correct).length);
  const [done,setDone]=useState(attempt.completed);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const [saved, setSaved] = useState(false);
  const [before, setBefore] = useState(() => mode === "review" ? 0 : topicStats(progress.find(p => p.topic === mode) ?? emptyTopic(mode), banks[mode].length).mastery);
  const q = questions[idx];
  const reveal = picked !== null;
  const locked = saving;
  const title = mode === "review" ? "Review missed questions" : PILLAR_META[mode].title;

  const persistAnswer = async (i: number) => {
    if (!q || busy.current) return;
    busy.current = true; setSaving(true); setError(null);
    try {
      await onAnswer(i);
      setSaved(true); if(idx===questions.length-1) setDone(true);
    } catch { setError("Your progress could not be saved. Please try again."); }
    finally { busy.current = false; setSaving(false); }
  };
  const choose = (i: number) => {
    if (!q || reveal || busy.current || locked || i < 0 || i >= q.options.length) return;
    setPicked(i); if (i === q.correct) setScore(s => s + 1);
    void persistAnswer(i);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))) return;
      if (/^[1-4]$/.test(event.key)) { event.preventDefault(); choose(Number(event.key) - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const advance = async () => {
    if (!saved || busy.current) return;
    if (idx + 1 < questions.length) {
      setIdx(i => i + 1); setPicked(null); setSaved(false); setError(null); return;
    }
    setDone(true);
  };
  const restart = () => {if(isPro)onRestart();else onUpgrade();};
  const back = <Button variant="ghost" className="text-muted-foreground px-0 hover:bg-transparent" onClick={onExit} disabled={saving}><ArrowLeft className="h-4 w-4" />Back to Hub</Button>;

  if (done || !q) return <div className="max-w-2xl mx-auto w-full space-y-4">{back}<Card className="bg-card rounded-[28px] border-border/60 shadow-md p-4 sm:p-6 text-center">
    <h2 className="font-display font-bold text-lg">{title}</h2>
    <p className="text-5xl font-display font-bold mt-4">{questions.length ? Math.round(score / questions.length * 100) : 0}%</p>
    <p className="text-muted-foreground mt-2">{score} / {questions.length} correct</p>
    {mode !== "review" && <p className="mt-4 font-medium">Mastery {before}% → {topicStats(progress.find(p => p.topic === mode) ?? emptyTopic(mode), banks[mode].length).mastery}%</p>}
    <div className="flex flex-wrap justify-center gap-3 mt-6"><Button className={actionClass} onClick={restart} disabled={mode === "review" && !missed.length}><RefreshCw className="h-4 w-4" />{isPro ? "Practice again" : "Upgrade to Pro"}</Button><Button variant="outline" className="rounded-full" onClick={onExit}>Back to Hub</Button></div>
    {!isPro && <AttemptLock onUpgrade={onUpgrade}/>}
  </Card></div>;

  return <StudyQuestionFrame>
    <div className="study-question-meta flex items-center justify-between gap-3">{back}<span className="text-xs text-muted-foreground text-right">{title} · {idx + 1} / {questions.length}</span></div>
    <Meter className="study-progress" value={(idx + (reveal ? 1 : 0)) / questions.length * 100} />
    {<Card className="study-question-card bg-card border-border/60 shadow-md rounded-[28px]">
      <HubQuestionVisual question={q} />
      <h3 className="font-display text-lg font-semibold">{q.q}</h3>
      <div className="study-answers">
        {q.options.map((option, i) => <Button key={i} variant="outline" disabled={reveal} onClick={() => choose(i)} aria-pressed={picked === i}
          className={cn("h-auto min-h-16 whitespace-normal text-left justify-between p-4 rounded-xl font-medium disabled:opacity-100",
            reveal && i === q.correct && "border-success/40 bg-success/10 text-success",
            reveal && picked === i && i !== q.correct && "border-destructive/40 bg-destructive/10 text-destructive",
            reveal && picked !== i && i !== q.correct && "text-muted-foreground")}>
          <span><span className="text-muted-foreground mr-2">{i + 1}.</span>{option}</span>
          {reveal && i === q.correct && <Check className="h-4 w-4 shrink-0" />}{reveal && picked === i && i !== q.correct && <X className="h-4 w-4 shrink-0" />}
        </Button>)}
      </div>
      {reveal && <div className="study-feedback" aria-live="polite"><p className={cn("font-semibold mb-2", picked === q.correct ? "text-success" : "text-destructive")}>{picked === q.correct ? "Correct" : "Incorrect"}</p><p className="text-sm leading-relaxed">{q.explanation}</p>
        {error && <p role="alert" className="text-destructive text-sm mt-3">{error}</p>}
        <div className="study-next">{error && !saved && picked !== null ? <Button className={actionClass} onClick={() => void persistAnswer(picked)} disabled={saving}>Retry save</Button> : <Button className={actionClass} onClick={() => void advance()} disabled={saving || !saved}>{saving ? "Saving…" : idx + 1 === questions.length ? "See results" : "Next question"}</Button>}</div>
      </div>}
    </Card>}
  </StudyQuestionFrame>;
}
