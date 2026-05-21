/**
 * 다국어 사이트맵 — 모든 URL에 hreflang alternates 포함.
 * 구조:
 *  - /sitemap/0.xml  : 정적 + 시도 + 시군구 (× 4 locale)
 *  - /sitemap/N.xml  : 병원 상세 (× 4 locale)
 */
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSidoList, getSigguList } from "@/lib/db";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const URLS_PER_SITEMAP = 10_000; // 4 locales × 10k = 40k URLs per sitemap (Google 50k 한도)

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

/** locale-prefixed URL 생성 (ko는 prefix 없음) */
function localizedUrl(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return `${SITE_URL}${path}`;
  return `${SITE_URL}/${locale}${path}`;
}

/** 다국어 alternates 생성 (Google hreflang) */
function alternatesForPath(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localizedUrl(l, path);
  }
  return { languages };
}

function makeEntry(
  path: string,
  opts: Partial<Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority" | "lastModified">> = {},
): MetadataRoute.Sitemap[number][] {
  // 각 locale마다 entry 생성 + alternates 공유
  return routing.locales.map((locale) => ({
    url: localizedUrl(locale, path),
    alternates: alternatesForPath(path),
    ...opts,
  }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const idStr = await props.id;
  const id = Number(idStr);

  if (id === 0) {
    const urls: MetadataRoute.Sitemap = [
      ...makeEntry("/", { changeFrequency: "daily", priority: 1.0 }),
      ...makeEntry("/search", { changeFrequency: "weekly", priority: 0.5 }),
    ];
    try {
      const sidos = await getSidoList();
      for (const s of sidos) {
        const sidoPath = `/${encodeURIComponent(s.name)}`;
        urls.push(...makeEntry(sidoPath, { changeFrequency: "weekly", priority: 0.8 }));
        const sigus = await getSigguList(s.name);
        for (const sg of sigus) {
          urls.push(...makeEntry(`${sidoPath}/${encodeURIComponent(sg.name)}`,
            { changeFrequency: "weekly", priority: 0.7 }));
        }
      }
    } catch {}
    return urls;
  }

  // 병원 상세
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
        const path = `/hospital/${encodeURIComponent(r.slug)}`;
        const lastModified = r.updated_at ? new Date(r.updated_at) : undefined;
        urls.push(...makeEntry(path, { changeFrequency: "monthly", priority: 0.6, lastModified }));
      }
      if (data.length < pageSize) break;
    }
  } catch {}
  return urls;
}
