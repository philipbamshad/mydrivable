import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "driveguide-profile-v1";

export type DriveSession = {
  id: string;
  date: string; // ISO
  hours: number;
  maneuver: string;
  note: string;
};

export type ProfileState = {
  state: string; // "" = not selected
  targetDate: string | null; // ISO yyyy-mm-dd
  isPro: boolean;
  quizScores: number[]; // 0..100, most recent last
  driveSessions: DriveSession[];
};

type ProfileContextValue = ProfileState & {
  driveHours: number;
  readiness: number | null;
  hasActivity: boolean;
  setState: (s: string) => void;
  setTargetDate: (d: string | null) => void;
  unlockPro: () => void;
  recordQuizScore: (pct: number) => void;
  addDriveSession: (s: Omit<DriveSession, "id" | "date">) => void;
  reset: () => void;
};

const DEFAULT: ProfileState = {
  state: "",
  targetDate: null,
  isPro: false,
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

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

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

  const setStateName = useCallback(
    (s: string) => setProfile((p) => ({ ...p, state: s })),
    [],
  );
  const setTargetDate = useCallback(
    (d: string | null) => setProfile((p) => ({ ...p, targetDate: d })),
    [],
  );
  const unlockPro = useCallback(
    () => setProfile((p) => ({ ...p, isPro: true })),
    [],
  );
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
          {
            ...s,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          },
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
    setState: setStateName,
    setTargetDate,
    unlockPro,
    recordQuizScore,
    addDriveSession,
    reset,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
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
