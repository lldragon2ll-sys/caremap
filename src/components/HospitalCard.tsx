import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";
import { Badge } from "./Badge";
import { HospitalLogo } from "./HospitalLogo";
import type { Hospital } from "@/lib/types";
import { sizeCategory } from "@/lib/hospital-util";
import { tKind, tSido, tSiggu } from "@/lib/i18n-dict";
import { romanizeYadm, romanizeAddr } from "@/lib/romanize";

export type Layout = "card" | "compact";

function telHref(tel: string | null | undefined): string | null {
  if (!tel) return null;
  const digits = tel.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

function specialistCount(h: Hospital): number {
  return (h.mdept_sdr_cnt ?? 0) + (h.dety_sdr_cnt ?? 0) + (h.cmdc_sdr_cnt ?? 0);
}

export function HospitalCard({ h, layout = "card" }: { h: Hospital; layout?: Layout }) {
  const t = useTranslations("card");
  const tHospital = useTranslations("hospital");
  const locale = useLocale();
  const href = `/hospital/${encodeURIComponent(h.slug)}`;
  const tel = telHref(h.tel_no);
  const region = [tSiggu(h.sggu_cd_nm ?? "", locale), h.emdong_nm].filter(Boolean).join(" ");
  const spec = specialistCount(h);
  const size = sizeCategory(h);
  // size.label은 한글이라 비한국어 로케일에서는 messages의 tier 라벨로 대체
  const sizeLabel = locale === "ko"
    ? size.label
    : (size.tier === "대형" ? t("tierLarge") : size.tier === "중형" ? t("tierMid") : t("tierSmall"));

  return (
    <article className={`cm-hcard${layout === "compact" ? " compact" : ""}`}>
      <Link href={href} className="img" style={{ textDecoration: "none" }}>
        <div className="badge-row" style={{ alignSelf: "flex-start" }}>
          <Badge kind="verified">{tHospital("verified").split(" ")[0]}</Badge>
          {h.cl_cd_nm && <Badge kind="kind">{tKind(h.cl_cd_nm, locale)}</Badge>}
        </div>
        <HospitalLogo h={h} size={56} className="card-logo" />
      </Link>
      <div className="body">
        <Link href={href} className="name" style={{ textDecoration: "none", flexDirection: "column", alignItems: "flex-start" }}>
          <span>{h.yadm_nm}</span>
          {locale !== "ko" && (
            <span style={{ fontSize: 11.5, color: "var(--cm-text-2)", fontWeight: 500, marginTop: 2 }}>
              {romanizeYadm(h.yadm_nm)}
            </span>
          )}
        </Link>
        <div className="specialty">
          {tKind(h.cl_cd_nm ?? "병원", locale)} · {region || tSido(h.sido_cd_nm ?? "", locale) || "—"}
        </div>
        <div className="meta">
          <div className="line">
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11.5, fontWeight: 600, color: size.color,
              }}
            >
              <Icon name="shield" size={11} color={size.color} />
              {sizeLabel}
            </span>
            {spec > 0 && (
              <span style={{ color: "var(--cm-text-3)" }}>
                {" · "}{t("specialists", { n: spec })}
              </span>
            )}
          </div>
          {h.addr && (
            <div className="line">
              <Icon name="pin" size={13} color="var(--cm-text-3)" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {locale === "ko" ? h.addr : romanizeAddr(h.addr)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="actions">
        <Link href={href} className="btn">{t("details")}</Link>
        {tel ? (
          <a href={tel} className="btn primary">
            <Icon name="phone" size={13} color="#fff" />
            {t("call")}
          </a>
        ) : (
          <span className="btn" style={{ opacity: 0.5, cursor: "not-allowed" }}>
            {t("noPhone")}
          </span>
        )}
      </div>
    </article>
  );
}
