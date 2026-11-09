"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/ProductImage";
import { WaIcon } from "@/components/Sections";
import { useCart } from "@/context/cart-context";
import { CAT_LABEL, type ClientProduct } from "@/lib/products";
import { BRAND, cn, money, waLink } from "@/lib/utils";

export function QuickView({ product, onClose }: { product: ClientProduct | null; onClose: () => void }) {
  const { add, setOpen } = useCart();
  const [variant, setVariant] = useState<string | null>(null);
  useEffect(() => setVariant(product?.variants.length === 1 ? product.variants[0].label : null), [product]);
  const chosen = product?.variants.find((v) => v.label === variant);

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 sm:grid-cols-2">
        {product && (
          <>
            <ProductImage src={product.img} alt={product.name} cat={product.cat} sizes="(max-width: 640px) 100vw, 400px" className="h-72 w-full sm:h-full sm:min-h-[440px]" />
            <div className="flex flex-col gap-3 p-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="soft">{CAT_LABEL[product.cat]}</Badge>
                {product.type && <Badge variant="soft">{product.type}</Badge>}
                {product.gender && <Badge variant="soft">{product.gender}</Badge>}
              </div>
              {product.brand && <p className="text-xs font-semibold uppercase tracking-widest text-gold">{product.brand}</p>}
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              {product.desc ? <DialogDescription>{product.desc}</DialogDescription> : <DialogDescription className="sr-only">{product.name}</DialogDescription>}
              <strong className="text-2xl text-gold-light">{money(chosen?.price ?? product.minPrice)}{!chosen && product.minPrice !== product.maxPrice ? "+" : ""}</strong>
              {(product.condition || product.warranty) && (
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {product.condition && <div className="rounded-xl border border-line p-2"><dt className="text-[11px] uppercase tracking-wider text-mist">Condition</dt><dd>{product.condition}</dd></div>}
                  {product.warranty && <div className="rounded-xl border border-line p-2"><dt className="text-[11px] uppercase tracking-wider text-mist">Warranty</dt><dd>{product.warranty}</dd></div>}
                </dl>
              )}
              {!(product.variants.length === 1 && product.variants[0].label === "Standard") && (
                <>
                  <p className="mt-1 text-sm font-semibold">Choose option</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.label}
                        onClick={() => setVariant(v.label)}
                        aria-pressed={variant === v.label}
                        className={cn("cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-semibold", variant === v.label ? "border-gold bg-gold text-ink" : "border-line bg-panel-2 hover:border-gold")}
                      >
                        {v.label}
                        <span className="block text-[11px] font-medium opacity-80">{money(v.price)} · {v.flag === "low" ? "few left" : "in stock"}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <Button className="mt-3 w-full" onClick={() => {
                if (!variant) return toast.error("Please choose an option first");
                add(product, variant); onClose(); setOpen(true);
              }}>Add to bag</Button>
              <Button variant="outline" className="w-full" asChild>
                <a href={waLink(`Hi ${BRAND}! I have a question about ${product.name}${variant && variant !== "Standard" ? ` (${variant})` : ""}.`)} target="_blank" rel="noopener noreferrer"><WaIcon className="h-4 w-4" /> Ask about this item</a>
              </Button>
              <p className="text-xs text-mist">We confirm availability on WhatsApp before you pay.</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
