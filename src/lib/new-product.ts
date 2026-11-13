// Shared validation + writer call for creating a brand-new product on the
// sheet. Used by the single-create and bulk-create admin routes.
// Baron layout: one STOCK row per variant.

export type NewProductInput = {
  sku?: unknown;
  name?: unknown;
  brand?: unknown;
  cat?: unknown;
  type?: unknown;
  gender?: unknown;
  price?: unknown;
  img?: unknown;
  desc?: unknown;
  condition?: unknown;
  warranty?: unknown;
  variants?: unknown;
};

export type NewVariant = { label: string; price: number; count: number };
export type NewProduct = {
  sku: string;
  fields: {
    name: string; brand: string; category: string; type: string;
    for: string; condition: string; warranty: string; photo: string; description: string;
  };
  variants: NewVariant[];
};

export function validateNewProduct(body: NewProductInput): NewProduct | { error: string } {
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,29}$/.test(sku)) {
    return { error: `${sku || "?"}: product code must be 2-30 letters, digits, - or _` };
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { error: `${sku}: name required` };
  const priceRaw = String(body.price ?? "").trim();
  if (priceRaw && !/^\d{1,7}$/.test(priceRaw)) return { error: `${sku}: price must be a whole number` };
  const basePrice = priceRaw ? parseInt(priceRaw, 10) : 0;
  const variants = (Array.isArray(body.variants) ? body.variants : [])
    .map((v: { label?: unknown; price?: unknown; count?: unknown }) => ({
      label: String((v && v.label) || "").trim().slice(0, 60) || "Standard",
      price: /^\d{1,7}$/.test(String((v && v.price) ?? "").trim())
        ? parseInt(String((v && v.price) ?? "").trim(), 10) : basePrice,
      count: Math.max(0, parseInt(String(v && v.count), 10) || 0),
    }))
    .filter((v: NewVariant) => v.count > 0);
  if (variants.length === 0) return { error: `${sku}: add stock for at least one variant` };
  return {
    sku,
    fields: {
      name,
      brand: String(body.brand || "").slice(0, 30),
      category: String(body.cat || "").slice(0, 30),
      type: String(body.type || "").slice(0, 30),
      for: String(body.gender || "").slice(0, 10),
      condition: String(body.condition || "New").slice(0, 20),
      warranty: String(body.warranty || "").slice(0, 30),
      photo: String(body.img || "").slice(0, 500),
      description: String(body.desc || "").slice(0, 500),
    },
    variants,
  };
}

export async function writerCreateProduct(
  url: string, token: string, p: NewProduct
): Promise<{ ok: true } | { error: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "createProduct", model: p.sku, fields: p.fields, variants: p.variants }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { error: data.error || `Stock writer ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { error: `Stock writer unreachable: ${err}` };
  }
}
