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

type Entry = { url: string; freq?: string; pri?: number };

function xmlEntry(e: Entry): string {
  return `  <url>
    <loc>${e.url}</loc>
    ${e.freq ? `<changefreq>${e.freq}</changefreq>` : ""}
    ${e.pri != null ? `<priority>${e.pri}</priority>` : ""}
  </url>`;
}

/**
 * 정적 페이지 sitemap — 핵심 SEO 자산 (1,500+ URL):
 *   홈/about/guide/register/advertise/terms/privacy
 *   가이드 진료과 5종 + 지역 의료관광 3종
 *   /s/{specialty} 진료과 허브 9종
 *   시·도 17 + 시·군·구 전체 + 시군구 × 핫진료과 6종
 */
export async function GET() {
  const entries: Entry[] = [
    { url: `${SITE_URL}/`, freq: "daily", pri: 1.0 },
    { url: `${SITE_URL}/about`, freq: "monthly", pri: 0.5 },
    { url: `${SITE_URL}/guide`, freq: "weekly", pri: 0.7 },
    { url: `${SITE_URL}/register`, freq: "monthly", pri: 0.3 },
    { url: `${SITE_URL}/advertise`, freq: "monthly", pri: 0.3 },
    { url: `${SITE_URL}/terms`, freq: "yearly", pri: 0.2 },
    { url: `${SITE_URL}/privacy`, freq: "yearly", pri: 0.2 },
  ];

  for (const g of GUIDES) {
    entries.push({ url: `${SITE_URL}/guide/${g.slug}`, freq: "monthly", pri: 0.7 });
  }
  for (const g of REGION_GUIDES) {
    entries.push({ url: `${SITE_URL}/guide/region/${g.slug}`, freq: "monthly", pri: 0.6 });
  }
  for (const sp of SPECIALTY_HUBS) {
    entries.push({ url: `${SITE_URL}/s/${encodeURIComponent(sp)}`, freq: "weekly", pri: 0.85 });
  }

  try {
    const sidos = await getSidoList();
    for (const s of sidos) {
      const sidoPath = `/${encodeURIComponent(s.name)}`;
      entries.push({ url: `${SITE_URL}${sidoPath}`, freq: "weekly", pri: 0.8 });
      const sigus = await getSigguList(s.name);
      for (const sg of sigus) {
        const sigguPath = `${sidoPath}/${encodeURIComponent(sg.name)}`;
        entries.push({ url: `${SITE_URL}${sigguPath}`, freq: "weekly", pri: 0.7 });
        for (const sp of HOT_SPECIALTIES) {
          entries.push({
            url: `${SITE_URL}${sigguPath}/${encodeURIComponent(sp)}`,
            freq: "weekly",
            pri: 0.75,
          });
        }
      }
    }
  } catch {}

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(xmlEntry).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
