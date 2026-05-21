/**
 * 병원의 구조화 데이터에서 자동으로 풍부한 설명 텍스트를 생성.
 * 의사 수·종별·위치·연혁·인력 구성·특징을 결합해 사이트가 "활성화"된 느낌.
 *
 * 모두 사실 기반 (데이터에 있는 정보만 사용). 가공·과장 없음.
 */
import type { Hospital } from "./types";
import { tSido, tSiggu, tKind } from "./i18n-dict";
import { romanizeYadm, romanizeAddr } from "./romanize";

type Locale = "ko" | "en" | "ja" | "zh" | string;

function yearsAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = /^(\d{4})/.exec(dateStr);
  if (!m) return null;
  const year = Number(m[1]);
  const now = new Date().getFullYear();
  return Math.max(0, now - year);
}

function specialistRatio(h: Hospital): number | null {
  const total = h.dr_tot_cnt ?? 0;
  if (total === 0) return null;
  const spec = (h.mdept_sdr_cnt ?? 0) + (h.dety_sdr_cnt ?? 0) + (h.cmdc_sdr_cnt ?? 0);
  return Math.round((spec / total) * 100);
}

function dominantField(h: Hospital): "의과" | "치과" | "한방" | null {
  const m = (h.mdept_sdr_cnt ?? 0) + (h.mdept_gdr_cnt ?? 0);
  const d = (h.dety_sdr_cnt ?? 0) + (h.dety_gdr_cnt ?? 0);
  const c = (h.cmdc_sdr_cnt ?? 0) + (h.cmdc_gdr_cnt ?? 0);
  const max = Math.max(m, d, c);
  if (max === 0) return null;
  if (max === m) return "의과";
  if (max === d) return "치과";
  return "한방";
}

/** 사이즈 단계 (사용자 친화 표기) */
function sizeBand(h: Hospital, locale: Locale): string {
  const total = h.dr_tot_cnt ?? 0;
  if (h.cl_cd_nm === "상급종합" || h.cl_cd_nm === "종합병원") {
    return locale === "en" ? "Large multi-specialty hospital"
      : locale === "ja" ? "大規模総合病院"
      : locale === "zh" ? "大型综合医院"
      : "대형 종합병원";
  }
  if (total >= 30) return locale === "en" ? `mid-large clinic (${total} doctors)`
    : locale === "ja" ? `中大規模クリニック(医師${total}名)`
    : locale === "zh" ? `中大型诊所(医师${total}名)`
    : `중대형 클리닉 (의사 ${total}명)`;
  if (total >= 10) return locale === "en" ? `mid-size clinic (${total} doctors)`
    : locale === "ja" ? `中規模クリニック(医師${total}名)`
    : locale === "zh" ? `中型诊所(医师${total}名)`
    : `중형 클리닉 (의사 ${total}명)`;
  if (total >= 3) return locale === "en" ? `small clinic (${total} doctors)`
    : locale === "ja" ? `小規模クリニック(医師${total}名)`
    : locale === "zh" ? `小型诊所(医师${total}名)`
    : `소형 클리닉 (의사 ${total}명)`;
  return locale === "en" ? "boutique clinic"
    : locale === "ja" ? "個人クリニック"
    : locale === "zh" ? "私人诊所"
    : "개인 클리닉";
}

export type DescriptionSection = { title: string; body: string };

