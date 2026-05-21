"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NextLink from "next/link";
import { Icon } from "./Icon";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

export function TopNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("search") },
    { href: `/search?q=${encodeURIComponent(locale === "en" ? "Plastic Surgery" : "성형외과")}`, label: t("plasticSurgery") },
    { href: `/search?q=${encodeURIComponent(locale === "en" ? "Dermatology" : "피부과")}`, label: t("dermatology") },
    { href: `/search?q=${encodeURIComponent(locale === "en" ? "Dental" : "치과")}`, label: t("dental") },
  ];

  // 다른 언어 URL: 현재 pathname을 유지하면서 locale만 전환
  const otherLocale = locale === "ko" ? "en" : "ko";
  const otherLocaleLabel = locale === "ko" ? "EN" : "한국어";

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
      <NextLink
        href={otherLocale === "ko" ? pathname : `/${otherLocale}${pathname}`}
        className="lang-pill desktop-only"
        aria-label="언어 전환"
        prefetch={false}
        style={{ textDecoration: "none" }}
      >
        <Icon name="globe" size={13} />
        {otherLocaleLabel}
      </NextLink>
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
              <Link
                key={n.href}
                href={n.href}
                role="menuitem"
                onClick={() => setMobileOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <NextLink
              href={otherLocale === "ko" ? pathname : `/${otherLocale}${pathname}`}
              onClick={() => setMobileOpen(false)}
              prefetch={false}
              style={{ borderTop: "1px solid var(--cm-line)", marginTop: 4, paddingTop: 8 }}
            >
              {otherLocaleLabel}
            </NextLink>
          </nav>
        </>
      )}
    </header>
  );
}
