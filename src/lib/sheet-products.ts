import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from "@/lib/products";

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  if (rows.length < 2) return [];
  // "PRICE (K)" -> "price_k", "Body Care" -> "body_care"
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  return rows.slice(1).map((cells) => {
    const out: Record<string, string> = {};
    headers.forEach((h, i) => { out[h] = (cells[i] ?? "").trim(); });
    return out;
  });
}

const INACTIVE = ["false", "no", "0", "hide", "hidden"];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CAT_ALIASES: Record<string, CategoryId> = {
  phone: "phones", smartphones: "phones", headphone: "headphones", earphone: "earphones",
  earbuds: "earphones", "phone-accessories": "accessories", accessory: "accessories",
  watch: "watches", "bodycare": "body-care", "body-care-men-women": "body-care",
  skincare: "body-care", clothes: "clothing",
};

export function toCategory(raw: string): CategoryId | null {
  const s = slug(raw);
  if (CATEGORIES.some((c) => c.id === s)) return s as CategoryId;
  return CAT_ALIASES[s] ?? null;
}

// Google Drive share links render as an HTML page, not an image; rewrite them to
// the public thumbnail endpoint. Bare filenames are served from /public/products.
export function toImage(raw: string): string {
  if (!raw) return "";
  const drive = raw.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (drive) return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1200`;
  return raw.startsWith("http") || raw.startsWith("/") ? raw : `/products/${raw}`;
}

const num = (s: string | undefined) => parseInt((s ?? "").replace(/[^0-9]/g, ""), 10) || 0;
const first = (rows: Record<string, string>[], ...keys: string[]) => {
  for (const k of keys) for (const r of rows) if (r[k]?.trim()) return r[k].trim();
  return "";
};

// One row per variant (the STOCK tab of the Baron stock-sheet template):
// SKU, NAME, BRAND, CATEGORY, TYPE, FOR, VARIANT, PRICE (K), STOCK, CONDITION,
// WARRANTY, PHOTO, DESCRIPTION (+ optional ACTIVE). Rows sharing a SKU (or NAME
// when SKU is blank) become one product. Template example rows are ignored.
export function rowsToProducts(rows: Record<string, string>[], includeEmpty = false): Product[] {
  const groups = new Map<string, Record<string, string>[]>();
  for (const r of rows) {
    if (/^example row/i.test(r.description ?? "")) continue;
    const key = (r.sku || r.model || r.name || "").trim();
    if (!key) continue;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = []));
    g.push(r);
  }
  const products: Product[] = [];
  for (const [key, rs] of groups) {
    if (INACTIVE.includes(first(rs, "active").toLowerCase())) continue;
    const name = first(rs, "name");
    const cat = toCategory(first(rs, "category", "cat"));
    const basePrice = num(first(rs, "price_k", "price"));
    if (!name || !cat) {
      console.warn(`Sheet product ${key} skipped: missing name or unknown category`);
      continue;
    }
    const variants = rs
      .map((r) => ({
        label: (r.variant || r.option || "").trim() || "Standard",
        price: num(r.price_k || r.price) || basePrice,
        stock: num(r.stock || r.qty || r.count),
      }))
      .filter((v) => v.price > 0);
    if (!variants.length) continue;
    if (!includeEmpty && !variants.some((v) => v.stock > 0)) continue;
    products.push({
      id: products.length + 1,
      sku: key,
      name,
      brand: first(rs, "brand"),
      cat,
      type: first(rs, "type", "subcategory"),
      gender: first(rs, "for", "gender"),
      condition: first(rs, "condition"),
      warranty: first(rs, "warranty"),
      img: toImage(first(rs, "photo", "image", "img")),
      desc: first(rs, "description", "desc"),
      variants,
    });
  }
  return products;
}

export async function getProducts(
  includeEmpty = false
): Promise<{ products: Product[]; source: "sheet" | "fallback" }> {
  const url = process.env.PRODUCTS_SHEET_CSV_URL;
  if (!url) return { products: PRODUCTS, source: "fallback" };
  try {
    const res = await fetch(url, { next: { revalidate: 300, tags: ["products"] } });
    if (!res.ok) throw new Error(`Sheet fetch ${res.status}`);
    const products = rowsToProducts(parseCsv(await res.text()), includeEmpty);
    if (products.length === 0) throw new Error("Sheet returned no valid products");
    return { products, source: "sheet" };
  } catch (err) {
    console.error("Falling back to built-in catalogue:", err);
    return { products: PRODUCTS, source: "fallback" };
  }
}
