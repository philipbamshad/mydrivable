import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Signed-in AND on the beta allowlist (checked in the database, never the client). */
export const requireAllowlisted = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("is_allowlisted");
    if (error || data !== true) throw new Response("Forbidden", { status: 403 });
    return next();
  });
