/**
 * 진료과 / 종별 기반 의미있는 SVG 아이콘 세트.
 * 병원 카드, 결과행, 카테고리 타일에서 placeholder 대신 사용.
 *
 * 의료법(제56조) 회피: 외부 사진 크롤링 X, 모두 inline SVG.
 */
import type { Hospital } from "@/lib/types";

type Props = {
  h?: Hospital;
  kind?: string;            // override
  size?: number;
  color?: string;
  className?: string;
};

const ICONS: Record<string, (size: number, color: string) => React.ReactElement> = {
  plasticSurgery: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8c2 0 3 2 5 2s3-2 5-2" />
      <path d="M6 14c1 0 2 1 3 1s2-1 3-1 2 1 3 1 2-1 3-1" />
      <circle cx="9" cy="6" r="1.2" fill={c} />
      <circle cx="15" cy="6" r="1.2" fill={c} />
      <path d="M12 14v6M8 20h8" />
    </svg>
  ),
  dermatology: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9" r="1" fill={c} />
      <circle cx="15" cy="11" r=".7" fill={c} />
      <circle cx="11" cy="15" r=".8" fill={c} />
      <circle cx="16" cy="16" r=".5" fill={c} />
    </svg>
  ),
  dental: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4c-2 0-3 1.6-3 3.5 0 4 .8 7.5 2.2 11.5.4 1 1.6 1 2 0L11 14h2l1.8 5c.4 1 1.6 1 2 0C18.2 15 19 11.5 19 7.5 19 5.6 18 4 16 4c-1.2 0-2.2.6-3 1.5-1-1-2-1.5-3-1.5z" />
    </svg>
  ),
  ophthalmology: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1" fill={c} />
    </svg>
  ),
  koreanMedicine: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5c2 1 3 3 3 5s-1 4-3 5" />
      <path d="M18 5c-2 1-3 3-3 5s1 4 3 5" />
      <path d="M12 4v16" />
      <path d="M9 12h6" />
    </svg>
  ),
  orthopedics: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5c0-1 1-2 2-2s2 1 2 2v1c1 0 2 1 2 2v2l4 4v-2c0-1 1-2 2-2s2 1 2 2-1 2-2 2h-1c0 1-1 2-2 2v1l-4-4h-2c-1 0-2-1-2-2v-1c-1 0-2-1-2-2s1-2 2-2V6c-1 0-2-1-2-1z" />
    </svg>
  ),
  pediatrics: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="4" />
      <path d="M5 21v-1c0-3 3-5 7-5s7 2 7 5v1" />
      <circle cx="10" cy="8" r=".7" fill={c} />
      <circle cx="14" cy="8" r=".7" fill={c} />
      <path d="M10 10.5c.7.7 1.5.7 2.5 0" />
    </svg>
  ),
  internalMedicine: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M9 4h6" />
      <circle cx="12" cy="17" r="3" />
      <path d="M12 14v-2" />
    </svg>
  ),
  obgyn: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v8M9 19h6" />
    </svg>
  ),
  ent: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6a4 4 0 0 1 8 0c0 3-2 4-2 7s-1 4-2 4-2-1-2-3" />
      <path d="M8 18c-1 0-2-1-2-2v-2" />
    </svg>
  ),
  hospital: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M9 21v-6h6v6" />
      <path d="M12 11v-3M10.5 9.5h3" />
    </svg>
  ),
  clinic: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M9 12h6M12 9v6" />
      <path d="M8 6V4h8v2" />
    </svg>
  ),
};

/** 병원에서 가장 가까운 카테고리 키를 추론 */
function categoryOf(h?: Hospital | null, kindOverride?: string): keyof typeof ICONS {
  const k = (kindOverride ?? h?.cl_cd_nm ?? "").toString();
  const n = h?.yadm_nm ?? "";
  if (k.includes("치과") || n.includes("치과")) return "dental";
  if (k.includes("한") || n.includes("한의")) return "koreanMedicine";
  if (n.includes("성형") || n.includes("미용")) return "plasticSurgery";
  if (n.includes("피부")) return "dermatology";
  if (n.includes("안과") || n.includes("시력")) return "ophthalmology";
  if (n.includes("정형") || n.includes("재활") || n.includes("관절") || n.includes("척추")) return "orthopedics";
  if (n.includes("소아")) return "pediatrics";
  if (n.includes("산부")) return "obgyn";
  if (n.includes("이비")) return "ent";
  if (n.includes("내과")) return "internalMedicine";
  if (k === "상급종합" || k === "종합병원" || k === "병원") return "hospital";
  return "clinic";
}

/** 진료과별 컬러 (HospitalLogo의 gradientFor와 동기화) */
export function accentFor(h?: Hospital | null, kindOverride?: string): { bg: string; bgSoft: string; ink: string } {
  const cat = categoryOf(h, kindOverride);
  switch (cat) {
    case "dental":           return { bg: "#0891b2", bgSoft: "#cffafe", ink: "#075985" };
    case "koreanMedicine":   return { bg: "#16a34a", bgSoft: "#dcfce7", ink: "#14532d" };
    case "plasticSurgery":   return { bg: "#db2777", bgSoft: "#fce7f3", ink: "#831843" };
    case "dermatology":      return { bg: "#ea580c", bgSoft: "#ffedd5", ink: "#7c2d12" };
    case "ophthalmology":    return { bg: "#2563eb", bgSoft: "#dbeafe", ink: "#1e3a8a" };
    case "orthopedics":      return { bg: "#475569", bgSoft: "#e2e8f0", ink: "#0f172a" };
    case "pediatrics":       return { bg: "#7c3aed", bgSoft: "#ede9fe", ink: "#4c1d95" };
    case "obgyn":            return { bg: "#be185d", bgSoft: "#fce7f3", ink: "#831843" };
    case "ent":              return { bg: "#0d9488", bgSoft: "#ccfbf1", ink: "#134e4a" };
    case "internalMedicine": return { bg: "#0284c7", bgSoft: "#e0f2fe", ink: "#0c4a6e" };
    case "hospital":         return { bg: "#1d4ed8", bgSoft: "#dbeafe", ink: "#1e3a8a" };
    default:                 return { bg: "#0284c7", bgSoft: "#e0f2fe", ink: "#0c4a6e" };
  }
}

export function SpecialtyIcon({ h, kind, size = 20, color, className }: Props) {
  const cat = categoryOf(h, kind);
  const c = color ?? accentFor(h, kind).bg;
  const render = ICONS[cat];
  return (
    <span className={className} aria-hidden style={{ display: "inline-flex", lineHeight: 0 }}>
      {render(size, c)}
    </span>
  );
}
