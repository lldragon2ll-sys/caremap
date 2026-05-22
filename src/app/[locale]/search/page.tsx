import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { supabase } from "@/lib/supabase";
import { searchHospitals } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { HospitalMap, type MapPin } from "@/components/HospitalMap";
import { SearchTracker } from "@/components/SearchTracker";
import { SearchResultsClient } from "@/components/SearchResultsClient";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { tKind, searchKeyToKorean, pick4 } from "@/lib/i18n-dict";
import type { Hospital } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  area?: string;
  kind?: string;
  page?: string;
}>;
type Params = Promise<{ locale: string }>;

const PAGE_SIZE = 30;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { locale } = await params;
  const { q, area, kind } = await searchParams;
  const t = await getTranslations({ locale, namespace: "search" });
  const term = [kind, area, q].filter(Boolean).join(" ");
  return {
    title: term ? `'${term}' — ${t("title")}` : t("title"),
    description: pick4(locale,
      "병원명, 지역, 진료과목으로 전국 병원을 검색하세요.",
      "Search clinics by name, region or specialty across Korea.",
      "クリニック名・地域・診療科で韓国全国のクリニックを検索。",
      "按诊所名、地区或科室搜索韩国全国诊所。",
    ),
    robots: { index: false, follow: true },
  };
}

async function performSearch(
  q: string, area: string, kind: string, offset: number, limit: number,
  locale: string,
): Promise<{ rows: Hospital[]; total: number }> {
  if (q) {
    // 영문/일본어/중국어 키워드를 한국어로 매핑 — DB가 한국어 데이터
    const koreanTerms = searchKeyToKorean(q, locale);
    // 모든 매칭 후보로 OR 검색
    const seen = new Set<number>();
    const merged: Hospital[] = [];
    for (const term of koreanTerms) {
      const res = await searchHospitals(term, limit * 4, 0);
      for (const r of res.rows) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          merged.push(r);
        }
      }
    }
    let rows = merged;
    if (area) {
      const areaTerms = searchKeyToKorean(area, locale);
      rows = rows.filter((r) => areaTerms.some((t) => (r.sggu_cd_nm ?? "").includes(t)));
    }
    if (kind) rows = rows.filter((r) => (r.cl_cd_nm ?? "") === kind);
    return { rows: rows.slice(offset, offset + limit), total: rows.length };
  }
  let qb = supabase
    .from("hospitals")
    .select("*", { count: "exact" })
    .order("dr_tot_cnt", { ascending: false })
    .range(offset, offset + limit - 1);
  if (area) qb = qb.ilike("sggu_cd_nm", `%${area}%`);
  if (kind) qb = qb.eq("cl_cd_nm", kind);
  const { data, error, count } = await qb;
  if (error) throw error;
  return { rows: (data ?? []) as Hospital[], total: count ?? 0 };
}

