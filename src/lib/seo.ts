/**
 * SEO 메타 헬퍼 — 모든 generateMetadata가 공유.
 *
 * 핵심 규칙:
 * 1. SITE_URL은 항상 www.caremap.store (production). 도메인 단일화.
 * 2. canonical은 항상 자기 자신의 절대 URL. 누락 시 throw.
 * 3. hreflang: ko-KR / en-US / ja-JP / zh-CN / x-default 5종 출력.
 * 4. og:url = canonical과 동일.
 * 5. og/twitter는 페이지별 차별화.
 *
 * 사용:
 *   buildPageMeta({
 *     locale, pathSegment: "/about",
 *     title: "...", description: "...",
 *     ogImage?: "...",  // 절대/상대 모두 가능
 *     indexable?: true,
 *   })
 */
import type { Metadata } from "next";

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim();
/** www-strict, https 강제 */
export const SITE_URL = (() => {
  // 프로덕션 기본값
  let url = RAW_SITE_URL || "https://www.caremap.store";
  // 로컬 dev 환경에서도 production url을 메타 base로 사용 (메타 일관성)
  if (url.includes("localhost")) url = "https://www.caremap.store";
  url = url.replace(/\/$/, "");
  // www 강제 (caremap.store → www.caremap.store)
  url = url.replace(/^https?:\/\/(?!www\.)caremap\.store/, "https://www.caremap.store");
  return url;
})();

export type Locale = "ko" | "en" | "ja" | "zh";
const LOCALES: Locale[] = ["ko", "en", "ja", "zh"];
const OG_LOCALE: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
};

/** 한국어는 prefix 없음, 그 외는 /{locale} */
function localePrefix(locale: string): string {
  if (locale === "ko") return "";
  if (!LOCALES.includes(locale as Locale)) return "";
  return `/${locale}`;
}

/**
 * 자기 참조 canonical URL 생성.
 * pathSegment는 슬래시로 시작해야 함. "/" 는 루트.
 * Locale별 prefix는 자동 부착.
 */
export function buildCanonical(locale: string, pathSegment: string): string {
  if (!pathSegment.startsWith("/")) {
    throw new Error(`[seo.buildCanonical] pathSegment must start with "/", got: ${pathSegment}`);
  }
  const prefix = localePrefix(locale);
  // 루트인 경우
  if (pathSegment === "/") {
    return prefix ? `${SITE_URL}${prefix}` : `${SITE_URL}/`;
  }
  return `${SITE_URL}${prefix}${pathSegment}`;
}

/**
 * hreflang language map — 모든 페이지에 동일 segment의 4개 locale + x-default.
 * x-default = 한국어 (운영자 본인 시장).
 */
export function buildLanguageAlternates(pathSegment: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const lc of LOCALES) {
    const url = lc === "ko"
      ? `${SITE_URL}${pathSegment === "/" ? "/" : pathSegment}`
      : `${SITE_URL}/${lc}${pathSegment === "/" ? "" : pathSegment}`;
    const hreflang = OG_LOCALE[lc].replace("_", "-");
    map[hreflang] = url;
  }
  map["x-default"] = `${SITE_URL}${pathSegment === "/" ? "/" : pathSegment}`;
  return map;
}

export type PageMetaInput = {
  locale: string;
  pathSegment: string;          // "/about", "/hospital/abc", etc.
  title: string;
  description: string;
  ogImage?: string;             // 절대 URL 또는 사이트 상대 경로
  ogType?: "website" | "article";
  indexable?: boolean;          // default true
};

export function buildPageMeta(input: PageMetaInput): Metadata {
  const { locale, pathSegment, title, description, ogImage, ogType = "website", indexable = true } = input;
  const canonical = buildCanonical(locale, pathSegment);
  const languages = buildLanguageAlternates(pathSegment);

  const imageUrl = ogImage
    ? (ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`)
    : `${SITE_URL}${localePrefix(locale)}/opengraph-image`;

  const lc = (LOCALES.includes(locale as Locale) ? locale : "ko") as Locale;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: ogType,
      url: canonical,
      siteName: "CAREMAP",
      title,
      description,
      locale: OG_LOCALE[lc],
      alternateLocale: LOCALES.filter((l) => l !== lc).map((l) => OG_LOCALE[l]),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
