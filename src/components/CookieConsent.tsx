import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const KEY = "drivable_cookie_consent_v1";
const OPEN_EVENT = "drivable:cookie-preferences";

export type CookieConsentValue = { analytics: boolean; marketing: boolean; savedAt: string };

/** Any future tracking script must check this before loading. */
export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CookieConsentValue) : null;
  } catch {
    return null;
  }
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) setShowBanner(true);
    else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
    const open = () => setPrefsOpen(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const save = (a: boolean, m: boolean) => {
    localStorage.setItem(KEY, JSON.stringify({ analytics: a, marketing: m, savedAt: new Date().toISOString() }));
    setAnalytics(a);
    setMarketing(m);
    setShowBanner(false);
    setPrefsOpen(false);
  };

  return (
    <>
      {showBanner && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-lg sm:p-5"
        >
          <p className="text-sm leading-relaxed">
            We use essential cookies to keep you signed in and process payments. Optional cookies stay off unless you allow
            them. See our <Link to="/cookies" className="font-medium text-primary underline">Cookie Policy</Link>.
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPrefsOpen(true)}>Preferences</Button>
            <Button variant="outline" size="sm" onClick={() => save(false, false)}>Reject optional</Button>
            <Button size="sm" onClick={() => save(true, true)}>Accept all</Button>
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
            <Row id="c-analytics" label="Analytics" desc="Helps us understand usage. Not currently used." checked={analytics} onChange={setAnalytics} />
            <Row id="c-marketing" label="Marketing" desc="Advertising. Not currently used." checked={marketing} onChange={setMarketing} />
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
