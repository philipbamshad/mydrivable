import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  priceId: string;
  returnUrl?: string;
}

export function StripeEmbeddedCheckout({ priceId, returnUrl }: Props) {
  const createSession = useServerFn(createCheckoutSession);
  const [error, setError] = useState<string | null>(null);
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    try {
    const result = await createSession({
      data: {
        priceId,
        returnUrl: returnUrl || `${window.location.origin}/app?checkout=success`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe did not return a client secret");
    return result.clientSecret;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to load checkout. Please try again.";
      setError(message);
      throw new Error(message);
    }
  }, [createSession, priceId, returnUrl]);
  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  if (error) return <div role="alert" className="space-y-3 p-4"><p className="text-sm text-destructive">{error}</p><Button onClick={() => setError(null)}>Retry checkout</Button></div>;

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
