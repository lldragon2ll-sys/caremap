import { Link } from "@/i18n/navigation";
import { pick4 } from "@/lib/i18n-dict";

export function Pagination({
  locale,
  page,
  totalPages,
  basePath,
}: {
  locale: string;
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const window = 2;
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const labelPrev = pick4(locale, "이전", "Previous", "前へ", "上一页");
  const labelNext = pick4(locale, "다음", "Next", "次へ", "下一页");

  const linkFor = (p: number) => `${basePath}${p > 1 ? `?page=${p}` : ""}`;

  return (
    <nav
      aria-label="pagination"
      style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: 6, padding: "24px 12px 8px", fontSize: 13,
      }}
    >
      {prev ? (
        <Link href={linkFor(prev)} className="cm-filter-chip">{labelPrev}</Link>
      ) : (
        <span className="cm-filter-chip" style={{ opacity: 0.4, pointerEvents: "none" }}>{labelPrev}</span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} style={{ padding: "0 4px", color: "var(--cm-text-3)" }}>…</span>
        ) : p === page ? (
          <span
            key={p}
            className="cm-filter-chip active"
            aria-current="page"
            style={{ minWidth: 32, textAlign: "center" }}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={linkFor(p)}
            className="cm-filter-chip"
            style={{ minWidth: 32, textAlign: "center" }}
          >
            {p}
          </Link>
        )
      )}

      {next ? (
        <Link href={linkFor(next)} className="cm-filter-chip">{labelNext}</Link>
      ) : (
        <span className="cm-filter-chip" style={{ opacity: 0.4, pointerEvents: "none" }}>{labelNext}</span>
      )}
    </nav>
  );
}
