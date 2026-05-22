import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * 1) www-strict 308 영구 리다이렉트 (caremap.store → www.caremap.store).
 *    canonical/og:url과 신호 정합. Vercel edge가 hosts 분기 처리.
 * 2) 그 외는 next-intl middleware에 위임 (locale prefix 처리).
 */
export default function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  // production apex(non-www) 진입 시 308로 영구 이동
  if (host === "caremap.store") {
    const url = new URL(req.url);
    url.host = "www.caremap.store";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(ko|en|ja|zh)/:path*",
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
};
