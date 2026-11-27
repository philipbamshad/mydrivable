import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/drivable-logo.png";
import {
  ArrowRight,
  Check,
  Menu,
  X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BetaBadge } from "@/components/marketing/BetaBadge";
import { SimulationPreview } from "@/components/marketing/SimulationPreview";
import { ProductPreview, PracticePreview, CoachPreview } from "@/components/marketing/ProductPreview";
import { DEMO_SIGNS } from "@/lib/demo";
import { SignVisual } from "@/components/dashboard/SignVisual";
import { US_STATES } from "@/lib/user-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drivable | Permit & Driving Test Prep" },
      {
        name: "description",
        content:
          "Prepare for your permit test and your driving test with state-specific practice, full-length mock exams, a real-world driving simulation, and an AI coach built on your official DMV handbook.",
      },
      { property: "og:title", content: "Drivable | Permit & Driving Test Prep" },
      {
        property: "og:description",
        content:
          "Prepare for your permit test and your driving test with state-specific practice, full-length mock exams, a real-world driving simulation, and an AI coach built on your official DMV handbook.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://mydrivable.com/" },
      { name: "twitter:title", content: "Drivable | Permit & Driving Test Prep" },
      {
        name: "twitter:description",
        content:
          "Prepare for your permit test and your driving test with state-specific practice, full-length mock exams, a real-world driving simulation, and an AI coach built on your official DMV handbook.",
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
          email: "support@mydrivable.com",
          description:
            "Prepare for your permit test and your driving test with state-specific practice, full-length mock exams, a real-world driving simulation, and an AI coach built on your official DMV handbook.",
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

const SHELL = "relative min-h-screen overflow-hidden bg-background text-foreground font-sans";
const BTN_PRIMARY = "cta-pill";
const BTN_SECONDARY = "inline-flex items-center justify-center gap-2 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/25 text-foreground font-semibold transition-colors";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.setAttribute("data-revealed", "true");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}




function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  return (
    <div className={SHELL}>
      <Nav />
      <Hero />
      <StatesMarquee />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="sticky top-4 z-50 px-4">
      <div
        className={`nav-float marketing-top-nav mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center rounded-full border bg-card/85 px-3 py-2 backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] ${
          scrolled
            ? "border-[#1e40af]/20 shadow-[0_18px_44px_-24px_rgba(30,64,175,0.42)] dark:border-white/10 dark:shadow-[0_18px_44px_-24px_rgba(0,0,0,0.8)]"
            : "border-[#1e40af]/10 shadow-[0_8px_24px_-20px_rgba(30,64,175,0.28)] dark:border-white/10 dark:shadow-[0_8px_24px_-20px_rgba(0,0,0,0.7)]"
        }`}
      >


        <Link to="/" className="flex min-w-0 items-center gap-2 justify-self-start pl-2">
          <img src={logo} alt="Drivable logo" className="h-9 w-9 logo-mask" />
          <span className="hidden text-[15px] font-semibold tracking-normal text-[#0f172a] sm:inline dark:text-[#f3f4f6]">
            Drivable
          </span>

        </Link>

        <nav aria-label="Homepage" className="hidden items-center justify-center gap-7 whitespace-nowrap text-sm font-medium text-muted-foreground lg:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#states" className="transition hover:text-foreground">States</a>
          <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          <Link to="/demo" className="text-muted-foreground hover:text-foreground">Try demo</Link>
        </nav>


        <div className="flex shrink-0 items-center justify-self-end gap-2"><Button asChild variant="ghost" className="hidden lg:inline-flex"><Link to="/auth">Sign in</Link></Button>
          <Button asChild
            className={`${BTN_PRIMARY} group hidden lg:inline-flex px-5 py-2.5 text-sm`}
          >
            <Link to="/auth" search={{mode:"sign-up"}}>Get started
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-foreground/15 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden h-11 w-11 rounded-full border border-border bg-card text-foreground"
          >

            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>


      {open && (
        <div className="lg:hidden mx-auto mt-2 max-w-5xl rounded-2xl border border-[#1e40af]/18 bg-[#f4f7fd]/95 p-4 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(30,64,175,0.14)] dark:border-white/10 dark:bg-[#1c1f22]/95 dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          <nav className="flex flex-col text-base font-medium text-[#1f2b4d]/85 dark:text-[#e5e7eb]">

            {[
              ["Features", "#features"],
              ["States", "#states"],
              ["Pricing", "#pricing"],
              
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-[#1e40af]/8 dark:hover:bg-white/10"
              >

                {label}
              </a>
            ))}
            <Button asChild variant="ghost" className="justify-start"><Link to="/demo" onClick={() => setOpen(false)}>Try demo</Link></Button>
            <Button asChild variant="ghost" className="justify-start"><Link to="/auth">Sign in</Link></Button>
            <Button asChild className={`${BTN_PRIMARY} mt-2 px-5 py-3 text-sm`}><Link to="/auth" search={{mode:"sign-up"}}>Get started<ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[min(600px,70svh)] flex-col items-center justify-center px-6 pb-10 pt-8 text-center sm:pb-12 sm:pt-10">
      <div className="relative mx-auto max-w-5xl">
        <h1 className="fade-in-up relative font-display text-[2.6rem] font-bold leading-[1.15] tracking-tight sm:text-[3.8rem]">
          Drivable,{" "}
          <span className="hero-serif-gradient">Master the Road</span>
        </h1>
      </div>

      <p className="fade-in-up relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Practice tests, an AI coach and driving simulations, built from your state's official DMV handbook.
      </p>

      <div className="fade-in-up relative mt-5 flex flex-wrap items-center justify-center gap-3" style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
        <Button asChild className={`${BTN_PRIMARY} h-14 rounded-full px-8 text-base`}><Link to="/auth" search={{mode:"sign-up"}}>Start free<ArrowRight className="h-4 w-4" /></Link></Button>
        <Button asChild variant="outline" className={`${BTN_SECONDARY} h-14 rounded-full px-8 text-base`}><Link to="/demo">Try demo</Link></Button>
      </div>
      <div className="fade-in-up relative mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1" style={{ "--reveal-delay": "240ms" } as React.CSSProperties}>
        <span className="flex items-center gap-0.5" role="img" aria-label="Rated 5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 shrink-0 fill-marketing-star text-marketing-star" aria-hidden="true" />
          ))}
        </span>
        <p className="text-xs text-muted-foreground">“I highly recommend using this to study.” — Hudson P.</p>
      </div>
      <ProductPreview />
    </section>
  );
}


