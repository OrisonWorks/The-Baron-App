"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { popupPromo, type Promo } from "@/lib/promo";
import { scrollBehavior } from "@/lib/utils";

const SEEN_KEY = "baronPromoSeen";

// First-visit promo popup: shows POPUP_PROMO_ID once per day per visitor.
export function PromoPopup() {
  const [promo, setPromo] = useState<Promo | null>(null);
  const close = useCallback(() => {
    setPromo((p) => {
      if (p) try { localStorage.setItem(SEEN_KEY, `${p.id}:${new Date().toDateString()}`); } catch {}
      return null;
    });
  }, []);
  useEffect(() => {
    const p = popupPromo();
    if (!p) return;
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === `${p.id}:${new Date().toDateString()}`; } catch {}
    if (!seen) setPromo(p);
  }, []);
  useEffect(() => {
    if (!promo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [promo, close]);
  if (!promo) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={promo.title}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="relative w-[min(560px,94vw)] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
        <button
          type="button"
          aria-label="Close promotion"
          className="absolute right-3 top-3 z-10 rounded-full bg-ink/60 p-2 text-fg transition-colors hover:bg-ink/90"
          onClick={close}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative aspect-[16/10] w-full">
          <Image src={promo.img} alt="" fill sizes="(min-width: 640px) 560px, 94vw" className="object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-gold">
            {promo.badge}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <h2 className="font-display text-xl font-semibold text-fg">{promo.title}</h2>
          <p className="text-sm text-fg-2">{promo.desc}</p>
          <div>
            <Button onClick={() => { close(); document.getElementById("shop")?.scrollIntoView({ behavior: scrollBehavior() }); }}>
              Shop now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
