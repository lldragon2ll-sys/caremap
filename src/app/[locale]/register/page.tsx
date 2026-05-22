import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pick4 } from "@/lib/i18n-dict";
import { RegisterForm } from "@/components/RegisterForm";
import { buildPageMeta } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMeta({
    locale,
    pathSegment: "/register",
    title: pick4(locale, "병원 등록 신청", "Register Your Clinic", "クリニック登録申請", "诊所登记申请"),
    description: pick4(locale,
      "CAREMAP에 병원 정보 정정·등록을 신청하세요.",
      "Request to list or correct your clinic on CAREMAP.",
      "CAREMAPにクリニック情報の登録・訂正を申請。",
      "在CAREMAP申请诊所信息登记或更正。",
    ),
  });
}

export default async function RegisterPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = (locale ?? "ko") as "ko" | "en" | "ja" | "zh";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        {pick4(lang, "병원 등록·정보 정정 신청", "Register or Correct Clinic Info", "クリニック登録・情報訂正申請", "诊所登记·信息更正申请")}
      </h1>
      <p style={{ fontSize: 14.5, color: "var(--cm-text-2)", lineHeight: 1.65, marginBottom: 24 }}>
        {pick4(lang,
          "본 페이지의 정보는 건강보험심사평가원(HIRA) 공공데이터를 기반으로 합니다. 누락·오류 정보 정정 또는 신규 등록을 원하시면 아래 양식을 제출해주세요. 영업일 기준 3~5일 내 확인 후 회신드립니다.",
          "Information on this site is based on Korea's HIRA public data. To request corrections or new listings, please submit the form below. We typically respond within 3–5 business days.",
          "本サイトの情報はHIRA公共データに基づきます。情報の訂正や新規登録は下記フォームよりご送信ください。営業日3〜5日以内にご返信します。",
          "本网站信息基于韩国HIRA公共数据。如需更正或新增信息,请提交以下表单。我们通常在3–5个工作日内回复。",
        )}
      </p>
      <RegisterForm locale={lang} />
    </div>
  );
}
