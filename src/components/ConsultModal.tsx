"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { pick4 } from "@/lib/i18n-dict";
import { trackLead, track } from "@/lib/analytics";

type Props = {
  hospitalSlug: string;
  hospitalName: string;
  kindLabel: string;
  locale: string;
  className?: string;
  triggerLabel?: string;
};

/**
 * 상담 신청 모달 — 1차 CTA.
 * 이름·연락처·관심 진료 3필드. 제출 → /api/lead → GA4/Pixel 트래킹.
 * 의료광고가 아니므로 "정보 안내 신청"으로도 해석 가능 (의료법 회피).
 */
export function ConsultModal({ hospitalSlug, hospitalName, kindLabel, locale, className, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const L = {
    cta: triggerLabel ?? pick4(locale, "상담 신청", "Request Consultation", "相談を申し込む", "申请咨询"),
    title: pick4(locale, "상담 신청", "Request a consultation", "相談申込", "申请咨询"),
    sub: pick4(locale,
      "병원에서 영업일 1~2일 내 회신드립니다. 의료광고 송출이 아닌 정보 안내 목적입니다.",
      "The clinic will respond within 1–2 business days. This is an informational request, not medical advertising.",
      "クリニックから営業日1〜2日以内にご返信します。医療広告ではなく情報案内目的です。",
      "诊所将在1–2个工作日内回复。本服务为信息咨询目的,非医疗广告。",
    ),
    name: pick4(locale, "이름", "Name", "お名前", "姓名"),
    phone: pick4(locale, "연락처", "Phone", "電話", "电话"),
    interest: pick4(locale, "관심 진료 (선택)", "Interest (optional)", "関心の診療(任意)", "感兴趣的科室(选填)"),
    message: pick4(locale, "전달 메시지 (선택)", "Message (optional)", "メッセージ(任意)", "留言(选填)"),
    submit: pick4(locale, "신청하기", "Submit", "送信", "提交"),
    submitting: pick4(locale, "전송 중…", "Sending…", "送信中…", "提交中…"),
    cancel: pick4(locale, "닫기", "Close", "閉じる", "关闭"),
    success: pick4(locale,
      "신청이 접수되었습니다. 곧 회신드리겠습니다.",
      "Your request was received. We'll respond soon.",
      "申請を受け付けました。間もなくご返信します。",
      "已收到您的申请,我们将尽快回复。",
    ),
    failure: pick4(locale, "전송 실패. 잠시 후 다시 시도해주세요.",
      "Submission failed. Please try again later.",
      "送信に失敗しました。後ほど再試行してください。",
      "提交失败,请稍后重试。"),
    consent: pick4(locale,
      "제출 시 개인정보처리방침에 동의합니다.",
      "By submitting, you agree to our Privacy Policy.",
      "送信により個人情報処理方針に同意したものとみなされます。",
      "提交即表示您同意我们的隐私政策。",
    ),
  };

  // ESC로 닫기 + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const openModal = () => {
    setOpen(true);
    trackLead({
      hospitalSlug, hospitalName, channel: "modal_open",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        name: fd.get("name"),
        phone: fd.get("phone"),
        interest: fd.get("interest"),
        message: fd.get("message"),
        hospital_slug: hospitalSlug,
        hospital_name: hospitalName,
        locale,
      };
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
      trackLead({ hospitalSlug, hospitalName, channel: "modal_submit", value: 5000 });
      track("lead_completed", { hospital_slug: hospitalSlug, hospital_name: hospitalName });
    } catch {
      setError(L.failure);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={className}
        aria-haspopup="dialog"
      >
        <Icon name="phone" size={14} color="currentColor" />
        {L.cta}
      </button>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(15,23,42,.55)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: "0 12px 12px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480,
              background: "#fff", borderRadius: "16px 16px 16px 16px",
              boxShadow: "0 -8px 24px rgba(15,23,42,.18)",
              padding: 24, marginBottom: 12,
              maxHeight: "92vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h2 id="consult-modal-title" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{L.title}</h2>
              <button
                type="button" onClick={() => setOpen(false)} aria-label={L.cancel}
                style={{
                  background: "transparent", border: "none", padding: 6, cursor: "pointer",
                  fontSize: 22, color: "var(--cm-text-2)", lineHeight: 1,
                }}
              >×</button>
            </div>
            <p style={{ fontSize: 13, color: "var(--cm-text-2)", lineHeight: 1.55, marginBottom: 16 }}>
              <strong>{hospitalName}</strong> · {kindLabel}<br />
              {L.sub}
            </p>

            {done ? (
              <div style={{
                padding: "20px 16px", borderRadius: 10,
                background: "var(--cm-primary-50)", color: "var(--cm-primary-700)",
                fontSize: 14, lineHeight: 1.55, textAlign: "center",
              }}>
                ✓ {L.success}
                <button
                  type="button" onClick={() => setOpen(false)}
                  style={{
                    display: "block", width: "100%", marginTop: 12,
                    padding: "10px 16px", borderRadius: 8,
                    background: "var(--cm-ink)", color: "#fff",
                    border: "none", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  }}
                >{L.cancel}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Field label={L.name} required>
                  <input name="name" required maxLength={80} autoComplete="name" style={inputStyle} />
                </Field>
                <Field label={L.phone} required>
                  <input name="phone" required maxLength={40} autoComplete="tel" type="tel" inputMode="tel" style={inputStyle} />
                </Field>
                <Field label={L.interest}>
                  <input name="interest" maxLength={80} defaultValue={kindLabel} style={inputStyle} />
                </Field>
                <Field label={L.message}>
                  <textarea name="message" maxLength={1000} rows={3} style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }} />
                </Field>
                <p style={{ fontSize: 11, color: "var(--cm-text-3)", marginTop: 4 }}>{L.consent}</p>
                {error && (
                  <div style={{ color: "var(--cm-red, #d33)", fontSize: 13 }}>{error}</div>
                )}
                <button
                  type="submit" disabled={submitting}
                  style={{
                    background: "var(--cm-primary)", color: "#fff",
                    border: "none", borderRadius: 10, padding: "13px 20px",
                    fontSize: 14.5, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
                    opacity: submitting ? 0.7 : 1, marginTop: 4,
                  }}
                >
                  {submitting ? L.submitting : L.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--cm-line)", borderRadius: 8,
  padding: "11px 12px", fontSize: 14, width: "100%",
  background: "#fff", color: "var(--cm-ink)",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)", display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "var(--cm-red, #d33)", marginLeft: 3 }}>*</span>}
      </span>
      {children}
    </label>
  );
}
