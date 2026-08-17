import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { MarketingLayout, BTN_PRIMARY, BTN_SECONDARY } from "@/components/marketing/MarketingLayout";

const TITLE = "DMV Road Test Checklist: What to Bring and What Examiners Score | Drivable";
const DESCRIPTION =
  "A complete DMV road test checklist: documents to bring, vehicle requirements, the pre drive safety check, every maneuver examiners score, and the automatic fail list.";

const SECTIONS: { title: string; blurb: string; items: string[] }[] = [
  {
    title: "1. Paperwork to bring",
    blurb: "Missing one document is the most common reason a test gets cancelled at the counter.",
    items: [
      "Valid learner permit, not expired, in your own name",
      "Appointment confirmation with the time and office location",
      "Proof of identity and residency your state requires",
      "Certificate of completion for driver education or training hours, if required",
      "Signed log of supervised practice hours if your state tracks them",
      "Application fee or test fee in an accepted payment method",
      "Parent or guardian present and ready to sign if you are under 18",
    ],
  },
  {
    title: "2. The car has to pass too",
    blurb: "Examiners inspect the vehicle first and will refuse the test over any of these.",
    items: [
      "Current registration and proof of insurance in the glove box",
      "Both license plates attached and readable",
      "Headlights, brake lights, reverse lights, turn signals, and hazards all working",
      "Horn works and windshield has no crack in the driver line of sight",
      "Wipers work and the windshield is clean inside and out",
      "Both side mirrors and the rear view mirror are intact and adjustable",
      "Every seat belt latches and retracts, and the passenger door opens from outside",
      "Tires have legal tread and no warning lights are lit on the dashboard",
      "Emergency brake holds and the interior is clear of loose items",
    ],
  },
  {
    title: "3. Pre drive safety check",
    blurb: "Many states score this before you leave the lot. Narrate what you are doing.",
    items: [
      "Adjust the seat, then the mirrors, then fasten your belt before starting",
      "Point out and operate the turn signals, hazards, and windshield wipers",
      "Demonstrate the defroster, headlights, horn, and emergency brake on request",
      "Show hand signals for left turn, right turn, and slowing or stopping",
      "Identify the brake lights by pressing the pedal when asked",
      "Know where the parking brake release and the hazard switch are without looking",
    ],
  },
  {
    title: "4. Maneuvers examiners score",
    blurb: "Practice each one until it feels boring. Boring is what passing looks like.",
    items: [
      "Smooth starts and stops with no jerking or rolling past the limit line",
      "Full stop behind the line at stop signs, with a clear look left, right, left",
      "Left and right turns from the correct lane at a controlled speed",
      "Lane changes with mirror, signal, blind spot check, then a gradual move",
      "Merging onto a highway or busy road at the speed of traffic",
      "Backing straight for about 50 feet at a slow, steady pace",
      "Three point turn or U turn where your state tests it",
      "Parallel parking or curb parking with wheels turned correctly on a hill",
      "Intersections with no signal, treated as an all way stop when required",
      "Railroad crossings, school zones, and crosswalks approached with a speed drop",
    ],
  },
  {
    title: "5. Habits scored on every mile",
    blurb: "Small repeated errors add up faster than one awkward maneuver.",
    items: [
      "Speed stays at or just under the posted limit, and slows for conditions",
      "Both hands stay on the wheel, no crossing your arms during turns",
      "Eyes scan mirrors roughly every five to eight seconds",
      "Head turns visibly at every intersection and before every lane change",
      "Following distance stays at three seconds or more",
      "Signals go on well before the turn and cancel afterward",
      "You stay centered in your lane without drifting or hugging a line",
      "You yield to pedestrians, cyclists, and emergency vehicles without hesitation",
    ],
  },
  {
    title: "6. Automatic fail list",
    blurb: "Any single one of these ends the test on the spot in most states.",
    items: [
      "Examiner has to grab the wheel or use the instructor brake",
      "Running a red light, a stop sign, or a railroad crossing signal",
      "Hitting a curb, a cone, another vehicle, or any object",
      "Failing to yield the right of way and forcing another driver to react",
      "Speeding well over the limit, or driving dangerously slow in traffic",
      "Entering a lane of oncoming traffic or turning into the wrong lane",
      "Any phone contact, or a passenger coaching you during the test",
      "Refusing an instruction or arguing with the examiner",
    ],
  },
  {
    title: "7. Test day routine",
    blurb: "Reduce the number of new things happening on the day itself.",
    items: [
      "Drive the roads around the test office at the same time of day beforehand",
      "Arrive 30 minutes early and use the restroom before check in",
      "Sit in the driver seat and reset seat, mirrors, and belt while you wait",
      "Silence your phone completely and leave it in your bag",
      "Repeat instructions back to the examiner if anything is unclear",
      "Breathe and reset after a mistake instead of replaying it for the next mile",
      "Ask for your score sheet afterward and read every noted error",
    ],
  },
];

