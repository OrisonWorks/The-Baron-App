"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/context/cart-context";
import { CAT_LABEL, type ClientProduct } from "@/lib/products";
import { money } from "@/lib/utils";

export const priceLabel = (p: ClientProduct) =>
  p.minPrice === p.maxPrice ? money(p.minPrice) : `From ${money(p.minPrice)}`;

export function ProductCard({ product, onQuick }: { product: ClientProduct; onQuick: (p: ClientProduct) => void }) {
  const { add, setOpen } = useCart();
  const single = product.variants.length === 1;
  const meta = [product.brand || CAT_LABEL[product.cat], product.type].filter(Boolean).join(" · ");
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-gold/60">
      <button type="button" className="relative block w-full cursor-pointer overflow-hidden bg-panel-2 text-left" onClick={() => onQuick(product)} aria-label={`View ${product.name}`}>
        <ProductImage src={product.img} alt={product.name} cat={product.cat} className="aspect-square h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        {product.lowStock && <Badge className="absolute left-3 top-3">Only a few left</Badge>}
        {product.condition && product.condition.toLowerCase() !== "new" && (
          <Badge variant="new" className="absolute right-3 top-3">{product.condition}</Badge>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">{meta}</span>
        <h3 className="font-semibold leading-snug">
          <button type="button" className="cursor-pointer text-left hover:text-accent-2" onClick={() => onQuick(product)}>{product.name}</button>
        </h3>
        <p className="text-xs text-mist">
          {single ? (product.variants[0].label !== "Standard" ? product.variants[0].label : "In stock") : `${product.variants.length} options in stock`}
        </p>
        <strong className="mt-auto pt-2 text-lg text-accent-2">{priceLabel(product)}</strong>
        <div className="mt-2 flex gap-2">
          {single ? (
            <Button size="sm" className="flex-1" onClick={() => { add(product, product.variants[0].label); setOpen(true); }}>Add to bag</Button>
          ) : (
            <Button size="sm" className="flex-1" onClick={() => onQuick(product)}>Choose option</Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => onQuick(product)} className="max-sm:hidden">Details</Button>
        </div>
      </div>
    </article>
  );
}
