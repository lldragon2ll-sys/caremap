import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { searchHospitals } from "@/lib/db";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { HospitalLogo } from "@/components/HospitalLogo";
import { sizeCategory } from "@/lib/hospital-util";
import type { Hospital } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  area?: string;
  kind?: string;
  page?: string;
}>;

const PAGE_SIZE = 30;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q, area, kind } = await searchParams;
  const term = [kind, area, q].filter(Boolean).join(" ");
  return {
    title: term ? `'${term}' 검색 결과` : "병원 검색",
    description: term
      ? `'${term}' 검색 결과 — 전국 병원 데이터에서 일치하는 결과를 보여줍니다.`
      : "병원명, 지역, 진료과목으로 전국 병원을 검색하세요.",
    robots: { index: false, follow: true },
  };
}

/**
 * 검색 — q는 풀텍스트, area는 sggu_cd_nm ilike, kind는 cl_cd_nm eq
 */
async function performSearch(
  q: string, area: string, kind: string, offset: number, limit: number,
): Promise<{ rows: Hospital[]; total: number }> {
  // q가 있고 area/kind도 있으면 풀텍스트 + 필터 조합
  if (q) {
    const res = await searchHospitals(q, limit * 4, 0); // 넉넉히 가져온 뒤 후필터링
    let rows = res.rows;
    if (area) rows = rows.filter((r) => (r.sggu_cd_nm ?? "").includes(area));
    if (kind) rows = rows.filter((r) => (r.cl_cd_nm ?? "") === kind);
    return { rows: rows.slice(offset, offset + limit), total: rows.length };
  }
  // q 없으면 그냥 area/kind만으로 필터
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

/** lat/lng 범위에서 0~100% 좌표 계산 */
function projectPins(rows: Hospital[]): Array<{ id: number; top: string; left: string; idx: number }> {
  const withCoord = rows
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => r.x_pos != null && r.y_pos != null);
  if (withCoord.length === 0) return [];

  const xs = withCoord.map(({ r }) => r.x_pos as number);
  const ys = withCoord.map(({ r }) => r.y_pos as number);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const xPad = (xMax - xMin) * 0.1 || 0.01;
  const yPad = (yMax - yMin) * 0.1 || 0.01;
  const xRange = (xMax - xMin) + 2 * xPad;
  const yRange = (yMax - yMin) + 2 * yPad;

  return withCoord.slice(0, 30).map(({ r, idx }) => ({
    id: r.id,
    idx,
    left: `${(((r.x_pos as number) - xMin + xPad) / xRange) * 100}%`,
    top: `${(1 - (((r.y_pos as number) - yMin + yPad) / yRange)) * 100}%`,
  }));
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
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
      const res = await performSearch(q, area, kind, offset, PAGE_SIZE);
      rows = res.rows;
      total = res.total;
    } catch (e) {
      error = e instanceof Error ? e.message : "검색 오류";
    }
  }

  const pins = projectPins(rows);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showMap = pins.length >= 2;

  // 상단 타이틀: kind / area / q 조합으로 자연어 (인용부호 없이)
  const headTitle = (() => {
    if (!hasQuery) return "병원 검색";
    const parts: string[] = [];
    if (area) parts.push(area);
    if (kind) parts.push(kind);
    if (q) parts.push(q);
    return parts.join(" ");
  })();

  return (
    <div className={`cm-split${showMap ? "" : " no-map"}`}>
      {/* Left: 결과 리스트 */}
      <div className="results">
        <div className="results-head">
          <div className="crumbs">
            <Link href="/">홈</Link>
            <span> › </span>
            {area ? <span>{area}</span> : <span>전체</span>}
            {kind && (
              <>
                <span> › </span>
                <span>{kind}</span>
              </>
            )}
          </div>
          <h1>{headTitle}</h1>
          <div className="count">
            {hasQuery ? <>총 <b style={{ color: "var(--cm-ink)", fontWeight: 700 }}>{total.toLocaleString("ko-KR")}</b>곳</> : "검색어를 입력하세요"}
            {error && <span style={{ color: "var(--cm-red)" }}> · {error}</span>}
          </div>

          {/* 검색 박스 (압축) */}
          <form action="/search" method="get" style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            <input
              name="q" defaultValue={q} placeholder="병원명/진료과"
              className="cm-filter-chip"
              style={{ flex: 1, minWidth: 120, padding: "6px 12px" }}
            />
            <input
              name="area" defaultValue={area} placeholder="지역(구/동)"
              className="cm-filter-chip"
              style={{ minWidth: 100, padding: "6px 12px" }}
            />
            <button type="submit" className="cm-filter-chip active" style={{ cursor: "pointer" }}>
              <Icon name="search" size={11} color="#fff" /> 검색
            </button>
          </form>

          {/* 종별 필터 chips */}
          <div className="filters">
            <FilterLink params={{ q, area, kind: "" }} active={!kind}>전체</FilterLink>
            {["상급종합", "종합병원", "병원", "의원", "치과의원", "한의원"].map((k) => (
              <FilterLink key={k} params={{ q, area, kind: k }} active={kind === k}>
                {k}
              </FilterLink>
            ))}
          </div>
        </div>

        {hasQuery && rows.length === 0 && !error && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden>🔍</div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>검색 결과가 없습니다</h2>
            <p style={{ fontSize: 13.5, color: "var(--cm-text-2)", margin: "0 0 18px", lineHeight: 1.55 }}>
              검색 조건을 바꿔보세요. 병원명·지역·진료과 키워드를 시도해 보세요.
            </p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {["내과", "성형외과", "치과", "한의원", "소아청소년과"].map((c) => (
                <Link key={c} href={`/search?q=${encodeURIComponent(c)}`} className="cm-chip">
                  {c}
                </Link>
              ))}
            </div>
          </div>
        )}

        {rows.map((h, i) => {
          const size = sizeCategory(h);
          return (
            <Link
              key={h.id}
              href={`/hospital/${encodeURIComponent(h.slug)}`}
              className="cm-result-row"
            >
              <span className="pin-num">{i + 1}</span>
              <div style={{ display: "grid", placeItems: "center" }}>
                <HospitalLogo h={h} size={64} />
              </div>
              <div>
                <div className="badge-row">
                  <Badge kind="verified">HIRA</Badge>
                  {h.cl_cd_nm && <Badge kind="kind">{h.cl_cd_nm}</Badge>}
                </div>
                <div className="name">{h.yadm_nm}</div>
                <div className="spec">
                  {h.cl_cd_nm ?? "병원"} · {[h.sido_cd_nm, h.sggu_cd_nm, h.emdong_nm].filter(Boolean).join(" ")}
                </div>
                <div className="meta">
                  <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 600, color: size.color }}>
                    <Icon name="shield" size={11} color={size.color} />
                    {size.label}
                  </span>
                  {h.tel_no && (
                    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                      <Icon name="phone" size={11} color="var(--cm-text-3)" />
                      {h.tel_no}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, fontSize: 13 }}>
            {page > 1 && (
              <Link href={buildHref({ q, area, kind, page: page - 1 })} className="cm-filter-chip">
                이전
              </Link>
            )}
            <span style={{ alignSelf: "center", color: "var(--cm-text-2)" }}>{page} / {totalPages}</span>
            {page < totalPages && (
              <Link href={buildHref({ q, area, kind, page: page + 1 })} className="cm-filter-chip">
                다음
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Right: 지도 (결과 2개 이상일 때만) */}
      {showMap && (
        <div className="cm-map">
          <div className="map-bg" />
          <span className="map-search-here" style={{ pointerEvents: "none" }}>
            <Icon name="search" size={13} color="#fff" /> 검색 결과 {pins.length}곳 지도 표시
          </span>
          {pins.map((p) => (
            <div key={p.id} className="pin" style={{ top: p.top, left: p.left }}>
              <div className="marker">{p.idx + 1}</div>
            </div>
          ))}
          <div className="map-controls">
            <button aria-label="확대">+</button>
            <button aria-label="축소">−</button>
          </div>
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
  params, active, children,
}: { params: { q?: string; area?: string; kind?: string }; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={buildHref(params)} className={`cm-filter-chip${active ? " active" : ""}`}>
      {children}
    </Link>
  );
}
