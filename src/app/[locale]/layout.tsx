import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import "../globals.css";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";

const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? "";
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Layout 메타: title template, metadataBase, 검색엔진 verification만 담당.
 * Canonical / hreflang / openGraph는 페이지별 generateMetadata가 자기 자신 URL로 출력.
 * (layout에 canonical을 두면 자식이 누락 시 잘못된 신호 발생.)
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t("name")} — ${t("tagline")}`,
      template: `%s | ${t("name")}`,
    },
    description: t("description"),
    robots: { index: true, follow: true },
    verification: {
      google: GOOGLE_VERIFICATION || undefined,
      other: NAVER_VERIFICATION
        ? { "naver-site-verification": NAVER_VERIFICATION }
        : undefined,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // 전역 Organization + WebSite (with SearchAction) JSON-LD
  // 모든 페이지 head에 노출 → 사이트 인디케이터·sitelinks search box
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "Team Performance Inc.",
    alternateName: ["주식회사 팀퍼포먼스", "CAREMAP"],
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    sameAs: [],
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: "CAREMAP",
    url: SITE_URL,
    inLanguage: ["ko", "en", "ja", "zh"],
    publisher: { "@id": `${SITE_URL}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AnalyticsScripts />
        <NextIntlClientProvider locale={locale}>
          <TopNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
