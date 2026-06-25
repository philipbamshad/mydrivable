import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Wrench,
  UserCog,
} from "lucide-react";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { WeeklyMatrix } from "@/components/dashboard/WeeklyMatrix";
import { ExamProgressChart } from "@/components/dashboard/ExamProgressChart";
import { TopicMasteryPanel } from "@/components/dashboard/TopicMasteryPanel";
import { RoadPrepMatrix } from "@/components/dashboard/RoadPrepMatrix";
import { CarCare } from "@/components/dashboard/CarCare";
import { AccountPanel } from "@/components/dashboard/AccountPanel";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/")({
  component: AppDashboard,
});

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "test-hub", label: "Test Hub", icon: MessageSquare },
  { id: "road-prep", label: "Road Prep", icon: Car },
  { id: "car-care", label: "Car Care", icon: Wrench },
  { id: "account", label: "Account", icon: UserCog },
] as const;

function AppDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("dashboard");

  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="flex flex-col h-full"
      >
        <header className="border-b border-border bg-background/40 backdrop-blur-xl px-4 sm:px-6 relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-center justify-between py-3">
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                DriveGuide control panel
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground glass px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)] animate-pulse" />
              State index · California
            </div>
          </div>
          <TabsList className="bg-transparent p-0 h-auto gap-1 -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="relative data-[state=active]:bg-card/60 data-[state=active]:backdrop-blur-md data-[state=active]:border-primary/30 data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:text-foreground data-[state=active]:shadow-[0_-6px_24px_-12px_var(--color-primary)] rounded-t-xl rounded-b-none border border-transparent border-b-0 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200 data-[state=active]:before:content-[''] data-[state=active]:before:absolute data-[state=active]:before:top-0 data-[state=active]:before:left-3 data-[state=active]:before:right-3 data-[state=active]:before:h-[2px] data-[state=active]:before:bg-gradient-to-r data-[state=active]:before:from-transparent data-[state=active]:before:via-primary data-[state=active]:before:to-transparent"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="dashboard" className="h-full overflow-y-auto m-0 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <MetricsRow />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeeklyMatrix />
                <ExamProgressChart />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test-hub" className="h-full m-0 data-[state=inactive]:hidden">
            <TestHub />
          </TabsContent>

          <TabsContent value="road-prep" className="h-full overflow-y-auto m-0 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <RoadPrepMatrix />
            </div>
          </TabsContent>

          <TabsContent value="car-care" className="h-full overflow-y-auto m-0 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <CarCare />
            </div>
          </TabsContent>

          <TabsContent value="account" className="h-full overflow-y-auto m-0 p-4 sm:p-6">
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

  const handleFocus = (_id: string, label: string) => {
    toast.success(`Focus set: ${label}`, {
      description: "Next chat message will prioritize this module.",
    });
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0">
        <ChatWindow
          key={activeThread.id}
          threadId={activeThread.id}
          initialMessages={messages as unknown as UIMessage[]}
        />
      </div>
      <TopicMasteryPanel onFocus={handleFocus} />
    </div>
  );
}
