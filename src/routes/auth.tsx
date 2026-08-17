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
      { property: "og:title", content: "Sign in, Drivable" },
      { property: "og:description", content: "Sign in to Drivable to start coaching toward your permit and road test." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mydrivable.com/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://mydrivable.com/auth" }],
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
  const [forgotSent, setForgotSent] = useState(false);



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
        const returnTo = next ?? "/app";
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin + returnTo },
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

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      // Preserve `next` (e.g. the OAuth consent URL) through the provider
      // redirect by pointing the callback back at /auth?next=..., which then
      // consumes `next` after the session hydrates.
      const redirectUri = next
        ? `${window.location.origin}/auth?next=${encodeURIComponent(next)}`
        : window.location.origin;
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: redirectUri,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Sign-in failed. Try again.");
        return;
      }
      if (result.redirected) return;
      goNext();
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credentialsSchema.shape.email.safeParse(email);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Enter a valid email";
      setFieldErrors({ email: msg });
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
      toast.success("Check your inbox for a reset link.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't send reset email";
      toast.error(msg);
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
            <img src={logo} alt="Drivable logo" width={56} height={56} className="relative logo-mask" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight">Drivable, Sign In</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.28em]">
              Permit
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
                {mode === "sign-in" && (
                  <div className="flex justify-end">
                    {forgotSent ? (
                      <span className="text-[11px] text-muted-foreground">Reset link sent. Check your inbox.</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgot}
                        disabled={loading}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        Forgot your password?
                      </button>
                    )}
                  </div>
                )}
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

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/70 bg-background/40 hover:bg-background/70 hover:border-primary/50"
                  onClick={() => handleOAuth("google")}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48" aria-hidden>
                    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.8 2.6 13.6l7.8 6.1C12.3 13.5 17.6 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24c0-1.6-.1-2.8-.4-4.1H24v8.4h12.7c-.5 3-2.4 5.5-5 7.1l7.6 5.9c4.5-4.1 7.2-10.2 7.2-17.3z"/>
                    <path fill="#FBBC05" d="M10.4 28.3c-.5-1.4-.8-2.8-.8-4.3s.3-2.9.8-4.3l-7.8-6.1C.9 16.8 0 20.3 0 24s.9 7.2 2.6 10.4l7.8-6.1z"/>
                    <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.3-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.7 2.3-6.4 0-11.7-4-13.6-9.9l-7.8 6.1C6.5 42.2 14.6 47.5 24 47.5z"/>
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border/70 bg-background/40 hover:bg-background/70 hover:border-primary/50"
                  onClick={() => handleOAuth("apple")}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 384 512" aria-hidden>
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-36.8-2.8-77 21.3-91.7 21.3-15.6 0-51.2-20.3-79.2-20.3C56.2 141.6 0 184.9 0 271.5c0 25.6 4.7 52 14.1 79.3 12.6 35.9 40.1 105.2 78.9 104.1 20.3-.5 34.6-14.4 61-14.4 25.6 0 38.9 14.4 61.5 14.4 39.1-.6 64-63.2 76-99.2-52.3-24.6-72.8-75.9-72.8-87zM240 89.6c19.2-23.4 27.6-42.9 25.6-70.6-25.5 2.6-46.9 15.6-61.5 33.6-14.6 18-22.3 39-20.8 65.4 28.4 1.9 47.9-8.9 56.7-28.4z"/>
                  </svg>
                  Continue with Apple
                </Button>
              </div>
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
