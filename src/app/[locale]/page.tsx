import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSidoList, getTopSearches, getTopViewedHospitals } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { HospitalCard } from "@/components/HospitalCard";
import { SpecialtyTile } from "@/components/SpecialtyTile";
import { Icon } from "@/components/Icon";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { NearbyCTA } from "@/components/NearbyCTA";
import { tSido, tSiggu, tSpecialty, tKind, pick4 } from "@/lib/i18n-dict";
import { buildPageMeta } from "@/lib/seo";
import { getHomeFAQ, getTrustBadges } from "@/lib/home-content";
import { HomeFAQ } from "@/components/HomeFAQ";
import { StatCounter } from "@/components/StatCounter";
import type { Hospital } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const meta = buildPageMeta({
    locale,
    pathSegment: "/",
    title: pick4(locale,
      "병원·의원 찾기 | 성형외과·피부과·치과·한의원 검색 — CAREMAP",
      "Find Clinics in Korea | Plastic Surgery, Dermatology, Dental — CAREMAP",
      "韓国の病院・クリニック検索 | 美容整形・皮膚科・歯科 — CAREMAP",
      "韩国诊所搜索 | 整形外科·皮肤科·牙科 — CAREMAP",
    ),
    description: pick4(locale,
      "전국 79,000여 개 병원·의원·치과·한의원을 진료과목·지역별로 무료 검색. HIRA 공공데이터 기반, 가까운 순 정렬, 실시간 후기. 성형외과·피부과·치과·안과 비급여·미용 클리닉 비교.",
      "Search 79,000+ clinics & hospitals in Korea by specialty and region — free. Based on official HIRA data, distance sorting, real reviews. Compare plastic surgery, dermatology, dental & cosmetic clinics.",
      "韓国全国79,000以上の病院・クリニックを診療科・地域別に無料検索。HIRA公共データ基盤、近い順並べ替え、リアルな口コミ。美容整形・皮膚科・歯科を比較。",
      "免费搜索韩国全国79,000多家诊所与医院,按科室和地区检索。基于HIRA官方数据、距离排序、真实评论。比较整形外科·皮肤科·牙科·美容诊所。",
    ),
  });
  // 검색엔진용 키워드 (Naver/Bing은 일부 참고, Google은 무시하지만 무해)
  return {
    ...meta,
    keywords: pick4(locale,
      "병원찾기, 의원검색, 성형외과, 피부과, 치과, 한의원, 안과, 강남 성형외과, 비급여 진료, 미용 클리닉, 병원 후기, 가까운 병원",
      "Korea clinic, plastic surgery Korea, dermatology Seoul, Gangnam clinic, Korean dental, medical tourism Korea, cosmetic surgery, hospital finder",
      "韓国 病院, 美容整形 韓国, 皮膚科 ソウル, 江南 整形, 韓国 歯科, 医療観光 韓国, 美容クリニック",
      "韩国 诊所, 整形外科 韩国, 皮肤科 首尔, 江南 整形, 韩国 牙科, 医疗旅游 韩国, 美容诊所",
    ),
  };
}

// 비급여·미용 진료 위주 (영문 라벨은 i18n-dict에서 매핑)
const SPECIALTIES: { code: string; ko: string }[] = [
  { code: "PS",  ko: "성형외과" },
  { code: "DM",  ko: "피부과" },
  { code: "DT",  ko: "치과" },
  { code: "OP",  ko: "안과" },
  { code: "KM",  ko: "한의원" },
  { code: "PSY", ko: "정신과" },
  { code: "OS",  ko: "정형외과" },
  { code: "AN",  ko: "마취통증과" },
  { code: "RM",  ko: "재활의학과" },
  { code: "UR",  ko: "비뇨의학과" },
  { code: "OB",  ko: "산부인과" },
  { code: "FM",  ko: "가정의학과" },
  { code: "ENT", ko: "이비인후과" },
  { code: "PD",  ko: "소아청소년과" },
  { code: "IM",  ko: "내과" },
  { code: "GS",  ko: "외과" },
];

