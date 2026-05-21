import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Terms of Service"
      : locale === "ja" ? "利用規約"
      : locale === "zh" ? "服务条款"
      : "이용약관",
  };
}

export default async function TermsPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = await getLocale();

  const t = (ko: string, en: string, ja: string, zh: string) =>
    lang === "en" ? en : lang === "ja" ? ja : lang === "zh" ? zh : ko;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontSize: 14.5, lineHeight: 1.7, color: "var(--cm-text)" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 32, fontWeight: 700, marginBottom: 24 }}>
        {t("이용약관", "Terms of Service", "利用規約", "服务条款")}
      </h1>
      <p>{t(
        "본 사이트(CAREMAP)는 주식회사 팀퍼포먼스가 운영하는 비급여 의료 디렉토리 서비스입니다.",
        "This site (CAREMAP) is an out-of-pocket medical directory service operated by Team Performance Inc.",
        "本サイト(CAREMAP)は株式会社チームパフォーマンスが運営する自由診療ディレクトリサービスです。",
        "本网站(CAREMAP)是团绩效股份有限公司运营的自费医疗目录服务。"
      )}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("1. 서비스 성격", "1. Nature of the Service", "1. サービスの性質", "1. 服务性质")}
      </h2>
      <p>{t(
        "본 서비스는 정보 제공 목적이며 의료 자문, 진단, 처방을 대체하지 않습니다. 실제 진료 전에는 반드시 의료기관에 직접 연락하여 진료 가능 여부, 비용, 시술 내용을 확인하시기 바랍니다.",
        "This service is for informational purposes and does not replace medical consultation, diagnosis or prescription. Please contact the clinic directly to confirm availability, costs and procedures before actual treatment.",
        "本サービスは情報提供を目的とし、医療相談・診断・処方を代替しません。実際の診療前は必ず医療機関に直接ご連絡し、診療可否・費用・施術内容をご確認ください。",
        "本服务仅供参考,不能替代医疗咨询、诊断或处方。实际就诊前请直接联系医疗机构确认可接诊性、费用及治疗内容。"
      )}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("2. 데이터 출처", "2. Data Source", "2. データソース", "2. 数据来源")}
      </h2>
      <p>{t(
        "본 서비스의 의료기관 정보는 건강보험심사평가원(HIRA) 공공데이터 포털에서 제공하는 데이터를 기반으로 합니다. 데이터는 정기적으로 갱신되나, 100% 최신을 보장하지는 않습니다.",
        "Medical institution information on this service is based on data provided by Korea's Health Insurance Review & Assessment Service (HIRA) public data portal. Data is updated regularly but not guaranteed to be 100% current.",
        "本サービスの医療機関情報は韓国健康保険審査評価院(HIRA)公共データポータルのデータを基にしています。定期的に更新されますが、100%最新性を保証するものではありません。",
        "本服务的医疗机构信息基于韩国健康保险审查评估院(HIRA)公共数据门户提供的数据。定期更新,但不保证100%最新。"
      )}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("3. 의료광고", "3. Medical Advertising", "3. 医療広告", "3. 医疗广告")}
      </h2>
      <p>{t(
        "본 서비스는 의료법 제56조에 따라 운영되며, 광고성 콘텐츠가 게시되는 경우 대한의사협회 등 관계 기관의 사전 심의 결과에 따릅니다.",
        "This service operates under Article 56 of the Korean Medical Service Act. Any advertising content shall comply with prior review by relevant authorities such as the Korean Medical Association.",
        "本サービスは医療法第56条に従い運営され、広告性コンテンツは大韓医師協会等関連機関の事前審議結果に従います。",
        "本服务依据韩国医疗法第56条运营,任何广告内容均需经大韩医师协会等相关机构事先审议。"
      )}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("4. 책임 한계", "4. Limitation of Liability", "4. 責任の限定", "4. 责任限制")}
      </h2>
      <p>{t(
        "정보의 정확성, 최신성, 완전성에 대해 본 사이트는 보증하지 않으며, 정보 이용으로 발생한 손해에 대해 책임지지 않습니다.",
        "This site does not guarantee the accuracy, timeliness or completeness of information and is not liable for any damage arising from the use of the information.",
        "情報の正確性・最新性・完全性について本サイトは保証せず、情報利用により生じた損害について責任を負いません。",
        "本网站不保证信息的准确性、时效性或完整性,对因使用信息造成的损害不承担责任。"
      )}</p>

      <p style={{ marginTop: 40, fontSize: 12, color: "var(--cm-text-2)" }}>
        © {new Date().getFullYear()} Team Performance Inc.
      </p>
    </div>
  );
}
