import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, cookieAuthed } from "@/lib/admin-auth";

// Forwards an admin photo upload to the stock writer, which saves it to the
// sheet owner's Google Drive and returns a public thumbnail URL for the
// PHOTO column. Max ~4.5MB file (base64 inflates ~33%).
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_B64 = 6 * 1024 * 1024;

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
  const body = await req.json().catch(() => ({}));
  const mime = String(body.mime || "").toLowerCase();
  const data = String(body.data || "");
  const model = String(body.model || "photo").slice(0, 30);
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ ok: false, error: "Photos must be JPEG, PNG, WebP or GIF" }, { status: 400 });
  }
  if (!data || data.length > MAX_B64) {
    return NextResponse.json({ ok: false, error: "Photo too large (max ~4.5MB)" }, { status: 400 });
  }
  if (!/^[A-Za-z0-9+/=\s]+$/.test(data)) {
    return NextResponse.json({ ok: false, error: "Bad photo data" }, { status: 400 });
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "uploadPhoto", model, mime, data }),
      cache: "no-store",
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.ok || typeof d.url !== "string") {
      return NextResponse.json({ ok: false, error: d.error || `Stock writer ${res.status}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, url: d.url });
  } catch (err) {
    return NextResponse.json({ ok: false, error: `Stock writer unreachable: ${err}` }, { status: 502 });
  }
}
