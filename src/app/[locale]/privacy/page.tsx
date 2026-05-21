import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Privacy Policy"
      : locale === "ja" ? "プライバシーポリシー"
      : locale === "zh" ? "隐私政策"
      : "개인정보처리방침",
  };
}

export default async function PrivacyPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = await getLocale();
  const t = (ko: string, en: string, ja: string, zh: string) =>
    lang === "en" ? en : lang === "ja" ? ja : lang === "zh" ? zh : ko;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontSize: 14.5, lineHeight: 1.7, color: "var(--cm-text)" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 32, fontWeight: 700, marginBottom: 24 }}>
        {t("개인정보처리방침", "Privacy Policy", "プライバシーポリシー", "隐私政策")}
      </h1>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("1. 수집 정보", "1. Data Collected", "1. 収集情報", "1. 收集信息")}
      </h2>
      <p>{t(
        "본 사이트는 개인 식별 정보를 수집하지 않습니다. 사이트 운영을 위해 익명화된 사용 데이터(검색어, 페이지 조회수)를 집계 형태로 저장합니다.",
        "This site does not collect personally identifiable information. We store anonymized usage data (search queries, page views) in aggregate form for site operation.",
        "本サイトは個人識別情報を収集しません。サイト運営のため、匿名化された使用データ(検索ワード、ページ閲覧数)を集計形態で保存します。",
        "本网站不收集个人识别信息。为运营网站,以聚合形式存储匿名使用数据(搜索词、页面浏览量)。"
      )}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("2. 쿠키", "2. Cookies", "2. クッキー", "2. Cookie")}
      </h2>
      <p>{t(
        "언어 설정 등 사용자 경험 개선을 위해 쿠키와 localStorage를 사용합니다. 추적용 광고 쿠키는 사용하지 않습니다.",
        "We use cookies and localStorage to improve user experience (such as language preference). We do not use advertising tracking cookies.",
        "言語設定などユーザー体験向上のためクッキーとlocalStorageを使用します。追跡広告クッキーは使用しません。",
        "为改善用户体验(如语言偏好),我们使用cookie和localStorage。我们不使用追踪广告cookie。"
      )}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("3. 외부 서비스", "3. Third-Party Services", "3. 外部サービス", "3. 第三方服务")}
      </h2>
      <p>{t(
        "지도 표시를 위해 OpenStreetMap 타일을 사용합니다. 외부 지도 링크(Kakao, Naver, Google)는 사용자가 명시적으로 클릭할 때만 호출됩니다.",
        "We use OpenStreetMap tiles for map display. External map links (Kakao, Naver, Google) are called only when the user explicitly clicks.",
        "地図表示にOpenStreetMapタイルを使用します。外部地図リンク(Kakao、Naver、Google)はユーザーが明示的にクリックした時のみ呼び出されます。",
        "地图显示使用OpenStreetMap瓦片。外部地图链接(Kakao、Naver、Google)仅在用户明确点击时调用。"
      )}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        {t("4. 문의", "4. Contact", "4. お問い合わせ", "4. 联系")}
      </h2>
      <p>{t(
        "개인정보 관련 문의는 운영자(주식회사 팀퍼포먼스)에게 연락 주세요.",
        "For privacy-related inquiries, please contact the operator (Team Performance Inc.).",
        "個人情報関連のお問い合わせは運営者(株式会社チームパフォーマンス)までご連絡ください。",
        "隐私相关咨询请联系运营商(团绩效股份有限公司)。"
      )}</p>

      <p style={{ marginTop: 40, fontSize: 12, color: "var(--cm-text-2)" }}>
        © {new Date().getFullYear()} Team Performance Inc.
      </p>
    </div>
  );
}
