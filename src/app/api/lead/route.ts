import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

/**
 * POST /api/lead — 상담 신청 lead 기록.
 *
 * Body: { name, phone, hospital_slug, hospital_name, message?, locale, interest? }
 *
 * 저장 테이블 (Supabase SQL):
 *   create table clinic_leads (
 *     id bigserial primary key,
 *     name text not null,
 *     phone text not null,
 *     hospital_slug text,
 *     hospital_name text,
 *     message text,
 *     interest text,
 *     locale text default 'ko',
 *     status text default 'new',
 *     created_at timestamptz default now()
 *   );
 *
 * 응답: { ok: true, lead_id }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? "").trim().slice(0, 80);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const hospital_slug = body.hospital_slug ? String(body.hospital_slug).slice(0, 200) : null;
    const hospital_name = body.hospital_name ? String(body.hospital_name).slice(0, 120) : null;
    const message = body.message ? String(body.message).trim().slice(0, 1000) : null;
    const interest = body.interest ? String(body.interest).trim().slice(0, 80) : null;
    const locale = ["ko", "en", "ja", "zh"].includes(String(body.locale)) ? String(body.locale) : "ko";

    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    // 전화번호 기본 검증 (숫자 8자 이상)
    if ((phone.match(/\d/g) ?? []).length < 8) {
      return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clinic_leads")
      .insert({ name, phone, hospital_slug, hospital_name, message, interest, locale })
      .select("id")
      .single();
    if (error) {
      console.error("[lead]", error.message);
      return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, lead_id: data?.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
