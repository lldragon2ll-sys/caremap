"use client";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";
import { Badge } from "./Badge";
import { SpecialtyIcon, accentFor } from "./SpecialtyIcon";
import type { Hospital } from "@/lib/types";
import { sizeCategory, mapDeepLinks } from "@/lib/hospital-util";
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

/**
 * 정보-우선 병원 카드:
 * - 빈 hero 이미지 영역 제거 (의미 없는 placeholder를 만들지 않음)
 * - 좌측 4px 컬러 액센트 바 (진료과 / 종별 기준)
 * - 진료과 SVG 아이콘 + 상호
 * - 통계 한 줄 (의사·전문의·종별)
 * - 주소 한 줄, 액션 버튼 2개 (자세히 / 전화)
 */
export function HospitalCard({ h, layout = "card" }: { h: Hospital; layout?: Layout }) {
  const t = useTranslations("card");
  const tHospital = useTranslations("hospital");
  const locale = useLocale();
  const href = `/hospital/${encodeURIComponent(h.slug)}`;
  const tel = telHref(h.tel_no);
  const region = [tSido(h.sido_cd_nm ?? "", locale), tSiggu(h.sggu_cd_nm ?? "", locale), h.emdong_nm && locale !== "ko" ? romanizeAddr(h.emdong_nm) : h.emdong_nm].filter(Boolean).join(" ");
  const spec = specialistCount(h);
  const size = sizeCategory(h);
  const accent = accentFor(h);
  const kindLabel = tKind(h.cl_cd_nm ?? "병원", locale);

  // size.label은 한글이라 비한국어 로케일에서는 messages의 tier 라벨로 대체
  const sizeLabel = locale === "ko"
    ? size.label
    : (size.tier === "대형" ? t("tierLarge") : size.tier === "중형" ? t("tierMid") : t("tierSmall"));

  const map = mapDeepLinks(h);

  return (
    <article
      className={`cm-hcard cm-hcard-v2${layout === "compact" ? " compact" : ""}`}
      style={{ "--accent-bg": accent.bg, "--accent-soft": accent.bgSoft, "--accent-ink": accent.ink } as React.CSSProperties}
    >
      <Link href={href} className="cm-hcard-v2__main" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="cm-hcard-v2__head">
          <SpecialtyIcon h={h} size={22} />
          <div className="cm-hcard-v2__head-text">
            <h3 className="cm-hcard-v2__name">{h.yadm_nm}</h3>
            {locale !== "ko" && (
              <div className="cm-hcard-v2__name-en">{romanizeYadm(h.yadm_nm)}</div>
            )}
            <div className="cm-hcard-v2__sub">
              {kindLabel}{region ? ` · ${region}` : ""}
            </div>
          </div>
          <Badge kind="verified">{tHospital("verified").split(" ")[0]}</Badge>
        </div>

        <div className="cm-hcard-v2__stats">
          <span className="cm-stat-chip" style={{ color: "var(--accent-ink)", background: "var(--accent-soft)" }}>
            <Icon name="shield" size={11} color="var(--accent-ink)" />
            {sizeLabel}
          </span>
          {h.dr_tot_cnt > 0 && (
            <span className="cm-stat-chip">{t("doctors", { n: h.dr_tot_cnt })}</span>
          )}
          {spec > 0 && (
            <span className="cm-stat-chip">{t("specialists", { n: spec })}</span>
          )}
        </div>

        {h.addr && (
          <div className="cm-hcard-v2__addr">
            <Icon name="pin" size={12} color="var(--cm-text-3)" />
            <span>{locale === "ko" ? h.addr : romanizeAddr(h.addr)}</span>
          </div>
        )}
      </Link>

      <div className="cm-hcard-v2__actions">
        <Link href={href} className="cm-hcard-v2__btn">
          {t("details")}
        </Link>
        {tel ? (
          <a href={tel} className="cm-hcard-v2__btn primary" aria-label={`${h.yadm_nm} ${t("call")}`}>
            <Icon name="phone" size={13} color="#fff" />
            {t("call")}
          </a>
        ) : (
          <span className="cm-hcard-v2__btn disabled" aria-disabled="true">
            {t("noPhone")}
          </span>
        )}
        {map && (
          <a
            href={map.kakao}
            target="_blank"
            rel="noopener noreferrer"
            className="cm-hcard-v2__btn icon"
            aria-label="kakao map directions"
            title={locale === "ko" ? "길찾기 (카카오맵)" : locale === "ja" ? "道案内" : locale === "zh" ? "导航" : "Directions"}
          >
            <Icon name="pin" size={13} color="var(--cm-ink)" />
          </a>
        )}
      </div>
    </article>
  );
}
