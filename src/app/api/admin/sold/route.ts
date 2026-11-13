import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { ADMIN_COOKIE, cookieAuthed } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const store = await cookies();
  if (!cookieAuthed(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = process.env.STOCK_WRITER_URL;
  const token = process.env.STOCK_WRITER_TOKEN;
  if (!url || !token) {
    return NextResponse.json({ ok: false, error: "Stock writer not configured" }, { status: 503 });
  }
  const { sku, variant, delta, set, undo } = await req.json().catch(() => ({}));
  const varLabel = String(variant ?? "").trim();
  if (typeof sku !== "string" || !sku || !varLabel) {
    return NextResponse.json({ ok: false, error: "sku and variant required" }, { status: 400 });
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, model: sku, variant: varLabel, delta, set, undo: undo === true }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { ok: false, error: data.error || `Stock writer ${res.status}` },
        { status: 502 }
      );
    }
    revalidateTag("products");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ ok: false, error: `Stock writer unreachable: ${err}` }, { status: 502 });
  }
}
