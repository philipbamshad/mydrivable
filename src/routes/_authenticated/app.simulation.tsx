import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, X, RotateCcw, Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GlowShell } from "@/lib/tab-glow";
import { SIMULATION_CLIPS } from "@/data/simulation-clips";
import { createSimulationSession, type SimulationClip } from "@/data/simulation-session";

export const Route = createFileRoute("/_authenticated/app/simulation")({
  head: () => ({
    meta: [
      { title: "Driving Test Simulation | Drivable" },
      { name: "description", content: "Watch real driving clips and choose what the driver should do next." },
      { property: "og:title", content: "Driving Test Simulation | Drivable" },
      { property: "og:description", content: "Watch real driving clips and choose what the driver should do next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SimulationPage,
});

function SimulationPage() {
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState<SimulationClip[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [idx, setIdx] = useState(0);
  const [ended, setEnded] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const clip = session[idx];
  const next = session[(idx + 1) % session.length];

  // Preload the next clip in the background.
  useEffect(() => {
    if (!started || !clip || !next || next.id === clip.id) return;
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.src = next.videoUrl;
    v.load();
    return () => {
      v.removeAttribute("src");
      v.load();
    };
  }, [started, next, clip]);

  const startSimulation = () => {
    setSession(createSimulationSession(SIMULATION_CLIPS));
    setIdx(0);
    setEnded(false);
    setPicked(null);
    setStarted(true);
  };

  const goNext = () => {
    setIdx((i) => (i + 1) % session.length);
    setEnded(false);
    setPicked(null);
  };

  const replay = () => {
    setEnded(false);
    setPicked(null);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play();
    }
  };

  const exitSimulation = () => {
    setStarted(false);
    setSession([]);
    setIdx(0);
    setEnded(false);
    setPicked(null);
  };

  if (!started || !clip) {
    return (
      <GlowShell>
        <Card className="relative bg-card rounded-[28px] border border-border/60 p-5 sm:p-7 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-[18px] border border-border bg-muted text-foreground shrink-0">
              <Video className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg sm:text-xl font-bold">
                Driving Test Simulation
              </h3>
            </div>
          </div>

          <Button
            onClick={startSimulation}
            className="press w-full mt-6 rounded-full h-12 sm:h-13 text-sm sm:text-base font-semibold"
          >
            <Play className="h-4 w-4" /> Start simulation
          </Button>
        </Card>
      </GlowShell>
    );
  }

  return (
    <GlowShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Driving Test Simulation</h1>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Clip {idx + 1} / {session.length}
          </span>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border/60 bg-card p-2 shadow-md">
          <video
            ref={videoRef}
            key={clip.id}
            src={clip.videoUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setEnded(true)}
            className="block w-full rounded-[22px] bg-muted"
          />
        </div>

        {!ended ? (
          <p className="text-center text-sm text-muted-foreground">Watch closely. A question appears when the clip ends.</p>
        ) : (
          <div className="rounded-[28px] border border-border/60 bg-card p-6 shadow-md fade-in-up">
            <h2 className="mb-4 font-display text-lg font-semibold">{clip.question}</h2>
            <div className="grid gap-3">
              {clip.options.map((opt, i) => {
                const reveal = picked !== null;
                const isCorrect = i === clip.correct;
                return (
                  <Button
                    key={i}
                    variant="outline"
                    disabled={reveal}
                    onClick={() => setPicked(i)}
                    className={cn(
                      "h-auto min-h-12 w-full whitespace-normal flex items-center justify-between gap-2 rounded-xl border p-3.5 text-left text-sm font-medium transition-all disabled:opacity-100",
                      !reveal && "border-border bg-muted hover:border-foreground/40",
                      reveal && isCorrect && "border-success bg-success/10 text-success",
                      reveal && picked === i && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                      reveal && picked !== i && !isCorrect && "disabled:opacity-40",
                    )}
                  >
                    <span>{opt}</span>
                    {reveal && isCorrect && <Check className="h-4 w-4" />}
                    {reveal && picked === i && !isCorrect && <X className="h-4 w-4" />}
                  </Button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="mt-5 rounded-xl border border-border bg-muted p-4">
                <p className="mb-1 text-sm font-bold text-foreground">
                  {picked === clip.correct ? "Correct!" : "Not quite."}
                </p>
                <p className="text-sm text-foreground/90">{clip.explanation}</p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={idx === session.length - 1 ? startSimulation : goNext} className="press rounded-full">
                    {idx === session.length - 1 ? "Start again" : "Next"}
                  </Button>
                  <Button variant="outline" className="press rounded-full" onClick={replay}>
                    <RotateCcw className="h-4 w-4" /> Replay
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GlowShell>
  );
}
