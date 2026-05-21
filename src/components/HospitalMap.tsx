"use client";
/**
 * Leaflet 기반 인터랙티브 지도 — OpenStreetMap 타일 사용 (무료, 키 불필요)
 * - 검색결과 페이지에서 다중 핀 + 자동 bounds fit
 * - 병원 상세 미니맵에서 단일 핀
 */
import { useEffect, useRef } from "react";

export type MapPin = {
  id: string | number;
  lat: number;
  lng: number;
  label?: string;
  popup?: string;
  href?: string;
  active?: boolean;
};

type Props = {
  pins: MapPin[];
  height?: number | string;
  zoom?: number;
  center?: [number, number]; // [lat, lng]
  rounded?: boolean;
};

export function HospitalMap({ pins, height = 400, zoom, center, rounded = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || pins.length === 0) return;

    let cancelled = false;

    (async () => {
      // CSS 동적 로드 (서버 SSR과 무관)
      if (!document.querySelector('link[data-leaflet="1"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "anonymous";
        link.setAttribute("data-leaflet", "1");
        document.head.appendChild(link);
        // 짧게 대기 — CSS 적용 후 init
        await new Promise((r) => setTimeout(r, 50));
      }

      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      // 컨테이너에 이미 map이 있으면 제거 (HMR 대비)
      ref.current.innerHTML = "";

      // 기본 마커 아이콘 (Leaflet 기본은 unpkg 경로 의존)
      const icon = L.divIcon({
        html: '<div style="background:#0f172a;color:#fff;border-radius:999px 999px 999px 4px;padding:5px 10px;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(15,23,42,.25);white-space:nowrap;font-variant-numeric:tabular-nums">📍</div>',
        className: "",
        iconSize: [40, 28],
        iconAnchor: [12, 28],
      });

      const map = L.map(ref.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      const markers = pins.map((p, idx) => {
        const text = p.label ?? String(idx + 1);
        const isActive = p.active;
        const cmIcon = L.divIcon({
          html: `<div style="background:${isActive ? '#2563eb' : '#0f172a'};color:#fff;border-radius:999px 999px 999px 4px;padding:5px 10px;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(15,23,42,.25);white-space:nowrap;font-variant-numeric:tabular-nums;transform:translate(-50%,-100%);display:inline-block">${escapeHtml(text)}</div>`,
          className: "",
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        const m = L.marker([p.lat, p.lng], { icon: cmIcon }).addTo(map);
        if (p.popup) {
          m.bindPopup(
            p.href
              ? `<a href="${p.href}" style="text-decoration:none;color:#0f172a;font-weight:600">${escapeHtml(p.popup)}</a>`
              : escapeHtml(p.popup),
          );
        }
        if (p.href) {
          m.on("click", () => { location.href = p.href!; });
        }
        return m;
      });

      // bounds fit
      if (center && zoom != null) {
        map.setView(center, zoom);
      } else if (markers.length === 1) {
        map.setView([pins[0].lat, pins[0].lng], zoom ?? 15);
      } else {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15));
      }

      return () => {
        map.remove();
      };
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pins), height, zoom, center?.join(",")]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height,
        borderRadius: rounded ? 10 : 0,
        overflow: "hidden",
        background: "#eaf3fa",
      }}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
