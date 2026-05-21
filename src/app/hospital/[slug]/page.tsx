import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getHospitalBySlug } from "@/lib/db";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { HospitalLogo } from "@/components/HospitalLogo";
import { mapDeepLinks, sizeCategory } from "@/lib/hospital-util";
import type { Hospital } from "@/lib/types";

export const dynamicParams = true;
export const revalidate = 86400;

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

type Params = Promise<{ slug: string }>;

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
  const { slug } = await params;
  let h: Hospital | null = null;
  try {
    h = await getHospitalBySlug(decodeURIComponent(slug));
  } catch {}
  if (!h) return { title: "병원 정보 없음" };
  const region = [h.sido_cd_nm, h.sggu_cd_nm].filter(Boolean).join(" ");
  const desc = `${h.yadm_nm} (${h.cl_cd_nm ?? ""}) — ${region} 위치, 전화 ${h.tel_no ?? "-"}, 의사 ${h.dr_tot_cnt}명. 진료시간·위치·전화번호 정보.`;
  return {
    title: `${h.yadm_nm} - 진료시간, 위치, 전화번호`,
    description: desc,
    alternates: { canonical: `/hospital/${encodeURIComponent(h.slug)}` },
    openGraph: {
      title: `${h.yadm_nm} | ${SITE_NAME}`,
      description: desc,
      type: "website",
    },
  };
}

function formatDate(s: string | null): string | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return m ? `${m[1]}년 ${m[2]}월 ${m[3]}일` : s;
}

function buildHospitalLD(h: Hospital, siteUrl: string): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": h.cl_cd_nm?.includes("치과") ? "Dentist" : "Hospital",
    name: h.yadm_nm,
    url: `${siteUrl}/hospital/${encodeURIComponent(h.slug)}`,
  };
  if (h.tel_no) ld.telephone = h.tel_no;
  if (h.hosp_url) ld.sameAs = h.hosp_url;
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
    ld.geo = {
      "@type": "GeoCoordinates",
      latitude: h.y_pos,
      longitude: h.x_pos,
    };
  }
  if (h.cl_cd_nm) ld.medicalSpecialty = h.cl_cd_nm;
  return ld;
}

