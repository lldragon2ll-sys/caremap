import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllSlugs, getHospitalBySlug, getRelatedHospitals, getSameDongHospitals, getNearbySameSpecialty } from "@/lib/db";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { HospitalMap } from "@/components/HospitalMap";
import { HospitalCard } from "@/components/HospitalCard";
import { ViewTracker } from "@/components/ViewTracker";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { ConsultModal } from "@/components/ConsultModal";
import { TelLink } from "@/components/TelLink";
import { mapDeepLinks, sizeCategory } from "@/lib/hospital-util";
import { tKind, tSido, tSiggu, pick4 } from "@/lib/i18n-dict";
import { buildPageMeta } from "@/lib/seo";
import { generateDescription } from "@/lib/hospital-description";
import { romanizeYadm, romanizeAddr } from "@/lib/romanize";
import type { Hospital } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  if (process.env.BUILD_ALL_SLUGS !== "1") return [];
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  let h: Hospital | null = null;
  try {
    h = await getHospitalBySlug(decodeURIComponent(slug));
  } catch {}
  if (!h) {
    return {
      title: pick4(locale, "병원 정보 없음", "Clinic not found", "クリニック情報がありません", "未找到诊所信息"),
    };
  }
  const region = [tSido(h.sido_cd_nm ?? "", locale), tSiggu(h.sggu_cd_nm ?? "", locale)]
    .filter(Boolean).join(" ");
  const kind = tKind(h.cl_cd_nm ?? "", locale);
  const t = await getTranslations({ locale, namespace: "hospital" });
  const title = t("metaTitle", { name: h.yadm_nm });
  const desc = t("metaDescription", {
    name: h.yadm_nm,
    kind: kind || pick4(locale, "병원", "Clinic", "クリニック", "诊所"),
    region: region || "—",
    tel: h.tel_no ?? "-",
    drCount: h.dr_tot_cnt,
  });
  // 병원별 동적 OG 이미지 (locale prefix 포함)
  const ogPath = `${locale === "ko" ? "" : `/${locale}`}/hospital/${encodeURIComponent(h.slug)}/opengraph-image`;
  return buildPageMeta({
    locale,
    pathSegment: `/hospital/${encodeURIComponent(h.slug)}`,
    title,
    description: desc,
    ogImage: ogPath,
  });
}

function formatDate(s: string | null, locale: string): string | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return s;
  if (locale === "en") return `${m[1]}-${m[2]}-${m[3]}`;
  if (locale === "ja") return `${m[1]}年${m[2]}月${m[3]}日`;
  if (locale === "zh") return `${m[1]}年${m[2]}月${m[3]}日`;
  return `${m[1]}년 ${m[2]}월 ${m[3]}일`;
}

function buildHospitalLD(h: Hospital, siteUrl: string, locale: string): Record<string, unknown> {
  const prefix = locale === "ko" ? "" : `/${locale}`;
  const isDental = h.cl_cd_nm?.includes("치과");
  const isClinic = h.cl_cd_nm === "의원" || h.cl_cd_nm === "한의원";
  const type = isDental ? "Dentist" : isClinic ? "MedicalClinic" : "Hospital";
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${siteUrl}${prefix}/hospital/${encodeURIComponent(h.slug)}#hospital`,
    name: h.yadm_nm,
    url: `${siteUrl}${prefix}/hospital/${encodeURIComponent(h.slug)}`,
    image: `${siteUrl}${prefix}/hospital/${encodeURIComponent(h.slug)}/opengraph-image`,
    isAcceptingNewPatients: true,
  };
  if (h.tel_no) ld.telephone = h.tel_no;
  if (h.hosp_url) ld.sameAs = [h.hosp_url];
  if (h.addr || h.sido_cd_nm) {
    ld.address = {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: h.sido_cd_nm,
      addressLocality: h.sggu_cd_nm,
      streetAddress: h.addr,
      postalCode: h.post_no,
    };
  }
  if (h.y_pos != null && h.x_pos != null) {
    ld.geo = { "@type": "GeoCoordinates", latitude: h.y_pos, longitude: h.x_pos };
  }
  // 진료과 + 종별 → medicalSpecialty array
  const specialties: string[] = [];
  if (h.cl_cd_nm) specialties.push(h.cl_cd_nm);
  for (const s of ["성형외과", "피부과", "치과", "안과", "한의원", "정형외과", "산부인과", "소아청소년과", "내과", "이비인후과"]) {
    if (h.yadm_nm.includes(s)) specialties.push(s);
  }
  if (specialties.length > 0) ld.medicalSpecialty = [...new Set(specialties)];
  if (h.estb_dd && /^\d{4}/.test(h.estb_dd)) {
    ld.foundingDate = `${h.estb_dd.slice(0, 4)}-${h.estb_dd.slice(5, 7) || "01"}-${h.estb_dd.slice(8, 10) || "01"}`;
  }
  // 의료법 회피 — 사용자 리뷰는 수집하지 않으므로 aggregateRating 노출 X
  return ld;
}

