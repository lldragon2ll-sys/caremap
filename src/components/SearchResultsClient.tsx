"use client";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { HospitalLogo } from "./HospitalLogo";
import { sizeCategory } from "@/lib/hospital-util";
import { tSido, tSiggu, tKind } from "@/lib/i18n-dict";
import { romanizeYadm, romanizeAddr } from "@/lib/romanize";
import type { Hospital } from "@/lib/types";

type Labels = {
  near: string;       // "내 위치 가까운 순"
  cancel: string;     // "원래 순서"
  locating: string;   // "위치 찾는 중…"
  denied: string;     // "위치 접근이 거부됨"
  unavailable: string;// "위치를 사용할 수 없습니다"
  noCoord: string;    // "좌표 없는 병원은 제외됩니다"
  away: (km: string) => string; // "1.2 km"
  sortLabel: string;  // "정렬:"
  sortDefault: string;
  sortDoctors: string;
  sortSize: string;
};

type SortKey = "default" | "doctors" | "size" | "distance";

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
  const [sort, setSort] = useState<SortKey>("default");

  const labels: Labels = useMemo(() => {
    if (locale === "en") return {
      near: "Nearest first", cancel: "Default order",
      locating: "Locating…", denied: "Location access denied",
      unavailable: "Location unavailable",
      noCoord: "Hospitals without coordinates are excluded.",
      away: (km) => `${km} km away`,
      sortLabel: "Sort:", sortDefault: "Best match", sortDoctors: "Most doctors", sortSize: "Largest",
    };
    if (locale === "ja") return {
      near: "近い順", cancel: "元の順序",
      locating: "位置取得中…", denied: "位置アクセスが拒否されました",
      unavailable: "位置情報を利用できません",
      noCoord: "座標のない病院は除外されます。",
      away: (km) => `${km} km`,
      sortLabel: "並べ替え:", sortDefault: "おすすめ順", sortDoctors: "医師数順", sortSize: "規模順",
    };
    if (locale === "zh") return {
      near: "最近优先", cancel: "默认排序",
      locating: "正在定位…", denied: "位置访问被拒绝",
      unavailable: "无法获取位置",
      noCoord: "无坐标的医院将被排除。",
      away: (km) => `${km} km`,
      sortLabel: "排序:", sortDefault: "推荐", sortDoctors: "医师数", sortSize: "规模",
    };
    return {
      near: "내 위치 가까운 순", cancel: "원래 순서",
      locating: "위치 찾는 중…", denied: "위치 접근이 거부됨",
      unavailable: "위치를 사용할 수 없습니다",
      noCoord: "좌표가 없는 병원은 제외됩니다.",
      away: (km) => `${km} km`,
      sortLabel: "정렬:", sortDefault: "추천순", sortDoctors: "의사 많은 순", sortSize: "규모 순",
    };
  }, [locale]);

  const requestLocation = () => {
    if (userPos) {
      setUserPos(null);
      setStatus("idle");
      setErrMsg("");
      if (sort === "distance") setSort("default");
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
        setSort("distance");
      },
      (err) => {
        setStatus("error");
        setErrMsg(err.code === err.PERMISSION_DENIED ? labels.denied : labels.unavailable);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  const sizeRank = (clCdNm: string | null): number => {
    if (!clCdNm) return 0;
    if (clCdNm === "상급종합") return 5;
    if (clCdNm === "종합병원") return 4;
    if (clCdNm === "병원") return 3;
    if (clCdNm === "치과병원" || clCdNm === "한방병원") return 2;
    return 1;
  };

  const displayRows = useMemo(() => {
    const withDistance = rows.map((h) => {
      if (!userPos || h.y_pos == null || h.x_pos == null) return { h, distance: null as number | null };
      return { h, distance: haversineKm(userPos.lat, userPos.lng, h.y_pos, h.x_pos) };
    });
    if (sort === "distance" && userPos) {
      return [...withDistance].sort((a, b) =>
        (a.distance ?? Infinity) - (b.distance ?? Infinity),
      );
    }
    if (sort === "doctors") {
      return [...withDistance].sort((a, b) => (b.h.dr_tot_cnt ?? 0) - (a.h.dr_tot_cnt ?? 0));
    }
    if (sort === "size") {
      return [...withDistance].sort((a, b) =>
        sizeRank(b.h.cl_cd_nm) - sizeRank(a.h.cl_cd_nm)
        || (b.h.dr_tot_cnt ?? 0) - (a.h.dr_tot_cnt ?? 0),
      );
    }
    return withDistance;
  }, [rows, userPos, sort]);

  const activeNear = !!userPos;

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        padding: "0 0 12px",
      }}>
        <span style={{ fontSize: 12, color: "var(--cm-text-2)", fontWeight: 600 }}>{labels.sortLabel}</span>
        {(["default", "doctors", "size"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSort(k)}
            className={`cm-filter-chip${sort === k ? " active" : ""}`}
            style={{ cursor: "pointer" }}
          >
            {k === "default" ? labels.sortDefault : k === "doctors" ? labels.sortDoctors : labels.sortSize}
          </button>
        ))}
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
                {tKind(h.cl_cd_nm ?? "병원", locale)} · {[
                  tSido(h.sido_cd_nm ?? "", locale),
                  tSiggu(h.sggu_cd_nm ?? "", locale),
                  h.emdong_nm && locale !== "ko" ? romanizeAddr(h.emdong_nm) : h.emdong_nm,
                ].filter(Boolean).join(" ")}
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
