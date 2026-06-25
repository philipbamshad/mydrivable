import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="glass glow-strong rounded-2xl p-8 max-w-md text-center">
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/40 mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          {sessionId ? "Payment complete" : "Returned from checkout"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your Pro Pass is being activated. You can head back to the app now.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold mt-5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          style={{ boxShadow: "0 0 18px -2px var(--color-primary)" }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
