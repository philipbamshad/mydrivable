import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Legacy export name retained by callers; public app access requires authentication only. */
export const requireAllowlisted = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth]);