function StatesMarquee() {
  const loop = [...US_STATES, ...US_STATES];
  return (
    <section id="states" className="border-y border-[#1e40af]/12 dark:border-white/[0.08] bg-[#1e40af]/[0.035] dark:bg-white/[0.03] py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="marketing-section-label mb-6">
          All 50 States · Grounded in Official DMV Handbooks
        </p>
        <h2 className="mb-10 text-3xl font-semibold tracking-normal sm:text-4xl">
          Wherever You Take the Test, <span className="hero-serif-gradient">We've Got You</span>
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
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/75 px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
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
    {title:"Full-Length Mock Permit Exam Simulator",body:"State-accurate exams with the real question count and passing score. Study at your own pace, no timer pressure.",visual:"simulator",tone:"blue"},
    {title:"AI Coach",body:"Handbook-based explanations for your state",visual:"coach",tone:"green"},
    {title:"Targeted Section Quizzes",body:"Drill road signs, intersections, speed limits and substance laws. Your study plan adapts to your state and DMV test date.",visual:"quizzes",tone:"amber"},
    {title:"Driving Test Simulation",body:"Watch real driving situations and make the right call in a split second.",visual:"driving",tone:"red"},
  ];
  const grid=useReveal<HTMLDivElement>();
  const roadSign=DEMO_SIGNS.find(q=>q.sign?.shape==="diamond")?.sign ?? DEMO_SIGNS[0]?.sign;
  return <section id="features" className="marketing-lane-divider px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-3xl text-center"><p className="marketing-section-label">State-Specific DMV Prep</p><h2 className="mt-8 text-3xl font-semibold sm:text-5xl">Four focused tools, one goal: <span className="hero-serif-gradient">test-day ready.</span></h2></div>
    <div ref={grid} className="marketing-feature-grid mx-auto mt-12 grid w-full max-w-6xl auto-rows-fr gap-6 md:grid-cols-2">
      {features.map(f=><div key={f.title} data-feature-tone={f.tone} className="reveal marketing-feature group flex h-full flex-col overflow-hidden rounded-[32px] bg-secondary p-4 transition-all duration-200 hover:-translate-y-1">
        <div className="relative flex h-[280px] shrink-0 items-center justify-center rounded-[24px] px-4 sm:px-6">
          {f.visual==="simulator" && <div className="w-full max-w-[340px]"><PracticePreview /></div>}
          {f.visual==="coach" && <div className="w-full max-w-[340px]"><CoachPreview /></div>}
          {f.visual==="quizzes" && <div className="exam-road-visual flex w-full max-w-[340px] items-center gap-4 rounded-lg bg-card p-5 shadow-sm">{roadSign && <SignVisual s={roadSign} size={100} />}<div><p className="text-sm font-semibold">Signs &amp; Markings</p><p className="mt-2 text-xs text-muted-foreground">Recognize the sign.<br />Know the next move.</p><span className="mt-3 inline-block rounded-full bg-marketing-amber/10 px-2 py-1 text-xs font-medium text-marketing-amber">Road signs</span></div></div>}
          {f.visual==="driving" && <div className="w-full max-w-[340px]"><SimulationPreview /></div>}
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-6 sm:px-6 sm:pb-6"><h3 className="font-display text-2xl font-semibold lg:text-[28px]">{f.title}{f.visual==="driving" && <span className="ml-2"><BetaBadge /></span>}</h3><p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">{f.body}</p><Button asChild variant="link" className="mt-auto h-auto justify-start px-0 pb-0 pt-6 text-primary"><Link to="/auth" search={{mode:"sign-up"}}>Start practicing<ArrowRight className="size-4" /></Link></Button></div>
      </div>)}
    </div>
  </section>;
}


