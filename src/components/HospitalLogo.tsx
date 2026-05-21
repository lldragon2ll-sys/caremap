"use client";
/* eslint-disable @next/next/no-img-element */
/**
 * 병원 로고 — Google s2 favicon 프록시 사용
 * - hosp_url에 도메인이 있으면 favicon 표시
 * - 없으면 이니셜 placeholder
 * - 클라이언트 컴포넌트인 이유: onError로 로드 실패 시 이니셜 폴백 노출 필요
 */
import { useState } from "react";
import type { Hospital } from "@/lib/types";
import { faviconUrl, initials, kindColor } from "@/lib/hospital-util";

type Props = {
  h: Hospital;
  size?: number;          // px
  className?: string;
  shape?: "rounded" | "circle";
};

export function HospitalLogo({ h, size = 48, className, shape = "rounded" }: Props) {
  const url = faviconUrl(h.hosp_url, 128);
  const [errored, setErrored] = useState(false);
  const showImg = !!url && !errored;
  const radius = shape === "circle" ? "50%" : 10;
  const color = kindColor(h.cl_cd_nm);
  const text = initials(h.yadm_nm);

  const wrap: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
    border: "1px solid var(--cm-line)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 1px 2px rgba(15,23,42,.04)",
  };

  return (
    <span className={className} style={wrap} aria-hidden={!h.hosp_url}>
      {!showImg && (
        <span
          style={{
            fontFamily: "var(--cm-font-display)",
            fontSize: size * 0.42,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color,
          }}
        >
          {text}
        </span>
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
          }}
          onError={() => setErrored(true)}
        />
      )}
    </span>
  );
}
