import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Play, Video, LoaderCircle, CircleHelp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { tabGlowStyle } from "@/lib/tab-glow";
import { SIMULATION_CLIPS } from "@/data/simulation-clips";
import { createSimulationSession, type ActionIcon, type SimulationClip } from "@/data/simulation-session";
import { DECISION_MS, recordDecision, decisionSummary, finishScenario, stepProgress, type ScenarioDecision } from "@/data/simulation-game";
import { ScenarioThumbnail } from "@/components/simulation/ScenarioThumbnail";
import { signalDirection, signalIsActive } from "@/data/simulation-signal";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActionLegend, ACTION_ICONS, STANDARD_ACTIONS } from "@/components/simulation/ActionLegend";
import { scenarioResultView, type ResultChip } from "@/data/simulation-result";
import "@/components/simulation/simulation-actions.css";
import { useStudyAttempts } from "@/lib/use-study-attempt";
import { attemptAccess, simulationHistoryStats, type StudyAttempt } from "@/lib/study-attempt";
import { RestrictedProBadge } from "@/components/dashboard/RestrictedProBadge";
import { AttemptLock } from "@/components/dashboard/AttemptLock";
import { RecentResultsCard, type RecentResultRow } from "@/components/dashboard/RecentResultsCard";
import { useUserProfile } from "@/lib/user-profile";

