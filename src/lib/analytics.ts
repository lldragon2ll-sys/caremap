/**
 * 통합 이벤트 트래킹 — 클라이언트 사이드.
 * GA4 (gtag) + Meta Pixel (fbq) + Kakao Pixel (kakaoPixel) 자동 발화.
 *
 * 각 픽셀은 NEXT_PUBLIC_*_ID 환경 변수가 있을 때만 로드/발화.
 * 페이지뷰는 AnalyticsProvider 컴포넌트에서 자동 처리.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    kakaoPixel?: (id: string) => { pageView: (tag?: string) => void; completeRegistration: () => void; participation: () => void; };
  }
}

export type LeadEvent = {
  hospitalSlug?: string;
  hospitalName?: string;
  channel: "phone" | "modal_open" | "modal_submit" | "external_map" | "save" | "share";
  value?: number;
};

/**
 * 통합 이벤트 트래킹.
 * - GA4: event(name, params)
 * - Meta Pixel: Lead / Contact / CustomEvent
 * - Kakao Pixel: participation
 */
export function track(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    // GA4
    if (window.gtag) {
      window.gtag("event", eventName, params ?? {});
    }
    // dataLayer 직접 push도 가능 (GTM 호환)
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...params });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[analytics.track]", e);
  }
}

/** 리드 (전환) 이벤트 — 모든 픽셀에 동시 발화 */
export function trackLead(ev: LeadEvent) {
  if (typeof window === "undefined") return;
  const params = {
    hospital_slug: ev.hospitalSlug,
    hospital_name: ev.hospitalName,
    channel: ev.channel,
    value: ev.value ?? 1,
    currency: "KRW",
  };

  try {
    // GA4 conversion event
    if (window.gtag) {
      window.gtag("event", `lead_${ev.channel}`, params);
      // 종합 lead 이벤트도 (GA4 사용자 정의 전환에서 묶기 쉬움)
      window.gtag("event", "generate_lead", params);
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: "generate_lead", ...params });
    }
    // Meta Pixel
    if (window.fbq) {
      const eventMap: Record<LeadEvent["channel"], string> = {
        phone: "Contact",
        modal_open: "InitiateCheckout",
        modal_submit: "Lead",
        external_map: "FindLocation",
        save: "AddToWishlist",
        share: "ViewContent",
      };
      window.fbq("track", eventMap[ev.channel] ?? "Lead", params);
    }
    // Kakao Pixel
    const kakaoId = process.env.NEXT_PUBLIC_KAKAO_PIXEL_ID;
    if (kakaoId && typeof window.kakaoPixel === "function") {
      const px = window.kakaoPixel(kakaoId);
      if (ev.channel === "modal_submit") px.completeRegistration();
      else px.participation();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[analytics.trackLead]", e);
  }
}
