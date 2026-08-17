import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { MarketingLayout, BTN_PRIMARY, BTN_SECONDARY } from "@/components/marketing/MarketingLayout";

const TITLE = "Used Car Inspection Checklist: Safety Checks Before You Buy | Drivable";
const DESCRIPTION =
  "A printable used car inspection checklist for first time buyers: paperwork, tires, brakes, fluids, lights, rust, and a test drive routine you can run in 30 minutes.";

const SECTIONS: { title: string; blurb: string; items: string[] }[] = [
  {
    title: "1. Paperwork and identity",
    blurb: "Do this before you touch the car. It is the cheapest way to walk away early.",
    items: [
      "VIN on the dashboard, door jamb, title, and registration all match",
      "Seller name matches the name on the title",
      "Title is clean, not salvage, rebuilt, flood, or lemon branded",
      "No open recalls listed for the VIN at nhtsa.gov/recalls",
      "Odometer reading matches the wear on pedals, seat, and steering wheel",
      "Service records or receipts for major work such as timing belt or transmission",
    ],
  },
  {
    title: "2. Cold start and engine bay",
    blurb: "Ask the seller not to warm the car up before you arrive. A cold start hides nothing.",
    items: [
      "Starts on the first try with no long crank",
      "No blue, white, or thick grey smoke from the exhaust after start",
      "Engine oil is amber to brown, not gritty, milky, or gasoline scented",
      "Coolant is at level and brightly colored, not rusty or oily",
      "Transmission fluid is red or pink, not dark brown or burnt smelling",
      "Brake fluid is near the full line and not black",
      "No wet drips, crusty white residue, or fresh degreaser on the block",
      "Belts have no cracks, hoses are firm and not spongy",
      "Battery terminals are clean and the case is not swollen",
    ],
  },
  {
    title: "3. Tires, brakes, and suspension",
    blurb: "This is the safety core. Anything failing here becomes your bill in month one.",
    items: [
      "Tread depth above 4/32 inch, and a penny test shows part of Lincoln head covered",
      "All four tires are the same brand and size with no bulges or sidewall cracks",
      "DOT date code on each tire is under six years old",
      "Wear is even, not feathered on one edge, which points to alignment or suspension",
      "Spare tire, jack, and lug wrench are present and the spare holds air",
      "Brake rotors are smooth, not deeply grooved or lipped at the edge",
      "Brake pads show visible material through the wheel spokes",
      "Car does not bounce more than once after you push down hard on each corner",
      "No clunks when you rock the car or turn the wheel lock to lock",
    ],
  },
  {
    title: "4. Body, glass, and rust",
    blurb: "Look along the panels from a low angle in daylight, never in the rain or at night.",
    items: [
      "Panel gaps are even on both sides of the hood, doors, and trunk",
      "Paint color and texture match across every panel",
      "No overspray on rubber trim, and no paint dust in the door jambs",
      "Trunk floor, spare well, and under the carpet are dry with no rust holes",
      "Frame rails and rocker panels are solid, not flaky or patched",
      "Windshield has no crack in the driver line of sight",
      "All doors, windows, mirrors, and locks operate normally",
      "No damp carpet, fogged glass, or musty smell that suggests a water leak",
    ],
  },
  {
    title: "5. Lights and electronics",
    blurb: "Bring a friend so one of you can watch the lights while the other works the switches.",
    items: [
      "Headlights on low and high beam, both sides",
      "Brake lights, third brake light, and reverse lights",
      "Turn signals and hazards front and rear",
      "Dashboard warning lights all illuminate at key on, then go out",
      "Check engine light is not on, and the bulb has not been removed",
      "Heat, air conditioning, defroster, and blower on every speed",
      "Wipers and washer spray both work",
      "Horn, backup camera, infotainment, and every seat belt latch and retract",
    ],
  },
  {
    title: "6. The test drive",
    blurb: "Plan a 20 minute route with city streets, a hill, a rough road, and a highway on ramp.",
    items: [
      "Steering is centered and does not pull under braking or acceleration",
      "Brakes stop straight with no pulsing, grinding, or long pedal travel",
      "Transmission shifts smoothly with no flare, slip, or hard jolt",
      "No vibration at highway speed through the wheel or seat",
      "No whine, click on turns, or droning that changes with speed",
      "Air conditioning still blows cold after 15 minutes",
      "Park on a clean patch, idle two minutes, then check for fresh drips",
      "Temperature gauge stays in the normal range the entire drive",
    ],
  },
  {
    title: "7. Before you pay",
    blurb: "One paid inspection is cheaper than the first repair you did not plan for.",
    items: [
      "Independent mechanic pre purchase inspection completed",
      "Vehicle history report reviewed for accidents and title transfers",
      "Repair estimates for every issue found are subtracted from your offer",
      "Insurance quote for this exact VIN obtained",
      "Title signed correctly, bill of sale written, and payment method traceable",
    ],
  },
];

