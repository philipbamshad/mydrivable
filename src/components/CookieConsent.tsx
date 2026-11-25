import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { needsAnswer, onConsentChange, readChoice, saveChoices } from "@/lib/consent";

const OPEN_EVENT = "drivable:cookie-preferences";

export type CookieConsentValue = { analytics: boolean; marketing: boolean; savedAt: string };

/** Any future tracking script must check this before loading. */
export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const analytics = readChoice("analytics");
  const advertising = readChoice("advertising");
  return analytics === null && advertising === null ? null : { analytics: analytics === "granted", marketing: advertising === "granted", savedAt: "" };
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [privacySignal, setPrivacySignal] = useState(false);

  useEffect(() => {
    const sync = () => {
      setPrivacySignal((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true);
      setAnalytics(readChoice("analytics") === "granted");
      setMarketing(readChoice("advertising") === "granted");
      void needsAnswer(["analytics", "advertising"]).then(setShowBanner);
    };
    sync();
    const unsubscribe = onConsentChange(sync);
    const open = () => { sync(); setPrefsOpen(true); };
    window.addEventListener(OPEN_EVENT, open);
    return () => { unsubscribe(); window.removeEventListener(OPEN_EVENT, open); };
  }, []);

  useEffect(() => { if (showBanner) document.getElementById("cookie-consent-panel")?.focus(); }, [showBanner]);

  const save = (a: boolean, m: boolean) => {
    try {
      const history: unknown = JSON.parse(localStorage.getItem("drivable.consent-evidence.v1") ?? "[]");
      localStorage.setItem("drivable.consent-evidence.v1", JSON.stringify([
        ...(Array.isArray(history) ? history : []),
        { at: new Date().toISOString(), notice: "meta-pageview-2026-11-25", analytics: a, advertising: m && !privacySignal, privacySignal },
      ]));
    } catch { /* Consent still applies when browser storage is unavailable. */ }
    saveChoices({ analytics: a ? "granted" : "denied", advertising: m ? "granted" : "denied" });
    setAnalytics(a);
    setMarketing(m);
    setShowBanner(false);
    setPrefsOpen(false);
  };

  return (
    <>
      {showBanner && (
        <div
          id="cookie-consent-panel"
          tabIndex={-1}
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-lg sm:p-5"
        >
          <p className="text-sm leading-relaxed">
            We use essential cookies to keep you signed in and process payments. Optional cookies stay off unless you allow
            them. If you accept, we measure clicks and use advertising cookies to measure page visits from ads. See our <Link to="/privacy" className="font-medium text-primary underline">Privacy Policy</Link>.
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPrefsOpen(true)}>Preferences</Button>
            <Button variant="outline" size="sm" onClick={() => save(false, false)}>Reject all</Button>
            <Button variant="outline" size="sm" onClick={() => save(true, true)}>Accept all</Button>
          </div>
        </div>
      )}
      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cookie preferences</DialogTitle>
            <DialogDescription>Choose which optional cookies Drivable may use.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Row id="c-essential" label="Essential" desc="Sign-in, progress, and secure checkout. Always on." checked disabled />
            {privacySignal && <p className="text-sm text-muted-foreground">Your browser’s privacy signal applies. Optional tracking is off.</p>}
            <Row id="c-analytics" label="Analytics" desc="Provided by Lovable to measure clicks. Page visits are counted without cookies or identifying you." checked={analytics} disabled={privacySignal} onChange={setAnalytics} />
            <Row id="c-marketing" label="Marketing" desc="Provided by Meta to measure page visits from ads. Loads only after you accept." checked={marketing} disabled={privacySignal} onChange={setMarketing} />
          </div>
          <DialogFooter>
            <Button onClick={() => save(analytics, marketing)}>Save preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row(props: { id: string; label: string; desc: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={props.id} className="text-sm">
        <span className="font-medium">{props.label}</span>
        <span className="block text-muted-foreground">{props.desc}</span>
      </label>
      <Switch id={props.id} checked={props.checked} disabled={props.disabled} onCheckedChange={props.onChange} />
    </div>
  );
}
