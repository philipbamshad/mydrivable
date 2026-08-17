"use client";

import { useMemo, useState } from "react";
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
  ClipboardCheck,
  Timer,
  Settings,
  Menu,
  Settings2,
  Check,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import logo from "@/assets/drivable-logo.png";
import { cn } from "@/lib/utils";
import { AccountPanel } from "@/components/dashboard/AccountPanel";
import { useUserProfile, US_STATES } from "@/lib/user-profile";

const PRIMARY_NAV = [
  { id: "chat", label: "AI Coach Chatbox", icon: MessageSquare },
  { id: "state-exam", label: "Mock Permit Exam", icon: Timer },
  { id: "test-hub", label: "Test Hub", icon: ClipboardCheck },
] as const;

export function ThreadSidebar() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { state: userState, setState: setUserState, targetDate, setTargetDate } = useUserProfile();
  const [activePopover, setActivePopover] = useState<"desktop-date" | "desktop-state" | "mobile-date" | "mobile-state" | null>(null);

  const { pathname, search } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, search: s.location.search }),
  });
  const activeTab = (search as { tab?: string }).tab ?? "chat";

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const localTarget = useMemo(() => {
    if (!targetDate) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(targetDate);
    if (!m) return new Date(targetDate);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }, [targetDate]);

  const targetLabel = useMemo(() => {
    if (!localTarget) return "Not set";
    return localTarget.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, [localTarget]);

  const createInfoCards = (surface: "desktop" | "mobile") => {
    const datePopoverKey = surface === "desktop" ? "desktop-date" : "mobile-date";
    const statePopoverKey = surface === "desktop" ? "desktop-state" : "mobile-state";

    return !collapsed && (
    <div className="px-3 space-y-2 mb-3">
      <Popover
        open={activePopover === datePopoverKey}
        onOpenChange={(open) => {
          setActivePopover((current) => (open ? datePopoverKey : current === datePopoverKey ? null : current));
        }}
        modal
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="DMV target date"
            aria-haspopup="dialog"
            aria-expanded={activePopover === datePopoverKey}
            style={{ WebkitTapHighlightColor: "transparent", cursor: "pointer", pointerEvents: "auto" }}
            className="w-full text-left rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 active:bg-primary/15 transition-colors press px-4 py-3 mx-0 min-h-[56px] touch-manipulation select-none"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between pointer-events-none">
              <span>DMV Target Date</span>
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-2 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="truncate">{targetLabel}</span>
            </p>
          </button>
        </PopoverTrigger>
        {activePopover === datePopoverKey && (
          <PopoverContent
            side="top"
            align="start"
            className="w-auto p-0 glass glow-soft border-primary/30 z-[70] pointer-events-auto"
          >
            <Calendar
              mode="single"
              selected={localTarget ?? undefined}
              onSelect={(date) => {
                if (!date) return;
                setTargetDate(format(date, "yyyy-MM-dd"));
                setActivePopover(null);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        )}
      </Popover>

      <Popover
        open={activePopover === statePopoverKey}
        onOpenChange={(open) => {
          setActivePopover((current) => (open ? statePopoverKey : current === statePopoverKey ? null : current));
        }}
        modal
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Change active state"
            aria-haspopup="dialog"
            aria-expanded={activePopover === statePopoverKey}
            style={{ WebkitTapHighlightColor: "transparent", cursor: "pointer", pointerEvents: "auto" }}
            className="w-full text-left rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 active:bg-primary/15 transition-colors press px-4 py-3 mx-0 min-h-[56px] touch-manipulation select-none"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between pointer-events-none">
              <span>Active state</span>
              <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-2 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="truncate">{userState || "Not set"}</span>
            </p>
          </button>
        </PopoverTrigger>
        {activePopover === statePopoverKey && (
          <PopoverContent
            side="top"
            align="start"
            className="w-64 p-0 glass glow-soft border-primary/30 z-[70] pointer-events-auto"
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
                      setActivePopover(null);
                      toast.success(`AI knowledge base recalibrated to ${s}`);
                    }}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-3 min-h-11 text-sm text-left hover:bg-primary/10 active:bg-primary/15 transition-colors touch-manipulation",
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
        )}
      </Popover>
    </div>
    );
  };

  const toggleButton = (
    <button
      type="button"
      onClick={() => setCollapsed((c) => !c)}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors pointer-events-auto shrink-0"
    >
      {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
    </button>
  );

  const createBody = (surface: "desktop" | "mobile") => (
    <>
      <div className={cn("flex items-center shrink-0 w-full", collapsed ? "justify-between p-3" : "justify-between p-4")}>
        <Link
          to="/app"
          onClick={() => setMobileOpen(false)}
          className={cn("flex items-center group", collapsed ? "gap-0" : "gap-2.5")}
        >
          <img src={logo} alt="" width={32} height={32} className="shrink-0 logo-mask" />
          <div
            className={cn(
              "flex flex-col transition-all duration-300 overflow-hidden",
              collapsed ? "hidden" : "w-auto opacity-100",
            )}
          >
            <div className="font-bold tracking-tight text-sm whitespace-nowrap">Drivable</div>

          </div>
        </Link>

        {toggleButton}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <nav className={cn("space-y-1 w-full", collapsed ? "py-3" : "px-4 py-3")}>
          {PRIMARY_NAV.map((item) => {
            const { id, label, icon: Icon } = item;
            const isActive = activeTab === id;
            const showStar = id === "state-exam";
            return (
              <Link
                key={id}
                to="/app"
                search={{ tab: id }}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "nav-link min-h-11 w-full",
                  isActive && "nav-link-active",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    collapsed ? "w-0 opacity-0" : "flex-1",
                  )}
                >
                  {label}
                </span>
                {showStar && (
                  <Star className={cn("w-3.5 h-3.5 shrink-0 fill-primary text-primary", collapsed && "hidden")} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {createInfoCards(surface)}

      <div className={cn("border-t border-sidebar-border space-y-1 mt-auto", collapsed ? "p-2" : "p-3")}>
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground press min-h-11",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className="w-4 h-4" />
              <span className={cn("transition-all duration-300", collapsed && "w-0 opacity-0")}>
                Settings
              </span>
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

        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground press min-h-11"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="transition-all duration-300">Sign out</span>
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="relative hidden md:flex shrink-0 h-full">
        <aside
          className={cn(
            "flex shrink-0 flex-col min-w-0 rounded-2xl glass glow-soft bg-sidebar/85 backdrop-blur-xl text-sidebar-foreground border border-sidebar-border h-full overflow-hidden transition-all duration-300 ease-out",
            collapsed ? "w-24" : "w-64 max-w-[256px]",
          )}
        >
          {createBody("desktop")}
        </aside>
      </div>

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
          {createBody("mobile")}
        </SheetContent>
      </Sheet>
    </>
  );
}
