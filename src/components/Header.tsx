"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { WA_DISPLAY } from "@/lib/utils";

export function Header({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const { count, setOpen } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const links = [["Shop", "#shop"], ["Categories", "#categories"], ["How to order", "#how"], ["Contact", "#contact"]] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark px-4 py-1.5 text-center text-[12px] font-semibold text-ink">
        Free delivery on orders above K500 · Order on WhatsApp {WA_DISPLAY}
      </div>
      <nav className="relative mx-auto flex w-[min(1200px,92%)] items-center gap-4 py-3">
        <a href="#top" className="flex items-center gap-2.5" aria-label="The Baron — home">
          <Image src="/brand/crest.png" alt="" width={512} height={512} priority className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="whitespace-nowrap font-display text-lg font-semibold text-gold-gradient sm:text-2xl">The Baron</span>
        </a>
        <ul className={`gap-7 text-sm font-medium md:ml-auto md:flex ${menu ? "absolute inset-x-0 top-full z-50 flex flex-col border-b border-line bg-ink p-5" : "hidden"}`}>
          {links.map(([label, href]) => (
            <li key={href}><a className="text-stone-300 hover:text-gold-light" href={href} onClick={() => setMenu(false)}>{label}</a></li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button variant="outline" size="icon" onClick={() => setShowSearch(!showSearch)} aria-label="Search" aria-expanded={showSearch}><Search /></Button>
          <Button variant="outline" className="px-4" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} items`}>
            <ShoppingBag /> <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">{count}</span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>{menu ? <X /> : <Menu />}</Button>
        </div>
      </nav>
      {showSearch && (
        <div className="mx-auto w-[min(1200px,92%)] pb-3">
          <Input
            autoFocus
            aria-label="Search products"
            type="search"
            placeholder="Search… e.g. Fossil, iPhone, charger, lotion"
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              if (v && !search) document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              setSearch(v);
            }}
            className="rounded-full"
          />
        </div>
      )}
    </header>
  );
}