export const Route = createFileRoute("/_authenticated/app/simulation")({
  head: () => ({ meta: [
    { title: "Driving Test Simulation | Drivable" },
    { name: "description", content: "Practice real-world driving scenarios with optional timed decisions and clear DMV-based feedback." },
    { property: "og:title", content: "Driving Test Simulation | Drivable" },
    { property: "og:description", content: "Practice real-world driving scenarios with optional timed decisions and clear DMV-based feedback." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: SimulationPage,
});

type Phase = "ready" | "instructions" | "playing" | "decision" | "feedback" | "results";
const icons: Partial<Record<ActionIcon, typeof ArrowUp>> = ACTION_ICONS;
const cardClass = "rounded-[28px] border border-border/60 bg-card p-4 sm:p-8 shadow-lg";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return <div className="flex h-[120px] flex-col items-center justify-center rounded-3xl bg-muted px-2 text-center"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className={cn("mt-1 whitespace-nowrap font-display text-xl font-bold tabular-nums sm:text-4xl", (label === "Best accuracy" || label === "Correct decisions") && "text-progress-text")}>{value}</p></div>;
}

function SimulationPage() {
  const { isPro, hydrating, openCheckout } = useUserProfile();
  const {user}=Route.useRouteContext();
  const store=useStudyAttempts(user.id);
  const [attempt,setAttempt]=useState<StudyAttempt|null>(null);
  const freeAttempt=store.attempts.find(a=>a.feature==="simulation" && a.free_slot);
  const access=attemptAccess(isPro,freeAttempt);
  const historyStats=simulationHistoryStats(store.attempts);
  const recentRows: RecentResultRow[] = store.attempts
    .filter(a => a.feature === "simulation" && a.completed)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3)
    .map(a => ({
      id: a.id,
      date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      primary: a.score === null ? "—" : `${a.score}% accuracy`,
      secondary: a.average_reaction === null ? "—" : `${a.average_reaction.toFixed(1)}s avg. reaction`,
    }));
  const [finishing,setFinishing]=useState(false);
  const finishLock=useRef(false);
  const [skipInstructions, setSkipInstructions] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [mobileLegend, setMobileLegend] = useState(false);
  useEffect(() => {
    setSkipInstructions(localStorage.getItem("drivable.simulation.skip-instructions") === "true");
    setShowLegend(localStorage.getItem("drivable.simulation.hide-legend") !== "true");
  }, []);
  const [phase, setPhase] = useState<Phase>("ready");
  const phaseRef = useRef<Phase>("ready");
  const [timed, setTimed] = useState(true);
  const [session, setSession] = useState<SimulationClip[]>([]);
  const [idx, setIdx] = useState(0);
  const [decisions, setDecisions] = useState<ScenarioDecision[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const stepRecords = useRef<ScenarioDecision[]>([]);
  const answerLock = useRef(false);
  const [remaining, setRemaining] = useState(DECISION_MS);
  const [feedback, setFeedback] = useState<ScenarioDecision | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const decisionStart = useRef(0);
  const frozenFrame = useRef<string | null>(null);
  const frameRequest = useRef<number | null>(null);
  const endHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decisionPanel = useRef<HTMLDivElement>(null);
  const feedbackPanel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const clip = session[idx];
  const next = session[idx + 1];
  const summary = decisionSummary(decisions);
  const signalSide = clip ? signalDirection(clip.intent) : null;
  const signaling = signalIsActive(hasPlayed, phase);

  const changePhase = useCallback((value: Phase) => { phaseRef.current = value; setPhase(value); }, []);
  const start = async () => {
    const row=await store.start("simulation"); if(!row)return;
    setAttempt(row);setHasPlayed(false);
    setSession(row.payload as SimulationClip[]);
    setIdx(Math.min(row.version,row.payload.length-1)); setStepIndex(0); stepRecords.current=[]; answerLock.current=false;
    setDecisions(row.answers as ScenarioDecision[]);setFeedback(null);
    setVideoError(false);setLoaded(false);setNeedsPlay(false);
    scroller.current?.scrollTo({top:0});changePhase(row.completed?"results":"playing");
  };
  const requestStart = () => {
    if(access === "locked" || access === "resume" || skipInstructions) void start(); else changePhase("instructions");
  };
  const exit = () => { videoRef.current?.pause(); changePhase("ready"); setSession([]); setDecisions([]); scroller.current?.scrollTo({ top: 0 }); };
  const goNext = async () => {
    if (phaseRef.current !== "feedback" || finishLock.current) return;
    scroller.current?.scrollTo({ top: 0 });
    if (idx === session.length - 1) { finishLock.current=true;const timer=setTimeout(()=>setFinishing(true),500);try{if(await store.finish())changePhase("results");}finally{clearTimeout(timer);setFinishing(false);finishLock.current=false;}return; }
    setHasPlayed(false);
    setIdx((value) => value + 1); setStepIndex(0); stepRecords.current = []; answerLock.current = false; setFeedback(null); setVideoError(false); setLoaded(false); setNeedsPlay(false); changePhase("playing");
  };

  const beginDecision = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const video = videoRef.current;
    video?.pause();
    frozenFrame.current = null;
    if (video && video.videoWidth) {
      try {
        const canvas = document.createElement("canvas"); canvas.width = 320; canvas.height = 180;
        const context = canvas.getContext("2d");
        if (context) { context.drawImage(video, 0, 0, 320, 180); frozenFrame.current = canvas.toDataURL("image/jpeg", 0.75); }
      } catch { /* Cross-origin media falls back to a paused video thumbnail. */ }
    }
    decisionStart.current = performance.now(); setRemaining(DECISION_MS); changePhase("decision");
  }, [changePhase]);

  const answer = useCallback((actionId: string | null) => {
    if (phaseRef.current !== "decision" || !clip) return;
    if (answerLock.current) return;
    answerLock.current = true;
    const expected = clip.steps[stepIndex];
    if (!expected) return;
    const result = recordDecision(clip.id, actionId, expected, performance.now() - decisionStart.current, timed, frozenFrame.current);
    const records = [...stepRecords.current, result]; stepRecords.current = records;
    if (stepProgress(clip.steps, records) === "next") {
      decisionStart.current = performance.now(); setRemaining(DECISION_MS);
      setStepIndex(records.length);
      return;
    }
    changePhase("feedback");
    const scenario = finishScenario(clip.steps, records);
    setFeedback(scenario);setDecisions(previous=>[...previous,scenario]);
    if(attempt)store.answer({id:attempt.id,version:idx,timed,steps:records.map(r=>({action:r.selectedAction as "go"|"yield"|"stop"|null,elapsed:r.reactionMs ?? DECISION_MS}))});
  }, [clip, stepIndex, timed, changePhase, attempt, idx, store.answer]);

  useEffect(() => { answerLock.current = false; }, [stepIndex]);

  useEffect(() => {
    if (phase !== "decision" || !timed) return;
    const interval = window.setInterval(() => {
      const left = Math.max(0, DECISION_MS - (performance.now() - decisionStart.current));
      setRemaining(left); if (left === 0) answer(null);
    }, 40);
    const deadline = window.setTimeout(() => answer(null), DECISION_MS);
    return () => { window.clearInterval(interval); window.clearTimeout(deadline); };
  }, [phase, timed, answer, stepIndex]);

  useEffect(() => {
    if (phase !== "decision" || !clip) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName))) return;
      const action = clip.actions[Number(event.key) - 1];
      if (/^[1-3]$/.test(event.key) && action) { event.preventDefault(); answer(action.id); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [phase, clip, answer]);

  const active = phase === "playing" || phase === "decision" || phase === "feedback";
  useEffect(() => {
    if (!next || !active) return;
    const video = document.createElement("video"); video.preload = "auto"; video.muted = true; video.src = next.videoUrl; video.load();
    return () => { video.removeAttribute("src"); video.load(); };
  }, [next, active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip || phase !== "playing") return;
    let stopped = false;
    const checkFrame = () => {
      if (stopped) return;
      if (video.currentTime >= clip.pauseAt) { beginDecision(); return; }
      frameRequest.current = video.requestVideoFrameCallback(checkFrame);
    };
    if (typeof video.requestVideoFrameCallback === "function") frameRequest.current = video.requestVideoFrameCallback(checkFrame);
    return () => {
      stopped = true;
      if (endHoldTimer.current !== null) { clearTimeout(endHoldTimer.current); endHoldTimer.current = null; }
      if (frameRequest.current !== null && typeof video.cancelVideoFrameCallback === "function") video.cancelVideoFrameCallback(frameRequest.current);
    };
  }, [clip, phase, beginDecision]);

  const resumeVideo = () => {
    const video = videoRef.current;
    if (video) void video.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
  };

  const holdFinalFrame = () => {
    const video = videoRef.current;
    if (!video || !clip || phaseRef.current !== "playing") return;
    // Keep the original trimmed asset; hold its final frame until the authored freeze time.
    const holdMs = Math.max(0, clip.pauseAt - video.currentTime) * 1000;
    if (endHoldTimer.current !== null) clearTimeout(endHoldTimer.current);
    endHoldTimer.current = setTimeout(beginDecision, holdMs);
  };

  return (
    <div ref={scroller} className={cn("h-full min-h-0 bg-secondary/40 text-foreground", active ? "overflow-hidden" : "overflow-y-auto overscroll-contain")} style={tabGlowStyle} aria-label="Driving Test Simulation">
      <div className={cn("mx-auto flex w-full max-w-[960px] flex-col px-4 pb-8 pt-6 md:px-8", active ? "h-full min-h-0" : "min-h-full")}>
        <header className="flex shrink-0 items-center justify-between gap-3 pl-14 md:pl-0">
          <h1 className="min-w-0 truncate font-display text-xl font-bold leading-tight">Driving Test Simulation</h1>
          {!isPro && <Button onClick={() => openCheckout()} className="h-9 shrink-0 rounded-full px-4 text-sm font-semibold md:h-10 md:px-5">Upgrade</Button>}
          {phase !== "ready" && <Button variant="ghost" onClick={exit} className="h-8 shrink-0 px-0 text-xs text-muted-foreground"><ArrowLeft /><span className="sm:hidden">Exit</span><span className="hidden sm:inline">Exit simulation</span></Button>}
        </header>
        {phase === "ready" ? (
          <div className="mt-8 w-full space-y-4">
            <div className={cardClass}>
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-border bg-muted text-foreground sm:h-14 sm:w-14"><Video className="h-6 w-6" /></div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-bold sm:text-xl">Real-World Driving Scenarios</h2><RestrictedProBadge restricted={access === "locked"}/></div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3"><StatTile label="Decision time" value="2.5 sec"/><StatTile label="Best accuracy" value={historyStats.best===null ? "—" : `${historyStats.best}%`}/><StatTile label="Avg. reaction" value={historyStats.reaction===null ? "—" : `${historyStats.reaction.toFixed(1)}s`}/></div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Real driving decisions happen in a split second. Covers intersections, turns, right-of-way, and lane changes.</p>
              <div className="mt-5 flex items-center justify-between gap-4"><label htmlFor="timed-mode" className="text-sm font-medium">Timed mode</label><Switch id="timed-mode" checked={timed} onCheckedChange={setTimed} className="simulation-toggle" /></div>
              <Button variant="link" onClick={() => changePhase("instructions")} className="mt-3 h-9 px-0 text-sm">How it works</Button>
              {access==="locked" && <AttemptLock onUpgrade={openCheckout}/>}
              {store.error && <p role="alert" className="mt-3 text-sm text-destructive">{store.error}</p>}
              <Button variant={access === "locked" ? "secondary" : "default"} disabled={hydrating || store.busy} onClick={requestStart} className="mt-3 h-14 w-full rounded-full text-base font-semibold"><Play />{access==="resume" ? "Resume your free attempt" : access==="locked" ? "View past results" : "Start simulation"}</Button>
            </div>
            <RecentResultsCard rows={recentRows} />
          </div>
        ) : phase === "instructions" ? (
          <div className={cn(cardClass, "mt-8 w-full")}>
            <h2 className="font-display text-xl font-bold">How it works</h2>
            <p className="mb-7 mt-4 text-sm leading-relaxed text-muted-foreground">Each video stops at a decision point. The turn signal shows where you're going. Choose the correct action before time runs out.</p>
            <p className="mb-5 text-sm text-muted-foreground">Some scenarios need two actions. If your first choice is right, it's marked with a check. Then choose your next action.</p>
            <ActionLegend />
            <div className="mt-7 flex items-center gap-3"><Checkbox id="skip-instructions" checked={skipInstructions} onCheckedChange={checked => { const value = checked === true; setSkipInstructions(value); localStorage.setItem("drivable.simulation.skip-instructions", String(value)); }} /><label htmlFor="skip-instructions" className="text-sm">Don't show again</label></div>
            <Button disabled={store.busy} onClick={()=>void start()} className="mt-5 h-12 w-full rounded-full">I'm ready<ArrowRight /></Button>
          </div>
        ) : phase === "results" ? (
          <div className={cn(cardClass, "mt-8 w-full")}>
            <h2 className="font-display text-xl font-bold sm:text-2xl">Simulation complete</h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"><StatTile label="Correct decisions" value={`${summary.accuracy}%`} /><StatTile label="Avg. reaction time" value={summary.averageReaction === null ? "—" : `${summary.averageReaction.toFixed(1)}s`} /></div>
            <section className="mt-7"><h3 className="font-display text-lg font-semibold">Review missed scenarios</h3>
              {summary.missed.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No missed scenarios.</p> : <ul className="mt-4 divide-y divide-border">
                {summary.missed.map((decision) => {
                  const source = session.find((item) => item.id === decision.scenarioId);
                  if (!source) return null;
                  const correct = source.actions.find((action) => action.id === source.correctAction);
                  const Icon = correct ? icons[correct.icon] : undefined;
                  return <li key={source.id} className="grid gap-4 py-5 first:pt-0 sm:grid-cols-[144px_1fr]"><div className="w-36"><ScenarioThumbnail clip={source} thumbnail={decision.thumbnail} /></div><div><h4 className="text-sm font-bold">{source.title}</h4><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-success">{Icon && <Icon className="h-5 w-5" />}Correct action: {correct?.label}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{source.explanation}</p></div></li>;
                })}
              </ul>}
            </section>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button disabled={store.busy} onClick={()=>isPro ? void start() : openCheckout()} className="h-12 flex-1 rounded-full"><RotateCcw />{isPro ? "Try again" : "Upgrade to Pro"}</Button><Button variant="secondary" asChild className="h-12 flex-1 rounded-full"><Link to="/app">Back to dashboard</Link></Button></div>
          </div>
        ) : clip ? (
          <div data-scenario={clip.id} data-phase={phase} data-step={stepIndex + 1} className="mt-4 flex min-h-0 flex-1 flex-col gap-2">
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground"><span>{clip.title}</span><div className="hidden items-center gap-2 md:flex"><Switch id="hide-legend" checked={!showLegend} onCheckedChange={hidden => { setShowLegend(!hidden); localStorage.setItem("drivable.simulation.hide-legend", String(hidden)); }} /><label htmlFor="hide-legend">Hide legend</label></div></div>
            <div role="progressbar" aria-label="Scenario progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((idx+1)/session.length*100)} className="h-1 w-full shrink-0 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-progress transition-all" style={{ width: `${(idx + 1) / session.length * 100}%` }} /></div>
                        <div className={cn("grid min-h-0 flex-1 gap-3", showLegend && "md:grid-cols-[minmax(0,1fr)_170px]")}>
              <div className="simulation-video-space min-h-0 min-w-0">
              <div key={clip.id} data-signal-active={signaling && signalSide !== null} className="simulation-video-frame simulation-signal-video relative overflow-hidden rounded-2xl bg-muted">
                <video ref={videoRef} src={clip.videoUrl} autoPlay muted playsInline preload="auto"
                  onPlaying={() => setHasPlayed(true)} onLoadedData={() => setLoaded(true)} onCanPlay={() => { if (phaseRef.current === "playing") resumeVideo(); }}
                  onTimeUpdate={event => { if (event.currentTarget.currentTime >= clip.pauseAt) beginDecision(); }}
                  onEnded={holdFinalFrame} onError={() => setVideoError(true)} className="absolute inset-0 h-full w-full object-cover" />
                {phase === "decision" && <div aria-hidden="true" className="sim-freeze-overlay pointer-events-none absolute inset-0" />}
                {signalSide && <div aria-hidden="true" data-direction={signalSide} className="simulation-signal-glow pointer-events-none absolute inset-0 rounded-[inherit]" />}
                {(!loaded || videoError || needsPlay) && phase === "playing" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/80">{videoError ? <><p className="text-sm">Unable to load this clip.</p><Button onClick={() => { setVideoError(false); videoRef.current?.load(); }}>Retry</Button></> : needsPlay ? <Button onClick={resumeVideo}><Play />Play clip</Button> : <LoaderCircle className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-label="Loading clip" />}</div>}
                <span className="pointer-events-none absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-border bg-primary-foreground px-3 py-1.5 text-xs font-semibold text-action shadow-sm" aria-label={`Intent: ${clip.intent}`}>
                  {signalSide === "left" ? <ArrowLeft aria-hidden="true" className="simulation-signal-arrow h-4 w-4 shrink-0" /> : signalSide === "right" ? <ArrowRight aria-hidden="true" className="simulation-signal-arrow h-4 w-4 shrink-0" /> : <ArrowUp aria-hidden="true" className="h-4 w-4 shrink-0" />}{clip.intent}
                </span>
                <Button variant="secondary" size="icon" aria-label="Show action legend" title="Action legend" onClick={() => setMobileLegend(true)} className="absolute bottom-3 right-3 h-10 w-10 rounded-full md:hidden"><CircleHelp /></Button>
              </div>
              </div>
              {showLegend && <aside aria-label="Action legend" className="hidden h-full min-h-0 rounded-2xl bg-card p-3 md:flex md:items-center"><ActionLegend /></aside>}
            </div>
            {timed && <div role="progressbar" aria-hidden={phase !== "decision" || undefined} data-visible={phase === "decision"} aria-label="Decision time remaining" aria-valuemin={0} aria-valuemax={2.5} aria-valuenow={remaining / 1000} className={cn("flex h-1 shrink-0 overflow-hidden rounded-full bg-muted", phase !== "decision" && "invisible")}><span className={cn("h-full transition-[flex-grow] duration-75", "bg-progress")} style={{ flexGrow: remaining }} /><span style={{ flexGrow: DECISION_MS - remaining }} /></div>}
            <div className="shrink-0 basis-[192px] sm:basis-[168px]">
              {phase === "feedback" && feedback ? <div ref={feedbackPanel} role="status" className="flex h-full flex-col gap-2 rounded-2xl border border-border/60 bg-card p-3 sm:p-4">
                <FeedbackResult steps={clip.steps} decision={feedback} />
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{clip.explanation}</p>
                {store.error && <p role="alert" className="text-xs text-destructive">{store.error}</p>}
                <Button disabled={finishing} onClick={()=>void goNext()} className="mt-auto h-9 shrink-0 self-end rounded-full">{finishing ? "Finishing up…" : "Next scenario"}<ArrowRight /></Button>
              </div> : <div ref={decisionPanel} className="flex h-full flex-col gap-2">
                <div className="min-h-[40px]">{phase === "decision" && <>{stepIndex > 0 && <p className="text-xs font-semibold text-success">Correct. Now choose your next action.</p>}<p className="text-sm font-semibold">{stepIndex === 0 ? "What do you do?" : "Then what do you do?"}{clip.steps.length > 1 && <span className="ml-2 text-xs font-normal text-muted-foreground">Step {stepIndex + 1} of {clip.steps.length}</span>}</p></>}</div>
                <TooltipProvider delayDuration={150}><div key={`${phase}-${stepIndex}`} className={cn("sim-action-row grid grid-cols-3 gap-3 rounded-2xl", phase === "decision" && "sim-action-row-live")}>{STANDARD_ACTIONS.map(action => { const Icon = icons[action.icon]; if (!Icon) return null; const done = stepRecords.current.some(r => r.correct && r.selectedAction === action.id) && phase === "decision"; return <Tooltip key={action.id}><TooltipTrigger asChild><span className="block"><Button type="button" variant="outline" disabled={phase !== "decision"} onClick={() => answer(action.id)} aria-label={action.label} data-action={action.id} data-done={done || undefined} className="sim-action-button"><Icon className="size-9" strokeWidth={2.5} />{done && <span className="sim-action-check" aria-hidden="true"><Check className="size-3" strokeWidth={3} /></span>}</Button></span></TooltipTrigger><TooltipContent>{action.label}</TooltipContent></Tooltip>; })}</div></TooltipProvider>
              </div>}
            </div>
          </div>
        ) : null}
      </div>
      <Dialog open={mobileLegend} onOpenChange={setMobileLegend}><DialogContent><DialogHeader><DialogTitle>Action legend</DialogTitle></DialogHeader><ActionLegend /></DialogContent></Dialog>
    </div>
  );
}

