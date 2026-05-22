import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { tSpecialty } from "@/lib/i18n-dict";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tSite = await getTranslations("site");
  const tNav = await getTranslations("nav");

  // 카테고리 URL로 직접 연결 — /search?q=*는 noindex이므로 시그널 분산 방지
  // ko 슬러그 그대로 사용 (DB가 한국어 데이터)
  const specialtyKeys = ["성형외과", "피부과", "치과", "안과", "한의원"];
  const specialties = specialtyKeys.map((ko) => ({
    href: `/s/${encodeURIComponent(ko)}`,
    label: tSpecialty(ko, locale),
  }));

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
              <li key={s.href}>
                <Link href={s.href}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h6>{t("operator")}</h6>
          <ul>
            <li>{tSite("operator")}</li>
            <li>{tSite("operatorEn")}</li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/register">{locale === "en" ? "Register Clinic" : locale === "ja" ? "クリニック登録" : locale === "zh" ? "诊所登记" : "병원 등록"}</Link></li>
            <li><Link href="/advertise">{locale === "en" ? "Advertise" : locale === "ja" ? "広告" : locale === "zh" ? "广告" : "광고/제휴"}</Link></li>
            <li><Link href="/terms">{locale === "en" ? "Terms" : locale === "ja" ? "利用規約" : locale === "zh" ? "条款" : "이용약관"}</Link></li>
            <li><Link href="/privacy">{locale === "en" ? "Privacy" : locale === "ja" ? "プライバシー" : locale === "zh" ? "隐私" : "개인정보"}</Link></li>
          </ul>
        </div>
      </div>
      <div className="legal">
        <span>
          © {new Date().getFullYear()} {tSite("operator")}. {tSite("dataSource")}
        </span>
        <span>{tSite("legal")}</span>
        <span style={{ display: "block", marginTop: 6, fontSize: 11.5, color: "var(--cm-text-3)" }}>
          {locale === "en" ? "Informational service only. This is not medical advertising."
            : locale === "ja" ? "情報提供サービス。医療広告ではありません。"
            : locale === "zh" ? "信息提供服务。非医疗广告。"
            : "정보 제공 서비스. 의료 광고가 아닙니다."}
        </span>
      </div>
    </footer>
  );
}
