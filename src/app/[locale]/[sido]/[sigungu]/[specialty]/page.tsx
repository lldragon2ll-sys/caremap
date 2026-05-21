import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHospitalsBySpecialty } from "@/lib/db";
import { HospitalCard } from "@/components/HospitalCard";
import { tSido, tSiggu, tSpecialty } from "@/lib/i18n-dict";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; sido: string; sigungu: string; specialty: string }>;

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

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, sido, sigungu, specialty } = await params;
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);
  const sp = decodeURIComponent(specialty);
  const sidoD = tSido(sidoNm, locale);
  const sigguD = tSiggu(sigguNm, locale);
  const spD = tSpecialty(sp, locale);
  return {
    title: locale === "en"
      ? `${spD} Clinics in ${sigguD} — Hours, Location & Phone`
      : `${sidoNm} ${sigguNm} ${sp} 추천 병원 - 진료시간·위치`,
    description: locale === "en"
      ? `Find ${spD} clinics in ${sidoD} ${sigguD}. Check location, phone and operating hours.`
      : `${sidoNm} ${sigguNm}의 ${sp} 진료 가능 병원/의원 목록. 위치, 전화번호, 진료시간을 확인하세요.`,
    alternates: {
      canonical: locale === "ko"
        ? `/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}/${encodeURIComponent(sp)}`
        : `/${locale}/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}/${encodeURIComponent(sp)}`,
    },
  };
}

function buildFaqKo(sido: string, sggu: string, sp: string) {
  return [
    { q: `${sggu} ${sp}는 몇 곳이 있나요?`,
      a: `${sido} ${sggu}에 등록된 ${sp} 관련 의료기관은 본 페이지의 목록에서 확인할 수 있습니다. 데이터는 건강보험심사평가원(HIRA) 공공데이터를 기반으로 합니다.` },
    { q: `진료시간은 어떻게 확인하나요?`,
      a: `각 병원의 상세 페이지에서 전화번호를 확인하거나 직접 방문하여 진료시간을 문의해주세요.` },
    { q: `예약은 어떻게 하나요?`,
      a: `현재 본 사이트는 진료 예약 기능을 제공하지 않습니다. 병원 상세 페이지의 전화번호로 직접 문의해주세요.` },
    { q: `데이터는 얼마나 자주 업데이트되나요?`,
      a: `HIRA에서 공개하는 데이터를 정기적으로 수집하여 갱신합니다. 실제 방문 전 전화로 확인을 권장합니다.` },
    { q: `${sp} 진료 가능한 병원을 어떻게 고르나요?`,
      a: `의사 수, 종별(상급종합/종합/병원/의원), 위치 접근성을 종합적으로 고려하세요. 본 페이지는 의사 수 기준 정렬되어 있습니다.` },
  ];
}

