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
  LayoutDashboard,
  
  Timer,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { US_STATES } from "@/lib/user-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drivable, AI Driving Coach and Permit Test Practice" },
      {
        name: "description",
        content:
          "Master your permit and ace your road test on the first try. AI coach, full-length mock permit exam simulator, and targeted section quizzes tuned to your state.",
      },
      { property: "og:title", content: "Drivable, Master Your Permit & Ace Your Road Test" },
      {
        property: "og:description",
        content:
          "Practice with an AI driving coach, a full-length mock permit exam, and state-specific section quizzes. Set your test date and track readiness in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mydrivable.com/" },
      { name: "twitter:title", content: "Drivable, Master Your Permit & Ace Your Road Test" },
      {
        name: "twitter:description",
        content:
          "Practice with an AI driving coach, a full-length mock permit exam, and state-specific section quizzes. Set your test date and track readiness in one dashboard.",
      },
    ],
    links: [{ rel: "canonical", href: "https://mydrivable.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Drivable",
          url: "https://mydrivable.com/",
          logo: "https://mydrivable.com/favicon.png",
          email: "philip@mydrivable.com",
          description:
            "Drivable coaches new drivers through the permit test and road test with an AI coach, mock permit exams, and state-specific quizzes.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Drivable",
          url: "https://mydrivable.com/",
        }),
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

const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 text-white font-semibold transition active:scale-[0.98]";



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
          <img src={logo} alt="Drivable logo" className="h-9 w-9 logo-mask" />
          <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:inline">
            Drivable
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-white/70 sm:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#states" className="transition hover:text-white">States</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
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
    <section className="relative isolate flex min-h-[calc(100svh-72px)] flex-col items-center justify-center overflow-hidden px-6 pt-10 pb-14 text-center sm:pt-6 sm:pb-10">
      {/* Ambient hero glow — sized for both mobile and desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[22%] -z-10 h-[420px] w-[520px] max-w-[95vw] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[90px] sm:top-[30%] sm:h-[700px] sm:w-[900px] sm:max-w-[110vw] sm:bg-blue-600/12 sm:blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[260px] w-[340px] max-w-[75vw] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[70px] sm:top-[45%] sm:h-[420px] sm:w-[560px] sm:max-w-[80vw] sm:bg-blue-500/14 sm:blur-[100px]"
      />


      <div className="mx-auto mb-6 inline-flex max-w-[640px] items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm backdrop-blur-xl">
        <span className="inline-flex items-center gap-1.5 text-blue-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          New
        </span>

        <span className="hidden text-white/80 sm:inline">
          Full-length state-specific Mock Permit Exam simulator, now live
        </span>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <h1 className="relative text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
          Master Your Permit and
          <br />
          Ace Your Road Test on the{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] text-blue-300">
            First Try
          </span>
        </h1>
      </div>

      <p className="relative mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
        An AI driving coach trained on every official DMV handbook, with
        full-length mock permit exams and targeted section drills. No fluff.
      </p>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/auth"
          className={`${BTN_PRIMARY} px-8 py-4 text-base`}
        >
          Get Started
        </Link>

        <a
          href="#features"
          className="rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 text-base font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97]"
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
    {
      icon: LayoutDashboard,
      title: "State-Specific & Schedule-Tailored Practice",
      body: "Set your target test date and select your state to instantly adapt your prep program. Track your overall readiness score and stay on schedule all in one centralized dashboard.",
    },
  ];


  return (
    <section id="features" className="px-6 pt-28 pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-blue-300" />
          Four Pillars
        </div>
        <h2 className="mt-8 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Everything Between You and a{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Real License
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
          Four focused tools, one outcome, pass on the first try.
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
  const proFeatures = [
    "Full-length state-specific Mock Permit Exam simulator",
    "Unlimited AI coach chat synced to your DMV handbook",
    "All 4 targeted pillar quizzes with infinite question pool",
    "Sign recognition drills baked into the quiz hub",
    "All 50 state rule packs",
    "Pay once, use forever, no recurring fees",
  ];

  const freeFeatures = [
    "Very limited AI coach chat (5 lifetime questions max)",
    "Limited practice tests (5 exam questions & 3 questions per quiz section max)",
  ];

  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
          Two Plans
        </div>
        <h2 className="mt-6 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
          Pick Your{" "}
          <span className="italic font-medium [font-family:'Cormorant_Garamond',Georgia,serif] bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Lane
          </span>
        </h2>
        <p className="mt-4 text-white/60">Start free, or unlock the full test simulator with one payment.</p>
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Centered ambient backlight behind the Pro card */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[520px] w-[520px] -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(30,64,175,0.35), rgba(30,64,175,0.10) 55%, transparent 75%)",
          }}
        />

        <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
          {/* Free Pass */}
          <div className="relative flex flex-col rounded-[28px] border border-white/10 bg-[#070b18]/70 p-8 backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="text-lg font-medium text-white/90">Free Pass</div>
              <div className="mt-8 flex items-end gap-2 text-white">
                <span className="text-6xl font-semibold tracking-[-0.03em]">$0</span>
                <span className="mb-2 text-sm text-white/85">forever free</span>
              </div>
              <p className="mt-2 text-sm text-white/75">Kick the tires and study the basics, no card required.</p>
            </div>

            <Link
              to="/auth"
              search={{ next: "/app" }}
              className={`${BTN_SECONDARY} mt-7 w-full py-4 text-sm`}
            >
              Start Free
            </Link>

            <ul className="mt-7 space-y-3 text-[15px]">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/85">
                  <Check className="h-4 w-4 shrink-0 text-white/60" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Pass */}
          <div className="relative flex flex-col rounded-[28px] border border-[#3b82f6]/40 bg-[#070b18]/70 p-8 backdrop-blur-xl shadow-[0_0_60px_-20px_rgba(59,130,246,0.55)]">
            <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#1e40af] border border-[#3b82f6]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white whitespace-nowrap">
              Most Popular
            </span>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="text-lg font-medium text-white/90">Pro Pass</div>
              <div className="mt-8 flex items-end gap-2 text-white">
                <span className="text-6xl font-semibold tracking-[-0.03em]">$9</span>
                <span className="mb-2 text-sm text-white/85">one-time</span>
              </div>
              <p className="mt-2 text-sm text-white/75">Pay once. Lifetime access to everything Drivable builds.</p>
            </div>

            <Link
              to="/auth"
              search={{ next: "/app?intent=upgrade" }}
              className={`${BTN_PRIMARY} mt-7 w-full py-4 text-sm`}
            >
              Get Pro Pass — $9 one-time
            </Link>

            <ul className="mt-7 space-y-3 text-[15px]">
              {proFeatures.map((f) => (
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
    <footer className="border-t border-white/5 px-6 py-10 pb-24 text-sm text-white/50 sm:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs uppercase tracking-wider text-white/40">Need help?</span>
          <a
            href="mailto:philip@mydrivable.com"
            className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-white/80 transition hover:text-white"
          >
            Contact Support: philip@mydrivable.com
          </a>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/70">
          <Link to="/tools/vin-lookup" className="transition hover:text-white">
            Free VIN Lookup
          </Link>
          <Link to="/guides/used-car-inspection" className="transition hover:text-white">
            Used Car Inspection Checklist
          </Link>
          <Link to="/guides/road-test-checklist" className="transition hover:text-white">
            DMV Road Test Checklist
          </Link>
        </nav>
        <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 logo-mask" />

            <span className="font-semibold text-white">Drivable</span>
          </div>
          <span>© {new Date().getFullYear()} Drivable · Drive safe. Drive legal.</span>
        </div>
      </div>
    </footer>
  );
}