function makeMapPins(rows: Hospital[], localePrefix: string): MapPin[] {
  return rows
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => r.x_pos != null && r.y_pos != null)
    .slice(0, 30)
    .map(({ r, idx }) => ({
      id: r.id,
      lat: r.y_pos as number,
      lng: r.x_pos as number,
      label: String(idx + 1),
      popup: r.yadm_nm,
      href: `${localePrefix}/hospital/${encodeURIComponent(r.slug)}`,
    }));
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("search");
  const tNav = await getTranslations("nav");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const area = (sp.area ?? "").trim();
  const kind = (sp.kind ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  let rows: Hospital[] = [];
  let total = 0;
  let error: string | null = null;
  const hasQuery = q.length > 0 || area.length > 0 || kind.length > 0;

  if (hasQuery) {
    try {
      const res = await performSearch(q, area, kind, offset, PAGE_SIZE, locale);
      rows = res.rows;
      total = res.total;
    } catch (e) {
      error = e instanceof Error ? e.message : "error";
    }
  }

  const localePrefix = locale === "ko" ? "" : `/${locale}`;
  const pins = makeMapPins(rows, localePrefix);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showMap = pins.length >= 2;

  const headTitle = (() => {
    if (!hasQuery) return t("title");
    const parts: string[] = [];
    if (area) parts.push(area);
    if (kind) parts.push(tKind(kind, locale));
    if (q) parts.push(q);
    return parts.join(" ");
  })();

  const suggestions = (() => {
    if (locale === "en") return ["Internal Medicine", "Plastic Surgery", "Dental", "Korean Medicine", "Pediatrics"];
    if (locale === "ja") return ["内科", "美容外科", "歯科", "韓医院", "小児科"];
    if (locale === "zh") return ["内科", "整形外科", "牙科", "韩医院", "儿科"];
    return ["내과", "성형외과", "치과", "한의원", "소아청소년과"];
  })();

  return (
    <div className={`cm-split${showMap ? "" : " no-map"}`}>
      <SearchTracker q={q} area={area} kind={kind} locale={locale} />
      <div className="results">
        <div className="results-head">
          <div className="crumbs">
            <Link href="/">{tNav("home")}</Link>
            <span> › </span>
            {area ? <span>{area}</span> : <span>{t("title")}</span>}
            {kind && (
              <>
                <span> › </span>
                <span>{tKind(kind, locale)}</span>
              </>
            )}
          </div>
          <h1>{headTitle}</h1>
          <div className="count">
            {hasQuery
              ? <>{t("totalCount", { count: total.toLocaleString() })}</>
              : t("enterQuery")}
            {error && <span style={{ color: "var(--cm-red)" }}> · {error}</span>}
          </div>

          <form action={locale === "ko" ? "/search" : `/${locale}/search`} method="get" style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <SearchAutocomplete
                name="q"
                locale={locale}
                defaultValue={q}
                placeholder={t("qPlaceholder")}
                className="cm-filter-chip"
                inputStyle={{ width: "100%", padding: "6px 12px" }}
              />
            </div>
            <input
              name="area" defaultValue={area} placeholder={t("areaPlaceholder")}
              className="cm-filter-chip"
              style={{ minWidth: 100, padding: "6px 12px" }}
            />
            <button type="submit" className="cm-filter-chip active" style={{ cursor: "pointer" }}>
              <Icon name="search" size={11} color="#fff" /> {tNav("searchButton")}
            </button>
          </form>

          <div className="filters">
            <FilterLink locale={locale} params={{ q, area, kind: "" }} active={!kind}>
              {pick4(locale, "전체", "All", "すべて", "全部")}
            </FilterLink>
            {["의원", "치과의원", "한의원", "병원", "종합병원", "상급종합"].map((k) => (
              <FilterLink locale={locale} key={k} params={{ q, area, kind: k }} active={kind === k}>
                {tKind(k, locale)}
              </FilterLink>
            ))}
          </div>
        </div>

        {hasQuery && rows.length === 0 && !error && (
          <div style={{ padding: "56px 24px 48px", textAlign: "center" }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--cm-text-3)"
              strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              style={{ margin: "0 auto 14px", opacity: 0.65 }} aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
              <path d="M9 11h4" opacity="0.5" />
            </svg>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>{t("empty")}</h2>
            <p style={{ fontSize: 13.5, color: "var(--cm-text-2)", margin: "0 0 22px", lineHeight: 1.55, maxWidth: 360, marginInline: "auto" }}>
              {t("emptyDesc")}
            </p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              {suggestions.map((c) => (
                <Link key={c} href={`/search?q=${encodeURIComponent(c)}`} className="cm-chip">
                  {c}
                </Link>
              ))}
            </div>
            <Link
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13.5, fontWeight: 600,
                color: "var(--cm-primary)", textDecoration: "none",
              }}
            >
              ← {tNav("home")}
            </Link>
          </div>
        )}

        {rows.length > 0 && (
          <SearchResultsClient
            rows={rows}
            locale={locale}
            searchQuery={{ q, area, kind }}
            serverPagination={{ page, totalPages }}
          />
        )}
      </div>

      {showMap && (
        <div style={{ position: "relative", minHeight: 400 }}>
          <HospitalMap pins={pins} height="calc(100vh - 64px)" />
          <span className="map-search-here" style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 1000, pointerEvents: "none" }}>
            <Icon name="search" size={13} color="#fff" /> {t("mapNote", { n: pins.length })}
          </span>
        </div>
      )}
    </div>
  );
}

function buildHref(p: { q?: string; area?: string; kind?: string; page?: number }): string {
  const u = new URLSearchParams();
  if (p.q) u.set("q", p.q);
  if (p.area) u.set("area", p.area);
  if (p.kind) u.set("kind", p.kind);
  if (p.page && p.page > 1) u.set("page", String(p.page));
  const qs = u.toString();
  return qs ? `/search?${qs}` : "/search";
}

function FilterLink({
  locale, params, active, children,
}: {
  locale: string;
  params: { q?: string; area?: string; kind?: string };
  active: boolean;
  children: React.ReactNode;
}) {
  // 의도적으로 locale 변수는 미사용 (Link가 자동으로 locale-prefix 처리)
  void locale;
  return (
    <Link href={buildHref(params)} className={`cm-filter-chip${active ? " active" : ""}`}>
      {children}
    </Link>
  );
}
