import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

const URLS_PER_SITEMAP = 40_000;
const FETCH_PAGE = 1000;

type Row = { slug: string; updated_at: string };

/** 병원 청크 sitemap. URL: /sitemap-hospitals-1.xml, -2.xml, ... 각 40k URL */
export async function GET(req: NextRequest) {
  // 경로에서 id 파싱 (Next 16 typed routes 회피용)
  const m = /sitemap-hospitals-(\d+)\.xml/.exec(req.nextUrl.pathname);
  const id = Math.max(1, m ? Number.parseInt(m[1], 10) : 1);
  const startOffset = (id - 1) * URLS_PER_SITEMAP;

  const urls: string[] = [];
  try {
    for (let off = 0; off < URLS_PER_SITEMAP; off += FETCH_PAGE) {
      const from = startOffset + off;
      const to = from + FETCH_PAGE - 1;
      const { data, error } = await supabase
        .from("hospitals")
        .select("slug, updated_at")
        .order("id", { ascending: true })
        .range(from, to);
      if (error || !data || data.length === 0) break;
      for (const r of data as Row[]) {
        const lm = r.updated_at ? new Date(r.updated_at).toISOString() : null;
        urls.push(`  <url>
    <loc>${SITE_URL}/hospital/${encodeURIComponent(r.slug)}</loc>
    ${lm ? `<lastmod>${lm}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
      if (data.length < FETCH_PAGE) break;
    }
  } catch {}

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