function buildBreadcrumbLD(h: Hospital, siteUrl: string, locale: string): Record<string, unknown> {
  const prefix = locale === "ko" ? "" : `/${locale}`;
  const items: Array<Record<string, unknown>> = [
    { "@type": "ListItem", position: 1, name: pick4(locale, "홈", "Home", "ホーム", "首页"), item: `${siteUrl}${prefix}/` },
  ];
  let pos = 2;
  if (h.sido_cd_nm) {
    items.push({
      "@type": "ListItem", position: pos++,
      name: tSido(h.sido_cd_nm, locale),
      item: `${siteUrl}${prefix}/${encodeURIComponent(h.sido_cd_nm)}`,
    });
  }
  if (h.sido_cd_nm && h.sggu_cd_nm) {
    items.push({
      "@type": "ListItem", position: pos++,
      name: tSiggu(h.sggu_cd_nm, locale),
      item: `${siteUrl}${prefix}/${encodeURIComponent(h.sido_cd_nm)}/${encodeURIComponent(h.sggu_cd_nm)}`,
    });
  }
  items.push({ "@type": "ListItem", position: pos, name: h.yadm_nm });
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

function telDigits(tel: string | null): string | null {
  if (!tel) return null;
  return tel.replace(/[^\d+]/g, "") || null;
}

function staffSummary(h: Hospital, locale: string) {
  const labels = (() => {
    if (locale === "en") return {
      mdept_sdr_cnt: "Medical Specialist", mdept_gdr_cnt: "Medical General",
      mdept_intn_cnt: "Medical Intern",    mdept_resdnt_cnt: "Medical Resident",
      dety_sdr_cnt: "Dental Specialist",   dety_gdr_cnt: "Dental General",
      cmdc_sdr_cnt: "Korean Medicine Specialist", cmdc_gdr_cnt: "Korean Medicine General",
      pnurs_cnt: "Midwife",
    };
    if (locale === "ja") return {
      mdept_sdr_cnt: "医科 専門医", mdept_gdr_cnt: "医科 一般医",
      mdept_intn_cnt: "医科 インターン", mdept_resdnt_cnt: "医科 レジデント",
      dety_sdr_cnt: "歯科 専門医", dety_gdr_cnt: "歯科 一般医",
      cmdc_sdr_cnt: "韓医 専門医", cmdc_gdr_cnt: "韓医 一般医",
      pnurs_cnt: "助産師",
    };
    if (locale === "zh") return {
      mdept_sdr_cnt: "医科 专科医师", mdept_gdr_cnt: "医科 全科医师",
      mdept_intn_cnt: "医科 实习生", mdept_resdnt_cnt: "医科 住院医师",
      dety_sdr_cnt: "牙科 专科医师", dety_gdr_cnt: "牙科 全科医师",
      cmdc_sdr_cnt: "韩医 专科医师", cmdc_gdr_cnt: "韩医 全科医师",
      pnurs_cnt: "助产士",
    };
    return {
      mdept_sdr_cnt: "의과 전문의", mdept_gdr_cnt: "의과 일반의",
      mdept_intn_cnt: "의과 인턴",  mdept_resdnt_cnt: "의과 레지던트",
      dety_sdr_cnt: "치과 전문의",  dety_gdr_cnt: "치과 일반의",
      cmdc_sdr_cnt: "한방 전문의",  cmdc_gdr_cnt: "한방 일반의",
      pnurs_cnt: "조산사",
    };
  })();
  return ([
    ["mdept_sdr_cnt", h.mdept_sdr_cnt],
    ["mdept_gdr_cnt", h.mdept_gdr_cnt],
    ["mdept_intn_cnt", h.mdept_intn_cnt],
    ["mdept_resdnt_cnt", h.mdept_resdnt_cnt],
    ["dety_sdr_cnt", h.dety_sdr_cnt],
    ["dety_gdr_cnt", h.dety_gdr_cnt],
    ["cmdc_sdr_cnt", h.cmdc_sdr_cnt],
    ["cmdc_gdr_cnt", h.cmdc_gdr_cnt],
    ["pnurs_cnt", h.pnurs_cnt],
  ] as const)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, count, label: labels[key as keyof typeof labels] }));
}

