import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/drivable-logo.png";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password, Drivable" },
      { name: "description", content: "Choose a new password for your Drivable account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase places a recovery session in the URL hash. The client auto-parses
    // it, but we listen for PASSWORD_RECOVERY (or an existing session) to know
    // when it's safe to accept a new password.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasSession(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid password";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      setDone(true);
      toast.success("Password updated. You're signed in.");
      setTimeout(() => navigate({ to: "/app" }), 900);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't update password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-background overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 15%, oklch(0.72 0.20 240 / 0.18), transparent 70%), radial-gradient(50% 40% at 85% 85%, oklch(0.72 0.20 240 / 0.14), transparent 70%)",
        }}
      />
      <div className="w-full max-w-sm">
        <Link to="/" className="flex flex-col items-center gap-3 mb-8">
          <img src={logo} alt="Drivable" width={56} height={56} className="logo-mask" />
          <h1 className="font-display text-2xl font-bold tracking-tight">Reset your Drivable password</h1>
        </Link>

        <div className="glass glow-soft rounded-2xl border border-primary/20 p-6">
          <h2 className="text-lg font-semibold mb-2">Choose a new password</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Enter a new password below to finish resetting your account.
          </p>

          {!ready ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !hasSession ? (
            <div className="space-y-4">
              <p className="text-sm text-destructive">
                This password reset link is invalid or has expired. Request a new one from the sign in page.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </div>
          ) : done ? (
            <div className="space-y-4 text-center py-4">
              <p className="text-sm">Password updated. Redirecting you to the app…</p>
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/40 border-border/60 focus-visible:ring-primary/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Confirm password
                </Label>
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="bg-background/40 border-border/60 focus-visible:ring-primary/40"
                />
              </div>
              {error && <p className="text-[11px] text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