const TOTAL = SECTIONS.reduce((n, s) => n + s.items.length, 0);

export const Route = createFileRoute("/guides/used-car-inspection")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Used Car Inspection Checklist for First Time Buyers" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://mydrivable.com/guides/used-car-inspection" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Used Car Inspection Checklist for First Time Buyers" },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://mydrivable.com/guides/used-car-inspection" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to inspect a used car before you buy",
          description: DESCRIPTION,
          url: "https://mydrivable.com/guides/used-car-inspection",
          totalTime: "PT30M",
          step: SECTIONS.map((s) => ({
            "@type": "HowToStep",
            name: s.title.replace(/^\d+\.\s*/, ""),
            text: s.blurb,
            itemListElement: s.items.map((i) => ({
              "@type": "HowToDirection",
              text: i,
            })),
          })),
        }),
      },
    ],
  }),
  component: UsedCarInspectionGuide,
});

function UsedCarInspectionGuide() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const checked = Object.values(done).filter(Boolean).length;

  const toggle = (key: string) =>
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[#1e40af]">Buyer guide</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Used car inspection checklist
        </h1>
        <p className="mt-4 text-[#1f2b4d]/70">
          Your first car is usually a used car, and the walk around is where most new
          drivers lose money. Work through these seven sections in order. Tap any line
          to tick it off as you go, then take the unchecked items to a mechanic before
          you make an offer. Budget about 30 minutes at the car plus one paid pre
          purchase inspection.
        </p>

        <div className="sticky top-20 z-40 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[#1e40af]/18 bg-[#f4f7fd]/90 px-5 py-3 backdrop-blur-xl">
          <div>
            <p className="text-sm font-semibold">
              {checked} of {TOTAL} checks complete
            </p>
            <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-[#1e40af]/10 sm:w-64">
              <div
                className="h-full rounded-full bg-[#3b82f6] transition-all"
                style={{ width: `${(checked / TOTAL) * 100}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDone({})}
            className={`${BTN_SECONDARY} min-h-11 px-4 text-xs`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title} className="mt-12">
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">{section.title}</h2>
            <p className="mt-2 text-[#1f2b4d]/65">{section.blurb}</p>
            <ul className="mt-5 space-y-2">
              {section.items.map((item) => {
                const key = `${section.title}:${item}`;
                const on = !!done[key];
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      aria-pressed={on}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-[15px] transition ${
                        on
                          ? "border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#1f2b4d]/70 line-through"
                          : "border-[#1e40af]/18 bg-[#1e40af]/[0.045] text-[#1f2b4d]/85 hover:bg-[#1e40af]/[0.08]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                          on ? "border-[#3b82f6] bg-[#3b82f6]" : "border-[#1e40af]/35"
                        }`}
                      >
                        {on && <Check className="h-3.5 w-3.5 text-[#0f172a]" />}
                      </span>
                      {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">Walk away signals</h2>
          <ul className="mt-4 space-y-3 text-[#1f2b4d]/75">
            <li>The seller will not let you take it to an independent mechanic.</li>
            <li>The name on the title is not the person selling the car.</li>
            <li>The check engine light is on and the seller calls it a sensor.</li>
            <li>Milky oil, sweet smelling exhaust, or a temperature gauge that climbs.</li>
            <li>Rust holes in the frame rails, rockers, or spare tire well.</li>
            <li>Pressure to pay cash today because someone else is coming to see it.</li>
          </ul>
        </section>

        <section className="mt-14 rounded-[28px] border border-[#3b82f6]/30 bg-[#1e40af]/[0.035] p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            Decode the VIN before the walk around
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#1f2b4d]/70">
            Confirm the year, engine, and factory safety equipment in seconds, then get
            your license locked in with an AI coach and a full length mock permit exam.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/tools/vin-lookup" className={`${BTN_PRIMARY} px-7 py-3.5 text-sm`}>
              Open the VIN lookup
            </Link>
            <Link
              to="/auth"
              className="text-sm font-semibold text-[#1e40af] underline-offset-4 hover:underline"
            >
              Start practicing free
            </Link>
          </div>
        </section>
      </article>
    </MarketingLayout>
  );
}
