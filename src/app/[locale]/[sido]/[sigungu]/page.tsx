import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHospitalsByRegion } from "@/lib/db";
import { HospitalCard } from "@/components/HospitalCard";
import { tSido, tSiggu, tSpecialty, pick4 } from "@/lib/i18n-dict";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; sido: string; sigungu: string }>;

const SPECIALTIES = [
  "성형외과", "피부과", "치과", "안과", "한의원", "정신과",
  "정형외과", "마취통증과", "재활의학과", "비뇨의학과", "산부인과", "가정의학과",
];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, sido, sigungu } = await params;
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);
  const sidoDisplay = tSido(sidoNm, locale);
  const sigguDisplay = tSiggu(sigguNm, locale);
  return {
    title: pick4(locale,
      `${sidoNm} ${sigguNm} 병원 - 진료과목별 검색`,
      `Clinics in ${sidoDisplay} ${sigguDisplay} — Search by Specialty`,
      `${sidoDisplay} ${sigguDisplay}のクリニック — 診療科別検索`,
      `${sidoDisplay} ${sigguDisplay}诊所 — 按科室搜索`,
    ),
    description: pick4(locale,
      `${sidoNm} ${sigguNm} 지역의 병원·의원·치과·한의원을 진료과목별로 찾아보세요.`,
      `Find clinics, dentists, Korean medicine and hospitals in ${sidoDisplay} ${sigguDisplay} by specialty.`,
      `${sidoDisplay} ${sigguDisplay}地域のクリニック・歯科・韓医院を診療科別に検索。`,
      `按科室搜索${sidoDisplay} ${sigguDisplay}的诊所、牙科、韩医院。`,
    ),
    alternates: {
      canonical: locale === "ko"
        ? `/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}`
        : `/${locale}/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}`,
    },
  };
}

export default async function SigunguPage({ params }: { params: Params }) {
  const { locale, sido, sigungu } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sigungu");
  const tNav = await getTranslations("nav");
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);
  const sidoDisplay = tSido(sidoNm, locale);
  const sigguDisplay = tSiggu(sigguNm, locale);

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
          <Link href="/">{tNav("home")}</Link>
          <span className="sep">›</span>
          <Link href={`/${encodeURIComponent(sidoNm)}`}>{sidoDisplay}</Link>
          <span className="sep">›</span>
          <span style={{ color: "var(--cm-ink)", fontWeight: 600 }}>{sigguDisplay}</span>
        </nav>
        <h1>
          <span className="kr">{t("h1", { sido: sidoDisplay, sggu: sigguDisplay })}</span>
        </h1>
        <p className="intro">
          {t.rich("intro", {
            sido: sidoDisplay,
            sggu: sigguDisplay,
            count: total,
            b: (chunks) => <b>{chunks}</b>,
          })}
        </p>
        <div className="pill-row">
          {SPECIALTIES.map((sp) => (
            <Link
              key={sp}
              href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}/${encodeURIComponent(sp)}`}
              className="cm-chip"
            >
              {tSpecialty(sp, locale)}
            </Link>
          ))}
        </div>
        <div className="stat-row">
          <span><b>{total.toLocaleString()}</b> {pick4(locale, "개 병원", "clinics", "件", "家")}</span>
        </div>
      </section>

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>{t("allTitle", { sggu: sigguDisplay })}</h2>
            <div className="sub">{t("allSub")}</div>
          </div>
          <Link href={`/search?area=${encodeURIComponent(sigguNm)}`} className="seeall">
            {t("allLink")} →
          </Link>
        </div>
        {rows.length === 0 ? (
          <p style={{ color: "var(--cm-text-2)", fontSize: 14 }}>
            {pick4(locale, "데이터가 없습니다.", "No data available.", "データがありません。", "无数据。")}
          </p>
        ) : (
          <div className="cm-card-grid">
            {rows.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        )}
      </section>
    </>
  );
}
