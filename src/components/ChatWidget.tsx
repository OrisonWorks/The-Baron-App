"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CAT_LABEL, type CategoryId, type ClientProduct, type ClientVariant } from "@/lib/products";
import { BRAND, money, WA_CATALOG, WA_DISPLAY, waLink } from "@/lib/utils";

type Action = { label: string; href: string } | { label: string; product: ClientProduct };
type Msg = { from: "bot" | "user"; text: string; actions?: Action[] };
type Reply = Omit<Msg, "from">;

const WA_QUESTION = waLink(`Hi ${BRAND}! I have a question about your products.`);
const WA_ORDER = waLink(`Hi ${BRAND}! I'd like to place an order.`);
const askAbout = (p: ClientProduct, v?: string) =>
  waLink(`Hi ${BRAND}! Is the ${p.name}${v ? ` (${v})` : ""} available?`);

// Brands Aaron stocks or plans to; a mention with nothing listed still gets a useful answer.
const KNOWN_BRANDS = ["fossil", "invicta", "timex", "naviforce", "curren", "casio", "samsung", "iphone", "apple", "tecno", "infinix", "itel", "jbl", "oraimo", "anker", "sony", "nivea"];

// Checked in order: "phone cover" is an accessory, "dress watch" is a watch.
const CAT_PATTERNS: [CategoryId, RegExp][] = [
  ["accessories", /\b(chargers?|cables?|covers?|cases?|power ?banks?|adapters?|accessor\w*)\b/],
  ["earphones", /earphone|earbud|airpod|in-ear|\bbuds\b/],
  ["headphones", /headphone|headset|over-ear/],
  ["watches", /watch/],
  ["body-care", /lotion|serum|body ?wash|face ?mask|skin|body ?care|cream|oil|scrub|perfume|fragrance/],
  ["clothing", /cloth|shirt|hoodie|jacket|trouser|jeans|dress|shorts|cap\b|wear/],
  ["phones", /\bphones?\b|smartphone|android/],
];

// Words that describe a whole category or the question itself, not one product.
const FILLER = new Set([
  "the", "and", "for", "you", "have", "any", "with", "this", "that", "your", "what", "how", "much", "price", "cost",
  "available", "stock", "still", "left", "want", "need", "show", "looking", "got", "there", "some", "one", "can",
  "watch", "watches", "phone", "phones", "men", "mens", "women", "ladies", "classic", "premium", "affordable",
]);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
const words = (s: string) => norm(s).split(/\s+/).filter((w) => w.length >= 3 && !FILLER.has(w));
const near = (a: string, b: string) => a.startsWith(b) || b.startsWith(a);

// Products tied on the most query words; a single winner is a confident match.
function matchProducts(q: string, products: ClientProduct[]) {
  const qw = words(q);
  const scored = products.map((p) => {
    const pw = words(`${p.name} ${p.brand} ${p.variants.map((v) => v.label).join(" ")}`);
    return { p, score: new Set(pw.filter((w) => qw.some((x) => near(w, x)))).size };
  });
  const best = Math.max(0, ...scored.map((s) => s.score));
  return best > 0 ? scored.filter((s) => s.score === best).map((s) => s.p) : [];
}

function matchVariant(q: string, p: ClientProduct): ClientVariant | null {
  if (p.variants.length < 2) return null;
  const qw = words(q);
  const hits = p.variants.filter((v) => words(v.label).some((w) => qw.some((x) => near(w, x))));
  return hits.length === 1 ? hits[0] : null;
}

const availability = (v: ClientVariant) => (v.flag === "low" ? "only a few left" : "in stock");
const priceText = (p: ClientProduct) => (p.minPrice === p.maxPrice ? money(p.minPrice) : `from ${money(p.minPrice)}`);
const listLine = (ps: ClientProduct[]) =>
  ps.slice(0, 4).map((p) => `${p.name} (${priceText(p)})`).join(", ") + (ps.length > 4 ? ` and ${ps.length - 4} more` : "");
const viewActions = (ps: ClientProduct[]): Action[] => ps.slice(0, 3).map((p) => ({ label: `View ${p.name}`, product: p }));

