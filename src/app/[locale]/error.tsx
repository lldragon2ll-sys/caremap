"use client";
import { useEffect } from "react";

/**
 * Locale 세그먼트 전역 에러 바운더리.
 * 어떤 페이지든 throw 시 500 캐싱 대신 친화적 fallback 노출.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[locale-error]", error?.message, error?.digest);
  }, [error]);

  return (
    <div style={{ maxWidth: 720, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        일시적인 오류가 발생했습니다
      </h1>
      <p style={{ fontSize: 14, color: "var(--cm-text-2)", lineHeight: 1.6, marginBottom: 24 }}>
        잠시 후 다시 시도해 주세요. 문제가 지속되면 페이지를 새로고침해 보세요.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 22px", borderRadius: 8,
            background: "var(--cm-primary, #2563eb)", color: "#fff",
            border: "none", fontWeight: 600, cursor: "pointer",
          }}
        >
          다시 시도
        </button>
        <a
          href="/"
          style={{
            padding: "10px 22px", borderRadius: 8,
            background: "#fff", color: "var(--cm-ink, #0f172a)",
            border: "1px solid var(--cm-line, #e5e7eb)", fontWeight: 600,
            textDecoration: "none",
          }}
        >
          홈으로
        </a>
      </div>
      {error?.digest && (
        <p style={{ fontSize: 11, color: "var(--cm-text-3, #94a3b8)", marginTop: 24 }}>
          오류 코드: {error.digest}
        </p>
      )}
    </div>
  );
}
