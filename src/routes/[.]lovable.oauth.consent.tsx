import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Beta @supabase/supabase-js oauth namespace typing shim.
type OAuthResult = {
  data?: {
    client?: { name?: string; client_id?: string; redirect_uris?: string[] };
    redirect_url?: string;
    redirect_to?: string;
    scope?: string;
    user?: { email?: string };
  } | null;
  error?: { message: string } | null;
};
type SupabaseOAuth = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
function oauth(): SupabaseOAuth {
  return (supabase.auth as unknown as { oauth: SupabaseOAuth }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) {
      window.location.href = immediate;
      throw redirect({ to: "/" });
    }
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md text-center space-y-2">
        <h1 className="text-xl font-semibold">Could not load this authorization request</h1>
        <p className="text-sm text-muted-foreground">{String((error as Error)?.message ?? error)}</p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<null | "approve" | "deny">(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(null);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(null);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";
  const account = details?.user?.email;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md glass glow-soft rounded-2xl border border-primary/20 p-6 space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Connect {clientName} to Drivable
          </h1>
          <p className="text-sm text-muted-foreground">
            This lets {clientName} use Drivable as you.
          </p>
        </div>

        {account && (
          <div className="text-xs text-muted-foreground">
            Signed in as <span className="text-foreground">{account}</span>
          </div>
        )}

        <div className="text-sm space-y-2">
          <p className="font-medium">{clientName} will be able to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Read your Drivable chat threads and messages</li>
            <li>Create new chat threads on your behalf</li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            This does not bypass Drivable's permissions or backend policies.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={busy !== null}
            onClick={() => decide(true)}
          >
            {busy === "approve" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy !== null}
            onClick={() => decide(false)}
          >
            {busy === "deny" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Deny
          </Button>
        </div>
      </div>
    </main>
  );
}
