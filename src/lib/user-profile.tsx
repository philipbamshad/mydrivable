import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/payments/StripeEmbeddedCheckout";

export type DriveEnvironment = "city" | "highway" | "rural";
export type DriveConditions = "day" | "night";

export type DriveSession = {
  id: string;
  date: string;
  hours: number;
  minutes: number;
  maneuver: string;
  note: string;
  environment: DriveEnvironment | null;
  conditions: DriveConditions | null;
  maneuvers: string[];
  supervisorApproved: boolean;
};

export type SkillMasteryEntry = {
  mastered: boolean;
  verified: boolean;
};

export type ProfileState = {
  state: string;
  targetDate: string | null;
  quizScores: number[];
  driveSessions: DriveSession[];
  dailyDone: Record<string, boolean>;
  dailyDoneDate: string | null;
  skillMastery: Record<string, SkillMasteryEntry>;
};

export type NewDriveSession = {
  minutes: number;
  environment: DriveEnvironment;
  conditions: DriveConditions;
  maneuvers: string[];
  note?: string;
  supervisorApproved?: boolean;
};

type ProfileContextValue = ProfileState & {
  driveHours: number;
  readiness: number | null;
  hasActivity: boolean;
  isPro: boolean;
  hydrating: boolean;
  setState: (s: string) => void;
  setTargetDate: (d: string | null) => void;
  unlockPro: () => void;
  openCheckout: (priceId?: string) => void;
  recordQuizScore: (pct: number) => void;
  addDriveSession: (s: NewDriveSession) => void;
  updateDriveSession: (id: string, patch: Partial<NewDriveSession>) => void;
  deleteDriveSession: (id: string) => void;
  toggleDailyTask: (taskId: string, dateKey: string) => void;
  setSkillMastery: (skillId: string, patch: Partial<SkillMasteryEntry>) => void;
  reset: () => void;
};

const DEFAULT: ProfileState = {
  state: "",
  targetDate: null,
  quizScores: [],
  driveSessions: [],
  dailyDone: {},
  dailyDoneDate: null,
  skillMastery: {},
};

const Ctx = createContext<ProfileContextValue | null>(null);
const PRO_PASS_PRICE_ID = "pro_pass_monthly";

type DrivingLogRow = {
  id: string;
  hours: number | string;
  minutes: number | null;
  maneuver: string | null;
  note: string | null;
  environment: string | null;
  conditions: string | null;
  maneuvers: string[] | null;
  supervisor_approved: boolean | null;
  logged_at: string;
};

