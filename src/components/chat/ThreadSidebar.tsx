"use client";

import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LogOut,
  MessageSquare,
  LayoutDashboard,
  Car,
  ClipboardCheck,
  Timer,
  Settings,
  Menu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/drivable-logo.png";
import { cn } from "@/lib/utils";
import { AccountPanel } from "@/components/dashboard/AccountPanel";
import { useUserProfile } from "@/lib/user-profile";

const PRIMARY_NAV = [
  { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "test-hub", label: "Test Hub", icon: ClipboardCheck },
  { id: "state-exam", label: "State Permit Exam", icon: Timer, pro: true },
  { id: "road-prep", label: "Behind-the-Wheel", icon: Car },
  { id: "chat", label: "Chat AI Assistant", icon: MessageSquare },
] as const;

export function ThreadSidebar() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state: userState, isPro } = useUserProfile();

  const { pathname, search } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, search: s.location.search }),
  });
  const activeTab =
    (search as { tab?: string }).tab ??
    (pathname === "/app" ? "dashboard" : null);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const body = (
    <>
      <div className="p-4">
        <Link
          to="/app"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 mb-5 group"
        >
          <img src={logo} alt="" width={32} height={32} className="rounded-md" />

          <div>
            <div className="font-bold tracking-tight text-sm">Drivable</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Your road coach
            </div>
          </div>
        </Link>

        <nav className="space-y-1">
          {PRIMARY_NAV.map((item) => {
            const { id, label, icon: Icon } = item;
            const isActive = activeTab === id;
            const showProBadge = "pro" in item && item.pro && !isPro;
            return (
              <Link
                key={id}
                to="/app"
                search={{ tab: id }}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "nav-link min-h-11",
                  isActive && "nav-link-active",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1">{label}</span>
                {showProBadge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/40">
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1" />

      <div className="px-4 py-3 mx-3 mb-2 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Active state</p>
        <p className="text-sm font-semibold mt-0.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
          {userState || "Not set"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {isPro ? "Pro · all modules unlocked" : "Free tier"}
        </p>
      </div>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground press min-h-11">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <AccountPanel />
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground press min-h-11"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — unchanged from before */}
      <aside className="hidden md:flex w-64 max-w-[256px] shrink-0 flex-col rounded-2xl glass glow-soft bg-sidebar/85 backdrop-blur-xl text-sidebar-foreground border border-sidebar-border h-full overflow-hidden">
        {body}
      </aside>

      {/* Mobile hamburger trigger — fixed top-left */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="md:hidden fixed top-3 left-3 z-50 h-10 w-10 rounded-xl glass border border-sidebar-border bg-sidebar/85 backdrop-blur-xl"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-72 max-w-[85vw] flex flex-col bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-sidebar-border"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    </>
  );
}

