import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

/**
 * POST /api/register
 * Body: { clinic_name, contact_name, email, phone, type, message, locale }
 *
 * 1. Supabase clinic_registrations 테이블에 저장 (백업·검색용)
 * 2. GOOGLE_APPS_SCRIPT_URL 환경변수 설정 시 Google Sheet + Gmail 알림으로 전송
 *
 * Apps Script Web App 배포 후 URL을 GOOGLE_APPS_SCRIPT_URL 환경변수에 등록.
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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    if (!clinic_name || !contact_name || !email || !message) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    // 1) Supabase 저장 (백업)
    const { error: dbErr } = await supabase.from("clinic_registrations").insert({
      clinic_name, contact_name, email, phone, type, message, locale, ip,
    });
    if (dbErr) {
      console.error("[register] supabase:", dbErr.message);
      // DB 실패해도 사용자엔 OK 응답 — Apps Script로 전송은 계속 시도
    }

    // 2) Google Apps Script Webhook (Gmail 알림 + Sheet append) — fire-and-forget
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (gasUrl) {
      const payload = {
        clinic_name, contact_name, email, phone, type, message, locale, ip,
        source: "caremap.store",
        submitted_at: new Date().toISOString(),
      };
      // Edge runtime — fetch with timeout 5s to avoid hanging user response
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 5000);
      try {
        const res = await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
          redirect: "follow",
        });
        if (!res.ok) {
          console.warn("[register] apps_script non-ok:", res.status);
        }
      } catch (e) {
        console.warn("[register] apps_script error:", e instanceof Error ? e.message : e);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register] fatal:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