function buildBreadcrumbLD(h: Hospital, siteUrl: string): Record<string, unknown> {
  const items: Array<Record<string, unknown>> = [
    { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
  ];
  let pos = 2;
  if (h.sido_cd_nm) {
    items.push({ "@type": "ListItem", position: pos++, name: h.sido_cd_nm, item: `${siteUrl}/${encodeURIComponent(h.sido_cd_nm)}` });
  }
  if (h.sido_cd_nm && h.sggu_cd_nm) {
    items.push({
      "@type": "ListItem", position: pos++, name: h.sggu_cd_nm,
      item: `${siteUrl}/${encodeURIComponent(h.sido_cd_nm)}/${encodeURIComponent(h.sggu_cd_nm)}`,
    });
  }
  items.push({ "@type": "ListItem", position: pos, name: h.yadm_nm });
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

function telDigits(tel: string | null): string | null {
  if (!tel) return null;
  return tel.replace(/[^\d+]/g, "") || null;
}

function staffSummary(h: Hospital) {
  return [
    { key: "mdept_sdr_cnt", count: h.mdept_sdr_cnt, label: "의과 전문의" },
    { key: "mdept_gdr_cnt", count: h.mdept_gdr_cnt, label: "의과 일반의" },
    { key: "mdept_intn_cnt", count: h.mdept_intn_cnt, label: "의과 인턴" },
    { key: "mdept_resdnt_cnt", count: h.mdept_resdnt_cnt, label: "의과 레지던트" },
    { key: "dety_sdr_cnt", count: h.dety_sdr_cnt, label: "치과 전문의" },
    { key: "dety_gdr_cnt", count: h.dety_gdr_cnt, label: "치과 일반의" },
    { key: "cmdc_sdr_cnt", count: h.cmdc_sdr_cnt, label: "한방 전문의" },
    { key: "cmdc_gdr_cnt", count: h.cmdc_gdr_cnt, label: "한방 일반의" },
    { key: "pnurs_cnt", count: h.pnurs_cnt, label: "조산사" },
  ].filter((x) => x.count > 0);
}

export default async function HospitalPage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  let h: Hospital | null = null;
  try { h = await getHospitalBySlug(decoded); } catch {}
  if (!h) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const tel = telDigits(h.tel_no);
  const staff = staffSummary(h);
  const specialistTotal = (h.mdept_sdr_cnt ?? 0) + (h.dety_sdr_cnt ?? 0) + (h.cmdc_sdr_cnt ?? 0);
  const mapEmbed = h.y_pos != null && h.x_pos != null
    ? `https://www.google.com/maps?q=${h.y_pos},${h.x_pos}&z=16&output=embed`
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHospitalLD(h, siteUrl)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbLD(h, siteUrl)) }}
      />

      <div className="cm-detail">
        {/* Left main */}
        <div>
          {/* Hero image placeholder */}
          <div className="hero-img">
            <span className="placeholder-tag">clinic exterior · 16:9 photo</span>
          </div>

          {/* Head */}
          <header className="head">
            <nav style={{ fontSize: 12.5, color: "var(--cm-text-2)" }}>
              <Link href="/" style={{ color: "var(--cm-text-2)" }}>홈</Link>
              {h.sido_cd_nm && (
                <>
                  <span style={{ margin: "0 6px", color: "var(--cm-text-3)" }}>›</span>
                  <Link href={`/${encodeURIComponent(h.sido_cd_nm)}`} style={{ color: "var(--cm-text-2)" }}>
                    {h.sido_cd_nm}
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
                    {h.sggu_cd_nm}
                  </Link>
                </>
              )}
            </nav>
            <div className="badges">
              <Badge kind="verified">HIRA 인증 의료기관</Badge>
              {h.cl_cd_nm && <Badge kind="kind">{h.cl_cd_nm}</Badge>}
              <Badge kind="new">{sizeCategory(h).tier}</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "8px 0" }}>
              <HospitalLogo h={h} size={56} />
              <h1 style={{ margin: 0 }}><span className="kr">{h.yadm_nm}</span></h1>
            </div>
            <div className="sub">
              {[h.sido_cd_nm, h.sggu_cd_nm, h.emdong_nm].filter(Boolean).join(" ")} · {h.cl_cd_nm ?? "병원"}
            </div>

            <div className="stats">
              <div className="stat">
                <div className="num">{h.dr_tot_cnt.toLocaleString("ko-KR")}</div>
                <div className="lbl">총 의사 수</div>
              </div>
              {specialistTotal > 0 && (
                <div className="stat">
                  <div className="num">{specialistTotal.toLocaleString("ko-KR")}</div>
                  <div className="lbl">전문의</div>
                </div>
              )}
              {h.estb_dd && (
                <div className="stat">
                  <div className="num">{h.estb_dd.slice(0, 4)}</div>
                  <div className="lbl">개설 연도</div>
                </div>
              )}
              <div className="stat">
                <div className="num">{h.post_no ?? "—"}</div>
                <div className="lbl">우편번호</div>
              </div>
            </div>
          </header>

          {/* Tabs (anchor links) */}
          <div className="cm-tabs">
            <a href="#overview" className="active">개요</a>
            <a href="#staff">의료진</a>
            <a href="#hours">진료시간</a>
            <a href="#location">오시는 길</a>
          </div>

          {/* 개요 */}
          <section id="overview" className="cm-section-card">
            <h3>병원 소개</h3>
            <p style={{ fontSize: 14, color: "var(--cm-text)", lineHeight: 1.6, margin: 0 }}>
              {h.yadm_nm}은(는) {[h.sido_cd_nm, h.sggu_cd_nm, h.emdong_nm].filter(Boolean).join(" ")}에 위치한 {h.cl_cd_nm ?? "병원"}입니다.
              {h.estb_dd && ` ${formatDate(h.estb_dd)}에 개설되어 운영 중`}이며 총 {h.dr_tot_cnt}명의 의료진이 근무하고 있습니다.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              {h.cl_cd_nm && <span className="cm-chip">{h.cl_cd_nm}</span>}
              {h.sggu_cd_nm && <span className="cm-chip">{h.sggu_cd_nm}</span>}
              {h.mdept_sdr_cnt > 0 && <span className="cm-chip">의과 전문의 {h.mdept_sdr_cnt}명</span>}
              {h.dety_sdr_cnt > 0 && <span className="cm-chip">치과 전문의 {h.dety_sdr_cnt}명</span>}
              {h.cmdc_sdr_cnt > 0 && <span className="cm-chip">한방 전문의 {h.cmdc_sdr_cnt}명</span>}
            </div>
          </section>

          {/* 의료진 — 우리는 집계 데이터만 있으므로 표 형태로 표시 */}
          {staff.length > 0 && (
            <section id="staff" className="cm-section-card">
              <h3>의료진 구성 <span style={{ fontSize: 13, color: "var(--cm-text-2)", fontWeight: 500 }}>· 총 {h.dr_tot_cnt}명</span></h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {staff.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      border: "1px solid var(--cm-line)", borderRadius: 10,
                      padding: 12, background: "#fff",
                    }}
                  >
                    <div style={{ fontSize: 12.5, color: "var(--cm-text-2)" }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {s.count}<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 4 }}>명</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "var(--cm-text-2)", marginTop: 12 }}>
                * 개별 의료진 프로필은 HIRA 데이터에 포함되지 않습니다.
              </p>
            </section>
          )}

          {/* 진료시간 — 데이터 부재 */}
          <section id="hours" className="cm-section-card">
            <h3>진료시간</h3>
            <div className="cm-hours">
              {["월","화","수","목","금","토","일"].map((d) => (
                <div key={d} style={{ display: "contents" }}>
                  <span className="day">{d}요일</span>
                  <span className="h closed">정보 준비중</span>
                  <span />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--cm-text-2)", marginTop: 12 }}>
              * 진료시간 정보는 HIRA &quot;의료기관별상세정보서비스&quot; 활성화 후 제공됩니다. 정확한 시간은 병원에 직접 문의해주세요.
            </p>
          </section>

          {/* 오시는 길 */}
          <section id="location" className="cm-section-card">
            <h3>오시는 길</h3>
            <p style={{ fontSize: 14, color: "var(--cm-text)", margin: "0 0 12px" }}>
              {h.addr ?? "주소 정보 없음"}
            </p>
            {mapEmbed && (
              <iframe
                src={mapEmbed}
                className="w-full"
                style={{ width: "100%", height: 320, border: 0, borderRadius: 10 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${h.yadm_nm} 위치`}
              />
            )}
          </section>
        </div>

        {/* Right: sticky aside */}
        <aside className="cm-side">
          <div className="cm-booking">
            <div className="status unknown">
              <span className="dot" />
              진료시간 정보 준비중
            </div>
            <h4>지금 바로 전화하기</h4>
            {tel ? (
              <>
                <a href={`tel:${tel}`} className="phone-display">{h.tel_no}</a>
                <a href={`tel:${tel}`} className="cta">
                  <Icon name="phone" size={14} color="#fff" />
                  전화 걸기
                </a>
                <p className="meta">병원에 직접 진료 가능 여부를 확인해주세요.</p>
              </>
            ) : (
              <p className="meta" style={{ textAlign: "left" }}>등록된 전화번호가 없습니다.</p>
            )}
          </div>

          <div className="cm-quickfacts">
            <h5>한눈에 보기</h5>
            <div className="qrow"><span className="k">종별</span><span className="v">{h.cl_cd_nm ?? "—"}</span></div>
            <div className="qrow"><span className="k">주소</span><span className="v">{h.addr ?? "—"}</span></div>
            <div className="qrow"><span className="k">전화</span><span className="v">{h.tel_no ?? "—"}</span></div>
            <div className="qrow">
              <span className="k">홈페이지</span>
              <span className="v">
                {h.hosp_url ? (
                  <a href={h.hosp_url} target="_blank" rel="noopener noreferrer">{new URL(h.hosp_url.startsWith("http") ? h.hosp_url : `http://${h.hosp_url}`).hostname}</a>
                ) : "—"}
              </span>
            </div>
            <div className="qrow"><span className="k">개설일</span><span className="v">{formatDate(h.estb_dd) ?? "—"}</span></div>
            <div className="qrow"><span className="k">우편번호</span><span className="v">{h.post_no ?? "—"}</span></div>
          </div>

          {h.y_pos != null && h.x_pos != null && (
            <div className="cm-mini-map">
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.18) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
                backgroundColor: "#eaf3fa",
              }} />
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -100%)",
                background: "var(--cm-primary)", color: "#fff",
                borderRadius: "999px 999px 999px 4px",
                padding: "6px 12px", fontSize: 12, fontWeight: 700,
                border: "2px solid #fff",
              }}>
                {h.yadm_nm}
              </div>
            </div>
          )}

          {(() => {
            const links = mapDeepLinks(h);
            if (!links) {
              return (
                <div className="cm-side-actions">
                  <button className="btn" type="button"><Icon name="heart" size={14} /><span>저장</span></button>
                  <button className="btn" type="button"><Icon name="share" size={14} /><span>공유</span></button>
                </div>
              );
            }
            return (
              <>
                <div className="cm-quickfacts">
                  <h5>외부 지도에서 확인</h5>
                  <p style={{ fontSize: 12, color: "var(--cm-text-2)", margin: "0 0 10px", lineHeight: 1.5 }}>
                    별점·리뷰는 아래 지도 서비스에서 확인하세요. 합법적 외부 링크 방식으로 제공합니다.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <a
                      href={links.kakao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        border: "1px solid var(--cm-line)",
                        padding: "10px 12px", borderRadius: 8,
                        fontSize: 13, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#FEE500", color: "#000",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Icon name="pin" size={14} />
                        카카오맵에서 보기
                      </span>
                      <Icon name="arrow-r" size={12} />
                    </a>
                    <a
                      href={links.naver}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        border: "1px solid var(--cm-line)",
                        padding: "10px 12px", borderRadius: 8,
                        fontSize: 13, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#03C75A", color: "#fff",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Icon name="pin" size={14} color="#fff" />
                        네이버지도에서 보기
                      </span>
                      <Icon name="arrow-r" size={12} color="#fff" />
                    </a>
                    <a
                      href={links.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        border: "1px solid var(--cm-line)",
                        padding: "10px 12px", borderRadius: 8,
                        fontSize: 13, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#fff", color: "var(--cm-ink)",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Icon name="pin" size={14} />
                        Google Maps
                      </span>
                      <Icon name="arrow-r" size={12} />
                    </a>
                  </div>
                </div>

                <div className="cm-side-actions">
                  <a href={links.kakao} target="_blank" rel="noopener noreferrer" className="btn">
                    <Icon name="pin" size={14} />
                    <span>길찾기</span>
                  </a>
                  <button className="btn" type="button"><Icon name="heart" size={14} /><span>저장</span></button>
                  <button className="btn" type="button"><Icon name="share" size={14} /><span>공유</span></button>
                </div>
              </>
            );
          })()}
        </aside>
      </div>
    </>
  );
}
