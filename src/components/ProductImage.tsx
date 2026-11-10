import Image from "next/image";
import { Cable, Headphones, Headset, Shirt, Smartphone, Sparkles, Watch, type LucideIcon } from "lucide-react";
import type { CategoryId } from "@/lib/products";
import { cn } from "@/lib/utils";

export const CAT_ICON: Record<CategoryId, LucideIcon> = {
  phones: Smartphone, headphones: Headphones, earphones: Headset, accessories: Cable,
  watches: Watch, "body-care": Sparkles, clothing: Shirt,
};

// Sheet rows may not have a photo yet; show a branded category tile instead of
// a broken image.
export function ProductImage({ src, alt, cat, className, sizes, priority }: {
  src: string; alt: string; cat: CategoryId; className?: string; sizes?: string; priority?: boolean;
}) {
  if (!src) {
    const Icon = CAT_ICON[cat];
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-panel-2 to-ink", className)} role="img" aria-label={alt}>
        <Icon className="h-14 w-14 text-accent/60" strokeWidth={1.2} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={900}
      sizes={sizes ?? "(max-width: 1024px) 50vw, 25vw"}
      unoptimized={src.startsWith("http")}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={cn("object-cover", className)}
    />
  );
}
