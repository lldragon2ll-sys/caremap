import { ImageResponse } from "next/og";
import { getHospitalBySlug } from "@/lib/db";

export const alt = "CAREMAP 병원 정보";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

/**
 * 병원별 동적 OG 이미지 — 진료과별 컬러 + 핵심 통계.
 * 트위터/페이스북/카카오톡 미리보기에서 풍부한 미리보기를 보장.
 */
export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  let h: Awaited<ReturnType<typeof getHospitalBySlug>> = null;
  try { h = await getHospitalBySlug(decodeURIComponent(slug)); } catch {}

  const name = h?.yadm_nm ?? "병원 정보";
  const region = [h?.sido_cd_nm, h?.sggu_cd_nm].filter(Boolean).join(" ");
  const kind = h?.cl_cd_nm ?? "병원";
  const drs = h?.dr_tot_cnt ?? 0;

  // 진료과별 컬러
  const isCosmetic = name.includes("성형") || name.includes("미용");
  const isDental = kind.includes("치과") || name.includes("치과");
  const isKorean = kind.includes("한") || name.includes("한의");
  const isSkin = name.includes("피부");
  const isEye = name.includes("안과");
  const accent = isCosmetic ? "#db2777"
    : isDental ? "#0891b2"
    : isKorean ? "#16a34a"
    : isSkin ? "#ea580c"
    : isEye ? "#2563eb"
    : "#1d4ed8";
  const accentSoft = isCosmetic ? "#fce7f3"
    : isDental ? "#cffafe"
    : isKorean ? "#dcfce7"
    : isSkin ? "#ffedd5"
    : isEye ? "#dbeafe"
    : "#dbeafe";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: `linear-gradient(135deg, ${accentSoft} 0%, #ffffff 60%)`,
          padding: "80px 96px",
          position: "relative",
        }}
      >
        {/* Accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: 14,
          background: accent,
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <div style={{
            width: 44, height: 44, background: "#1d4ed8",
            borderRadius: 10, display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 28, fontWeight: 800,
          }}>+</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{SITE_NAME}</div>
          <div style={{
            marginLeft: "auto",
            background: "#fff", padding: "6px 14px",
            borderRadius: 999, fontSize: 16, fontWeight: 700,
            color: accent, border: `1px solid ${accent}`,
          }}>
            HIRA 인증
          </div>
        </div>

        <div style={{
          fontSize: 64, fontWeight: 800, letterSpacing: "-0.025em",
          color: "#0f172a", lineHeight: 1.1, marginBottom: 18,
          maxWidth: 1000,
        }}>
          {name}
        </div>

        <div style={{ fontSize: 26, color: "#475569", marginBottom: 32, display: "flex", gap: 12 }}>
          {region && <span>📍 {region}</span>}
          <span style={{ color: accent, fontWeight: 700 }}>· {kind}</span>
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: "auto" }}>
          {drs > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{drs}</span>
              <span style={{ fontSize: 18, color: "#64748b" }}>의료진 수</span>
            </div>
          )}
          {h?.estb_dd && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{h.estb_dd.slice(0, 4)}</span>
              <span style={{ fontSize: 18, color: "#64748b" }}>개설 연도</span>
            </div>
          )}
          {h?.tel_no && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>{h.tel_no}</span>
              <span style={{ fontSize: 18, color: "#64748b" }}>전화</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
