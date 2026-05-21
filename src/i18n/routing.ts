import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en", "ja", "zh"],
  defaultLocale: "ko",
  // ko는 prefix 없음 (/), en/ja/zh은 /en, /ja, /zh
  localePrefix: "as-needed",
  // 브라우저 Accept-Language / cookie 자동 감지 비활성화 — URL이 진실의 원천
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
