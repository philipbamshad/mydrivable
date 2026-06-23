import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createThread, listThreads } from "@/lib/threads.functions";
import logo from "@/assets/driveguide-logo.png";

export const Route = createFileRoute("/_authenticated/app/")({
  component: AppIndex,
});

function AppIndex() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);

  const { data: threads, isLoading } = useQuery({
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

  useEffect(() => {
    if (isLoading) return;
    if (threads && threads.length > 0) {
      navigate({
        to: "/app/c/$threadId",
        params: { threadId: threads[0].id },
        replace: true,
      });
    } else if (!createMut.isPending && !createMut.isSuccess) {
      createMut.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, threads]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <img src={logo} alt="" width={48} height={48} className="opacity-70" />
        <p className="text-sm">Warming up the engine…</p>
      </div>
    </div>
  );
}
