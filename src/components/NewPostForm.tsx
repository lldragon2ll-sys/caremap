"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { pick4 } from "@/lib/i18n-dict";
import { COMMUNITY_CATEGORIES, categoryLabel } from "@/lib/community";

export function NewPostForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [category, setCategory] = useState<string>("question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const L = {
    cat: pick4(locale, "카테고리", "Category", "カテゴリ", "类别"),
    title: pick4(locale, "제목 (4자 이상)", "Title (4 chars min)", "タイトル(4文字以上)", "标题(至少4字)"),
    content: pick4(locale, "내용 (20자 이상)", "Content (20 chars min)", "本文(20文字以上)", "内容(至少20字)"),
    submit: pick4(locale, "게시", "Publish", "投稿", "发布"),
    submitting: pick4(locale, "전송 중…", "Submitting…", "送信中…", "提交中…"),
    failed: pick4(locale, "전송 실패", "Failed", "失敗", "失败"),
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 4) { setError(L.failed); return; }
    if (content.trim().length < 20) { setError(L.failed); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, content, category, locale }),
      });
      const data = await res.json();
      if (!res.ok) { setError(L.failed); return; }
      // 작성 성공 → 상세 페이지로
      router.push(`/community/${data.post_id}`);
    } catch {
      setError(L.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>{L.cat}</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ ...inputStyle, padding: "12px 14px" }}
        >
          {COMMUNITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabel(c, locale)}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>{L.title}</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          minLength={4}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>{L.content}</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={10_000}
          rows={12}
          required
          style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical", lineHeight: 1.55 }}
        />
        <div style={{ fontSize: 11, color: "var(--cm-text-3)", textAlign: "right" }}>
          {content.length} / 10000
        </div>
      </div>
      {error && <p style={{ fontSize: 13, color: "var(--cm-red, #d33)" }}>{error}</p>}
      <button
        type="submit" disabled={submitting}
        style={{
          alignSelf: "flex-start",
          background: "var(--cm-primary)", color: "#fff", border: "none",
          borderRadius: 10, padding: "12px 22px",
          fontSize: 14, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? L.submitting : L.submit}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", fontSize: 14.5,
  border: "1px solid var(--cm-line)", borderRadius: 10,
};
const labelStyle: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)",
  display: "block", marginBottom: 6,
};
