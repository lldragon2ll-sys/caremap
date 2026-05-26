import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * 1) www-strict 308 영구 리다이렉트 (caremap.store → www.caremap.store)
 * 2) Supabase 세션 쿠키 refresh (만료된 access_token 자동 갱신)
 * 3) next-intl locale prefix 처리
 */
export default async function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host === "caremap.store") {
    const url = new URL(req.url);
    url.host = "www.caremap.store";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // Supabase 세션 refresh — middleware에서만 set 가능
  const res = intlMiddleware(req) ?? NextResponse.next({ request: req });
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supaUrl && supaAnon) {
    try {
      const supabase = createServerClient(supaUrl, supaAnon, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              res.cookies.set(name, value, options as CookieOptions);
            }
          },
        },
      });
      // 세션 검증 (사이드이펙트로 쿠키 갱신)
      await supabase.auth.getUser();
    } catch {
      // 환경 누락 등 — 무시
    }
  }
  return res;
}

export const config = {
  matcher: [
    "/",
    "/(ko|en|ja|zh)/:path*",
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
};
