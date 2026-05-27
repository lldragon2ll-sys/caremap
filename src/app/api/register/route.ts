import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

/**
 * POST /api/register
 * Body: { clinic_name, contact_name, email, phone, type, message, locale }
 *
 * 1) Supabase clinic_registrations 저장 (백업·검색)
 * 2) Google Forms POST → 연결된 Sheet 자동 적재 + 새 응답 이메일 알림
 *    (Forms 엔드포인트는 OAuth 불필요, public POST 허용)
 */

const FORM_RESPONSE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSccoy6raE2ab95jHcb3d9x13xTAchb_YV2P8KfgTksAwmOV5Q/formResponse";

const FORM_ENTRY = {
  type: "entry.1308537584",
  clinic_name: "entry.1277518371",
  contact_name: "entry.1062356469",
  email: "entry.25783851",
  message: "entry.2083553479",
  phone: "entry.503868875",
  locale: "entry.1956982755",
} as const;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const clinic_name = String(body.clinic_name ?? "").trim().slice(0, 120);
    const contact_name = String(body.contact_name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 120);
    const phone = body.phone ? String(body.phone).trim().slice(0, 40) : "";
    const type = ["new", "correct", "ad"].includes(String(body.type)) ? String(body.type) : "correct";
    const message = String(body.message ?? "").trim().slice(0, 2000);
    const locale = ["ko", "en", "ja", "zh"].includes(String(body.locale)) ? String(body.locale) : "ko";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";

    if (!clinic_name || !contact_name || !email || !message) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    // 1) Supabase 백업
    const { error: dbErr } = await supabase.from("clinic_registrations").insert({
      clinic_name, contact_name, email, phone: phone || null, type, message, locale, ip: ip || null,
    });
    if (dbErr) console.error("[register] supabase:", dbErr.message);

    // 2) Google Forms → Sheet + Gmail
    // IP를 message 끝에 메타로 추가 (Form에 ip 필드 없음)
    const messageWithMeta =
      message +
      (ip ? `\n\n---\nIP: ${ip}` : "") +
      `\nSource: caremap.store`;

    const params = new URLSearchParams();
    params.set(FORM_ENTRY.type, type);
    params.set(FORM_ENTRY.clinic_name, clinic_name);
    params.set(FORM_ENTRY.contact_name, contact_name);
    params.set(FORM_ENTRY.email, email);
    params.set(FORM_ENTRY.message, messageWithMeta);
    params.set(FORM_ENTRY.phone, phone || "-");
    params.set(FORM_ENTRY.locale, locale);

    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(FORM_RESPONSE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        signal: ctrl.signal,
        redirect: "follow",
      });
      if (!res.ok && res.status !== 302 && res.status !== 0) {
        console.warn("[register] forms non-ok:", res.status);
      }
    } catch (e) {
      console.warn("[register] forms error:", e instanceof Error ? e.message : e);
    } finally {
      clearTimeout(timeoutId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register] fatal:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
