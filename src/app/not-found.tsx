/**
 * Root-level not-found page.
 * 필수: app/[locale]/ dynamic segment 사용 시 Next.js가 404 페이지 구성하려면 필요.
 * 없으면 미매칭 경로 또는 notFound() 호출이 500으로 fallback됨.
 */
export default function NotFound() {
  return (
    <html lang="ko">
      <body style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', system-ui, sans-serif",
        margin: 0, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8fafc", color: "#0f172a",
      }}>
        <div style={{ maxWidth: 480, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.6 }}>404</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
            페이지를 찾을 수 없습니다
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 28 }}>
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 28px", borderRadius: 10,
              background: "#1d4ed8", color: "#fff",
              fontWeight: 600, textDecoration: "none",
            }}
          >
            홈으로 돌아가기
          </a>
        </div>
      </body>
    </html>
  );
}
