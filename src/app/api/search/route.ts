import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchKeyToKorean } from "@/lib/i18n-dict";

export const runtime = "edge";

const MAX_ROWS = 500; // Haversine 정렬용 상한 — 거리순 모드에서만 사용

/**
 * GET /api/search?q=&area=&kind=&locale=&limit=
 * 거리순 정렬용 bulk 검색. 페이지네이션 없이 최대 500건 반환.
 * 좌표(x_pos/y_pos) 포함된 row 위주로 정렬에 활용.
 *
 * - 한국어/영어/일본어/중국어 검색 키워드를 한국어로 매핑 후 ilike OR 검색
 * - SearchResultsClient에서 거리 정렬 활성화 시 호출
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const area = (url.searchParams.get("area") ?? "").trim();
  const kind = (url.searchParams.get("kind") ?? "").trim();
  const locale = url.searchParams.get("locale") ?? "ko";
  const limit = Math.min(MAX_ROWS, Math.max(50, parseInt(url.searchParams.get("limit") ?? "500", 10) || 500));

  try {
    let rows: unknown[] = [];

    if (q) {
      // i18n: 외국어 검색어를 한국어 후보로 변환
      const koreanTerms = searchKeyToKorean(q, locale);
      const seen = new Set<number>();
      const merged: Record<string, unknown>[] = [];
      // 키워드별 OR 매칭 후 dedup
      for (const term of koreanTerms) {
        const safe = term.replace(/[%,()*\\]/g, "");
        if (!safe) continue;
        const pat = `*${safe}*`;
        const { data, error } = await supabase
          .from("hospitals")
          .select("*")
          .or(`yadm_nm.ilike.${pat},addr.ilike.${pat},sggu_cd_nm.ilike.${pat},cl_cd_nm.ilike.${pat}`)
          .order("dr_tot_cnt", { ascending: false })
          .limit(limit);
        if (error) throw error;
        for (const r of (data ?? []) as Record<string, unknown>[]) {
          const id = r.id as number;
          if (!seen.has(id)) {
            seen.add(id);
            merged.push(r);
          }
        }
        if (merged.length >= limit) break;
      }
      rows = merged;
      // 클라이언트에서 추가 필터 (area/kind)
      if (area) {
        const areaTerms = searchKeyToKorean(area, locale);
        rows = (rows as Record<string, unknown>[]).filter((r) =>
          areaTerms.some((t) => String(r.sggu_cd_nm ?? "").includes(t)),
        );
      }
      if (kind) rows = (rows as Record<string, unknown>[]).filter((r) => r.cl_cd_nm === kind);
    } else {
      // q 없으면 area/kind 기준
      let qb = supabase
        .from("hospitals")
        .select("*")
        .order("dr_tot_cnt", { ascending: false })
        .limit(limit);
      if (area) qb = qb.ilike("sggu_cd_nm", `%${area}%`);
      if (kind) qb = qb.eq("cl_cd_nm", kind);
      const { data, error } = await qb;
      if (error) throw error;
      rows = (data ?? []) as Record<string, unknown>[];
    }

    return NextResponse.json({ rows, total: rows.length }, {
      headers: { "cache-control": "public, max-age=30, s-maxage=60" },
    });
  } catch (e) {
    return NextResponse.json({
      rows: [], total: 0,
      error: e instanceof Error ? e.message : "search_failed",
    }, { status: 500 });
  }
}