function buildFaqEn(sido: string, sggu: string, sp: string) {
  return [
    { q: `How many ${sp} clinics are in ${sggu}?`,
      a: `Registered ${sp} clinics in ${sido} ${sggu} are listed on this page. All data is based on Korea's HIRA public data.` },
    { q: `How can I check operating hours?`,
      a: `Check the phone number on each clinic's detail page and contact the clinic directly. Operating hours will be available after the HIRA detailed information service is enabled.` },
    { q: `Can I book an appointment online?`,
      a: `Online booking is not available on this site. Please call the clinic directly using the phone number on the detail page.` },
    { q: `How often is the data updated?`,
      a: `Data from HIRA is collected and refreshed periodically. We recommend calling the clinic before visiting in person.` },
    { q: `How do I choose a ${sp} clinic?`,
      a: `Consider the number of doctors, hospital tier (clinic/hospital/general/tertiary) and location. This page is sorted by number of doctors.` },
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

function buildBreadcrumbLD(
  locale: string, sido: string, sggu: string, sp: string, siteUrl: string,
) {
  const prefix = locale === "ko" ? "" : `/${locale}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "홈", item: `${siteUrl}${prefix}/` },
      { "@type": "ListItem", position: 2, name: tSido(sido, locale), item: `${siteUrl}${prefix}/${encodeURIComponent(sido)}` },
      { "@type": "ListItem", position: 3, name: tSiggu(sggu, locale),
        item: `${siteUrl}${prefix}/${encodeURIComponent(sido)}/${encodeURIComponent(sggu)}` },
      { "@type": "ListItem", position: 4, name: tSpecialty(sp, locale) },
    ],
  };
}

export default async function SpecialtyPage({ params }: { params: Params }) {
  const { locale, sido, sigungu, specialty } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("category");
  const tNav = await getTranslations("nav");
  const sidoNm = decodeURIComponent(sido);
  const sigguNm = decodeURIComponent(sigungu);
  const sp = decodeURIComponent(specialty);
  const sidoD = tSido(sidoNm, locale);
  const sigguD = tSiggu(sigguNm, locale);
  const spD = tSpecialty(sp, locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  let rows: Awaited<ReturnType<typeof getHospitalsBySpecialty>>["rows"] = [];
  let total = 0;
  try {
    const res = await getHospitalsBySpecialty(sidoNm, sigguNm, sp, 12, 0);
    rows = res.rows;
    total = res.total;
  } catch {}

  const faq = locale === "en"
    ? buildFaqEn(sidoD, sigguD, spD)
    : buildFaqKo(sidoNm, sigguNm, sp);
  const nearby = NEARBY_SPECIALTIES[sp] ?? ["내과", "가정의학과", "소아청소년과", "치과"];
  const pillsEn = [spD, "Specialist Care", "Parking", "Evening", "Weekend", "Walk-ins OK", "Preventive Care", "Health Checkup"];
  const pillsKo = [sp, "전문의 진료", "주차 가능", "야간 진료", "주말 진료", "초진 가능", "예방 진료", "건강검진"];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqLD(faq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbLD(locale, sidoNm, sigguNm, sp, siteUrl)) }}
      />

      <section className="cm-cat-hero">
        <nav className="crumbs">
          <Link href="/">{tNav("home")}</Link>
          <span className="sep">›</span>
          <Link href={`/${encodeURIComponent(sidoNm)}`}>{sidoD}</Link>
          <span className="sep">›</span>
          <Link href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}`}>{sigguD}</Link>
          <span className="sep">›</span>
          <span style={{ color: "var(--cm-ink)", fontWeight: 600 }}>{spD}</span>
        </nav>
        <h1>
          <span className="kr">{t("h1", { sggu: sigguD, specialty: spD })}</span>
        </h1>
        <p className="intro">
          {t.rich("intro", {
            sido: sidoD,
            sggu: sigguD,
            count: total,
            specialty: spD,
            b: (chunks) => <b>{chunks}</b>,
          })}
        </p>
        <div className="pill-row">
          {(locale === "en" ? pillsEn : pillsKo).map((p) => (
            <span key={p} className="cm-chip">{p}</span>
          ))}
        </div>
        <div className="stat-row">
          <span>{t("statHospitals", { count: total.toLocaleString() })}</span>
          <span>{t("statVerified")}</span>
          <span>{t("statPublic")}</span>
        </div>
      </section>

      <section className="cm-section">
        <div className="section-head">
          <div>
            <h2>{t("listTitle", { sggu: sigguD, specialty: spD })}</h2>
            <div className="sub">{t("listSub")}</div>
          </div>
          <Link
            href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}`}
            className="seeall"
          >
            {t("listLink", { sggu: sigguD })} →
          </Link>
        </div>
        {rows.length === 0 ? (
          <p style={{ color: "var(--cm-text-2)", fontSize: 14 }}>{t("noResults")}</p>
        ) : (
          <div className="cm-card-grid">
            {rows.map((h) => <HospitalCard key={h.id} h={h} />)}
          </div>
        )}
      </section>

      <section className="cm-section surface">
        <div className="section-head">
          <div>
            <h2>{t("faqTitle")}</h2>
            <div className="sub">{t("faqSub", { specialty: spD })}</div>
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
            <h2>{t("nearbyTitle")}</h2>
            <div className="sub">{t("nearbySub", { sggu: sigguD })}</div>
          </div>
        </div>
        <div className="cm-xlink-grid">
          {nearby.map((n) => (
            <Link
              key={n}
              href={`/${encodeURIComponent(sidoNm)}/${encodeURIComponent(sigguNm)}/${encodeURIComponent(n)}`}
              className="cm-xlink"
            >
              <span>{sigguD} {tSpecialty(n, locale)}</span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
