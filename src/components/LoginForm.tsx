"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { pick4 } from "@/lib/i18n-dict";
import { SITE_URL } from "@/lib/seo";

type Mode = "password" | "magic";

/**
 * 로그인 폼 — 비밀번호 로그인 우선, 매직링크는 비밀번호 잊었을 때 보조 수단.
 * 신규 가입은 별도 /signup 페이지로 안내 (회원정보 수집 폼 사용).
 */
export function LoginForm({ locale, next }: { locale: string; next: string }) {
  const [mode, setMode] = useState<Mode>("password");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"sent" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const L = {
    emailLabel: pick4(locale, "이메일", "Email", "メール", "邮箱"),
    pwLabel: pick4(locale, "비밀번호", "Password", "パスワード", "密码"),
    pwCta: pick4(locale, "로그인", "Log in", "ログイン", "登录"),
    magicCta: pick4(locale, "로그인 링크 받기", "Send login link", "ログインリンクを受け取る", "接收登录链接"),
    switchToMagic: pick4(locale, "비밀번호를 잊으셨나요?", "Forgot your password?", "パスワードをお忘れですか?", "忘记密码?"),
    switchToPw: pick4(locale, "비밀번호로 로그인", "Log in with password", "パスワードでログイン", "用密码登录"),
    signingIn: pick4(locale, "로그인 중…", "Signing in…", "ログイン中…", "登录中…"),
    sending: pick4(locale, "전송 중…", "Sending…", "送信中…", "提交中…"),
    sentMsg: pick4(locale,
      "이메일로 로그인 링크를 보냈습니다. 이메일을 확인해 주세요.",
      "We've sent you a login link. Check your email.",
      "ログインリンクをメールでお送りしました。ご確認ください。",
      "已发送登录链接到您的邮箱,请查收。",
    ),
    noAccount: pick4(locale, "아직 회원이 아니신가요?", "Don't have an account?", "まだ会員ではありませんか?", "还不是会员?"),
    signupLink: pick4(locale, "회원가입", "Sign up", "会員登録", "注册"),
    invalidLogin: pick4(locale,
      "이메일 또는 비밀번호가 올바르지 않습니다. 회원이 아니시면 회원가입해 주세요.",
      "Invalid email or password. Please sign up if you don't have an account.",
      "メールまたはパスワードが正しくありません。会員でない場合は新規登録してください。",
      "邮箱或密码错误。如未注册请先注册。",
    ),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = getSupabaseBrowser();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");

    try {
      if (mode === "password") {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          setError(L.invalidLogin);
          return;
        }
        if (data.session) {
          window.location.href = next;
        }
      } else {
        // 매직링크 — 비밀번호를 잊었거나 기존 회원의 보조 로그인 수단.
        // shouldCreateUser=false 로 미회원 자동가입 방지 (회원가입은 /signup 폼 사용).
        const redirectTo = `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
        });
        if (err) throw err;
        setDone("sent");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done === "sent") {
    return (
      <div style={{
        padding: "20px 18px", borderRadius: 12,
        background: "var(--cm-primary-50)", color: "var(--cm-primary-700)",
        fontSize: 14, lineHeight: 1.55,
      }}>
        ✓ {L.sentMsg}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label htmlFor="email" style={labelStyle}>{L.emailLabel}</label>
        <input id="email" name="email" type="email" required autoComplete="email" style={inputStyle} />
      </div>
      {mode === "password" && (
        <div>
          <label htmlFor="password" style={labelStyle}>{L.pwLabel}</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" style={inputStyle} />
        </div>
      )}
      <button
        type="submit" disabled={submitting}
        style={{
          background: "var(--cm-primary)", color: "#fff",
          border: "none", borderRadius: 10, padding: "13px 18px",
          fontSize: 14.5, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1, marginTop: 4,
        }}
      >
        {submitting
          ? (mode === "magic" ? L.sending : L.signingIn)
          : (mode === "magic" ? L.magicCta : L.pwCta)}
      </button>
      {error && (
        <div style={{ color: "var(--cm-red, #d33)", fontSize: 13, lineHeight: 1.5 }}>{error}</div>
      )}

      <button
        type="button"
        onClick={() => { setMode(mode === "password" ? "magic" : "password"); setError(null); }}
        style={{
          background: "transparent", border: "none",
          color: "var(--cm-text-2)", fontSize: 13, cursor: "pointer",
          padding: 6, textDecoration: "underline",
        }}
      >
        {mode === "password" ? L.switchToMagic : L.switchToPw}
      </button>

      <p style={{ fontSize: 13, color: "var(--cm-text-2)", textAlign: "center", marginTop: 12 }}>
        {L.noAccount}{" "}
        <a
          href={`/${locale}/signup${next !== "/me" ? `?next=${encodeURIComponent(next)}` : ""}`}
          style={{ color: "var(--cm-primary)", fontWeight: 600, textDecoration: "underline" }}
        >
          {L.signupLink}
        </a>
      </p>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--cm-line)", borderRadius: 10,
  padding: "12px 14px", fontSize: 15, width: "100%",
  background: "#fff", color: "var(--cm-ink)",
};
const labelStyle: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)",
  display: "block", marginBottom: 6,
};
