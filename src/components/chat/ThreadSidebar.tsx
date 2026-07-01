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
  ClipboardCheck,
  Timer,
  Settings,
  Menu,
  Settings2,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/drivable-logo.png";
import { cn } from "@/lib/utils";
import { AccountPanel } from "@/components/dashboard/AccountPanel";
import { useUserProfile, US_STATES } from "@/lib/user-profile";

const PRIMARY_NAV = [
  { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "test-hub", label: "Test Hub", icon: ClipboardCheck, pro: true },
  { id: "state-exam", label: "State Permit Exam", icon: Timer, pro: true },
  { id: "chat", label: "Chat AI Assistant", icon: MessageSquare },
] as const;

export function ThreadSidebar() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state: userState, setState: setUserState, isPro, openCheckout } = useUserProfile();
  const [statePickerOpen, setStatePickerOpen] = useState(false);

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
            const isPro Only = "pro" in item && item.pro;
            const locked = isProOnly && !isPro;
            const showProBadge = isProOnly && !isPro;
            return (
              <Link
                key={id}
                to="/app"
                search={{ tab: id }}
                onClick={(e) => {
                  if (locked) {
                    e.preventDefault();
                    setMobileOpen(false);
                    openCheckout();
                    return;
                  }
                  setMobileOpen(false);
                }}
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

      <Popover open={statePickerOpen} onOpenChange={setStatePickerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Change active state"
            className="group w-[calc(100%-1.5rem)] mx-3 mb-2 text-left px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-colors press"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              <span>Active state</span>
              <Settings2
                className="w-3.5 h-3.5 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:rotate-90 group-hover:"
              />
            </p>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary " />
              <span className="truncate">{userState || "Not set"}</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isPro ? "Pro · all modules unlocked" : "Free tier"}
            </p>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-64 p-0 glass glow-soft border-primary/30"
        >
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Select your state
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Recalibrates rules, quizzes, and AI answers.
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {US_STATES.map((s) => {
              const active = s === userState;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setUserState(s);
                    setStatePickerOpen(false);
                    toast.success(`AI knowledge base recalibrated to ${s}`);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-primary/10 transition-colors",
                    active && "bg-primary/15 text-foreground font-medium",
                  )}
                >
                  <span className="truncate">{s}</span>
                  {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>


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

