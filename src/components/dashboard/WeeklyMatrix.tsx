import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type Goal = { id: string; label: string; mins: number; tag: string };
type Day = { day: string; date: string; goals: Goal[] };

const WEEK: Day[] = [
  {
    day: "Mon",
    date: "Jun 23",
    goals: [
      { id: "m1", label: "Review night driving restrictions", mins: 10, tag: "Permit" },
      { id: "m2", label: "Sign quiz: regulatory vs warning", mins: 15, tag: "Permit" },
    ],
  },
  {
    day: "Tue",
    date: "Jun 24",
    goals: [
      { id: "t1", label: "Log 2 parallel parking attempts", mins: 25, tag: "Road" },
      { id: "t2", label: "Right-of-way scenarios x10", mins: 12, tag: "Permit" },
    ],
  },
  {
    day: "Wed",
    date: "Jun 25",
    goals: [
      { id: "w1", label: "3-point turn — quiet street", mins: 20, tag: "Road" },
      { id: "w2", label: "Read: controlled substance laws", mins: 8, tag: "Permit" },
    ],
  },
  {
    day: "Thu",
    date: "Jun 26",
    goals: [
      { id: "th1", label: "Highway merge — supervised", mins: 30, tag: "Road" },
      { id: "th2", label: "Tire pressure + fluid check", mins: 10, tag: "Care" },
    ],
  },
  {
    day: "Fri",
    date: "Jun 27",
    goals: [
      { id: "f1", label: "Practice exam — section 4", mins: 20, tag: "Permit" },
      { id: "f2", label: "Mirror & blind-spot drill", mins: 10, tag: "Road" },
    ],
  },
  {
    day: "Sat",
    date: "Jun 28",
    goals: [
      { id: "s1", label: "Full mock road test (45m)", mins: 45, tag: "Road" },
    ],
  },
  {
    day: "Sun",
    date: "Jun 29",
    goals: [
      { id: "su1", label: "Review missed quiz answers", mins: 15, tag: "Permit" },
    ],
  },
];

const TAG_TONE: Record<string, string> = {
  Permit: "bg-primary/15 text-primary border-primary/30",
  Road: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Care: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function WeeklyMatrix() {
  const [done, setDone] = useState<Record<string, boolean>>({ m1: true, t2: true });

  const toggle = (id: string) =>
    setDone((p) => ({ ...p, [id]: !p[id] }));

  const totalDone = Object.values(done).filter(Boolean).length;
  const totalGoals = WEEK.reduce((a, d) => a + d.goals.length, 0);

  return (
    <Card className="p-5 glass glow-soft h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">Weekly Training Matrix</h3>
          <p className="text-xs text-muted-foreground">
            Daily goals tuned to your phase — check off as you go.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {totalDone}/{totalGoals} done
        </Badge>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1 flex-1">
        {WEEK.map((day) => (
          <div
            key={day.day}
            className="rounded-lg border border-border bg-background/30 backdrop-blur-sm border-primary/15 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-sm">{day.day}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {day.date}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {day.goals.reduce((a, g) => a + g.mins, 0)} min
              </span>
            </div>
            <div className="space-y-1.5">
              {day.goals.map((g) => (
                <label
                  key={g.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={!!done[g.id]}
                    onCheckedChange={() => toggle(g.id)}
                  />
                  <span
                    className={`text-sm flex-1 ${done[g.id] ? "line-through text-muted-foreground" : ""}`}
                  >
                    {g.label}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${TAG_TONE[g.tag]}`}
                  >
                    {g.tag}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">
                    {g.mins}m
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
