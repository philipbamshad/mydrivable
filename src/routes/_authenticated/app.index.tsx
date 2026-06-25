import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import {
  createThread,
  listThreads,
  getThreadMessages,
} from "@/lib/threads.functions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  MessageSquare,
  Car,
  TrafficCone,
  UserCog,
} from "lucide-react";
import { HeaderWidgets } from "@/components/dashboard/HeaderWidgets";
import { DailyChecklist } from "@/components/dashboard/DailyChecklist";
import { ExamProgressChart } from "@/components/dashboard/ExamProgressChart";
import { ModuleQuizCenter } from "@/components/dashboard/ModuleQuizCenter";
import { RoadPrepGuide } from "@/components/dashboard/RoadPrepGuide";
import { SignQuiz } from "@/components/dashboard/SignQuiz";
import { AccountPanel } from "@/components/dashboard/AccountPanel";
import { ChatWindow } from "@/components/chat/ChatWindow";

type TabId = "dashboard" | "test-hub" | "road-prep" | "sign-quiz" | "account";

export const Route = createFileRoute("/_authenticated/app/")({
  validateSearch: (s: Record<string, unknown>): { tab?: TabId } => {
    const t = s.tab;
    if (t === "dashboard" || t === "test-hub" || t === "road-prep" || t === "sign-quiz" || t === "account") {
      return { tab: t };
    }
    return {};
  },
  component: AppDashboard,
});

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "test-hub", label: "Test Hub", icon: MessageSquare },
  { id: "road-prep", label: "Behind-the-Wheel", icon: Car },
  { id: "sign-quiz", label: "Sign Quiz", icon: TrafficCone },
  { id: "account", label: "Plan & Location", icon: UserCog },
] as const;

function AppDashboard() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab: TabId = search.tab ?? "dashboard";
  const setTab = (v: TabId) => navigate({ search: { tab: v }, replace: true });

  return (
    <div className="flex flex-col h-full">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabId)}
        className="flex flex-col h-full"
      >
        <header className="px-5 sm:px-7 pt-5 pb-4 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="font-display font-bold text-xl leading-tight truncate">
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
                DriveGuide control panel
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground glass px-3 py-1.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)] animate-pulse" />
              State index · California
            </div>
          </div>
        </header>

        <TabsList className="sr-only">
          {TABS.map(({ id, label }) => (
            <TabsTrigger key={id} value={id}>{label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="dashboard" className="h-full overflow-y-auto m-0 p-5 sm:p-7">
            <div className="max-w-7xl mx-auto space-y-6">
              <HeaderWidgets />
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
                <DailyChecklist />
                <ExamProgressChart />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test-hub" className="h-full m-0 data-[state=inactive]:hidden">
            <TestHub />
          </TabsContent>

          <TabsContent value="road-prep" className="h-full overflow-y-auto m-0 p-5 sm:p-7">
            <div className="max-w-6xl mx-auto">
              <RoadPrepGuide />
            </div>
          </TabsContent>

          <TabsContent value="sign-quiz" className="h-full overflow-y-auto m-0 p-5 sm:p-7">
            <SignQuiz />
          </TabsContent>

          <TabsContent value="account" className="h-full overflow-y-auto m-0 p-5 sm:p-7">
            <div className="max-w-5xl mx-auto">
              <AccountPanel />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TestHub() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const getMsgs = useServerFn(getThreadMessages);

  const { data: threads, isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn({ data: undefined as never }),
  });

  const createMut = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if ((!threads || threads.length === 0) && !createMut.isPending && !createMut.isSuccess) {
      createMut.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, threads]);

  const activeThread = threads?.[0];

  const { data: messages } = useQuery({
    queryKey: ["thread-messages", activeThread?.id],
    queryFn: () => getMsgs({ data: { threadId: activeThread!.id } }),
    enabled: !!activeThread,
  });

  if (!activeThread || !messages) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Starting your study session…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="flex-1 min-w-0 lg:basis-3/5 border-b lg:border-b-0 lg:border-r border-border">
        <ChatWindow
          key={activeThread.id}
          threadId={activeThread.id}
          initialMessages={messages as unknown as UIMessage[]}
        />
      </div>
      <div className="lg:basis-2/5 lg:max-w-[460px] h-full min-h-0">
        <ModuleQuizCenter />
      </div>
    </div>
  );
}
