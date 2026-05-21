"use client";
/* eslint-disable @next/next/no-img-element */
/**
 * 병원 로고 — Google s2 favicon 프록시 + 진료과별 그라데이션 placeholder
 * - hosp_url에 도메인이 있으면 favicon 표시
 * - 없으면 진료과별 컬러 그라데이션 + 이니셜 + 의료 패턴 placeholder
 * - 의료법(제56조)상 외부 사진 크롤링은 금지되어 있어 placeholder만 사용
 */
import { useState } from "react";
import type { Hospital } from "@/lib/types";
import { faviconUrl, initials } from "@/lib/hospital-util";

type Props = {
  h: Hospital;
  size?: number;          // px
  className?: string;
  shape?: "rounded" | "circle";
};

/** 진료과/종별 기반 2-tone 그라데이션 컬러 */
function gradientFor(h: Hospital): { from: string; to: string; accent: string } {
  const k = h.cl_cd_nm ?? "";
  const n = h.yadm_nm ?? "";
  // 치과 — cyan/teal
  if (k.includes("치과") || n.includes("치과")) {
    return { from: "#cffafe", to: "#67e8f9", accent: "#0891b2" };
  }
  // 한방 — green/sage
  if (k.includes("한") || n.includes("한의")) {
    return { from: "#dcfce7", to: "#86efac", accent: "#16a34a" };
  }
  // 성형 — pink/rose
  if (n.includes("성형") || n.includes("미용")) {
    return { from: "#fce7f3", to: "#f9a8d4", accent: "#db2777" };
  }
  // 피부 — peach/orange
  if (n.includes("피부")) {
    return { from: "#fed7aa", to: "#fdba74", accent: "#ea580c" };
  }
  // 안과 — sky blue
  if (n.includes("안과") || n.includes("시력")) {
    return { from: "#dbeafe", to: "#93c5fd", accent: "#2563eb" };
  }
  // 정형/재활 — slate
  if (n.includes("정형") || n.includes("재활") || n.includes("관절") || n.includes("척추")) {
    return { from: "#e2e8f0", to: "#94a3b8", accent: "#475569" };
  }
  // 산부인과/소아 — lavender
  if (n.includes("산부") || n.includes("소아")) {
    return { from: "#ede9fe", to: "#c4b5fd", accent: "#7c3aed" };
  }
  // 상급종합/종합 — primary blue
  if (k === "상급종합" || k === "종합병원") {
    return { from: "#dbeafe", to: "#3b82f6", accent: "#1d4ed8" };
  }
  // 기본 — light teal/primary
  return { from: "#e0f2fe", to: "#7dd3fc", accent: "#0284c7" };
}

export function HospitalLogo({ h, size = 48, className, shape = "rounded" }: Props) {
  const url = faviconUrl(h.hosp_url, 128);
  const [errored, setErrored] = useState(false);
  const showImg = !!url && !errored;
  const radius = shape === "circle" ? "50%" : Math.max(8, Math.round(size * 0.15));
  const { from, to, accent } = gradientFor(h);
  const text = initials(h.yadm_nm);

  const wrap: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    border: "1px solid rgba(15,23,42,0.06)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 1px 2px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.4)",
  };

  // 의료 패턴 SVG — 작은 십자 + 동심원 (그라데이션 위에 살짝 깔리는 워터마크)
  const patternId = `pat-${h.id}`;
  const patternSvg = (
    <svg
      width={size}
      height={size}
      style={{
        position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none",
      }}
      aria-hidden
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width={size / 3} height={size / 3} patternUnits="userSpaceOnUse">
          <circle cx={size / 6} cy={size / 6} r={size / 18} fill="none" stroke={accent} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );

  return (
    <span className={className} style={wrap} aria-hidden={!h.hosp_url}>
      {!showImg && (
        <>
          {patternSvg}
          <span
            style={{
              position: "relative",
              fontFamily: "var(--cm-font-display)",
              fontSize: Math.round(size * 0.4),
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: accent,
              textShadow: "0 1px 0 rgba(255,255,255,.5)",
              lineHeight: 1,
            }}
          >
            {text}
          </span>
        </>
      )}
      {showImg && (
        <img
          src={url}
          alt={`${h.yadm_nm} 로고`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          style={{
            width: Math.round(size * 0.66),
            height: Math.round(size * 0.66),
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
          }}
          onError={() => setErrored(true)}
        />
      )}
    </span>
  );
}
