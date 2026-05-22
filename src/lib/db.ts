/**
 * DB 접근 헬퍼.
 * - SSG 빌드 단계에서는 generateStaticParams가 전체 ykiho 목록을 요청하므로 페이지 크기 큼
 * - 일반 페이지 렌더는 단건 조회 + 카운트 위주
 */
import { supabase } from "./supabase";
import type { Hospital } from "./types";

export async function getAllSlugs(): Promise<string[]> {
  // Supabase 기본 한도 우회 위해 페이지네이션
  const pageSize = 1000;
  const out: string[] = [];
  let from = 0;
  // 안전 상한 (실제 8만 건 정도)
  for (let i = 0; i < 200; i++) {
    const { data, error } = await supabase
      .from("hospitals")
      .select("slug")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data.map((r) => r.slug as string));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

export async function getHospitalBySlug(slug: string): Promise<Hospital | null> {
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Hospital) ?? null;
}

export type RegionStats = {
  sido_cd_nm: string;
  sggu_cd_nm: string | null;
  count: number;
};

/** 시도 목록 + 카운트 (사전 집계된 v_sido_counts view 사용) */
export async function getSidoList(): Promise<{ name: string; count: number }[]> {
  const { data, error } = await supabase
    .from("v_sido_counts")
    .select("sido, cnt");
  if (error) throw error;
  return ((data ?? []) as { sido: string; cnt: number }[])
    .filter((r) => r.sido)
    .map((r) => ({ name: r.sido, count: Number(r.cnt) }))
    .sort((a, b) => b.count - a.count);
}

