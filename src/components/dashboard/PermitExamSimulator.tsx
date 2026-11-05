import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Lock, RefreshCw, Timer, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { getStatePack } from "@/data/dmv";
import { PILLAR_META } from "@/data/dmv/practice-bank";
import { shuffleAnswers } from "@/data/dmv/question-generator";
import { pickUnseenQuestions } from "@/lib/seen-questions";
import { buildExamPool, examSummary, examHistoryStats, mayAnswerExam, EXAM_FREE_LIMIT, type ExamQuestion } from "@/lib/mock-exam";
import { examHistoryOptions } from "@/lib/mock-exam.functions";
import { ExamQuestionVisual } from "./ExamQuestionVisual";
import { StudyQuestionFrame } from "./StudyQuestionFrame";

const card = "bg-card rounded-[28px] border border-border/60 p-5 sm:p-7 shadow-lg";

export function PermitExamSimulator({ userId }: { userId: string }) {
  const { isPro, unlockPro, state, freeUsage, bumpFreeUsage, recordQuizScore } = useUserProfile();
  const { data: history } = useSuspenseQuery(examHistoryOptions(userId));
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const pack = getStatePack(state);
  const stats = examHistoryStats(history, pack.rules.name);
  const complete = async (pct: number) => {
    await recordQuizScore(pct, "mock", pack.rules.name);
    await queryClient.invalidateQueries({ queryKey: ["mock-exam-history", userId] });
  };
  if (running) return <ExamRunner key={state} state={pack.rules.name} count={pack.rules.questionsCount} minCorrect={pack.rules.minCorrectToPass} passPct={pack.rules.passingScorePct} isPro={isPro} used={freeUsage.exam} onAnswered={() => bumpFreeUsage("exam")} onUpgrade={unlockPro} onExit={() => setRunning(false)} onComplete={complete} />;
  return <div className="mx-auto w-full max-w-3xl space-y-4">
    <Card className={card}>
      <div className="flex items-center gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-border bg-muted sm:h-14 sm:w-14"><Timer className="h-6 w-6" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-bold sm:text-xl">{pack.rules.name} DMV Permit Exam</h3><Badge className="border border-border bg-muted text-foreground">{isPro ? "Pro" : "Free preview"}</Badge></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Matches the real {pack.rules.name} DMV knowledge test: {pack.rules.questionsCount} questions, {pack.rules.minCorrectToPass} correct to pass.</p></div></div>
      <div className="mt-6 grid grid-cols-2 gap-3"><Stat label="Questions" value={String(pack.rules.questionsCount)} /><Stat label="Pass score" value={`${pack.rules.passingScorePct}%`} /></div>
      <div className="mt-3 grid grid-cols-3 gap-3"><Stat label="Best score" value={stats.best === null ? "—" : `${stats.best}%`} /><Stat label="Last score" value={stats.last === null ? "—" : `${stats.last}%`} /><Stat label="Attempts" value={stats.attempts === null ? "—" : String(stats.attempts)} /></div>
      <Button onClick={() => isPro || freeUsage.exam < EXAM_FREE_LIMIT ? setRunning(true) : unlockPro()} className="mt-6 h-12 w-full rounded-full text-base font-semibold">{!isPro && freeUsage.exam >= EXAM_FREE_LIMIT ? <><Lock />Unlock with Pro Pass</> : "Start full-length exam"}</Button>
    </Card>
    {!isPro && <p className="text-center text-xs text-muted-foreground">{Math.max(0, EXAM_FREE_LIMIT - freeUsage.exam)} of {EXAM_FREE_LIMIT} free lifetime exam questions left. Upgrade for unlimited practice.</p>}
  </div>;
}

