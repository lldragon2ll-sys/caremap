import Link from "next/link";
import { getSidoList } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { HospitalCard } from "@/components/HospitalCard";
import { SpecialtyTile } from "@/components/SpecialtyTile";
import { Icon } from "@/components/Icon";
import type { Hospital } from "@/lib/types";

export const revalidate = 3600;

// 홈에 표시할 진료과 16개 (영문 약자 코드는 cm-spec .ico에 사용)
const SPECIALTIES: { code: string; name: string }[] = [
  { code: "IM",  name: "내과" },
  { code: "GS",  name: "외과" },
  { code: "OS",  name: "정형외과" },
  { code: "NS",  name: "신경외과" },
  { code: "PS",  name: "성형외과" },
  { code: "DM",  name: "피부과" },
  { code: "OP",  name: "안과" },
  { code: "ENT", name: "이비인후과" },
  { code: "OB",  name: "산부인과" },
  { code: "PD",  name: "소아청소년과" },
  { code: "PSY", name: "정신과" },
  { code: "UR",  name: "비뇨의학과" },
  { code: "AN",  name: "마취통증과" },
  { code: "RM",  name: "재활의학과" },
  { code: "FM",  name: "가정의학과" },
  { code: "DT",  name: "치과" },
];

// 홈 하단 cross-link 12개 (SEO용)
const CROSS_LINKS: { sido: string; sggu: string; specialty: string }[] = [
  { sido: "서울", sggu: "강남구", specialty: "피부과" },
  { sido: "서울", sggu: "강남구", specialty: "성형외과" },
  { sido: "서울", sggu: "서초구", specialty: "내과" },
  { sido: "서울", sggu: "송파구", specialty: "정형외과" },
  { sido: "서울", sggu: "마포구", specialty: "치과" },
  { sido: "경기", sggu: "성남시 분당구", specialty: "소아청소년과" },
  { sido: "경기", sggu: "수원시 영통구", specialty: "내과" },
  { sido: "경기", sggu: "용인시 수지구", specialty: "치과" },
  { sido: "부산", sggu: "해운대구", specialty: "안과" },
  { sido: "부산", sggu: "부산진구", specialty: "이비인후과" },
  { sido: "대구", sggu: "수성구", specialty: "정형외과" },
  { sido: "인천", sggu: "남동구", specialty: "내과" },
];

async function getTopHospitals(limit = 6): Promise<Hospital[]> {
  try {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("dr_tot_cnt", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Hospital[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [sidos, top] = await Promise.all([
    getSidoList().catch(() => []),
    getTopHospitals(6),
  ]);
  const totalCount = sidos.reduce((a, b) => a + b.count, 0);

  return (
    <>
      <section className="cm-hero">
        <span className="eyebrow">대한민국 {totalCount > 0 ? `${totalCount.toLocaleString("ko-KR")}+ 개` : "전국"} 병·의원</span>
        <h1>
          <span style={{ color: "var(--cm-primary)" }}>가장 가까운</span> <span className="kr">병원을</span><br />
          <span className="kr">한 번에 찾기</span>
        </h1>
        <p className="lede">
          지역과 진료과로 빠르게 검색하고, 전화 한 통으로 바로 문의하세요. 전국 7만여 의원·병원·치과·한의원 정보를 한 곳에 모았습니다.
        </p>

        <form action="/search" method="get" className="cm-searchbar" role="search">
          <div className="field">
            <label htmlFor="q">진료과 / 병원명</label>
            <input id="q" name="q" type="search" placeholder="예: 피부과, 강남세브란스" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="area">지역</label>
            <input id="area" name="area" type="search" placeholder="시·구 (예: 강남구)" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="kind">병원 종별</label>
            <select id="kind" name="kind" defaultValue="">
              <option value="">전체</option>
              <option value="상급종합">상급종합병원</option>
              <option value="종합병원">종합병원</option>
              <option value="병원">병원</option>
              <option value="의원">의원</option>
              <option value="치과의원">치과의원</option>
              <option value="한의원">한의원</option>
              <option value="요양병원">요양병원</option>
            </select>
          </div>
          <button type="submit" className="submit">
            <Icon name="search" size={14} color="#fff" />
            검색
          </button>
        </form>

        <div className="cm-chips">
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
            인기 검색:
          </span>
          {["피부과", "성형외과", "치과", "내과", "소아청소년과"].map((c) => (
            <Link key={c} href={`/search?q=${encodeURIComponent(c)}`} className="cm-chip">
              {c}
            </Link>
          ))}
        </div>

        <div className="meta-row">
          <span><b>{totalCount > 0 ? totalCount.toLocaleString("ko-KR") : "—"}</b> 등록 병원</span>
          <span><b>17</b> 광역시·도 커버</span>
          <span>데이터 출처: <b>HIRA</b> 공공데이터포털</span>
        </div>
      </section>

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>진료과 둘러보기</h2>
            <div className="sub">자주 찾는 진료과부터 빠르게 시작하세요.</div>
          </div>
          <Link href="/specialty" className="seeall">전체 진료과 보기 <Icon name="arrow-r" size={12} /></Link>
        </div>
        <div className="cm-spec-grid">
          {SPECIALTIES.map((s) => (
            <SpecialtyTile
              key={s.name}
              code={s.code}
              name={s.name}
              href={`/search?q=${encodeURIComponent(s.name)}`}
            />
          ))}
        </div>
      </section>

      {top.length > 0 && (
        <section className="cm-section surface">
          <div className="section-head">
            <div>
              <h2>대표 병원</h2>
              <div className="sub">의사 수 기준 전국 주요 병원</div>
            </div>
            <Link href="/search" className="seeall">전체 보기 <Icon name="arrow-r" size={12} /></Link>
          </div>
          <div className="cm-card-grid">
            {top.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        </section>
      )}

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>지역별 인기 검색</h2>
            <div className="sub">SEO 진입 페이지 — 자주 검색되는 지역×진료과 조합</div>
          </div>
        </div>
        <div className="cm-xlink-grid">
          {CROSS_LINKS.map((c) => (
            <Link
              key={`${c.sido}-${c.sggu}-${c.specialty}`}
              href={`/${encodeURIComponent(c.sido)}/${encodeURIComponent(c.sggu)}/${encodeURIComponent(c.specialty)}`}
              className="cm-xlink"
            >
              <span>{c.sggu} {c.specialty}</span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {sidos.length > 0 && (
        <section className="cm-section surface">
          <div className="section-head">
            <div>
              <h2>전국 시·도</h2>
              <div className="sub">광역시·도별 등록 병원 수</div>
            </div>
          </div>
          <div className="cm-xlink-grid">
            {sidos.slice(0, 16).map((s) => (
              <Link key={s.name} href={`/${encodeURIComponent(s.name)}`} className="cm-xlink">
                <span>{s.name}</span>
                <span className="arrow">{s.count.toLocaleString("ko-KR")}개 →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