export async function getSigguList(sido: string): Promise<{ name: string; count: number }[]> {
  const { data, error } = await supabase
    .from("v_sggu_counts")
    .select("sggu, cnt")
    .eq("sido", sido);
  if (error) throw error;
  return ((data ?? []) as { sggu: string; cnt: number }[])
    .filter((r) => r.sggu)
    .map((r) => ({ name: r.sggu, count: Number(r.cnt) }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 지역별 병원 — 비급여·미용 위주 사이트 컨셉에 맞춰 의원급(의원/치과의원/한의원) 우선 정렬.
 * 1차로 의원급 결과 채우고, 부족하면 그 외 종별로 보충.
 */
export async function getHospitalsByRegion(
  sido: string,
  sggu?: string,
  limit = 100,
  offset = 0,
): Promise<{ rows: Hospital[]; total: number }> {
  const buildBase = () => {
    let q = supabase
      .from("hospitals")
      .select("*", { count: "exact" })
      .eq("sido_cd_nm", sido);
    if (sggu) q = q.eq("sggu_cd_nm", sggu);
    return q;
  };

  // 의원급 (clinic-tier) 우선
  const clinic = await buildBase()
    .in("cl_cd_nm", ["의원", "치과의원", "한의원"])
    .order("dr_tot_cnt", { ascending: false })
    .range(offset, offset + limit - 1);
  if (clinic.error) throw clinic.error;

  const clinicRows = (clinic.data ?? []) as Hospital[];
  const clinicTotal = clinic.count ?? 0;

  // 의원급으로 채워졌으면 거기서 끝
  if (clinicRows.length >= limit) {
    return { rows: clinicRows, total: clinicTotal };
  }

  // 부족하면 그 외 종별(병원/종합/상급 등) 보충
  const remaining = limit - clinicRows.length;
  const others = await buildBase()
    .not("cl_cd_nm", "in", "(의원,치과의원,한의원)")
    .order("dr_tot_cnt", { ascending: false })
    .range(0, remaining - 1);
  if (others.error) throw others.error;

  const otherRows = (others.data ?? []) as Hospital[];
  const otherTotal = others.count ?? 0;

  return {
    rows: [...clinicRows, ...otherRows],
    total: clinicTotal + otherTotal,
  };
}

/**
 * 진료과목별 필터:
 * - 치과/한방 등: 종별(cl_cd_nm)로 명확히 분류 가능
 * - 그 외 의과 진료과: hospital_categories 매핑이 없으면 yadm_nm에 specialty가 포함된 병원만 정확하게 매칭
 *   (종합병원이 단순 카운트 폴백으로 섞이는 것 방지)
 *
 * yadm_nm.ilike '%성형외과%' 같은 매칭이 부정확해 보일 수 있으나, 한국 의원 이름 관행상
 * "{지역}{진료과}의원" 형태가 압도적이라 실용적으로 가장 정확함.
 */
export async function getHospitalsBySpecialty(
  sido: string,
  sggu: string,
  specialty: string,
  limit = 100,
  offset = 0,
): Promise<{ rows: Hospital[]; total: number }> {
  const base = () => supabase
    .from("hospitals")
    .select("*", { count: "exact" })
    .eq("sido_cd_nm", sido)
    .eq("sggu_cd_nm", sggu);

  // 1) 치과 계열
  if (specialty === "치과" || specialty === "치과교정과" || specialty === "소아치과" || specialty === "구강악안면외과") {
    const q = base()
      .or("cl_cd_nm.eq.치과의원,cl_cd_nm.eq.치과병원")
      .order("dr_tot_cnt", { ascending: false })
      .range(offset, offset + limit - 1);
    const { data, error, count } = await q;
    if (error) throw error;
    return { rows: (data ?? []) as Hospital[], total: count ?? 0 };
  }

  // 2) 한방 계열
  if (specialty === "한방" || specialty === "한의원" || specialty === "한방병원") {
    const q = base()
      .or("cl_cd_nm.eq.한의원,cl_cd_nm.eq.한방병원")
      .order("dr_tot_cnt", { ascending: false })
      .range(offset, offset + limit - 1);
    const { data, error, count } = await q;
    if (error) throw error;
    return { rows: (data ?? []) as Hospital[], total: count ?? 0 };
  }

  // 3) 의과 진료과 — 병원명에 진료과명이 포함된 경우 (가장 정확)
  // 단어 변형: "성형외과" → "성형" 같은 단축형도 추가로 시도
  const variants = [specialty];
  if (specialty.endsWith("과") && specialty.length > 2) variants.push(specialty.slice(0, -1));

  let q = base();
  // OR 조건: 이름 중 하나라도 포함하면 매칭
  const orClause = variants.map((v) => `yadm_nm.ilike.*${v.replace(/[%,()*\\]/g, "")}*`).join(",");
  q = q.or(orClause).order("dr_tot_cnt", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  return { rows: (data ?? []) as Hospital[], total: count ?? 0 };
}

/**
 * 검색 — 한국어 풀텍스트 토크나이저 부재로 인해 trigram(ILIKE) 기반.
 * pg_trgm 인덱스(yadm_nm)와 일반 ilike 모두 활용.
 * 다중 단어 입력 시 공백 기준 토큰화하여 AND 조합.
 */
/** 최근 7일 인기 검색어 (v_top_searches) */
export async function getTopSearches(limit = 8): Promise<{ query: string; cnt: number }[]> {
  try {
    const { data, error } = await supabase
      .from("v_top_searches")
      .select("query, cnt")
      .limit(limit);
    if (error) throw error;
    return ((data ?? []) as { query: string; cnt: number }[]).map((r) => ({
      query: r.query, cnt: Number(r.cnt),
    }));
  } catch {
    return [];
  }
}

/** 최근 7일 많이 본 병원 (v_top_viewed_hospitals) */
export async function getTopViewedHospitals(limit = 6): Promise<Hospital[]> {
  try {
    const { data, error } = await supabase
      .from("v_top_viewed_hospitals")
      .select("*")
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Hospital[];
  } catch {
    return [];
  }
}

/** 함께 알아본 병원 — 같은 시군구 + 비슷한 카테고리 (기준 병원 제외) */
export async function getRelatedHospitals(h: Hospital, limit = 4): Promise<Hospital[]> {
  if (!h.sggu_cd_nm) return [];
  // 1차: 같은 시군구·같은 종별
  let q = supabase
    .from("hospitals")
    .select("*")
    .eq("sido_cd_nm", h.sido_cd_nm ?? "")
    .eq("sggu_cd_nm", h.sggu_cd_nm)
    .neq("id", h.id)
    .order("dr_tot_cnt", { ascending: false })
    .limit(limit * 2);
  if (h.cl_cd_nm) q = q.eq("cl_cd_nm", h.cl_cd_nm);
  const { data, error } = await q;
  if (error) return [];
  let rows = (data ?? []) as Hospital[];
  // 이름에 공통 키워드 (예: 성형/피부/치과) 있으면 우선
  const keyword = ["성형", "피부", "치과", "안과", "한의", "정형", "산부인", "소아"]
    .find((k) => (h.yadm_nm ?? "").includes(k));
  if (keyword) {
    const matchFirst = rows.filter((r) => r.yadm_nm.includes(keyword));
    const others = rows.filter((r) => !r.yadm_nm.includes(keyword));
    rows = [...matchFirst, ...others];
  }
  return rows.slice(0, limit);
}

/**
 * 같은 동(洞) 내 다른 진료과 병원 — 키워드 기반 다양성 확보.
 * 기준 병원과 다른 진료과 위주로 5곳 추천. emdong_nm이 비면 시군구 fallback.
 */
export async function getSameDongHospitals(h: Hospital, limit = 5): Promise<Hospital[]> {
  if (!h.sido_cd_nm || !h.sggu_cd_nm) return [];
  const baseKeyword = ["성형", "피부", "치과", "안과", "한의", "정형", "산부인", "소아", "내과", "이비인후"]
    .find((k) => (h.yadm_nm ?? "").includes(k));

  // 동(洞) 기준 우선, 부족하면 시군구로 확장
  const queryByDong = h.emdong_nm
    ? supabase
        .from("hospitals")
        .select("*")
        .eq("sido_cd_nm", h.sido_cd_nm)
        .eq("sggu_cd_nm", h.sggu_cd_nm)
        .eq("emdong_nm", h.emdong_nm)
        .neq("id", h.id)
        .order("dr_tot_cnt", { ascending: false })
        .limit(50)
    : null;

  let pool: Hospital[] = [];
  if (queryByDong) {
    const { data } = await queryByDong;
    pool = (data ?? []) as Hospital[];
  }
  // 다른 진료과만 (이름에 baseKeyword가 없는 것)
  let others = baseKeyword
    ? pool.filter((r) => !r.yadm_nm.includes(baseKeyword))
    : pool;

  if (others.length < limit) {
    // 시군구로 확장
    const { data } = await supabase
      .from("hospitals")
      .select("*")
      .eq("sido_cd_nm", h.sido_cd_nm)
      .eq("sggu_cd_nm", h.sggu_cd_nm)
      .neq("id", h.id)
      .order("dr_tot_cnt", { ascending: false })
      .limit(60);
    const extra = ((data ?? []) as Hospital[])
      .filter((r) => !others.find((o) => o.id === r.id))
      .filter((r) => !baseKeyword || !r.yadm_nm.includes(baseKeyword));
    others = [...others, ...extra];
  }

  // 진료과 다양성: 종별/이름 키워드별 1개씩 우선
  const seenKeywords = new Set<string>();
  const KEYWORDS = ["성형", "피부", "치과", "안과", "한의", "정형", "산부인", "소아", "내과", "이비인후", "비뇨", "정신", "가정의"];
  const diverse: Hospital[] = [];
  for (const r of others) {
    const k = KEYWORDS.find((kw) => r.yadm_nm.includes(kw)) ?? r.cl_cd_nm ?? "기타";
    if (!seenKeywords.has(k)) {
      diverse.push(r);
      seenKeywords.add(k);
      if (diverse.length >= limit) break;
    }
  }
  // 부족하면 나머지로 채움
  if (diverse.length < limit) {
    for (const r of others) {
      if (diverse.find((d) => d.id === r.id)) continue;
      diverse.push(r);
      if (diverse.length >= limit) break;
    }
  }
  return diverse.slice(0, limit);
}

/**
 * 반경 ~500m 인근 동일 진료과 병원 (Haversine).
 * 좌표 있는 같은 시군구 병원만 대상으로 거리 필터 + 정렬.
 */
export async function getNearbySameSpecialty(h: Hospital, limit = 5, maxKm = 1.0): Promise<Array<Hospital & { distance: number }>> {
  if (h.x_pos == null || h.y_pos == null || !h.sggu_cd_nm) return [];
  const baseKeyword = ["성형", "피부", "치과", "안과", "한의", "정형", "산부인", "소아", "내과", "이비인후"]
    .find((k) => (h.yadm_nm ?? "").includes(k));

  // 같은 시군구·좌표 있는 후보 100개 가져오기
  let q = supabase
    .from("hospitals")
    .select("*")
    .eq("sido_cd_nm", h.sido_cd_nm ?? "")
    .eq("sggu_cd_nm", h.sggu_cd_nm)
    .neq("id", h.id)
    .not("x_pos", "is", null)
    .not("y_pos", "is", null)
    .limit(100);
  if (baseKeyword) q = q.ilike("yadm_nm", `%${baseKeyword}%`);
  else if (h.cl_cd_nm) q = q.eq("cl_cd_nm", h.cl_cd_nm);

  const { data } = await q;
  if (!data) return [];

  const R = 6371; // km
  const toRad = (x: number) => (x * Math.PI) / 180;
  const candidates = (data as Hospital[])
    .map((r) => {
      if (r.x_pos == null || r.y_pos == null) return null;
      const dLat = toRad(r.y_pos - h.y_pos!);
      const dLng = toRad(r.x_pos - h.x_pos!);
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(h.y_pos!)) * Math.cos(toRad(r.y_pos)) * Math.sin(dLng / 2) ** 2;
      const distance = 2 * R * Math.asin(Math.sqrt(a));
      return { ...r, distance };
    })
    .filter((x): x is Hospital & { distance: number } => x !== null && x.distance <= maxKm)
    .sort((a, b) => a.distance - b.distance);

  return candidates.slice(0, limit);
}

export async function searchHospitals(
  q: string,
  limit = 30,
  offset = 0,
): Promise<{ rows: Hospital[]; total: number }> {
  const tokens = q.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { rows: [], total: 0 };

  let builder = supabase
    .from("hospitals")
    .select("*", { count: "exact" });

  // 각 토큰별: 이름/주소/시구 중 하나라도 매칭 (OR), 토큰끼리는 AND
  for (const t of tokens) {
    const safe = t.replace(/[%,()*\\]/g, ""); // PostgREST or() syntax 안전화
    if (!safe) continue;
    const pat = `*${safe}*`; // PostgREST 와일드카드
    builder = builder.or(
      `yadm_nm.ilike.${pat},addr.ilike.${pat},sggu_cd_nm.ilike.${pat},cl_cd_nm.ilike.${pat}`,
    );
  }

  const { data, error, count } = await builder
    .order("dr_tot_cnt", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { rows: (data ?? []) as Hospital[], total: count ?? 0 };
}
