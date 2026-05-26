import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

const KINDS = new Set(["post", "comment", "review"]);
const REASONS = new Set(["spam", "abuse", "fake", "illegal", "other"]);

/**
 * POST /api/report — 컨텐츠 신고
 * 1 user × 1 target × 1 신고 (UNIQUE 권장)
 * 5건 이상 누적 시 target_status='hold' 자동 전환 (DB trigger 또는 cron으로 처리 가능)
 */
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind ?? "");
    const target_id = Number(body.target_id);
    const reason = String(body.reason ?? "");

    if (!KINDS.has(kind) || !target_id || !REASONS.has(reason)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { error } = await supabase
      .from("reports")
      .insert({ user_id: user.id, kind, target_id, reason });
    if (error && error.code !== "23505") {
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
