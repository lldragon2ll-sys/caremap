"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "./Icon";
import { pick4 } from "@/lib/i18n-dict";

/**
 * 홈에서 '내 위치 근처 클리닉' 즉시 진입 CTA.
 * Geolocation 성공 시 검색 페이지로 이동하면서 sessionStorage에 좌표 저장
 * → 검색 페이지에서 자동으로 거리순 모드 켤 수 있음.
 */
export function NearbyCTA({ locale }: { locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onClick = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErr(pick4(locale,
        "위치 정보를 사용할 수 없습니다.",
        "Location services unavailable.",
        "位置情報を利用できません。",
        "无法获取位置。",
      ));
      return;
    }
    setLoading(true);
    setErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          sessionStorage.setItem(
            "caremap:nearby",
            JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() }),
          );
        } catch {}
        // 검색 진입 — 모든 의원급을 거리순으로 자동 정렬
        router.push("/search?nearby=1&kind=의원");
      },
      (e) => {
        setLoading(false);
        setErr(e.code === e.PERMISSION_DENIED
          ? pick4(locale, "위치 권한이 거부되었습니다.", "Location permission denied.", "位置許可が拒否されました。", "位置权限被拒绝。")
          : pick4(locale, "위치를 찾지 못했습니다.", "Unable to get location.", "位置を取得できません。", "无法获取位置。"),
        );
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const label = loading
    ? pick4(locale, "위치 찾는 중…", "Locating…", "位置取得中…", "正在定位…")
    : pick4(locale, "내 근처 클리닉 찾기", "Find clinics near me", "近くのクリニックを探す", "查找附近诊所");

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="cm-nearby-cta"
        aria-busy={loading}
      >
        <Icon name="pin" size={14} color="#fff" />
        {label}
      </button>
      {err && (
        <span style={{ fontSize: 12, color: "var(--cm-red, #d33)" }}>{err}</span>
      )}
    </div>
  );
}
