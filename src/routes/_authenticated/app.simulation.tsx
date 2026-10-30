import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, Check, X, RotateCcw, Play, Octagon, Triangle, Eye, CornerUpLeft, CornerUpRight, Pause, Video, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { tabGlowStyle } from "@/lib/tab-glow";
import { SIMULATION_CLIPS } from "@/data/simulation-clips";
import { createSimulationSession, type ActionIcon, type SimulationClip } from "@/data/simulation-session";
import { DECISION_MS, recordDecision, decisionSummary, type ScenarioDecision } from "@/data/simulation-game";
import { ScenarioThumbnail } from "@/components/simulation/ScenarioThumbnail";
import { signalDirection, signalIsActive } from "@/data/simulation-signal";

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

type Phase = "ready" | "playing" | "decision" | "feedback" | "results";
const icons: Record<ActionIcon, typeof ArrowUp> = { go: ArrowUp, stop: Octagon, yield: Triangle, left: CornerUpLeft, right: CornerUpRight, wait: Pause, check: Eye };
const cardClass = "rounded-[28px] border border-border/60 bg-card p-5 shadow-lg sm:p-7";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-3xl bg-muted p-4 text-center sm:p-5"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold tabular-nums sm:text-3xl">{value}</p></div>;
}

function SimulationPage() {
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
    setHasPlayed(false);
    setSession(createSimulationSession(SIMULATION_CLIPS));
    setIdx(0); setDecisions([]); setFeedback(null);
    setVideoError(false); setLoaded(false); setNeedsPlay(false);
    scroller.current?.scrollTo({ top: 0 }); changePhase("playing");
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
      if (/^[1-4]$/.test(event.key) && action) { event.preventDefault(); answer(action.id); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [phase, clip, answer]);

  useEffect(() => {
    if (phase === "decision") decisionPanel.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    if (phase === "feedback") feedbackPanel.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [phase]);

  const active = phase !== "ready" && phase !== "results";
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
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Watch real driving situations and choose the right action before time runs out, just like on the road.</p>
              <div className="mt-5 flex items-center justify-between gap-4"><label htmlFor="timed-mode" className="text-sm font-medium">Timed mode <span className="font-normal text-muted-foreground">(5 seconds)</span></label><Switch id="timed-mode" checked={timed} onCheckedChange={setTimed} className="data-[state=checked]:bg-action" /></div>
              <Button onClick={start} className="mt-6 h-12 w-full rounded-full text-base font-semibold"><Play />Start simulation</Button>
            </div>
          </div>
        ) : phase === "results" ? (
          <div className={cn(cardClass, "mx-auto w-full max-w-3xl")}>
            <h2 className="font-display text-xl font-bold sm:text-2xl">Simulation complete</h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"><StatTile label="Accuracy" value={`${summary.accuracy}%`} /><StatTile label="Avg. decision time" value={summary.averageReaction === null ? "—" : `${summary.averageReaction.toFixed(1)}s`} /><StatTile label="Scenarios" value={`${summary.completed} / ${session.length}`} /></div>
            <section className="mt-7"><h3 className="font-display text-lg font-semibold">Review missed scenarios</h3>
              {summary.missed.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No missed scenarios.</p> : <ul className="mt-4 divide-y divide-border">
                {summary.missed.map((decision) => {
                  const source = session.find((item) => item.id === decision.scenarioId);
                  if (!source) return null;
                  const correct = source.actions.find((action) => action.id === source.correctAction);
                  return <li key={source.id} className="grid gap-4 py-5 first:pt-0 sm:grid-cols-[144px_1fr]"><div className="w-36"><ScenarioThumbnail clip={source} thumbnail={decision.thumbnail} /></div><div><h4 className="text-sm font-bold">{source.title}</h4><p className="mt-1 text-sm font-semibold text-success">Correct action: {correct?.label}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{source.explanation}</p></div></li>;
                })}
              </ul>}
            </section>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button onClick={start} className="h-12 flex-1 rounded-full"><RotateCcw />Try again</Button><Button variant="secondary" asChild className="h-12 flex-1 rounded-full"><Link to="/app">Back to dashboard</Link></Button></div>
          </div>
        ) : clip ? (
          <div data-scenario={clip.id} data-phase={phase} className="mx-auto w-full max-w-3xl space-y-5">
            <div className={cardClass}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>Scenario {idx + 1} of {session.length}</span><span>{clip.title}</span></div>
              <div role="progressbar" aria-label="Scenario progress" aria-valuemin={0} aria-valuemax={session.length} aria-valuenow={idx + 1} className="mb-5 flex h-1 overflow-hidden rounded-full bg-muted">{session.map((item, index) => <span key={item.id} className={cn("h-full flex-1", index <= idx && "bg-action")} />)}</div>
              <div key={clip.id} data-signal-active={signaling && signalSide !== null} className="simulation-signal-video relative overflow-hidden rounded-2xl bg-muted">
                <video ref={videoRef} key={clip.id} src={clip.videoUrl} autoPlay muted playsInline preload="auto"
                  onPlaying={() => setHasPlayed(true)}
                  onLoadedData={() => setLoaded(true)} onCanPlay={() => { if (phaseRef.current === "playing") resumeVideo(); }}
                  onTimeUpdate={(event) => { if (event.currentTarget.currentTime >= clip.pauseAt) beginDecision(); }}
                  onEnded={holdFinalFrame} onError={() => setVideoError(true)} className="block aspect-video w-full object-contain" />
                {signalSide && <div aria-hidden="true" data-direction={signalSide} className="simulation-signal-glow pointer-events-none absolute inset-0 rounded-[inherit]" />}
                {(!loaded || videoError || needsPlay) && phase === "playing" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/80">{videoError ? <><p className="text-sm">Unable to load this clip.</p><Button onClick={() => { setVideoError(false); videoRef.current?.load(); }}>Retry</Button></> : needsPlay ? <Button onClick={resumeVideo}><Play />Play clip</Button> : <LoaderCircle className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-label="Loading clip" />}</div>}
                <span className="pointer-events-none absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-border bg-primary-foreground px-3 py-1.5 text-xs font-semibold text-action shadow-sm" aria-label={`Intent: ${clip.intent}`}>
                  {signalSide === "left" ? <ArrowLeft aria-hidden="true" className="simulation-signal-arrow h-4 w-4 shrink-0" /> : signalSide === "right" ? <ArrowRight aria-hidden="true" className="simulation-signal-arrow h-4 w-4 shrink-0" /> : <ArrowUp aria-hidden="true" className="h-4 w-4 shrink-0" />}
                  {clip.intent}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{clip.subtitle}</p>
              {(phase === "decision" || phase === "feedback") && <div ref={decisionPanel} className="mt-5">
                {phase === "decision" && timed && <div className="mb-4 flex items-center gap-3"><div role="progressbar" aria-label="Decision time remaining" aria-valuemin={0} aria-valuemax={5} aria-valuenow={remaining / 1000} className="flex h-1 flex-1 overflow-hidden rounded-full bg-muted"><span className={cn("h-full transition-[flex-grow] duration-75", remaining > 1000 ? "bg-action" : "bg-destructive/60")} style={{ flexGrow: remaining }} /><span style={{ flexGrow: DECISION_MS - remaining }} /></div><span className="text-xs tabular-nums text-muted-foreground">{(remaining / 1000).toFixed(1)}s</span></div>}
                <h2 className="mb-4 font-display text-lg font-semibold">What do you do?</h2>
                <div className={cn("grid grid-cols-1 gap-3", clip.actions.length === 3 ? "sm:grid-cols-3" : clip.actions.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-2")}>
                  {clip.actions.map((action) => {
                    const Icon = icons[action.icon]; const reveal = phase === "feedback"; const correct = action.id === clip.correctAction; const selected = action.id === feedback?.selectedAction;
                    return <Button key={action.id} variant="secondary" disabled={reveal} onClick={() => answer(action.id)} aria-pressed={selected} className={cn("h-16 w-full min-w-0 gap-1.5 whitespace-normal rounded-2xl border border-transparent px-3 text-sm font-semibold disabled:opacity-100", reveal && correct && "border-success/50 bg-success/10 text-success", reveal && selected && !correct && "border-destructive/50 bg-destructive/10 text-destructive", reveal && !correct && !selected && "opacity-60")}><Icon /><span className="min-w-0 leading-5">{action.label}</span>{reveal && correct && <Check />}{reveal && selected && !correct && <X />}</Button>;
                  })}
                </div>
              </div>}
            </div>
            {phase === "feedback" && feedback && <div ref={feedbackPanel} role="status" className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className={cn("font-display text-lg font-bold", feedback.correct ? "text-success" : "text-destructive")}>{feedback.selectedAction === null ? "No decision made" : feedback.correct ? "Correct" : "Not quite"}</h2>{feedback.reactionMs !== null && <span className="text-xs text-muted-foreground">Decided in {(feedback.reactionMs / 1000).toFixed(1)}s</span>}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{clip.explanation}</p>
              <Button onClick={goNext} className="mt-5 h-12 w-full rounded-full sm:w-auto">Next scenario<ArrowRight /></Button>
            </div>}
          </div>
        ) : null}
      </div>
    </div>
  );
}
