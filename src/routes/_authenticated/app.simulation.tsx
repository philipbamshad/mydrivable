import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, Check, X, RotateCcw, Play, Heart, Flame, Volume2, VolumeX, Octagon, Triangle, Eye, CornerUpLeft, CornerUpRight, Pause, Trophy, Gauge, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SIMULATION_CLIPS } from "@/data/simulation-clips";
import { createSimulationSession, type ActionIcon, type SimulationClip } from "@/data/simulation-session";
import { DECISION_MS, FEEDBACK_MS, initialDriveStats, recordDecision, driveSummary } from "@/data/simulation-game";
import { useDriveSound } from "@/components/simulation/use-drive-sound";

export const Route = createFileRoute("/_authenticated/app/simulation")({
  head: () => ({ meta: [
    { title: "Driving Test Simulation | Drivable" },
    { name: "description", content: "React to real driving scenarios in a timed driving game with lives, streaks and speed scoring." },
    { property: "og:title", content: "Driving Test Simulation | Drivable" },
    { property: "og:description", content: "React to real driving scenarios in a timed driving game with lives, streaks and speed scoring." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: SimulationPage,
});

type Phase = "ready" | "playing" | "decision" | "feedback" | "results";
type Feedback = { correct: boolean; timedOut: boolean; reaction: number | null; points: number };
const icons: Record<ActionIcon, typeof ArrowUp> = { go: ArrowUp, stop: Octagon, yield: Triangle, left: CornerUpLeft, right: CornerUpRight, wait: Pause, check: Eye };

function SimulationPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const phaseRef = useRef<Phase>("ready");
  const [session, setSession] = useState<SimulationClip[]>([]);
  const [idx, setIdx] = useState(0);
  const [stats, setStats] = useState(initialDriveStats);
  const [remaining, setRemaining] = useState(DECISION_MS);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [autoNext, setAutoNext] = useState(6);
  const [videoError, setVideoError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const decisionStart = useRef(0);
  const frameRequest = useRef<number | null>(null);
  const { muted, toggle, unlock, play } = useDriveSound();
  const clip = session[idx];
  const next = session[idx + 1];
  const summary = driveSummary(stats);
  const finished = stats.lives === 0 || idx === session.length - 1;

  const changePhase = useCallback((value: Phase) => { phaseRef.current = value; setPhase(value); }, []);
  const start = () => {
    unlock();
    setSession(createSimulationSession(SIMULATION_CLIPS));
    setIdx(0); setStats(initialDriveStats()); setFeedback(null);
    setVideoError(false); setLoaded(false); setNeedsPlay(false);
    changePhase("playing");
  };
  const exit = () => { videoRef.current?.pause(); changePhase("ready"); setSession([]); };
  const goNext = useCallback(() => {
    if (phaseRef.current !== "feedback") return;
    if (finished) { changePhase("results"); return; }
    setIdx((value) => value + 1); setFeedback(null); setVideoError(false); setLoaded(false); setNeedsPlay(false);
    changePhase("playing");
  }, [finished, changePhase]);

  const beginDecision = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    videoRef.current?.pause();
    decisionStart.current = performance.now();
    setRemaining(DECISION_MS);
    changePhase("decision");
  }, [changePhase]);

  const answer = useCallback((actionId: string | null) => {
    if (phaseRef.current !== "decision" || !clip) return;
    const elapsed = performance.now() - decisionStart.current;
    const timedOut = actionId === null || elapsed >= DECISION_MS;
    const correct = !timedOut && actionId === clip.correctAction;
    // Lock synchronously so a key, click and timeout cannot score twice.
    changePhase("feedback");
    const result = recordDecision(stats, correct, timedOut ? null : elapsed);
    setStats(result.stats);
    setFeedback({ correct, timedOut, reaction: timedOut ? null : elapsed / 1000, points: result.points });
    setAutoNext(FEEDBACK_MS / 1000);
    play(correct ? "correct" : "wrong");
  }, [clip, stats, play, changePhase]);

  useEffect(() => {
    if (phase !== "decision") return;
    let tick = -1;
    const interval = window.setInterval(() => {
      const left = Math.max(0, DECISION_MS - (performance.now() - decisionStart.current));
      setRemaining(left);
      if (left <= 1000 && left > 0) {
        const beat = Math.floor((1000 - left) / 250);
        if (beat !== tick) { tick = beat; play("tick"); }
      }
      if (left === 0) answer(null);
    }, 30);
    const deadline = window.setTimeout(() => answer(null), DECISION_MS);
    return () => { window.clearInterval(interval); window.clearTimeout(deadline); };
  }, [phase, answer, play]);

  useEffect(() => {
    if (phase !== "decision" || !clip) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName))) return;
      const action = clip.actions[Number(event.key) - 1];
      if (/^[1-4]$/.test(event.key) && action) { event.preventDefault(); answer(action.id); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, clip, answer]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const started = performance.now();
    const interval = window.setInterval(() => setAutoNext(Math.max(0, Math.ceil((FEEDBACK_MS - performance.now() + started) / 1000))), 200);
    const timeout = window.setTimeout(goNext, FEEDBACK_MS);
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [phase, goNext]);

  useEffect(() => {
    if (!next || phase === "ready" || phase === "results") return;
    const video = document.createElement("video");
    video.preload = "auto"; video.muted = true; video.src = next.videoUrl; video.load();
    return () => { video.removeAttribute("src"); video.load(); };
  }, [next, phase === "ready", phase === "results"]);

  // Frame callbacks pause at the authored decision timestamp rather than waiting for ended.
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
      if (frameRequest.current !== null && typeof video.cancelVideoFrameCallback === "function") video.cancelVideoFrameCallback(frameRequest.current);
    };
  }, [clip, phase, beginDecision]);

  const resumeVideo = () => {
    unlock();
    const video = videoRef.current;
    if (video) void video.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
  };

  return (
    <section className="simulation-game flex h-full min-h-0 w-full flex-col overflow-hidden" aria-label="Driving Test Simulation">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {phase !== "ready" && <Button variant="ghost" size="icon" onClick={exit} title="Exit simulation" aria-label="Exit simulation"><ArrowLeft /></Button>}
          <h1 className="font-display text-sm font-bold sm:text-lg">Driving Test Simulation</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={muted ? "Unmute sounds" : "Mute sounds"} title={muted ? "Unmute sounds" : "Mute sounds"} aria-pressed={muted}>
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
      </header>

      {phase === "ready" ? (
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <video src={SIMULATION_CLIPS[0]?.videoUrl} muted playsInline preload="auto" onLoadedMetadata={(event) => { event.currentTarget.currentTime = 1; }} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-background/65" />
          <div className="relative flex flex-col items-center px-6 text-center">
            <Gauge className="mb-5 h-12 w-12 text-success" />
            <h2 className="font-display text-3xl font-bold sm:text-5xl">Take the wheel.</h2>
            <div className="mt-5 flex items-center gap-4 text-sm font-medium text-foreground"><span>6 scenarios</span><span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-destructive" />3 lives</span></div>
            <Button onClick={start} className="mt-8 h-14 rounded-full px-8 text-base font-bold"><Play /> Start simulation</Button>
          </div>
        </div>
      ) : phase === "results" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center">
          <Trophy className="mb-4 h-10 w-10 text-success" />
          <h2 className="font-display text-3xl font-bold">{stats.lives === 0 ? "Drive over" : "Drive complete"}</h2>
          <p className="mt-5 font-display text-6xl font-bold tabular-nums">{stats.score.toLocaleString()}</p>
          <p className="mt-1 text-sm text-muted-foreground">Total score</p>
          <dl className="mt-8 grid w-full max-w-lg grid-cols-3 gap-3 border-y border-border/60 py-6">
            <div><dd className="text-2xl font-bold tabular-nums">{summary.accuracy}%</dd><dt className="mt-1 text-xs text-muted-foreground">Accuracy</dt></div>
            <div><dd className="text-2xl font-bold tabular-nums">{summary.averageReaction === null ? "—" : `${summary.averageReaction.toFixed(1)}s`}</dd><dt className="mt-1 text-xs text-muted-foreground">Avg. reaction</dt></div>
            <div><dd className="text-2xl font-bold tabular-nums">{stats.bestStreak}</dd><dt className="mt-1 text-xs text-muted-foreground">Best streak</dt></div>
          </dl>
          <Button onClick={start} className="mt-8 h-14 rounded-full px-8 text-base font-bold"><RotateCcw />Drive Again</Button>
        </div>
      ) : clip ? (
        <div className="drive-stage relative flex-1 overflow-hidden" data-scenario={clip.id} data-phase={phase}>
          <video ref={videoRef} key={clip.id} src={clip.videoUrl} autoPlay muted playsInline preload="auto"
            onLoadedData={() => setLoaded(true)}
            onCanPlay={() => { if (phaseRef.current === "playing") resumeVideo(); }}
            onTimeUpdate={(event) => { if (event.currentTarget.currentTime >= clip.pauseAt) beginDecision(); }}
            onEnded={beginDecision}
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-contain bg-background" />
          <div className="drive-top pointer-events-none absolute inset-x-0 top-0 h-32" />
          <div className="absolute inset-x-0 top-0 z-10">
            {phase === "decision" && <progress aria-label="Decision time remaining" className="drive-countdown block h-1.5 w-full overflow-hidden" max={DECISION_MS} value={remaining} data-urgency={remaining > 2000 ? "safe" : remaining > 1000 ? "warning" : "danger"} />}
            <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-6">
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">Score</p><p className="font-display text-2xl font-bold tabular-nums" aria-label="Score">{stats.score}</p></div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1.5 text-xs font-semibold sm:text-sm"><Flame className="h-4 w-4 text-success" />{stats.streak} in a row</p>
                <div className="mt-2 flex justify-end gap-1.5" aria-label={`${stats.lives} lives remaining`}>
                  {[0, 1, 2].map((heart) => <Heart key={heart} className={cn("h-5 w-5", heart < stats.lives ? "fill-destructive text-destructive" : "text-muted-foreground/40")} />)}
                </div>
              </div>
            </div>
          </div>

          {(!loaded || videoError || needsPlay) && phase === "playing" && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/65">
            {videoError ? <><p>Unable to load this clip.</p><Button onClick={() => { setVideoError(false); videoRef.current?.load(); }}>Retry</Button></> : needsPlay ? <Button onClick={resumeVideo}><Play />Play clip</Button> : <LoaderCircle className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-label="Loading clip" />}
          </div>}

          {phase === "playing" && <div className="drive-bottom pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-6 pt-20 sm:px-6"><p className="text-sm font-semibold sm:text-base">{clip.cue}</p></div>}

          {phase === "decision" && <div className="drive-bottom drive-actions absolute inset-x-0 bottom-0 z-20 px-4 pb-5 pt-16 sm:px-6 sm:pb-6">
            <div className="mb-4 flex items-end justify-between gap-4"><h2 className="text-sm font-bold sm:text-lg">{clip.cue}</h2><span className="shrink-0 text-sm font-bold tabular-nums">{(remaining / 1000).toFixed(1)}s</span></div>
            <div className={cn("grid grid-cols-2 gap-2 sm:gap-3", clip.actions.length === 3 ? "sm:grid-cols-3" : clip.actions.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-2")}>
              {clip.actions.map((action, index) => {
                const Icon = icons[action.icon];
                return <Button key={action.id} onClick={() => answer(action.id)} className="relative h-16 min-w-0 flex-col gap-1 rounded-2xl px-2 text-sm font-bold sm:h-24 sm:text-base [&_svg]:size-6">
                  <Icon /><span>{action.label}</span><kbd className="absolute right-2 top-2 hidden text-xs text-action-foreground/60 md:block">{index + 1}</kbd>
                </Button>;
              })}
            </div>
          </div>}

          {phase === "feedback" && feedback && <>
            <div key={`${clip.id}-flash`} className={cn("drive-flash pointer-events-none absolute inset-0 z-10", feedback.correct ? "bg-success" : "bg-destructive")} />
            <div className="drive-bottom absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-5 pt-16 sm:pb-6">
              <div role="status" className="w-full max-w-xl rounded-lg border border-border/70 bg-card/95 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className={cn("flex items-center gap-2 text-xl font-bold", feedback.correct ? "text-success" : "text-destructive")}>
                    {feedback.correct ? <Check /> : <X />}{feedback.timedOut ? "Too slow!" : feedback.correct ? "Correct!" : "Wrong"}
                  </h2>
                  <span className="text-sm font-bold tabular-nums">{feedback.reaction !== null && `${feedback.reaction.toFixed(1)}s`}{feedback.correct && ` · +${feedback.points}`}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">{clip.explanation}</p>
                <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{finished ? "Results" : "Next drive"} in {autoNext}s</span><Button onClick={goNext} className="rounded-full px-6">{finished ? "Results" : "Next"}<ArrowRight /></Button></div>
              </div>
            </div>
          </>}
        </div>
      ) : null}
    </section>
  );
}
