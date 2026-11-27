import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { confirmCheckoutPayment } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { trackMetaEvent } from "@/lib/meta-pixel";

const PURCHASE_SENT_KEY = "drivable_meta_purchase_sent";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({ meta: [
    { title: "Checkout Return | Drivable" },
    { name: "description", content: "Return to Drivable after your Pro Pass checkout." },
    { property: "og:title", content: "Checkout Return | Drivable" },
    { property: "og:description", content: "Return to Drivable after your Pro Pass checkout." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const [proActive, setProActive] = useState(false);
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let timer: number | undefined;
    let pixelTimer: number | undefined;
    let pixelTries = 0;
    const alreadySent = () => (localStorage.getItem(PURCHASE_SENT_KEY) ?? "").split(",").includes(sessionId);
    const sendPurchase = () => {
      if (cancelled || alreadySent()) return;
      // Session ID doubles as Meta's eventID so retries are deduplicated.
      if (trackMetaEvent("Purchase", { value: 24, currency: "USD" }, sessionId)) {
        const sent = (localStorage.getItem(PURCHASE_SENT_KEY) ?? "").split(",").filter(Boolean);
        localStorage.setItem(PURCHASE_SENT_KEY, [...sent, sessionId].slice(-20).join(","));
        return;
      }
      if (++pixelTries <= 10) pixelTimer = window.setTimeout(sendPurchase, 300);
    };
    const check = async () => {
      const result = await confirmCheckoutPayment({ data: { sessionId, environment: getStripeEnvironment() } }).catch(() => null);
      if (cancelled || !result || !("paid" in result) || !result.paid) {
        if (!cancelled) timer = window.setTimeout(check, 1000);
        return;
      }
      if (!alreadySent()) sendPurchase();
      if (result.pro) {
        setProActive(true);
        return;
      }
      timer = window.setTimeout(check, 1000);
    };
    void check();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (pixelTimer) window.clearTimeout(pixelTimer);
    };
  }, [sessionId]);
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="glass glow-strong rounded-2xl p-8 max-w-md text-center">
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/40 mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          {proActive ? "Pro Pass active" : sessionId ? "Payment complete" : "Returned from checkout"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {proActive
            ? "Your $24 lifetime Pro Pass is ready. Unlimited practice is now available."
            : "We're confirming your payment and activating Pro. This usually takes a few seconds."}
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
