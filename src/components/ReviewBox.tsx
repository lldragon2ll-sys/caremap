"use client";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { pick4 } from "@/lib/i18n-dict";
import { ReviewForm } from "./ReviewForm";

type Props = {
  hospitalId: number;
  hospitalSlug: string;
  hospitalName: string;
  locale: string;
  reviewUserIds: string[];
};

/**
 * 후기 작성 영역 — 로그인 상태/본인 후기 여부를 client에서 판단.
 * 페이지가 cookies를 읽지 않으므로 ISR 캐싱이 가능해져 Vercel bandwidth ↓
 */
export function ReviewBox({ hospitalId, hospitalSlug, hospitalName, locale, reviewUserIds }: Props) {
  const [state, setState] = useState<"loading" | "anon" | "can_write" | "already">("loading");

  useEffect(() => {
    let alive = true;
    try {
      const sb = getSupabaseBrowser();
      sb.auth.getUser().then(({ data }) => {
        if (!alive) return;
        if (!data.user) { setState("anon"); return; }
        const has = reviewUserIds.includes(data.user.id);
        setState(has ? "already" : "can_write");
      }).catch(() => { if (alive) setState("anon"); });
    } catch {
      setState("anon");
    }
    return () => { alive = false; };
  }, [reviewUserIds]);

  return (
    <div style={{ marginTop: 20 }}>
      {state === "loading" && (
        <div style={{ height: 44 }} />
      )}
      {state === "anon" && (
        <Link
          href={`/login?next=/hospital/${encodeURIComponent(hospitalSlug)}%23reviews`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 10,
            background: "var(--cm-ink)", color: "#fff",
            fontSize: 13.5, fontWeight: 600, textDecoration: "none",
          }}
        >
          {pick4(locale, "후기 작성하려면 로그인", "Log in to write a review", "レビューを書くにはログイン", "登录后撰写评论")}
        </Link>
      )}
      {state === "already" && (
        <p style={{ fontSize: 13, color: "var(--cm-text-2)", padding: 12, background: "var(--cm-primary-50)", borderRadius: 8 }}>
          ✓ {pick4(locale, "이미 후기를 작성하셨습니다.", "You've already reviewed this clinic.", "既にレビューを投稿済みです。", "您已对该诊所发表评论。")}
        </p>
      )}
      {state === "can_write" && (
        <ReviewForm
          hospitalId={hospitalId}
          hospitalSlug={hospitalSlug}
          hospitalName={hospitalName}
          locale={locale}
        />
      )}
    </div>
  );
}
