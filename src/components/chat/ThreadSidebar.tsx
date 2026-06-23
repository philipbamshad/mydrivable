"use client";

import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listThreads,
  createThread,
  deleteThread,
} from "@/lib/threads.functions";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, LogOut, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/driveguide-logo.png";
import { cn } from "@/lib/utils";

export function ThreadSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);

  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

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
    <aside className="w-72 shrink-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2.5 mb-4">
          <img src={logo} alt="" width={32} height={32} />
          <div>
            <div className="font-bold tracking-tight text-sm">DriveGuide AI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Your road coach
            </div>
          </div>
        </Link>
        <Button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          className="w-full font-semibold"
        >
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {threads.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-4">
            No chats yet. Start one above.
          </p>
        ) : (
          threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                activeId === t.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60 text-sidebar-foreground/90",
              )}
            >
              <Link
                to="/app/c/$threadId"
                params={{ threadId: t.id }}
                className="flex-1 flex items-center gap-2 min-w-0"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{t.title}</span>
              </Link>
              <button
                aria-label="Delete chat"
                onClick={() => {
                  if (confirm("Delete this chat?")) deleteMut.mutate(t.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
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
