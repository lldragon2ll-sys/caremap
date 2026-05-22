import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { GUIDES } from "@/lib/guides";
import { REGION_GUIDES } from "@/lib/region-guides";
import { pick4 } from "@/lib/i18n-dict";
import { buildPageMeta, SITE_URL } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMeta({
    locale,
    pathSegment: "/guide",
    title: pick4(locale, "진료과 가이드", "Specialty Guides", "診療科ガイド", "科室指南"),
    description: pick4(locale,
      "한국 비급여·미용 의료 진료과별 가이드. 시술 종류·비용·클리닉 선택법.",
      "Guides to Korean cosmetic and out-of-pocket medical specialties. Procedures, costs and how to choose a clinic.",
      "韓国の自由診療・美容医療診療科ガイド。施術・費用・クリニック選び。",
      "韩国自费·美容医疗科室指南。术式·费用·诊所选择。",
    ),
  });
}

export default async function GuideIndex({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale as "ko" | "en" | "ja" | "zh";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
        {pick4(lang, "진료과 가이드", "Specialty Guides", "診療科ガイド", "科室指南")}
      </h1>
      <p style={{ fontSize: 15, color: "var(--cm-text-2)", marginBottom: 32 }}>
        {pick4(lang,
          "병원을 고르기 전, 진료과별 기본 정보부터 확인하세요.",
          "Get an overview of each specialty before choosing a clinic.",
          "クリニックを選ぶ前に、診療科ごとの基本情報をご確認ください。",
          "选择诊所前,先了解各科室基本信息。",
        )}
      </p>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>
        {pick4(lang, "진료과 가이드", "By Specialty", "診療科ガイド", "按科室")}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 40 }}>
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guide/${g.slug}`} style={{
            border: "1px solid var(--cm-line)", borderRadius: 12, padding: 18,
            background: "#fff", textDecoration: "none", color: "var(--cm-ink)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {g.title[lang] ?? g.title.ko}
            </div>
            <div style={{ fontSize: 13, color: "var(--cm-text-2)", lineHeight: 1.55 }}>
              {(g.lede[lang] ?? g.lede.ko).slice(0, 100)}…
            </div>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>
        {pick4(lang, "지역별 의료관광", "By Region (Medical Tourism)", "地域別医療観光", "按地区(医疗旅游)")}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {REGION_GUIDES.map((g) => (
          <Link key={g.slug} href={`/guide/region/${g.slug}`} style={{
            border: "1px solid var(--cm-line)", borderRadius: 12, padding: 18,
            background: "#fff", textDecoration: "none", color: "var(--cm-ink)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {g.title[lang] ?? g.title.ko}
            </div>
            <div style={{ fontSize: 13, color: "var(--cm-text-2)", lineHeight: 1.55 }}>
              {(g.lede[lang] ?? g.lede.ko).slice(0, 100)}…
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
