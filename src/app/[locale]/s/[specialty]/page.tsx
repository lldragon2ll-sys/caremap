import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { supabase } from "@/lib/supabase";
import { HospitalCard } from "@/components/HospitalCard";
import { SpecialtyIcon, accentFor } from "@/components/SpecialtyIcon";
import { tSpecialty, pick4, searchKeyToKorean } from "@/lib/i18n-dict";
import { buildPageMeta, SITE_URL } from "@/lib/seo";
import type { Hospital } from "@/lib/types";

type Params = Promise<{ locale: string; specialty: string }>;

export const dynamic = "force-dynamic";

/**
 * 진료과 전국 허브 — /s/{specialty}
 * - 영문/일본/중문 입력도 받아 KO로 매핑
 * - 시·도별 클리닉 수 + 전국 인기 30개 클리닉
 * - 내부링크 정규화 (홈/네비/푸터의 /search?q= 대체)
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, specialty } = await params;
  const decoded = decodeURIComponent(specialty);
  // 외국어 입력 시 KO로 매핑 (메타 정확도)
  const koMatches = searchKeyToKorean(decoded, locale);
  const koSpecialty = koMatches[0] ?? decoded;
  const display = tSpecialty(koSpecialty, locale);
  return buildPageMeta({
    locale,
    pathSegment: `/s/${encodeURIComponent(decoded)}`,
    title: pick4(locale,
      `전국 ${koSpecialty} 추천 병원 — 시·도별 모음`,
      `${display} Clinics in Korea — Browse by Region`,
      `韓国の${display}クリニック — 地域別一覧`,
      `韩国${display}诊所 — 按地区浏览`,
    ),
    description: pick4(locale,
      `전국의 ${koSpecialty} 진료 가능 의료기관을 시·도별로 모았습니다. 위치, 전화, 의료진 정보를 확인하고 가까운 병원으로 바로 문의하세요.`,
      `${display} clinics across Korea, organized by province. Check location, phone and medical team — call directly.`,
      `韓国全国の${display}クリニックを地域別にまとめました。位置・電話・医療スタッフ情報を確認できます。`,
      `按省份整理的韩国${display}诊所。可查看位置、电话与医疗团队信息。`,
    ),
  });
}

export default async function SpecialtyHubPage({ params }: { params: Params }) {
  const { locale, specialty } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const decoded = decodeURIComponent(specialty);
  const koMatches = searchKeyToKorean(decoded, locale);
  const koSpecialty = koMatches[0] ?? decoded;
  const display = tSpecialty(koSpecialty, locale);
  const accent = accentFor(null, koSpecialty);

  // 전국 시·도별 카운트 (이름에 진료과 키워드 포함된 의원/병원)
  const safeKo = koSpecialty.replace(/[%,()*\\]/g, "");
  const isDental = koSpecialty.includes("치과");
  const isKorean = koSpecialty.includes("한") || koSpecialty.includes("한의");

  let top: Hospital[] = [];
  try {
    let q = supabase
      .from("hospitals")
      .select("*")
      .order("dr_tot_cnt", { ascending: false })
      .limit(24);
    if (isDental) q = q.or("cl_cd_nm.eq.치과의원,cl_cd_nm.eq.치과병원");
    else if (isKorean) q = q.or("cl_cd_nm.eq.한의원,cl_cd_nm.eq.한방병원");
    else q = q.ilike("yadm_nm", `%${safeKo}%`);
    const { data } = await q;
    top = (data ?? []) as Hospital[];
  } catch {}

  // 시·도별 카운트 — view 활용 어렵고 ilike 비싸므로 top 24를 sido별로 그룹
  const sidoCounts = new Map<string, number>();
  for (const h of top) {
    if (!h.sido_cd_nm) continue;
    sidoCounts.set(h.sido_cd_nm, (sidoCounts.get(h.sido_cd_nm) ?? 0) + 1);
  }

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${display} 전국 추천`,
    numberOfItems: top.length,
    itemListElement: top.slice(0, 12).map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${locale === "ko" ? "" : `/${locale}`}/hospital/${encodeURIComponent(h.slug)}`,
      name: h.yadm_nm,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: `${SITE_URL}${locale === "ko" ? "/" : `/${locale}`}` },
      { "@type": "ListItem", position: 2, name: display },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="cm-cat-hero">
        <nav className="crumbs">
          <Link href="/">{tNav("home")}</Link>
          <span className="sep">›</span>
          <span style={{ color: "var(--cm-ink)", fontWeight: 600 }}>{display}</span>
        </nav>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          marginBottom: 12, padding: "6px 14px 6px 10px", borderRadius: 999,
          background: accent.bgSoft, color: accent.ink,
          fontSize: 13, fontWeight: 700,
        }}>
          <SpecialtyIcon kind={koSpecialty} size={18} color={accent.ink} />
          {display}
        </div>
        <h1>{pick4(locale,
          `${koSpecialty} 추천 병원 모음`,
          `${display} clinics across Korea`,
          `${display}クリニック全国`,
          `${display}诊所 全国`,
        )}</h1>
        <p className="intro">
          {pick4(locale,
            `전국의 ${koSpecialty} 진료 가능 의료기관을 시·도별로 모았습니다. 모든 데이터는 건강보험심사평가원(HIRA) 공공데이터 기반.`,
            `${display} clinics across Korea organized by region. All data from Korea's HIRA public dataset.`,
            `韓国全国の${display}クリニックを地域別に。データはHIRA(韓国公共データ)に基づきます。`,
            `按地区整理的韩国${display}诊所。所有数据基于HIRA(韩国公共数据)。`,
          )}
        </p>
      </section>

      {/* 시·도별 진입 */}
      {sidoCounts.size > 0 && (
        <section className="cm-section">
          <div className="section-head">
            <div>
              <h2>{pick4(locale, "시·도별 보기", "Browse by Region", "地域別", "按地区浏览")}</h2>
            </div>
          </div>
          <div className="cm-xlink-grid">
            {Array.from(sidoCounts.entries()).sort((a, b) => b[1] - a[1]).map(([sido]) => (
              <Link key={sido}
                href={`/${encodeURIComponent(sido)}`}
                className="cm-xlink">
                <span>{sido} {display}</span>
                <span className="arrow">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 전국 인기 */}
      {top.length > 0 && (
        <section className="cm-section surface">
          <div className="section-head">
            <div>
              <h2>{pick4(locale, "전국 인기 클리닉", "Featured Clinics Nationwide", "全国おすすめクリニック", "全国推荐诊所")}</h2>
            </div>
          </div>
          <div className="cm-card-grid">
            {top.slice(0, 12).map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        </section>
      )}
    </>
  );
}
