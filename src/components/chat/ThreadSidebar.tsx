"use client";

import { Link, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listThreads,
  createThread,
  deleteThread,
} from "@/lib/threads.functions";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  LogOut,
  MessageSquare,
  LayoutDashboard,
  Car,
  Wrench,
  UserCog,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/driveguide-logo.png";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "test-hub", label: "Test Hub", icon: MessageSquare },
  { id: "road-prep", label: "Behind-the-Wheel", icon: Car },
  { id: "car-care", label: "Car Care", icon: Wrench },
  { id: "account", label: "Plan & Location", icon: UserCog },
] as const;

export function ThreadSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);

  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const { pathname, search } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, search: s.location.search }),
  });
  const activeTab =
    (search as { tab?: string }).tab ??
    (pathname === "/app" ? "dashboard" : null);

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn({ data: undefined as never }),
  });

  const createMut = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: (t) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/app/c/$threadId", params: { threadId: t.id } });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      if (activeId === id) navigate({ to: "/app" });
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col rounded-2xl glass glow-soft bg-sidebar/85 backdrop-blur-xl text-sidebar-foreground border border-sidebar-border h-full overflow-hidden">
      <div className="p-4">
        <Link to="/app" className="flex items-center gap-2.5 mb-5 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/50 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <img src={logo} alt="" width={32} height={32} className="relative" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-sm">DriveGuide AI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Your road coach
            </div>
          </div>
        </Link>

        <nav className="space-y-1">
          {PRIMARY_NAV.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <Link
                key={id}
                to="/app"
                search={{ tab: id }}
                className={cn("nav-link", isActive && "nav-link-active")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pt-2 pb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Chats
        </span>
        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          aria-label="New chat"
          className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 press"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {threads.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-3">
            No chats yet.
          </p>
        ) : (
          threads.map((t) => {
            const isActive = activeId === t.id;
            return (
              <div key={t.id} className="group flex items-stretch">
                <Link
                  to="/app/c/$threadId"
                  params={{ threadId: t.id }}
                  className={cn("nav-link flex-1 min-w-0", isActive && "nav-link-active")}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{t.title}</span>
                </Link>
                <button
                  aria-label="Delete chat"
                  onClick={() => {
                    if (confirm("Delete this chat?")) deleteMut.mutate(t.id);
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/20 hover:text-destructive self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
