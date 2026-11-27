export const PRO_PASS_PRICE_ID = "pro_pass_lifetime_9";

/** Click handlers may pass an event; only the explicit catalog ID is serializable checkout input. */
export function resolveCheckoutPriceId(value?: unknown): string {
  return value === PRO_PASS_PRICE_ID ? PRO_PASS_PRICE_ID : PRO_PASS_PRICE_ID;
}