// 내부 링크 허브 — 검색 수요 높은 지역×진료과 조합. 크롤러 인덱싱 + 롱테일 SEO.
const CROSS_LINKS: { sido: string; sggu: string; specialty: string }[] = [
  { sido: "서울", sggu: "강남구", specialty: "성형외과" },
  { sido: "서울", sggu: "강남구", specialty: "피부과" },
  { sido: "서울", sggu: "서초구", specialty: "성형외과" },
  { sido: "서울", sggu: "강남구", specialty: "치과" },
  { sido: "서울", sggu: "강남구", specialty: "안과" },
  { sido: "서울", sggu: "송파구", specialty: "피부과" },
  { sido: "서울", sggu: "마포구", specialty: "치과" },
  { sido: "서울", sggu: "강서구", specialty: "안과" },
  { sido: "서울", sggu: "노원구", specialty: "한의원" },
  { sido: "경기", sggu: "성남시 분당구", specialty: "피부과" },
  { sido: "경기", sggu: "용인시 수지구", specialty: "치과" },
  { sido: "경기", sggu: "수원시 영통구", specialty: "성형외과" },
  { sido: "경기", sggu: "고양시 일산동구", specialty: "피부과" },
  { sido: "부산", sggu: "해운대구", specialty: "성형외과" },
  { sido: "부산", sggu: "부산진구", specialty: "피부과" },
  { sido: "부산", sggu: "동래구", specialty: "치과" },
  { sido: "대구", sggu: "수성구", specialty: "성형외과" },
  { sido: "대구", sggu: "중구", specialty: "피부과" },
  { sido: "인천", sggu: "남동구", specialty: "치과" },
  { sido: "대전", sggu: "서구", specialty: "성형외과" },
  { sido: "광주", sggu: "서구", specialty: "피부과" },
  { sido: "제주", sggu: "제주시", specialty: "한의원" },
];

