"use client";
import { useEffect } from "react";

/**
 * 병원 상세 페이지 마운트 시 /api/log-view 호출.
 * sessionStorage로 중복 조회 방지 (한 세션 1회).
 */
export function ViewTracker({ hospitalId }: { hospitalId: number }) {
  useEffect(() => {
    const key = `viewed:${hospitalId}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) return;
    fetch("/api/log-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospital_id: hospitalId }),
      keepalive: true,
    }).catch(() => {});
    try { sessionStorage.setItem(key, "1"); } catch {}
  }, [hospitalId]);
  return null;
}
