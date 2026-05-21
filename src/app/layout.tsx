import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 전국 병원 정보 디렉토리`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "대한민국 전국 7만여 개의 의원·병원·치과·한의원 정보를 한 곳에서. 지역과 진료과로 빠르게 찾고 전화로 문의하세요.",
  keywords: [
    "병원찾기", "병원검색", "전국 병원", "동네 병원", "의원 찾기",
    "치과", "한의원", "성형외과", "피부과", "내과", "소아청소년과",
    SITE_NAME,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — 전국 병원 정보 디렉토리`,
    description: "전국 7만여 개 의원·병원·치과·한의원 정보를 한 곳에서. 지역과 진료과로 빠르게 검색.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — 전국 병원 정보 디렉토리`,
    description: "전국 7만여 개 병원 정보를 한 곳에서.",
  },
  robots: { index: true, follow: true },
  // 검색엔진 소유 확인 (환경변수에서 코드 받으면 자동 적용)
  verification: {
    google: GOOGLE_VERIFICATION || undefined,
    other: NAVER_VERIFICATION
      ? { "naver-site-verification": NAVER_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-full flex flex-col">
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
