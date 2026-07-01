import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  LayoutDashboard,
  MessageSquare,
  ClipboardCheck,
  Timer,
} from "lucide-react";
import { HeaderWidgets } from "@/components/dashboard/HeaderWidgets";
import { DailyChecklist } from "@/components/dashboard/DailyChecklist";
import { ExamProgressChart } from "@/components/dashboard/ExamProgressChart";
import { TestHubDashboard } from "@/components/dashboard/TestHubDashboard";
import { PermitExamSimulator } from "@/components/dashboard/PermitExamSimulator";
import { ChatTab } from "@/components/chat/ChatTab";
import { useUserProfile } from "@/lib/user-profile";

type TabId = "dashboard" | "test-hub" | "state-exam" | "chat";

export const Route = createFileRoute("/_authenticated/app/")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { tab?: TabId; checkout?: string; intent?: string } => {
    const t = s.tab;
    const out: { tab?: TabId; checkout?: string; intent?: string } = {};
    if (
      t === "dashboard" ||
      t === "test-hub" ||
      t === "state-exam" ||
      t === "chat"
    ) {
      out.tab = t;
    }
    if (typeof s.checkout === "string") out.checkout = s.checkout;
    if (typeof s.intent === "string") out.intent = s.intent;
    return out;
  },
  component: AppDashboard,
});

const TABS = [
  { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "test-hub", label: "Test Hub", icon: ClipboardCheck },
  { id: "state-exam", label: "State Permit Exam", icon: Timer },
  { id: "chat", label: "Chat AI Assistant", icon: MessageSquare },
] as const;

function AppDashboard() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab: TabId = search.tab ?? "dashboard";
  const setTab = (v: TabId) => navigate({ search: { tab: v }, replace: true });
  const { state: userState, openCheckout, isPro, hydrating } = useUserProfile();

  // Auto-open checkout when arriving with ?intent=upgrade; clear the query.
  useEffect(() => {
    if (search.intent === "upgrade" && !isPro) {
      openCheckout();
      navigate({ search: { tab }, replace: true });
    }
  }, [search.intent, isPro, openCheckout, navigate, tab]);

  // Gate Pro-only tabs: opening test-hub or state-exam without Pro pops the
  // same checkout modal and bounces the user back to the dashboard tab.
  useEffect(() => {
    if (hydrating || isPro) return;
    if (tab === "test-hub" || tab === "state-exam") {
      openCheckout();
      navigate({ search: { tab: "dashboard" }, replace: true });
    }
  }, [hydrating, isPro, tab, openCheckout, navigate]);



  return (
    <div className="flex flex-col h-full">
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="flex flex-col h-full">
        <header className="pl-16 pr-5 sm:px-7 pt-5 pb-4 border-b border-primary/10 md:pl-7">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display font-bold text-xl leading-tight truncate">
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
                Drivable control panel
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground glass px-3 py-1.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary  animate-pulse" />
              State index · {userState || "Not set"}
            </div>
          </div>
        </header>

        <TabsList className="sr-only">
          {TABS.map(({ id, label }) => (
            <TabsTrigger key={id} value={id}>{label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="dashboard" className="h-full overflow-y-auto m-0 p-5 sm:p-7 data-[state=inactive]:hidden">
            <div className="max-w-7xl mx-auto space-y-6">
              {hydrating ? (
                <DashboardSkeleton />
              ) : (
                <>
                  <HeaderWidgets />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <DailyChecklist />
                    <ExamProgressChart />
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="test-hub" className="h-full overflow-y-auto m-0 p-5 sm:p-7 data-[state=inactive]:hidden">
            <TestHubDashboard />
          </TabsContent>

          <TabsContent value="state-exam" className="h-full overflow-y-auto m-0 p-5 sm:p-7 data-[state=inactive]:hidden">
            <PermitExamSimulator />
          </TabsContent>



          <TabsContent value="chat" className="h-full m-0 data-[state=inactive]:hidden">
            <ChatTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 rounded-2xl glass glow-soft" />
        <div className="h-32 rounded-2xl glass glow-soft" />
        <div className="h-32 rounded-2xl glass glow-soft" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="h-80 rounded-2xl glass glow-soft" />
        <div className="h-80 rounded-2xl glass glow-soft" />
      </div>
      <div className="flex justify-center pt-2">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary  animate-pulse" />
          Syncing your profile…
        </div>
      </div>
    </div>
  );
}
