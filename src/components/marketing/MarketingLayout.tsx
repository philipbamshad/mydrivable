import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/drivable-logo.png";
import { ArrowRight } from "lucide-react";

const SHELL =
  "relative min-h-screen overflow-hidden text-white [color-scheme:dark] [font-family:'Inter',ui-sans-serif,system-ui]";
const SHELL_BG: React.CSSProperties = {
  background: "linear-gradient(180deg, #05070d 0%, #070b18 50%, #05070d 100%)",
};

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0b1220] hover:bg-[#0f1830] border border-[#1e40af] hover:border-[#3b82f6] text-white font-semibold transition active:scale-[0.98]";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 text-white font-semibold transition active:scale-[0.98]";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={SHELL} style={SHELL_BG}>
      <header className="sticky top-4 z-50 px-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2 pl-2">
            <img src={logo} alt="Drivable logo" className="h-9 w-9 logo-mask" />
            <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:inline">
              Drivable
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[15px] font-medium text-white/70 sm:flex">
            <Link to="/tools/vin-lookup" className="transition hover:text-white">
              VIN Lookup
            </Link>
            <Link to="/guides/used-car-inspection" className="transition hover:text-white">
              Inspection Guide
            </Link>
          </nav>
          <Link to="/auth" className={`${BTN_PRIMARY} px-5 py-2.5 text-sm`}>
            Sign Up
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="px-6 py-14">{children}</main>

      <footer className="border-t border-white/5 px-6 py-10 text-sm text-white/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 logo-mask" />
            <span className="font-semibold text-white">Drivable</span>
          </div>
          <a href="mailto:philip@mydrivable.com" className="text-white/70 hover:text-white">
            philip@mydrivable.com
          </a>
          <span>© {new Date().getFullYear()} Drivable · Drive safe. Drive legal.</span>
        </div>
      </footer>
    </div>
  );
}
