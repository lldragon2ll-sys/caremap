import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSidoList, getSigguList, getHospitalsByRegion } from "@/lib/db";
import { HospitalCard } from "@/components/HospitalCard";
import { tSido, tSiggu, pick4 } from "@/lib/i18n-dict";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; sido: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, sido } = await params;
  const decoded = decodeURIComponent(sido);
  const sidoDisplay = tSido(decoded, locale);
  return {
    title: pick4(locale,
      `${decoded} 병원 찾기 - 진료과·시군구별 검색`,
      `Clinics in ${sidoDisplay} — Search by District & Specialty`,
      `${sidoDisplay}のクリニック — 区・診療科別検索`,
      `${sidoDisplay}诊所 — 按区·科室搜索`,
    ),
    description: pick4(locale,
      `${decoded} 지역의 병원/의원/한의원/치과 등을 시군구별로 검색하세요.`,
      `Find clinics, dentists, Korean medicine and hospitals in ${sidoDisplay} by district.`,
      `${sidoDisplay}地域のクリニック・歯科・韓医院を区別に検索。`,
      `按区搜索${sidoDisplay}的诊所、牙科、韩医院。`,
    ),
    alternates: {
      canonical: locale === "ko"
        ? `/${encodeURIComponent(decoded)}`
        : `/${locale}/${encodeURIComponent(decoded)}`,
    },
  };
}

export default async function SidoPage({ params }: { params: Params }) {
  const { locale, sido } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("region");
  const tNav = await getTranslations("nav");
  const decoded = decodeURIComponent(sido);
  const sidoDisplay = tSido(decoded, locale);

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
          <Link href="/">{tNav("home")}</Link>
          <span className="sep">›</span>
          <span style={{ color: "var(--cm-ink)", fontWeight: 600 }}>{sidoDisplay}</span>
        </nav>
        <h1>
          <span className="kr">{t("h1", { sido: sidoDisplay })}</span>
        </h1>
        <p className="intro">
          {t.rich("intro", {
            sido: sidoDisplay,
            count: total,
            b: (chunks) => <b>{chunks}</b>,
          })}
        </p>
        <div className="stat-row">
          <span><b>{total.toLocaleString()}</b> {pick4(locale, "개 병원", "clinics", "件", "家")}</span>
          <span><b>{sigguList.length}</b> {pick4(locale, "개 시·군·구", "districts", "区", "区")}</span>
        </div>
      </section>

      {sigguList.length > 0 && (
        <section className="cm-section">
          <div className="section-head">
            <div>
              <h2>{t("sigguTitle")}</h2>
              <div className="sub">{t("sigguSub")}</div>
            </div>
          </div>
          <div className="cm-xlink-grid">
            {sigguList.map((s) => (
              <Link
                key={s.name}
                href={`/${encodeURIComponent(decoded)}/${encodeURIComponent(s.name)}`}
                className="cm-xlink"
              >
                <span>{tSiggu(s.name, locale)}</span>
                <span className="arrow">{s.count.toLocaleString()} →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {topHospitals.length > 0 && (
        <section className="cm-section surface">
          <div className="section-head">
            <div>
              <h2>{t("topTitle", { sido: sidoDisplay })}</h2>
              <div className="sub">{t("topSub")}</div>
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
