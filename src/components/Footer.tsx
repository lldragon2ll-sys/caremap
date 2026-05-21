import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tSite = await getTranslations("site");
  const tNav = await getTranslations("nav");

  // 검색 chips — 진료과 영문/한글 자동 매칭
  const specialties = [
    { q: locale === "en" ? "Plastic Surgery" : "성형외과", label: locale === "en" ? "Plastic Surgery" : "성형외과" },
    { q: locale === "en" ? "Dermatology" : "피부과", label: locale === "en" ? "Dermatology" : "피부과" },
    { q: locale === "en" ? "Dental" : "치과", label: locale === "en" ? "Dental" : "치과" },
    { q: locale === "en" ? "Ophthalmology" : "안과", label: locale === "en" ? "Ophthalmology" : "안과" },
    { q: locale === "en" ? "Korean Medicine" : "한의원", label: locale === "en" ? "Korean Medicine" : "한의원" },
  ];

  return (
    <footer className="cm-footer">
      <div className="cols">
        <div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "var(--cm-font-display)", fontWeight: 700,
              fontSize: 16, color: "var(--cm-ink)", marginBottom: 10,
            }}
          >
            <span
              className="brand-mark"
              style={{
                width: 24, height: 24,
                background: "var(--cm-primary)", borderRadius: 6,
                position: "relative",
              }}
              aria-hidden
            />
            {SITE_NAME}
          </div>
          <p style={{ maxWidth: 280, margin: 0, fontSize: 12, lineHeight: 1.55 }}>
            {tSite("footerTagline")}
          </p>
        </div>
        <div>
          <h6>{t("service")}</h6>
          <ul>
            <li><Link href="/">{tNav("home")}</Link></li>
            <li><Link href="/search">{tNav("search")}</Link></li>
          </ul>
        </div>
        <div>
          <h6>{t("topSpecialties")}</h6>
          <ul>
            {specialties.map((s) => (
              <li key={s.q}>
                <Link href={`/search?q=${encodeURIComponent(s.q)}`}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h6>{t("operator")}</h6>
          <ul>
            <li>{tSite("operator")}</li>
            <li>{tSite("operatorEn")}</li>
          </ul>
        </div>
      </div>
      <div className="legal">
        <span>
          © {new Date().getFullYear()} {tSite("operator")}. {tSite("dataSource")}
        </span>
        <span>{tSite("legal")}</span>
      </div>
    </footer>
  );
}
