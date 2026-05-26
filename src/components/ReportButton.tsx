"use client";
import { useState } from "react";
import { pick4 } from "@/lib/i18n-dict";

type Props = {
  kind: "post" | "comment" | "review";
  targetId: number;
  locale: string;
};

/** 신고 버튼 — 가벼운 confirm + reason 선택 */
export function ReportButton({ kind, targetId, locale }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const L = {
    btn: pick4(locale, "신고", "Report", "通報", "举报"),
    title: pick4(locale, "신고 사유", "Report reason", "通報理由", "举报原因"),
    spam: pick4(locale, "스팸·광고", "Spam / Ad", "スパム・広告", "垃圾·广告"),
    abuse: pick4(locale, "욕설·비방", "Abuse", "誹謗中傷", "辱骂·诽谤"),
    fake: pick4(locale, "허위·과장", "False / exaggerated", "虚偽・誇張", "虚假·夸大"),
    illegal: pick4(locale, "의료법 위반 (광고성·가격)", "Medical-ad violation", "医療法違反(広告性)", "医疗法违规"),
    other: pick4(locale, "기타", "Other", "その他", "其他"),
    cancel: pick4(locale, "취소", "Cancel", "キャンセル", "取消"),
    submit: pick4(locale, "신고 제출", "Submit", "通報", "提交"),
    done: pick4(locale, "신고가 접수되었습니다.", "Report received.", "通報を受け付けました。", "已收到您的举报。"),
  };

  const submit = async (reason: string) => {
    setSubmitting(true);
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, target_id: targetId, reason }),
      });
      setDone(true);
      setTimeout(() => setOpen(false), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setDone(false); }}
        style={{
          background: "transparent", border: "none",
          color: "var(--cm-text-3)", fontSize: 11,
          cursor: "pointer", padding: "2px 4px",
        }}
      >
        ⚐ {L.btn}
      </button>
      {open && (
        <div
          role="presentation"
          onClick={() => !submitting && setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(15,23,42,.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog" aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 12, padding: 20 }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>{L.title}</h3>
            {done ? (
              <p style={{ fontSize: 13.5, color: "var(--cm-primary-700)", padding: "12px 0" }}>✓ {L.done}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { key: "spam", label: L.spam },
                  { key: "abuse", label: L.abuse },
                  { key: "fake", label: L.fake },
                  { key: "illegal", label: L.illegal },
                  { key: "other", label: L.other },
                ].map((r) => (
                  <button
                    key={r.key} type="button"
                    onClick={() => submit(r.key)}
                    disabled={submitting}
                    style={{
                      padding: "10px 12px", textAlign: "left",
                      background: "transparent", border: "1px solid var(--cm-line)",
                      borderRadius: 8, fontSize: 13.5, cursor: "pointer",
                      color: "var(--cm-ink)",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  type="button" onClick={() => setOpen(false)}
                  style={{
                    marginTop: 8, padding: "8px 12px",
                    background: "transparent", border: "none",
                    color: "var(--cm-text-2)", fontSize: 13, cursor: "pointer",
                  }}
                >{L.cancel}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
