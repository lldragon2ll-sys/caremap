import type { Hospital } from "./types";

/** URL에서 도메인만 추출 — 프로토콜 없거나 path 포함된 형태 모두 처리 */
export function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  let s = url.trim();
  if (!s) return null;
  // 프로토콜 없으면 추가
  if (!/^https?:\/\//i.test(s)) s = "http://" + s;
  try {
    const u = new URL(s);
    return u.hostname.replace(/^www\./i, "") || null;
  } catch {
    return null;
  }
}

/** Google s2 favicon 프록시 URL — 외부 호출 없이 즉시 사용 가능 */
export function faviconUrl(hospUrl: string | null | undefined, size = 128): string | null {
  const domain = extractDomain(hospUrl);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

/** 병원명 앞 1~2 글자로 placeholder 이니셜 생성 */
export function initials(name: string): string {
  if (!name) return "?";
  // 공백 분리 후 첫 글자 모음
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).slice(0, 2);
  // 한 단어면 앞 2글자
  return name.slice(0, 2);
}

/** 종별 + 의사 수 기반 자체 신뢰 인디케이터 (별점 대체) */
export function sizeCategory(h: Hospital): {
  tier: "대형" | "중형" | "소형";
  label: string;
  color: string;
} {
  // 종별이 상급종합/종합이면 무조건 대형
  if (h.cl_cd_nm === "상급종합" || h.cl_cd_nm === "종합병원") {
    return { tier: "대형", label: "대형 종합병원", color: "var(--cm-primary-700)" };
  }
  const total = h.dr_tot_cnt ?? 0;
  if (total >= 30) return { tier: "대형", label: `대형 (의사 ${total}명)`, color: "var(--cm-primary-700)" };
  if (total >= 5)  return { tier: "중형", label: `중형 (의사 ${total}명)`, color: "var(--cm-primary)" };
  return { tier: "소형", label: total > 0 ? `소형 (의사 ${total}명)` : "소규모", color: "var(--cm-text-2)" };
}

/** 외부 지도 딥링크 (좌표 기반, 키 불필요) */
export function mapDeepLinks(h: Hospital): {
  kakao: string;
  naver: string;
  google: string;
} | null {
  if (h.y_pos == null || h.x_pos == null) return null;
  const name = encodeURIComponent(h.yadm_nm);
  return {
    // 카카오맵 길찾기 (목적지 모드)
    kakao: `https://map.kakao.com/link/to/${name},${h.y_pos},${h.x_pos}`,
    // 네이버지도 v5 좌표 페이지
    naver: `https://map.naver.com/v5/search/${name}?c=${h.x_pos},${h.y_pos},15,0,0,0,dh`,
    // Google Maps (좌표 + 검색어)
    google: `https://www.google.com/maps/search/?api=1&query=${h.y_pos},${h.x_pos}&query_place_id=${name}`,
  };
}

/** 종별에 따라 placeholder 컬러 결정 */
export function kindColor(clCdNm: string | null): string {
  if (!clCdNm) return "var(--cm-text-3)";
  if (clCdNm.includes("치과")) return "#0891b2"; // cyan
  if (clCdNm.includes("한")) return "#16a34a"; // green
  if (clCdNm === "상급종합" || clCdNm === "종합병원") return "var(--cm-primary)";
  if (clCdNm === "요양병원") return "#7c3aed"; // purple
  return "var(--cm-text-2)";
}
