"use client";
import { useState } from "react";
import { pick4 } from "@/lib/i18n-dict";

type Props = {
  hospitalId: number;
  hospitalSlug: string;
  hospitalName: string;
  locale: string;
};

export function ReviewForm({ hospitalId, hospitalSlug, hospitalName, locale }: Props) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"ok" | "hold" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const L = {
    title: pick4(locale, "후기 작성", "Write a review", "レビューを書く", "撰写评论"),
    ratingLabel: pick4(locale, "별점", "Rating", "評価", "评分"),
    contentLabel: pick4(locale,
      "후기 (20자 이상)",
      "Content (20 chars min)",
      "本文(20文字以上)",
      "内容(至少20字)",
    ),
    placeholder: pick4(locale,
      "예약·접수·진료실 분위기·의료진 응대·결과 등 솔직한 경험을 공유해주세요. 가격·치료 효과 보장·광고성 내용은 게재되지 않습니다.",
      "Share your honest experience — booking, atmosphere, staff, outcome. Pricing, guaranteed effects, and promotional content will be hidden.",
      "予約・受付・診療室の雰囲気・医療スタッフの対応・結果など、率直なご経験をお書きください。価格・効果保証・広告性内容は非表示。",
      "请分享您的真实体验:预约·接待·诊室氛围·医务人员·结果等。价格、效果保证、广告性内容将被隐藏。",
    ),
    submit: pick4(locale, "후기 등록", "Submit review", "投稿する", "提交评论"),
    submitting: pick4(locale, "전송 중…", "Submitting…", "送信中…", "提交中…"),
    ok: pick4(locale, "후기가 등록되었습니다.", "Your review was posted.", "レビューを投稿しました。", "您的评论已发布。"),
    hold: pick4(locale,
      "검토 후 게재됩니다. 광고성으로 보이는 표현이 포함되어 자동 보류 상태로 저장되었습니다.",
      "Your review is under review — some content may look promotional and is on hold for moderation.",
      "審査後に掲載されます。広告性とみなされる表現があり自動保留状態です。",
      "您的评论需审核。可能含广告性表述,已自动暂停发布。",
    ),
    tooShort: pick4(locale, "20자 이상 입력", "Min 20 chars", "20文字以上", "至少20字"),
    failed: pick4(locale, "전송 실패", "Failed", "失敗", "失败"),
    already: pick4(locale, "이미 후기를 작성하셨습니다.", "You've already reviewed.", "既に投稿済み。", "已发表过评论。"),
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (content.trim().length < 20) { setError(L.tooShort); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hospital_id: hospitalId,
          hospital_slug: hospitalSlug,
          hospital_name: hospitalName,
          rating, content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "already_reviewed") setError(L.already);
        else setError(L.failed);
        return;
      }
      setDone(data.flagged ? "hold" : "ok");
      // 1초 후 자동 새로고침으로 목록 반영
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setError(L.failed);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{
        padding: "14px 16px", borderRadius: 10,
        background: done === "ok" ? "var(--cm-primary-50)" : "#fef3c7",
        color: done === "ok" ? "var(--cm-primary-700)" : "#92400e",
        fontSize: 13.5, lineHeight: 1.55,
      }}>
        ✓ {done === "ok" ? L.ok : L.hold}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 16, border: "1px solid var(--cm-line)", borderRadius: 10, background: "#fff" }}>
      <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>{L.title}</h4>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)", marginBottom: 6 }}>{L.ratingLabel}</div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
              style={{
                background: "transparent", border: "none",
                fontSize: 26, cursor: "pointer", padding: "0 2px",
                color: n <= rating ? "#f59e0b" : "var(--cm-line)",
                lineHeight: 1,
              }}
            >★</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)", display: "block", marginBottom: 6 }}>
          {L.contentLabel}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={5}
          required
          placeholder={L.placeholder}
          style={{
            width: "100%", padding: "10px 12px", fontSize: 14,
            border: "1px solid var(--cm-line)", borderRadius: 8,
            fontFamily: "inherit", resize: "vertical", lineHeight: 1.55,
          }}
        />
        <div style={{ fontSize: 11, color: "var(--cm-text-3)", textAlign: "right", marginTop: 4 }}>
          {content.length} / 2000
        </div>
      </div>
      {error && <p style={{ fontSize: 13, color: "var(--cm-red, #d33)", margin: "0 0 8px" }}>{error}</p>}
      <button
        type="submit" disabled={submitting}
        style={{
          background: "var(--cm-primary)", color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 18px",
          fontSize: 13.5, fontWeight: 600, cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? L.submitting : L.submit}
      </button>
    </form>
  );
}
