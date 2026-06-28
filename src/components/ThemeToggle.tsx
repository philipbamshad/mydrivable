import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggle}
      className="relative inline-flex h-9 w-[72px] items-center rounded-full border border-border bg-card/60 px-1 transition-colors hover:border-primary/60"
      style={{ boxShadow: "inset 0 0 12px -6px var(--color-primary)" }}
    >
      <span
        className="absolute top-1 h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center transition-transform duration-300 ease-out"
        style={{
          transform: isDark ? "translateX(36px)" : "translateX(0px)",
          boxShadow: "0 0 14px -2px var(--color-primary)",
        }}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </span>
      <Sun
        className={`absolute left-2 w-3.5 h-3.5 transition-opacity ${
          isDark ? "opacity-40 text-muted-foreground" : "opacity-0"
        }`}
      />
      <Moon
        className={`absolute right-2 w-3.5 h-3.5 transition-opacity ${
          isDark ? "opacity-0" : "opacity-40 text-muted-foreground"
        }`}
      />
    </button>
  );
}
