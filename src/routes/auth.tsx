import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/drivable-logo.png";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } => {
    const next = typeof s.next === "string" && s.next.startsWith("/") ? s.next : undefined;
    return next ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: "Sign in, Drivable" },
      { name: "description", content: "Sign in to Drivable to start coaching toward your permit and road test." },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("That doesn't look like a valid email")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

function friendlyAuthError(message: string, mode: "sign-in" | "sign-up"): string {
  const m = message.toLowerCase();
  if (mode === "sign-in") {
    if (
      m.includes("invalid login") ||
      m.includes("invalid credentials") ||
      m.includes("invalid email or password")
    ) {
      return "Incorrect email or password. If you don't have an account yet, create one.";
    }
    if (m.includes("email not confirmed")) {
      return "Confirm your email first, check your inbox for the link.";
    }
    if (m.includes("too many") || m.includes("rate limit")) {
      return "Too many attempts. Wait a moment and try again.";
    }
  } else {
    if (
      m.includes("already registered") ||
      m.includes("already been registered") ||
      m.includes("user already") ||
      m.includes("duplicate")
    ) {
      return "An account with this email already exists. Try signing in instead.";
    }
    if (m.includes("password")) return message;
  }
  return message || "Something went wrong. Try again.";
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const goNext = () => {
    if (next) {
      window.location.assign(next);
    } else {
      navigate({ to: "/app" });
    }
  };

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) goNext();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" && !errs.email) errs.email = issue.message;
        if (key === "password" && !errs.password) errs.password = issue.message;
      }
      setFieldErrors(errs);
      toast.error(errs.email || errs.password || "Check the form and try again.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin + "/app" },
        });
        if (error) throw error;
        // Supabase returns a user with an empty identities array when the
        // email is already registered (obfuscation mode). Detect and surface.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          const msg = "An account with this email already exists. Try signing in instead.";
          setFieldErrors({ email: msg });
          toast.error(msg);
          setMode("sign-in");
          setSignupSuccess(false);
          setLoading(false);
          return;
        }
        setSignupSuccess(true);
        setLoading(false);
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      goNext();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong";
      const friendly = friendlyAuthError(raw, mode);
      if (mode === "sign-in" && (raw.toLowerCase().includes("invalid") || raw.toLowerCase().includes("credentials"))) {
        setFieldErrors({ password: friendly });
      } else if (mode === "sign-up" && friendly.toLowerCase().includes("already exists")) {
        setFieldErrors({ email: friendly });
      }
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      goNext();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-background overflow-hidden">
      {/* Ambient neon glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 15%, oklch(0.72 0.20 240 / 0.18), transparent 70%), radial-gradient(50% 40% at 85% 85%, oklch(0.72 0.20 240 / 0.14), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at center, black, transparent 75%)",
        }}
      />

      <div className="w-full max-w-sm">
        <Link to="/" className="flex flex-col items-center gap-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl group-hover:bg-primary/50 transition-colors" />
            <img src={logo} alt="Drivable" width={56} height={56} className="relative" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight">Drivable</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.28em]">
              Permit · Road Test
            </p>
          </div>
        </Link>

        <div className="glass glow-soft rounded-2xl border border-primary/20 p-6 ">
          <div className="flex gap-1 mb-5 p-1 bg-background/40 border border-border/60 rounded-lg backdrop-blur-sm">
            {(["sign-in", "sign-up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setFieldErrors({});
                  setSignupSuccess(false);
                }}
                className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all ${
                  mode === m
                    ? "bg-primary/15 text-foreground border border-primary/40 "
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "sign-in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {mode === "sign-up" && signupSuccess ? (
            <div className="text-center space-y-5 py-6">
              <p className="text-lg font-medium leading-relaxed">
                Account created successfully! Click below to sign in.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setMode("sign-in");
                  setEmail("");
                  setPassword("");
                  setSignupSuccess(false);
                  setFieldErrors({});
                  setLoading(false);
                }}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmail} className="space-y-3" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!fieldErrors.email}
                    className={`bg-background/40 border-border/60 focus-visible:ring-primary/40 ${
                      fieldErrors.email ? "border-destructive/70" : ""
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!fieldErrors.password}
                      className={`bg-background/40 border-border/60 focus-visible:ring-primary/40 pr-10 ${
                        fieldErrors.password ? "border-destructive/70" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="text-[11px] text-destructive">{fieldErrors.password}</p>
                  ) : mode === "sign-up" ? (
                    <p className="text-[11px] text-muted-foreground">Use at least 8 characters.</p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === "sign-in" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <div className="h-px flex-1 bg-border/70" />
                <span>OR</span>
                <div className="h-px flex-1 bg-border/70" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border/70 bg-background/40 hover:bg-background/70 hover:border-primary/50"
                onClick={handleGoogle}
                disabled={loading}
              >
                Continue with Google
              </Button>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          By continuing, you agree to drive safely and legally.
        </p>
      </div>
    </div>
  );
}
