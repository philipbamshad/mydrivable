import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startMetaPixel, META_PIXEL_ID } from "./meta-pixel";

const consent = vi.hoisted(() => ({ granted: false, listener: () => {} }));
vi.mock("@/lib/consent", () => ({
  canTrack: async () => consent.granted,
  readChoice: () => consent.granted ? "granted" : "denied",
  onConsentChange: (listener: () => void) => { consent.listener = listener; return () => {}; },
}));
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
describe("Meta base pixel consent", () => {
  const appendChild = vi.fn();
  beforeEach(() => {
    consent.granted = false;
    appendChild.mockClear();
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { createElement: () => ({}), head: { appendChild } });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("loads nothing and creates no pixel queue without advertising acceptance", async () => {
    const stop = startMetaPixel(); await flush();
    expect(appendChild).not.toHaveBeenCalled(); expect(window.fbq).toBeUndefined(); stop();
  });
  it("loads once after acceptance and sends one PageView for the selected pixel", async () => {
    const stop = startMetaPixel(); consent.granted = true; consent.listener(); await flush();
    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(window.fbq?.queue).toContainEqual(["init", META_PIXEL_ID, {}, { agent: "lovable" }]);
    expect(window.fbq?.queue).toContainEqual(["track", "PageView"]);
    consent.listener(); await flush();
    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(window.fbq?.queue.filter(args => args[0] === "track")).toHaveLength(1); stop();
  });
  it("revokes immediately after withdrawal without replaying PageView on reacceptance", async () => {
    consent.granted = true; const stop = startMetaPixel(); await flush();
    consent.granted = false; consent.listener(); await flush();
    expect(window.fbq?.queue.at(-1)).toEqual(["consent", "revoke"]);
    consent.granted = true; consent.listener(); await flush();
    expect(window.fbq?.queue.at(-1)).toEqual(["consent", "grant"]);
    expect(window.fbq?.queue.filter(args => args[0] === "track")).toHaveLength(1); stop();
  });
  it("does not load after a pending consent check is cancelled", async () => {
    consent.granted = true; const stop = startMetaPixel(); stop(); await flush();
    expect(appendChild).not.toHaveBeenCalled();
  });
});