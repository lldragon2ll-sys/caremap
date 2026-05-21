/**
 * 한국어 텍스트 (병원명·주소)를 영문(로마자) 자동 표기.
 * 외국인 환자가 검색할 때 한글 단어를 알아볼 수 있도록 보조.
 *
 * - 한글 음절 → Revised Romanization (RR) 변환 (hangul-romanization 라이브러리)
 * - 시도/시군구 명칭은 i18n-dict 정식 표기 우선 사용
 * - 결과를 단어 단위로 capitalize
 */
import romanizer from "hangul-romanization";
import { SIDO_MAP_INTERNAL, SIGGU_MAP_INTERNAL, SPECIALTY_MAP_INTERNAL, KIND_MAP_INTERNAL } from "./i18n-dict-tables";

type Lang = "ko" | "en" | "ja" | "zh" | string;

function titleCase(s: string): string {
  return s.replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
}

function romanizeHangul(s: string): string {
  if (!s) return "";
  try {
    // hangul-romanization은 default export. romanize 함수 호출
    const r = (romanizer as unknown as { convert: (s: string) => string }).convert?.(s)
      ?? String((romanizer as unknown as (s: string) => string)(s) ?? "");
    return r;
  } catch {
    return s;
  }
}

/**
 * 병원명 영문 로마자 변환.
 * 진료과·종별 부분은 사전 매칭, 나머지는 hangul romanize.
 */
export function romanizeYadm(name: string): string {
  if (!name) return "";
  let result = name;
  // 진료과·종별 키워드 영문 치환
  for (const [ko, en] of Object.entries({ ...SPECIALTY_MAP_INTERNAL, ...KIND_MAP_INTERNAL })) {
    if (result.includes(ko)) {
      result = result.replace(new RegExp(ko, "g"), ` ${en} `);
    }
  }
  // 시도/시군구 키워드
  for (const [ko, en] of Object.entries({ ...SIDO_MAP_INTERNAL, ...SIGGU_MAP_INTERNAL })) {
    if (result.includes(ko)) {
      result = result.replace(new RegExp(ko, "g"), ` ${en} `);
    }
  }
  // 한글 잔여 음절 → 로마자
  result = result.replace(/[가-힣]+/g, (m) => " " + romanizeHangul(m) + " ");
  result = result.replace(/\s+/g, " ").trim();
  return titleCase(result);
}

/** 주소 영문 자동 표기 — 시도/시군구 매핑 + 도로명 음절 변환 */
export function romanizeAddr(addr: string): string {
  if (!addr) return "";
  let result = addr;
  // 시도·시군구 매핑 (긴 키부터)
  const allRegions: [string, string][] = [
    ...Object.entries(SIDO_MAP_INTERNAL),
    ...Object.entries(SIGGU_MAP_INTERNAL),
  ].sort((a, b) => b[0].length - a[0].length);
  for (const [ko, en] of allRegions) {
    if (result.includes(ko)) {
      result = result.replace(new RegExp(ko, "g"), ` ${en} `);
    }
  }
  // "특별시", "광역시" 등
  result = result
    .replace(/특별시/g, " ")
    .replace(/광역시/g, " ")
    .replace(/특별자치도/g, " ")
    .replace(/특별자치시/g, " ")
    .replace(/도\b/g, "-do ");
  // 남은 한글 → 로마자
  result = result.replace(/[가-힣]+/g, (m) => " " + romanizeHangul(m) + " ");
  result = result.replace(/\s+/g, " ").trim();
  return titleCase(result);
}

/** Locale에 맞춰 한글명 옆에 보조 표기 (영/일/중에서) */
export function bilingualName(name: string, locale: Lang): string {
  if (locale === "ko" || !name) return name;
  const romanized = romanizeYadm(name);
  if (!romanized || romanized === name) return name;
  return `${name} (${romanized})`;
}

export function bilingualAddress(addr: string | null | undefined, locale: Lang): string {
  if (!addr) return "";
  if (locale === "ko") return addr;
  const romanized = romanizeAddr(addr);
  if (!romanized || romanized === addr) return addr;
  return `${addr} (${romanized})`;
}
