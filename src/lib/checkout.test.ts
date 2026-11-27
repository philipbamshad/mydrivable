import { expect, it } from "vitest";
import { PRO_PASS_PRICE_ID, resolveCheckoutPriceId } from "./checkout";

it("always sends the $24 one-time catalog string, never a button click event", () => {
  expect(resolveCheckoutPriceId({ type: "click" })).toBe(PRO_PASS_PRICE_ID);
  expect(resolveCheckoutPriceId(undefined)).toBe(PRO_PASS_PRICE_ID);
  expect(resolveCheckoutPriceId(PRO_PASS_PRICE_ID)).toBe("pro_pass_lifetime_9");
});
