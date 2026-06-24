import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const DATA = [
  { day: "D1", score: 58 },
  { day: "D2", score: 61 },
  { day: "D3", score: 60 },
  { day: "D4", score: 65 },
  { day: "D5", score: 68 },
  { day: "D6", score: 67 },
  { day: "D7", score: 72 },
  { day: "D8", score: 74 },
  { day: "D9", score: 71 },
  { day: "D10", score: 78 },
  { day: "D11", score: 80 },
  { day: "D12", score: 79 },
  { day: "D13", score: 83 },
  { day: "D14", score: 84 },
];

export function ExamProgressChart() {
  const latest = DATA[DATA.length - 1].score;
  const first = DATA[0].score;
  const delta = latest - first;

  return (
    <Card className="p-5 bg-card border-border h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">Mock Exam Progression</h3>
          <p className="text-xs text-muted-foreground">
            Rolling 14-day window · pass line at 80%
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
          +{delta} pts
        </Badge>
      </div>

      <div className="flex-1 min-h-[260px]">
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
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-primary)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
        <Stat label="Latest" value={`${latest}%`} />
        <Stat label="Best" value={`${Math.max(...DATA.map((d) => d.score))}%`} />
        <Stat label="Avg" value={`${Math.round(DATA.reduce((a, d) => a + d.score, 0) / DATA.length)}%`} />
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
