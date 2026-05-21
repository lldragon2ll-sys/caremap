"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NextLink from "next/link";
import { Icon } from "./Icon";
import { LOCALE_LABELS, tSpecialty } from "@/lib/i18n-dict";
import { routing } from "@/i18n/routing";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

export function TopNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langWrapRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 드롭다운 닫기 (mousedown 사용 — onClick 전에 발생하지 않도록)
  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent) => {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [langOpen]);

  const NAV_ITEMS = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("search") },
    { href: `/search?q=${encodeURIComponent(tSpecialty("성형외과", locale))}`, label: t("plasticSurgery") },
    { href: `/search?q=${encodeURIComponent(tSpecialty("피부과", locale))}`, label: t("dermatology") },
    { href: `/search?q=${encodeURIComponent(tSpecialty("치과", locale))}`, label: t("dental") },
  ];

  // 명시적 locale prefix — 항상 절대 경로 사용 (Vercel middleware 캐시 우회)
  const buildLocaleHref = (target: string) => {
    const prefix = target === routing.defaultLocale ? "" : `/${target}`;
    // pathname 자체에 prefix 가 이미 없도록 next-intl이 처리
    return `${prefix}${pathname || "/"}`;
  };

  return (
    <header className="cm-nav">
      <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
        <span className="brand-mark" aria-hidden />
        {SITE_NAME}
      </Link>
      <nav className="navlinks">
        {NAV_ITEMS.map((n) => (
          <Link key={n.href} href={n.href}>{n.label}</Link>
        ))}
      </nav>
      <span className="spacer" />

      <div className="lang-dropdown desktop-only" ref={langWrapRef} style={{ position: "relative" }}>
        <button
          type="button"
          className="lang-pill"
          aria-haspopup="menu"
          aria-expanded={langOpen}
          onClick={() => setLangOpen((v) => !v)}
        >
          <Icon name="globe" size={13} />
          {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
          <Icon name="chev" size={11} />
        </button>
        {langOpen && (
          <div
            className="lang-menu"
            role="menu"
            style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "#fff", border: "1px solid var(--cm-line)",
              borderRadius: 10, padding: 6,
              boxShadow: "var(--cm-shadow)",
              zIndex: 100, minWidth: 160,
              display: "flex", flexDirection: "column", gap: 2,
            }}
          >
            {routing.locales.map((l) => (
              <a
                key={l}
                href={buildLocaleHref(l)}
                onClick={() => setLangOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 13.5,
                  fontWeight: l === locale ? 700 : 500,
                  color: l === locale ? "var(--cm-primary)" : "var(--cm-ink)",
                  textDecoration: "none",
                  background: l === locale ? "var(--cm-primary-50)" : "transparent",
                }}
                role="menuitem"
              >
                {LOCALE_LABELS[l]}
              </a>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/search"
        className="btn-primary"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <Icon name="search" size={14} color="#fff" />
        {t("searchButton")}
      </Link>
      <button
        type="button"
        className="mobile-menu-btn"
        aria-label={t("openMenu")}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <Icon name={mobileOpen ? "plus" : "menu"} size={18} />
      </button>

      {mobileOpen && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <nav className="mobile-menu" role="menu">
            {NAV_ITEMS.map((n) => (
              <Link key={n.href} href={n.href} role="menuitem" onClick={() => setMobileOpen(false)}>
                {n.label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid var(--cm-line)", marginTop: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 12, color: "var(--cm-text-2)", fontWeight: 600, padding: "4px 8px" }}>
                Language
              </div>
              {routing.locales.map((l) => (
                <a
                  key={l}
                  href={buildLocaleHref(l)}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "10px 8px",
                    color: l === locale ? "var(--cm-primary)" : "var(--cm-ink)",
                    fontWeight: l === locale ? 700 : 500,
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  {LOCALE_LABELS[l]}
                </a>
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
