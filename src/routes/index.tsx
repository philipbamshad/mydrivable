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
    <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
      {/* floating logo tile */}
      <div className="mx-auto mb-10 grid h-24 w-24 place-items-center rounded-3xl bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25),0_4px_10px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#0d0d0d]">
          <img src={logo} alt="DriveGuide" className="h-9 w-9" />
        </div>
      </div>

      {/* whats new pill */}
      <div className="mx-auto mb-10 inline-flex max-w-[640px] items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur">
        <span className="inline-flex items-center gap-1.5 text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          What's new
        </span>
        <span className="hidden text-[#0d0d0d]/80 sm:inline">
          Infinite AI-generated permit drills + 50-state road test packs
        </span>
      </div>

      {/* gradient blur behind headline */}
      <div className="relative mx-auto max-w-5xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[480px] w-[820px] -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,150,200,0.55), transparent 60%), radial-gradient(closest-side at 20% 40%, rgba(120,180,255,0.55), transparent 65%), radial-gradient(closest-side at 80% 60%, rgba(180,140,255,0.5), transparent 65%)",
          }}
        />
        <h1 className="relative text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-7xl">
          Pass The Permit With The
          <br />
          #1 Teen Driving Platform
        </h1>
      </div>

      <p className="relative mx-auto mt-8 max-w-2xl text-lg italic text-[#0d0d0d]/70 [font-family:'Cormorant_Garamond',Georgia,serif]">
        For the first test that actually matters on the road — DriveGuide AI gives
        you every state rule, every maneuver, every answer.
      </p>

      <div className="relative mt-10 flex justify-center">
        <Link
          to="/auth"
          className="rounded-full bg-[#0d0d0d] px-10 py-5 text-base font-semibold text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] transition hover:scale-[1.03]"
        >
          Start Practicing
        </Link>
      </div>

      <div className="relative mt-10 inline-flex items-center gap-3 text-sm text-[#0d0d0d]/70">
        <div className="flex gap-0.5 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400" />
          ))}
        </div>
        <span className="h-4 w-px bg-black/15" />
        <span>Loved By Drivers From 1,200+ Schools</span>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────── LOGO STRIP ── */
function LogoStrip() {
  const states = ["California", "Texas", "Florida", "New York", "Illinois", "Washington", "Georgia"];
  return (
    <section className="border-y border-black/5 bg-white/40 py-10">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0d0d0d]/50">
        Built on official DMV handbooks from
      </p>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-base font-medium text-[#0d0d0d]/60">
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
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm shadow-sm ring-1 ring-black/5">
        <Sparkles className="h-4 w-4" />
        Powerful Features
      </div>
      <h2 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
        Everything You Need
        <br />
        to{" "}
        <span className="italic [font-family:'Cormorant_Garamond',Georgia,serif] font-medium">
          Pass First Try
        </span>
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-lg text-[#0d0d0d]/60">
        DriveGuide AI combines the power of advanced AI with official, state-specific
        DMV training data.
      </p>
    </section>
  );
}

/* ──────────────────────────────────────── FEATURE SHOWCASE ── */
function FeatureShowcase() {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-2">
      {/* mock dashboard card */}
      <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
        <div className="rounded-2xl bg-[#fafaf7] p-5 ring-1 ring-black/5">
          <MockExamCard
            firm="California DMV"
            chip="Completed"
            title="Permit Practice Test"
            sub="Right of Way · 18 questions"
            date="11/14/2025 at 11:20:58 PM · 15 min"
            score="9/10"
            tone="green"
          />
          <div className="h-4" />
          <MockExamCard
            firm="Texas DMV"
            chip="Completed"
            title="Mock Road Test"
            sub="Parallel Parking · First Round"
            date="11/13/2025 at 11:38 AM · 30 min"
            score="7.9/10"
            tone="amber"
          />
        </div>
      </div>

      {/* mock topic cards */}
      <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
        <div className="grid grid-cols-2 gap-4">
          <TopicCard
            title="Road Signs"
            sub="Warning, Regulatory, Guide"
            count="120 questions"
            score="9.5/10"
            tone="green"
          />
          <TopicCard
            title="Maneuvers"
            sub="3-point turn, Parallel, Hill park"
            count="18 drills"
            score="6.2/10"
            tone="amber"
          />
          <TopicCard
            title="Traffic Laws"
            sub="Right of way, Yielding"
            count="80 questions"
            score="8.4/10"
            tone="green"
          />
          <TopicCard
            title="First Car"
            sub="Used listings, Insurance"
            count="Guided"
            score="—"
            tone="neutral"
          />
        </div>
      </div>
    </section>
  );
}

