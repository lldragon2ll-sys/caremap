"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "./Icon";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CAREMAP";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/search", label: "병원 찾기" },
  { href: "/specialty", label: "진료과" },
  { href: "/region", label: "지역" },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <span className="lang-pill desktop-only" aria-hidden>
        <Icon name="globe" size={13} />
        KO
      </span>
      <Link
        href="/search"
        className="btn-primary"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <Icon name="search" size={14} color="#fff" />
        검색
      </Link>
      <button
        type="button"
        className="mobile-menu-btn"
        aria-label="메뉴 열기"
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
          </nav>
        </>
      )}
    </header>
  );
}
