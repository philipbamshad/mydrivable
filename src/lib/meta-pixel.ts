import { canTrack, onConsentChange, readChoice } from "@/lib/consent";

export const META_PIXEL_ID = "1497377462266152";
type Pixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: Pixel;
  loaded: boolean;
  version: string;
};
declare global {
  interface Window { fbq?: Pixel; _fbq?: Pixel; }
}

/** No SDK, queue, or fallback image exists until advertising permission is explicit. */
let ready = false;
let lastPage: string | null = null;

/** Sends a standard event only after consent loaded the pixel; never pass personal data. */
export function trackMetaEvent(name: string, params?: Record<string, string | number>, eventId?: string) {
  if (!ready || !window.fbq || readChoice("advertising") !== "granted") return false;
  if (eventId) window.fbq("track", name, params ?? {}, { eventID: eventId });
  else if (params) window.fbq("track", name, params);
  else window.fbq("track", name);
  return true;
}

/** One PageView per distinct page path, including client-side navigation. */
export function trackMetaPageView(path: string) {
  if (path === lastPage) return;
  if (trackMetaEvent("PageView")) lastPage = path;
}

export function startMetaPixel() {
  let active = true;
  let initialized = false;
  const sync = async () => {
    const permitted = await canTrack("advertising");
    if (!active) return;
    if (!permitted || readChoice("advertising") !== "granted") {
      window.fbq?.("consent", "revoke");
      ready = false;
      return;
    }
    if (!window.fbq) {
      const pixel: Pixel = Object.assign(function (...args: unknown[]) {
        if (pixel.callMethod) pixel.callMethod.apply(pixel, args);
        else pixel.queue.push(args);
      }, { queue: [] as unknown[][], loaded: true, version: "2.0" });
      pixel.push = pixel;
      window.fbq = pixel;
      window._fbq ??= pixel;
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.defer = true;
      document.head.appendChild(script);
    }
    window.fbq("consent", "grant");
    if (!initialized) {
      window.fbq("set", "autoConfig", false, META_PIXEL_ID);
      window.fbq("init", META_PIXEL_ID, {}, { agent: "lovable" });
      initialized = true;
    }
    ready = true;
    trackMetaPageView(window.location.pathname);
  };
  void sync();
  const unsubscribe = onConsentChange(() => { void sync(); });
  return () => { active = false; unsubscribe(); };
}