"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { pick4 } from "@/lib/i18n-dict";
import { SITE_URL } from "@/lib/seo";

const SIDOS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const INTERESTS = [
  "성형외과", "피부과", "치과", "안과", "한의원", "정신과",
  "정형외과", "재활의학과", "비뇨의학과", "산부인과", "가정의학과",
];

type Props = { locale: string; next: string };

/**
 * 자체 회원가입 폼 — 이메일·비밀번호·닉네임 필수,
 * 통계·추천용 선택 정보 (성별·출생연도·시도·관심진료과) 수집.
 * 의료법·개인정보보호법 기준 최소 정보 원칙.
 */
export function SignupForm({ locale, next }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const toggleInterest = (s: string) =>
    setInterests((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const L = {
    email: pick4(locale, "이메일", "Email", "メール", "邮箱"),
    pw: pick4(locale, "비밀번호 (8자 이상)", "Password (8+ chars)", "パスワード(8文字以上)", "密码 (8位以上)"),
    pwConfirm: pick4(locale, "비밀번호 확인", "Confirm password", "パスワード確認", "确认密码"),
    nick: pick4(locale, "닉네임 (2~24자)", "Nickname (2-24 chars)", "ニックネーム(2-24文字)", "昵称 (2-24字)"),
    nickHint: pick4(locale,
      "후기·게시글에 노출됩니다. 본명을 사용하지 마세요.",
      "Shown on reviews/posts. Avoid real names.",
      "レビュー・投稿に表示されます。本名は使用しないでください。",
      "用于评论·帖子,请勿使用真实姓名。",
    ),
    optional: pick4(locale, "선택 정보 (통계·추천용)", "Optional info (for stats & recommendations)", "選択情報(統計・推薦用)", "可选信息(统计·推荐)"),
    gender: pick4(locale, "성별", "Gender", "性別", "性别"),
    male: pick4(locale, "남성", "Male", "男性", "男"),
    female: pick4(locale, "여성", "Female", "女性", "女"),
    genderOther: pick4(locale, "기타", "Other", "その他", "其他"),
    genderUndisclosed: pick4(locale, "비공개", "Prefer not to say", "回答しない", "不公开"),
    birthYear: pick4(locale, "출생연도 (예: 1990)", "Birth year (e.g. 1990)", "生年(例:1990)", "出生年份 (例如 1990)"),
    region: pick4(locale, "거주 지역 (시·도)", "Region (province)", "居住地域", "居住地区"),
    interestsLabel: pick4(locale, "관심 진료과 (복수선택)", "Interests (multiple)", "関心診療科(複数選択)", "兴趣科室 (多选)"),
    terms: pick4(locale,
      "이용약관 및 개인정보처리방침에 동의합니다 (필수)",
      "I agree to the Terms of Service and Privacy Policy (required)",
      "利用規約・プライバシーポリシーに同意します(必須)",
      "我同意服务条款和隐私政策(必填)",
    ),
    marketing: pick4(locale,
      "마케팅 정보 수신에 동의합니다 (선택)",
      "I agree to receive marketing information (optional)",
      "マーケティング情報の受信に同意します(任意)",
      "同意接收营销信息(可选)",
    ),
    submit: pick4(locale, "회원가입", "Create account", "会員登録", "注册"),
    submitting: pick4(locale, "가입 중…", "Creating account…", "登録中…", "注册中…"),
    pwMismatch: pick4(locale, "비밀번호가 일치하지 않습니다.", "Passwords don't match.", "パスワードが一致しません。", "密码不一致。"),
    sentTitle: pick4(locale, "확인 이메일을 보냈습니다", "Confirmation email sent", "確認メールを送信しました", "确认邮件已发送"),
    sentBody: pick4(locale,
      "받은편지함에서 링크를 클릭해 가입을 완료해 주세요. 메일이 안 보이면 스팸함을 확인하세요.",
      "Click the link in your inbox to complete signup. Check spam if you don't see it.",
      "受信トレイのリンクをクリックして登録を完了してください。届かない場合は迷惑メールをご確認ください。",
      "请点击邮箱中的链接完成注册。如未收到,请检查垃圾邮件。",
    ),
    goLogin: pick4(locale, "이미 회원이신가요? 로그인", "Already have an account? Log in", "すでに会員ですか?ログイン", "已有账号?登录"),
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    const passwordConfirm = String(fd.get("password_confirm") ?? "");
    const nickname = String(fd.get("nickname") ?? "").trim().slice(0, 24);
    const gender = String(fd.get("gender") ?? "");
    const birthYearRaw = String(fd.get("birth_year") ?? "").trim();
    const region_sido = String(fd.get("region_sido") ?? "");
    // interests come from React state (not FormData) — chip toggle buttons
    const terms = fd.get("terms") === "on";
    const marketing = fd.get("marketing") === "on";

    if (password !== passwordConfirm) { setError(L.pwMismatch); return; }
    if (!terms) { setError(pick4(locale, "약관에 동의해 주세요.", "Please agree to the terms.", "規約に同意してください。", "请同意条款。")); return; }

    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            nickname,
            ...(gender ? { gender } : {}),
            ...(birthYearRaw ? { birth_year: birthYearRaw } : {}),
            ...(region_sido ? { region_sido } : {}),
            ...(interests.length > 0 ? { interests } : {}),
            marketing_opt_in: marketing ? "true" : "false",
            terms_agreed_at: new Date().toISOString(),
          },
        },
      });
      if (err) throw err;
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ padding: "24px 22px", borderRadius: 14, background: "var(--cm-primary-50)", color: "var(--cm-primary-700)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>✓ {L.sentTitle}</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{L.sentBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 필수 */}
      <div>
        <label htmlFor="email" style={labelStyle}>{L.email} *</label>
        <input id="email" name="email" type="email" required autoComplete="email" style={inputStyle} />
      </div>
      <div>
        <label htmlFor="password" style={labelStyle}>{L.pw} *</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
      </div>
      <div>
        <label htmlFor="password_confirm" style={labelStyle}>{L.pwConfirm} *</label>
        <input id="password_confirm" name="password_confirm" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
      </div>
      <div>
        <label htmlFor="nickname" style={labelStyle}>{L.nick} *</label>
        <input id="nickname" name="nickname" type="text" required minLength={2} maxLength={24} style={inputStyle} />
        <p style={hintStyle}>{L.nickHint}</p>
      </div>

      {/* 선택 정보 섹션 구분선 */}
      <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--cm-line)" }}>
        <p style={{ fontSize: 12.5, color: "var(--cm-text-2)", fontWeight: 600, margin: "0 0 12px" }}>
          {L.optional}
        </p>
      </div>

      {/* 선택 */}
      <div>
        <label htmlFor="gender" style={labelStyle}>{L.gender}</label>
        <select id="gender" name="gender" style={inputStyle} defaultValue="">
          <option value="">—</option>
          <option value="male">{L.male}</option>
          <option value="female">{L.female}</option>
          <option value="other">{L.genderOther}</option>
          <option value="undisclosed">{L.genderUndisclosed}</option>
        </select>
      </div>
      <div>
        <label htmlFor="birth_year" style={labelStyle}>{L.birthYear}</label>
        <input id="birth_year" name="birth_year" type="number" min={1920} max={2020} placeholder="1990" style={inputStyle} />
      </div>
      <div>
        <label htmlFor="region_sido" style={labelStyle}>{L.region}</label>
        <select id="region_sido" name="region_sido" style={inputStyle} defaultValue="">
          <option value="">—</option>
          {SIDOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>{L.interestsLabel}</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {INTERESTS.map((s) => {
            const on = interests.includes(s);
            return (
              <button
                key={s} type="button"
                onClick={() => toggleInterest(s)}
                style={{
                  fontSize: 13, padding: "6px 12px", borderRadius: 999,
                  border: on ? "1px solid var(--cm-primary)" : "1px solid var(--cm-line)",
                  background: on ? "var(--cm-primary-50)" : "#fff",
                  color: on ? "var(--cm-primary-700)" : "var(--cm-text-2)",
                  cursor: "pointer", fontWeight: on ? 600 : 400,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* 동의 */}
      <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--cm-line)" }}>
        <label style={agreeLabel}>
          <input type="checkbox" name="terms" required style={{ marginTop: 2 }} />
          <span>{L.terms}</span>
        </label>
        <label style={{ ...agreeLabel, marginTop: 8 }}>
          <input type="checkbox" name="marketing" style={{ marginTop: 2 }} />
          <span style={{ color: "var(--cm-text-2)" }}>{L.marketing}</span>
        </label>
      </div>

      <button
        type="submit" disabled={submitting}
        style={{
          background: "var(--cm-primary)", color: "#fff",
          border: "none", borderRadius: 10, padding: "14px 18px",
          fontSize: 15, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1, marginTop: 8,
        }}
      >
        {submitting ? L.submitting : L.submit}
      </button>
      {error && <div style={{ color: "var(--cm-red, #d33)", fontSize: 13 }}>{error}</div>}

      <a href={`/${locale}/login${next !== "/me" ? `?next=${encodeURIComponent(next)}` : ""}`} style={{
        textAlign: "center", fontSize: 13, color: "var(--cm-text-2)",
        textDecoration: "underline", padding: 6, marginTop: 4,
      }}>
        {L.goLogin}
      </a>
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
const hintStyle: React.CSSProperties = {
  fontSize: 11.5, color: "var(--cm-text-3)", margin: "6px 0 0",
};
const agreeLabel: React.CSSProperties = {
  display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5,
  alignItems: "flex-start", cursor: "pointer",
};
