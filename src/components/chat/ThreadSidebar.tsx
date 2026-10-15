"use client";

import { useEffect, useMemo, useState } from "react";
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
  Video,
  Settings,
  Settings2,
  Sun,
  Menu,
  Check,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
import { AccountPanel, type AccountSection } from "@/components/dashboard/AccountPanel";
import { useUserProfile, US_STATES } from "@/lib/user-profile";

const PRIMARY_NAV = [
  { id: "chat", label: "AI Coach", icon: MessageSquare },
  { id: "state-exam", label: "Mock Permit Exam", icon: Timer },
  { id: "test-hub", label: "Permit Test Hub", icon: ClipboardCheck },
] as const;

export function ThreadSidebar() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelSection, setPanelSection] = useState<AccountSection | undefined>(undefined);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { state: userState, setState: setUserState, targetDate, setTargetDate, isPro } = useUserProfile();
  const [userMeta, setUserMeta] = useState<{ name: string | null; email: string | null }>({ name: null, email: null });
  const [activePopover, setActivePopover] = useState<"desktop-date" | "desktop-state" | "mobile-date" | "mobile-state" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const name =
        (u?.user_metadata?.["full_name"] as string | undefined) ??
        (u?.user_metadata?.["name"] as string | undefined) ??
        u?.email?.split("@")[0] ??
        null;
      setUserMeta({ name, email: u?.email ?? null });
    });
  }, []);

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

    return !(surface === "desktop" && collapsed) && (
    <div className="px-3 space-y-2 mb-3">
      <Popover
        open={activePopover === datePopoverKey}
        onOpenChange={(open) => {
          setActivePopover((current) => (open ? datePopoverKey : current === datePopoverKey ? null : current));
        }}
        modal
      >
        <PopoverTrigger asChild>
          <Button variant="ghost"
            type="button"
            aria-label="DMV target date"
            aria-haspopup="dialog"
            aria-expanded={activePopover === datePopoverKey}
            style={{ WebkitTapHighlightColor: "transparent", cursor: "pointer", pointerEvents: "auto" }}
            className="w-full h-auto block whitespace-normal text-left rounded-2xl border border-transparent bg-secondary hover:bg-muted transition-colors press px-3 py-3 mx-0 min-h-[56px] touch-manipulation select-none"
          >
            <p className="text-xs font-medium tracking-normal text-muted-foreground flex items-center justify-between pointer-events-none">
              <span>DMV Target Date</span>
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-2 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="truncate">{targetLabel}</span>
            </p>
          </Button>
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
          <Button variant="ghost"
            type="button"
            aria-label="Change active state"
            aria-haspopup="dialog"
            aria-expanded={activePopover === statePopoverKey}
            style={{ WebkitTapHighlightColor: "transparent", cursor: "pointer", pointerEvents: "auto" }}
            className="w-full h-auto block whitespace-normal text-left rounded-2xl border border-transparent bg-secondary hover:bg-muted transition-colors press px-3 py-3 mx-0 min-h-[56px] touch-manipulation select-none"
          >
            <p className="text-xs font-medium tracking-normal text-muted-foreground flex items-center justify-between pointer-events-none">
              <span>Active state</span>
              <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-2 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="truncate">{userState || "Not set"}</span>
            </p>
          </Button>
        </PopoverTrigger>
        {activePopover === statePopoverKey && (
          <PopoverContent
            side="top"
            align="start"
            className="w-64 p-0 glass glow-soft border-primary/30 z-[70] pointer-events-auto"
          >
            <div className="px-3 py-2 border-b border-border/60">
              <p className="text-xs font-medium tracking-normal text-muted-foreground">
                Select your state
              </p>
              <p className="text-xs text-muted-foreground">
                Recalibrates rules, quizzes, and AI answers.
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {US_STATES.map((s) => {
                const active = s === userState;
                return (
                  <Button variant="ghost"
                    key={s}
                    type="button"
                    onClick={() => {
                      setUserState(s);
                      setActivePopover(null);
                      toast.success(`AI knowledge base recalibrated to ${s}`);
                    }}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={cn(
                      "h-auto w-full flex items-center justify-between gap-2 px-3 py-3 min-h-11 text-sm text-left hover:bg-primary/10 active:bg-primary/15 transition-colors touch-manipulation",
                      active && "bg-primary/15 text-foreground font-medium",
                    )}
                  >
                    <span className="truncate">{s}</span>
                    {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </Button>
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
    <Button variant="ghost"
      type="button"
      onClick={() => setCollapsed((c) => !c)}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors pointer-events-auto shrink-0"
    >
      {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
    </Button>
  );

  const openSettingsSection = (section: AccountSection | undefined) => {
    setSettingsMenuOpen(false);
    setPanelSection(section);
    setSettingsOpen(true);
  };

  const settingsMenu: { label: string; icon: typeof Settings; section: AccountSection }[] = [
    { label: "Appearance", icon: Sun, section: "theme" },
    { label: "Driving state", icon: Settings2, section: "state" },
    { label: "DMV target date", icon: CalendarDays, section: "date" },
    { label: "Pro Pass", icon: Check, section: "membership" },
  ];

  const createUserFooter = (surface: "desktop" | "mobile") => {
    const isCollapsed = surface === "desktop" && collapsed;
    const fullName = userMeta.name ?? "Account";
    const displayName = fullName.trim().split(/\s+/)[0] || "Account";
    const initial = (displayName[0] ?? "D").toUpperCase();
    const planLabel = isPro ? "Pro" : "Free";

    return (
      <div className={cn("flex items-center gap-2 border-t border-sidebar-border mt-auto", isCollapsed ? "flex-col p-2" : "p-3")}>
        <button
          type="button"
          onClick={() => setSettingsMenuOpen(true)}
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={settingsMenuOpen}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className={cn(
            "flex items-center min-w-0 rounded-2xl hover:bg-muted transition-colors press touch-manipulation",
            isCollapsed ? "justify-center p-1" : "flex-1 gap-2.5 px-2 py-2 min-h-11 text-left",
          )}
          title={isCollapsed ? `${displayName} · ${planLabel}` : undefined}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background text-sm font-semibold shrink-0">
            {initial}
          </span>
          {!isCollapsed && (
            <span className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-sm font-semibold truncate leading-tight">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate leading-tight">
                · {planLabel}
              </span>
            </span>
          )}
        </button>
        <Popover open={settingsMenuOpen} onOpenChange={setSettingsMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label="Open settings menu"
              className={cn(
                "shrink-0 rounded-full text-muted-foreground hover:text-foreground press",
                isCollapsed ? "h-10 w-10" : "h-9 w-9",
              )}
              title="Settings"
            >
              <Settings className={isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-56 p-1.5 rounded-2xl"
          >
            <button
              type="button"
              onClick={() => openSettingsSection(undefined)}
              className="w-full rounded-xl px-2.5 py-2 text-left hover:bg-muted transition-colors press"
            >
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">{planLabel} plan</p>
            </button>
            <div className="h-px bg-border my-1" />
            {settingsMenu.map((item) => (
              <button
                key={item.section}
                type="button"
                onClick={() => openSettingsSection(item.section)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-muted transition-colors press text-left"
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                {item.label}
              </button>
            ))}
            <div className="h-px bg-border my-1" />
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors press text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const createBody = (surface: "desktop" | "mobile") => {
    const isCollapsed = surface === "desktop" && collapsed;
    return (
    <>
      <div className={cn("flex items-center shrink-0 w-full", isCollapsed ? "justify-between p-3" : "justify-between p-4")}>
        <Link
          to="/app"
          onClick={() => setMobileOpen(false)}
          className={cn("flex items-center group", isCollapsed ? "gap-0" : "gap-2.5")}
        >
          <img src={logo} alt="" width={32} height={32} className="shrink-0 logo-mask" />
          <div
            className={cn(
              "flex flex-col transition-all duration-300 overflow-hidden",
              isCollapsed ? "hidden" : "w-auto opacity-100",
            )}
          >
            <div className="font-bold tracking-tight text-sm whitespace-nowrap">Drivable</div>

          </div>
        </Link>

        {surface === "desktop" ? toggleButton : null}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <nav className={cn("space-y-1 w-full", isCollapsed ? "py-3" : "px-4 py-3")}>
          {PRIMARY_NAV.map((item) => {
            const { id, label, icon: Icon } = item;
            const isActive = pathname === "/app" && activeTab === id;
            return (
              <Link
                key={id}
                to="/app"
                search={{ tab: id }}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "nav-link min-h-11 w-full",
                  isActive && "nav-link-active",
                  isCollapsed && "justify-center px-0",
                )}
                aria-label={label}
                aria-current={isActive && pathname === "/app" ? "page" : undefined}
                title={isCollapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    isCollapsed ? "w-0 opacity-0" : "flex-1",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
          <Link
            to="/app/simulation"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "nav-link min-h-11 w-full",
              pathname === "/app/simulation" && "nav-link-active",
              isCollapsed && "justify-center px-0",
            )}
            aria-label="Driving Test Simulation"
            aria-current={pathname === "/app/simulation" ? "page" : undefined}
            title={isCollapsed ? "Driving Test Simulation" : undefined}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span
              className={cn(
                "truncate transition-all duration-300",
                isCollapsed ? "w-0 opacity-0" : "flex-1",
              )}
            >
              Driving Test Simulation
            </span>
          </Link>
        </nav>
      </div>

      {createInfoCards(surface)}

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        {createUserFooter(surface)}
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{panelSection === "state" ? "Driving state" : panelSection === "date" ? "DMV target date" : panelSection === "membership" ? "Pro Pass" : "Settings"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <AccountPanel section={panelSection} />
          </div>
          {!panelSection && (
            <Button
              variant="outline"
              onClick={() => {
                setSettingsOpen(false);
                void signOut();
              }}
              className="mt-6 w-full min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10 press"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
  };

  return (
    <>
      <div className="relative hidden md:flex shrink-0 h-full">
        <aside
          className={cn(
            "flex shrink-0 flex-col min-w-0 rounded-[32px] glass glow-soft text-sidebar-foreground h-full overflow-hidden transition-all duration-300 ease-out",
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
            className="md:hidden absolute top-3 left-3 z-50 h-10 w-10 rounded-xl glass border border-sidebar-border bg-sidebar/85 backdrop-blur-xl"
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
