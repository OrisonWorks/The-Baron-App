"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { scrollBehavior, WA_DISPLAY } from "@/lib/utils";

export function Header({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const { count, setOpen } = useCart();
  const { theme, toggle } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const links = [["Shop", "#shop"], ["Categories", "#categories"], ["How to order", "#how"], ["Contact", "#contact"]] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark px-4 py-1.5 text-center text-[12px] font-semibold text-on-gold">
        Free delivery on orders above K500 · Order on WhatsApp {WA_DISPLAY}
      </div>
      <nav className="relative mx-auto flex w-[min(1200px,92%)] items-center gap-1.5 py-3 sm:gap-4">
        <a href="#top" className="flex shrink-0 items-center gap-1.5 sm:gap-2.5" aria-label="The Baron — home">
          <Image src="/brand/crest.png" alt="" width={512} height={512} priority className="h-8 w-8 rounded-lg min-[380px]:h-9 min-[380px]:w-9 sm:h-10 sm:w-10" />
          <span className="hidden whitespace-nowrap font-display text-base font-semibold text-gold-gradient min-[340px]:inline min-[380px]:text-lg sm:text-2xl">The Baron</span>
        </a>
        <ul className={`gap-7 text-sm font-medium md:ml-auto md:flex ${menu ? "absolute inset-x-0 top-full z-50 flex flex-col border-b border-line bg-ink p-5" : "hidden"}`}>
          {links.map(([label, href]) => (
            <li key={href}><a className="text-fg-2 hover:text-accent-2" href={href} onClick={() => setMenu(false)}>{label}</a></li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"}>
            <Moon className="dark:hidden" /><Sun className="hidden dark:block" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={() => setShowSearch(!showSearch)} aria-label="Search" aria-expanded={showSearch}><Search /></Button>
          <Button variant="outline" className="h-9 px-2.5 sm:h-10 sm:px-4" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} items`}>
            <ShoppingBag /> <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-on-gold">{count}</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>{menu ? <X /> : <Menu />}</Button>
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
              if (v && !search) document.getElementById("shop")?.scrollIntoView({ behavior: scrollBehavior() });
              setSearch(v);
            }}
            className="rounded-full"
          />
        </div>
      )}
    </header>
  );
}
