import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

/**
 * POST /api/log-search { q, area, kind, locale }
 * 검색 시 클라이언트에서 호출. anon-key로 직접 INSERT.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const q = String(body.q ?? "").trim();
    if (!q || q.length > 100) return NextResponse.json({ ok: false }, { status: 400 });
    const area = body.area ? String(body.area).slice(0, 50) : null;
    const kind = body.kind ? String(body.kind).slice(0, 30) : null;
    const locale = ["ko", "en", "ja", "zh"].includes(String(body.locale))
      ? String(body.locale) : "ko";
    const query_norm = q.toLowerCase().replace(/\s+/g, " ").trim();
    await supabase.from("search_logs").insert({
      query: q, query_norm, area, kind, locale,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
