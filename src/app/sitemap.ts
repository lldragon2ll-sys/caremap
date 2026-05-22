/**
 * 사이트맵 — index + chunked.
 * ko URL 정규 출력 (default locale). hreflang은 각 페이지 head link로 자동 노출.
 *
 * id=0: 정적 URL (홈/about/guide 8종/specialty 허브 9종/시도 17/시군구) + sitemap의 핵심 SEO 자산
 * id=1..N: 병원 상세 (URLS_PER_SITEMAP씩 분할)
 *
 * /search는 noindex이므로 sitemap에서 제외.
 */
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSidoList, getSigguList } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";
import { REGION_GUIDES } from "@/lib/region-guides";

const URLS_PER_SITEMAP = 40_000;

/** 전국 specialty hub 진료과 9종 (네비/푸터 정규화 대상) */
const SPECIALTY_HUBS = [
  "성형외과", "피부과", "치과", "안과", "한의원",
  "정형외과", "산부인과", "소아청소년과", "이비인후과",
];

/** 시·도 × 핵심 진료과 6종 (강력한 SEO 타겟 URL) */
const HOT_SPECIALTIES = ["성형외과", "피부과", "치과", "안과", "한의원", "치과교정과"];

async function countHospitals(): Promise<number> {
  const { count, error } = await supabase
    .from("hospitals")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function generateSitemaps() {
  let hospitalCount = 0;
  try {
    hospitalCount = await countHospitals();
  } catch {}
  const chunks = Math.max(1, Math.ceil(hospitalCount / URLS_PER_SITEMAP));
  const ids = [0];
  for (let i = 1; i <= chunks; i++) ids.push(i);
  return ids.map((id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const idStr = await props.id;
  const id = Number(idStr);

  if (id === 0) {
    const urls: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
      { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${SITE_URL}/guide`, changeFrequency: "weekly", priority: 0.7 },
      { url: `${SITE_URL}/register`, changeFrequency: "monthly", priority: 0.3 },
      { url: `${SITE_URL}/advertise`, changeFrequency: "monthly", priority: 0.3 },
      { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
      { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ];

    // 가이드 (진료과 + 지역 의료관광)
    for (const g of GUIDES) {
      urls.push({ url: `${SITE_URL}/guide/${g.slug}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const g of REGION_GUIDES) {
      urls.push({ url: `${SITE_URL}/guide/region/${g.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }

    // 전국 진료과 허브
    for (const sp of SPECIALTY_HUBS) {
      urls.push({
        url: `${SITE_URL}/s/${encodeURIComponent(sp)}`,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }

    // 시·도 + 시·군·구 + 시·군·구 × 핫 진료과
    try {
      const sidos = await getSidoList();
      for (const s of sidos) {
        const sidoPath = `/${encodeURIComponent(s.name)}`;
        urls.push({ url: `${SITE_URL}${sidoPath}`, changeFrequency: "weekly", priority: 0.8 });
        const sigus = await getSigguList(s.name);
        for (const sg of sigus) {
          const sigguPath = `${sidoPath}/${encodeURIComponent(sg.name)}`;
          urls.push({
            url: `${SITE_URL}${sigguPath}`,
            changeFrequency: "weekly",
            priority: 0.7,
          });
          // 핫 진료과 × 시군구 — 강력한 SEO 타겟
          for (const sp of HOT_SPECIALTIES) {
            urls.push({
              url: `${SITE_URL}${sigguPath}/${encodeURIComponent(sp)}`,
              changeFrequency: "weekly",
              priority: 0.75,
            });
          }
        }
      }
    } catch {}
    return urls;
  }

  // 병원 상세 (chunked)
  const offset = (id - 1) * URLS_PER_SITEMAP;
  const pageSize = 1000;
  const urls: MetadataRoute.Sitemap = [];
  try {
    for (let off = 0; off < URLS_PER_SITEMAP; off += pageSize) {
      const from = offset + off;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("hospitals")
        .select("slug, updated_at")
        .order("id", { ascending: true })
        .range(from, to);
      if (error) break;
      if (!data || data.length === 0) break;
      for (const r of data as { slug: string; updated_at: string }[]) {
        urls.push({
          url: `${SITE_URL}/hospital/${encodeURIComponent(r.slug)}`,
          lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
      if (data.length < pageSize) break;
    }
  } catch {}
  return urls;
}
