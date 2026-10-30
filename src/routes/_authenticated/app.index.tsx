import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  MessageSquare,
  ClipboardCheck,
  Timer,
} from "lucide-react";

import { TestHubDashboard } from "@/components/dashboard/TestHubDashboard";
import { PermitExamSimulator } from "@/components/dashboard/PermitExamSimulator";
import { ChatTab } from "@/components/chat/ChatTab";
import { useUserProfile } from "@/lib/user-profile";
import { StateOnboardingDialog } from "@/components/dashboard/StateOnboardingDialog";
import { tabGlowStyle } from "@/lib/tab-glow";
import { examHistoryOptions } from "@/lib/mock-exam.functions";
import { hubProgressOptions } from "@/lib/test-hub.functions";
import type { PillarId } from "@/data/dmv/practice-bank";

type TabId = "test-hub" | "state-exam" | "chat";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Permit Practice | Drivable" },
      {
        name: "description",
        content:
          "Track permit readiness, run mock written exams, and chat with your AI permit coach.",
      },
      { property: "og:title", content: "Permit Practice | Drivable" },
      { property: "og:description", content: "Practice mock permit exams, section quizzes, and study with your AI permit coach." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (
    s: Record<string, unknown>,
  ): { tab?: TabId; checkout?: string; intent?: string; topic?: PillarId } => {
    const t = s.tab;
    const out: { tab?: TabId; checkout?: string; intent?: string; topic?: PillarId } = {};
    if (
      t === "test-hub" ||
      t === "state-exam" ||
      t === "chat"
    ) {
      out.tab = t;
    }
    if (typeof s.checkout === "string") out.checkout = s.checkout;
    if (typeof s.intent === "string") out.intent = s.intent;
    if (s.topic === "signs" || s.topic === "intersections" || s.topic === "substances" || s.topic === "speed") out.topic = s.topic;
    return out;
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(examHistoryOptions(context.user.id)),
      context.queryClient.ensureQueryData(hubProgressOptions(context.user.id)),
    ]);
  },
  errorComponent: () => <div role="alert" className="p-7">Unable to load your study progress. Please refresh and try again.</div>,
  notFoundComponent: () => <div className="p-7">Study page not found.</div>,
  component: AppDashboard,
});

const TABS = [
  { id: "test-hub", label: "Permit Test Hub", icon: ClipboardCheck },
  { id: "state-exam", label: "Mock Permit Exam", icon: Timer },
  { id: "chat", label: "AI Coach", icon: MessageSquare },
] as const;


function AppDashboard() {
  const { user } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab: TabId = search.tab ?? "chat";
  const setTab = (v: TabId) => navigate({ search: { tab: v }, replace: true });
  const { state: userState, openCheckout, isPro } = useUserProfile();

  // Auto-open checkout when arriving with ?intent=upgrade; clear the query.
  useEffect(() => {
    if (search.intent === "upgrade" && !isPro) {
      openCheckout();
      navigate({ search: { tab }, replace: true });
    }
  }, [search.intent, isPro, openCheckout, navigate, tab]);

  // Both the Test Hub and Mock Permit Exam tabs now handle their own inline
  // free-tier paywalls after the per-section / lifetime question limits are
  // reached, so no eager redirect to checkout on tab open.

  return (
    <div className="flex flex-col h-full">
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="flex flex-col h-full">
        <header className="pl-16 pr-5 sm:px-7 pt-5 pb-4 border-b border-border md:pl-7">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display font-bold text-xl leading-tight truncate">
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
            </div>
            {!isPro && (
              <Button
                onClick={() => openCheckout()}
                className="flex items-center gap-2 rounded-full bg-action text-action-foreground h-9 px-4 text-sm md:h-10 md:px-5 md:text-base font-semibold shadow-[0_4px_14px_-6px_var(--color-action)] hover:bg-action-hover transition-all shrink-0"
              >
                Upgrade
              </Button>
            )}
          </div>
        </header>

        <TabsList className="hidden">
          {TABS.map(({ id, label }) => (
            <TabsTrigger key={id} value={id}>{label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="test-hub" className="h-full min-h-0 overflow-y-auto m-0 p-0 data-[state=inactive]:hidden">
            <div className="relative min-h-full w-full p-5 sm:p-7 flex flex-col justify-center" style={tabGlowStyle}>
              <TestHubDashboard key={search.topic ?? "hub"} initialTopic={search.topic} userId={user.id} />
            </div>
          </TabsContent>

          <TabsContent value="state-exam" className="h-full min-h-0 overflow-y-auto overscroll-contain m-0 p-0 data-[state=inactive]:hidden">
            <div className="relative min-h-full w-full p-5 sm:p-7 flex flex-col justify-center" style={tabGlowStyle}>
              <PermitExamSimulator userId={user.id} />
            </div>
          </TabsContent>

          <TabsContent value="chat" className="h-full m-0 data-[state=inactive]:hidden">
            <ChatTab />
          </TabsContent>
        </div>
      </Tabs>
      <StateOnboardingDialog />
    </div>
  );
}
