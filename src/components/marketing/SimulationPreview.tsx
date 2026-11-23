import heroStill from "@/assets/hero-sim-still.jpg";
import { ArrowRight, ArrowUp, Triangle, Octagon } from "lucide-react";

export function SimulationPreview() {
  return <div className="marketing-sim-preview mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-lg">
    <div className="relative aspect-video overflow-hidden rounded-xl">
      <img src={heroStill} alt="Drivable simulation approaching a green light with a clear crosswalk" className="h-full w-full object-cover" />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-marketing-navy/90 px-3 py-1 text-xs font-semibold text-marketing-white"><ArrowRight className="size-3.5 text-marketing-amber" />Turning right</span>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {([{label:"Go", Icon:ArrowUp, tone:"text-marketing-green border-marketing-green/30"},{label:"Yield",Icon:Triangle,tone:"text-marketing-amber border-marketing-amber/30"},{label:"Stop",Icon:Octagon,tone:"text-marketing-red border-marketing-red/30"}]).map(({label,Icon,tone}) => <span key={label} className={`flex items-center justify-center gap-2 rounded-lg border bg-card py-2 text-xs font-semibold ${tone}`}><Icon className="size-4" />{label}</span>)}
    </div>
  </div>;
}