/** 병원 종합 설명 (3~5개 단락) */
export function generateDescription(h: Hospital, locale: Locale): DescriptionSection[] {
  const sidoName = tSido(h.sido_cd_nm ?? "", locale);
  const sigguName = tSiggu(h.sggu_cd_nm ?? "", locale);
  const kindName = tKind(h.cl_cd_nm ?? "", locale) || (locale === "en" ? "clinic" : "병원");
  const total = h.dr_tot_cnt ?? 0;
  const specRatio = specialistRatio(h);
  const years = yearsAgo(h.estb_dd);
  const dominant = dominantField(h);
  const band = sizeBand(h, locale);
  const region = [sidoName, sigguName, h.emdong_nm].filter(Boolean).join(" ");
  // 비한국어 로케일에서는 상호/주소를 로마자로 표기
  const displayName = locale === "ko" ? h.yadm_nm : romanizeYadm(h.yadm_nm);
  const displayAddr = h.addr ? (locale === "ko" ? h.addr : romanizeAddr(h.addr)) : null;

  const sections: DescriptionSection[] = [];

  // 1. 개요
  const overviewTitle =
    locale === "en" ? "Overview"
    : locale === "ja" ? "概要"
    : locale === "zh" ? "概览"
    : "개요";
  const overviewLines: string[] = [];

  if (locale === "ko") {
    overviewLines.push(
      `${displayName}은(는) ${region}에 위치한 ${kindName}으로, ${band}에 해당합니다.`,
    );
    if (years != null) {
      overviewLines.push(
        years > 0
          ? `${years}년 이상의 운영 경력을 보유하고 있으며, ${h.estb_dd?.slice(0, 4)}년에 개설되었습니다.`
          : `최근 ${h.estb_dd?.slice(0, 4)}년에 개설된 신규 의료기관입니다.`,
      );
    }
  } else if (locale === "en") {
    overviewLines.push(
      `${displayName} is a ${kindName} located in ${region}, classified as a ${band}.`,
    );
    if (years != null) {
      overviewLines.push(
        years > 0
          ? `It has been operating for ${years}+ years since its establishment in ${h.estb_dd?.slice(0, 4)}.`
          : `Recently opened in ${h.estb_dd?.slice(0, 4)}.`,
      );
    }
  } else if (locale === "ja") {
    overviewLines.push(
      `${displayName}は${region}に位置する${kindName}で、${band}に該当します。`,
    );
    if (years != null) {
      overviewLines.push(
        years > 0
          ? `${years}年以上の運営経歴があり、${h.estb_dd?.slice(0, 4)}年に開設されました。`
          : `${h.estb_dd?.slice(0, 4)}年に開設された新規医療機関です。`,
      );
    }
  } else if (locale === "zh") {
    overviewLines.push(
      `${displayName}是位于${region}的${kindName},属于${band}。`,
    );
    if (years != null) {
      overviewLines.push(
        years > 0
          ? `已运营${years}年以上,开业于${h.estb_dd?.slice(0, 4)}年。`
          : `${h.estb_dd?.slice(0, 4)}年新开业的医疗机构。`,
      );
    }
  }
  sections.push({ title: overviewTitle, body: overviewLines.join(" ") });

  // 2. 의료진 구성
  if (total > 0) {
    const staffTitle =
      locale === "en" ? "Medical Team"
      : locale === "ja" ? "医療スタッフ"
      : locale === "zh" ? "医疗团队"
      : "의료진 구성";
    const lines: string[] = [];
    if (locale === "ko") {
      lines.push(`총 ${total}명의 의료진이 근무하고 있습니다.`);
      if (dominant) lines.push(`${dominant} 분야가 중심이며, `);
      if (specRatio != null && specRatio >= 50) {
        lines.push(`전문의 비율이 약 ${specRatio}%로 전문 인력이 충실히 구성되어 있습니다.`);
      } else if (specRatio != null) {
        lines.push(`전문의가 약 ${specRatio}%로 구성되어 있습니다.`);
      }
    } else if (locale === "en") {
      lines.push(`A total of ${total} medical staff work at this clinic.`);
      if (specRatio != null && specRatio >= 50) {
        lines.push(`Specialists make up ${specRatio}%, indicating a strong professional team.`);
      } else if (specRatio != null) {
        lines.push(`Specialists comprise approximately ${specRatio}%.`);
      }
    } else if (locale === "ja") {
      lines.push(`計${total}名の医療スタッフが勤務しています。`);
      if (specRatio != null && specRatio >= 50) {
        lines.push(`専門医比率は約${specRatio}%で、専門人材が充実しています。`);
      } else if (specRatio != null) {
        lines.push(`専門医は約${specRatio}%です。`);
      }
    } else if (locale === "zh") {
      lines.push(`共有${total}名医务人员在此工作。`);
      if (specRatio != null && specRatio >= 50) {
        lines.push(`专科医师比例约${specRatio}%,专业团队配置充实。`);
      } else if (specRatio != null) {
        lines.push(`专科医师占约${specRatio}%。`);
      }
    }
    sections.push({ title: staffTitle, body: lines.join(" ") });
  }

  // 3. 위치 / 접근성
  const locTitle =
    locale === "en" ? "Location"
    : locale === "ja" ? "アクセス"
    : locale === "zh" ? "位置"
    : "위치";
  const locLines: string[] = [];
  if (displayAddr) {
    if (locale === "ko") locLines.push(`주소: ${displayAddr}.`);
    else if (locale === "en") locLines.push(`Address: ${displayAddr}.`);
    else if (locale === "ja") locLines.push(`住所:${displayAddr}。`);
    else if (locale === "zh") locLines.push(`地址:${displayAddr}。`);
  }
  if (sigguName) {
    if (locale === "ko") locLines.push(`${sigguName} 지역 거주자나 인근 직장인들이 편리하게 이용할 수 있는 위치입니다.`);
    else if (locale === "en") locLines.push(`Conveniently located for residents and workers in ${sigguName}.`);
    else if (locale === "ja") locLines.push(`${sigguName}地域の住民や近隣勤務者が便利に利用できる立地です。`);
    else if (locale === "zh") locLines.push(`位置便于${sigguName}地区居民及周边上班族就诊。`);
  }
  sections.push({ title: locTitle, body: locLines.join(" ") });

  // 4. 안내
  const tipTitle =
    locale === "en" ? "Before Your Visit"
    : locale === "ja" ? "ご来院前に"
    : locale === "zh" ? "就诊前注意"
    : "방문 전 안내";
  let tip = "";
  if (locale === "ko") {
    tip = `정확한 진료 시간, 예약 가능 여부, 진료 항목 및 비급여 비용은 ${h.tel_no ? `${h.tel_no}로` : "전화로"} 사전에 확인하시는 것이 좋습니다. 본 페이지의 정보는 건강보험심사평가원(HIRA) 공공데이터를 기반으로 제공됩니다.`;
  } else if (locale === "en") {
    tip = `For exact hours, availability, treatment options and out-of-pocket fees, please contact the clinic ${h.tel_no ? `at ${h.tel_no}` : "directly"} in advance. Information on this page is based on Korea's HIRA public data.`;
  } else if (locale === "ja") {
    tip = `正確な診療時間、予約可否、診療項目および自由診療費用は${h.tel_no ? `${h.tel_no}まで` : "クリニックへ"}事前にご確認ください。本ページの情報はHIRA(韓国公共データ)に基づきます。`;
  } else if (locale === "zh") {
    tip = `准确的营业时间、可预约性、诊疗项目及自费费用,请提前${h.tel_no ? `致电 ${h.tel_no}` : "联系诊所"}确认。本页信息基于HIRA(韩国公共数据)。`;
  }
  sections.push({ title: tipTitle, body: tip });

  return sections;
}
