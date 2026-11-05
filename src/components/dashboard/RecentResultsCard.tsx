import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type RecentResultRow = {
  id: string;
  date: string;
  primary: string;
  secondary: string;
  tone?: "success" | "destructive";
};

/** "Recent results" card shown under start cards: the last 3 attempts. */
export function RecentResultsCard({ rows, emptyText = "No attempts yet" }: { rows: RecentResultRow[]; emptyText?: string }) {
  return (
    <Card className="bg-card rounded-[28px] border border-border/60 p-8 shadow-lg">
      <h2 className="font-display text-lg font-bold">Recent results</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {rows.map(row => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-muted-foreground">{row.date}</span>
              <span className="flex items-center gap-3 text-sm">
                <span className="font-semibold tabular-nums text-progress-text">{row.primary}</span>
                <span className={cn("font-medium", row.tone === "success" && "text-success", row.tone === "destructive" && "text-destructive", !row.tone && "text-muted-foreground")}>{row.secondary}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
