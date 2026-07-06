import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDays, Target } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile";
import { TargetDatePicker } from "@/components/dashboard/TargetDatePicker";
import logo from "@/assets/drivable-logo.png";



function EmptyRing({ icon: Icon }: { icon: typeof Target }) {
  return (
    <div className="relative h-[120px] w-[120px] grid place-items-center rounded-full border-2 border-dashed border-border">
      <Icon className="w-7 h-7 text-muted-foreground" />
    </div>
  );
}


export function HeaderWidgets() {
  const { targetDate, setTargetDate } = useUserProfile();

  // Parse YYYY-MM-DD as a local date so display and countdown match the
  // calendar day the user selected, independent of their timezone offset.
  const localTarget = useMemo(() => {
    if (!targetDate) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(targetDate);
    if (!m) return new Date(targetDate);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }, [targetDate]);

  const daysLeft = useMemo(() => {
    if (!localTarget) return null;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return Math.ceil((localTarget.getTime() - startOfToday.getTime()) / 86400000);
  }, [localTarget]);

  const targetLabel = useMemo(() => {
    if (!localTarget) return null;
    return localTarget.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }, [localTarget]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <Card className="glass glow-soft p-5 rounded-2xl flex items-center justify-center gap-5 relative overflow-hidden min-h-[160px]">
        <img
          src={logo}
          alt="Drivable"
          className="h-20 w-20 rounded-2xl"
          style={{}}
        />
        <span
          className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground"
        >
          Drivable
        </span>
      </Card>



      <Card className="glass glow-soft p-5 rounded-2xl flex items-center gap-5">
        {!targetDate ? (
          <>
            <EmptyRing icon={CalendarDays} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                DMV Target Date
              </p>
              <h3 className="font-display text-lg font-bold mt-1">Not set</h3>
              <div className="mt-2">
                <TargetDatePicker
                  value={null}
                  onChange={(d) => setTargetDate(d)}
                  size="sm"
                  showClear={false}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative h-[120px] w-[120px] grid place-items-center rounded-2xl bg-primary/10 border border-primary/30">
              <CalendarDays className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: "inset 0 0 28px var(--color-primary)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                DMV Target Date
              </p>
              <h3 className="font-display text-3xl font-bold mt-1">{targetLabel}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
                  {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : "Past due"}
                </span>
                <TargetDatePicker
                  value={targetDate}
                  onChange={(d) => setTargetDate(d)}
                  size="sm"
                />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
