import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en", "ja", "zh"],
  defaultLocale: "ko",
  // ko는 prefix 없음 (/), en은 /en
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
