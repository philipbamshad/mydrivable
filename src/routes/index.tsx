import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, Signpost, MessageSquare, Video, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/marketing/PublicNav";
import { BetaBadge } from "@/components/marketing/BetaBadge";
import heroStill from "@/assets/hero-sim-still.jpg";
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


function FreeLink({ label = "Start free" }: {label?: string}) {
  return <Button asChild className="h-12 rounded-full px-7 text-base"><Link to="/auth" search={{mode:'sign-up'}}>{label}<ArrowRight className="h-4 w-4"/></Link></Button>;
}
function Landing() {
  const features = [
    { title: 'Practice tests', text: 'State-specific permit questions with clear feedback.', icon: ClipboardCheck },
    { title: 'Road signs', text: 'Learn the signs, signals, and markings that matter.', icon: Signpost },
    { title: 'AI tutor', text: 'Understand your mistakes with handbook-based answers.', icon: MessageSquare },
    { title: 'Simulations', text: 'Make the call in real-world driving scenarios.', icon: Video, beta: true },
  ];
  return <div className="min-h-screen bg-background text-foreground"><PublicNav/>
    <section className="relative isolate flex min-h-[min(550px,65svh)] items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-8">
      <img src={heroStill} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover" fetchPriority="high"/>
      <div className="absolute inset-0 -z-10 bg-background/90"/>
      <div className="mx-auto max-w-5xl"><h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">Drivable, <span className="hero-serif-gradient">Master the Road</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Prepare for your permit and driving tests with state-specific practice and clear, handbook-based explanations.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><FreeLink/><Button asChild variant="outline" className="h-12 rounded-full bg-background px-6 text-base"><Link to="/demo">Try it free – no sign-up</Link></Button></div>
      </div>
    </section>
    <section id="features" className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{features.map(({title,text,icon:Icon,beta}) => <div key={title} className="rounded-lg border border-border bg-card p-6"><Icon className="mb-5 h-6 w-6 text-primary"/><h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold">{title}{beta && <BetaBadge/>}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}</section>
    <section className="border-y border-border bg-secondary/40 px-4 py-14 sm:px-8"><div className="mx-auto max-w-5xl"><h2 className="text-center font-display text-2xl font-bold">How it works</h2><ol className="mt-8 grid gap-7 sm:grid-cols-3">{['Sign up free','Practice','Pass your permit test'].map((step,i)=><li key={step} className="flex items-center justify-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{i+1}</span><span className="font-medium">{step}</span></li>)}</ol></div></section>
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-16 sm:px-8"><h2 className="text-center font-display text-3xl font-bold">Free to start. Pro when you're ready.</h2><div className="mt-9 grid gap-5 sm:grid-cols-2">{[
      {name:'Free Pass',price:'$0',term:'No card required',features:['5 AI Coach questions per day','1 full-length mock permit exam','1 practice test per topic','1 simulation run (Beta)']},
      {name:'Pro Pass',price:'$9',term:'One-time payment · lifetime access',features:['Unlimited AI Coach','Unlimited mock permit exams','All Test Hub topics and missed-question review','Unlimited simulations (Beta)']},
    ].map(plan=><div key={plan.name} className="flex flex-col rounded-lg border border-border bg-card p-6 sm:p-8"><h3 className="font-display text-xl font-semibold">{plan.name}</h3><p className="mt-5 font-display text-4xl font-bold">{plan.price}</p><p className="mt-2 text-sm text-muted-foreground">{plan.term}</p><ul className="mb-7 mt-7 flex-1 space-y-3">{plan.features.map(f=><li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-primary"/>{f}</li>)}</ul><FreeLink label={plan.name==='Free Pass'?'Start free':'Sign up free'}/></div>)}</div></section>
    <section className="border-t border-border px-4 py-14 text-center"><FreeLink/></section>
    <footer className="border-t border-border px-4 py-8 text-sm text-muted-foreground"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5"><p>© {new Date().getFullYear()} Bedford Global · Drivable</p><nav aria-label="Legal" className="flex flex-wrap gap-5"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/refunds">Refunds</Link><Link to="/cookies">Cookies</Link><a href="mailto:support@mydrivable.com">Support</a></nav><p className="w-full text-xs">Not affiliated with any state DMV.</p></div></footer>
  </div>;
}
