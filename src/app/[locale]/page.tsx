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
import type { Hospital } from "@/lib/types";

export const revalidate = 3600;

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

const CROSS_LINKS: { sido: string; sggu: string; specialty: string }[] = [
  { sido: "서울", sggu: "강남구", specialty: "성형외과" },
  { sido: "서울", sggu: "강남구", specialty: "피부과" },
  { sido: "서울", sggu: "서초구", specialty: "성형외과" },
  { sido: "서울", sggu: "강남구", specialty: "치과" },
  { sido: "서울", sggu: "송파구", specialty: "피부과" },
  { sido: "서울", sggu: "마포구", specialty: "치과" },
  { sido: "경기", sggu: "성남시 분당구", specialty: "피부과" },
  { sido: "경기", sggu: "용인시 수지구", specialty: "치과" },
  { sido: "부산", sggu: "해운대구", specialty: "성형외과" },
  { sido: "부산", sggu: "부산진구", specialty: "피부과" },
  { sido: "대구", sggu: "수성구", specialty: "성형외과" },
  { sido: "인천", sggu: "남동구", specialty: "치과" },
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
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const [sidos, top, popularSearches, mostViewed] = await Promise.all([
    getSidoList().catch(() => []),
    getAestheticClinics(6),
    getTopSearches(8),
    getTopViewedHospitals(6),
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLD) }} />
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
            <Link key={c} href={`/search?q=${encodeURIComponent(searchKey(c))}`} className="cm-chip">
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
              href={`/search?q=${encodeURIComponent(searchKey(s.ko))}`}
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
    </>
  );
}
