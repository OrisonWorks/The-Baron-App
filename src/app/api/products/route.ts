import { NextResponse } from "next/server";
import { getProducts } from "@/lib/sheet-products";
import { toClientProduct } from "@/lib/products";

export const revalidate = 300;

export async function GET() {
  const { products, source } = await getProducts();
  const list = products.map(toClientProduct);
  return NextResponse.json({ source, count: list.length, products: list });
}
