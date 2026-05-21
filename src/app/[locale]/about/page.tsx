import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "About CAREMAP"
      : locale === "ja" ? "CAREMAP について"
      : locale === "zh" ? "关于 CAREMAP"
      : "CAREMAP 소개",
    description: locale === "en"
      ? "CAREMAP is a directory of Korea's cosmetic & out-of-pocket medical clinics, operated by Team Performance Inc."
      : "CAREMAP은 주식회사 팀퍼포먼스가 운영하는 한국 비급여·미용 의료 디렉토리입니다.",
  };
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = await getLocale();

  const content = {
    ko: {
      h1: "CAREMAP 소개",
      intro: "CAREMAP은 대한민국의 비급여 진료 클리닉 정보를 한 곳에 모은 디렉토리 플랫폼입니다.",
      missionTitle: "서비스 목적",
      mission: "환자와 가족이 진료받기 전 클리닉 정보를 비교하고, 가장 적합한 곳을 빠르게 찾을 수 있도록 돕습니다. 외국인 의료관광 환자에게도 4개 언어(한국어/영어/일본어/중국어)로 정보를 제공합니다.",
      dataTitle: "데이터",
      data: "건강보험심사평가원(HIRA)의 공공데이터를 기반으로 약 80,000건의 의료기관 정보를 제공합니다. 정기적으로 갱신됩니다.",
      operatorTitle: "운영",
      operator: "주식회사 팀퍼포먼스 (Team Performance Inc.)",
      contactTitle: "문의",
      contact: "병원 등록, 정보 정정, 광고 문의는 사이트 운영자에게 연락 주세요.",
    },
    en: {
      h1: "About CAREMAP",
      intro: "CAREMAP is a directory platform aggregating information about Korea's out-of-pocket medical clinics in one place.",
      missionTitle: "Our Mission",
      mission: "We help patients and their families compare clinic information before treatment and quickly find the best fit. We also serve foreign medical tourism patients with information in 4 languages (Korean / English / Japanese / Chinese).",
      dataTitle: "Data",
      data: "Information on approximately 80,000 medical institutions is provided based on Korea's Health Insurance Review & Assessment Service (HIRA) public data. Updated periodically.",
      operatorTitle: "Operator",
      operator: "Team Performance Inc. (주식회사 팀퍼포먼스)",
      contactTitle: "Contact",
      contact: "For clinic registration, data correction, or advertising inquiries, please contact the site operator.",
    },
    ja: {
      h1: "CAREMAP について",
      intro: "CAREMAP は韓国の自由診療クリニック情報を一か所にまとめたディレクトリプラットフォームです。",
      missionTitle: "サービス目的",
      mission: "患者とご家族が診療前にクリニック情報を比較し、最適な場所をすばやく見つけられるよう支援します。外国人医療観光患者向けにも4か国語(韓・英・日・中)で情報を提供します。",
      dataTitle: "データ",
      data: "韓国健康保険審査評価院(HIRA)の公共データを基に約80,000件の医療機関情報を提供。定期的に更新します。",
      operatorTitle: "運営",
      operator: "株式会社チームパフォーマンス (Team Performance Inc.)",
      contactTitle: "お問い合わせ",
      contact: "クリニック登録、情報訂正、広告のお問い合わせはサイト運営者までご連絡ください。",
    },
    zh: {
      h1: "关于 CAREMAP",
      intro: "CAREMAP 是将韩国自费诊疗诊所信息集中收集的目录平台。",
      missionTitle: "服务宗旨",
      mission: "帮助患者及家属在诊疗前比较诊所信息,快速找到最适合的诊所。也以4种语言(韩·英·日·中)为外国医疗旅游患者提供信息。",
      dataTitle: "数据",
      data: "基于韩国健康保险审查评估院(HIRA)公共数据,提供约80,000家医疗机构信息。定期更新。",
      operatorTitle: "运营",
      operator: "团绩效股份有限公司 (Team Performance Inc.)",
      contactTitle: "联系",
      contact: "诊所注册、信息更正、广告咨询请联系网站运营商。",
    },
  };

  const c = content[lang as keyof typeof content] ?? content.ko;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
        {c.h1}
      </h1>
      <p style={{ fontSize: 16, color: "var(--cm-text)", lineHeight: 1.7, marginBottom: 32 }}>{c.intro}</p>

      {[
        ["missionTitle", "mission"],
        ["dataTitle", "data"],
        ["operatorTitle", "operator"],
        ["contactTitle", "contact"],
      ].map(([titleKey, bodyKey]) => (
        <section key={titleKey} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>
            {c[titleKey as keyof typeof c]}
          </h2>
          <p style={{ fontSize: 14.5, color: "var(--cm-text)", lineHeight: 1.65 }}>
            {c[bodyKey as keyof typeof c]}
          </p>
        </section>
      ))}
    </div>
  );
}
