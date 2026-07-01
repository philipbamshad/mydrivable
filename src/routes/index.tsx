import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { US_STATES } from "@/lib/user-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drivable, Master Your Permit & Ace Your Road Test" },
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
  background: "linear-gradient(180deg, #05070d 0%, #070b18 50%, #05070d 100%)",
};
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0b1220] hover:bg-[#0f1830] border border-[#1e40af] hover:border-[#3b82f6] text-white font-semibold transition active:scale-[0.98]";



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
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 backdrop-blur-xl">
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

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className={`${BTN_PRIMARY} group hidden sm:inline-flex px-5 py-2.5 text-sm`}
          >
            Sign Up
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>


      {open && (
        <div className="sm:hidden mx-auto mt-2 max-w-5xl rounded-2xl border border-white/10 bg-[#070b18]/95 p-4 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          <nav className="flex flex-col text-base font-medium text-white/85">
            {[
              ["Features", "#features"],
              ["States", "#states"],
              ["Pricing", "#pricing"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-white/5"
              >
                {label}
              </a>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className={`${BTN_PRIMARY} mt-2 px-5 py-3 text-sm`}
            >
              Sign Up <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-6 pt-24 pb-28 text-center">
      {/* Subtle ambient hero glow — soft column behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[200px] -z-10 h-[700px] w-[900px] max-w-[110vw] -translate-x-1/2 rounded-full bg-blue-600/12 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[280px] -z-10 h-[420px] w-[560px] max-w-[80vw] -translate-x-1/2 rounded-full bg-blue-500/14 blur-[100px]"
      />

      <div className="mx-auto mb-10 grid h-24 w-24 place-items-center rounded-3xl">
        <img src={logo} alt="Drivable" className="h-24 w-24 rounded-3xl" />
      </div>


      <div className="mx-auto mb-10 inline-flex max-w-[640px] items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 text-blue-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          New
        </span>

        <span className="hidden text-white/80 sm:inline">
          Full-length state-specific Mock Permit Exam simulator, now live
        </span>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <h1 className="relative text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-7xl">
          Master Your Permit and
          <br />
          Ace Your Road Test on the{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] text-blue-300">
            First Try
          </span>
        </h1>
      </div>


      <p className="relative mx-auto mt-8 max-w-2xl text-lg text-white/70">
        An AI driving coach trained on every official DMV handbook, with
        full-length mock permit exams and targeted section drills. No fluff.
      </p>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/auth"
          className={`${BTN_PRIMARY} px-10 py-5 text-base`}
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
  const loop = [...US_STATES, ...US_STATES];
  return (
    <section id="states" className="border-y border-white/5 bg-white/[0.02] py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">
          All 50 States · Grounded in Official DMV Handbooks
        </p>
        <h2 className="mb-10 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Wherever You Take the Test, We've Got You
        </h2>
      </div>
      <div
        className="group relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          className="flex w-max gap-3 [animation:states-marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]"
        >
          {loop.map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[13px] font-medium text-white/85 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
            >
              <MapPin className="h-3 w-3 text-blue-300" />
              {s}
            </span>
          ))}
        </div>
        <style>{`@keyframes states-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>
    </section>
  );
}



function Features() {
  const features = [
    {
      icon: Timer,
      title: "Full-Length Mock Permit Exam Simulator",
      body: "Replicates the real state DMV test, exact question count, timing, and passing threshold for your state, from California's 46-question exam to Texas's 30-question test.",
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
      body: "Drill the topics examiners punish: signs, intersections, substance laws, and speed limits, short rounds with instant scoring and explanations.",
    },
  ];

  return (
    <section id="features" className="px-6 pt-28 pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-blue-300" />
          Three Pillars
        </div>
        <h2 className="mt-8 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Everything Between You and a{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Real License
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
          Three focused tools, one outcome, pass on the first try.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group relative rounded-[28px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition hover:border-white/20"
            >
              {f.tag && (
                <span className="absolute right-6 top-6 rounded-full bg-[#1e40af] border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {f.tag}
                </span>
              )}
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1e40af] border border-white/10 text-white">
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
    "Pay once, use forever, no recurring fees",
  ];

  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          One Plan
        </div>
        <h2 className="mt-6 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Pick Your{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Lane
          </span>
        </h2>
        <p className="mt-4 text-white/60">No tiers. No upsell. Just the test you're about to take.</p>
      </div>

      <div className="relative mx-auto max-w-md">
        {/* Centered ambient backlight behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(30,64,175,0.35), rgba(30,64,175,0.10) 55%, transparent 75%)",
          }}
        />

        <div className="relative rounded-[28px] border border-white/10 bg-[#070b18]/70 p-8 backdrop-blur-xl">
          <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#1e40af] border border-[#3b82f6]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Pro Pass
          </span>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="text-lg font-medium text-white/90">Pro Pass</div>
            <div className="mt-8 flex items-end gap-2 text-white">
              <span className="text-6xl font-semibold tracking-[-0.03em]">$19</span>
              <span className="mb-2 text-sm text-white/85">one-time</span>
            </div>
            <p className="mt-2 text-sm text-white/75">Pay once. Lifetime access to everything Drivable builds.</p>
          </div>

          <Link
            to="/auth"
            search={{ next: "/app?intent=upgrade" }}
            className={`${BTN_PRIMARY} mt-7 w-full py-4 text-sm`}
          >
            Get Pro Pass, $19 one-time
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
    </section>
  );
}


function FAQ() {
  const items = [
    {
      q: "Does Drivable cover every U.S. state?",
      a: "Yes, all 50 states. Every prompt and mock exam is grounded in the official DMV handbook for the state you select. Switch states anytime in Settings.",
    },
    {
      q: "How does the Mock Permit Exam simulator work?",
      a: "It replicates your state's real DMV permit test, exact number of questions, exact passing threshold, randomized each attempt so you never see the same exam twice.",
    },
    {
      q: "Can it actually prep me for the road test?",
      a: "Each maneuver gets a walkthrough, an examiner-style fail checklist, and a step-by-step mechanical breakdown, parallel parking, hill parks, lane changes, yielding, all of it.",
    },
    {
      q: "What's in Pro Pass?",
      a: "Full-length state-specific mock exams, unlimited AI chat, all section quizzes, the sign-recognition drill, the behind-the-wheel checklists, and every state rule pack. One-time payment of $19, no subscriptions.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-12 text-center text-5xl font-semibold tracking-[-0.03em]">
        Questions,{" "}
        <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
          Answered
        </span>
      </h2>
      <div className="space-y-3">
        {items.map((it) => (
          <details
            key={it.q}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition open:bg-white/[0.05]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-white">
              {it.q}
              <span className="ml-4 grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] text-sm text-blue-300 ring-1 ring-white/10 transition group-open:rotate-45">
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
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.02] p-16 text-center text-white backdrop-blur-xl">
        <h2 className="text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Get Your License.
          <br />
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] text-blue-300">
            First Try.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-white/70">
          Sign up, pick your state, and start your first mock exam in under a minute.
        </p>
        <Link
          to="/auth"
          className={`${BTN_PRIMARY} mt-10 px-10 py-5 text-base`}
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
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1e40af] border border-white/10">
            <img src={logo} alt="" className="h-4 w-4" />
          </span>
          <span className="font-semibold text-white">Drivable</span>
        </div>
        <span>© {new Date().getFullYear()} Drivable · Drive safe. Drive legal.</span>
      </div>
    </footer>
  );
}
