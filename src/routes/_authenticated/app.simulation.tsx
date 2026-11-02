import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Play, Video, LoaderCircle, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { tabGlowStyle } from "@/lib/tab-glow";
import { SIMULATION_CLIPS } from "@/data/simulation-clips";
import { createSimulationSession, type ActionIcon, type SimulationClip } from "@/data/simulation-session";
import { DECISION_MS, recordDecision, decisionSummary, type ScenarioDecision } from "@/data/simulation-game";
import { ScenarioThumbnail } from "@/components/simulation/ScenarioThumbnail";
import { signalDirection, signalIsActive } from "@/data/simulation-signal";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActionLegend, ACTION_ICONS } from "@/components/simulation/ActionLegend";
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
const cardClass = "rounded-[28px] border border-border/60 bg-card p-5 shadow-lg sm:p-7";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-3xl bg-muted p-4 text-center sm:p-5"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold tabular-nums sm:text-3xl">{value}</p></div>;
}

function SimulationPage() {
  const { isPro, hydrating, openCheckout } = useUserProfile();
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
  const start = () => {
    if (!isPro) { openCheckout(); return; }
    setHasPlayed(false);
    setSession(createSimulationSession(SIMULATION_CLIPS));
    setIdx(0); setDecisions([]); setFeedback(null);
    setVideoError(false); setLoaded(false); setNeedsPlay(false);
    scroller.current?.scrollTo({ top: 0 }); changePhase("playing");
  };
  const requestStart = () => {
    if (!isPro) { openCheckout(); return; }
    if (skipInstructions) start(); else changePhase("instructions");
  };
  const exit = () => { videoRef.current?.pause(); changePhase("ready"); setSession([]); setDecisions([]); scroller.current?.scrollTo({ top: 0 }); };
  const goNext = () => {
    if (phaseRef.current !== "feedback") return;
    scroller.current?.scrollTo({ top: 0 });
    if (idx === session.length - 1) { changePhase("results"); return; }
    setHasPlayed(false);
    setIdx((value) => value + 1); setFeedback(null); setVideoError(false); setLoaded(false); setNeedsPlay(false); changePhase("playing");
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
    // Lock before setting state: simultaneous keyboard/click/timeout events record one decision.
    changePhase("feedback");
    const result = recordDecision(clip.id, actionId, clip.correctAction, performance.now() - decisionStart.current, timed, frozenFrame.current);
    setDecisions((items) => [...items, result]); setFeedback(result);
  }, [clip, timed, changePhase]);

  useEffect(() => {
    if (phase !== "decision" || !timed) return;
    const interval = window.setInterval(() => {
      const left = Math.max(0, DECISION_MS - (performance.now() - decisionStart.current));
      setRemaining(left); if (left === 0) answer(null);
    }, 40);
    const deadline = window.setTimeout(() => answer(null), DECISION_MS);
    return () => { window.clearInterval(interval); window.clearTimeout(deadline); };
  }, [phase, timed, answer]);

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

  useEffect(() => {
    if (phase === "decision") decisionPanel.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    if (phase === "feedback") feedbackPanel.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [phase]);

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
    <div ref={scroller} className="h-full overflow-y-auto overscroll-contain bg-secondary/40 text-foreground" style={tabGlowStyle} aria-label="Driving Test Simulation">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col p-5 pt-16 sm:p-7 md:pt-7">
        <header className="mb-5">
          {phase !== "ready" && <Button variant="ghost" onClick={exit} className="mb-3 h-8 px-0 text-xs text-muted-foreground"><ArrowLeft />Exit simulation</Button>}
          <h1 className="font-display text-xl font-bold">Driving Test Simulation</h1>
        </header>
        {phase === "ready" ? (
          <div className="my-auto mx-auto w-full max-w-3xl pb-5">
            <div className={cardClass}>
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-border bg-muted text-foreground sm:h-14 sm:w-14"><Video className="h-6 w-6" /></div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-bold sm:text-xl">Real-World Driving Scenarios</h2><span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">Pro</span></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3"><StatTile label="Scenarios" value={SIMULATION_CLIPS.length} /><StatTile label="Decision time" value="2.5 sec" /></div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Real driving decisions happen in a split second. Watch each scenario and react before time runs out.</p>
              <div className="mt-5 flex items-center justify-between gap-4"><label htmlFor="timed-mode" className="text-sm font-medium">Timed mode</label><Switch id="timed-mode" checked={timed} onCheckedChange={setTimed} className="data-[state=checked]:bg-action" /></div>
              <Button variant="link" onClick={() => changePhase("instructions")} className="mt-3 h-9 px-0 text-sm">How it works</Button>
              <Button disabled={hydrating} onClick={requestStart} className="mt-3 h-12 w-full rounded-full text-base font-semibold"><Play />Start simulation</Button>
            </div>
          </div>
        ) : phase === "instructions" ? (
          <div className={cn(cardClass, "my-auto mx-auto w-full max-w-3xl")}>
            <h2 className="font-display text-xl font-bold">How it works</h2>
            <p className="mb-7 mt-4 text-sm leading-relaxed text-muted-foreground">Each video stops at a decision point. The turn signal shows where you're going. Choose the correct action before time runs out.</p>
            <ActionLegend />
            <div className="mt-7 flex items-center gap-3"><Checkbox id="skip-instructions" checked={skipInstructions} onCheckedChange={checked => { const value = checked === true; setSkipInstructions(value); localStorage.setItem("drivable.simulation.skip-instructions", String(value)); }} /><label htmlFor="skip-instructions" className="text-sm">Don't show again</label></div>
            <Button onClick={start} className="mt-5 h-12 w-full rounded-full">I'm ready<ArrowRight /></Button>
          </div>
        ) : phase === "results" ? (
          <div className={cn(cardClass, "mx-auto w-full max-w-3xl")}>
            <h2 className="font-display text-xl font-bold sm:text-2xl">Simulation complete</h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"><StatTile label="Accuracy" value={`${summary.accuracy}%`} /><StatTile label="Avg. reaction time" value={summary.averageReaction === null ? "—" : `${summary.averageReaction.toFixed(1)}s`} /><StatTile label="Scenarios" value={`${summary.completed} / ${session.length}`} /></div>
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
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={start} className="h-12 flex-1 rounded-full"><RotateCcw />Try again</Button><Button variant="secondary" asChild className="h-12 flex-1 rounded-full"><Link to="/app">Back to dashboard</Link></Button></div>
          </div>
        ) : clip ? (
          <div data-scenario={clip.id} data-phase={phase} className="mx-auto w-full space-y-5">
            <div className={cn("grid items-start gap-5", showLegend && "lg:grid-cols-[minmax(0,1fr)_180px]")}>
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>Scenario {idx + 1} of {session.length}</span><span>{clip.title}</span></div>
              <div role="progressbar" aria-label="Scenario progress" aria-valuemin={0} aria-valuemax={session.length} aria-valuenow={idx + 1} className="mb-5 flex h-1 overflow-hidden rounded-full bg-muted">{session.map((item, index) => <span key={item.id} className={cn("h-full flex-1", index <= idx && "bg-action")} />)}</div>
              <div key={clip.id} data-signal-active={signaling && signalSide !== null} className="simulation-signal-video relative overflow-hidden rounded-2xl bg-muted">
                <video ref={videoRef} key={clip.id} src={clip.videoUrl} autoPlay muted playsInline preload="auto"
                  onPlaying={() => setHasPlayed(true)}
                  onLoadedData={() => setLoaded(true)} onCanPlay={() => { if (phaseRef.current === "playing") resumeVideo(); }}
                  onTimeUpdate={(event) => { if (event.currentTarget.currentTime >= clip.pauseAt) beginDecision(); }}
                  onEnded={holdFinalFrame} onError={() => setVideoError(true)} className="block h-[45dvh] min-h-[45dvh] w-full object-contain sm:aspect-video sm:h-auto sm:min-h-0" />
                {signalSide && <div aria-hidden="true" data-direction={signalSide} className="simulation-signal-glow pointer-events-none absolute inset-0 rounded-[inherit]" />}
                {(!loaded || videoError || needsPlay) && phase === "playing" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/80">{videoError ? <><p className="text-sm">Unable to load this clip.</p><Button onClick={() => { setVideoError(false); videoRef.current?.load(); }}>Retry</Button></> : needsPlay ? <Button onClick={resumeVideo}><Play />Play clip</Button> : <LoaderCircle className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-label="Loading clip" />}</div>}
                <span className="pointer-events-none absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-border bg-primary-foreground px-3 py-1.5 text-xs font-semibold text-action shadow-sm" aria-label={`Intent: ${clip.intent}`}>
                  {signalSide === "left" ? <ArrowLeft aria-hidden="true" className="simulation-signal-arrow h-4 w-4 shrink-0" /> : signalSide === "right" ? <ArrowRight aria-hidden="true" className="simulation-signal-arrow h-4 w-4 shrink-0" /> : <ArrowUp aria-hidden="true" className="h-4 w-4 shrink-0" />}
                  {clip.intent}
                </span>
                <Button variant="secondary" size="icon" aria-label="Show action legend" title="Action legend" onClick={() => setMobileLegend(true)} className="absolute bottom-3 right-3 h-10 w-10 rounded-full lg:hidden"><CircleHelp /></Button>
              </div>
              {timed && <div role="progressbar" aria-label="Decision time remaining" aria-valuemin={0} aria-valuemax={2.5} aria-valuenow={phase === "playing" ? 2.5 : phase === "feedback" ? 0 : remaining / 1000} className="mt-3 flex h-1 overflow-hidden rounded-full bg-muted"><span className={cn("h-full transition-[flex-grow] duration-75", remaining > 1000 ? "bg-action" : "bg-destructive/60")} style={{ flexGrow: phase === "playing" ? DECISION_MS : phase === "feedback" ? 0 : remaining }} /><span style={{ flexGrow: phase === "playing" ? 0 : phase === "feedback" ? DECISION_MS : DECISION_MS - remaining }} /></div>}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{clip.subtitle}</p>
              <div ref={decisionPanel} className="mt-5">
                <TooltipProvider delayDuration={150}><div className="grid grid-cols-3 gap-3">
                  {clip.actions.map((action) => {
                    const Icon = icons[action.icon]; const reveal = phase === "feedback"; const correct = action.id === clip.correctAction; const selected = action.id === feedback?.selectedAction;
                    if (!Icon) return null;
                    return <Tooltip key={action.id}><TooltipTrigger asChild><span className="block"><Button variant="secondary" disabled={phase !== "decision"} onClick={() => answer(action.id)} aria-label={action.label} aria-pressed={selected} className={cn("aspect-square h-auto min-h-20 w-full min-w-0 rounded-2xl border border-border", phase === "playing" && "opacity-40", reveal && "disabled:opacity-100", reveal && correct && "border-success/50 bg-success/10 text-success", reveal && selected && !correct && "border-destructive/50 bg-destructive/10 text-destructive", reveal && !correct && !selected && "opacity-60")}><Icon className="size-9 sm:size-11" /></Button></span></TooltipTrigger><TooltipContent>{action.label}</TooltipContent></Tooltip>;
                  })}
                </div></TooltipProvider>
              </div>
            </div>
            {showLegend && <aside aria-label="Action legend" className="hidden rounded-2xl bg-card p-4 lg:block"><ActionLegend /></aside>}
            </div>
            <div className="hidden items-center gap-3 lg:flex"><Switch id="hide-legend" checked={!showLegend} onCheckedChange={hidden => { setShowLegend(!hidden); localStorage.setItem("drivable.simulation.hide-legend", String(hidden)); }} /><label htmlFor="hide-legend" className="text-xs text-muted-foreground">Hide legend</label></div>
            {phase === "feedback" && feedback && <div ref={feedbackPanel} role="status" className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className={cn("font-display text-lg font-bold", feedback.correct ? "text-success" : "text-destructive")}>{feedback.selectedAction === null ? "No decision made" : feedback.correct ? "Correct" : "Incorrect"}</h2>{feedback.reactionMs !== null && <span className="text-xs text-muted-foreground">Decided in {(feedback.reactionMs / 1000).toFixed(1)}s</span>}</div>
              {clip.actions.filter(action => action.id === clip.correctAction).map(action => { const Icon = icons[action.icon]; return <p key={action.id} className="mt-3 flex items-center gap-2 text-sm font-semibold">{Icon && <Icon className="h-5 w-5" />}Correct action: {action.label}</p>; })}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{clip.explanation}</p>
              <Button onClick={goNext} className="mt-5 h-12 w-full rounded-full sm:w-auto">Next scenario<ArrowRight /></Button>
            </div>}
          </div>
        ) : null}
      </div>
      <Dialog open={mobileLegend} onOpenChange={setMobileLegend}><DialogContent><DialogHeader><DialogTitle>Action legend</DialogTitle></DialogHeader><ActionLegend /></DialogContent></Dialog>
    </div>
  );
}