function Chip({ chip, label, Icon }: { chip: ResultChip; label: string; Icon?: typeof ArrowUp }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", chip.tone === "success" ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive")}>{Icon && <Icon className="size-3.5" strokeWidth={2.5} />}{label}{chip.mark === "check" && <Check className="size-3.5" />}{chip.mark === "cross" && <X className="size-3.5" />}</span>;
}

function ChipRow({ chips }: { chips: ResultChip[] }) {
  return <span className="inline-flex flex-wrap items-center gap-1.5">{chips.map((chip, i) => { const action = STANDARD_ACTIONS.find(a => a.id === chip.action); return <span key={i} className="inline-flex items-center gap-1.5">{i > 0 && <ArrowRight className="size-3 text-muted-foreground" aria-label="then" />}<Chip chip={chip} label={action?.label ?? chip.action} Icon={action ? icons[action.icon] : undefined} /></span>; })}</span>;
}

function FeedbackResult({ steps, decision }: { steps: string[]; decision: ScenarioDecision }) {
  const view = scenarioResultView(steps, decision);
  return <div className="flex flex-col gap-1.5">
    <h2 className={cn("font-display text-base font-bold", view.heading === "Correct" ? "text-success" : "text-destructive")}>{view.heading}</h2>
    {view.chosen.length > 0 && <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><ChipRow chips={view.chosen} />{view.heading === "Correct" && <span className="text-xs text-muted-foreground">{view.chosen.map(c => c.reactionMs === null ? "" : `Decided in ${(c.reactionMs / 1000).toFixed(1)}s`).filter(Boolean).join(" · ")}</span>}</div>}
    {view.correctAnswer && <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>Correct answer:</span><ChipRow chips={view.correctAnswer} /></div>}
  </div>;
}
