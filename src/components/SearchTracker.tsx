"use client";
import { useEffect } from "react";

/**
 * 검색 결과 페이지 마운트 시 검색어 로깅 (queryString 변화 감지).
 * sessionStorage로 동일 쿼리 중복 로깅 방지.
 */
export function SearchTracker({ q, area, kind, locale }: {
  q?: string; area?: string; kind?: string; locale: string;
}) {
  useEffect(() => {
    if (!q) return;
    const key = `searched:${locale}:${q}:${area ?? ""}:${kind ?? ""}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) return;
    fetch("/api/log-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, area, kind, locale }),
      keepalive: true,
    }).catch(() => {});
    try { sessionStorage.setItem(key, "1"); } catch {}
  }, [q, area, kind, locale]);
  return null;
}