function productReply(p: ClientProduct, q: string): Reply {
  const v = matchVariant(q, p);
  if (v)
    return {
      text: `${p.name} in ${v.label}: ${availability(v)} at ${money(v.price)}.`,
      actions: [{ label: "View & add to bag", product: p }, { label: "Ask on WhatsApp", href: askAbout(p, v.label) }],
    };
  const only = p.variants.length === 1 ? p.variants[0].label : null;
  const opts = p.variants.length > 1
    ? ` Options: ${p.variants.map((x) => `${x.label} (${money(x.price)}${x.flag === "low" ? ", few left" : ""})`).join(", ")}.`
    : "";
  const extra = [p.condition, p.warranty && `warranty: ${p.warranty}`].filter(Boolean).join(" · ");
  return {
    text: `Yes — ${p.name}${p.brand && !p.name.toLowerCase().includes(p.brand.toLowerCase()) ? ` by ${p.brand}` : ""} is available${only && only !== "Standard" ? ` in ${only}` : ""}, ${priceText(p)}.${opts}${p.lowStock ? " Only a few left." : ""}${extra ? ` (${extra})` : ""}`,
    actions: [{ label: "View & add to bag", product: p }, { label: "Ask on WhatsApp", href: askAbout(p) }],
  };
}

export function reply(raw: string, products: ClientProduct[]): Reply {
  const q = raw.toLowerCase();
  const cat = CAT_PATTERNS.find(([, re]) => re.test(q))?.[0] ?? null;
  const inCat = cat ? products.filter((p) => p.cat === cat) : products;
  const range = /premium|luxury|high.?end/.test(q) ? "Premium" : /affordable|cheap|budget|low.?cost/.test(q) ? "Affordable" : null;

  // Budget: "watches under K2000", "phone below 3,000"
  const budget = /(?:under|below|less than|max(?:imum)?|budget(?: of)?|up to)\s*k?\s*(\d[\d,]*)/.exec(q);
  if (budget) {
    const limit = parseInt(budget[1].replace(/,/g, ""), 10);
    const fits = inCat.filter((p) => p.minPrice <= limit).sort((a, b) => a.minPrice - b.minPrice);
    return fits.length
      ? { text: `${fits.length} option${fits.length === 1 ? "" : "s"} at ${money(limit)} or less: ${listLine(fits)}.`, actions: viewActions(fits) }
      : { text: `Nothing listed at ${money(limit)} or less${cat ? ` in ${CAT_LABEL[cat]}` : ""} right now — ask on WhatsApp, new stock comes in often.`, actions: [{ label: "Ask on WhatsApp", href: WA_QUESTION }] };
  }

  const matches = matchProducts(q, inCat.length ? inCat : products);
  if (matches.length === 1) return productReply(matches[0], q);

  const brand = KNOWN_BRANDS.find((b) => new RegExp(`\\b${b}\\b`).test(q))
    ?? [...new Set(products.map((p) => p.brand.toLowerCase()).filter(Boolean))].find((b) => q.includes(b));
  if (brand) {
    const ofBrand = products.filter((p) => p.brand.toLowerCase() === brand || p.name.toLowerCase().includes(brand));
    const label = brand[0].toUpperCase() + brand.slice(1);
    return ofBrand.length
      ? { text: `${label} on the shop right now: ${listLine(ofBrand)}.`, actions: viewActions(ofBrand) }
      : { text: `No ${label} listed on the site at the moment — ask on WhatsApp and we'll check what's in.`, actions: [{ label: `Ask about ${label}`, href: waLink(`Hi ${BRAND}! Do you have any ${label} in stock?`) }] };
  }

  if (matches.length > 1 && matches.length < inCat.length)
    return { text: `We have a few like that — which one? ${listLine(matches)}.`, actions: viewActions(matches) };

  if (/pay|airtel|mtn|zamtel|mobile money|momo|cash|card|deposit/.test(q))
    return { text: "Once we confirm your order on WhatsApp, we send the payment details there. Nothing is paid on this website.", actions: [{ label: "Ask on WhatsApp", href: WA_QUESTION }] };
  if (/deliver|delivery|ship|courier|kitwe|ndola|livingstone|copperbelt|out of town|collect|pick ?up/.test(q))
    return { text: "We deliver across Lusaka — free on orders above K500. Out of town goes by courier. Pick your delivery option in the bag and we confirm the details on WhatsApp.", actions: [{ label: "Ask about delivery", href: WA_QUESTION }] };
  if (/warrant|guarantee|original|genuine|fake|authentic|condition/.test(q))
    return { text: "Each product shows its condition and any warranty in its details. Want to double-check a specific item? Ask on WhatsApp.", actions: [{ label: "Ask on WhatsApp", href: WA_QUESTION }] };
  if (/refund|return|exchange|swap|wrong|broken/.test(q))
    return { text: "For returns or exchanges, message us on WhatsApp with your order details and we'll sort it out.", actions: [{ label: "WhatsApp us", href: WA_QUESTION }] };
  if (/whatsapp|contact|call|number|talk|human|person|agent|phone you/.test(q))
    return { text: `Our WhatsApp is ${WA_DISPLAY} — a real person replies there.`, actions: [{ label: "Open WhatsApp", href: WA_QUESTION }] };
  if (cat || range) {
    const ps = range ? inCat.filter((p) => p.type === range) : inCat;
    const label = [range, cat ? CAT_LABEL[cat] : "items"].filter(Boolean).join(" ").toLowerCase();
    return ps.length
      ? { text: `${label[0].toUpperCase() + label.slice(1)} on the shop: ${listLine(ps)}.`, actions: [...viewActions(ps.slice(0, 2)), { label: "Full WhatsApp catalogue", href: WA_CATALOG }] }
      : { text: `New ${label} are landing soon. Ask on WhatsApp for what's in right now.`, actions: [{ label: "Ask on WhatsApp", href: waLink(`Hi ${BRAND}! What ${label} do you have right now?`) }] };
  }

  if (/order|buy|purchase|checkout|how/.test(q))
    return { text: "1) Add items to your bag and pick the option (colour, storage, size). 2) Tap Order on WhatsApp — your order opens as a message to us. 3) We confirm availability, payment and delivery.", actions: [{ label: "Start my order", href: WA_ORDER }] };
  if (/where|address|location|lusaka|shop|hour|open|close/.test(q))
    return { text: `We're in Lusaka, Zambia, and take orders on WhatsApp ${WA_DISPLAY}. Message us for collection and delivery times.`, actions: [{ label: "Open WhatsApp", href: WA_QUESTION }] };
  if (/\b(hi|hello|hey|morning|afternoon|evening|good)\b/.test(q))
    return { text: "Hello! Ask me about a product, a brand, a budget (e.g. 'watches under K2000'), delivery or how to order." };
  if (/thank|great|perfect|nice|cool/.test(q))
    return { text: "Happy to help! Anything else?", actions: [{ label: "Order on WhatsApp", href: WA_ORDER }] };
  return { text: "I'm best with products, prices, delivery and ordering — for anything else, our WhatsApp has you covered.", actions: [{ label: "Chat on WhatsApp", href: WA_QUESTION }] };
}

