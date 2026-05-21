import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // 명시적 locale prefix + 모든 일반 경로 매칭, API/static 제외
  matcher: [
    "/",
    "/(ko|en|ja|zh)/:path*",
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
};
