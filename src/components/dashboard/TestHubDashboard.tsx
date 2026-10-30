import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, TrafficCone, GitFork, Beer, Gauge, RefreshCw, Lock, BookOpen, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { ExamQuestionVisual } from "./ExamQuestionVisual";
import { shuffleAnswers } from "@/data/dmv/question-generator";
import { buildPillarBanks, PILLAR_META, type PillarId } from "@/data/dmv/practice-bank";
import { pickUnseenQuestions } from "@/lib/seen-questions";
import { HUB_TOPICS, HUB_FREE_LIMIT, hubQuestion, emptyTopic, topicStats, weakestTopic, missedQuestions, mayAnswerHub, type HubQuestion, type TopicProgress } from "@/lib/test-hub";
import { hubProgressOptions, saveHubProgress } from "@/lib/test-hub.functions";

const ICONS = { signs: TrafficCone, intersections: GitFork, substances: Beer, speed: Gauge };
const actionClass = "bg-action text-action-foreground hover:bg-action-hover rounded-full";

export function TestHubDashboard({ initialTopic, userId }: { initialTopic?: PillarId; userId: string }) {
  const { isPro, unlockPro, state, freeUsage, bumpFreeUsage } = useUserProfile();
  const { data: rows } = useSuspenseQuery(hubProgressOptions(userId));
  const queryClient = useQueryClient();
  const save = useServerFn(saveHubProgress);
  const mutation = useMutation({
    mutationFn: save,
    onSuccess: (progress, variables) => {
      queryClient.setQueryData(hubProgressOptions(userId).queryKey, (old: typeof rows | undefined) => [
        ...(old ?? []).filter(row => row.state !== variables.data.state || row.progress.topic !== progress.topic),
        { state: variables.data.state, progress },
      ]);
    },
  });
  const progress = HUB_TOPICS.map(topic => rows.find(row => row.state === state && row.progress.topic === topic)?.progress ?? emptyTopic(topic));
  const [active, setActive] = useState<PillarId | "review" | null>(initialTopic ?? null);
  const missed = missedQuestions(progress);
  const weakest = weakestTopic(progress);
  const banks = useMemo(() => {
    const raw = buildPillarBanks(state);
    return Object.fromEntries(HUB_TOPICS.map(topic => [topic, [...new Map(raw[topic].map(q => { const item = hubQuestion(q, topic); return [item.key, item]; })).values()]])) as Record<PillarId, HubQuestion[]>;
  }, [state]);

  if (active) return <QuizRunner key={`${state}:${active}`} mode={active} banks={banks} missed={missed} progress={progress}
    isPro={isPro} usage={freeUsage.pillars} stateName={state} onExit={() => setActive(null)} onUpgrade={unlockPro}
    onAnswered={topic => bumpFreeUsage(`pillar:${topic}`)}
    onSave={data => mutation.mutateAsync({ data: { state, ...data } })} />;

  return <div className="max-w-5xl mx-auto space-y-5 w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-card rounded-[28px] border-border/60 p-5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2"><Target className="h-5 w-5" /><h2 className="font-display font-bold">Recommended for you</h2></div>
        <p className="font-semibold">{PILLAR_META[weakest].title}</p>
        <p className="text-sm text-muted-foreground">Mastery {topicStats(progress.find(p => p.topic === weakest) ?? emptyTopic(weakest)).mastery}%</p>
        <Button className={cn(actionClass, "mt-auto h-11")} onClick={() => setActive(weakest)}>Practice now</Button>
      </Card>
      <Card className="bg-card rounded-[28px] border-border/60 p-5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5" /><h2 className="font-display font-bold">Review missed questions</h2></div>
        <p className="font-semibold">{missed.length} {missed.length === 1 ? "question" : "questions"}</p>
        <p className="text-sm text-muted-foreground">{missed.length ? "Your missed questions, across all topics." : "No missed questions to review."}</p>
        <Button variant="outline" className="mt-auto rounded-full h-11" disabled={!missed.length} onClick={() => setActive("review")}>Review questions</Button>
      </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {HUB_TOPICS.map(topic => {
        const Icon = ICONS[topic];
        const stats = topicStats(progress.find(p => p.topic === topic) ?? emptyTopic(topic));
        const remaining = Math.max(0, HUB_FREE_LIMIT - (freeUsage.pillars[topic] ?? 0));
        const locked = !isPro && !remaining;
        return <Card key={topic} className="bg-card rounded-[28px] border-border/60 p-5 shadow-md flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[18px] border border-border bg-muted shrink-0"><Icon className="w-5 h-5" /></span>
            <div className="min-w-0"><div className="flex items-center flex-wrap gap-2"><h3 className="font-display text-base font-bold">{PILLAR_META[topic].title}</h3><Badge className="bg-muted text-foreground border-border">Pro</Badge></div><p className="text-sm text-muted-foreground mt-1">{Math.min(8, banks[topic].length)} questions</p></div>
          </div>
          <div className="space-y-2"><div className="flex items-center justify-between gap-2 text-sm"><span>Mastery {stats.mastery}%</span>{stats.mastered ? <Badge variant="outline" className="text-success border-success/30"><Check className="h-3 w-3 mr-1" />Mastered</Badge> : stats.needsWork ? <Badge variant="outline" className="text-muted-foreground">Needs work</Badge> : null}</div><Meter value={stats.mastery} /></div>
          <p className="text-sm text-muted-foreground">Last score <span className="text-foreground font-semibold">{stats.lastScore === null ? "—" : `${stats.lastScore}%`}</span></p>
          {!isPro && <p className="text-xs text-muted-foreground">{locked ? "Free limit reached for this section." : `${remaining} of 10 free lifetime questions left`}</p>}
          <Button onClick={() => locked ? unlockPro() : setActive(topic)} className={cn(actionClass, "w-full h-11 mt-auto font-semibold")}>{locked ? <><Lock className="h-4 w-4" />Unlock with Pro Pass</> : stats.practiced ? "Continue" : "Start Test"}</Button>
        </Card>;
      })}
    </div>
  </div>;
}

