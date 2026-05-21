"use client";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { HospitalLogo } from "./HospitalLogo";
import { sizeCategory } from "@/lib/hospital-util";
import { tSido, tSiggu, tKind } from "@/lib/i18n-dict";
import { romanizeYadm } from "@/lib/romanize";
import type { Hospital } from "@/lib/types";

type Labels = {
  near: string;       // "내 위치 가까운 순"
  cancel: string;     // "원래 순서"
  locating: string;   // "위치 찾는 중…"
  denied: string;     // "위치 접근이 거부됨"
  unavailable: string;// "위치를 사용할 수 없습니다"
  noCoord: string;    // "좌표 없는 병원은 제외됩니다"
  away: (km: string) => string; // "1.2 km"
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function SearchResultsClient({
  rows,
  locale,
}: {
  rows: Hospital[];
  locale: string;
}) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  const labels: Labels = useMemo(() => {
    if (locale === "en") return {
      near: "Nearest first", cancel: "Default order",
      locating: "Locating…", denied: "Location access denied",
      unavailable: "Location unavailable",
      noCoord: "Hospitals without coordinates are excluded.",
      away: (km) => `${km} km away`,
    };
    if (locale === "ja") return {
      near: "近い順", cancel: "元の順序",
      locating: "位置取得中…", denied: "位置アクセスが拒否されました",
      unavailable: "位置情報を利用できません",
      noCoord: "座標のない病院は除外されます。",
      away: (km) => `${km} km`,
    };
    if (locale === "zh") return {
      near: "最近优先", cancel: "默认排序",
      locating: "正在定位…", denied: "位置访问被拒绝",
      unavailable: "无法获取位置",
      noCoord: "无坐标的医院将被排除。",
      away: (km) => `${km} km`,
    };
    return {
      near: "내 위치 가까운 순", cancel: "원래 순서",
      locating: "위치 찾는 중…", denied: "위치 접근이 거부됨",
      unavailable: "위치를 사용할 수 없습니다",
      noCoord: "좌표가 없는 병원은 제외됩니다.",
      away: (km) => `${km} km`,
    };
  }, [locale]);

  const requestLocation = () => {
    if (userPos) {
      setUserPos(null);
      setStatus("idle");
      setErrMsg("");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setErrMsg(labels.unavailable);
      return;
    }
    setStatus("loading");
    setErrMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("idle");
      },
      (err) => {
        setStatus("error");
        setErrMsg(err.code === err.PERMISSION_DENIED ? labels.denied : labels.unavailable);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  const displayRows = useMemo(() => {
    if (!userPos) return rows.map((h) => ({ h, distance: null as number | null }));
    return rows
      .map((h) => {
        if (h.y_pos == null || h.x_pos == null) return { h, distance: Infinity };
        return { h, distance: haversineKm(userPos.lat, userPos.lng, h.y_pos, h.x_pos) };
      })
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [rows, userPos]);

  const activeNear = !!userPos;

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        padding: "0 0 12px",
      }}>
        <button
          type="button"
          onClick={requestLocation}
          className={`cm-filter-chip${activeNear ? " active" : ""}`}
          style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          aria-pressed={activeNear}
        >
          <Icon name="map" size={12} color={activeNear ? "#fff" : "var(--cm-text-2)"} />
          {status === "loading" ? labels.locating : activeNear ? labels.cancel : labels.near}
        </button>
        {status === "error" && (
          <span style={{ fontSize: 12, color: "var(--cm-red, #d33)" }}>{errMsg}</span>
        )}
        {activeNear && (
          <span style={{ fontSize: 11.5, color: "var(--cm-text-2)" }}>{labels.noCoord}</span>
        )}
      </div>

      {displayRows.map(({ h, distance }, i) => {
        const size = sizeCategory(h);
        const distLabel =
          distance != null && distance !== Infinity
            ? labels.away(distance < 10 ? distance.toFixed(1) : distance.toFixed(0))
            : null;
        return (
          <Link
            key={h.id}
            href={`/hospital/${encodeURIComponent(h.slug)}`}
            className="cm-result-row"
          >
            <span className="pin-num">{i + 1}</span>
            <div style={{ display: "grid", placeItems: "center" }}>
              <HospitalLogo h={h} size={64} />
            </div>
            <div>
              <div className="badge-row">
                <Badge kind="verified">HIRA</Badge>
                {h.cl_cd_nm && <Badge kind="kind">{tKind(h.cl_cd_nm, locale)}</Badge>}
                {distLabel && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: "var(--cm-primary)",
                    background: "var(--cm-primary-50)",
                    padding: "2px 8px", borderRadius: 999,
                  }}>
                    {distLabel}
                  </span>
                )}
              </div>
              <div className="name">
                {h.yadm_nm}
                {locale !== "ko" && (
                  <span style={{ fontSize: 11.5, color: "var(--cm-text-2)", fontWeight: 500, marginLeft: 6 }}>
                    ({romanizeYadm(h.yadm_nm)})
                  </span>
                )}
              </div>
              <div className="spec">
                {tKind(h.cl_cd_nm ?? "병원", locale)} · {[tSido(h.sido_cd_nm ?? "", locale), tSiggu(h.sggu_cd_nm ?? "", locale), h.emdong_nm].filter(Boolean).join(" ")}
              </div>
              <div className="meta">
                <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 600, color: size.color }}>
                  <Icon name="shield" size={11} color={size.color} />
                  {size.label}
                </span>
                {h.tel_no && (
                  <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                    <Icon name="phone" size={11} color="var(--cm-text-3)" />
                    {h.tel_no}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}