function rowToSession(r: DrivingLogRow): DriveSession {
  const hours = Number(r.hours) || 0;
  const minutes = r.minutes ?? Math.round(hours * 60);
  return {
    id: r.id,
    date: r.logged_at,
    hours,
    minutes,
    maneuver: r.maneuver ?? "",
    note: r.note ?? "",
    environment: (r.environment as DriveEnvironment | null) ?? null,
    conditions: (r.conditions as DriveConditions | null) ?? null,
    maneuvers: r.maneuvers ?? [],
    supervisorApproved: !!r.supervisor_approved,
  };
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileState>(DEFAULT);
  const [isPro, setIsPro] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const activeUserRef = useRef<string | null>(null);

  // Track current user.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Hydrate full profile from DB whenever the user changes.
  useEffect(() => {
    if (!userId) {
      activeUserRef.current = null;
      setProfile(DEFAULT);
      setHydrating(false);
      return;
    }
    activeUserRef.current = userId;
    setHydrating(true);
    let cancelled = false;

    (async () => {
      const { data: existing } = await supabase
        .from("user_profiles" as never)
        .select(
          "active_state, target_date, daily_done, daily_done_date, skill_mastery",
        )
        .eq("user_id", userId)
        .maybeSingle();

      let prof = existing as
        | {
            active_state: string;
            target_date: string | null;
            daily_done: Record<string, boolean> | null;
            daily_done_date: string | null;
            skill_mastery: Record<string, SkillMasteryEntry> | null;
          }
        | null;

      if (!prof) {
        await supabase
          .from("user_profiles" as never)
          .insert({ user_id: userId } as never);
        prof = {
          active_state: "",
          target_date: null,
          daily_done: {},
          daily_done_date: null,
          skill_mastery: {},
        };
      }

      const [{ data: scores }, { data: logs }] = await Promise.all([
        supabase
          .from("mock_test_history" as never)
          .select("score_pct, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(30),
        supabase
          .from("driving_logs" as never)
          .select(
            "id, hours, minutes, maneuver, note, environment, conditions, maneuvers, supervisor_approved, logged_at",
          )
          .eq("user_id", userId)
          .order("logged_at", { ascending: true }),
      ]);

      if (cancelled || activeUserRef.current !== userId) return;

      const today = new Date().toISOString().slice(0, 10);
      const dailyDate = prof.daily_done_date;
      const dailyDone = dailyDate === today ? (prof.daily_done ?? {}) : {};

      setProfile({
        state: prof.active_state ?? "",
        targetDate: prof.target_date,
        quizScores: ((scores as { score_pct: number }[] | null) ?? []).map(
          (r) => r.score_pct,
        ),
        driveSessions: ((logs as DrivingLogRow[] | null) ?? []).map(rowToSession),
        dailyDone,
        dailyDoneDate: dailyDate,
        skillMastery: prof.skill_mastery ?? {},
      });
      setHydrating(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ---- Subscription / Pro status ----
  const refreshPro = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("subscriptions" as never)
      .select("status, current_period_end, cancel_at_period_end")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) {
      setIsPro(false);
      return;
    }
    const row = data as unknown as {
      status: string;
      current_period_end: string | null;
      cancel_at_period_end: boolean | null;
    };
    const periodOk =
      !row.current_period_end || new Date(row.current_period_end) > new Date();
    const active =
      ((row.status === "active" ||
        row.status === "trialing" ||
        row.status === "past_due") &&
        periodOk) ||
      (row.status === "canceled" && periodOk);
    setIsPro(active);
  }, []);

  useEffect(() => {
    if (!userId) {
      setIsPro(false);
      return;
    }
    refreshPro(userId);
    const channel = supabase
      .channel(`subscriptions:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${userId}`,
        },
        () => refreshPro(userId),
      )
      .subscribe();
    const poll = setInterval(() => refreshPro(userId), 4000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [userId, refreshPro]);

  // ---- Mutators (optimistic + DB write) ----
  const persistProfileFields = useCallback(
    async (patch: Record<string, unknown>) => {
      const uid = activeUserRef.current;
      if (!uid) return;
      await supabase
        .from("user_profiles" as never)
        .upsert({ user_id: uid, ...patch } as never, {
          onConflict: "user_id",
        });
    },
    [],
  );

  const setStateName = useCallback(
    (s: string) => {
      setProfile((p) => ({ ...p, state: s }));
      void persistProfileFields({ active_state: s });
    },
    [persistProfileFields],
  );

  const setTargetDate = useCallback(
    (d: string | null) => {
      setProfile((p) => ({ ...p, targetDate: d }));
      void persistProfileFields({ target_date: d });
    },
    [persistProfileFields],
  );

  const openCheckout = useCallback((priceId?: string) => {
    setCheckoutPriceId(priceId || PRO_PASS_PRICE_ID);
  }, []);
  const unlockPro = useCallback(() => openCheckout(), [openCheckout]);

  const recordQuizScore = useCallback((pct: number) => {
    const uid = activeUserRef.current;
    const rounded = Math.round(pct);
    setProfile((p) => ({
      ...p,
      quizScores: [...p.quizScores, rounded].slice(-30),
    }));
    if (uid) {
      void supabase
        .from("mock_test_history" as never)
        .insert({ user_id: uid, score_pct: rounded } as never);
    }
  }, []);

  const addDriveSession = useCallback((s: NewDriveSession) => {
    const uid = activeUserRef.current;
    const tempId = crypto.randomUUID();
    const date = new Date().toISOString();
    const hours = Math.round((s.minutes / 60) * 100) / 100;
    const summary =
      s.maneuvers.length > 0
        ? `${s.environment.toUpperCase()} · ${s.maneuvers.length} maneuver${s.maneuvers.length === 1 ? "" : "s"}`
        : `${s.environment.toUpperCase()} · ${s.conditions}`;
    const optimistic: DriveSession = {
      id: tempId,
      date,
      hours,
      minutes: s.minutes,
      maneuver: summary,
      note: s.note ?? "",
      environment: s.environment,
      conditions: s.conditions,
      maneuvers: s.maneuvers,
      supervisorApproved: s.supervisorApproved ?? false,
    };
    setProfile((p) => ({
      ...p,
      driveSessions: [...p.driveSessions, optimistic],
    }));
    if (uid) {
      void supabase
        .from("driving_logs" as never)
        .insert({
          user_id: uid,
          hours,
          minutes: s.minutes,
          maneuver: summary,
          note: s.note ?? "",
          environment: s.environment,
          conditions: s.conditions,
          maneuvers: s.maneuvers,
          supervisor_approved: s.supervisorApproved ?? false,
          logged_at: date,
        } as never)
        .select("id")
        .single()
        .then(({ data }) => {
          const row = data as { id: string } | null;
          if (!row) return;
          setProfile((p) => ({
            ...p,
            driveSessions: p.driveSessions.map((ds) =>
              ds.id === tempId ? { ...ds, id: row.id } : ds,
            ),
          }));
        });
    }
  }, []);

  const updateDriveSession = useCallback(
    (id: string, patch: Partial<NewDriveSession>) => {
      const uid = activeUserRef.current;
      setProfile((p) => ({
        ...p,
        driveSessions: p.driveSessions.map((ds) => {
          if (ds.id !== id) return ds;
          const minutes = patch.minutes ?? ds.minutes;
          const hours = Math.round((minutes / 60) * 100) / 100;
          return {
            ...ds,
            minutes,
            hours,
            environment: patch.environment ?? ds.environment,
            conditions: patch.conditions ?? ds.conditions,
            maneuvers: patch.maneuvers ?? ds.maneuvers,
            note: patch.note ?? ds.note,
            supervisorApproved:
              patch.supervisorApproved ?? ds.supervisorApproved,
          };
        }),
      }));
      if (uid) {
        const dbPatch: Record<string, unknown> = {};
        if (patch.minutes !== undefined) {
          dbPatch.minutes = patch.minutes;
          dbPatch.hours = Math.round((patch.minutes / 60) * 100) / 100;
        }
        if (patch.environment !== undefined)
          dbPatch.environment = patch.environment;
        if (patch.conditions !== undefined)
          dbPatch.conditions = patch.conditions;
        if (patch.maneuvers !== undefined) dbPatch.maneuvers = patch.maneuvers;
        if (patch.note !== undefined) dbPatch.note = patch.note;
        if (patch.supervisorApproved !== undefined)
          dbPatch.supervisor_approved = patch.supervisorApproved;
        void supabase
          .from("driving_logs" as never)
          .update(dbPatch as never)
          .eq("id", id);
      }
    },
    [],
  );

  const deleteDriveSession = useCallback((id: string) => {
    const uid = activeUserRef.current;
    setProfile((p) => ({
      ...p,
      driveSessions: p.driveSessions.filter((ds) => ds.id !== id),
    }));
    if (uid) {
      void supabase.from("driving_logs" as never).delete().eq("id", id);
    }
  }, []);

  const toggleDailyTask = useCallback(
    (taskId: string, dateKey: string) => {
      let nextDone: Record<string, boolean> = {};
      setProfile((p) => {
        const base = p.dailyDoneDate === dateKey ? p.dailyDone : {};
        nextDone = { ...base, [taskId]: !base[taskId] };
        return { ...p, dailyDone: nextDone, dailyDoneDate: dateKey };
      });
      void persistProfileFields({
        daily_done: nextDone,
        daily_done_date: dateKey,
      });
    },
    [persistProfileFields],
  );

  const setSkillMastery = useCallback(
    (skillId: string, patch: Partial<SkillMasteryEntry>) => {
      let nextMap: Record<string, SkillMasteryEntry> = {};
      setProfile((p) => {
        const prev = p.skillMastery[skillId] ?? {
          mastered: false,
          verified: false,
        };
        nextMap = {
          ...p.skillMastery,
          [skillId]: { ...prev, ...patch },
        };
        return { ...p, skillMastery: nextMap };
      });
      void persistProfileFields({ skill_mastery: nextMap });
    },
    [persistProfileFields],
  );

  const reset = useCallback(() => setProfile(DEFAULT), []);

  const driveHours = useMemo(
    () => profile.driveSessions.reduce((a, s) => a + s.hours, 0),
    [profile.driveSessions],
  );

  const readiness = useMemo(() => {
    if (profile.quizScores.length === 0) return null;
    const sum = profile.quizScores.reduce((a, n) => a + n, 0);
    return Math.round(sum / profile.quizScores.length);
  }, [profile.quizScores]);

  const hasActivity =
    profile.quizScores.length > 0 || profile.driveSessions.length > 0;

  const value: ProfileContextValue = {
    ...profile,
    driveHours,
    readiness,
    hasActivity,
    isPro,
    hydrating,
    setState: setStateName,
    setTargetDate,
    unlockPro,
    openCheckout,
    recordQuizScore,
    addDriveSession,
    updateDriveSession,
    deleteDriveSession,
    toggleDailyTask,
    setSkillMastery,
    reset,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog
        open={!!checkoutPriceId}
        onOpenChange={(o) => {
          if (!o) setCheckoutPriceId(null);
        }}
      >
        <DialogContent className="glass-strong border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-display text-xl">
              Unlock Pro Pass
            </DialogTitle>
            <DialogDescription>
              $9 / month · cancel anytime. Test mode is active in preview — use
              card <span className="font-mono">4242 4242 4242 4242</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {checkoutPriceId && (
              <StripeEmbeddedCheckout
                key={checkoutPriceId}
                priceId={checkoutPriceId}
                returnUrl={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/app?checkout=success`
                    : undefined
                }
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export function useUserProfile() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUserProfile must be inside UserProfileProvider");
  return v;
}

export const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];
