import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/drivable-logo.png";
import { ArrowRight } from "lucide-react";

const SHELL =
  "relative min-h-screen overflow-hidden text-[#0f172a] [color-scheme:light] [font-family:'Inter',ui-sans-serif,system-ui]";
const SHELL_BG: React.CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #f4f7fd 50%, #ffffff 100%)",
};

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#ffffff] hover:bg-[#eef3ff] border border-[#1e40af] hover:border-[#3b82f6] text-[#0f172a] font-semibold transition active:scale-[0.98]";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#1e40af]/[0.055] hover:bg-[#1e40af]/[0.1] border border-[#1e40af]/25 hover:border-[#1e40af]/40 text-[#0f172a] font-semibold transition active:scale-[0.98]";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={SHELL} style={SHELL_BG}>
      <header className="sticky top-4 z-50 px-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-[#1e40af]/18 bg-[#1e40af]/[0.045] px-3 py-2 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2 pl-2">
            <img src={logo} alt="Drivable logo" className="h-9 w-9 logo-mask" />
            <span className="hidden text-[15px] font-semibold tracking-tight text-[#0f172a] sm:inline">
              Drivable
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[15px] font-medium text-[#1f2b4d]/70 sm:flex">
            <Link to="/tools/vin-lookup" className="transition hover:text-[#0f172a]">
              VIN Lookup
            </Link>
            <Link to="/guides/used-car-inspection" className="transition hover:text-[#0f172a]">
              Inspection Guide
            </Link>
            <Link to="/guides/road-test-checklist" className="transition hover:text-[#0f172a]">
              Road Test Checklist
            </Link>
          </nav>
          <Link to="/auth" className={`${BTN_PRIMARY} px-5 py-2.5 text-sm`}>
            Sign Up
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="px-6 py-14">{children}</main>

      <footer className="border-t border-[#1e40af]/12 px-6 py-10 text-sm text-[#1f2b4d]/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 logo-mask" />
            <span className="font-semibold text-[#0f172a]">Drivable</span>
          </div>
          <a href="mailto:philip@mydrivable.com" className="text-[#1f2b4d]/70 hover:text-[#0f172a]">
            philip@mydrivable.com
          </a>
          <span>© {new Date().getFullYear()} Drivable · Drive safe. Drive legal.</span>
        </div>
      </footer>
    </div>
  );
}
