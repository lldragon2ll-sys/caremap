import type { Metadata } from "next";
import Link from "next/link";
import { getSidoList, getSigguList, getHospitalsByRegion } from "@/lib/db";
import { HospitalCard } from "@/components/HospitalCard";

// Next.js 16 + 한국어 dynamic segment에서 x-next-cache-tags 헤더 ERR_INVALID_CHAR 회피
// ASCII slug 마이그레이션 전까지 force-dynamic + CDN 캐시 사용
export const dynamic = "force-dynamic";

type Params = Promise<{ sido: string }>;

export async function generateStaticParams() {
  try {
    const sidos = await getSidoList();
    return sidos.map((s) => ({ sido: encodeURIComponent(s.name) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { sido } = await params;
  const decoded = decodeURIComponent(sido);
  return {
    title: `${decoded} 병원 찾기 - 진료과·시군구별 검색`,
    description: `${decoded} 지역의 병원/의원/한의원/치과 등을 시군구별로 검색하세요.`,
    alternates: { canonical: `/${encodeURIComponent(decoded)}` },
  };
}

export default async function SidoPage({ params }: { params: Params }) {
  const { sido } = await params;
  const decoded = decodeURIComponent(sido);

  let sigguList: { name: string; count: number }[] = [];
  let topHospitals: Awaited<ReturnType<typeof getHospitalsByRegion>>["rows"] = [];
  let total = 0;
  try {
    sigguList = await getSigguList(decoded);
    const res = await getHospitalsByRegion(decoded, undefined, 6, 0);
    topHospitals = res.rows;
    total = res.total;
  } catch {}

  return (
    <>
      <section className="cm-cat-hero">
        <nav className="crumbs">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span style={{ color: "var(--cm-ink)", fontWeight: 600 }}>{decoded}</span>
        </nav>
        <h1>
          <span className="kr">{decoded}</span> 병원 찾기
        </h1>
        <p className="intro">
          {decoded} 지역의 <b>{total.toLocaleString("ko-KR")}곳</b> 병원·의원·치과·한의원 정보를 시군구별로 모았습니다.
          관심 있는 시·군·구를 선택해 상세 목록을 확인하세요.
        </p>
        <div className="stat-row">
          <span><b>{total.toLocaleString("ko-KR")}</b>개 병원</span>
          <span><b>{sigguList.length}</b>개 시·군·구</span>
        </div>
      </section>

      {sigguList.length > 0 && (
        <section className="cm-section">
          <div className="section-head">
            <div>
              <h2>시·군·구별 병원</h2>
              <div className="sub">관심 지역을 선택하세요</div>
            </div>
          </div>
          <div className="cm-xlink-grid">
            {sigguList.map((s) => (
              <Link
                key={s.name}
                href={`/${encodeURIComponent(decoded)}/${encodeURIComponent(s.name)}`}
                className="cm-xlink"
              >
                <span>{s.name}</span>
                <span className="arrow">{s.count.toLocaleString("ko-KR")}개 →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {topHospitals.length > 0 && (
        <section className="cm-section surface">
          <div className="section-head">
            <div>
              <h2>{decoded} 대표 병원</h2>
              <div className="sub">의사 수 기준 주요 병원</div>
            </div>
          </div>
          <div className="cm-card-grid">
            {topHospitals.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        </section>
      )}
    </>
  );
}
