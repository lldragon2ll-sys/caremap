"use client";
import { useState } from "react";

type QA = { q: string; a: string };

/**
 * 홈 FAQ 아코디언 — 체류시간↑ + FAQPage JSON-LD로 검색 결과 리치 스니펫.
 * JSON-LD는 서버에서 별도 주입 (HomeFAQ.ld 사용).
 */
export function HomeFAQ({ locale, items }: { locale: string; items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const heading =
    locale === "en" ? "Frequently Asked Questions"
    : locale === "ja" ? "よくある質問"
    : locale === "zh" ? "常见问题"
    : "자주 묻는 질문";

  return (
    <section className="cm-section" aria-labelledby="home-faq-heading">
      <div className="section-head">
        <div>
          <h2 id="home-faq-heading">{heading}</h2>
          <div className="sub">
            {locale === "en" ? "Everything you need to know before booking"
              : locale === "ja" ? "ご予約前に知っておきたいこと"
              : locale === "zh" ? "预约前需要了解的信息"
              : "방문·예약 전 꼭 확인하세요"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{
                border: "1px solid var(--cm-line)",
                borderRadius: 12,
                background: isOpen ? "var(--cm-surface)" : "#fff",
                overflow: "hidden",
                transition: "background 0.15s",
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "16px 18px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--cm-ink)",
                  fontFamily: "inherit",
                }}
              >
                <span>{item.q}</span>
                <span
                  style={{
                    flexShrink: 0,
                    width: 22, height: 22,
                    display: "grid", placeItems: "center",
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                    color: "var(--cm-text-2)",
                  }}
                  aria-hidden
                >▾</span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: "0 18px 18px",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "var(--cm-text)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
