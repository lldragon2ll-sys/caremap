import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // matcher: 정적 파일/API/이미지/사이트맵은 제외
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
