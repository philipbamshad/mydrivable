import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ThreadSidebar } from "@/components/chat/ThreadSidebar";
import { UserProfileProvider } from "@/lib/user-profile";
import { ThemeProvider } from "@/lib/theme";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncAccount } from "@/lib/email-prefs.functions";
import {resumeAnswers,leaveAnswers} from "@/lib/answer-queue.client";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";

export const Route = createFileRoute("/_authenticated/app")({
  beforeLoad: async ({context}) => {await resumeAnswers(context.user.id);},
  component: AppLayout,
});

function AppLayout() {
  const {user}=Route.useRouteContext();
  useEffect(()=>{const leave=()=>leaveAnswers(user.id);const online=()=>void resumeAnswers(user.id);window.addEventListener("pagehide",leave);window.addEventListener("online",online);const hidden=()=>{if(document.visibilityState==="hidden")leave();};document.addEventListener("visibilitychange",hidden);return()=>{leave();window.removeEventListener("pagehide",leave);window.removeEventListener("online",online);document.removeEventListener("visibilitychange",hidden);};},[user.id]);
  const sync = useServerFn(syncAccount);
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
    sync({ data: { timezone } }).catch(err => console.error("Account sync failed", err));
  }, [sync]);
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <div className="flex flex-col h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-gradient-to-b from-background via-background to-secondary/40 safe-top safe-bottom safe-x">
          <PaymentTestModeBanner />
          <div className="relative flex flex-col md:flex-row flex-1 min-h-0 min-w-0 overflow-hidden p-0 gap-0 md:p-4 md:gap-4">
            <ThreadSidebar />
            <main className="flex-1 min-w-0 overflow-x-hidden md:rounded-[32px] glass glow-soft overflow-hidden">
              <Outlet />
            </main>
          </div>
        </div>

      </UserProfileProvider>
    </ThemeProvider>
  );
}

