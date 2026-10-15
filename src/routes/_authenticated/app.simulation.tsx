import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SIMULATION_CLIPS } from "@/data/simulation-clips";

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
  const [idx, setIdx] = useState(0);
  const [ended, setEnded] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const clip = SIMULATION_CLIPS[idx];
  const next = SIMULATION_CLIPS[(idx + 1) % SIMULATION_CLIPS.length];

  // Preload the next clip in the background.
  useEffect(() => {
    if (!next || next.id === clip.id) return;
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.src = next.videoUrl;
    v.load();
    return () => {
      v.removeAttribute("src");
      v.load();
    };
  }, [next, clip.id]);

  const goNext = () => {
    setIdx((i) => (i + 1) % SIMULATION_CLIPS.length);
    setEnded(false);
    setPicked(null);
  };

  return (
    <div className="h-full overflow-y-auto p-5 sm:p-7">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Driving Test Simulation</h1>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Clip {idx + 1} / {SIMULATION_CLIPS.length}
          </span>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border/60 bg-card p-2 shadow-md">
          <video
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
                  <button
                    key={i}
                    disabled={reveal}
                    onClick={() => setPicked(i)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl border p-3.5 text-left text-sm font-medium transition-all",
                      !reveal && "border-border bg-muted hover:border-primary/50",
                      reveal && isCorrect && "border-emerald-400 bg-emerald-500/20 text-emerald-800",
                      reveal && picked === i && !isCorrect && "border-red-400 bg-red-500/20 text-red-800",
                      reveal && picked !== i && !isCorrect && "opacity-40",
                    )}
                  >
                    <span>{opt}</span>
                    {reveal && isCorrect && <Check className="h-4 w-4" />}
                    {reveal && picked === i && !isCorrect && <X className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
                <p className="mb-1 text-sm font-bold text-primary">
                  {picked === clip.correct ? "Correct!" : "Not quite."}
                </p>
                <p className="text-sm text-foreground/90">{clip.explanation}</p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={goNext} className="press rounded-full">Next</Button>
                  <Button variant="outline" className="press rounded-full" onClick={() => { setEnded(false); setPicked(null); setIdx((i) => i); const v = document.querySelector("video"); if (v) { v.currentTime = 0; void v.play(); } }}>
                    <RotateCcw className="h-4 w-4" /> Replay
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
