"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUp, BadgeCheck, MessageCircle, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CAT_ICON } from "@/components/ProductImage";
import { useCart } from "@/context/cart-context";
import { CATEGORIES, type CategoryId, type ClientProduct } from "@/lib/products";
import { BRAND, money, TAGLINE, WA_CATALOG, WA_DISPLAY, waLink } from "@/lib/utils";

export const WaIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function Hero({ onSelect }: { onSelect: (c: CategoryId) => void }) {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <Image src="/hero/fossil-1.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-ink to-transparent" />
      <div className="mx-auto flex min-h-[540px] w-[min(1200px,92%)] flex-col justify-center gap-5 py-16 sm:min-h-[600px]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">Lusaka, Zambia · Order on WhatsApp</p>
        <h1 className="max-w-2xl font-display text-[2rem] font-semibold leading-tight sm:text-6xl">
          <span className="text-gold-gradient">{BRAND}</span><br />
          <span className="text-stone-100">{TAGLINE}</span>
        </h1>
        <p className="max-w-xl text-base text-stone-300 sm:text-lg">
          Fossil, Invicta and Timex down to Naviforce, Curren and Casio — plus phones, audio, accessories, body care and clothing. Pick it here, order it on WhatsApp.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" asChild><a href="#shop">Shop now <ArrowRight /></a></Button>
          <Button size="lg" variant="outline" onClick={() => onSelect("watches")}>Browse watches</Button>
        </div>
      </div>
    </section>
  );
}

export function Categories({ products, onSelect }: { products: ClientProduct[]; onSelect: (c: CategoryId) => void }) {
  return (
    <section id="categories" className="mx-auto w-[min(1200px,92%)] py-14">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Shop by category</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Everything The Baron carries</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = CAT_ICON[c.id];
          const n = products.filter((p) => p.cat === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-line bg-panel p-5 text-left transition-colors hover:border-gold"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-ink"><Icon className="h-5 w-5" /></span>
              <span className="font-semibold text-stone-100">{c.label}</span>
              <span className="text-xs leading-relaxed text-mist">{c.blurb}</span>
              <span className="mt-auto text-xs font-semibold text-gold-light">{n ? `${n} item${n === 1 ? "" : "s"}` : "Landing soon"}</span>
            </button>
          );
        })}
        <a href={WA_CATALOG} target="_blank" rel="noopener noreferrer" className="flex flex-col justify-center gap-2 rounded-2xl border border-dashed border-gold/50 bg-gold/5 p-5 text-left hover:border-gold">
          <WaIcon className="h-7 w-7 text-[#25D366]" />
          <span className="font-semibold">Full WhatsApp catalogue</span>
          <span className="text-xs text-mist">See everything we have posted on WhatsApp.</span>
        </a>
      </div>
    </section>
  );
}

export function HowToOrder() {
  const steps = [
    { icon: ShoppingBag, title: "Add to your bag", text: "Pick the item and option (colour, storage, size) you want." },
    { icon: WaIcon, title: "Send on WhatsApp", text: `Your order opens as a WhatsApp message to ${WA_DISPLAY}.` },
    { icon: Truck, title: "Confirm & receive", text: "We confirm availability, payment and delivery — then it's yours." },
  ];
  return (
    <section id="how" className="border-y border-line bg-panel/60">
      <div className="mx-auto w-[min(1200px,92%)] py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">How to order</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Three steps. No account needed.</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-ink p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 font-display text-gold">{i + 1}</span>
                <s.icon className="h-5 w-5 text-gold-light" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-mist">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function WhyUs() {
  const items = [
    { icon: BadgeCheck, title: "Genuine brands", text: "Fossil, Invicta, Timex, Casio and more — sourced with care." },
    { icon: ShieldCheck, title: "Warranty where it counts", text: "Warranty terms are shown on items that carry one." },
    { icon: Truck, title: "Delivery across Lusaka", text: "Free delivery on orders above K500. Out-of-town by courier." },
    { icon: MessageCircle, title: "A real person on WhatsApp", text: "Questions before you buy? Chat to us directly." },
  ];
  return (
    <section className="mx-auto w-[min(1200px,92%)] py-14">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.title} className="rounded-2xl border border-line bg-panel p-6">
            <i.icon className="mb-3 h-6 w-6 text-gold" />
            <h3 className="font-semibold">{i.title}</h3>
            <p className="mt-1 text-sm text-mist">{i.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="mx-auto w-[min(1200px,92%)] pb-16">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-panel-2 via-panel to-ink p-8 md:grid-cols-[1fr_auto] md:p-12">
        <div>
          <h2 className="font-display text-3xl font-semibold text-gold-gradient">Looking for something specific?</h2>
          <p className="mt-2 max-w-xl text-stone-300">New stock lands often and not everything is online yet. Tell us the brand, model or budget and we&apos;ll check for you.</p>
        </div>
        <Button size="lg" variant="whatsapp" asChild>
          <a href={waLink(`Hi ${BRAND}! I'm looking for `)} target="_blank" rel="noopener noreferrer"><WaIcon /> Chat on WhatsApp</a>
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel/60">
      <div className="mx-auto grid w-[min(1200px,92%)] gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo.jpg" alt="The Baron — Premium Watches, Gadgets, and Accessories" width={842} height={600} className="h-auto w-56" />
          <p className="mt-3 max-w-sm text-sm text-mist">Premium accessories delivered to your door. Order via WhatsApp for a personal experience.</p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">Shop</h4>
          <ul className="space-y-2 text-sm text-stone-300">
            {CATEGORIES.map((c) => <li key={c.id}><a className="hover:text-gold-light" href={`?cat=${c.id}#shop`}>{c.label}</a></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">Contact</h4>
          <ul className="space-y-2 text-sm text-stone-300">
            <li><a className="hover:text-gold-light" href={waLink(`Hi ${BRAND}!`)} target="_blank" rel="noopener noreferrer">WhatsApp {WA_DISPLAY}</a></li>
            <li><a className="hover:text-gold-light" href={WA_CATALOG} target="_blank" rel="noopener noreferrer">WhatsApp catalogue</a></li>
            <li>Lusaka, Zambia</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-mist">© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
    </footer>
  );
}

// Mobile: a sticky bar with the bag total once something is in it; otherwise a
// WhatsApp chat button. Desktop always gets the chat button.
export function FloatingActions() {
  const { count, subtotal, setOpen } = useCart();
  const [top, setTop] = useState(false);
  useEffect(() => {
    const on = () => setTop(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 p-3 backdrop-blur md:hidden">
          <Button className="w-full" onClick={() => setOpen(true)}>
            <ShoppingBag /> View bag · {count} item{count === 1 ? "" : "s"} · {money(subtotal)}
          </Button>
        </div>
      )}
      <div className={`fixed right-4 z-30 flex flex-col items-end gap-2 ${count > 0 ? "bottom-20 md:bottom-6" : "bottom-6"}`}>
        {top && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-panel text-stone-200 hover:border-gold">
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
        <a
          href={waLink(`Hello ${BRAND}, I'd like to enquire about your products.`)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-[#06210f] shadow-lg shadow-black/40"
        >
          <WaIcon className="h-6 w-6" />
          <span className="hidden text-xs font-bold uppercase tracking-wider sm:inline">Chat with us</span>
        </a>
      </div>
    </>
  );
}
