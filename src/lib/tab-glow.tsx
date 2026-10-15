import type { CSSProperties } from "react";

// Soft blue and coral ambient wash shared by the study pages so the mock exam,
// test hub, and driving simulation all sit on the same backdrop.
export const tabGlowStyle: CSSProperties = {
  background:
    "radial-gradient(380px 380px at 32% 45%, color-mix(in oklch, var(--rose-soft) 18%, transparent), transparent 70%), radial-gradient(380px 380px at 68% 52%, color-mix(in oklch, var(--accent-coral) 14%, transparent), transparent 70%)",
};

export function GlowShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto" style={tabGlowStyle}>
      <div className="mx-auto flex min-h-full w-full max-w-3xl p-5 sm:p-7">
        <div className="my-auto w-full">{children}</div>
      </div>
    </div>
  );
}
