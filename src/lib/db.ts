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
