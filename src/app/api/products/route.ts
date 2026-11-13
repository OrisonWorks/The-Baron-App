import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProducts } from "@/lib/sheet-products";
import { toClientProduct } from "@/lib/products";
import { ADMIN_COOKIE, cookieAuthed } from "@/lib/admin-auth";

export const revalidate = 300;

export async function GET(req: Request) {
  // ?all=1 returns full products (SKU + exact counts) to the signed-in admin
  // only — the public payload stays scrubbed.
  const store = await cookies();
  const all =
    new URL(req.url).searchParams.get("all") === "1" &&
    cookieAuthed(store.get(ADMIN_COOKIE)?.value);
  const { products, source } = await getProducts(all);
  // Products with no in-stock variant are sold out and never reach the client.
  const list = all ? products : products.map(toClientProduct).filter((p) => p.variants.length > 0);
  return NextResponse.json({ source, count: list.length, products: list });
}
