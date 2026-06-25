import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

const STORAGE_KEY = "driveguide-profile-v1";

export type DriveSession = {
  id: string;
  date: string;
  hours: number;
  maneuver: string;
  note: string;
};

export type ProfileState = {
  state: string;
  targetDate: string | null;
  quizScores: number[];
  driveSessions: DriveSession[];
};

type ProfileContextValue = ProfileState & {
  driveHours: number;
  readiness: number | null;
  hasActivity: boolean;
  isPro: boolean;
  setState: (s: string) => void;
  setTargetDate: (d: string | null) => void;
  unlockPro: () => void; // back-compat alias → opens checkout
  openCheckout: (priceId?: string) => void;
  recordQuizScore: (pct: number) => void;
  addDriveSession: (s: Omit<DriveSession, "id" | "date">) => void;
  reset: () => void;
};

const DEFAULT: ProfileState = {
  state: "",
  targetDate: null,
  quizScores: [],
  driveSessions: [],
};

const Ctx = createContext<ProfileContextValue | null>(null);

function load(): ProfileState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<ProfileState>) };
  } catch {
    return DEFAULT;
  }
}

const PRO_PASS_PRICE_ID = "pro_pass_monthly";

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);

  // Hydrate local-only profile from localStorage.
  useEffect(() => {
    setProfile(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile, hydrated]);

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

  // Read subscription status for current user (live via realtime).
  const refreshPro = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("subscriptions" as any)
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
      ((row.status === "active" || row.status === "trialing" || row.status === "past_due") &&
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

    // Poll for a short window after opening checkout in case realtime is delayed.
    const poll = setInterval(() => refreshPro(userId), 4000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [userId, refreshPro]);

  const setStateName = useCallback(
    (s: string) => setProfile((p) => ({ ...p, state: s })),
    [],
  );
  const setTargetDate = useCallback(
    (d: string | null) => setProfile((p) => ({ ...p, targetDate: d })),
    [],
  );
  const openCheckout = useCallback((priceId?: string) => {
    setCheckoutPriceId(priceId || PRO_PASS_PRICE_ID);
  }, []);
  const unlockPro = useCallback(() => openCheckout(), [openCheckout]);
  const recordQuizScore = useCallback(
    (pct: number) =>
      setProfile((p) => ({
        ...p,
        quizScores: [...p.quizScores, Math.round(pct)].slice(-30),
      })),
    [],
  );
  const addDriveSession = useCallback(
    (s: Omit<DriveSession, "id" | "date">) =>
      setProfile((p) => ({
        ...p,
        driveSessions: [
          ...p.driveSessions,
          { ...s, id: crypto.randomUUID(), date: new Date().toISOString() },
        ],
      })),
    [],
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
    setState: setStateName,
    setTargetDate,
    unlockPro,
    openCheckout,
    recordQuizScore,
    addDriveSession,
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
              $9 / month · cancel anytime. Test mode is active in preview — use card{" "}
              <span className="font-mono">4242 4242 4242 4242</span>.
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
