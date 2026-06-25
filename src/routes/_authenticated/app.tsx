import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ThreadSidebar } from "@/components/chat/ThreadSidebar";
import { UserProfileProvider } from "@/lib/user-profile";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <UserProfileProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background p-3 gap-3">
        <ThreadSidebar />
        <main className="flex-1 min-w-0 rounded-2xl glass glow-soft overflow-hidden">
          <Outlet />
        </main>
      </div>
    </UserProfileProvider>
  );
}
