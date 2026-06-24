import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Car, ShieldCheck, CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

type Metric = {
  label: string;
  value: string;
  hint: string;
  tag: string;
  tagTone: "signal" | "ok" | "warn" | "info";
  icon: ReactNode;
};

const TONE: Record<Metric["tagTone"], string> = {
  signal: "bg-primary/15 text-primary border-primary/30",
  ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

const METRICS: Metric[] = [
  {
    label: "Permit Test Readiness",
    value: "84%",
    hint: "12 of 14 topics above pass line",
    tag: "On track",
    tagTone: "ok",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    label: "Behind-the-Wheel Maneuvers",
    value: "6 / 12",
    hint: "Parallel parking + 3-point next",
    tag: "In progress",
    tagTone: "signal",
    icon: <Car className="w-4 h-4" />,
  },
  {
    label: "Marketplace Leads Screened",
    value: "3",
    hint: "1 flagged for frame rust",
    tag: "Review",
    tagTone: "warn",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    label: "DMV Exam Target Date",
    value: "Oct 14",
    hint: "16 weeks of prep remaining",
    tag: "Scheduled",
    tagTone: "info",
    icon: <CalendarDays className="w-4 h-4" />,
  },
];

export function MetricsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {METRICS.map((m) => (
        <Card
          key={m.label}
          className="p-4 bg-card border-border hover:border-primary/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              {m.icon}
              <span>{m.label}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold uppercase tracking-wide ${TONE[m.tagTone]}`}
            >
              {m.tag}
            </Badge>
          </div>
          <div className="mt-3 font-display text-3xl font-bold tracking-tight">
            {m.value}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{m.hint}</div>
        </Card>
      ))}
    </div>
  );
}
