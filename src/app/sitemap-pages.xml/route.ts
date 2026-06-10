import { getSidoList, getSigguList } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";
import { REGION_GUIDES } from "@/lib/region-guides";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const SPECIALTY_HUBS = [
  "성형외과", "피부과", "치과", "안과", "한의원",
  "정형외과", "산부인과", "소아청소년과", "이비인후과",
];
const HOT_SPECIALTIES = ["성형외과", "피부과", "치과", "안과", "한의원", "치과교정과"];

const LOCALES = ["ko", "en", "ja", "zh"] as const;
const HREFLANG: Record<string, string> = { ko: "ko-KR", en: "en-US", ja: "ja-JP", zh: "zh-CN" };

/** path는 슬래시로 시작하는 segment ("/", "/about", "/서울/강남구"). */
type Entry = { path: string; freq?: string; pri?: number };

function localeUrl(locale: string, path: string): string {
  if (locale === "ko") return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  return path === "/" ? `${SITE_URL}/${locale}` : `${SITE_URL}/${locale}${path}`;
}

/**
 * 각 URL을 4개 언어 + x-default hreflang 대체링크와 함께 출력.
 * → Google/Bing이 한 페이지의 다국어 버전을 인식 → 해외 검색 노출 강화.
 * (Google 권장: sitemap에 xhtml:link alternate 명시)
 */
function xmlEntry(e: Entry): string {
  const alternates = [
    ...LOCALES.map((lc) =>
      `    <xhtml:link rel="alternate" hreflang="${HREFLANG[lc]}" href="${localeUrl(lc, e.path)}"/>`
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl("ko", e.path)}"/>`,
  ].join("\n");

  // 각 언어 버전을 개별 <url>로도 등록 (색인 커버리지↑)
  return LOCALES.map((lc) => `  <url>
    <loc>${localeUrl(lc, e.path)}</loc>
${alternates}
    ${e.freq ? `<changefreq>${e.freq}</changefreq>` : ""}
    ${e.pri != null ? `<priority>${e.pri}</priority>` : ""}
  </url>`).join("\n");
}

/**
 * 정적 페이지 sitemap — 국제 SEO 강화 (각 URL × 4언어 + hreflang):
 *   홈/about/guide/register/advertise/terms/privacy/community
 *   가이드 진료과 5종 + 지역 의료관광 3종
 *   /s/{specialty} 진료과 허브 9종
 *   시·도 17 + 시·군·구 전체 + 시군구 × 핫진료과 6종
 */
export async function GET() {
  const entries: Entry[] = [
    { path: `/`, freq: "daily", pri: 1.0 },
    { path: `/about`, freq: "monthly", pri: 0.5 },
    { path: `/guide`, freq: "weekly", pri: 0.7 },
    { path: `/community`, freq: "daily", pri: 0.7 },
    { path: `/register`, freq: "monthly", pri: 0.3 },
    { path: `/advertise`, freq: "monthly", pri: 0.3 },
    { path: `/terms`, freq: "yearly", pri: 0.2 },
    { path: `/privacy`, freq: "yearly", pri: 0.2 },
  ];

  for (const g of GUIDES) {
    entries.push({ path: `/guide/${g.slug}`, freq: "monthly", pri: 0.7 });
  }
  for (const g of REGION_GUIDES) {
    entries.push({ path: `/guide/region/${g.slug}`, freq: "monthly", pri: 0.6 });
  }
  for (const sp of SPECIALTY_HUBS) {
    entries.push({ path: `/s/${encodeURIComponent(sp)}`, freq: "weekly", pri: 0.85 });
  }

  try {
    const sidos = await getSidoList();
    for (const s of sidos) {
      const sidoPath = `/${encodeURIComponent(s.name)}`;
      entries.push({ path: sidoPath, freq: "weekly", pri: 0.8 });
      const sigus = await getSigguList(s.name);
      for (const sg of sigus) {
        const sigguPath = `${sidoPath}/${encodeURIComponent(sg.name)}`;
        entries.push({ path: sigguPath, freq: "weekly", pri: 0.7 });
        for (const sp of HOT_SPECIALTIES) {
          entries.push({
            path: `${sigguPath}/${encodeURIComponent(sp)}`,
            freq: "weekly",
            pri: 0.75,
          });
        }
      }
    }
  } catch {}

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(xmlEntry).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
