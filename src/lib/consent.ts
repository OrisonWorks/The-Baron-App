// Checkout-contact consent: the storefront has no tracking cookies, so the
// only thing needing consent is storing the name + WhatsApp number a client
// types at checkout (for order follow-up). Stored as a localStorage flag —
// "yes" lets the interest log carry the contact, anything else (incl.
// unanswered) keeps taps anonymous.
export const BARON_CONSENT_KEY = "baron-consent";

export function contactConsentGiven(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(BARON_CONSENT_KEY) === "yes";
  } catch {
    return false;
  }
}
