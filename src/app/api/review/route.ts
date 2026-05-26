import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

/**
 * POST /api/review — 후기 작성
 * Body: { hospital_id, hospital_slug, hospital_name, rating(1~5), content }
 *
 * 의료법 준수 가드:
 * - 사진 첨부 없음 (이 라우트는 텍스트만 수용)
 * - 효과 보장 / 가격 비교 / 광고성 키워드 자동 차단 (간단 휴리스틱)
 * - 1 사용자 / 1 병원 / 1 후기 (DB UNIQUE 제약 가정)
 *
 * 클라이언트 차단 키워드 — false-positive 방지 위해 매우 보수적으로
 */
const BANNED_PATTERNS = [
  /100\s*%\s*보장/, /효과\s*보장/, /부작용\s*없/,
  /무조건\s*추천/, /최저가\s*보장/, /\d{5,}\s*원\s*할인/,
  /이벤트\s*가/, /\s\d+\s*만원\s*특가/,
];

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "auth_required" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const hospital_id = Number(body.hospital_id);
    const hospital_slug = String(body.hospital_slug ?? "").slice(0, 200);
    const hospital_name = String(body.hospital_name ?? "").slice(0, 120);
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating))));
    const content = String(body.content ?? "").trim();

    if (!hospital_id || !hospital_slug || !rating) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    if (content.length < 20) {
      return NextResponse.json({ ok: false, error: "too_short" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ ok: false, error: "too_long" }, { status: 400 });
    }

    // 의료광고 의심 패턴 → 자동 hold 상태
    const flagged = BANNED_PATTERNS.some((p) => p.test(content));

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        hospital_id, hospital_slug, hospital_name,
        rating, content,
        status: flagged ? "hold" : "published",
      })
      .select("id")
      .single();

    if (error) {
      // UNIQUE 위반 (한 병원에 이미 작성한 경우 등)
      if (error.code === "23505") {
        return NextResponse.json({ ok: false, error: "already_reviewed" }, { status: 409 });
      }
      console.error("[review]", error.message);
      return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, review_id: data?.id, flagged });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** DELETE /api/review?id=...  본인 후기 삭제 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));
    if (!id) return NextResponse.json({ ok: false }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    const { error } = await supabase.from("reviews").delete().eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
