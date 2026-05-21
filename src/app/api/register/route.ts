import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

/**
 * POST /api/register
 * Body: { clinic_name, contact_name, email, phone, type, message, locale }
 * Inserts into clinic_registrations table.
 * Table schema (create via Supabase SQL editor):
 *   id bigserial PK, clinic_name text, contact_name text, email text,
 *   phone text, type text, message text, locale text, status text default 'new',
 *   created_at timestamptz default now()
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const clinic_name = String(body.clinic_name ?? "").trim().slice(0, 120);
    const contact_name = String(body.contact_name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 120);
    const phone = body.phone ? String(body.phone).trim().slice(0, 40) : null;
    const type = ["new", "correct", "ad"].includes(String(body.type)) ? String(body.type) : "correct";
    const message = String(body.message ?? "").trim().slice(0, 2000);
    const locale = ["ko", "en", "ja", "zh"].includes(String(body.locale)) ? String(body.locale) : "ko";

    if (!clinic_name || !contact_name || !email || !message) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const { error } = await supabase.from("clinic_registrations").insert({
      clinic_name, contact_name, email, phone, type, message, locale,
    });
    if (error) {
      // 테이블 미생성 등의 경우 로그만 남기고 사용자에게는 OK 응답
      console.error("[register]", error.message);
      return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
