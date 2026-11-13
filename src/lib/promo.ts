// Promo cards + first-visit popup. Aaron edits this list: `enabled: false`
// hides a card everywhere; POPUP_PROMO_ID picks which promo becomes the popup
// (set to "" to disable the popup). Images live in /public.
export interface Promo {
  id: string;
  title: string;
  desc: string;
  img: string;
  badge: string;   // corner ribbon text, e.g. "Deal", "New"
  href?: string;   // CTA target, defaults to "#shop"
  enabled?: boolean;
}

export const PROMOS: Promo[] = [
  {
    id: "premium-watches",
    title: "Fossil · Invicta · Timex — authentic premium",
    desc: "Genuine premium watches are in. Ask for today's best price on WhatsApp.",
    img: "/catalog/invicta-pro-diver-sapphire.jpg",
    badge: "Premium",
    href: "#shop",
    enabled: true,
  },
  {
    id: "jbl-audio",
    title: "JBL headphones & speakers",
    desc: "Wired, wireless and noise-cancelling — from K1,295. Free delivery on orders above K500.",
    img: "/catalog/jbl-tune-680nc-headphones.jpg",
    badge: "Deal",
    href: "#shop",
    enabled: true,
  },
];

export const POPUP_PROMO_ID = "premium-watches";

export function popupPromo(): Promo | null {
  return PROMOS.find((p) => p.id === POPUP_PROMO_ID && p.enabled !== false) ?? null;
}
