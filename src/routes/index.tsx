import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/drivable-logo.png";
import {
  ArrowRight,
  Check,
  Sparkles,
  MessageSquare,
  ClipboardCheck,
  Car,
  Timer,
  MapPin,
} from "lucide-react";
import { US_STATES } from "@/lib/user-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drivable — Master Your Permit & Ace Your Road Test" },
      {
        name: "description",
        content:
          "Master your permit and ace your road test on the first try. AI coach, full-length mock permit exam simulator, targeted section quizzes, and behind-the-wheel checklists tuned to your state.",
      },
      { property: "og:title", content: "Drivable" },
      {
        property: "og:description",
        content:
          "Master your permit and ace your road test on the first try.",
      },
    ],
  }),
  component: Landing,
});

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
      <StatesMarquee />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 pl-2">
          <img src={logo} alt="" className="h-9 w-9 rounded-lg" />
          <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:inline">
            Drivable
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-white/70 sm:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#states" className="transition hover:text-white">States</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
        </nav>
        <Link
          to="/auth"
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.7)] transition hover:scale-[1.03] active:scale-[0.97]"
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

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-28 text-center">
      <div className="mx-auto mb-10 grid h-24 w-24 place-items-center rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_-20px_rgba(59,130,246,0.6)] backdrop-blur-xl">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <img src={logo} alt="Drivable" className="h-9 w-9" />
        </div>
      </div>

      <div className="mx-auto mb-10 inline-flex max-w-[640px] items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 text-blue-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
          New
        </span>
        <span className="hidden text-white/80 sm:inline">
          Full-length state-specific Mock Permit Exam simulator — now live
        </span>
      </div>

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
          Master Your Permit and
          <br />
          Ace Your Road Test on the{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            First Try
          </span>
        </h1>
      </div>

      <p className="relative mx-auto mt-8 max-w-2xl text-lg text-white/70">
        An AI driving coach trained on every official DMV handbook —
        full-length mock permit exams, targeted section drills, and behind-the-wheel
        action checklists. No fluff.
      </p>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/auth"
          className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-10 py-5 text-base font-semibold text-white shadow-[0_20px_50px_-15px_rgba(59,130,246,0.8)] transition hover:scale-[1.03] active:scale-[0.97]"
        >
          Get Started
        </Link>
        <a
          href="#features"
          className="rounded-full border border-white/15 bg-white/[0.04] px-8 py-5 text-base font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97]"
        >
          See how it works
        </a>
      </div>
    </section>
  );
}

