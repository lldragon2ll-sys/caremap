import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

/**
 * POST /api/log-view { hospital_id }
 * 병원 상세 페이지 클라이언트가 useEffect로 호출.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const hospital_id = Number(body.hospital_id);
    if (!hospital_id || Number.isNaN(hospital_id)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const today = new Date().toISOString().slice(0, 10);

    // hospital_views upsert (누적)
    // PostgREST는 ON CONFLICT 문법 직접 안 됨 — RPC가 없으니 select-then-update 패턴
    const { data: existing } = await supabase
      .from("hospital_views")
      .select("view_count")
      .eq("hospital_id", hospital_id)
      .maybeSingle();
    if (existing) {
      await supabase.from("hospital_views").update({
        view_count: (existing.view_count as number) + 1,
        last_viewed_at: new Date().toISOString(),
      }).eq("hospital_id", hospital_id);
    } else {
      await supabase.from("hospital_views").insert({
        hospital_id, view_count: 1, last_viewed_at: new Date().toISOString(),
      });
    }

    // hospital_views_daily upsert (rolling window)
    const { data: dayExisting } = await supabase
      .from("hospital_views_daily")
      .select("view_count")
      .eq("hospital_id", hospital_id)
      .eq("day", today)
      .maybeSingle();
    if (dayExisting) {
      await supabase.from("hospital_views_daily").update({
        view_count: (dayExisting.view_count as number) + 1,
      }).eq("hospital_id", hospital_id).eq("day", today);
    } else {
      await supabase.from("hospital_views_daily").insert({
        hospital_id, day: today, view_count: 1,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
