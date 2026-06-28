import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useUserProfile,
  type DriveConditions,
  type DriveEnvironment,
  type DriveSession,
  type NewDriveSession,
} from "@/lib/user-profile";

// ---------------- Skill tree definition ----------------

type Skill = {
  id: string;
  name: string;
  blurb: string;
};

type Tier = {
  id: string;
  title: string;
  subtitle: string;
  accent: string; // oklch glow color
  skills: Skill[];
};

const TIERS: Tier[] = [
  {
    id: "basics",
    title: "Basics",
    subtitle: "Cockpit fundamentals — the unlock for everything else.",
    accent: "var(--color-primary)",
    skills: [
      { id: "starting", name: "Starting & Pull-Away", blurb: "Mirrors, signal, smooth release." },
      { id: "braking", name: "Smooth Braking", blurb: "Progressive pressure, no late stomps." },
      { id: "turning", name: "Controlled Turning", blurb: "Hand-over-hand, eyes through the corner." },
      { id: "lane-keep", name: "Lane Discipline", blurb: "Consistent position, signal early." },
    ],
  },
  {
    id: "intermediate",
    title: "Intermediate",
    subtitle: "Test-day maneuvers examiners watch closely.",
    accent: "oklch(0.78 0.18 70)",
    skills: [
      { id: "parallel", name: "Parallel Parking", blurb: "Within 12 in. of the curb, no contact." },
      { id: "three-point", name: "Three-Point Turn", blurb: "Three clean moves, scan every direction." },
      { id: "reverse", name: "Reversing in a Straight Line", blurb: "Slow, smooth, hand on passenger seat." },
      { id: "hill", name: "Hill Park & Restart", blurb: "Wheels curbed correctly, no rollback." },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    subtitle: "Real-world driving the test doesn't always cover.",
    accent: "oklch(0.72 0.22 320)",
    skills: [
      { id: "freeway-merge", name: "Freeway Merging", blurb: "Match flow, signal, no stopping on the ramp." },
      { id: "night", name: "Night Driving", blurb: "Headlight discipline, depth perception." },
      { id: "weather", name: "Adverse Weather", blurb: "Rain, fog, glare — softer inputs." },
      { id: "highway-exit", name: "Highway Exit & Decel", blurb: "Brake in the ramp, not the lane." },
    ],
  },
];

const ALL_SKILLS: Skill[] = TIERS.flatMap((t) => t.skills);

// ---------------- Helpers ----------------

const ENV_OPTIONS: { id: DriveEnvironment; label: string }[] = [
  { id: "city", label: "City" },
  { id: "highway", label: "Highway" },
  { id: "rural", label: "Rural" },
];
const COND_OPTIONS: { id: DriveConditions; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "night", label: "Night" },
];

