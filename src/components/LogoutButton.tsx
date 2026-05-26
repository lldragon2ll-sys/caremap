"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { pick4 } from "@/lib/i18n-dict";

export function LogoutButton({ locale }: { locale: string }) {
  const [busy, setBusy] = useState(false);
  const label = pick4(locale, "로그아웃", "Log out", "ログアウト", "退出");

  const onClick = async () => {
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
    } finally {
      // 새로고침으로 서버 상태 동기화
      window.location.href = "/";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      style={{
        background: "transparent",
        border: "1px solid var(--cm-line)",
        borderRadius: 8, padding: "8px 14px",
        fontSize: 13, fontWeight: 600, cursor: busy ? "wait" : "pointer",
        color: "var(--cm-text)",
      }}
    >
      {busy ? "…" : label}
    </button>
  );
}
