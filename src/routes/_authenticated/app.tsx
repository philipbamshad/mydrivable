import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ThreadSidebar } from "@/components/chat/ThreadSidebar";
import { UserProfileProvider } from "@/lib/user-profile";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <UserProfileProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        <PaymentTestModeBanner />
        <div className="flex flex-1 min-h-0 overflow-hidden p-0 gap-0 md:p-3 md:gap-3">
          <ThreadSidebar />
          <main className="flex-1 min-w-0 md:rounded-2xl glass glow-soft overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </UserProfileProvider>
  );
}