function fmtMinutes(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ---------------- Drive log modal ----------------

type DriveFormValues = {
  minutes: number;
  environment: DriveEnvironment;
  conditions: DriveConditions;
  maneuvers: string[];
  note: string;
  supervisorApproved: boolean;
};

function emptyForm(): DriveFormValues {
  return {
    minutes: 30,
    environment: "city",
    conditions: "day",
    maneuvers: [],
    note: "",
    supervisorApproved: false,
  };
}

function DriveDialog({
  open,
  onClose,
  initial,
  onSubmit,
  title,
  submitLabel,
}: {
  open: boolean;
  onClose: () => void;
  initial: DriveFormValues;
  onSubmit: (v: DriveFormValues) => void;
  title: string;
  submitLabel: string;
}) {
  const [form, setForm] = useState<DriveFormValues>(initial);

  // Re-seed when dialog opens with new initial.
  useMemo(() => {
    if (open) setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleManeuver = (id: string) =>
    setForm((f) => ({
      ...f,
      maneuvers: f.maneuvers.includes(id)
        ? f.maneuvers.filter((m) => m !== id)
        : [...f.maneuvers, id],
    }));

  const submit = () => {
    if (!form.minutes || form.minutes <= 0) {
      toast.error("Enter how long the drive lasted (minutes).");
      return;
    }
    if (form.minutes > 1440) {
      toast.error("Drives can't exceed 24 hours.");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong border-primary/30 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>
            Capture what you practiced so your skill tree fills up automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={1440}
              step={5}
              value={form.minutes}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  minutes: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                }))
              }
              className="mt-1 w-full rounded-lg bg-background/50 border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              ≈ {fmtMinutes(form.minutes)} ·{" "}
              {(form.minutes / 60).toFixed(2)} hrs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                Environment
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ENV_OPTIONS.map((o) => {
                  const active = form.environment === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() =>
                        setForm((f) => ({ ...f, environment: o.id }))
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-xs font-medium press transition-all",
                        active
                          ? "border-primary bg-primary/15 text-primary shadow-[0_0_14px_-2px_var(--color-primary)]"
                          : "border-border bg-card/40 hover:border-primary/30",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                Conditions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COND_OPTIONS.map((o) => {
                  const active = form.conditions === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() =>
                        setForm((f) => ({ ...f, conditions: o.id }))
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-xs font-medium press transition-all",
                        active
                          ? "border-primary bg-primary/15 text-primary shadow-[0_0_14px_-2px_var(--color-primary)]"
                          : "border-border bg-card/40 hover:border-primary/30",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              Maneuvers practiced ({form.maneuvers.length} selected)
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {ALL_SKILLS.map((s) => {
                const active = form.maneuvers.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleManeuver(s.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-full border text-[11px] font-medium press transition-all",
                      active
                        ? "border-primary bg-primary/15 text-primary shadow-[0_0_10px_-3px_var(--color-primary)]"
                        : "border-border bg-card/40 hover:border-primary/30 text-muted-foreground",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Note (optional)
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              maxLength={500}
              placeholder="Stalled once at the light, otherwise clean drive…"
              className="mt-1 w-full min-h-[64px] rounded-lg bg-background/50 border border-border p-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Supervisor Sign-off</p>
                <p className="text-[11px] text-muted-foreground">
                  Co-pilot verified this session.
                </p>
              </div>
            </div>
            <Switch
              checked={form.supervisorApproved}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, supervisorApproved: v }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="press">
            Cancel
          </Button>
          <Button
            onClick={submit}
            className="press bg-primary text-primary-foreground hover:bg-primary"
            style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Skill tree card ----------------

function TierCard({
  tier,
  practicedCounts,
}: {
  tier: Tier;
  practicedCounts: Record<string, number>;
}) {
  const { skillMastery, setSkillMastery } = useUserProfile();

  const mastered = tier.skills.filter(
    (s) => skillMastery[s.id]?.mastered,
  ).length;
  const pct = Math.round((mastered / tier.skills.length) * 100);

  return (
    <Card
      className="glass glow-soft rounded-2xl p-5"
      style={{
        boxShadow: `0 0 0 1px color-mix(in oklab, ${tier.accent} 18%, transparent), 0 0 40px -16px ${tier.accent}`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-bold"
            style={{ color: tier.accent }}
          >
            Tier · {tier.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tier.subtitle}
          </p>
        </div>
        <Badge
          className="border shrink-0 font-display text-base px-2.5 py-1"
          style={{
            color: tier.accent,
            borderColor: `color-mix(in oklab, ${tier.accent} 45%, transparent)`,
            background: `color-mix(in oklab, ${tier.accent} 12%, transparent)`,
            textShadow: `0 0 10px ${tier.accent}`,
          }}
        >
          {pct}%
        </Badge>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: tier.accent,
            boxShadow: `0 0 12px ${tier.accent}`,
          }}
        />
      </div>

      <ul className="space-y-2">
        {tier.skills.map((s) => {
          const m = skillMastery[s.id] ?? { mastered: false, verified: false };
          const used = practicedCounts[s.id] ?? 0;
          return (
            <li
              key={s.id}
              className={cn(
                "rounded-xl border p-3 transition-all",
                m.mastered
                  ? "border-primary/40 bg-primary/[0.06]"
                  : "border-border bg-card/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{s.name}</p>
                    {m.verified && (
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40 border text-[10px] py-0 h-5">
                        <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {s.blurb}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5">
                    Practiced in {used} drive{used === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  <button
                    onClick={() =>
                      setSkillMastery(s.id, { mastered: !m.mastered })
                    }
                    className={cn(
                      "press flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.18em] font-bold transition-all",
                      m.mastered
                        ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_-2px_var(--color-primary)]"
                        : "border-border bg-background/40 text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {m.mastered ? "Mastered" : "Mark mastered"}
                  </button>
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Co-pilot
                    <Switch
                      checked={m.verified}
                      onCheckedChange={(v) =>
                        setSkillMastery(s.id, { verified: v })
                      }
                    />
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// ---------------- Drive log history ----------------

function LogHistory({
  sessions,
  onEdit,
}: {
  sessions: DriveSession[];
  onEdit: (s: DriveSession) => void;
}) {
  const { deleteDriveSession, updateDriveSession } = useUserProfile();

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground">
        No drives logged yet. Tap{" "}
        <span className="text-primary font-medium">Log a Drive</span> to start
        your record.
      </div>
    );
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <ul className="space-y-2">
      {sorted.map((s) => (
        <li
          key={s.id}
          className="rounded-xl border border-border bg-card/40 p-3.5 flex items-start gap-3"
        >
          <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 border border-primary/30 shrink-0">
            <Car className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">
                {fmtMinutes(s.minutes)} · {s.hours.toFixed(2)} hrs
              </p>
              {s.environment && (
                <Badge className="bg-primary/10 text-primary border-primary/30 border text-[10px] h-5 py-0 capitalize">
                  {s.environment}
                </Badge>
              )}
              {s.conditions && (
                <Badge className="bg-muted/40 border-border border text-[10px] h-5 py-0 capitalize">
                  {s.conditions}
                </Badge>
              )}
              {s.supervisorApproved && (
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40 border text-[10px] h-5 py-0">
                  <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Signed off
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {fmtDate(s.date)}
              {s.maneuvers.length > 0 && (
                <>
                  {" · "}
                  {s.maneuvers
                    .map(
                      (id) =>
                        ALL_SKILLS.find((sk) => sk.id === id)?.name ?? id,
                    )
                    .join(", ")}
                </>
              )}
            </p>
            {s.note && (
              <p className="text-[12px] text-muted-foreground mt-1 italic">
                "{s.note}"
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Co-pilot verified
                <Switch
                  checked={s.supervisorApproved}
                  onCheckedChange={(v) =>
                    updateDriveSession(s.id, { supervisorApproved: v })
                  }
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="press h-7 px-2 text-[11px]"
              onClick={() => onEdit(s)}
            >
              <Pencil className="w-3 h-3" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="press h-7 px-2 text-[11px] border-red-500/40 text-red-300 hover:bg-red-500/10"
              onClick={() => {
                if (window.confirm("Delete this drive log?")) {
                  deleteDriveSession(s.id);
                  toast.success("Drive log removed");
                }
              }}
            >
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------- Main screen ----------------

export function RoadPrepGuide() {
  const {
    isPro,
    unlockPro,
    driveHours,
    driveSessions,
    addDriveSession,
    updateDriveSession,
  } = useUserProfile();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<DriveSession | null>(null);

  const practicedCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of driveSessions) {
      for (const id of s.maneuvers) map[id] = (map[id] ?? 0) + 1;
    }
    return map;
  }, [driveSessions]);

  const verifiedSessions = driveSessions.filter(
    (s) => s.supervisorApproved,
  ).length;

  const handleAdd = (v: NewDriveSession) => {
    addDriveSession(v);
    toast.success(`Logged ${fmtMinutes(v.minutes)} of practice`);
    setAddOpen(false);
  };

  const handleEdit = (v: NewDriveSession) => {
    if (!editing) return;
    updateDriveSession(editing.id, v);
    toast.success("Drive log updated");
    setEditing(null);
  };

  return (
    <div className="relative space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold">Behind-the-Wheel</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track real drives, unlock the skill tree, and collect supervisor
          sign-offs before test day.
        </p>
      </div>

      {/* Tracker hero */}
      <Card className="glass glow-strong p-5 rounded-2xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Total Hours Logged
            </p>
            <p
              className="font-display text-4xl font-bold mt-1 text-primary"
              style={{ textShadow: "0 0 22px var(--color-primary)" }}
            >
              {driveHours.toFixed(1)}
              <span className="text-base text-muted-foreground font-normal ml-2">
                hrs · {driveSessions.length} drive
                {driveSessions.length === 1 ? "" : "s"}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              {verifiedSessions} of {driveSessions.length} co-pilot verified
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="press bg-primary text-primary-foreground hover:bg-primary"
            style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Log a Drive
          </Button>
        </div>
      </Card>

      {/* Skill tree */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display text-lg font-bold">Driver Skill Tree</h3>
        </div>
        <div
          className={cn(
            "grid gap-4 md:grid-cols-3 transition-all",
            !isPro && "blur-sm pointer-events-none select-none",
          )}
        >
          {TIERS.map((t) => (
            <TierCard
              key={t.id}
              tier={t}
              practicedCounts={practicedCounts}
            />
          ))}
        </div>
      </div>

      {/* History */}
      <Card className="glass glow-soft p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-bold">Drive History</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Edit or delete any entry
          </span>
        </div>
        <LogHistory sessions={driveSessions} onEdit={setEditing} />
      </Card>

      {!isPro && (
        <div className="absolute inset-x-0 top-56 grid place-items-center">
          <Card className="glass-strong glow-strong p-8 rounded-2xl text-center max-w-md mx-auto">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 border border-primary/40 mx-auto mb-4"
              style={{ boxShadow: "0 0 24px -4px var(--color-primary)" }}
            >
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold">Pro Pass required</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Unlock the full Driver Skill Tree with Pro Pass. Hour tracking and
              drive history stay free.
            </p>
            <Button
              onClick={() => unlockPro()}
              className="press mt-5 bg-primary text-primary-foreground hover:bg-primary"
              style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
            >
              Unlock Pro
            </Button>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> Skill-tree mastery & sign-off
              are Pro features
            </p>
          </Card>
        </div>
      )}

      <DriveDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        initial={emptyForm()}
        onSubmit={handleAdd}
        title="Log a Drive"
        submitLabel="Save drive"
      />
      <DriveDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        initial={
          editing
            ? {
                minutes: editing.minutes,
                environment: editing.environment ?? "city",
                conditions: editing.conditions ?? "day",
                maneuvers: editing.maneuvers,
                note: editing.note,
                supervisorApproved: editing.supervisorApproved,
              }
            : emptyForm()
        }
        onSubmit={handleEdit}
        title="Edit drive log"
        submitLabel="Save changes"
      />
    </div>
  );
}
