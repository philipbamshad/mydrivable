import heroStill from "@/assets/hero-sim-still.jpg";
import leftTurnArrow from "@/assets/left-turn-green-arrow.webm.asset.json";
import { ArrowLeft, ArrowRight, ArrowUp, Triangle, Octagon } from "lucide-react";

export function SimulationPreview({ leftTurn = false }: { leftTurn?: boolean }) {
  return <div className="marketing-sim-preview mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-lg">
    <div className={`relative aspect-video overflow-hidden rounded-xl${leftTurn ? " marketing-left-turn-preview" : ""}`}>
      {leftTurn ? <video src={`${leftTurnArrow.url}#t=1.5`} muted playsInline preload="auto" aria-label="Drivable left-turn simulation with a green arrow" className="h-full w-full object-cover" /> : <img src={heroStill} alt="Drivable simulation approaching a green light with a clear crosswalk" className="h-full w-full object-cover" />}
      {leftTurn && <div aria-hidden="true" className="marketing-preview-signal-glow pointer-events-none absolute inset-0 rounded-[inherit]" />}
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-marketing-navy/90 px-3 py-1 text-xs font-semibold text-marketing-white">{leftTurn ? <ArrowLeft aria-hidden="true" className="marketing-preview-signal-arrow size-3.5" /> : <ArrowRight className="size-3.5 text-marketing-amber" />}{leftTurn ? "Turning left" : "Turning right"}</span>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {([{label:"Go", Icon:ArrowUp, tone:"text-marketing-green border-marketing-green/30"},{label:"Yield",Icon:Triangle,tone:"text-marketing-amber border-marketing-amber/30"},{label:"Stop",Icon:Octagon,tone:"text-marketing-red border-marketing-red/30"}]).map(({label,Icon,tone}) => <span key={label} className={`flex items-center justify-center gap-2 rounded-lg border bg-card py-2 text-xs font-semibold ${tone}`}><Icon className="size-4" />{label}</span>)}
    </div>
  </div>;
}