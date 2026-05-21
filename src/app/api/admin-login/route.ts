import { NextResponse } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";

/**
 * POST /api/admin-login (multipart form: token=...)
 * 토큰 일치 시 admin_token 쿠키 설정 후 /admin 으로 리디렉트
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const referer = req.headers.get("referer") ?? "/";
  // locale prefix 유지 (referer의 origin + 처음 path segment)
  let redirectTo = "/admin";
  try {
    const u = new URL(referer);
    const m = /^\/(en|ja|zh)(\/|$)/.exec(u.pathname);
    redirectTo = `${m ? `/${m[1]}` : ""}/admin`;
  } catch {}

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return NextResponse.redirect(new URL(redirectTo + "?error=invalid", req.url), { status: 303 });
  }
  const res = NextResponse.redirect(new URL(redirectTo, req.url), { status: 303 });
  res.cookies.set("admin_token", token, {
    httpOnly: true, secure: true, sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
