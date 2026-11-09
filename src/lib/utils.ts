import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const money = (n: number) => "K" + n.toLocaleString("en-ZM");
export const BRAND = "The Baron";
export const TAGLINE = "Premium Watches, Gadgets, and Accessories";
export const WA_NUMBER = "260974128784";
export const WA_DISPLAY = "+260 974 128 784";
export const WA_CATALOG = "https://wa.me/c/260974128784";
export const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

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