function StatesMarquee() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="states" ref={ref} className="border-y border-white/5 bg-white/[0.02] py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">
          All 50 states · grounded in official DMV handbooks
        </p>
        <h2 className="mb-10 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Wherever you take the test, we've got you
        </h2>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {US_STATES.map((s, i) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-white/85 shadow-[0_0_18px_-6px_rgba(96,165,250,0.55)] backdrop-blur-md transition-all hover:scale-[1.05] hover:border-blue-300/60 hover:bg-blue-500/15 hover:text-white"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.4s ease-out ${i * 0.012}s, transform 0.4s ease-out ${i * 0.012}s, background 0.2s, border-color 0.2s`,
              }}
            >
              <MapPin className="h-3 w-3 text-blue-300" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Timer,
      title: "Full-Length Mock Permit Exam Simulator",
      body: "Replicates the real state DMV test — exact question count, timing, and passing threshold for your state, from California's 46-question exam to Texas's 30-question test.",
      tag: "PRO",
    },
    {
      icon: MessageSquare,
      title: "AI Driving Coach",
      body: "A conversational coach that explains every wrong answer, runs scenario drills, and stays synced with your state's official DMV handbook.",
    },
    {
      icon: ClipboardCheck,
      title: "Targeted Section Quizzes",
      body: "Drill the topics examiners punish: signs, intersections, substance laws, and speed limits — short rounds with instant scoring and explanations.",
    },
    {
      icon: Car,
      title: "Behind-the-Wheel Checklists",
      body: "Every maneuver mapped step-by-step with the exact thresholds that auto-fail a road test, so you walk in knowing what counts.",
    },
  ];

  return (
    <section id="features" className="px-6 pt-28 pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-blue-300" />
          Four pillars
        </div>
        <h2 className="mt-8 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Everything Between You and a{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Real License
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
          Four focused tools, one outcome — pass on the first try.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group relative rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_-30px_rgba(59,130,246,0.5)] backdrop-blur-xl transition hover:scale-[1.02] hover:border-blue-400/30"
            >
              {f.tag && (
                <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#04060d] shadow-[0_0_18px_-2px_rgba(96,165,250,0.8)]">
                  {f.tag}
                </span>
              )}
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_24px_-4px_rgba(59,130,246,0.8)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pricing() {
  const features = [
    "Full-length state-specific Mock Permit Exam simulator",
    "Unlimited AI coach chat synced to your DMV handbook",
    "All 4 targeted pillar quizzes with infinite question pool",
    "Behind-the-wheel checklists & 50-hour log",
    "Sign recognition drills baked into the quiz hub",
    "All 50 state rule packs",
    "Cancel anytime — no contracts",
  ];

  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          One plan
        </div>
        <h2 className="mt-6 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Pick Your{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Lane
          </span>
        </h2>
        <p className="mt-4 text-white/60">No tiers. No upsell. Just the test you're about to take.</p>
      </div>

      <div className="mx-auto max-w-md">
        <div
          className="relative rounded-[28px] p-[1.5px]"
          style={{
            background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #0ea5e9 100%)",
          }}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.8)]">
            Pro Pass
          </span>
          <div className="rounded-[26px] bg-[#070b18]/85 p-8 backdrop-blur-xl">
            <div
              className="rounded-2xl p-7"
              style={{
                background:
                  "linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #0ea5e9 100%)",
                boxShadow:
                  "0 20px 50px -20px rgba(59,130,246,0.7), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <div className="text-lg font-medium text-white/90">Pro Pass</div>
              <div className="mt-8 flex items-end gap-2 text-white">
                <span className="text-6xl font-semibold tracking-[-0.03em]">$9</span>
                <span className="mb-2 text-sm text-white/85">/ month</span>
              </div>
              <p className="mt-2 text-sm text-white/75">Everything Drivable builds, included.</p>
            </div>

            <Link
              to="/auth"
              search={{ next: "/app?intent=upgrade" }}
              className="mt-7 block rounded-full bg-gradient-to-r from-blue-500 to-blue-700 py-4 text-center text-sm font-semibold text-white shadow-[0_15px_35px_-12px_rgba(59,130,246,0.8)] transition hover:scale-[1.03] active:scale-[0.97]"
            >
              Start Pro Pass — $9 / mo
            </Link>


            <ul className="mt-7 space-y-3 text-[15px]">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/85">
                  <Check className="h-4 w-4 shrink-0 text-blue-300" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Does Drivable cover every U.S. state?",
      a: "Yes — all 50 states. Every prompt and mock exam is grounded in the official DMV handbook for the state you select. Switch states anytime in Settings.",
    },
    {
      q: "How does the Mock Permit Exam simulator work?",
      a: "It replicates your state's real DMV permit test — exact number of questions, exact passing threshold, randomized each attempt so you never see the same exam twice.",
    },
    {
      q: "Can it actually prep me for the road test?",
      a: "Each maneuver gets a walkthrough, an examiner-style fail checklist, and a step-by-step mechanical breakdown — parallel parking, hill parks, lane changes, yielding, all of it.",
    },
    {
      q: "What's in Pro Pass?",
      a: "Full-length state-specific mock exams, unlimited AI chat, all section quizzes, the sign-recognition drill, the behind-the-wheel checklists, and every state rule pack — $9/month, cancel anytime.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
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
        <h2 className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Get your license.
          <br />
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            First try.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-white/70">
          Sign up, pick your state, and start your first mock exam in under a minute.
        </p>
        <Link
          to="/auth"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 px-10 py-5 text-base font-semibold text-[#04060d] shadow-[0_20px_50px_-15px_rgba(96,165,250,0.8)] transition hover:scale-[1.03] active:scale-[0.97]"
        >
          Start Practicing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10 text-sm text-white/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
            <img src={logo} alt="" className="h-4 w-4" />
          </span>
          <span className="font-semibold text-white">Drivable</span>
        </div>
        <span>© {new Date().getFullYear()} Drivable · Drive safe. Drive legal.</span>
      </div>
    </footer>
  );
}
