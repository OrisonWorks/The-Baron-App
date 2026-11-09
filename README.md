# The Baron — storefront

Storefront for **The Baron** (Lusaka): premium watches, gadgets and accessories — watches, phones, headphones, earphones, phone accessories, body care and clothing. Customers build a bag and send the order to WhatsApp **+260 974 128 784**; there is no online payment.

Same stack as Petal Steps: **Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Radix UI · Google Sheets CSV as the inventory source · Vercel**.

The previous React + NestJS app (GitHub Pages) lives untouched in [`legacy/`](legacy/README.md).

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: set PRODUCTS_SHEET_CSV_URL
npm run dev                  # http://localhost:3000
npx tsc --noEmit             # type check
npm run build
```

Without `PRODUCTS_SHEET_CSV_URL` the shop shows the built-in catalogue in `src/lib/products.ts` (the 16 watches from the original site). Empty categories show a "landing soon — ask on WhatsApp" card instead of placeholder products.

## Inventory: Google Sheet

1. Start from [`docs/The-Baron-stock-sheet-template.xlsx`](docs/The-Baron-stock-sheet-template.xlsx) (regenerate with `python3 scripts/make_stock_template.py`). Upload to Google Drive and open with Google Sheets.
2. Fill the **STOCK** tab — **one row per variant** (colour / storage / ml / size). Rows sharing a `SKU` form one product.

   | Column | Notes |
   | --- | --- |
   | `SKU` | Internal code, never shown publicly |
   | `NAME`, `BRAND`, `DESCRIPTION` | Shown on the card / quick view |
   | `CATEGORY` | Phones, Headphones, Earphones, Phone Accessories, Watches, Body Care, Clothing |
   | `TYPE` | Sub-group (e.g. Premium / Affordable for watches, Charger, Lotion) — becomes the "Range" filter |
   | `FOR` | Men / Women / Unisex — the "For" filter |
   | `VARIANT` | Option label, e.g. `128GB / Black`, `400ml`, `M / Black` |
   | `PRICE (K)`, `STOCK` | Whole numbers. Per-variant price is supported |
   | `CONDITION`, `WARRANTY` | Optional, shown in quick view (non-"New" condition gets a badge) |
   | `PHOTO` | Image URL, Google Drive share link (auto-converted), or a filename in `public/products/` |
   | `ACTIVE` | Optional; `no`/`false`/`hide` hides the product |

   Rows whose description starts with `EXAMPLE ROW` are ignored, as are unknown categories and sold-out products.
3. **File → Share → Publish to web → STOCK → CSV**, and set the URL as `PRODUCTS_SHEET_CSV_URL` in `.env.local` and in Vercel. The page and `/api/products` revalidate every 5 minutes; if the sheet is unreachable the built-in catalogue is served.

## Privacy rules

The public payload (`toClientProduct`) never includes SKUs or exact stock counts — each variant is only `in` or `low` ("few left"), sold-out variants are dropped, and products with ≤3 units total get an "Only a few left" badge.

## Deploy

Import the repo in Vercel (framework preset: Next.js, root directory: repo root) and add `PRODUCTS_SHEET_CSV_URL`. GitHub Pages is no longer used — it cannot run the server routes.
