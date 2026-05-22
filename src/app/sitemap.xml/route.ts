import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const URLS_PER_SITEMAP = 40_000;

/**
 * /sitemap.xml — sitemap index 파일.
 * /sitemap-pages.xml (정적 페이지) + /sitemap-hospitals-{n}.xml (병원 청크) 를 묶음.
 *
 * Next.js의 sitemap.ts metadata와 동일 경로 사용 시 충돌하므로 sitemap.ts는 제거하고
 * 모든 sitemap을 custom route handler로 운영.
 */
export async function GET() {
  let count = 0;
  try {
    const { count: c } = await supabase
      .from("hospitals")
      .select("id", { count: "exact", head: true });
    count = c ?? 0;
  } catch {}
  const chunks = Math.max(1, Math.ceil(count / URLS_PER_SITEMAP));
  const now = new Date().toISOString();

  const entries: string[] = [];
  entries.push(`  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);
  for (let i = 1; i <= chunks; i++) {
    entries.push(`  <sitemap>
    <loc>${SITE_URL}/sitemap-hospitals-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