const QUICK = ["Show me watches", "Watches under K2000", "How do I order?", "Delivery"];
const actionCls = "block rounded-lg px-3 py-1.5 text-center text-xs font-bold";

export function ChatWidget({ products, onView }: { products: ClientProduct[]; onView: (p: ClientProduct) => void }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: `Hi! I'm ${BRAND}'s helper. Ask me about a product, a brand, prices, delivery or how to order.` },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open]);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "user", text: t }, { from: "bot", ...reply(t, products) }]);
    setInput("");
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={`${BRAND} helper`}
          className={`fixed right-3 z-40 flex h-[min(480px,65vh)] w-[min(350px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-black/60 md:bottom-36 md:right-5 ${count > 0 ? "bottom-48" : "bottom-36"}`}
        >
          <div className="flex items-center gap-2 border-b border-line bg-ink px-4 py-3">
            <MessageCircle className="h-4 w-4 text-gold" />
            <span className="font-display text-sm font-semibold tracking-wider text-gold-light">{BRAND} helper</span>
            <button onClick={() => setOpen(false)} className="ml-auto cursor-pointer rounded-lg p-1 text-stone-300 hover:bg-white/10" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "bot" ? "pr-6" : "pl-8"}>
                <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.from === "bot" ? "rounded-tl-sm bg-panel-2 text-stone-200" : "rounded-tr-sm bg-gold text-ink"}`}>
                  {m.text}
                  {m.actions && (
                    <div className="mt-2 space-y-1.5">
                      {m.actions.map((a) =>
                        "href" in a ? (
                          <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={`${actionCls} bg-[#25D366] text-[#06210f] hover:brightness-110`}>
                            {a.label}
                          </a>
                        ) : (
                          <button key={a.label} onClick={() => { setOpen(false); onView(a.product); }} className={`${actionCls} w-full cursor-pointer border border-gold/60 text-gold-light hover:bg-gold/10`}>
                            {a.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line p-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK.map((chip) => (
                <button key={chip} onClick={() => send(chip)} className="cursor-pointer rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-gold-light hover:border-gold">
                  {chip}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label={`Message ${BRAND}'s helper`}
                placeholder="Ask about a product, brand, delivery…"
                className="h-10 flex-1 rounded-xl border border-line bg-panel-2 px-3 text-sm text-stone-100 outline-none focus:border-gold"
              />
              <button type="submit" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-gold text-ink hover:bg-gold-light" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : `Chat with ${BRAND} helper`}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gold/60 bg-ink text-gold shadow-lg shadow-black/40 hover:bg-panel"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
