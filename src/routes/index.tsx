import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/driveguide-logo.png";
import {
  ArrowRight,
  Check,
  Sparkles,
  Star,
  MessageSquare,
  LayoutDashboard,
  ClipboardCheck,
  Car,
  Wrench,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DriveGuide AI — The #1 Teen Driving Prep Platform" },
      {
        name: "description",
        content:
          "DriveGuide AI is the AI-powered coach for the permit test, road test, and first car — state-aware, no fluff, built for new drivers.",
      },
      { property: "og:title", content: "DriveGuide AI" },
      {
        property: "og:description",
        content: "The #1 AI driving prep platform for teens.",
      },
    ],
  }),
  component: Landing,
});

// Local theme scoped to landing page only — black + deep blue + glass gradient
const SHELL =
  "relative min-h-screen overflow-hidden text-white [color-scheme:dark] [font-family:'Inter',ui-sans-serif,system-ui]";
const SHELL_BG: React.CSSProperties = {
  background:
    "radial-gradient(1200px 700px at 85% -10%, rgba(96,165,250,0.35), transparent 60%)," +
    "radial-gradient(900px 600px at -10% 20%, rgba(37,99,235,0.28), transparent 65%)," +
    "radial-gradient(1000px 800px at 50% 110%, rgba(59,130,246,0.22), transparent 65%)," +
    "linear-gradient(180deg, #05070d 0%, #070b18 40%, #04060d 100%)",
};

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  return (
    <div className={SHELL} style={SHELL_BG}>
      <Nav />
      <Hero />
      <LogoStrip />
      <FeaturesIntro />
      <FeatureShowcase />
      <FeatureBullets />
      <StatsBand />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────────────────── NAV ── */
function Nav() {
  return (
    <header className="sticky top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 pl-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_20px_-2px_rgba(59,130,246,0.6)]">
            <img src={logo} alt="" className="h-5 w-5" />
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:inline">
            DriveGuide
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-[15px] font-medium text-white/70 sm:flex">
          <a href="#app" className="transition hover:text-white">App</a>
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
        </nav>
        <Link
          to="/auth"
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.7)] transition hover:scale-[1.02]"
        >
          Sign Up
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 transition group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────── HERO ── */
function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-28 text-center">
      {/* floating logo tile */}
      <div className="mx-auto mb-10 grid h-24 w-24 place-items-center rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_-20px_rgba(59,130,246,0.6)] backdrop-blur-xl">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <img src={logo} alt="DriveGuide" className="h-9 w-9" />
        </div>
      </div>

      {/* whats new pill */}
      <div className="mx-auto mb-10 inline-flex max-w-[640px] items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 text-blue-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
          New
        </span>
        <span className="hidden text-white/80 sm:inline">
          50-state DMV packs + AI road-test examiner now live
        </span>
      </div>

      {/* gradient blur behind headline */}
      <div className="relative mx-auto max-w-5xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[520px] w-[900px] -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(59,130,246,0.55), transparent 60%), radial-gradient(closest-side at 20% 40%, rgba(37,99,235,0.5), transparent 65%), radial-gradient(closest-side at 80% 60%, rgba(14,165,233,0.45), transparent 65%)",
          }}
        />
        <h1 className="relative text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-7xl">
          The Driving Coach
          <br />
          That{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Actually Shows Up
          </span>
        </h1>
      </div>

      <p className="relative mx-auto mt-8 max-w-2xl text-lg text-white/70">
        Permit, road test, first car — DriveGuide AI walks every new driver through
        the only three tests that matter, with rules tuned to your exact state.
      </p>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/auth"
          className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-10 py-5 text-base font-semibold text-white shadow-[0_20px_50px_-15px_rgba(59,130,246,0.8)] transition hover:scale-[1.03]"
        >
          Start Practicing
        </Link>
        <a
          href="#features"
          className="rounded-full border border-white/15 bg-white/[0.04] px-8 py-5 text-base font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/10"
        >
          See how it works
        </a>
      </div>

      <div className="relative mt-10 inline-flex items-center gap-3 text-sm text-white/60">
        <div className="flex gap-0.5 text-amber-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-300" />
          ))}
        </div>
        <span className="h-4 w-px bg-white/20" />
        <span>Loved By Drivers From 1,200+ High Schools</span>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────── LOGO STRIP ── */
