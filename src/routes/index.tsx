import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/driveguide-logo.png";
import { CheckCircle2, Car, ClipboardList, Wrench } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DriveGuide AI — Permit, Road Test & First Car Coach" },
      {
        name: "description",
        content:
          "DriveGuide AI coaches teens through the permit test, road test, and first-car ownership with state-aware, no-nonsense answers.",
      },
      { property: "og:title", content: "DriveGuide AI" },
      {
        property: "og:description",
        content: "Your no-nonsense AI driving coach.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="DriveGuide" width={32} height={32} />
            <span className="font-bold tracking-tight">DriveGuide AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-5">
          Permit · Road Test · First Car
        </span>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
          The driving coach
          <br />
          that <span className="text-primary">actually shows up.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          DriveGuide AI walks you through the permit test, the road test, and your first car —
          with state-aware rules, scannable breakdowns, and zero fluff.
        </p>
        <div className="lane-divider w-32 mx-auto my-8" />
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="font-semibold">
              Start coaching free
            </Button>
          </Link>
          <a href="#how" className="inline-flex">
            <Button size="lg" variant="outline">
              See how it works
            </Button>
          </a>
        </div>
      </section>

      <section id="how" className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: ClipboardList,
              title: "Permit Prep",
              body: "Drill signs, laws, and right-of-way until the written test feels easy.",
            },
            {
              icon: Car,
              title: "Road Test Prep",
              body: "Maneuver-by-maneuver coaching and exactly what the examiner watches for.",
            },
            {
              icon: Wrench,
              title: "First Car",
              body: "Used-listing breakdowns, common-cost ranges, and step-by-step safety checks.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
            What you get
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              "State-aware rule lookups (asks for your state when it matters)",
              "Structured used-car risk breakdowns",
              "Clear cost ranges in USD",
              "Step-by-step safety actions",
              "Never advice on illegal mods or operations",
              "Cool, direct mentor tone",
            ].map((t) => (
              <li key={t} className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex justify-between">
          <span>© DriveGuide AI</span>
          <span>Drive safe. Drive legal.</span>
        </div>
      </footer>
    </div>
  );
}
