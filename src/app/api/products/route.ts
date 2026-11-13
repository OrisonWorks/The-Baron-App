import { NextResponse } from "next/server";
import { getProducts } from "@/lib/sheet-products";
import { toClientProduct } from "@/lib/products";

export const revalidate = 300;

export async function GET() {
  const { products, source } = await getProducts();
  // Products with no in-stock variant are sold out and never reach the client.
  const list = products.map(toClientProduct).filter((p) => p.variants.length > 0);
  return NextResponse.json({ source, count: list.length, products: list });
}
