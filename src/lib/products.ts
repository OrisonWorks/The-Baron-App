export type CategoryId =
  | "phones" | "headphones" | "earphones" | "accessories" | "watches" | "body-care" | "clothing";

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: "watches", label: "Watches", blurb: "Fossil, Invicta, Timex · Naviforce, Curren, Casio" },
  { id: "phones", label: "Phones", blurb: "Smartphones, new and ex-UK" },
  { id: "headphones", label: "Headphones", blurb: "Over-ear and on-ear, wired and wireless" },
  { id: "earphones", label: "Earphones", blurb: "Earbuds and in-ear" },
  { id: "accessories", label: "Phone Accessories", blurb: "Chargers, cables, covers and more" },
  { id: "body-care", label: "Body Care", blurb: "Lotions, serums, body wash, face masks" },
  { id: "clothing", label: "Clothing", blurb: "Everyday pieces for men and women" },
];

export const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<CategoryId, string>;

export interface Variant {
  label: string;
  price: number;
  stock: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  cat: CategoryId;
  type: string;
  gender: string;
  condition: string;
  warranty: string;
  img: string;
  desc: string;
  variants: Variant[];
}

// What the public storefront is allowed to see: per-variant availability flags
// instead of exact counts and no SKU. Sold-out variants are dropped entirely.
export type StockFlag = "in" | "low";
export interface ClientVariant {
  label: string;
  price: number;
  flag: StockFlag;
}
export type ClientProduct = Omit<Product, "sku" | "variants"> & {
  variants: ClientVariant[];
  minPrice: number;
  maxPrice: number;
  lowStock: boolean;
};

export const FEW_PER_VARIANT = 2;
export const FEW_TOTAL = 3;

export function toClientProduct(p: Product): ClientProduct {
  const variants: ClientVariant[] = [];
  let total = 0;
  for (const v of p.variants) {
    if (v.stock > 0) {
      variants.push({ label: v.label, price: v.price, flag: v.stock <= FEW_PER_VARIANT ? "low" : "in" });
      total += v.stock;
    }
  }
  const prices = variants.map((v) => v.price);
  const { sku: _sku, variants: _variants, ...rest } = p;
  return {
    ...rest,
    variants,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    lowStock: total > 0 && total <= FEW_TOTAL,
  };
}

// Built-in catalogue, used until PRODUCTS_SHEET_CSV_URL points at Aaron's stock
// sheet. These are the watches (and photos) from the original site; other
// categories stay empty and show a "landing soon" card instead of fake stock.
const watch = (
  id: number, name: string, price: number, img: string, desc: string, variant: string,
  brand = "", type = ""
): Product => ({
  id, sku: `WT-${String(id).padStart(3, "0")}`, name, brand, cat: "watches", type, gender: "Men",
  condition: "New", warranty: "", img: `/products/${img}.jpg`, desc,
  variants: [{ label: variant, price, stock: 5 }],
});

export const PRODUCTS: Product[] = [
  watch(1, "Fossil Grey Dial Chronograph", 2800, "111061", "Grey sunray dial with gold-tone hands, three sub-dials and a steel bracelet.", "Grey / Steel", "Fossil", "Premium"),
  watch(2, "Fossil Black Chronograph", 2500, "111325", "Bold black case, smoked dial and chronograph sub-dials — available on leather or steel.", "Black", "Fossil", "Premium"),
  watch(3, "Timex Black Textured Dial", 1600, "58514", "Large textured black dial on a black leather strap. Clean, modern, everyday.", "Black / Leather", "Timex", "Premium"),
  watch(4, "Cheetah Chronograph", 1700, "107100", "Boxed Cheetah chronograph — a statement piece at an honest price.", "Black", "Cheetah", "Affordable"),
  watch(5, "Chronograph Classic", 1850, "82283", "Multi-function chronograph with panda dial, date display and leather strap.", "White / Black"),
  watch(6, "Navy Dial Chronograph", 2200, "85276", "Navy chronograph dial with bold Arabic numerals and a rubber strap.", "Navy"),
  watch(7, "Steel Diver", 1450, "86507", "Classic diver styling with rotating bezel and stainless-steel bracelet.", "Black / Steel"),
  watch(8, "Black Bezel Diver", 2100, "89129", "Black rotating bezel, luminous hands and a brushed steel bracelet.", "Black / Steel"),
  watch(9, "Sport Diver", 1750, "93627", "Rugged sport diver with green-accented hands on a steel bracelet.", "Black / Steel"),
  watch(10, "Blue Sport Watch", 2050, "97310", "Bright blue case and strap — bold colour for weekends.", "Blue"),
  watch(11, "Silver Dress Watch", 1550, "97810", "Elegant silver case with a clean dial. Dresses up any outfit.", "Silver"),
  watch(12, "Black Leather Strap Watch", 1900, "107082", "Dark dial on a textured black leather strap with steel buckle.", "Black"),
  watch(13, "Gunmetal Classic", 2300, "107107", "Gunmetal case and bracelet with a dark dial.", "Gunmetal"),
  watch(14, "Black Steel Chronograph", 2150, "107108", "Black steel chronograph with grey dial and date window.", "Black / Steel"),
  watch(15, "Navy Dress Watch", 2000, "108563", "Slim navy dial on a steel bracelet — office ready.", "Navy / Steel"),
  watch(16, "Ladies Blue Sport", 2250, "73679", "Blue silicone strap and matching dial. Light and comfortable.", "Blue"),
];
PRODUCTS[15].gender = "Women";
