import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Search, ShieldCheck, AlertTriangle } from "lucide-react";
import { MarketingLayout, BTN_PRIMARY } from "@/components/marketing/MarketingLayout";

const TITLE = "Free VIN Lookup: Decode Any Car VIN in Seconds | Drivable";
const DESCRIPTION =
  "Paste a 17 character VIN to decode the year, make, model, engine, plant, and safety equipment using the official NHTSA vehicle database. Free, no signup.";

export const Route = createFileRoute("/tools/vin-lookup")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Free VIN Lookup Tool" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mydrivable.com/tools/vin-lookup" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free VIN Lookup Tool" },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://mydrivable.com/tools/vin-lookup" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Drivable VIN Lookup",
          url: "https://mydrivable.com/tools/vin-lookup",
          applicationCategory: "AutomotiveApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: DESCRIPTION,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Where do I find the VIN on a car?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Look at the driver side dashboard through the windshield, on the driver door jamb sticker, and on the vehicle registration, title, and insurance card. All copies should match.",
              },
            },
            {
              "@type": "Question",
              name: "What does a VIN lookup tell you?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Decoding a VIN returns factory build details: model year, make, model, body style, engine, assembly plant, and listed safety equipment such as airbags and electronic stability control. It does not include accident or title history, which comes from a paid vehicle history report or the NMVTIS system.",
              },
            },
            {
              "@type": "Question",
              name: "Is a VIN lookup free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. This tool decodes VINs using the free public NHTSA vPIC database, and NHTSA also publishes free open recall lookups by VIN.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: VinLookupPage,
});

type Row = { label: string; value: string };

const FIELDS: [string, string][] = [
  ["ModelYear", "Model year"],
  ["Make", "Make"],
  ["Model", "Model"],
  ["Trim", "Trim"],
  ["BodyClass", "Body style"],
  ["VehicleType", "Vehicle type"],
  ["DriveType", "Drive type"],
  ["EngineCylinders", "Cylinders"],
  ["DisplacementL", "Displacement (L)"],
  ["FuelTypePrimary", "Fuel type"],
  ["TransmissionStyle", "Transmission"],
  ["Doors", "Doors"],
  ["PlantCity", "Assembly plant city"],
  ["PlantCountry", "Assembly plant country"],
  ["Manufacturer", "Manufacturer"],
  ["AirBagLocFront", "Front airbags"],
  ["AirBagLocSide", "Side airbags"],
  ["AirBagLocCurtain", "Curtain airbags"],
  ["ESC", "Electronic stability control"],
  ["TPMS", "Tire pressure monitoring"],
  ["SeatBeltsAll", "Seat belt type"],
  ["NCSABodyType", "NCSA body type"],
];

function VinLookupPage() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [heading, setHeading] = useState<string>("");

  const clean = vin.trim().toUpperCase();
  const valid = /^[A-HJ-NPR-Z0-9]{17}$/.test(clean);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRows(null);
    if (!valid) {
      setError(
        "Enter a full 17 character VIN. VINs never contain the letters I, O, or Q.",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${clean}?format=json`,
      );
      if (!res.ok) throw new Error("lookup failed");
      const json = (await res.json()) as { Results?: Record<string, string>[] };
      const r = json.Results?.[0];
      if (!r) throw new Error("no results");
      const next = FIELDS.map(([key, label]) => ({
        label,
        value: (r[key] ?? "").trim(),
      })).filter((x) => x.value && x.value !== "Not Applicable");
      if (next.length === 0) {
        setError(
          "That VIN could not be decoded. Double check each character against the door jamb sticker.",
        );
      } else {
        setHeading(
          [r["ModelYear"], r["Make"], r["Model"]].filter(Boolean).join(" ") ||
            clean,
        );
        setRows(next);
      }
    } catch {
      setError("The vehicle database did not respond. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[#1e40af]">Free tool</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          VIN lookup
        </h1>
        <p className="mt-4 text-[#1f2b4d]/70">
          Buying your first car? Decode any 17 character VIN to confirm the factory
          year, make, model, engine, and safety equipment before you hand over money.
          Results come straight from the public NHTSA vPIC vehicle database.
        </p>

        <form onSubmit={lookup} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="vin">
            Vehicle identification number
          </label>
          <input
            id="vin"
            name="vin"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="1HGCM82633A004352"
            autoComplete="off"
            spellCheck={false}
            maxLength={17}
            className="min-h-12 flex-1 rounded-2xl border border-[#1e40af]/25 bg-[#1e40af]/[0.055] px-4 font-mono text-base tracking-[0.14em] text-[#0f172a] placeholder:text-[#1f2b4d]/45 focus:border-[#3b82f6] focus:outline-none"
          />
          <button type="submit" className={`${BTN_PRIMARY} min-h-12 px-6 text-sm`}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Decode VIN
          </button>
        </form>
        <p className="mt-2 text-xs text-[#1f2b4d]/70">
          {clean.length}/17 characters. Letters I, O, and Q are never used in a VIN.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {rows && (
          <section className="mt-8 rounded-[28px] border border-[#1e40af]/18 bg-[#1e40af]/[0.045] p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">{heading}</h2>
            <p className="mt-1 font-mono text-xs tracking-[0.14em] text-[#1f2b4d]/65">
              {clean}
            </p>
            <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="flex items-baseline justify-between gap-4 border-b border-[#1e40af]/12 pb-2"
                >
                  <dt className="text-sm text-[#1f2b4d]/55">{r.label}</dt>
                  <dd className="text-right text-sm font-medium text-[#0f172a]">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs text-[#1f2b4d]/45">
              Build data only. A VIN decode does not show accidents, odometer
              rollbacks, or title brands. Check open recalls free at nhtsa.gov/recalls
              and pull a full history report before you buy.
            </p>
          </section>
        )}

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            Where to find the VIN
          </h2>
          <ul className="mt-4 space-y-3 text-[#1f2b4d]/75">
            <li>Driver side dashboard, visible through the windshield.</li>
            <li>Sticker inside the driver door jamb, with tire and weight ratings.</li>
            <li>Under the hood on the firewall or strut tower on many vehicles.</li>
            <li>Title, registration, and insurance card.</li>
          </ul>
          <p className="mt-4 text-[#1f2b4d]/70">
            Every copy should match. A mismatch, a scratched plate, or a fresh rivet on
            the dash VIN plate is a walk away signal.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            What a VIN does and does not tell you
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#1e40af]/18 bg-[#1e40af]/[0.045] p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-[#1e40af]" /> Included
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#1f2b4d]/70">
                <li>Model year, make, model, trim, body style</li>
                <li>Engine, displacement, fuel, transmission</li>
                <li>Assembly plant and manufacturer</li>
                <li>Factory safety equipment such as airbags and stability control</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#1e40af]/18 bg-[#1e40af]/[0.045] p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-300" /> Not included
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#1f2b4d]/70">
                <li>Accident and repair history</li>
                <li>Salvage, flood, or lemon title brands</li>
                <li>Odometer readings and service records</li>
                <li>Number of previous owners</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-[28px] border border-[#3b82f6]/30 bg-[#1e40af]/[0.035] p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            Next step: pass the test that comes with the car
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#1f2b4d]/70">
            Drivable pairs an AI driving coach with a full length mock permit exam tuned
            to your state, so the license is ready before the keys are.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth" className={`${BTN_PRIMARY} px-7 py-3.5 text-sm`}>
              Start free
            </Link>
            <Link
              to="/guides/used-car-inspection"
              className="text-sm font-semibold text-[#1e40af] underline-offset-4 hover:underline"
            >
              Read the used car inspection checklist
            </Link>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
