import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { REGION_GUIDES, getRegionGuide } from "@/lib/region-guides";
import { tSido } from "@/lib/i18n-dict";

type Params = Promise<{ locale: string; slug: string }>;
export const dynamic = "force-static";

export function generateStaticParams() {
  return REGION_GUIDES.map((g) => ({ slug: g.slug }));
}

function pickLocaleStr(o: { ko: string; en: string; ja: string; zh: string }, lang: "ko" | "en" | "ja" | "zh"): string {
  return o[lang] ?? o.ko;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = getRegionGuide(slug);
  if (!g) return { title: "Region Guide" };
  const lang = locale as "ko" | "en" | "ja" | "zh";
  return {
    title: pickLocaleStr(g.title, lang),
    description: pickLocaleStr(g.lede, lang),
  };
}

export default async function RegionGuidePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const g = getRegionGuide(slug);
  if (!g) notFound();

  const lang = locale as "ko" | "en" | "ja" | "zh";
  const tNav = await getTranslations("nav");

  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
      <nav style={{ fontSize: 12.5, color: "var(--cm-text-2)", marginBottom: 12 }}>
        <Link href="/" style={{ color: "var(--cm-text-2)" }}>{tNav("home")}</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link href="/guide" style={{ color: "var(--cm-text-2)" }}>
          {lang === "en" ? "Guides" : lang === "ja" ? "ガイド" : lang === "zh" ? "指南" : "가이드"}
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{tSido(g.region, locale)}</span>
      </nav>

      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
        {pickLocaleStr(g.title, lang)}
      </h1>
      <p style={{ fontSize: 16, color: "var(--cm-text)", lineHeight: 1.7, marginBottom: 32 }}>
        {pickLocaleStr(g.lede, lang)}
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
        {lang === "en" ? "Highlights" : lang === "ja" ? "ハイライト" : lang === "zh" ? "亮点" : "주요 특징"}
      </h2>
      <ul style={{ fontSize: 14.5, lineHeight: 1.8, color: "var(--cm-text)", paddingLeft: 18, marginBottom: 28 }}>
        {g.highlights.map((h, i) => <li key={i}>{pickLocaleStr(h, lang)}</li>)}
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
        {lang === "en" ? "Getting Here" : lang === "ja" ? "アクセス" : lang === "zh" ? "交通" : "오시는 길"}
      </h2>
      <p style={{ fontSize: 14.5, color: "var(--cm-text)", marginBottom: 32 }}>
        {pickLocaleStr(g.airport, lang)}
      </p>

      <div style={{
        background: "var(--cm-primary-50)", borderRadius: 12, padding: 20,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <strong style={{ fontSize: 15 }}>
          {lang === "en" ? `Browse ${tSido(g.region, locale)} clinics`
            : lang === "ja" ? `${tSido(g.region, locale)}のクリニックを見る`
            : lang === "zh" ? `查看${tSido(g.region, locale)}诊所`
            : `${tSido(g.region, locale)} 병원 둘러보기`}
        </strong>
        <Link href={`/${encodeURIComponent(g.region)}`} style={{
          background: "var(--cm-primary)", color: "#fff", textDecoration: "none",
          padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
          alignSelf: "flex-start",
        }}>
          {tSido(g.region, locale)} →
        </Link>
      </div>
    </article>
  );
}
