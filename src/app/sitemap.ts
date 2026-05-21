/**
 * 사이트맵 — 단순화 버전.
 * ko URL만 포함 (default locale). hreflang은 각 페이지 HTML link로 자동 노출.
 * Vercel ISR 한도 (5~10MB)를 넘지 않도록 alternates 제거.
 */
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSidoList, getSigguList } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const URLS_PER_SITEMAP = 40_000;

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
  } catch {
    hospitalCount = 0;
  }
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
      { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    ];
    try {
      const sidos = await getSidoList();
      for (const s of sidos) {
        const sidoPath = `/${encodeURIComponent(s.name)}`;
        urls.push({ url: `${SITE_URL}${sidoPath}`, changeFrequency: "weekly", priority: 0.8 });
        const sigus = await getSigguList(s.name);
        for (const sg of sigus) {
          urls.push({
            url: `${SITE_URL}${sidoPath}/${encodeURIComponent(sg.name)}`,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    } catch {}
    return urls;
  }

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
