"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { pick4 } from "@/lib/i18n-dict";

const SIDOS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const INTERESTS = [
  "성형외과", "피부과", "치과", "안과", "한의원", "정신과",
  "정형외과", "재활의학과", "비뇨의학과", "산부인과", "가정의학과",
];

export type ProfileInitial = {
  nickname: string;
  gender: string | null;
  birth_year: number | null;
  region_sido: string | null;
  interests: string[];
  marketing_opt_in: boolean;
};

/**
 * 프로필 편집 폼 — 닉네임 + 통계·추천용 정보 + 마케팅 수신 동의 토글.
 * 컬럼: profiles.user_id (PK). RLS: auth.uid() = user_id.
 */
export function ProfileForm({ locale, initial }: { locale: string; initial: ProfileInitial }) {
  const [nickname, setNickname] = useState(initial.nickname);
  const [gender, setGender] = useState(initial.gender ?? "");
  const [birthYear, setBirthYear] = useState(initial.birth_year ? String(initial.birth_year) : "");
  const [regionSido, setRegionSido] = useState(initial.region_sido ?? "");
  const [interests, setInterests] = useState<string[]>(initial.interests ?? []);
  const [marketingOptIn, setMarketingOptIn] = useState(initial.marketing_opt_in ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const L = {
    nick: pick4(locale, "닉네임", "Nickname", "ニックネーム", "昵称"),
    save: pick4(locale, "저장", "Save", "保存", "保存"),
    saving: pick4(locale, "저장 중…", "Saving…", "保存中…", "保存中…"),
    saved: pick4(locale, "저장됨", "Saved", "保存しました", "已保存"),
    gender: pick4(locale, "성별", "Gender", "性別", "性别"),
    birthYear: pick4(locale, "출생연도", "Birth year", "生年", "出生年份"),
    region: pick4(locale, "거주 지역 (시·도)", "Region (province)", "居住地域", "居住地区"),
    interestsLabel: pick4(locale, "관심 진료과", "Interests", "関心診療科", "兴趣科室"),
    marketing: pick4(locale, "마케팅 정보 수신 동의", "Marketing emails opt-in", "マーケティング情報受信に同意", "同意接收营销信息"),
    hint: pick4(locale,
      "후기·게시글에 표시되는 이름. 본명 사용 금지.",
      "Shown on reviews/posts. Don't use real names.",
      "レビュー・投稿に表示される名前。本名は使用しないでください。",
      "用于评论·帖子,请勿使用真实姓名。",
    ),
  };

  const toggleInterest = (s: string) => {
    setInterests((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    setSaved(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const supabase = getSupabaseBrowser();
      const trimmed = nickname.trim().slice(0, 24);
      if (trimmed.length < 2) {
        setError(pick4(locale, "닉네임은 2자 이상", "Min 2 chars", "2文字以上", "至少2字符"));
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const by = birthYear ? parseInt(birthYear, 10) : null;
      const { error: err } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          nickname: trimmed,
          gender: gender || null,
          birth_year: by && by >= 1920 && by <= 2020 ? by : null,
          region_sido: regionSido || null,
          interests,
          marketing_opt_in: marketingOptIn,
        });
      if (err) throw err;
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label htmlFor="nickname" style={labelStyle}>{L.nick}</label>
        <input
          id="nickname" value={nickname}
          onChange={(e) => { setNickname(e.target.value); setSaved(false); }}
          maxLength={24} minLength={2} required
          style={inputStyle}
        />
        <p style={hintStyle}>{L.hint}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="gender" style={labelStyle}>{L.gender}</label>
          <select id="gender" value={gender} onChange={(e) => { setGender(e.target.value); setSaved(false); }} style={inputStyle}>
            <option value="">—</option>
            <option value="male">{pick4(locale, "남성", "Male", "男性", "男")}</option>
            <option value="female">{pick4(locale, "여성", "Female", "女性", "女")}</option>
            <option value="other">{pick4(locale, "기타", "Other", "その他", "其他")}</option>
            <option value="undisclosed">{pick4(locale, "비공개", "Undisclosed", "回答しない", "不公开")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="birth_year" style={labelStyle}>{L.birthYear}</label>
          <input
            id="birth_year" type="number" min={1920} max={2020}
            value={birthYear}
            onChange={(e) => { setBirthYear(e.target.value); setSaved(false); }}
            placeholder="1990" style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="region_sido" style={labelStyle}>{L.region}</label>
        <select id="region_sido" value={regionSido} onChange={(e) => { setRegionSido(e.target.value); setSaved(false); }} style={inputStyle}>
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

      <label style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "center", cursor: "pointer", padding: "10px 0" }}>
        <input
          type="checkbox" checked={marketingOptIn}
          onChange={(e) => { setMarketingOptIn(e.target.checked); setSaved(false); }}
        />
        <span style={{ color: "var(--cm-text-2)" }}>{L.marketing}</span>
      </label>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          type="submit" disabled={saving}
          style={{
            background: "var(--cm-ink)", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 22px",
            fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? L.saving : saved ? `✓ ${L.saved}` : L.save}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: "var(--cm-red, #d33)", margin: 0 }}>{error}</p>}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--cm-line)", borderRadius: 8,
  padding: "10px 12px", fontSize: 14, width: "100%",
  background: "#fff", color: "var(--cm-ink)",
};
const labelStyle: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)",
  display: "block", marginBottom: 6,
};
const hintStyle: React.CSSProperties = {
  fontSize: 11.5, color: "var(--cm-text-3)", margin: "6px 0 0",
};
