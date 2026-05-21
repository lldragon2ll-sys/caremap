import Link from "next/link";
import { Icon } from "./Icon";
import { Badge } from "./Badge";
import { HospitalLogo } from "./HospitalLogo";
import type { Hospital } from "@/lib/types";
import { sizeCategory } from "@/lib/hospital-util";

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
  const href = `/hospital/${encodeURIComponent(h.slug)}`;
  const tel = telHref(h.tel_no);
  const region = [h.sggu_cd_nm, h.emdong_nm].filter(Boolean).join(" ");
  const spec = specialistCount(h);
  const size = sizeCategory(h);

  return (
    <article className={`cm-hcard${layout === "compact" ? " compact" : ""}`}>
      <Link href={href} className="img" style={{ textDecoration: "none" }}>
        <div className="badge-row" style={{ alignSelf: "flex-start" }}>
          <Badge kind="verified">HIRA 인증</Badge>
          {h.cl_cd_nm && <Badge kind="kind">{h.cl_cd_nm}</Badge>}
        </div>
        <HospitalLogo h={h} size={56} className="card-logo" />
      </Link>
      <div className="body">
        <Link href={href} className="name" style={{ textDecoration: "none" }}>
          {h.yadm_nm}
        </Link>
        <div className="specialty">
          {h.cl_cd_nm ?? "병원"} · {region || h.sido_cd_nm || "—"}
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
              {size.label}
            </span>
            {spec > 0 && <span style={{ color: "var(--cm-text-3)" }}> · 전문의 {spec}명</span>}
          </div>
          {h.addr && (
            <div className="line">
              <Icon name="pin" size={13} color="var(--cm-text-3)" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {h.addr}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="actions">
        <Link href={href} className="btn">자세히 보기</Link>
        {tel ? (
          <a href={tel} className="btn primary">
            <Icon name="phone" size={13} color="#fff" />
            전화하기
          </a>
        ) : (
          <span className="btn" style={{ opacity: 0.5, cursor: "not-allowed" }}>
            전화번호 없음
          </span>
        )}
      </div>
    </article>
  );
}
