"use client";
import { useEffect } from "react";

/**
 * Hospital detail 에러 바운더리.
 * ISR 환경에서 페이지가 throw 시 500을 1시간 캐싱하지 않고 즉시 친화적 UI 노출.
 * 에러는 Vercel 런타임 로그에 자동 기록.
 */
export default function HospitalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[hospital-detail error]", error?.message, error?.digest);
  }, [error]);

  return (
    <div style={{ maxWidth: 720, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        병원 정보를 불러오지 못했습니다
      </h1>
      <p style={{ fontSize: 14, color: "var(--cm-text-2)", lineHeight: 1.6, marginBottom: 24 }}>
        일시적인 오류로 페이지를 표시할 수 없습니다.<br />
        잠시 후 다시 시도해 주세요.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 22px", borderRadius: 8,
            background: "var(--cm-primary)", color: "#fff",
            border: "none", fontWeight: 600, cursor: "pointer",
          }}
        >
          다시 시도
        </button>
        <a
          href="/"
          style={{
            padding: "10px 22px", borderRadius: 8,
            background: "#fff", color: "var(--cm-ink)",
            border: "1px solid var(--cm-line)", fontWeight: 600,
            textDecoration: "none",
          }}
        >
          홈으로
        </a>
      </div>
      {error?.digest && (
        <p style={{ fontSize: 11, color: "var(--cm-text-3)", marginTop: 24 }}>
          오류 코드: {error.digest}
        </p>
      )}
    </div>
  );
}
