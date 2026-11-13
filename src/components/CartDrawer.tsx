"use client";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { WaIcon } from "@/components/Sections";
import { useCart } from "@/context/cart-context";
import { BRAND, isValidPhone, money, WA_DISPLAY, waLink, waNumber } from "@/lib/utils";
import { contactConsentGiven } from "@/lib/consent";

const DELIVERY = [
  "Lusaka delivery",
  "Collect / meet-up in Lusaka",
  "Out of town — courier",
];
const EMPTY_FORM = { name: "", phone: "", area: "", delivery: DELIVERY[0] };
const selectCls = "h-11 w-full rounded-xl border border-line bg-panel-2 px-4 text-sm text-fg outline-none focus:border-gold";

export function CartDrawer() {
  const { items, open, setOpen, inc, dec, remove, clear, subtotal } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);

  const checkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return toast.error("Your bag is empty — add something first");
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!isValidPhone(form.phone)) {
      document.getElementById("bag-phone")?.focus();
      return toast.error("Please enter a valid WhatsApp number, e.g. 097 000 0000");
    }
    const lines = items
      .map((i) => `• ${i.name}${i.variant !== "Standard" ? ` (${i.variant})` : ""} × ${i.qty} — ${money(i.price * i.qty)}`)
      .join("\n");
    const msg = `Hi ${BRAND}! I'd like to order:\n\n${lines}\n\nTotal: ${money(subtotal)}\n\nName: ${form.name}\nNumber: ${form.phone}\nArea: ${form.area || "—"}\nDelivery: ${form.delivery}\n\nPlease confirm availability and payment details. Thank you!`;
    // Fire-and-forget interest log — never blocks or errors the checkout.
    items.forEach((i) =>
      fetch("/api/log-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: i.name,
          variant: i.variant !== "Standard" ? i.variant : "",
          note: `qty ${i.qty}${form.area.trim() ? ` · in ${form.area.trim().replace(/[·\n]/g, ",").slice(0, 40)}` : ""} · ${form.delivery}`,
          ...(contactConsentGiven() && (form.name.trim() || waNumber(form.phone))
            ? { consent: true, contact: { name: form.name.trim().slice(0, 40), phone: waNumber(form.phone).slice(0, 15) } }
            : {}),
        }),
        keepalive: true,
      }).catch(() => {})
    );
    // Open synchronously so mobile browsers don't treat it as a blocked popup.
    window.open(waLink(msg), "_blank");
    clear();
    setForm(EMPTY_FORM);
    setOpen(false);
    toast.success("Order sent to WhatsApp — we'll confirm shortly");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <div className="border-b border-line p-5 pr-14">
          <SheetTitle>Your bag</SheetTitle>
          <SheetDescription>Orders go to our official WhatsApp {WA_DISPLAY}. We confirm availability before payment.</SheetDescription>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!items.length && (
            <div className="flex flex-col items-center gap-3 py-8 text-center text-mist">
              <ShoppingBag className="h-10 w-10 text-accent/60" strokeWidth={1.2} />
              <p>Your bag is empty.</p>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)} asChild><a href="#shop">Browse the shop</a></Button>
            </div>
          )}
          {items.map((i) => (
            <div key={i.key} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-line p-3">
              <div>
                <h4 className="text-sm font-semibold">{i.name}</h4>
                <p className="text-xs text-mist">{i.variant !== "Standard" ? `${i.variant} · ` : ""}{money(i.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button aria-label={`Decrease quantity of ${i.name}`} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line hover:border-gold" onClick={() => dec(i.key)}><Minus className="h-3 w-3" /></button>
                  <span className="min-w-4 text-center text-sm font-bold">{i.qty}</span>
                  <button aria-label={`Increase quantity of ${i.name}`} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line hover:border-gold" onClick={() => inc(i.key)}><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="text-right">
                <strong className="text-sm text-accent-2">{money(i.price * i.qty)}</strong>
                <button className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-semibold text-mist hover:text-red-400" onClick={() => remove(i.key)}><Trash2 className="h-3 w-3" /> Remove</button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={checkout} className="space-y-2 border-t border-line p-5">
          <div className="flex justify-between pb-1 text-base"><span>Total</span><strong className="text-accent-2">{money(subtotal)}</strong></div>
          <p className="text-xs text-mist">Free delivery on orders above K500. Out-of-town courier costs are confirmed on WhatsApp.</p>
          <label className="sr-only" htmlFor="bag-name">Your name</label>
          <Input id="bag-name" required placeholder="Your name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="sr-only" htmlFor="bag-phone">Your WhatsApp number</label>
          <Input id="bag-phone" required type="tel" autoComplete="tel" placeholder="Your number (WhatsApp)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <label className="sr-only" htmlFor="bag-area">Area / town</label>
          <Input id="bag-area" placeholder="Area / town" autoComplete="address-level2" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          <label className="sr-only" htmlFor="bag-delivery">Delivery</label>
          <select id="bag-delivery" value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} className={selectCls}>
            {DELIVERY.map((d) => <option key={d}>{d}</option>)}
          </select>
          <Button type="submit" variant="whatsapp" className="w-full"><WaIcon className="h-4 w-4" /> Send order on WhatsApp</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