function LogoStrip() {
  const states = ["California", "Texas", "Florida", "New York", "Illinois", "Washington", "Georgia"];
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-10 backdrop-blur-sm">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        Built on official DMV handbooks from
      </p>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-base font-medium text-white/60">
        {states.map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── FEATURES INTRO ── */
function FeaturesIntro() {
  return (
    <section id="features" className="px-6 pt-28 pb-10 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
        <Sparkles className="h-4 w-4 text-blue-300" />
        Built for new drivers
      </div>
      <h2 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
        Everything Between You
        <br />
        and a{" "}
        <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
          Real License
        </span>
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
        DriveGuide AI pairs a sharp coaching model with official, state-specific
        DMV material — so every answer matches the test you'll actually take.
      </p>
    </section>
  );
}

/* ──────────────────────────────────────── FEATURE SHOWCASE ── */
function FeatureShowcase() {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-2">
      {/* mock dashboard card */}
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_-30px_rgba(59,130,246,0.5)] backdrop-blur-xl">
        <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
          <MockExamCard
            firm="California DMV"
            chip="Completed"
            title="Permit Practice Test"
            sub="Right of Way · 18 questions"
            date="11/14/2025 · 15 min"
            score="9/10"
            tone="good"
          />
          <div className="h-4" />
          <MockExamCard
            firm="Texas DMV"
            chip="Completed"
            title="Mock Road Test"
            sub="Parallel Parking · First Round"
            date="11/13/2025 · 30 min"
            score="7.9/10"
            tone="warn"
          />
        </div>
      </div>

      {/* mock topic cards */}
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_-30px_rgba(59,130,246,0.5)] backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-4">
          <TopicCard title="Road Signs" sub="Warning, Regulatory, Guide" count="120 questions" score="9.5/10" tone="good" />
          <TopicCard title="Maneuvers" sub="3-point turn, Parallel, Hill" count="18 drills" score="6.2/10" tone="warn" />
          <TopicCard title="Traffic Laws" sub="Right of way, Yielding" count="80 questions" score="8.4/10" tone="good" />
          <TopicCard title="First Car" sub="Used listings, Insurance" count="Guided" score="—" tone="neutral" />
        </div>
      </div>
    </section>
  );
}

function MockExamCard({
  firm, chip, title, sub, date, score, tone,
}: {
  firm: string; chip: string; title: string; sub: string; date: string; score: string;
  tone: "good" | "warn";
}) {
  const scoreBg =
    tone === "good"
      ? "bg-blue-500/15 text-blue-200 ring-blue-400/30"
      : "bg-amber-400/10 text-amber-200 ring-amber-300/30";
  const bar = tone === "good" ? "bg-gradient-to-r from-blue-400 to-cyan-300" : "bg-gradient-to-r from-amber-400 to-orange-400";
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{firm}</span>
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
            {chip}
          </span>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-bold ring-1 ${scoreBg}`}>{score}</span>
      </div>
      <div className="text-[15px] font-medium text-white">{title}</div>
      <div className="text-xs text-white/60">{sub}</div>
      <div className="mt-2 text-[11px] text-white/40">{date}</div>
      <div className="mt-3 h-1 w-full rounded-full bg-white/5">
        <div className={`h-1 rounded-full ${bar}`} style={{ width: tone === "good" ? "90%" : "60%" }} />
      </div>
    </div>
  );
}

function TopicCard({
  title, sub, count, score, tone,
}: {
  title: string; sub: string; count: string; score: string;
  tone: "good" | "warn" | "neutral";
}) {
  const tones = {
    good: "bg-blue-500/15 text-blue-200 ring-blue-400/30",
    warn: "bg-amber-400/10 text-amber-200 ring-amber-300/30",
    neutral: "bg-white/5 text-white/60 ring-white/10",
  } as const;
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_16px_-4px_rgba(59,130,246,0.7)]">
          <Star className="h-4 w-4 fill-white" />
        </span>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${tones[tone]}`}>{score}</span>
      </div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-white/60">{sub}</div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-white/40">{count}</span>
        <span className="font-medium text-blue-300">Start Practice ›</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── FEATURE BULLETS ── */
