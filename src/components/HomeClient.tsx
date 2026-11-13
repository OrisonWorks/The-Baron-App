"use client";
import { useCallback, useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { ChatWidget } from "@/components/ChatWidget";
import { Header } from "@/components/Header";
import { QuickView } from "@/components/QuickView";
import { PromoPopup } from "@/components/PromoPopup";
import { Categories, Contact, FloatingActions, Footer, Hero, HowToOrder, Newsletter, Promos, WhyUs } from "@/components/Sections";
import { ConsentBanner } from "@/components/ConsentBanner";
import { Shop, type ShopState } from "@/components/Shop";
import { CATEGORIES, type CategoryId, type ClientProduct } from "@/lib/products";
import { scrollBehavior } from "@/lib/utils";

const SORTS = ["featured", "low", "high", "name"];

export function HomeClient({ products }: { products: ClientProduct[] }) {
  const [state, setStateRaw] = useState<ShopState>({ cat: "all", brand: null, type: null, gender: null, sort: "featured" });
  const [search, setSearch] = useState("");
  const [quick, setQuick] = useState<ClientProduct | null>(null);
  const setState = useCallback((s: Partial<ShopState>) => setStateRaw((prev) => ({ ...prev, ...s })), []);

  const goCat = useCallback((cat: CategoryId) => {
    setState({ cat, brand: null, type: null, gender: null });
    document.getElementById("shop")?.scrollIntoView({ behavior: scrollBehavior() });
  }, [setState]);

  // Deep-link shop state: ?cat / ?brand / ?sort / ?q survive refresh and can be shared.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const cat = q.get("cat");
    const next: Partial<ShopState> = {};
    if (cat && CATEGORIES.some((c) => c.id === cat)) next.cat = cat as CategoryId;
    if (q.get("brand")) next.brand = q.get("brand");
    if (SORTS.includes(q.get("sort") || "")) next.sort = q.get("sort")!;
    setState(next);
    if (q.get("q")) setSearch(q.get("q")!);
  }, [setState]);
  useEffect(() => {
    const url = new URL(window.location.href);
    const set = (k: string, v: string | null) => (v === null ? url.searchParams.delete(k) : url.searchParams.set(k, v));
    set("cat", state.cat === "all" ? null : state.cat);
    set("brand", state.brand);
    set("sort", state.sort === "featured" ? null : state.sort);
    set("q", search || null);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [state, search]);

  return (
    <>
      <Header search={search} setSearch={setSearch} />
      <main id="main" tabIndex={-1}>
        <Hero onSelect={goCat} />
        <Categories products={products} onSelect={goCat} />
        <Promos />
        <Shop products={products} state={state} setState={setState} search={search} onQuick={setQuick} />
        <HowToOrder />
        <WhyUs />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
      <QuickView product={quick} onClose={() => setQuick(null)} />
      <ConsentBanner />
      <PromoPopup />
      <CartDrawer />
      <FloatingActions chat={<ChatWidget products={products} onView={setQuick} />} />
    </>
  );
}