function MockExamCard({
  firm,
  chip,
  title,
  sub,
  date,
  score,
  tone,
}: {
  firm: string;
  chip: string;
  title: string;
  sub: string;
  date: string;
  score: string;
  tone: "green" | "amber";
}) {
  const scoreBg =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-amber-50 text-amber-700 ring-amber-200";
  const bar =
    tone === "green" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{firm}</span>
          <span className="rounded-md bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">
            {chip}
          </span>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-bold ring-1 ${scoreBg}`}>
          {score}
        </span>
      </div>
      <div className="text-[15px] font-medium">{title}</div>
      <div className="text-xs text-[#0d0d0d]/60">{sub}</div>
      <div className="mt-2 text-[11px] text-[#0d0d0d]/50">{date}</div>
      <div className="mt-3 h-1 w-full rounded-full bg-black/5">
        <div className={`h-1 rounded-full ${bar}`} style={{ width: tone === "green" ? "90%" : "60%" }} />
      </div>
    </div>
  );
}

function TopicCard({
  title,
  sub,
  count,
  score,
  tone,
}: {
  title: string;
  sub: string;
  count: string;
  score: string;
  tone: "green" | "amber" | "neutral";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    neutral: "bg-black/5 text-[#0d0d0d]/60 ring-black/10",
  } as const;
  return (
    <div className="rounded-2xl bg-[#fafaf7] p-4 ring-1 ring-black/5">
      <div className="mb-3 flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500 text-white">
          <Star className="h-4 w-4 fill-white" />
        </span>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${tones[tone]}`}>
          {score}
        </span>
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-[#0d0d0d]/60">{sub}</div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-[#0d0d0d]/50">{count}</span>
        <span className="font-medium text-blue-600">Start Practice ›</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── FEATURE BULLETS ── */
function FeatureBullets() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
      <div className="rounded-[28px] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
        <div className="rounded-[22px] bg-[#0d0d0d] p-6 text-white">
          <div className="mb-5 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
              <MessageSquare className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">DriveGuide Main Chat</span>
          </div>
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 mx-auto">
            <img src={logo} alt="" className="h-7 w-7" />
          </div>
          <p className="mb-5 text-center text-sm opacity-80">
            Your AI Driving Coach
          </p>
          <div className="rounded-xl bg-white/5 p-3 text-sm ring-1 ring-white/10">
            What's the rule on right-of-way at a 4-way stop?
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {["Permit", "Road Test", "First Car", "State Laws"].map((t) => (
              <span key={t} className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm shadow-sm ring-1 ring-black/5">
          <Sparkles className="h-4 w-4" />
          Powerful Features
        </div>
        <h2 className="text-5xl font-semibold leading-[1.05] tracking-[-0.03em]">
          Learn Smarter with
          <br />
          AI That Knows Your State
        </h2>
        <p className="mt-5 text-lg text-[#0d0d0d]/60">
          Effortlessly drill every section of the test and master maneuvers faster
          than anyone else — trust us, it'll show on test day.
        </p>
        <ul className="mt-8 space-y-4">
          {[
            "Infinite AI-generated permit drills — trained on every DMV handbook",
            "Customized to you — upload your state's drivers ed PDFs",
            "Road-test realism — mock examiner walks every maneuver",
            "First-car coach — listings, insurance, and red-flag checks",
          ].map((t) => (
            <li key={t} className="flex items-center gap-3 text-[15px]">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-[#0d0d0d] text-white">
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
    <section className="bg-[#0d0d0d] py-20 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-5xl font-semibold tracking-[-0.03em]">{s.v}</div>
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
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm shadow-sm ring-1 ring-black/5">
          Simple Pricing
        </div>
        <h2 className="mt-6 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Pick Your{" "}
          <span className="italic [font-family:'Cormorant_Garamond',Georgia,serif] font-medium">
            Road
          </span>
        </h2>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <PriceCard
          plan="Monthly"
          price="$14.00"
          features={features}
          highlight={false}
        />
        <PriceCard
          plan="Quarterly"
          price="$11.67"
          features={features}
          highlight
        />
        <PriceCard
          plan="Yearly"
          price="$9.17"
          features={features}
          highlight={false}
        />
      </div>
    </section>
  );
}

function PriceCard({
  plan,
  price,
  features,
  highlight,
}: {
  plan: string;
  price: string;
  features: string[];
  highlight: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-[28px] p-[2px]"
          : "rounded-[28px] bg-white p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.2)] ring-1 ring-black/5"
      }
      style={
        highlight
          ? {
              background:
                "linear-gradient(135deg, #ff2bd1 0%, #4d6bff 100%)",
            }
          : undefined
      }
    >
      <div
        className={
          highlight
            ? "rounded-[26px] bg-white p-6"
            : ""
        }
      >
        <div
          className={
            highlight
              ? "rounded-2xl p-7 text-white shadow-[0_20px_40px_-20px_rgba(77,107,255,0.5)]"
              : "rounded-2xl bg-[#fafaf7] p-7 ring-1 ring-black/5"
          }
          style={
            highlight
              ? {
                  background:
                    "linear-gradient(135deg, #4d6bff 0%, #a855f7 100%)",
                }
              : undefined
          }
        >
          <div className={highlight ? "text-lg font-medium text-white/90" : "text-lg font-medium text-[#0d0d0d]/70"}>
            {plan}
          </div>
          <div className="mt-12 flex items-end gap-2">
            <span className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
              {price}
            </span>
            <span className={highlight ? "mb-2 text-sm text-white/80" : "mb-2 text-sm text-[#0d0d0d]/60"}>
              / month
            </span>
          </div>
        </div>

        <Link
          to="/auth"
          className="mt-6 block rounded-full bg-[#0d0d0d] py-4 text-center text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          Get Started
        </Link>

        <ul className="mt-6 space-y-3 text-[15px]">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-[#0d0d0d]/80">
              <Check className="h-4 w-4 text-blue-500" />
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
      a: "Each maneuver gets a walkthrough, common-fail checklist, and a mock examiner Q&A — including parallel parking, hill parks, lane changes and yielding.",
    },
    {
      q: "Is there a free version?",
      a: "You can try DriveGuide free with limited daily drills. Upgrade for unlimited chat, mock tests and the first-car coach.",
    },
    {
      q: "Will it help me buy my first car?",
      a: "Paste a used-listing URL and DriveGuide returns a risk breakdown, cost-of-ownership range and an inspection checklist before you hand over a dime.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-12 text-center text-5xl font-semibold tracking-[-0.03em]">
        Questions, answered.
      </h2>
      <div className="space-y-4">
        {items.map((it) => (
          <details
            key={it.q}
            className="group rounded-2xl bg-white p-6 ring-1 ring-black/5 transition open:shadow-[0_20px_40px_-25px_rgba(0,0,0,0.2)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
              {it.q}
              <span className="ml-4 grid h-7 w-7 place-items-center rounded-full bg-black/5 text-sm transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-[15px] text-[#0d0d0d]/70">{it.a}</p>
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
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-[#0d0d0d] p-16 text-center text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px 300px at 50% 0%, rgba(168,85,247,0.35), transparent 60%), radial-gradient(600px 300px at 50% 100%, rgba(77,107,255,0.35), transparent 60%)",
          }}
        />
        <div className="relative">
          <h2 className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
            Get your license.
            <br />
            <span className="italic [font-family:'Cormorant_Garamond',Georgia,serif] font-medium opacity-90">
              First try.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-white/70">
            Join thousands of teens who walked into the DMV ready, calm, and one
            answer ahead.
          </p>
          <Link
            to="/auth"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-base font-semibold text-[#0d0d0d] shadow-[0_20px_40px_-15px_rgba(255,255,255,0.4)] transition hover:scale-[1.03]"
          >
            Start Practicing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────── FOOTER ── */
function Footer() {
  return (
    <footer className="border-t border-black/5 px-6 py-10 text-sm text-[#0d0d0d]/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0d0d0d]">
            <img src={logo} alt="" className="h-4 w-4" />
          </span>
          <span className="font-semibold text-[#0d0d0d]">DriveGuide AI</span>
        </div>
        <span>© {new Date().getFullYear()} DriveGuide AI · Drive safe. Drive legal.</span>
      </div>
    </footer>
  );
}
