"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { HospitalLogo } from "./HospitalLogo";
import { sizeCategory } from "@/lib/hospital-util";
import { tSido, tSiggu, tKind } from "@/lib/i18n-dict";
import { romanizeYadm, romanizeAddr } from "@/lib/romanize";
import type { Hospital } from "@/lib/types";

type Labels = {
  near: string; cancel: string;
  locating: string; loadingAll: string;
  denied: string; unavailable: string;
  noCoord: string;
  away: (km: string) => string;
  sortLabel: string;
  sortDefault: string; sortDoctors: string; sortSize: string;
  prev: string; next: string;
  globalNote: (n: number) => string; // "전체 N개 대상 거리순"
};

type SortKey = "default" | "doctors" | "size" | "distance";
const CLIENT_PAGE_SIZE = 30;

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

const sizeRank = (clCdNm: string | null): number => {
  if (!clCdNm) return 0;
  if (clCdNm === "상급종합") return 5;
  if (clCdNm === "종합병원") return 4;
  if (clCdNm === "병원") return 3;
  if (clCdNm === "치과병원" || clCdNm === "한방병원") return 2;
  return 1;
};

export function SearchResultsClient({
  rows,
  locale,
  searchQuery,
  serverPagination,
}: {
  rows: Hospital[];
  locale: string;
  searchQuery: { q: string; area: string; kind: string };
  serverPagination: { page: number; totalPages: number };
}) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("default");
  // 거리순 정렬용 전체 결과 (서버 페이지 경계 무시)
  const [bulkRows, setBulkRows] = useState<Hospital[] | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [clientPage, setClientPage] = useState(1);

  const labels: Labels = useMemo(() => {
    if (locale === "en") return {
      near: "Nearest first", cancel: "Default order",
      locating: "Locating…", loadingAll: "Loading all results…",
      denied: "Location access denied", unavailable: "Location unavailable",
      noCoord: "Hospitals without coordinates are excluded.",
      away: (km) => `${km} km away`,
      sortLabel: "Sort:", sortDefault: "Best match", sortDoctors: "Most doctors", sortSize: "Largest",
      prev: "Previous", next: "Next",
      globalNote: (n) => `Distance-sorted across all ${n.toLocaleString()} matches`,
    };
    if (locale === "ja") return {
      near: "近い順", cancel: "元の順序",
      locating: "位置取得中…", loadingAll: "全件読み込み中…",
      denied: "位置アクセスが拒否されました", unavailable: "位置情報を利用できません",
      noCoord: "座標のない病院は除外されます。",
      away: (km) => `${km} km`,
      sortLabel: "並べ替え:", sortDefault: "おすすめ順", sortDoctors: "医師数順", sortSize: "規模順",
      prev: "前へ", next: "次へ",
      globalNote: (n) => `全${n.toLocaleString()}件を距離順に並べ替え`,
    };
    if (locale === "zh") return {
      near: "最近优先", cancel: "默认排序",
      locating: "正在定位…", loadingAll: "正在加载全部结果…",
      denied: "位置访问被拒绝", unavailable: "无法获取位置",
      noCoord: "无坐标的医院将被排除。",
      away: (km) => `${km} km`,
      sortLabel: "排序:", sortDefault: "推荐", sortDoctors: "医师数", sortSize: "规模",
      prev: "上一页", next: "下一页",
      globalNote: (n) => `全部${n.toLocaleString()}家按距离排序`,
    };
    return {
      near: "내 위치 가까운 순", cancel: "원래 순서",
      locating: "위치 찾는 중…", loadingAll: "전체 결과 불러오는 중…",
      denied: "위치 접근이 거부됨", unavailable: "위치를 사용할 수 없습니다",
      noCoord: "좌표가 없는 병원은 제외됩니다.",
      away: (km) => `${km} km`,
      sortLabel: "정렬:", sortDefault: "추천순", sortDoctors: "의사 많은 순", sortSize: "규모 순",
      prev: "이전", next: "다음",
      globalNote: (n) => `전체 ${n.toLocaleString()}건 대상 거리순 정렬`,
    };
  }, [locale]);

  // 거리 모드 활성화 시 bulk 결과 fetch (한 번만)
  useEffect(() => {
    if (sort !== "distance" || !userPos || bulkRows !== null || bulkLoading) return;
    setBulkLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.q) params.set("q", searchQuery.q);
    if (searchQuery.area) params.set("area", searchQuery.area);
    if (searchQuery.kind) params.set("kind", searchQuery.kind);
    params.set("locale", locale);
    fetch(`/api/search?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setBulkRows((data?.rows ?? []) as Hospital[]);
      })
      .catch(() => {
        setBulkRows(rows); // 폴백: 서버 페이지 결과로
      })
      .finally(() => setBulkLoading(false));
  }, [sort, userPos, bulkRows, bulkLoading, searchQuery, locale, rows]);

  // 정렬·페이지 바뀌면 클라이언트 페이지 1로 리셋
  useEffect(() => setClientPage(1), [sort, userPos]);

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

  // 거리 모드 + bulk 로드 완료 시 bulkRows를, 그 외엔 서버 페이지 rows를 사용
  const sourceRows = sort === "distance" && bulkRows ? bulkRows : rows;
  const usingBulk = sort === "distance" && bulkRows !== null;

  const sortedRows = useMemo(() => {
    const withDistance = sourceRows.map((h) => {
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
  }, [sourceRows, userPos, sort]);

  // bulk 모드일 때만 클라이언트 페이지네이션 적용 (서버 페이지네이션은 부모가 처리)
  const totalClientPages = usingBulk ? Math.max(1, Math.ceil(sortedRows.length / CLIENT_PAGE_SIZE)) : 1;
  const pagedRows = usingBulk
    ? sortedRows.slice((clientPage - 1) * CLIENT_PAGE_SIZE, clientPage * CLIENT_PAGE_SIZE)
    : sortedRows;

  const activeNear = !!userPos;

  return (
    <>
      <div className="sort-bar-mobile" style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        padding: "12px 24px",
        borderBottom: "1px solid var(--cm-line)",
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
          {status === "loading"
            ? labels.locating
            : bulkLoading
              ? labels.loadingAll
              : activeNear ? labels.cancel : labels.near}
        </button>
        {status === "error" && (
          <span style={{ fontSize: 12, color: "var(--cm-red, #d33)" }}>{errMsg}</span>
        )}
        {activeNear && usingBulk && (
          <span style={{ fontSize: 11.5, color: "var(--cm-text-2)" }}>
            {labels.globalNote(sortedRows.length)} · {labels.noCoord}
          </span>
        )}
        {activeNear && !usingBulk && !bulkLoading && (
          <span style={{ fontSize: 11.5, color: "var(--cm-text-2)" }}>{labels.noCoord}</span>
        )}
      </div>

      {pagedRows.map(({ h, distance }, i) => {
        const size = sizeCategory(h);
        const distLabel =
          distance != null && distance !== Infinity
            ? labels.away(distance < 10 ? distance.toFixed(1) : distance.toFixed(0))
            : null;
        const rowNum = usingBulk ? (clientPage - 1) * CLIENT_PAGE_SIZE + i + 1 : i + 1;
        return (
          <Link
            key={h.id}
            href={`/hospital/${encodeURIComponent(h.slug)}`}
            className="cm-result-row"
          >
            <span className="pin-num">{rowNum}</span>
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

      {/* 거리 모드: 클라이언트 페이지네이션 (전체 결과 대상) */}
      {usingBulk && totalClientPages > 1 && (
        <div className="pager-mobile" style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 8, padding: "16px 24px", fontSize: 13,
        }}>
          <button
            type="button"
            disabled={clientPage <= 1}
            onClick={() => setClientPage((p) => Math.max(1, p - 1))}
            className="cm-filter-chip"
            style={{ cursor: clientPage <= 1 ? "not-allowed" : "pointer", opacity: clientPage <= 1 ? 0.4 : 1 }}
          >
            {labels.prev}
          </button>
          <span style={{ alignSelf: "center", color: "var(--cm-text-2)" }}>
            {clientPage} / {totalClientPages}
          </span>
          <button
            type="button"
            disabled={clientPage >= totalClientPages}
            onClick={() => setClientPage((p) => Math.min(totalClientPages, p + 1))}
            className="cm-filter-chip"
            style={{ cursor: clientPage >= totalClientPages ? "not-allowed" : "pointer", opacity: clientPage >= totalClientPages ? 0.4 : 1 }}
          >
            {labels.next}
          </button>
        </div>
      )}

      {/* 기본 모드: 서버 페이지네이션 (URL ?page=N) — 거리 모드일 때는 숨김 */}
      {!usingBulk && !bulkLoading && serverPagination.totalPages > 1 && (
        <div className="pager-mobile" style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 8, padding: "16px 24px", fontSize: 13,
        }}>
          {serverPagination.page > 1 && (
            <Link
              href={buildServerHref(searchQuery, serverPagination.page - 1)}
              className="cm-filter-chip"
            >
              {labels.prev}
            </Link>
          )}
          <span style={{ alignSelf: "center", color: "var(--cm-text-2)" }}>
            {serverPagination.page} / {serverPagination.totalPages}
          </span>
          {serverPagination.page < serverPagination.totalPages && (
            <Link
              href={buildServerHref(searchQuery, serverPagination.page + 1)}
              className="cm-filter-chip"
            >
              {labels.next}
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function buildServerHref(
  q: { q: string; area: string; kind: string },
  page: number,
): string {
  const u = new URLSearchParams();
  if (q.q) u.set("q", q.q);
  if (q.area) u.set("area", q.area);
  if (q.kind) u.set("kind", q.kind);
  if (page > 1) u.set("page", String(page));
  const qs = u.toString();
  return qs ? `/search?${qs}` : "/search";
}
