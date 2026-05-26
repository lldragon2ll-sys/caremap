import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "edge";

/** POST /api/community/comment { post_id, content } */
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "auth_required" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const post_id = Number(body.post_id);
    const content = String(body.content ?? "").trim();
    if (!post_id || content.length < 2) return NextResponse.json({ ok: false }, { status: 400 });
    if (content.length > 2000) return NextResponse.json({ ok: false }, { status: 400 });

    const { error } = await supabase
      .from("community_comments")
      .insert({ user_id: user.id, post_id, content });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