function ExamRunner({ state, count, minCorrect, passPct, isPro, used, onAnswered, onUpgrade, onExit, onComplete }: { state: string; count: number; minCorrect: number; passPct: number; isPro: boolean; used: number; onAnswered: () => void; onUpgrade: () => void; onExit: () => void; onComplete: (pct: number) => Promise<void> }) {
  const buildSet = () => pickUnseenQuestions("exam:full", state, buildExamPool(state), count).map(q => shuffleAnswers(q) as ExamQuestion);
  const [questions, setQuestions] = useState(buildSet);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(count).fill(null));
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const answersRef = useRef(answers);
  const usedRef = useRef(used);
  const submitLock = useRef(false);
  useEffect(() => { usedRef.current = used; }, [used]);
  const q = questions[idx];
  const summary = examSummary(questions, answers, minCorrect);
  const answered = answers.filter(answer => answer !== null).length;
  const correctCount = answers.filter((answer, index) => answer !== null && answer === questions[index]?.correct).length;
  const chosen = answers[idx] ?? null;
  const locked = chosen === null && !mayAnswerExam(isPro, used, null);
  const isLast = idx === questions.length - 1;
  const choose = useCallback((answer: number) => {
    if (done || saving || answersRef.current[idx] !== null || !mayAnswerExam(isPro, usedRef.current, null)) return;
    const next = [...answersRef.current]; next[idx] = answer; answersRef.current = next; setAnswers(next);
    usedRef.current += 1; onAnswered();
  }, [idx, isPro, done, saving, onAnswered]);
  const submit = useCallback(async () => {
    if (submitLock.current) return;
    submitLock.current = true; setSaving(true); setSaveError(false);
    try { await onComplete(examSummary(questions, answersRef.current, minCorrect).pct); setDone(true); }
    catch { setSaveError(true); }
    finally { setSaving(false); submitLock.current = false; }
  }, [onComplete, questions, minCorrect]);
  const advance = useCallback(() => {
    if (answersRef.current[idx] === null || saving) return;
    if (isLast) void submit(); else setIdx(value => value + 1);
  }, [idx, isLast, saving, submit]);
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
  const restart = () => {
    const next = buildSet(); const blank = Array(next.length).fill(null);
    setQuestions(next); setAnswers(blank); answersRef.current = blank; setIdx(0); setDone(false); setSaveError(false);
  };
  if (done) return <div className="mx-auto w-full max-w-3xl space-y-4">
    <Card className={card}>
      <div className="text-center"><h2 className={cn("font-display text-4xl font-bold sm:text-5xl", summary.passed ? "text-success" : "text-destructive")}>{summary.passed ? "Passed" : "Not passed"}</h2><p className="mt-3 font-display text-2xl font-semibold">{summary.correct} / {questions.length} · {summary.pct}%</p></div>
      <div className="relative mt-6"><Meter pct={summary.pct} success={summary.passed} /><span className="absolute -top-1 h-4 w-0.5 bg-foreground" style={{ left: `${passPct}%` }} /><p className="mt-2 text-right text-xs text-muted-foreground">Pass line: {passPct}%</p></div>
      <section className="mt-7"><h3 className="font-display text-lg font-bold">By topic</h3><div className="mt-3 divide-y divide-border">{summary.topics.map(topic => <div key={topic.topic} className="py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{PILLAR_META[topic.topic].title}</span>{topic.needsWork && <Badge className="border border-destructive/30 bg-destructive/10 text-destructive">Needs work</Badge>}</div><span className="text-sm tabular-nums">{topic.pct === null ? "—" : `${topic.pct}%`}</span></div><div className="mt-2"><Meter pct={topic.pct ?? 0} success={!topic.needsWork} /></div>{topic.needsWork && <Button variant="secondary" asChild className="mt-3 rounded-full"><Link to="/app" search={{ tab: "test-hub", topic: topic.topic }}>Practice this<ArrowRight /></Link></Button>}</div>)}</div></section>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={restart} className="h-12 flex-1 rounded-full"><RefreshCw />Retake exam</Button><Button variant="secondary" asChild className="h-12 flex-1 rounded-full"><Link to="/app" search={{ tab: "chat" }}>Back to dashboard</Link></Button></div>
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
      {locked && <div className="mt-5 border-t border-border pt-4"><p className="text-sm text-muted-foreground">You've used your 20 free lifetime exam questions.</p><Button onClick={onUpgrade} className="mt-3 rounded-full"><Lock />Get Pro Pass — $9</Button></div>}
      {chosen !== null && <div className="study-feedback" aria-live="polite">
        <p className={cn("text-sm font-semibold", chosen === q.correct ? "text-success" : "text-destructive")}>{chosen === q.correct ? "Correct" : "Incorrect"}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.explanation.replace(/\s*Source:.*$/s, "").split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}</p>
        {saveError && <p role="alert" className="mt-3 text-sm text-destructive">Your attempt could not be saved. Please try again.</p>}
        <div className="study-next"><Button onClick={advance} disabled={saving} className="h-11 rounded-full">{saving ? "Saving attempt…" : isLast ? "See results" : "Next question"}<ArrowRight /></Button></div>
      </div>}
    </Card> : null}
  </StudyQuestionFrame>;
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-3xl bg-muted px-2 py-4 text-center sm:p-5"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{value}</p></div>; }
function Meter({ pct, success, className }: { pct: number; success?: boolean; className?: string }) { return <div className={cn("flex h-1.5", className, " overflow-hidden rounded-full bg-muted")}><span className={cn("h-full", success === undefined ? "bg-action" : success ? "bg-success/60" : "bg-destructive/60")} style={{ width: `${pct}%` }} /></div>; }
