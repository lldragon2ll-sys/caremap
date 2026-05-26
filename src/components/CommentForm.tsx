"use client";
import { useState } from "react";
import { pick4 } from "@/lib/i18n-dict";

export function CommentForm({ postId, locale }: { postId: number; locale: string }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (content.trim().length < 2) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/comment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ post_id: postId, content }),
      });
      if (!res.ok) {
        setError(pick4(locale, "전송 실패", "Failed", "失敗", "失败"));
        return;
      }
      setContent("");
      window.location.reload();
    } catch {
      setError(pick4(locale, "전송 실패", "Failed", "失敗", "失败"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={pick4(locale, "댓글을 입력하세요", "Write a comment", "コメントを書く", "撰写评论")}
        maxLength={2000}
        rows={3}
        required
        style={{
          width: "100%", padding: "10px 12px", fontSize: 14,
          border: "1px solid var(--cm-line)", borderRadius: 8,
          fontFamily: "inherit", resize: "vertical", lineHeight: 1.55,
        }}
      />
      {error && <p style={{ fontSize: 12, color: "var(--cm-red, #d33)", margin: 0 }}>{error}</p>}
      <button
        type="submit" disabled={submitting}
        style={{
          alignSelf: "flex-end",
          background: "var(--cm-primary)", color: "#fff", border: "none",
          borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
          cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting
          ? pick4(locale, "전송 중…", "Sending…", "送信中…", "提交中…")
          : pick4(locale, "댓글 작성", "Comment", "コメント", "评论")}
      </button>
    </form>
  );
}
