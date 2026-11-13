import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const money = (n: number) => (n > 0 ? "K" + n.toLocaleString("en-ZM") : "Ask for price");
export const BRAND = "The Baron";
export const TAGLINE = "Premium Watches, Gadgets, and Accessories";
export const WA_NUMBER = "260974128784";
export const WA_DISPLAY = "+260 974 128 784";
export const WA_CATALOG = "https://wa.me/c/260974128784";
export const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// Digits-only WhatsApp recipient for wa.me: a local Zambian number like
// 0971234567 becomes 260971234567; already-international input passes through.
export const waNumber = (phone: string) => {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "260" + d.slice(1);
  return d;
};

export const scrollBehavior = (): ScrollBehavior =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

// Accepts local (097…, 97…) or international (+260…) numbers; spaces, dashes and brackets allowed.
export function isValidPhone(raw: string) {
  const s = raw.trim();
  if (!s || /[^\d\s+()-]/.test(s) || s.lastIndexOf("+") > 0) return false;
  const digits = s.replace(/\D/g, "").length;
  return digits >= 9 && digits <= 15;
}
