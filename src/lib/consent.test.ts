import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { canTrack, readChoice, saveChoices, onConsentChange } from "./consent";

describe("per-purpose consent", () => {
  let storage: Map<string, string>;
  let events: EventTarget;
  beforeEach(() => {
    storage = new Map(); events = new EventTarget();
    vi.stubGlobal("window", {
      consentAskEverywhere: true,
      dispatchEvent: events.dispatchEvent.bind(events),
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
    });
    vi.stubGlobal("navigator", { globalPrivacyControl: false });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("requires an explicit advertising answer for every visitor", async () => {
    expect(await canTrack("advertising")).toBe(false);
    expect(readChoice("advertising")).toBeNull();
  });
  it("analytics acceptance does not grant advertising", async () => {
    saveChoices({ analytics: "granted" });
    expect(await canTrack("analytics")).toBe(true);
    expect(await canTrack("advertising")).toBe(false);
  });
  it("acceptance permits advertising and withdrawal denies it", async () => {
    saveChoices({ advertising: "granted" }); expect(await canTrack("advertising")).toBe(true);
    saveChoices({ advertising: "denied" }); expect(await canTrack("advertising")).toBe(false);
  });
  it("Global Privacy Control overrides stored acceptance", async () => {
    saveChoices({ advertising: "granted" });
    vi.stubGlobal("navigator", { globalPrivacyControl: true });
    expect(await canTrack("advertising")).toBe(false);
  });
  it("notifies other tabs when the advertising choice changes", () => {
    const listener = vi.fn(); const stop = onConsentChange(listener);
    const event = Object.assign(new Event("storage"), { key: "cookie_consent_advertising" });
    events.dispatchEvent(event); expect(listener).toHaveBeenCalledTimes(1); stop();
  });
});