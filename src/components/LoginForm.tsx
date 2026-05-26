"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { pick4 } from "@/lib/i18n-dict";
import { SITE_URL } from "@/lib/seo";

type Mode = "magic" | "password";

export function LoginForm({ locale, next }: { locale: string; next: string }) {
  const [mode, setMode] = useState<Mode>("magic");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"sent" | "loggedin" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const L = {
    emailLabel: pick4(locale, "이메일", "Email", "メール", "邮箱"),
    pwLabel: pick4(locale, "비밀번호", "Password", "パスワード", "密码"),
    magicCta: pick4(locale, "로그인 링크 보내기", "Send login link", "ログインリンクを送信", "发送登录链接"),
    pwCta: pick4(locale, "비밀번호로 로그인", "Log in with password", "パスワードでログイン", "用密码登录"),
    switchToPw: pick4(locale, "비밀번호로 로그인하기", "Use password instead", "パスワードでログイン", "使用密码登录"),
    switchToMagic: pick4(locale, "이메일 링크로 로그인", "Use email link instead", "メールリンクでログイン", "使用邮件链接登录"),
    sending: pick4(locale, "전송 중…", "Sending…", "送信中…", "提交中…"),
    signingIn: pick4(locale, "로그인 중…", "Signing in…", "ログイン中…", "登录中…"),
    sentMsg: pick4(locale,
      "이메일로 로그인 링크를 보냈습니다. 이메일을 확인해주세요.",
      "We've sent you a login link. Check your email.",
      "ログインリンクをメールでお送りしました。ご確認ください。",
      "已发送登录链接到您的邮箱,请查收。",
    ),
    consent: pick4(locale,
      "로그인하시면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.",
      "By logging in, you agree to our Terms and Privacy Policy.",
      "ログインにより利用規約・プライバシーポリシーに同意したものとみなされます。",
      "登录即表示您同意服务条款和隐私政策。",
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
      if (mode === "magic") {
        // Magic link — 이메일로 로그인 URL 전송
        const redirectTo = `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: true,
          },
        });
        if (err) throw err;
        setDone("sent");
      } else {
        // 비밀번호 로그인 — 없으면 회원가입 + 비번 설정 형태로
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          // 사용자 없음 또는 비번 다름 → 회원가입 시도
          if (err.message.toLowerCase().includes("invalid") || err.message.toLowerCase().includes("not found")) {
            const { error: signupErr } = await supabase.auth.signUp({
              email, password,
              options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
            });
            if (signupErr) throw signupErr;
            setDone("sent");
            return;
          }
          throw err;
        }
        if (data.session) {
          setDone("loggedin");
          window.location.href = next;
        }
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
        <div style={{ color: "var(--cm-red, #d33)", fontSize: 13 }}>{error}</div>
      )}
      <button
        type="button"
        onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(null); }}
        style={{
          background: "transparent", border: "none",
          color: "var(--cm-text-2)", fontSize: 13, cursor: "pointer",
          padding: 6, textDecoration: "underline",
        }}
      >
        {mode === "magic" ? L.switchToPw : L.switchToMagic}
      </button>
      <p style={{ fontSize: 11.5, color: "var(--cm-text-3)", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
        {L.consent}
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