export default async function HospitalPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hospital");
  const tNav = await getTranslations("nav");
  const decoded = decodeURIComponent(slug);
  let h: Hospital | null = null;
  try { h = await getHospitalBySlug(decoded); } catch {}
  if (!h) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const tel = telDigits(h.tel_no);
  const staff = staffSummary(h, locale);
  const size = sizeCategory(h);
  const sizeLabel = (() => {
    if (locale === "en") return size.tier === "대형" ? "Large" : size.tier === "중형" ? "Medium" : "Small";
    if (locale === "ja") return size.tier === "대형" ? "大規模" : size.tier === "중형" ? "中規模" : "小規模";
    if (locale === "zh") return size.tier === "대형" ? "大型" : size.tier === "중형" ? "中型" : "小型";
    return size.tier;
  })();
  const specialistTotal = (h.mdept_sdr_cnt ?? 0) + (h.dety_sdr_cnt ?? 0) + (h.cmdc_sdr_cnt ?? 0);
  const mapEmbed = h.y_pos != null && h.x_pos != null
    ? `https://www.google.com/maps?q=${h.y_pos},${h.x_pos}&z=16&output=embed`
    : null;
  const region = [
    tSido(h.sido_cd_nm ?? "", locale),
    tSiggu(h.sggu_cd_nm ?? "", locale),
    h.emdong_nm && locale !== "ko" ? romanizeAddr(h.emdong_nm) : h.emdong_nm,
  ].filter(Boolean).join(" ");
  const kindLabel = tKind(h.cl_cd_nm ?? "", locale) || pick4(locale, "병원", "Clinic", "クリニック", "诊所");
  const weekDaysRaw = t.raw("weekDays") as string[];
  const weekDaySuffix = t("weekDaySuffix");
  const links = mapDeepLinks(h);

  const introEst = h.estb_dd ? t("establishedOn", { date: formatDate(h.estb_dd, locale) ?? "" }) : "";

  // 자동 세부 설명 + 함께 알아본 병원 + 인근 병원 + 같은 동 다른 진료과
  const descSections = generateDescription(h, locale);
  const [related, nearby, sameDong] = await Promise.all([
    getRelatedHospitals(h, 4),
    getNearbySameSpecialty(h, 5, 1.5),
    getSameDongHospitals(h, 5),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHospitalLD(h, siteUrl, locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbLD(h, siteUrl, locale)) }}
      />

      {/* 클라이언트 마운트 시 조회수 +1 */}
      <ViewTracker hospitalId={h.id} />

      <div className="cm-detail">
        <div>
          <header className="head cm-detail-head-v2">
            <nav style={{ fontSize: 12.5, color: "var(--cm-text-2)", marginBottom: 14 }}>
              <Link href="/" style={{ color: "var(--cm-text-2)" }}>{tNav("home")}</Link>
              {h.sido_cd_nm && (
                <>
                  <span style={{ margin: "0 6px", color: "var(--cm-text-3)" }}>›</span>
                  <Link href={`/${encodeURIComponent(h.sido_cd_nm)}`} style={{ color: "var(--cm-text-2)" }}>
                    {tSido(h.sido_cd_nm, locale)}
                  </Link>
                </>
              )}
              {h.sido_cd_nm && h.sggu_cd_nm && (
                <>
                  <span style={{ margin: "0 6px", color: "var(--cm-text-3)" }}>›</span>
                  <Link
                    href={`/${encodeURIComponent(h.sido_cd_nm)}/${encodeURIComponent(h.sggu_cd_nm)}`}
                    style={{ color: "var(--cm-text-2)" }}
                  >
                    {tSiggu(h.sggu_cd_nm, locale)}
                  </Link>
                </>
              )}
            </nav>
            <div className="badges">
              <Badge kind="verified">{t("verified")}</Badge>
              {h.cl_cd_nm && <Badge kind="kind">{kindLabel}</Badge>}
              <Badge kind="new">{sizeLabel}</Badge>
            </div>
            <h1 style={{ margin: "12px 0 4px" }}><span className="kr">{h.yadm_nm}</span></h1>
            {locale !== "ko" && (
              <div style={{ fontSize: 14, color: "var(--cm-text-2)", fontWeight: 500, marginBottom: 8 }}>
                {romanizeYadm(h.yadm_nm)}
              </div>
            )}
            <div className="sub">{region} · {kindLabel}</div>

            <div className="stats">
              <div className="stat">
                <div className="num">{h.dr_tot_cnt.toLocaleString()}</div>
                <div className="lbl">{t("totalDoctors")}</div>
              </div>
              {specialistTotal > 0 && (
                <div className="stat">
                  <div className="num">{specialistTotal.toLocaleString()}</div>
                  <div className="lbl">{t("specialists")}</div>
                </div>
              )}
              {h.estb_dd && (
                <div className="stat">
                  <div className="num">{h.estb_dd.slice(0, 4)}</div>
                  <div className="lbl">{t("estYear")}</div>
                </div>
              )}
              <div className="stat">
                <div className="num">{h.post_no ?? "—"}</div>
                <div className="lbl">{t("postCode")}</div>
              </div>
            </div>
          </header>

          <div className="cm-tabs">
            <a href="#overview" className="active">{t("tabOverview")}</a>
            <a href="#staff">{t("tabStaff")}</a>
            <a href="#hours">{t("tabHours")}</a>
            <a href="#location">{t("tabLocation")}</a>
          </div>

          <section id="overview" className="cm-section-card">
            <h3>{t("overviewTitle")}</h3>
            {/* 자동 생성된 풍부한 섹션 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 4 }}>
              {descSections.map((s) => (
                <div key={s.title}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cm-text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {s.title}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--cm-text)", lineHeight: 1.6, margin: 0 }}>
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
              {h.cl_cd_nm && <span className="cm-chip">{kindLabel}</span>}
              {h.sggu_cd_nm && <span className="cm-chip">{tSiggu(h.sggu_cd_nm, locale)}</span>}
            </div>
          </section>

          {staff.length > 0 && (
            <section id="staff" className="cm-section-card">
              <h3>{t("staffTitle")} <span style={{ fontSize: 13, color: "var(--cm-text-2)", fontWeight: 500 }}>· {h.dr_tot_cnt}</span></h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {staff.map((s) => (
                  <div
                    key={s.key}
                    style={{ border: "1px solid var(--cm-line)", borderRadius: 10, padding: 12, background: "#fff" }}
                  >
                    <div style={{ fontSize: 12.5, color: "var(--cm-text-2)" }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {s.count}<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 4 }}>
                        {locale === "ko" ? "명" : locale === "ja" ? "名" : locale === "zh" ? "名" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "var(--cm-text-2)", marginTop: 12 }}>{t("staffNote")}</p>
            </section>
          )}

          <section id="hours" className="cm-section-card">
            <h3>{t("hoursTitle")}</h3>
            <div className="cm-hours">
              {weekDaysRaw.map((d) => (
                <div key={d} style={{ display: "contents" }}>
                  <span className="day">{d}{weekDaySuffix}</span>
                  <span className="h closed">{t("hoursPlaceholder")}</span>
                  <span />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--cm-text-2)", marginTop: 12 }}>{t("hoursNote")}</p>
          </section>

          <section id="location" className="cm-section-card">
            <h3>{t("locationTitle")}</h3>
            <p style={{ fontSize: 14, color: "var(--cm-text)", margin: "0 0 4px" }}>
              {h.addr ?? t("noAddress")}
            </p>
            {locale !== "ko" && h.addr && (
              <p style={{ fontSize: 13, color: "var(--cm-text-2)", margin: "0 0 12px" }}>
                {romanizeAddr(h.addr)}
              </p>
            )}
            {mapEmbed && (
              <iframe
                src={mapEmbed}
                style={{ width: "100%", height: 320, border: 0, borderRadius: 10 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${h.yadm_nm} location`}
              />
            )}
          </section>
        </div>

        <aside className="cm-side">
          <div className="cm-booking">
            <div className="status unknown">
              <span className="dot" />
              {t("statusUnknown")}
            </div>
            <h4>
              {pick4(locale, "지금 문의하기", "Contact now", "今すぐ問い合わせ", "立即咨询")}
            </h4>

            {/* 1차 CTA — 상담 신청 (전환 트래킹) */}
            <ConsultModal
              hospitalSlug={h.slug}
              hospitalName={h.yadm_nm}
              kindLabel={kindLabel}
              locale={locale}
              className="cta"
              triggerLabel={pick4(locale, "상담 신청", "Request Consultation", "相談を申し込む", "申请咨询")}
            />

            {/* 2차 CTA — 전화 */}
            {tel ? (
              <>
                <TelLink
                  tel={tel}
                  hospitalSlug={h.slug}
                  hospitalName={h.yadm_nm}
                  className="phone-display"
                >
                  {h.tel_no}
                </TelLink>
                <TelLink
                  tel={tel}
                  hospitalSlug={h.slug}
                  hospitalName={h.yadm_nm}
                  className="cta"
                  ariaLabel={`${h.yadm_nm} ${t("callButton")}`}
                >
                  <Icon name="phone" size={14} color="#fff" />
                  {t("callButton")}
                </TelLink>
                <p className="meta">{t("callMeta")}</p>
              </>
            ) : (
              <p className="meta" style={{ textAlign: "left" }}>{t("noTelephone")}</p>
            )}
          </div>

          <div className="cm-quickfacts">
            <h5>{t("quickFacts")}</h5>
            <div className="qrow"><span className="k">{t("kind")}</span><span className="v">{kindLabel || "—"}</span></div>
            <div className="qrow">
              <span className="k">{t("address")}</span>
              <span className="v">
                {h.addr ?? "—"}
                {locale !== "ko" && h.addr && (
                  <div style={{ fontSize: 12, color: "var(--cm-text-2)", fontWeight: 400, marginTop: 2 }}>
                    {romanizeAddr(h.addr)}
                  </div>
                )}
              </span>
            </div>
            <div className="qrow"><span className="k">{t("telephone")}</span><span className="v">{h.tel_no ?? "—"}</span></div>
            <div className="qrow">
              <span className="k">{t("website")}</span>
              <span className="v">
                {h.hosp_url ? (
                  <a href={h.hosp_url} target="_blank" rel="noopener noreferrer">
                    {new URL(h.hosp_url.startsWith("http") ? h.hosp_url : `http://${h.hosp_url}`).hostname}
                  </a>
                ) : "—"}
              </span>
            </div>
            <div className="qrow"><span className="k">{t("openedOn")}</span><span className="v">{formatDate(h.estb_dd, locale) ?? "—"}</span></div>
            <div className="qrow"><span className="k">{t("postCode")}</span><span className="v">{h.post_no ?? "—"}</span></div>
          </div>

          {h.y_pos != null && h.x_pos != null && (
            <div className="cm-mini-map" style={{ height: 200 }}>
              <HospitalMap
                pins={[{
                  id: h.id,
                  lat: h.y_pos,
                  lng: h.x_pos,
                  label: "📍",
                  popup: h.yadm_nm,
                }]}
                height={200}
                zoom={15}
              />
            </div>
          )}

          {links && (
            <div className="cm-quickfacts">
              <h5>{t("externalMaps")}</h5>
              <p style={{ fontSize: 12, color: "var(--cm-text-2)", margin: "0 0 10px", lineHeight: 1.5 }}>
                {t("externalMapsDesc")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <a href={links.kakao} target="_blank" rel="noopener noreferrer"
                  style={{
                    border: "1px solid var(--cm-line)", padding: "10px 12px",
                    borderRadius: 8, fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#FEE500", color: "#000", textDecoration: "none",
                  }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Icon name="pin" size={14} /> {t("directionsKakao")}
                  </span>
                  <Icon name="arrow-r" size={12} />
                </a>
                <a href={links.naver} target="_blank" rel="noopener noreferrer"
                  style={{
                    border: "1px solid var(--cm-line)", padding: "10px 12px",
                    borderRadius: 8, fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#03C75A", color: "#fff", textDecoration: "none",
                  }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Icon name="pin" size={14} color="#fff" /> {t("directionsNaver")}
                  </span>
                  <Icon name="arrow-r" size={12} color="#fff" />
                </a>
                <a href={links.google} target="_blank" rel="noopener noreferrer"
                  style={{
                    border: "1px solid var(--cm-line)", padding: "10px 12px",
                    borderRadius: 8, fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#fff", color: "var(--cm-ink)", textDecoration: "none",
                  }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Icon name="pin" size={14} /> {t("directionsGoogle")}
                  </span>
                  <Icon name="arrow-r" size={12} />
                </a>
              </div>
            </div>
          )}

          <div className="cm-side-actions">
            {links && (
              <a href={links.kakao} target="_blank" rel="noopener noreferrer" className="btn">
                <Icon name="pin" size={14} /><span>{t("actionDirections")}</span>
              </a>
            )}
            <SaveButton slug={h.slug} className="btn" label={t("actionSave")} labelSaved={t("actionSave")} />
            <ShareButton
              url={`${siteUrl}${locale === "ko" ? "" : `/${locale}`}/hospital/${encodeURIComponent(h.slug)}`}
              title={h.yadm_nm}
              text={kindLabel}
              className="btn"
              label={t("actionShare")}
            />
          </div>
        </aside>
      </div>

      {/* 함께 알아본 병원 */}
      {related.length > 0 && (
        <section className="cm-section surface" style={{ borderTop: "1px solid var(--cm-line)" }}>
          <div className="section-head">
            <div>
              <h2>
                {pick4(locale, "함께 알아본 병원", "Also explored", "一緒に見ているクリニック", "用户也在浏览")}
              </h2>
              <div className="sub">
                {pick4(locale,
                  `${tSiggu(h.sggu_cd_nm ?? "", locale)}의 다른 ${kindLabel}`,
                  `Other ${kindLabel} in ${tSiggu(h.sggu_cd_nm ?? "", locale)}`,
                  `${tSiggu(h.sggu_cd_nm ?? "", locale)}の他の${kindLabel}`,
                  `${tSiggu(h.sggu_cd_nm ?? "", locale)}的其他${kindLabel}`,
                )}
              </div>
            </div>
          </div>
          <div className="cm-card-grid">
            {related.map((r) => <HospitalCard key={r.id} h={r} />)}
          </div>
        </section>
      )}

      {/* 반경 ~1.5km 인근 동일 진료과 */}
      {nearby.length > 0 && (
        <section className="cm-section" style={{ borderTop: "1px solid var(--cm-line)" }}>
          <div className="section-head">
            <div>
              <h2>
                {pick4(locale,
                  "걸어서 갈만한 인근 병원",
                  "Within walking distance",
                  "徒歩圏内のクリニック",
                  "步行可达诊所",
                )}
              </h2>
              <div className="sub">
                {pick4(locale,
                  `현재 병원에서 반경 ${nearby[0]?.distance ? "~" : "~1.5"}km 이내 같은 진료과`,
                  `Within ~1.5km of this clinic, same specialty`,
                  `現在のクリニックから半径~1.5km以内・同じ診療科`,
                  `本院半径~1.5km内·同科室`,
                )}
              </div>
            </div>
          </div>
          <div className="cm-card-grid">
            {nearby.map((r) => (
              <div key={r.id} style={{ position: "relative" }}>
                <HospitalCard h={r} />
                <span style={{
                  position: "absolute", top: 12, right: 12, zIndex: 2,
                  fontSize: 11, fontWeight: 700,
                  background: "var(--cm-primary)", color: "#fff",
                  padding: "3px 9px", borderRadius: 999,
                  pointerEvents: "none",
                }}>
                  {r.distance < 1 ? `${(r.distance * 1000).toFixed(0)}m` : `${r.distance.toFixed(1)}km`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 같은 동(洞) 다른 진료과 */}
      {sameDong.length > 0 && (
        <section className="cm-section surface" style={{ borderTop: "1px solid var(--cm-line)" }}>
          <div className="section-head">
            <div>
              <h2>
                {pick4(locale,
                  `${h.emdong_nm ?? tSiggu(h.sggu_cd_nm ?? "", locale)} 다른 진료과`,
                  `Other specialties in ${h.emdong_nm ?? tSiggu(h.sggu_cd_nm ?? "", locale)}`,
                  `${h.emdong_nm ?? tSiggu(h.sggu_cd_nm ?? "", locale)}の他診療科`,
                  `${h.emdong_nm ?? tSiggu(h.sggu_cd_nm ?? "", locale)}的其他科室`,
                )}
              </h2>
              <div className="sub">
                {pick4(locale,
                  "함께 방문 가능한 인근 다른 진료과 클리닉",
                  "Nearby clinics in different specialties you may need",
                  "近隣の他の診療科クリニック",
                  "附近其他科室诊所",
                )}
              </div>
            </div>
          </div>
          <div className="cm-card-grid">
            {sameDong.map((r) => <HospitalCard key={r.id} h={r} />)}
          </div>
        </section>
      )}

      {/* 모바일 sticky 액션바 (mobile-only via CSS) */}
      <div className="cm-sticky-actions" role="toolbar" aria-label={t("callNow")}>
        <ConsultModal
          hospitalSlug={h.slug}
          hospitalName={h.yadm_nm}
          kindLabel={kindLabel}
          locale={locale}
          className="cm-sticky-actions__btn primary"
          triggerLabel={pick4(locale, "상담", "Inquire", "相談", "咨询")}
        />
        {tel && (
          <TelLink tel={tel} hospitalSlug={h.slug} hospitalName={h.yadm_nm} className="cm-sticky-actions__btn">
            <Icon name="phone" size={16} color="var(--cm-ink)" />
            <span>{t("callButton")}</span>
          </TelLink>
        )}
        {links && (
          <a href={links.kakao} target="_blank" rel="noopener noreferrer" className="cm-sticky-actions__btn">
            <Icon name="pin" size={16} color="var(--cm-ink)" />
            <span>{t("actionDirections")}</span>
          </a>
        )}
        <SaveButton slug={h.slug} className="cm-sticky-actions__btn icon" label="" labelSaved="" />
        <ShareButton
          url={`${siteUrl}${locale === "ko" ? "" : `/${locale}`}/hospital/${encodeURIComponent(h.slug)}`}
          title={h.yadm_nm}
          text={kindLabel}
          className="cm-sticky-actions__btn icon"
          label=""
        />
      </div>
    </>
  );
}
