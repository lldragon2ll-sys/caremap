import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { GUIDES, getGuide } from "@/lib/guides";
import { tSpecialty } from "@/lib/i18n-dict";
import { buildPageMeta } from "@/lib/seo";

type Params = Promise<{ locale: string; slug: string }>;
export const dynamic = "force-static";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "Guide" };
  const lang = locale as "ko" | "en" | "ja" | "zh";
  return buildPageMeta({
    locale,
    pathSegment: `/guide/${slug}`,
    title: g.title[lang] ?? g.title.ko,
    description: g.lede[lang] ?? g.lede.ko,
    ogType: "article",
  });
}

function pickLocaleStr(o: { ko: string; en: string; ja: string; zh: string }, lang: "ko" | "en" | "ja" | "zh"): string {
  return o[lang] ?? o.ko;
}

export default async function GuidePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const g = getGuide(slug);
  if (!g) notFound();

  const lang = locale as "ko" | "en" | "ja" | "zh";
  const tNav = await getTranslations("nav");

  const faqLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faq.map((it) => ({
      "@type": "Question",
      name: pickLocaleStr(it.q, lang),
      acceptedAnswer: { "@type": "Answer", text: pickLocaleStr(it.a, lang) },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLD) }} />
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
        <nav style={{ fontSize: 12.5, color: "var(--cm-text-2)", marginBottom: 12 }}>
          <Link href="/" style={{ color: "var(--cm-text-2)" }}>{tNav("home")}</Link>
          <span style={{ margin: "0 6px" }}>›</span>
          <span>Guide</span>
        </nav>
        <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
          {pickLocaleStr(g.title, lang)}
        </h1>
        <p style={{ fontSize: 16, color: "var(--cm-text)", lineHeight: 1.7, marginBottom: 32 }}>
          {pickLocaleStr(g.lede, lang)}
        </p>

        {g.sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>
              {pickLocaleStr(s.heading, lang)}
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--cm-text)", lineHeight: 1.7 }}>
              {pickLocaleStr(s.body, lang)}
            </p>
          </section>
        ))}

        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>
            {lang === "en" ? "FAQ" : lang === "ja" ? "よくある質問" : lang === "zh" ? "常见问题" : "자주 묻는 질문"}
          </h2>
          {g.faq.map((it, i) => (
            <details key={i} open={i === 0} style={{
              border: "1px solid var(--cm-line)", borderRadius: 10,
              padding: "12px 16px", marginBottom: 10, background: "#fff",
            }}>
              <summary style={{ fontWeight: 600, cursor: "pointer", fontSize: 14.5 }}>{pickLocaleStr(it.q, lang)}</summary>
              <p style={{ fontSize: 14, color: "var(--cm-text)", lineHeight: 1.65, marginTop: 8 }}>
                {pickLocaleStr(it.a, lang)}
              </p>
            </details>
          ))}
        </section>

        <div style={{
          background: "var(--cm-primary-50)", borderRadius: 12, padding: 20,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <strong style={{ fontSize: 15 }}>
            {lang === "en" ? "Find a clinic"
              : lang === "ja" ? "クリニックを探す"
              : lang === "zh" ? "查找诊所"
              : "병원 찾기"}
          </strong>
          <Link href={`/search?q=${encodeURIComponent(tSpecialty(g.specialty, locale))}`}
            style={{
              background: "var(--cm-primary)", color: "#fff", textDecoration: "none",
              padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              alignSelf: "flex-start",
            }}>
            {lang === "en" ? `Browse ${tSpecialty(g.specialty, locale)} clinics →`
              : lang === "ja" ? `${tSpecialty(g.specialty, locale)}を探す →`
              : lang === "zh" ? `查看${tSpecialty(g.specialty, locale)}诊所 →`
              : `${g.specialty} 병원 둘러보기 →`}
          </Link>
        </div>
      </article>
    </>
  );
}