async function getAestheticClinics(limit = 6): Promise<Hospital[]> {
  try {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .in("cl_cd_nm", ["의원", "치과의원", "한의원"])
      .or(
        "yadm_nm.ilike.*성형*,yadm_nm.ilike.*피부*,yadm_nm.ilike.*치과*,yadm_nm.ilike.*안과*,yadm_nm.ilike.*미용*"
      )
      .gte("dr_tot_cnt", 3)
      .order("dr_tot_cnt", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Hospital[];
  } catch {
    return [];
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  // 하나라도 실패 시 ISR이 500을 캐싱하지 않도록 각 함수 격리.
  const [sidos, top, popularSearches, mostViewed] = await Promise.all([
    getSidoList().catch((e) => { console.error("[home] sidos:", e); return [] as Awaited<ReturnType<typeof getSidoList>>; }),
    getAestheticClinics(6).catch((e) => { console.error("[home] aesthetic:", e); return [] as Awaited<ReturnType<typeof getAestheticClinics>>; }),
    getTopSearches(8).catch((e) => { console.error("[home] topSearches:", e); return [] as Awaited<ReturnType<typeof getTopSearches>>; }),
    getTopViewedHospitals(6).catch((e) => { console.error("[home] mostViewed:", e); return [] as Awaited<ReturnType<typeof getTopViewedHospitals>>; }),
  ]);
  const totalCount = sidos.reduce((a, b) => a + b.count, 0);

  // 검색어 표시는 locale 따라 (외국어 → 해당 언어 키워드로 폼 제출 / 한국어는 원본 한국어)
  const searchKey = (ko: string) => (locale === "ko" ? ko : tSpecialty(ko, locale));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.caremap.store";
  const sitePrefix = locale === "ko" ? "" : `/${locale}`;

  const websiteLD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CAREMAP",
    url: `${siteUrl}${sitePrefix}/`,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}${sitePrefix}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationLD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Team Performance Inc.",
    alternateName: "주식회사 팀퍼포먼스",
    url: siteUrl,
    logo: `${siteUrl}/opengraph-image`,
  };

  // FAQPage JSON-LD — Google 리치 스니펫 (검색결과에서 질문 펼침 노출 → CTR↑)
  const faqItems = getHomeFAQ(locale);
  const trustBadges = getTrustBadges(locale);
  const faqLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // BreadcrumbList — 홈은 단일 노드지만 사이트 구조 신호
  const breadcrumbLD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "CAREMAP", item: `${siteUrl}${sitePrefix}/` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLD) }} />
      <section className="cm-hero">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>
          <span style={{ color: "var(--cm-primary)" }}>{t("h1Highlight")}</span> <span className="kr">{t("h1Line1")}</span><br />
          <span className="kr">{t("h1Line2")}</span>
        </h1>
        <p className="lede">{t("lede")}</p>

        <form action={locale === "ko" ? "/search" : `/${locale}/search`} method="get" className="cm-searchbar" role="search">
          <div className="field">
            <label htmlFor="q">{t("searchSpecialty")}</label>
            <SearchAutocomplete
              id="q"
              name="q"
              locale={locale}
              placeholder={t("searchSpecialtyPlaceholder")}
            />
          </div>
          <div className="field">
            <label htmlFor="area">{t("searchArea")}</label>
            <input id="area" name="area" type="search" placeholder={t("searchAreaPlaceholder")} autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="kind">{t("searchKind")}</label>
            <select id="kind" name="kind" defaultValue="">
              <option value="">{t("kindAll")}</option>
              <option value="의원">{tKind("의원", locale)}</option>
              <option value="치과의원">{tKind("치과의원", locale)}</option>
              <option value="한의원">{tKind("한의원", locale)}</option>
              <option value="병원">{tKind("병원", locale)}</option>
              <option value="종합병원">{tKind("종합병원", locale)}</option>
              <option value="상급종합">{tKind("상급종합", locale)}</option>
            </select>
          </div>
          <button type="submit" className="submit">
            <Icon name="search" size={14} color="#fff" />
            {tNav("searchButton")}
          </button>
        </form>

        <div className="cm-chips">
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
            {t("popularLabel")}:
          </span>
          {["성형외과", "피부과", "치과", "안과", "한의원"].map((c) => (
            <Link key={c} href={`/s/${encodeURIComponent(c)}`} className="cm-chip">
              {tSpecialty(c, locale)}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <NearbyCTA locale={locale} />
        </div>

        <div className="meta-row">
          <span><b>{totalCount > 0 ? totalCount.toLocaleString() : "—"}</b> {t("stat1")}</span>
          <span><b>17</b> {t("stat2")}</span>
          <span>HIRA</span>
        </div>
      </section>

      {/* 신뢰 배지 — 가치 제안 4종 (이탈률↓, 신뢰도↑) */}
      <section aria-label="trust" style={{ padding: "0 0 8px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}>
          {trustBadges.map((b) => (
            <div key={b.title} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px",
              border: "1px solid var(--cm-line)",
              borderRadius: 12,
              background: "#fff",
            }}>
              <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden>{b.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cm-ink)" }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "var(--cm-text-2)", marginTop: 2 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 애니메이션 통계 — 스크롤 진입 시 카운트업 (시각적 흥미 → 체류↑) */}
      <section className="cm-section surface" aria-label="stats">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 20,
          padding: "8px 0",
        }}>
          <StatCounter target={totalCount > 0 ? totalCount : 79688} label={pick4(locale, "등록 의료기관", "Registered clinics", "登録医療機関", "注册医疗机构")} suffix="+" />
          <StatCounter target={17} label={pick4(locale, "광역시·도 커버", "Provinces covered", "広域市・道", "覆盖省市")} />
          <StatCounter target={16} label={pick4(locale, "진료과목", "Specialties", "診療科", "科室")} />
          <StatCounter target={4} label={pick4(locale, "지원 언어", "Languages", "対応言語", "支持语言")} />
        </div>
      </section>

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>{t("specialtiesTitle")}</h2>
            <div className="sub">{t("specialtiesSub")}</div>
          </div>
        </div>
        <div className="cm-spec-grid">
          {SPECIALTIES.map((s) => (
            <SpecialtyTile
              key={s.ko}
              code={s.code}
              name={tSpecialty(s.ko, locale)}
              href={`/s/${encodeURIComponent(s.ko)}`}
            />
          ))}
        </div>
      </section>

      {/* 실시간 인기 검색어 (최근 7일) */}
      {popularSearches.length > 0 && (
        <section className="cm-section">
          <div className="section-head">
            <div>
              <h2>{pick4(locale, "실시간 인기 검색어", "Trending Searches", "人気の検索", "热门搜索")}</h2>
              <div className="sub">{pick4(locale, "최근 7일 기준", "Last 7 days", "過去7日間", "近7天")}</div>
            </div>
          </div>
          <ol style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 8,
            padding: 0,
            listStyle: "none",
            margin: 0,
          }}>
            {popularSearches.map((s, i) => (
              <li key={s.query}>
                <Link
                  href={`/search?q=${encodeURIComponent(s.query)}`}
                  className="cm-xlink"
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: 4,
                    background: i < 3 ? "var(--cm-primary)" : "var(--cm-surface-2)",
                    color: i < 3 ? "#fff" : "var(--cm-text-2)",
                    display: "grid", placeItems: "center",
                    fontSize: 12, fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}>{i + 1}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.query}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--cm-text-3)" }}>
                    {s.cnt.toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {top.length > 0 && (
        <section className="cm-section surface">
          <div className="section-head">
            <div>
              <h2>{t("recommendTitle")}</h2>
              <div className="sub">{t("recommendSub")}</div>
            </div>
            <Link href="/search" className="seeall">{t("seeAll")} <Icon name="arrow-r" size={12} /></Link>
          </div>
          <div className="cm-card-grid">
            {top.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        </section>
      )}

      {/* 많이 본 클리닉 (최근 7일) — 실제 페이지뷰 기반 */}
      {mostViewed.length > 0 && (
        <section className="cm-section">
          <div className="section-head">
            <div>
              <h2>{pick4(locale, "많이 본 클리닉", "Most Viewed Clinics", "よく見られているクリニック", "高人气诊所")}</h2>
              <div className="sub">{pick4(locale, "최근 7일 조회수 상위", "Trending in the last 7 days", "過去7日間で人気", "近7天关注度高")}</div>
            </div>
          </div>
          <div className="cm-card-grid">
            {mostViewed.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        </section>
      )}

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>{t("regionLinksTitle")}</h2>
            <div className="sub">{t("regionLinksSub")}</div>
          </div>
        </div>
        <div className="cm-xlink-grid">
          {CROSS_LINKS.map((c) => (
            <Link
              key={`${c.sido}-${c.sggu}-${c.specialty}`}
              href={`/${encodeURIComponent(c.sido)}/${encodeURIComponent(c.sggu)}/${encodeURIComponent(c.specialty)}`}
              className="cm-xlink"
            >
              <span>{tSiggu(c.sggu, locale)} {tSpecialty(c.specialty, locale)}</span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {sidos.length > 0 && (
        <section className="cm-section surface">
          <div className="section-head">
            <div>
              <h2>{t("sidoListTitle")}</h2>
              <div className="sub">{t("sidoListSub")}</div>
            </div>
          </div>
          <div className="cm-xlink-grid">
            {sidos.slice(0, 16).map((s) => (
              <Link key={s.name} href={`/${encodeURIComponent(s.name)}`} className="cm-xlink">
                <span>{tSido(s.name, locale)}</span>
                <span className="arrow">{s.count.toLocaleString()} →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 진료과별 가이드 허브 — 의료관광 콘텐츠 깊이 (체류↑ + 롱테일 키워드) */}
      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>{pick4(locale, "진료과별 가이드", "Treatment Guides", "診療科ガイド", "诊疗指南")}</h2>
            <div className="sub">{pick4(locale, "비용·시술·클리닉 선택 팁", "Costs, procedures & how to choose", "費用・施術・選び方", "费用·术式·选择技巧")}</div>
          </div>
        </div>
        <div className="cm-xlink-grid">
          {[
            { slug: "plastic-surgery", ko: "성형외과 가이드", en: "Plastic Surgery", ja: "美容整形ガイド", zh: "整形外科指南" },
            { slug: "dermatology", ko: "피부과 가이드", en: "Dermatology", ja: "皮膚科ガイド", zh: "皮肤科指南" },
            { slug: "dental", ko: "치과 가이드", en: "Dental Care", ja: "歯科ガイド", zh: "牙科指南" },
            { slug: "ophthalmology", ko: "안과·시력교정 가이드", en: "Eye & Vision", ja: "眼科ガイド", zh: "眼科指南" },
            { slug: "korean-medicine", ko: "한의원 가이드", en: "Korean Medicine", ja: "韓医院ガイド", zh: "韩医院指南" },
          ].map((g) => (
            <Link key={g.slug} href={`/guide/${g.slug}`} className="cm-xlink">
              <span>{pick4(locale, g.ko, g.en, g.ja, g.zh)}</span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ 아코디언 — FAQPage 리치 스니펫 + 체류시간 (위에서 JSON-LD 주입됨) */}
      <HomeFAQ locale={locale} items={faqItems} />
    </>
  );
}
