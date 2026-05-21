import type { Metadata } from "next";
import Link from "next/link";
import { getHospitalsByRegion, getSidoList, getSigguList } from "@/lib/db";
import { HospitalCard } from "@/components/HospitalCard";

export const dynamic = "force-dynamic";

type Params = Promise<{ sido: string; sigungu: string }>;

const SPECIALTIES = [
  "내과", "외과", "정형외과", "성형외과", "피부과", "안과",
  "이비인후과", "산부인과", "소아청소년과", "치과", "한방", "가정의학과",
];

export async function generateStaticParams() {
  try {
    const sidos = await getSidoList();
    const out: { sido: string; sigungu: string }[] = [];
    for (const s of sidos) {
      const sigus = await getSigguList(s.name);
      for (const sg of sigus) {
        out.push({ sido: encodeURIComponent(s.name), sigungu: encodeURIComponent(sg.name) });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { sido, sigungu } = await params;
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);
  return {
    title: `${sidoNm} ${sigguNm} 병원 - 진료과목별 검색`,
    description: `${sidoNm} ${sigguNm} 지역의 병원·의원·치과·한의원을 진료과목별로 찾아보세요.`,
    alternates: {
      canonical: `/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}`,
    },
  };
}

export default async function SigunguPage({ params }: { params: Params }) {
  const { sido, sigungu } = await params;
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);

  let rows: Awaited<ReturnType<typeof getHospitalsByRegion>>["rows"] = [];
  let total = 0;
  try {
    const res = await getHospitalsByRegion(sidoNm, sigguNm, 12, 0);
    rows = res.rows;
    total = res.total;
  } catch {}

  return (
    <>
      <section className="cm-cat-hero">
        <nav className="crumbs">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href={`/${encodeURIComponent(sidoNm)}`}>{sidoNm}</Link>
          <span className="sep">›</span>
          <span style={{ color: "var(--cm-ink)", fontWeight: 600 }}>{sigguNm}</span>
        </nav>
        <h1>
          <span className="kr">{sidoNm} {sigguNm}</span> 병원
        </h1>
        <p className="intro">
          {sidoNm} {sigguNm} 지역의 <b>{total.toLocaleString("ko-KR")}곳</b> 병원·의원 정보입니다.
          관심 있는 진료과를 선택하시거나 아래 병원 목록에서 자세한 정보를 확인하세요.
        </p>
        <div className="pill-row">
          {SPECIALTIES.map((sp) => (
            <Link
              key={sp}
              href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}/${encodeURIComponent(sp)}`}
              className="cm-chip"
            >
              {sp}
            </Link>
          ))}
        </div>
        <div className="stat-row">
          <span><b>{total.toLocaleString("ko-KR")}</b>개 병원</span>
        </div>
      </section>

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>{sigguNm} 전체 병원</h2>
            <div className="sub">의사 수 기준 정렬</div>
          </div>
          <Link href={`/search?area=${encodeURIComponent(sigguNm)}`} className="seeall">
            전체 검색 →
          </Link>
        </div>
        {rows.length === 0 ? (
          <p style={{ color: "var(--cm-text-2)", fontSize: 14 }}>데이터가 없습니다.</p>
        ) : (
          <div className="cm-card-grid">
            {rows.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        )}
      </section>
    </>
  );
}
