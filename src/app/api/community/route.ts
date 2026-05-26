import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { COMMUNITY_CATEGORIES } from "@/lib/community";

export const runtime = "edge";

const BANNED_PATTERNS = [
  /100\s*%\s*보장/, /효과\s*보장/, /부작용\s*없/,
  /최저가\s*보장/, /\d{5,}\s*원\s*할인/, /이벤트\s*가/,
];

/** POST /api/community — 글 작성 */
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "auth_required" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? "").trim().slice(0, 120);
    const content = String(body.content ?? "").trim();
    const rawCat = String(body.category ?? "");
    const category = (COMMUNITY_CATEGORIES as readonly string[]).includes(rawCat) ? rawCat : "general";
    const locale = ["ko", "en", "ja", "zh"].includes(String(body.locale)) ? String(body.locale) : "ko";
    const hospital_slug = body.hospital_slug ? String(body.hospital_slug).slice(0, 200) : null;

    if (title.length < 4) return NextResponse.json({ ok: false, error: "title_too_short" }, { status: 400 });
    if (content.length < 20) return NextResponse.json({ ok: false, error: "content_too_short" }, { status: 400 });
    if (content.length > 10_000) return NextResponse.json({ ok: false, error: "content_too_long" }, { status: 400 });

    const flagged = BANNED_PATTERNS.some((p) => p.test(content) || p.test(title));

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        title, content, category, locale, hospital_slug,
        status: flagged ? "hold" : "published",
      })
      .select("id")
      .single();
    if (error) {
      console.error("[community]", error.message);
      return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, post_id: data?.id, flagged });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