function Meter({ value }: { value: number }) {
  return <div className="h-1.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-action rounded-full transition-all" style={{ width: `${value}%` }} /></div>;
}

type SaveInput = { topic: PillarId; answer?: { question: HubQuestion; correct: boolean }; score?: number };
function QuizRunner({ mode, banks, missed, progress, stateName, isPro, usage, onAnswered, onUpgrade, onExit, onSave }: {
  mode: PillarId | "review"; banks: Record<PillarId, HubQuestion[]>; missed: HubQuestion[]; progress: TopicProgress[];
  stateName: string; isPro: boolean; usage: Record<string, number>; onAnswered: (topic: PillarId) => void;
  onUpgrade: () => void; onExit: () => void; onSave: (data: SaveInput) => Promise<TopicProgress>;
}) {
  const buildSet = () => mode === "review" ? missed.map(q => shuffleAnswers(q) as HubQuestion) : pickUnseenQuestions(`pillar:${mode}`, stateName, banks[mode], Math.min(8, banks[mode].length)).map(q => shuffleAnswers(q) as HubQuestion);
  const [questions, setQuestions] = useState(buildSet);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const charged = useRef(false);
  const [saved, setSaved] = useState(false);
  const [before, setBefore] = useState(() => mode === "review" ? 0 : topicStats(progress.find(p => p.topic === mode) ?? emptyTopic(mode)).mastery);
  const q = questions[idx];
  const reveal = picked !== null;
  const locked = q && !mayAnswerHub(isPro, usage[q.topic] ?? 0);
  const title = mode === "review" ? "Review missed questions" : PILLAR_META[mode].title;

  const persistAnswer = async (i: number) => {
    if (!q || busy.current) return;
    busy.current = true; setSaving(true); setError(null);
    try {
      await onSave({ topic: q.topic, answer: { question: q, correct: i === q.correct } });
      if (!charged.current) { onAnswered(q.topic); charged.current = true; }
      setSaved(true);
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
      setIdx(i => i + 1); setPicked(null); setSaved(false); charged.current = false; setError(null); return;
    }
    busy.current = true; setSaving(true); setError(null);
    try {
      if (mode !== "review") await onSave({ topic: mode, score: Math.round(score / questions.length * 100) });
      setDone(true);
    } catch { setError("Your result could not be saved. Please try again."); }
    finally { busy.current = false; setSaving(false); }
  };
  const restart = () => {
    if (mode !== "review") setBefore(topicStats(progress.find(p => p.topic === mode) ?? emptyTopic(mode)).mastery);
    setQuestions(buildSet()); setIdx(0); setPicked(null); setScore(0); setDone(false); setError(null); setSaved(false); charged.current = false;
  };
  const back = <Button variant="ghost" className="text-muted-foreground px-0 hover:bg-transparent" onClick={onExit} disabled={saving}><ArrowLeft className="h-4 w-4" />Back to Hub</Button>;

  if (done || !q) return <div className="max-w-2xl mx-auto w-full space-y-4">{back}<Card className="bg-card rounded-[28px] border-border/60 shadow-md p-7 text-center">
    <h2 className="font-display font-bold text-lg">{title}</h2>
    <p className="text-5xl font-display font-bold mt-4">{questions.length ? Math.round(score / questions.length * 100) : 0}%</p>
    <p className="text-muted-foreground mt-2">{score} / {questions.length} correct</p>
    {mode !== "review" && <p className="mt-4 font-medium">Mastery {before}% → {topicStats(progress.find(p => p.topic === mode) ?? emptyTopic(mode)).mastery}%</p>}
    <div className="flex flex-wrap justify-center gap-3 mt-6"><Button className={actionClass} onClick={restart} disabled={mode === "review" && !missed.length}><RefreshCw className="h-4 w-4" />Practice again</Button><Button variant="outline" className="rounded-full" onClick={onExit}>Back to Hub</Button></div>
  </Card></div>;

  return <div className="max-w-3xl mx-auto w-full space-y-4">
    <div className="flex items-center justify-between gap-3">{back}<span className="text-xs text-muted-foreground text-right">{title} · {idx + 1} / {questions.length}</span></div>
    <Meter value={(idx + (reveal ? 1 : 0)) / questions.length * 100} />
    {locked && !reveal ? <Card className="bg-card rounded-[28px] border-border/60 p-7 text-center space-y-4"><Lock className="h-6 w-6 mx-auto" /><h2 className="font-bold">Free limit reached · {PILLAR_META[q.topic].title}</h2><p className="text-sm text-muted-foreground">You've answered your 10 free lifetime questions for this section.</p><Button className={actionClass} onClick={onUpgrade}>Get Pro Pass — $9</Button>{mode === "review" && idx + 1 < questions.length && <Button variant="outline" className="rounded-full ml-2" onClick={() => { setQuestions(list => list.filter((_, i) => i !== idx)); }}>Skip section</Button>}</Card> : <Card className="bg-card border-border/60 shadow-md p-5 sm:p-7 rounded-[28px]">
      <ExamQuestionVisual question={q} />
      <h3 className="font-display text-lg font-semibold mb-5">{q.q}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((option, i) => <Button key={i} variant="outline" disabled={reveal} onClick={() => choose(i)} aria-pressed={picked === i}
          className={cn("h-auto min-h-16 whitespace-normal text-left justify-between p-4 rounded-xl font-medium disabled:opacity-100",
            reveal && i === q.correct && "border-success/40 bg-success/10 text-success",
            reveal && picked === i && i !== q.correct && "border-destructive/40 bg-destructive/10 text-destructive",
            reveal && picked !== i && i !== q.correct && "text-muted-foreground")}>
          <span><span className="text-muted-foreground mr-2">{i + 1}.</span>{option}</span>
          {reveal && i === q.correct && <Check className="h-4 w-4 shrink-0" />}{reveal && picked === i && i !== q.correct && <X className="h-4 w-4 shrink-0" />}
        </Button>)}
      </div>
      {reveal && <div className="mt-5 border-t border-border pt-5" aria-live="polite"><p className={cn("font-semibold mb-2", picked === q.correct ? "text-success" : "text-destructive")}>{picked === q.correct ? "Correct" : "Not quite"}</p><p className="text-sm leading-relaxed">{q.explanation}</p>
        {error && <p role="alert" className="text-destructive text-sm mt-3">{error}</p>}
        {error && !saved && picked !== null ? <Button className={cn(actionClass, "mt-4")} onClick={() => void persistAnswer(picked)} disabled={saving}>Retry save</Button> : <Button className={cn(actionClass, "mt-4")} onClick={() => void advance()} disabled={saving || !saved}>{saving ? "Saving…" : idx + 1 === questions.length ? "See results" : "Next question"}</Button>}
      </div>}
    </Card>}
  </div>;
}
