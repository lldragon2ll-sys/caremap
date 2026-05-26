"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { pick4 } from "@/lib/i18n-dict";

export function ProfileForm({ locale, initialNickname }: { locale: string; initialNickname: string }) {
  const [nickname, setNickname] = useState(initialNickname);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const L = {
    nick: pick4(locale, "닉네임", "Nickname", "ニックネーム", "昵称"),
    save: pick4(locale, "저장", "Save", "保存", "保存"),
    saving: pick4(locale, "저장 중…", "Saving…", "保存中…", "保存中…"),
    saved: pick4(locale, "저장됨", "Saved", "保存しました", "已保存"),
    hint: pick4(locale,
      "후기·게시글에 표시되는 이름. 본명을 사용하지 마세요.",
      "Shown on your reviews/posts. Avoid real names.",
      "レビュー・投稿に表示される名前。本名は使用しないでください。",
      "用于评论·帖子的显示名。请勿使用真实姓名。",
    ),
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
      const { error: err } = await supabase
        .from("profiles")
        .upsert({ id: user.id, nickname: trimmed, locale });
      if (err) throw err;
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label htmlFor="nickname" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)" }}>
        {L.nick}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => { setNickname(e.target.value); setSaved(false); }}
          maxLength={24}
          minLength={2}
          required
          style={{
            flex: 1,
            border: "1px solid var(--cm-line)", borderRadius: 8,
            padding: "10px 12px", fontSize: 14,
          }}
        />
        <button
          type="submit" disabled={saving}
          style={{
            background: "var(--cm-ink)", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 16px",
            fontSize: 13.5, fontWeight: 600, cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? L.saving : saved ? `✓ ${L.saved}` : L.save}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--cm-text-3)", margin: 0 }}>{L.hint}</p>
      {error && <p style={{ fontSize: 12, color: "var(--cm-red, #d33)", margin: 0 }}>{error}</p>}
    </form>
  );
}
