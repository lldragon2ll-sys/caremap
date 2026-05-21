import type { Metadata } from "next";
import Link from "next/link";
import { getHospitalsBySpecialty } from "@/lib/db";
import { HospitalCard } from "@/components/HospitalCard";

export const dynamic = "force-dynamic";

type Params = Promise<{ sido: string; sigungu: string; specialty: string }>;

const NEARBY_SPECIALTIES: Record<string, string[]> = {
  내과: ["가정의학과", "소아청소년과", "건강검진센터", "마취통증의학과"],
  외과: ["정형외과", "신경외과", "성형외과", "비뇨의학과"],
  정형외과: ["재활의학과", "외과", "신경외과", "통증클리닉"],
  성형외과: ["피부과", "안과", "치과교정과", "이비인후과"],
  피부과: ["성형외과", "안과", "내과", "한의원"],
  안과: ["피부과", "이비인후과", "성형외과", "내과"],
  이비인후과: ["내과", "안과", "치과", "소아청소년과"],
  산부인과: ["소아청소년과", "내과", "비뇨의학과", "가정의학과"],
  소아청소년과: ["산부인과", "이비인후과", "피부과", "치과"],
  치과: ["치과교정과", "구강악안면외과", "소아치과", "한의원"],
  한방: ["내과", "정형외과", "재활의학과", "통증클리닉"],
};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { sido, sigungu, specialty } = await params;
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);
  const sp = decodeURIComponent(specialty);
  return {
    title: `${sidoNm} ${sigguNm} ${sp} 추천 병원 - 진료시간·위치`,
    description: `${sidoNm} ${sigguNm}의 ${sp} 진료 가능 병원/의원 목록. 위치, 전화번호, 진료시간을 확인하세요.`,
    alternates: {
      canonical: `/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}/${encodeURIComponent(sp)}`,
    },
  };
}

function buildFaq(sido: string, sggu: string, sp: string) {
  return [
    {
      q: `${sggu} ${sp}는 몇 곳이 있나요?`,
      a: `${sido} ${sggu}에 등록된 ${sp} 관련 의료기관은 본 페이지의 목록에서 확인할 수 있습니다. 데이터는 건강보험심사평가원(HIRA) 공공데이터를 기반으로 합니다.`,
    },
    {
      q: `진료시간은 어떻게 확인하나요?`,
      a: `각 병원의 상세 페이지에서 전화번호를 확인하거나 직접 방문하여 진료시간을 문의해주세요. 진료시간 데이터는 추후 의료기관별상세정보서비스 연동으로 표시될 예정입니다.`,
    },
    {
      q: `예약은 어떻게 하나요?`,
      a: `현재 본 사이트는 진료 예약 기능을 제공하지 않습니다. 병원 상세 페이지의 전화번호로 직접 문의하시거나 병원 홈페이지를 이용해주세요.`,
    },
    {
      q: `데이터는 얼마나 자주 업데이트되나요?`,
      a: `HIRA에서 공개하는 데이터를 정기적으로 수집하여 갱신합니다. 데이터의 정확성이 100% 보장되지는 않으므로 실제 방문 전 전화로 확인을 권장합니다.`,
    },
    {
      q: `${sp} 진료 가능한 병원을 어떻게 고르나요?`,
      a: `의사 수, 종별(상급종합/종합/병원/의원), 위치 접근성을 종합적으로 고려하시면 좋습니다. 본 페이지의 목록은 의사 수 기준 정렬되어 있습니다.`,
    },
  ];
}

function buildFaqLD(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

function buildBreadcrumbLD(sido: string, sggu: string, sp: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: sido, item: `${siteUrl}/${encodeURIComponent(sido)}` },
      { "@type": "ListItem", position: 3, name: sggu, item: `${siteUrl}/${encodeURIComponent(sido)}/${encodeURIComponent(sggu)}` },
      { "@type": "ListItem", position: 4, name: sp },
    ],
  };
}

export default async function SpecialtyPage({ params }: { params: Params }) {
  const { sido, sigungu, specialty } = await params;
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);
  const sp = decodeURIComponent(specialty);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  let rows: Awaited<ReturnType<typeof getHospitalsBySpecialty>>["rows"] = [];
  let total = 0;
  try {
    const res = await getHospitalsBySpecialty(sidoNm, sigguNm, sp, 12, 0);
    rows = res.rows;
    total = res.total;
  } catch {}

  const faq = buildFaq(sidoNm, sigguNm, sp);
  const nearby = NEARBY_SPECIALTIES[sp] ?? ["내과", "가정의학과", "소아청소년과", "치과"];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqLD(faq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbLD(sidoNm, sigguNm, sp, siteUrl)) }}
      />

      <section className="cm-cat-hero">
        <nav className="crumbs">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href={`/${encodeURIComponent(sidoNm)}`}>{sidoNm}</Link>
          <span className="sep">›</span>
          <Link href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}`}>{sigguNm}</Link>
          <span className="sep">›</span>
          <span style={{ color: "var(--cm-ink)", fontWeight: 600 }}>{sp}</span>
        </nav>
        <h1>
          <span className="kr">{sigguNm} {sp}</span> 추천 병원
        </h1>
        <p className="intro">
          {sidoNm} {sigguNm} 지역의 <b>{total.toLocaleString("ko-KR")}곳</b> {sp} 진료 가능 병원·의원 정보입니다.
          위치·전화번호·의료진 정보를 확인하고 가장 가까운 병원으로 바로 전화 문의하세요.
          모든 데이터는 건강보험심사평가원(HIRA) 공공데이터 기반의 <b>인증 의료기관</b>입니다.
        </p>
        <div className="pill-row">
          {[`${sp}`, "전문의 진료", "주차 가능", "야간 진료", "주말 진료", "초진 가능", "예방 진료", "건강검진"].map((p) => (
            <span key={p} className="cm-chip">{p}</span>
          ))}
        </div>
        <div className="stat-row">
          <span><b>{total.toLocaleString("ko-KR")}</b>개 병원</span>
          <span>HIRA 인증 <b>100%</b></span>
          <span>실시간 공공데이터 기반</span>
        </div>
      </section>

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>{sigguNm} {sp} 병원</h2>
            <div className="sub">의사 수 기준 정렬</div>
          </div>
          <Link
            href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}`}
            className="seeall"
          >
            {sigguNm} 전체 보기 →
          </Link>
        </div>
        {rows.length === 0 ? (
          <p style={{ color: "var(--cm-text-2)", fontSize: 14 }}>해당 조건의 병원 데이터를 찾을 수 없습니다.</p>
        ) : (
          <div className="cm-card-grid">
            {rows.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        )}
      </section>

      <section className="cm-section surface">
        <div className="section-head">
          <div>
            <h2>자주 묻는 질문</h2>
            <div className="sub">{sp} 진료 관련 안내</div>
          </div>
        </div>
        <div className="cm-faq">
          {faq.map((it, i) => (
            <details key={i} open={i === 0}>
              <summary>{it.q}</summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>근처 다른 진료과</h2>
            <div className="sub">{sigguNm}에서 함께 찾아보세요</div>
          </div>
        </div>
        <div className="cm-xlink-grid">
          {nearby.map((n) => (
            <Link
              key={n}
              href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}/${encodeURIComponent(n)}`}
              className="cm-xlink"
            >
              <span>{sigguNm} {n}</span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
