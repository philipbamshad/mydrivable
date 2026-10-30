import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Flag, Lock, RefreshCw, Timer, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile";
import { getStatePack } from "@/data/dmv";
import { PILLAR_META } from "@/data/dmv/practice-bank";
import { shuffleAnswers } from "@/data/dmv/question-generator";
import { pickUnseenQuestions } from "@/lib/seen-questions";
import { buildExamPool, examSummary, examHistoryStats, mayAnswerExam, EXAM_FREE_LIMIT, type ExamQuestion } from "@/lib/mock-exam";
import { examHistoryOptions } from "@/lib/mock-exam.functions";
import { ExamQuestionVisual } from "./ExamQuestionVisual";

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
  return <div className="mx-auto w-full max-w-3xl space-y-5">
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
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [idx, setIdx] = useState(0);
  const [review, setReview] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const answersRef = useRef(answers);
  const usedRef = useRef(used);
  const submitLock = useRef(false);
  useEffect(() => { usedRef.current = used; }, [used]);
  const q = questions[idx];
  const summary = examSummary(questions, answers, minCorrect);
  const unanswered = answers.filter(answer => answer === null).length;
  const locked = !mayAnswerExam(isPro, used, answers[idx] ?? null);
  const choose = useCallback((answer: number) => {
    if (done || review || saving || !mayAnswerExam(isPro, usedRef.current, answersRef.current[idx] ?? null)) return;
    const previous = answersRef.current[idx];
    const next = [...answersRef.current]; next[idx] = answer; answersRef.current = next; setAnswers(next);
    if (previous === null) { usedRef.current += 1; onAnswered(); }
  }, [idx, isPro, done, review, saving, onAnswered]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || (target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName)))) return;
      const answer = Number(event.key) - 1;
      if (/^[1-4]$/.test(event.key) && q?.options[answer] !== undefined) { event.preventDefault(); choose(answer); }
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, [q, choose]);
  const submit = async () => {
    if (submitLock.current) return;
    submitLock.current = true; setSaving(true); setSaveError(false);
    try { await onComplete(summary.pct); setDone(true); setReview(false); }
    catch { setSaveError(true); }
    finally { setSaving(false); submitLock.current = false; }
  };
  const restart = () => {
    const next = buildSet(); const blank = Array(next.length).fill(null);
    setQuestions(next); setAnswers(blank); answersRef.current = blank; setFlags(new Set()); setIdx(0); setDone(false); setReview(false); setSaveError(false);
  };
  if (done) return <div className="mx-auto w-full max-w-3xl space-y-5">
    <Card className={card}>
      <div className="text-center"><h2 className={cn("font-display text-4xl font-bold sm:text-5xl", summary.passed ? "text-success" : "text-destructive")}>{summary.passed ? "Passed" : "Not yet"}</h2><p className="mt-3 font-display text-2xl font-semibold">{summary.correct} / {questions.length} · {summary.pct}%</p></div>
      <div className="relative mt-6"><Meter pct={summary.pct} success={summary.passed} /><span className="absolute -top-1 h-4 w-0.5 bg-foreground" style={{ left: `${passPct}%` }} /><p className="mt-2 text-right text-xs text-muted-foreground">Pass line: {passPct}%</p></div>
      <section className="mt-7"><h3 className="font-display text-lg font-bold">By topic</h3><div className="mt-3 divide-y divide-border">{summary.topics.map(topic => <div key={topic.topic} className="py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{PILLAR_META[topic.topic].title}</span>{topic.needsWork && <Badge className="border border-destructive/30 bg-destructive/10 text-destructive">Needs work</Badge>}</div><span className="text-sm tabular-nums">{topic.pct === null ? "—" : `${topic.pct}%`}</span></div><div className="mt-2"><Meter pct={topic.pct ?? 0} success={!topic.needsWork} /></div>{topic.needsWork && <Button variant="secondary" asChild className="mt-3 rounded-full"><Link to="/app" search={{ tab: "test-hub", topic: topic.topic }}>Practice this<ArrowRight /></Link></Button>}</div>)}</div></section>
      <section className="mt-7"><h3 className="font-display text-lg font-bold">Review answers</h3><ul className="mt-3 divide-y divide-border">{questions.map((question, index) => answers[index] === question.correct ? null : <li key={index} className="py-5"><p className="text-xs text-muted-foreground">Question {index + 1}</p><h4 className="mt-1 text-sm font-semibold">{question.q}</h4><p className="mt-3 text-sm text-destructive">Your answer: {answers[index] === null ? "Unanswered" : question.options[answers[index] ?? 0]}</p><p className="mt-2 text-sm text-success">Correct answer: {question.options[question.correct]}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{question.explanation.replace(/\s*Source:.*$/s, "").split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}</p></li>)}</ul>{summary.correct === questions.length && <p className="mt-3 text-sm text-muted-foreground">No missed questions.</p>}</section>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={restart} className="h-12 flex-1 rounded-full"><RefreshCw />Retake exam</Button><Button variant="secondary" asChild className="h-12 flex-1 rounded-full"><Link to="/app" search={{ tab: "chat" }}>Back to dashboard</Link></Button></div>
    </Card>
  </div>;
  return <div className="mx-auto w-full max-w-3xl space-y-5">
    <div className="flex items-center justify-between gap-3"><Button variant="ghost" onClick={onExit} className="h-8 px-0 text-xs text-muted-foreground"><ArrowLeft />Exit exam</Button><span className="text-xs text-muted-foreground">{state} · {idx + 1} / {questions.length}</span></div>
    <Meter pct={(questions.length - unanswered) / questions.length * 100} />
    {review ? <Card className={card}><h2 className="font-display text-xl font-bold">Review before submitting</h2><p className="mt-2 text-sm text-muted-foreground">{unanswered} unanswered · {flags.size} flagged</p><div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-8">{questions.map((_, index) => <Button key={index} variant="secondary" onClick={() => { setIdx(index); setReview(false); }} aria-label={`Question ${index + 1}${flags.has(index) ? ", flagged" : ""}${answers[index] === null ? ", unanswered" : ", answered"}`} className={cn("relative h-11 min-w-0 px-0", answers[index] !== null && "border border-action/30", flags.has(index) && "ring-2 ring-action")}><span>{index + 1}</span>{flags.has(index) && <Flag className="absolute right-0.5 top-0.5 size-2.5" />}</Button>)}</div>{saveError && <p role="alert" className="mt-4 text-sm text-destructive">Your attempt could not be saved. Please try submitting again.</p>}<div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button variant="secondary" onClick={() => setReview(false)} className="h-12 rounded-full">Back to questions</Button><Button onClick={submit} disabled={saving} className="h-12 rounded-full">{saving ? "Saving attempt…" : "Submit exam"}</Button></div></Card> : q ? <Card className={card}>
      <ExamQuestionVisual question={q} /><h3 className="mb-5 font-display text-lg font-semibold">{q.q}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{q.options.map((option, index) => <Button key={index} variant="secondary" onClick={() => choose(index)} disabled={locked} aria-pressed={answers[idx] === index} className={cn("h-auto min-h-14 justify-start whitespace-normal rounded-2xl border px-4 py-3 text-left text-sm leading-relaxed", answers[idx] === index ? "border-action bg-action/10 text-foreground" : "border-transparent")}><span className="shrink-0 text-xs text-muted-foreground">{index + 1}</span><span>{option}</span>{answers[idx] === index && <Check className="ml-auto" />}</Button>)}</div>
      {locked && <div className="mt-5 border-t border-border pt-4"><p className="text-sm text-muted-foreground">You've used your 20 free lifetime exam questions.</p><Button onClick={onUpgrade} className="mt-3 rounded-full"><Lock />Get Pro Pass — $9</Button></div>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" aria-pressed={flags.has(idx)} onClick={() => setFlags(prev => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; })}><Flag />{flags.has(idx) ? "Flagged for review" : "Flag for review"}</Button><Button variant="secondary" onClick={() => setReview(true)} className="rounded-full">Review & submit</Button></div>
      <div className="mt-5 flex justify-between gap-3"><Button variant="secondary" disabled={idx === 0} onClick={() => setIdx(value => value - 1)} className="h-11 rounded-full"><ArrowLeft />Previous</Button><Button onClick={() => idx === questions.length - 1 ? setReview(true) : setIdx(value => value + 1)} className="h-11 rounded-full">{idx === questions.length - 1 ? "Review exam" : "Next question"}<ArrowRight /></Button></div>
    </Card> : null}
  </div>;
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-3xl bg-muted px-2 py-4 text-center sm:p-5"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{value}</p></div>; }
function Meter({ pct, success }: { pct: number; success?: boolean }) { return <div className="flex h-1.5 overflow-hidden rounded-full bg-muted"><span className={cn("h-full", success === undefined ? "bg-action" : success ? "bg-success/60" : "bg-destructive/60")} style={{ width: `${pct}%` }} /></div>; }
