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
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase parses the recovery hash and fires PASSWORD_RECOVERY,
    // then persists a temporary session usable for updateUser.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data,
      });
      if (updateError) throw updateError;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update password";
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
        <Link to="/" className="flex flex-col items-center gap-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl group-hover:bg-primary/50 transition-colors" />
            <img src={logo} alt="Drivable" width={56} height={56} className="relative" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight">Reset password</h1>
            <p className="text-[11px] text-muted-foreground mt-1">
              Choose a new password for your account.
            </p>
          </div>
        </Link>

        <div className="glass glow-soft rounded-2xl border border-primary/20 p-6">
          {!ready ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Verifying link…</span>
            </div>
          ) : !hasSession ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-foreground">
                This reset link is invalid or has expired.
              </p>
              <p className="text-[12px] text-muted-foreground">
                Request a new one from the sign-in screen.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/40 border-border/60 focus-visible:ring-primary/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">Use at least 8 characters.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Confirm password
                </Label>
                <Input
                  id="confirm-password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="bg-background/40 border-border/60 focus-visible:ring-primary/40"
                />
              </div>

              {error && (
                <p className="text-[11px] text-destructive">{error}</p>
              )}

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
