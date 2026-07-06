import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ThreadSidebar } from "@/components/chat/ThreadSidebar";
import { UserProfileProvider } from "@/lib/user-profile";
import { ThemeProvider } from "@/lib/theme";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <div className="flex flex-col h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-background safe-top safe-bottom safe-x">
          <PaymentTestModeBanner />
          <div className="flex flex-col md:flex-row flex-1 min-h-0 min-w-0 overflow-hidden p-0 gap-0 md:p-3 md:gap-3">
            <ThreadSidebar />
            <main className="flex-1 min-w-0 overflow-x-hidden md:rounded-2xl glass glow-soft overflow-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

