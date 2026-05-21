import Link from "next/link";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

export function Footer() {
  return (
    <footer className="cm-footer">
      <div className="cols">
        <div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "var(--cm-font-display)", fontWeight: 700,
              fontSize: 16, color: "var(--cm-ink)", marginBottom: 10,
            }}
          >
            <span
              className="brand-mark"
              style={{
                width: 24, height: 24,
                background: "var(--cm-primary)", borderRadius: 6,
                position: "relative",
              }}
              aria-hidden
            />
            {SITE_NAME}
          </div>
          <p style={{ maxWidth: 240, margin: 0, fontSize: 12, lineHeight: 1.55 }}>
            대한민국 개업의 정보를 한 곳에서. 환자가 적합한 병원을 더 빠르게 찾도록 돕습니다.
          </p>
        </div>
        <div>
          <h6>서비스</h6>
          <ul>
            <li><Link href="/search">병원 찾기</Link></li>
            <li><Link href="/specialty">진료과별</Link></li>
            <li><Link href="/region">지역별</Link></li>
          </ul>
        </div>
        <div>
          <h6>병원 운영자</h6>
          <ul>
            <li><a href="#">병원 등록</a></li>
            <li><a href="#">관리자 대시보드</a></li>
            <li><a href="#">광고 안내</a></li>
          </ul>
        </div>
        <div>
          <h6>회사</h6>
          <ul>
            <li><a href="#">소개</a></li>
            <li><a href="#">블로그</a></li>
            <li><a href="#">고객센터</a></li>
          </ul>
        </div>
        <div>
          <h6>법적 고지</h6>
          <ul>
            <li><a href="#">이용약관</a></li>
            <li><a href="#">개인정보처리방침</a></li>
            <li><a href="#">의료광고 심의기준</a></li>
          </ul>
        </div>
      </div>
      <div className="legal">
        <span>© {new Date().getFullYear()} {SITE_NAME}. 데이터 출처: 건강보험심사평가원 공공데이터포털.</span>
        <span>본 서비스는 의료법 제56조에 따라 운영되며 의료 자문 및 진단을 대체하지 않습니다.</span>
      </div>
    </footer>
  );
}
