"use client";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { WaIcon } from "@/components/Sections";
import { CAT_LABEL, CATEGORIES, type CategoryId, type ClientProduct } from "@/lib/products";
import { BRAND, cn, waLink } from "@/lib/utils";

export type CatFilter = "all" | CategoryId;
export interface ShopState {
  cat: CatFilter; brand: string | null; type: string | null; gender: string | null; sort: string;
}

// Fold case and punctuation so "i phone" matches "iPhone" and multi-word
// queries match across word boundaries.
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b));

function Chips({ label, values, value, onChange }: { label: string; values: string[]; value: string | null; onChange: (v: string | null) => void }) {
  if (values.length < 2) return null;
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-mist">{label}</span>
      {values.map((v) => (
        <button
          key={v}
          onClick={() => onChange(value === v ? null : v)}
          aria-pressed={value === v}
          className={cn("shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold", value === v ? "border-gold bg-gold text-on-gold" : "border-line text-fg-2 hover:border-gold")}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export function Shop({ products, state, setState, search, onQuick }: {
  products: ClientProduct[]; state: ShopState; setState: (s: Partial<ShopState>) => void;
  search: string; onQuick: (p: ClientProduct) => void;
}) {
  const inCat = useMemo(() => products.filter((p) => state.cat === "all" || p.cat === state.cat), [products, state.cat]);
  const brands = useMemo(() => uniq(inCat.map((p) => p.brand)), [inCat]);
  const types = useMemo(() => uniq(inCat.map((p) => p.type)), [inCat]);
  const genders = useMemo(() => uniq(inCat.map((p) => p.gender)), [inCat]);

  const list = useMemo(() => {
    const q = norm(search);
    const out = inCat.filter((p) =>
      (!state.brand || p.brand === state.brand) &&
      (!state.type || p.type === state.type) &&
      (!state.gender || p.gender === state.gender || p.gender === "Unisex") &&
      (!q || norm(`${p.name} ${p.brand} ${p.type} ${CAT_LABEL[p.cat]} ${p.desc} ${p.variants.map((v) => v.label).join(" ")}`).includes(q))
    );
    if (state.sort === "low") out.sort((a, b) => a.minPrice - b.minPrice);
    if (state.sort === "high") out.sort((a, b) => b.maxPrice - a.maxPrice);
    if (state.sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [inCat, state, search]);

  const tabs: { id: CatFilter; label: string }[] = [{ id: "all", label: "All" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))];
  const catLabel = state.cat === "all" ? "products" : CAT_LABEL[state.cat].toLowerCase();

  return (
    <section id="shop" className="mx-auto w-[min(1200px,92%)] scroll-mt-28 py-14">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">The shop</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Shop {BRAND}</h2>
        <p className="mt-2 text-mist">Tap any item for options and details, then send your bag on WhatsApp.</p>
      </div>
      <div role="tablist" aria-label="Categories" className="-mx-[4vw] mb-4 flex gap-2 overflow-x-auto px-[4vw] pb-1 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={state.cat === t.id}
            onClick={() => setState({ cat: t.id, brand: null, type: null, gender: null })}
            className={cn("shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold", state.cat === t.id ? "border-gold bg-gold text-on-gold" : "border-line bg-panel text-fg hover:border-gold")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <Chips label="Brand" values={brands} value={state.brand} onChange={(brand) => setState({ brand })} />
          <Chips label="Range" values={types} value={state.type} onChange={(type) => setState({ type })} />
          <Chips label="For" values={genders.filter((g) => g !== "Unisex")} value={state.gender} onChange={(gender) => setState({ gender })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-mist">
          <span className="sr-only">Sort</span>
          <select value={state.sort} onChange={(e) => setState({ sort: e.target.value })} className="h-10 rounded-full border border-line bg-panel px-4 text-sm text-fg outline-none focus:border-gold">
            <option value="featured">Sort: Featured</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>
      {list.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-semibold">{inCat.length === 0 ? `New ${catLabel} landing soon` : "Nothing matches that search"}</p>
          <p className="text-sm text-mist">
            {inCat.length === 0 ? "We're adding this section now. Ask us on WhatsApp what's in stock today." : "Try another keyword or clear a filter."}
          </p>
          {inCat.length === 0 ? (
            <Button variant="whatsapp" asChild>
              <a href={waLink(`Hi ${BRAND}! What ${catLabel} do you have in stock?`)} target="_blank" rel="noopener noreferrer"><WaIcon className="h-4 w-4" /> Ask on WhatsApp</a>
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setState({ brand: null, type: null, gender: null })}>Clear filters</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} onQuick={onQuick} />)}
        </div>
      )}
    </section>
  );
}
