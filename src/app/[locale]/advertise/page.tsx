import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pick4 } from "@/lib/i18n-dict";
import { RegisterForm } from "@/components/RegisterForm";

type Params = Promise<{ locale: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pick4(locale,
      "광고·제휴 안내",
      "Advertise on CAREMAP",
      "広告・提携のご案内",
      "广告·合作介绍",
    ),
    robots: { index: true, follow: true },
  };
}

export default async function AdvertisePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = (locale ?? "ko") as "ko" | "en" | "ja" | "zh";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
        {pick4(lang, "광고·제휴 안내", "Advertise on CAREMAP", "広告・提携のご案内", "广告·合作介绍")}
      </h1>
      <p style={{ fontSize: 15, color: "var(--cm-text)", lineHeight: 1.65, marginBottom: 18 }}>
        {pick4(lang,
          "CAREMAP은 매월 수만 명의 비급여·미용 진료 검색 트래픽을 확보하고 있습니다. 의료법 제56조에 따른 사전 심의 대상 광고는 광고 심의필 번호와 함께 게재됩니다.",
          "CAREMAP attracts tens of thousands of monthly users searching for cosmetic and out-of-pocket medical care. Any advertising subject to Article 56 of the Korean Medical Service Act is displayed with the relevant medical advertising review number.",
          "CAREMAPは毎月数万人の自由診療・美容医療検索トラフィックを獲得しています。韓国医療法第56条に基づく事前審議対象広告は審議番号と共に掲載されます。",
          "CAREMAP每月吸引数万自费·美容医疗搜索流量。依据韩国医疗法第56条须事前审议的广告将与审议号一同刊登。",
        )}
      </p>
      <ul style={{ fontSize: 14, color: "var(--cm-text)", lineHeight: 1.8, marginBottom: 32, paddingLeft: 18 }}>
        <li>{pick4(lang,
          "상단 추천 영역 노출 (홈 / 카테고리)",
          "Featured placement (Home / Category)",
          "上部おすすめ枠 (ホーム / カテゴリ)",
          "顶部推荐位 (首页 / 类别)",
        )}</li>
        <li>{pick4(lang,
          "지역 / 진료과 키워드 우선 노출",
          "Priority by region & specialty keywords",
          "地域・診療科キーワード優先表示",
          "按地区·科室关键词优先展示",
        )}</li>
        <li>{pick4(lang,
          "4개 언어 동시 노출 (한·영·일·중)",
          "Multi-language exposure (KR/EN/JA/ZH)",
          "4か国語同時露出 (韓・英・日・中)",
          "4种语言同步展示 (韩·英·日·中)",
        )}</li>
      </ul>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        {pick4(lang, "문의하기", "Get in Touch", "お問い合わせ", "联系我们")}
      </h2>
      <RegisterForm locale={lang} />
    </div>
  );
}