function FeatureBullets() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-2 shadow-[0_30px_80px_-30px_rgba(59,130,246,0.5)] backdrop-blur-xl">
        <div className="rounded-[22px] bg-gradient-to-br from-[#0a0f1f] to-[#070b18] p-6 text-white ring-1 ring-white/5">
          <div className="mb-5 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/15 ring-1 ring-blue-400/30">
              <MessageSquare className="h-4 w-4 text-blue-300" />
            </span>
            <span className="text-sm font-semibold">DriveGuide Main Chat</span>
          </div>
          <div className="mb-4 mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_24px_-4px_rgba(59,130,246,0.8)]">
            <img src={logo} alt="" className="h-7 w-7" />
          </div>
          <p className="mb-5 text-center text-sm text-white/70">
            Your AI Driving Coach
          </p>
          <div className="rounded-xl bg-blue-500/10 p-3 text-sm ring-1 ring-blue-400/20">
            What's the rule on right-of-way at a 4-way stop?
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {["Permit", "Road Test", "First Car", "State Laws"].map((t) => (
              <span key={t} className="rounded-lg bg-white/5 px-3 py-2 text-white/80 ring-1 ring-white/10">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-blue-300" />
          Smarter prep
        </div>
        <h2 className="text-5xl font-semibold leading-[1.05] tracking-[-0.03em]">
          Trained on the
          <br />
          test you'll{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            actually take
          </span>
        </h2>
        <p className="mt-5 text-lg text-white/60">
          Drill every section, master every maneuver, and walk into the DMV with
          the same confidence as someone who's already passed.
        </p>
        <ul className="mt-8 space-y-4">
          {[
            "Infinite AI drills generated from every official DMV handbook",
            "Upload your state's drivers ed PDFs for personal coaching",
            "Mock road-test examiner walks every maneuver, step by step",
            "First-car coach: used listings, insurance, and red-flag checks",
          ].map((t) => (
            <li key={t} className="flex items-center gap-3 text-[15px] text-white/85">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_14px_-4px_rgba(59,130,246,0.8)]">
                <Check className="h-3.5 w-3.5" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── STATS BAND ── */
function StatsBand() {
  const stats = [
    { v: "98%", l: "First-try permit pass rate" },
    { v: "50", l: "U.S. states fully covered" },
    { v: "2.4M+", l: "Practice questions answered" },
    { v: "4.9★", l: "Avg student rating" },
  ];
  return (
    <section className="relative overflow-hidden border-y border-white/5 py-20">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,11,24,0.85), rgba(4,6,13,0.95)), radial-gradient(800px 300px at 50% 50%, rgba(59,130,246,0.25), transparent 60%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="bg-gradient-to-b from-white to-blue-200 bg-clip-text text-5xl font-semibold tracking-[-0.03em] text-transparent">{s.v}</div>
            <div className="mt-2 text-sm text-white/60">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── PRICING ── */
function Pricing() {
  const features = [
    "Unlimited AI chat",
    "Unlimited mock permit tests",
    "Unlimited maneuver drills",
    "All 50 state rule packs",
    "First car buying guide",
  ];
  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          Simple Pricing
        </div>
        <h2 className="mt-6 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Pick Your{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Lane
          </span>
        </h2>
        <p className="mt-4 text-white/60">Cancel anytime. Drive forever.</p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <PriceCard plan="Monthly" price="$14.00" features={features} highlight={false} />
        <PriceCard plan="Quarterly" price="$11.67" features={features} highlight badge="Most Popular" />
        <PriceCard plan="Yearly" price="$9.17" features={features} highlight={false} />
      </div>
    </section>
  );
}

function PriceCard({
  plan, price, features, highlight, badge,
}: {
  plan: string; price: string; features: string[]; highlight: boolean; badge?: string;
}) {
  return (
    <div
      className="relative rounded-[28px] p-[1.5px]"
      style={{
        background: highlight
          ? "linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #1e40af 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
      }}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.8)]">
          {badge}
        </span>
      )}
      <div className="rounded-[26px] bg-[#070b18]/80 p-6 backdrop-blur-xl">
        <div
          className="rounded-2xl p-7"
          style={
            highlight
              ? {
                  background:
                    "linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #0ea5e9 100%)",
                  boxShadow:
                    "0 20px 50px -20px rgba(59,130,246,0.7), inset 0 1px 0 rgba(255,255,255,0.15)",
                }
              : {
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }
          }
        >
          <div className={highlight ? "text-lg font-medium text-white/90" : "text-lg font-medium text-white/70"}>
            {plan}
          </div>
          <div className="mt-10 flex items-end gap-2 text-white">
            <span className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">{price}</span>
            <span className={highlight ? "mb-2 text-sm text-white/80" : "mb-2 text-sm text-white/60"}>
              / month
            </span>
          </div>
        </div>

        <Link
          to="/auth"
          className={
            highlight
              ? "mt-6 block rounded-full bg-gradient-to-r from-blue-500 to-blue-700 py-4 text-center text-sm font-semibold text-white shadow-[0_15px_35px_-12px_rgba(59,130,246,0.8)] transition hover:scale-[1.02]"
              : "mt-6 block rounded-full bg-white/[0.06] py-4 text-center text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/[0.1]"
          }
        >
          Get Started
        </Link>

        <ul className="mt-6 space-y-3 text-[15px]">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-white/80">
              <Check className="h-4 w-4 shrink-0 text-blue-300" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────── FAQ ── */
function FAQ() {
  const items = [
    {
      q: "Does DriveGuide cover every U.S. state?",
      a: "Yes — every prompt is grounded in the official DMV handbook for the state you select. Switch states anytime in Settings.",
    },
    {
      q: "Can it actually prep me for the road test?",
      a: "Each maneuver gets a walkthrough, common-fail checklist, and a mock examiner Q&A — parallel parking, hill parks, lane changes, yielding, all of it.",
    },
    {
      q: "Is there a free version?",
      a: "Yes — start free with limited daily drills. Upgrade for unlimited chat, mock tests, and the first-car coach.",
    },
    {
      q: "Will it help me buy my first car?",
      a: "Paste a used-listing URL and DriveGuide returns a risk breakdown, cost-of-ownership range, and an inspection checklist before you hand over a dime.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-12 text-center text-5xl font-semibold tracking-[-0.03em]">
        Questions,{" "}
        <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
          answered
        </span>
      </h2>
      <div className="space-y-3">
        {items.map((it) => (
          <details
            key={it.q}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition open:bg-white/[0.05] open:shadow-[0_20px_50px_-25px_rgba(59,130,246,0.5)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-white">
              {it.q}
              <span className="ml-4 grid h-7 w-7 place-items-center rounded-full bg-blue-500/15 text-sm text-blue-300 ring-1 ring-blue-400/30 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-[15px] text-white/70">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── CTA ── */
function CTA() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-white/10 p-16 text-center text-white backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, #050813 0%, #0a1230 60%, #050813 100%), radial-gradient(700px 350px at 50% 0%, rgba(59,130,246,0.45), transparent 60%), radial-gradient(700px 350px at 50% 100%, rgba(14,165,233,0.35), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
          style={{
            background:
              "radial-gradient(600px 300px at 50% 0%, rgba(96,165,250,0.4), transparent 60%), radial-gradient(600px 300px at 50% 100%, rgba(37,99,235,0.4), transparent 60%)",
          }}
        />
        <h2 className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Get your license.
          <br />
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            First try.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-white/70">
          Join thousands of new drivers who walked into the DMV ready, calm, and
          one answer ahead.
        </p>
        <Link
          to="/auth"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 px-10 py-5 text-base font-semibold text-[#04060d] shadow-[0_20px_50px_-15px_rgba(96,165,250,0.8)] transition hover:scale-[1.03]"
        >
          Start Practicing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── FOOTER ── */
function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10 text-sm text-white/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
            <img src={logo} alt="" className="h-4 w-4" />
          </span>
          <span className="font-semibold text-white">DriveGuide AI</span>
        </div>
        <span>© {new Date().getFullYear()} DriveGuide AI · Drive safe. Drive legal.</span>
      </div>
    </footer>
  );
}
