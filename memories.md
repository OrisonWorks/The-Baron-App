# The Baron — project memory

Log of everything implemented/updated, newest first. Keep this updated in every PR that ships behaviour.

## Context

- Client: **Aaron Chilufya — The Baron** (Lusaka). WhatsApp +260 974 128 784, catalogue https://wa.me/c/260974128784.
- Lines: watches (premium: Fossil, Invicta, Timex · affordable: Naviforce, Curren, Casio), phones, headphones, earphones, phone accessories (chargers, cables, covers), body care for men & women (lotions, serums, body wash, face masks), clothing. Goal: grow into a full e-commerce shop.
- Built to mirror Petal Steps (OrisonWorks/PetalStepsTM): WhatsApp is the only order path, no exact stock counts or SKUs client-side, no blinking/flashing UI (reduced-motion honoured).
- Brand: gold-crest "The Baron" logo (`public/brand/logo.jpg`, crest crop `crest.png`) — black, gold, crest navy/orange. Tagline "Premium Watches, Gadgets, and Accessories".

## 2026-11-09 — Next.js rebuild (storefront phase 1)

- Old CRA frontend + NestJS/SQLite backend moved to `legacy/` (unchanged). GitHub Pages deploy + old CI workflows removed; new CI runs `tsc` + `next build`.
- New Next.js 15 / Tailwind v4 storefront, dark + gold theme, mobile first: hero, category grid (with "landing soon" for empty categories + WhatsApp catalogue link), shop with category tabs, Brand / Range / For chips, sort, header search, deep links (`?cat=&brand=&sort=&q=`).
- Product model = product with variants (colour/storage/ml/size), per-variant price, quick view variant picker, condition + warranty.
- Inventory from the published Google Sheet (`PRODUCTS_SHEET_CSV_URL`, stock-sheet template in `docs/`), fallback = the 16 watches + photos from the original site (photos resized to ≤1200px).
- WhatsApp bag: name, number, area, delivery choice → formatted order message to +260 974 128 784. Floating WhatsApp button, mobile sticky bag bar, back-to-top.

## 2026-11-09 — QA fixes
- Checkout now rejects invalid WhatsApp numbers (`isValidPhone`: 9–15 digits, only digits/space/+/-/brackets) and blank names, before opening WhatsApp or clearing the bag.
- All JS scrolling (category jump, search, back-to-top) uses `scrollBehavior()`, which returns `auto` under `prefers-reduced-motion`.

## 2026-11-09 — Chat helper (ported from Petal Steps)
- `ChatWidget` (gold bubble in the floating-actions stack, above the WhatsApp button): rule-based, no API. Answers from live products — single product match (name/brand/variant words) with per-variant availability ("in stock"/"only a few left", never counts), brand ("any Invicta?"), category/range ("premium watches", "earphones" → landing soon), budget ("watches under K2000"). FAQ: payment (details sent on WhatsApp), delivery (Lusaka, free above K500 — unconfirmed), condition/warranty, returns, contact, location, how to order. "View" buttons open the product quick view; everything else deep-links to WhatsApp.
- Back-to-top hides while the chat panel is open (`group-has-[[aria-expanded=true]]:hidden`) — the panel otherwise covers it once scrolled.
- Only facts already on the site are used — no hours, payment numbers or address until Aaron supplies them.

## 2026-11-09 — Light theme default + dark toggle
- Light theme is the default; sun/moon button in the header switches to the original black-and-gold dark theme. Choice saved in localStorage `baronTheme`; an inline `<head>` script applies it before paint (no flash); `<meta name="theme-color">` and Sonner toasts follow it.
- Colours are CSS-variable tokens (`@theme inline` → `:root` light / `.dark` dark in `globals.css`). Use `text-fg`/`text-fg-2` for text, `text-accent`/`text-accent-2` for gold text (darker gold in light for contrast), `bg-gold` + `text-on-gold` for gold fills. Don't use raw `stone-*`/`white` text.
- The hero carries `.dark` so it stays a dark band with the watch photo in both themes.
- Theme constants + the init script live in `src/lib/theme.ts` (not the `"use client"` context file): values imported from a client module into the server `layout.tsx` arrive as client references, which rendered an empty `theme-color` meta.
- Header tightened for phones so the toggle fits: smaller buttons below `sm`, and below 340px only the crest shows (no wordmark).

## Pending / next

- Vercel project + `PRODUCTS_SHEET_CSV_URL` (needs Tumelo — no Vercel team access from Devin yet). Custom domain recommended (MTN Zambia can't reach `*.vercel.app`).
- Aaron's stock sheet + photos.
- Phase 2: `/admin` (stock −/+, add product, bulk CSV) via an Apps Script writer like Petal Steps; then receipts, reports, mailing list, interest log.
- Confirm delivery/payment policy text with Aaron ("Free delivery above K500" carried over from the old site).
## 2026-11-13 — Aaron's real catalogue + promo areas
- Fallback catalogue replaced by his WhatsApp Business catalogue export (53 items, photos in `public/catalog/<id>.jpg`): watches (Fossil/Invicta/Timex/Naviforce/Curren/Hugo Boss/Cheetah/Diesel/Adidas/Ice/Carrington), JBL audio, Lenovo pods, socks, ebook. `item()` helper in `src/lib/products.ts`; `price: 0` = "Ask for price" (`money()` handles 0), `stock: 0` = sold out.
- `/api/products` and the sheet loader (`v.price >= 0`) now keep price-0 variants and drop products with zero in-stock variants (sold out never reaches the client).
- Promos: `src/lib/promo.ts` (PROMOS list + POPUP_PROMO_ID — Aaron edits it), `PromoPopup` shows it once/day (localStorage `baronPromoSeen` = id:date), `Promos` section renders the big cards between Categories and Shop.
- Prefilled stock sheet for Aaron: generator inline in session (saved /tmp), docs template stays the empty one. Sheet PHOTO uses `/catalog/<id>.jpg` (leading slash = site path).

## 2026-11-06 — Admin side ported from Petal Steps

Admin surface at `/admin` mirrors PetalSteps: passcode login (`baron_admin`
cookie, HMAC-SHA256 of `ADMIN_PASSCODE`), dashboard KPIs, stock −/+ per
variant (not EU sizes), edit product (name/brand/price/category/type/for/
condition/warranty/photo/description — price applies to all variant rows),
add product (variant rows with optional per-variant price), bulk CSV import
(`baron-stock-template.csv`, one row per variant, rows grouped by model),
receipts (TB-####, public link `/receipt/<no>?k=`), daily reports (CSV +
jsPDF PDF), subscribers/unsubscribe/newsletter, leads (interest taps with
no later sale), analytics. Storefront additions: Baron List signup section,
consent banner (`baron-consent` localStorage), log-interest fired from the
cart checkout (per item, contact only when consent given). Stock writer is
`scripts/stock_writer.gs` rewritten for the Baron schema (SKU+VARIANT+STOCK;
price_k written to every variant row; LOG tab uses VARIANT column).
Needs env: ADMIN_PASSCODE, STOCK_WRITER_URL, STOCK_WRITER_TOKEN (+ REPORT_EMAIL
script property for the daily digest). Verified end-to-end locally against a
mock writer (login, sold, create-product, update, receipt, subscribe,
log-interest, analytics, leads).
