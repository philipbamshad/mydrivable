import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

// Empty dataset — new users start with no exam history.
const DATA: { day: string; score: number | null }[] = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  score: null,
}));

export function ExamProgressChart() {
  return (
    <Card className="p-5 glass glow-soft h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">Mock Exam Progression</h3>
          <p className="text-xs text-muted-foreground">
            Rolling 14-day window · pass line at 80%
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-primary/15 text-primary border-primary/30">
          <Lock className="w-3 h-3 mr-1" /> Pro
        </Badge>
      </div>

      <div className="flex-1 min-h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              domain={[40, 100]}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine y={80} stroke="var(--color-primary)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
        <Stat label="Latest" value="—" />
        <Stat label="Best" value="—" />
        <Stat label="Avg" value="—" />
      </div>

      {/* Glass lock overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] backdrop-blur-md bg-background/40">
        <div className="glass glow-soft rounded-2xl px-6 py-5 max-w-xs text-center border border-primary/30 shadow-[0_0_40px_-8px_oklch(0.72_0.20_240_/_0.55)]">
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-display text-sm font-bold leading-snug mb-1">
            Unlock Performance Trajectory Analytics
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            with Pro Pass · $9/mo
          </p>
          <Button
            size="sm"
            className="w-full bg-primary hover:bg-primary text-primary-foreground shadow-[0_0_24px_-2px_oklch(0.72_0.20_240_/_0.75)] hover:shadow-[0_0_36px_-2px_oklch(0.72_0.20_240_/_0.95)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
  );
}
