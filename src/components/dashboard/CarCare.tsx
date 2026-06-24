import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Link as LinkIcon,
  Search,
  AlertCircle,
  Droplet,
  Wrench,
  Gauge,
  Stethoscope,
} from "lucide-react";

const FLAGS = [
  { id: "frame", label: "Frame / structural rust" },
  { id: "title", label: "Salvage or rebuilt title" },
  { id: "accident", label: "Accident history disclosed" },
  { id: "leak", label: "Visible oil / coolant leak" },
  { id: "tires", label: "Tire age > 6 years" },
  { id: "trans", label: "Transmission slipping mention" },
];

export function CarCare() {
  const [url, setUrl] = useState("");
  const [listing, setListing] = useState("");
  const [flagged, setFlagged] = useState<Record<string, boolean>>({
    accident: true,
  });
  const [symptom, setSymptom] = useState("");

  const oilLifePct = 38;
  const oilTone =
    oilLifePct < 25 ? "bg-destructive" : oilLifePct < 50 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Card A — Marketplace Analyzer */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-lg">Marketplace Analyzer</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Drop a listing URL or raw paste. DriveGuide flags risks, costs, and next steps.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Listing URL
            </label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.craigslist.org/..."
                  className="pl-9"
                />
              </div>
              <Button variant="secondary">Fetch</Button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Raw listing text
            </label>
            <Textarea
              rows={7}
              value={listing}
              onChange={(e) => setListing(e.target.value)}
              placeholder="2014 Honda Civic LX, 132k miles, 1 owner, recent timing chain, minor rust on rear quarter..."
              className="mt-1 resize-none bg-background"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Flagged mechanical points
              </span>
              <Badge variant="outline" className="text-[10px]">
                {Object.values(flagged).filter(Boolean).length} flagged
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FLAGS.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 cursor-pointer hover:border-primary/40"
                >
                  <Checkbox
                    checked={!!flagged[f.id]}
                    onCheckedChange={() =>
                      setFlagged((p) => ({ ...p, [f.id]: !p[f.id] }))
                    }
                  />
                  <span className="text-sm">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full font-semibold">
            <AlertCircle className="w-4 h-4" />
            Run structural risk analysis
          </Button>
        </div>
      </Card>

      {/* Card B — Vehicle Health Ledger */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-lg">Vehicle Health Ledger</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          2014 Honda Civic LX · 132,481 mi · You
        </p>

        {/* Oil life */}
        <div className="rounded-lg border border-border bg-background/40 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Oil Life</span>
            </div>
            <span className="font-display font-bold text-xl">{oilLifePct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${oilTone} transition-all`}
              style={{ width: `${oilLifePct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
            <span>Last change: 8,200 mi ago</span>
            <span>Service in ~1,800 mi</span>
          </div>
        </div>

        {/* Maintenance vars */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat icon={<Gauge className="w-3.5 h-3.5" />} label="Brake Pads" value="48% front" tone="warn" />
          <Stat icon={<Wrench className="w-3.5 h-3.5" />} label="Tire Tread" value="6/32 in" tone="ok" />
          <Stat icon={<Gauge className="w-3.5 h-3.5" />} label="Battery" value="3.1 yrs" tone="ok" />
          <Stat icon={<Wrench className="w-3.5 h-3.5" />} label="Coolant" value="Service due" tone="bad" />
        </div>

        {/* Diagnostic query */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Diagnostic query
          </label>
          <div className="flex gap-2 mt-1">
            <Input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder='"Squeal when braking at low speed"'
            />
            <Button variant="secondary">
              <Search className="w-4 h-4" />
              Map
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Maps noises, smells, and warning lights to likely conditions + estimated repair cost.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "ok" | "warn" | "bad";
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "warn"
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-destructive/40 bg-destructive/10";
  const dot =
    tone === "ok" ? "bg-emerald-400" : tone === "warn" ? "bg-amber-400" : "bg-destructive";
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
        <span className={`ml-auto w-1.5 h-1.5 rounded-full ${dot}`} />
      </div>
      <div className="font-semibold text-sm mt-1">{value}</div>
    </div>
  );
}
