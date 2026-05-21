import { ImageResponse } from "next/og";

export const alt = "CAREMAP — 전국 병원 정보 디렉토리";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "radial-gradient(800px 400px at 30% 20%, #dbeafe, #ffffff 70%)",
          padding: "80px 96px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "#2563eb",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            +
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#0f172a" }}>
            {SITE_NAME}
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#0f172a",
            lineHeight: 1.1,
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>
            <span style={{ color: "#2563eb" }}>가장 가까운</span> 병원을
          </span>
          <span>한 번에 찾기</span>
        </div>
        <div style={{ fontSize: 26, color: "#475569", lineHeight: 1.4 }}>
          전국 79,000+ 의원·병원·치과·한의원 정보
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 18,
            color: "#64748b",
            letterSpacing: "0.04em",
          }}
        >
          데이터 출처 · 건강보험심사평가원 공공데이터포털
        </div>
      </div>
    ),
    { ...size },
  );
}