function Testimonials() {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      aria-labelledby="testimonial-heading"
      className="marketing-lane-divider px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 id="testimonial-heading" className="sr-only">
          What learners say
        </h2>
        <div className="text-center">
          <p className="marketing-section-label">From a learner</p>
        </div>
        <figure className="reveal mt-8 rounded-[32px] border border-border/60 bg-card p-6 text-center shadow-[var(--marketing-shadow)] sm:mt-10 sm:p-12">
          <div
            className="flex items-center justify-center gap-1"
            role="img"
            aria-label="Rated 5 out of 5 stars"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 shrink-0 fill-marketing-star text-marketing-star sm:size-5" aria-hidden="true" />
            ))}
          </div>
          <blockquote className="mt-6 text-[19px] leading-relaxed text-card-foreground sm:mt-8 sm:text-[26px] sm:leading-[1.5]">
            <span className="quote-serif mr-1 align-text-bottom text-4xl leading-none text-marketing-star/40 sm:text-5xl">
              {"\u201C"}
            </span>
            The only way I studied for my permit test was using this website. I did not use anything else and studied with this for a couple of days, and I passed. I highly recommend using this to study, in my opinion it is the best way out there.
            <span className="quote-serif ml-1 align-text-bottom text-4xl leading-none text-marketing-star/40 sm:text-5xl">
              {"\u201D"}
            </span>
          </blockquote>
          <figcaption className="mt-6 sm:mt-8">
            <p className="font-semibold text-card-foreground">Hudson P.</p>
            <p className="mt-1 text-sm text-muted-foreground">Passed his permit test</p>
          </figcaption>
        </figure>
        <p className="mt-6 text-center text-xs text-muted-foreground">Individual results vary.</p>
      </div>
    </section>
  );
}


