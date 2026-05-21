/**
 * 사이트맵 — Next.js 16 내장 generateSitemaps 사용
 *
 * 구조:
 *  - /sitemap/0.xml  : 정적 페이지 + 시도 + 시군구
 *  - /sitemap/1.xml ~ : 병원 상세 페이지 50,000 URL씩 분할 (8만 건 → 2개 분할)
 *
 * Google 한도: 1 sitemap = 50,000 URL.
 * next-sitemap 패키지 대신 내장 API를 쓰는 이유:
 *   - 동적 데이터(병원 8만)를 빌드 시점이 아닌 요청 시점에 생성 (ISR 친화적)
 *   - App Router와 통합 — 별도 빌드 스크립트 불필요
 */
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSidoList, getSigguList } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const URLS_PER_SITEMAP = 45_000; // 여유 5천

async function countHospitals(): Promise<number> {
  const { count, error } = await supabase
    .from("hospitals")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function generateSitemaps() {
  // 0번 = 인덱스/지역 페이지, 1번부터 = 병원 상세 분할
  let hospitalCount = 0;
  try {
    hospitalCount = await countHospitals();
  } catch {
    hospitalCount = 0;
  }
  const hospitalChunks = Math.max(1, Math.ceil(hospitalCount / URLS_PER_SITEMAP));
  const ids = [0];
  for (let i = 1; i <= hospitalChunks; i++) ids.push(i);
  return ids.map((id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const idStr = await props.id;
  const id = Number(idStr);

  if (id === 0) {
    // 정적 + 지역 페이지
    const urls: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
      { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    ];
    try {
      const sidos = await getSidoList();
      for (const s of sidos) {
        const sidoUrl = `${SITE_URL}/${encodeURIComponent(s.name)}`;
        urls.push({ url: sidoUrl, changeFrequency: "weekly", priority: 0.8 });
        const sigus = await getSigguList(s.name);
        for (const sg of sigus) {
          urls.push({
            url: `${sidoUrl}/${encodeURIComponent(sg.name)}`,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    } catch {
      // DB 미연결 — 정적만 반환
    }
    return urls;
  }

  // 병원 상세 분할
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
  } catch {
    // DB 미연결 — 빈 사이트맵
  }
  return urls;
}
