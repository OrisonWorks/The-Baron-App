"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ClientProduct } from "@/lib/products";

export interface CartItem {
  key: string;
  name: string;
  variant: string;
  price: number;
  img: string;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (p: ClientProduct, variant: string) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "baronCart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CartItem[]);
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add = useCallback((p: ClientProduct, variant: string) => {
    const v = p.variants.find((x) => x.label === variant);
    if (!v) return;
    const key = `${p.name}::${v.label}`;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { key, name: p.name, variant: v.label, price: v.price, img: p.img, qty: 1 }];
    });
    toast.success(`Added ${p.name}${v.label !== "Standard" ? ` (${v.label})` : ""} to your bag`);
  }, []);

  const inc = useCallback((key: string) => setItems((p) => p.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))), []);
  const dec = useCallback(
    (key: string) => setItems((p) => p.map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)),
    []
  );
  const remove = useCallback((key: string) => setItems((p) => p.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items, add, inc, dec, remove, clear, open, setOpen,
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.price * i.qty, 0),
    }),
    [items, add, inc, dec, remove, clear, open]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