const TOTAL = SECTIONS.reduce((n, s) => n + s.items.length, 0);

const FAQ: { q: string; a: string }[] = [
  {
    q: "How long does a DMV road test take?",
    a: "The drive itself usually runs 15 to 20 minutes, plus the vehicle inspection and pre drive safety check. Plan on about an hour at the office from check in to paperwork.",
  },
  {
    q: "What are the most common reasons people fail the road test?",
    a: "Rolling stops, not turning your head to check blind spots, incomplete lane change routines, unsafe speed for conditions, and failing to yield the right of way at intersections.",
  },
  {
    q: "Can I use my own car for the road test?",
    a: "Yes in almost every state, as long as it is registered, insured, and street legal with working lights, mirrors, seat belts, horn, and wipers, and no dashboard warning lights on.",
  },
  {
    q: "How many mistakes are allowed on the road test?",
    a: "Most states allow a limited number of scored errors, often around 15 points, but any critical error such as an intervention by the examiner or running a stop sign ends the test immediately.",
  },
  {
    q: "How should I practice for the road test?",
    a: "Practice each scored maneuver on real roads near your test office, then use a mock permit exam and section quizzes to keep the rules of the road sharp while you build driving hours.",
  },
];

export const Route = createFileRoute("/guides/road-test-checklist")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "DMV Road Test Checklist for New Drivers" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://mydrivable.com/guides/road-test-checklist" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DMV Road Test Checklist for New Drivers" },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://mydrivable.com/guides/road-test-checklist" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to prepare for your DMV road test",
          description: DESCRIPTION,
          url: "https://mydrivable.com/guides/road-test-checklist",
          totalTime: "PT60M",
          step: SECTIONS.map((s) => ({
            "@type": "HowToStep",
            name: s.title.replace(/^\d+\.\s*/, ""),
            text: s.blurb,
            itemListElement: s.items.map((i) => ({ "@type": "HowToDirection", text: i })),
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: RoadTestChecklistGuide,
});

function RoadTestChecklistGuide() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const checked = Object.values(done).filter(Boolean).length;

  const toggle = (key: string) => setDone((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[#1e40af]">Road test guide</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          DMV road test checklist
        </h1>
        <p className="mt-4 text-[#1f2b4d]/70">
          The road test is not a mystery. Examiners work from a score sheet, and almost
          every failure comes from the same short list of habits. Work through these
          seven sections before your appointment, tap each line to tick it off, and take
          the unchecked items into your next practice drive. Rules vary slightly by
          state, so confirm the document and vehicle requirements with your local office.
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
                          ? "border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#1f2b4d]/60 line-through"
                          : "border-[#1e40af]/18 bg-[#1e40af]/[0.045] text-[#1f2b4d]/85 hover:bg-[#1e40af]/[0.08]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] ${
                          on
                            ? "border-[#3b82f6] bg-[#3b82f6] text-[#0f172a]"
                            : "border-[#1e40af]/35 bg-transparent"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      <span>{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">Road test questions</h2>
          <div className="mt-5 space-y-5">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-[#1e40af]/18 bg-[#1e40af]/[0.045] p-5">
                <h3 className="text-base font-semibold">{f.q}</h3>
                <p className="mt-2 text-[#1f2b4d]/70">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[28px] border border-[#3b82f6]/30 bg-[#1e40af]/[0.035] p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            Pass the written test first
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#1f2b4d]/70">
            Drivable gives you a full length mock permit exam for your state, section
            quizzes on signs and right of way, and an AI coach that explains every miss.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth" className={`${BTN_PRIMARY} px-7 py-3.5 text-sm`}>
              Start practicing free
            </Link>
            <Link
              to="/guides/used-car-inspection"
              className="text-sm font-semibold text-[#1e40af] underline-offset-4 hover:underline"
            >
              Buying a car next? Use the inspection checklist
            </Link>
          </div>
        </section>
      </article>
    </MarketingLayout>
  );
}