function Pricing() {
  const proFeatures = [
    "Unlimited practice in every topic",
    "Unlimited full-length mock exams",
    "Review every missed question",
    "Unlimited AI Coach",
    "Unlimited Driving Test Sim (Beta)",
    "Study plan for your test date",
    "All 50 states",
    "Pay once, use forever, no recurring fees",
  ];
  const freeFeatures = [
    "1 quiz per topic",
    "1 sample exam",
    "3 AI Coach questions a day",
    "1 driving sim run (Beta)",
  ];

  return <section id="pricing" className="marketing-pricing-band marketing-lane-divider px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto mb-14 max-w-3xl text-center"><p className="marketing-section-label">Two Plans</p><h2 className="mt-6 text-3xl font-semibold sm:text-5xl">Pick Your <span className="hero-serif-gradient marketing-band-serif">Lane</span></h2><p className="mt-4 text-marketing-white/70">Practice at no cost, or unlock everything with one payment.</p></div>
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
      {[{name:"Free Pass",price:"$0",period:"forever free",description:"Kick the tires and study the basics, no card required.",items:freeFeatures,pro:false},{name:"Pro Pass",price:"$24",period:"one-time",description:"Pay once. Lifetime access to everything Drivable builds.",items:proFeatures,pro:true}].map(plan=><div key={plan.name} className={plan.pro ? "marketing-pro-card lift flex flex-col rounded-[28px] border p-8" : "lift flex flex-col rounded-[28px] border border-border bg-card p-8 text-card-foreground"}>
        <div className="flex items-center justify-between gap-2"><h3 className="text-lg font-medium">{plan.name}</h3>{plan.pro && <span className="rounded-full bg-marketing-white/10 px-3 py-1 text-xs font-semibold">Best value</span>}</div><div className="mt-8 flex items-end gap-2"><span className="font-display text-6xl font-semibold">{plan.price}</span><span className="mb-2 text-sm opacity-75">{plan.period}</span></div><p className="mt-3 text-sm leading-relaxed opacity-75">{plan.description}</p>
        <ul className="mt-7 mb-8 space-y-3 text-[15px]">{plan.items.map(f=><li key={f} className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0" /><span>{f}</span></li>)}</ul>
        <Button asChild variant={plan.pro ? "secondary":"default"} className="mt-auto h-12 w-full rounded-full"><Link to="/auth" search={{mode:"sign-up",...(plan.pro ? {next:"/app?intent=upgrade"}:{})}}>{plan.pro ? "Get Pro":"Start free"}<ArrowRight /></Link></Button>
      </div>)}
    </div>
  </section>;
}


function CTA() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-[#1e40af]/18 dark:border-white/10 bg-[#1e40af]/[0.035] dark:bg-white/[0.03] p-6 sm:p-16 text-center text-[#0f172a] dark:text-[#f3f4f6] backdrop-blur-xl">
        <h2 className="text-3xl font-semibold sm:text-5xl">
          Prepare With Confidence.
          <br />
          <span className="hero-serif-gradient">
            One Topic at a Time.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[#1f2b4d]/70 dark:text-[#d1d5db]/80">
          State-specific preparation for your permit test and driving test. Start practicing today.
        </p>
        <Button asChild className={`${BTN_PRIMARY} mt-10 h-auto px-10 py-5 text-base`}><Link to="/auth" search={{mode:"sign-up"}}>Get started<ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
    </section>

  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1e40af]/12 dark:border-white/[0.08] px-6 py-10 pb-24 text-sm text-[#1f2b4d]/65 dark:text-[#9ca3af]/75 sm:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs uppercase tracking-wider text-[#1f2b4d]/70 dark:text-[#d1d5db]/80">Need help?</span>
          <a
            href="mailto:support@mydrivable.com"
            className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-[#1f2b4d]/80 dark:text-[#d1d5db]/80 transition hover:text-[#0f172a] dark:text-[#f3f4f6] dark:hover:text-white"
          >
            Contact Support: support@mydrivable.com
          </a>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-[#1e40af]/12 dark:border-white/[0.08] pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 logo-mask" />

            <span className="font-semibold text-[#0f172a] dark:text-[#f3f4f6]">Drivable</span>
          </div>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="transition hover:text-[#0f172a] dark:text-[#f3f4f6] dark:hover:text-white">Privacy</Link>
            <Link to="/terms" className="transition hover:text-[#0f172a] dark:text-[#f3f4f6] dark:hover:text-white">Terms</Link>
            <Link to="/refunds" className="transition hover:text-[#0f172a] dark:text-[#f3f4f6] dark:hover:text-white">Refunds</Link>
            <Link to="/cookies" className="transition hover:text-[#0f172a] dark:text-[#f3f4f6] dark:hover:text-white">Cookies</Link>
          </nav>
          <div className="flex flex-col items-center gap-1 text-center sm:items-end sm:text-right">
            <span>© {new Date().getFullYear()} Bedford Global. Drivable is operated by Bedford Global.</span>
            <span className="text-xs">Not affiliated with any state DMV.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
