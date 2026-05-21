"use client";
import { useState } from "react";
import { pick4 } from "@/lib/i18n-dict";

export function RegisterForm({ locale }: { locale: "ko" | "en" | "ja" | "zh" }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const L = {
    clinicName: pick4(locale, "병원명", "Clinic Name", "クリニック名", "诊所名称"),
    contactName: pick4(locale, "담당자명", "Contact Name", "ご担当者名", "联系人姓名"),
    email: pick4(locale, "이메일", "Email", "メール", "邮箱"),
    phone: pick4(locale, "전화번호", "Phone", "電話", "电话"),
    type: pick4(locale, "신청 유형", "Request Type", "申請区分", "申请类型"),
    typeNew: pick4(locale, "신규 등록", "New Listing", "新規登録", "新增登记"),
    typeCorrect: pick4(locale, "정보 정정", "Correct Info", "情報訂正", "更正信息"),
    typeAd: pick4(locale, "광고/제휴", "Advertising/Partnership", "広告・提携", "广告/合作"),
    message: pick4(locale, "내용", "Message", "メッセージ", "内容"),
    submit: pick4(locale, "신청하기", "Submit", "送信", "提交"),
    submitting: pick4(locale, "전송 중…", "Sending…", "送信中…", "提交中…"),
    success: pick4(locale, "신청이 접수되었습니다. 영업일 3~5일 내 회신드립니다.",
      "Your request has been received. We'll reply within 3–5 business days.",
      "申請を受け付けました。営業日3〜5日以内にご返信します。",
      "申请已收到。我们将在3–5个工作日内回复。"),
    failure: pick4(locale, "전송 실패. 잠시 후 다시 시도해주세요.",
      "Submission failed. Please try again later.",
      "送信に失敗しました。後ほど再試行してください。",
      "提交失败,请稍后重试。"),
    required: pick4(locale, "(필수)", "(required)", "(必須)", "(必填)"),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clinic_name: fd.get("clinic_name"),
          contact_name: fd.get("contact_name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          type: fd.get("type"),
          message: fd.get("message"),
          locale,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      setError(L.failure);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{
        background: "var(--cm-primary-50)", border: "1px solid var(--cm-primary)",
        borderRadius: 12, padding: 24, color: "var(--cm-primary-700)",
        fontSize: 14.5, lineHeight: 1.6,
      }}>
        ✓ {L.success}
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    border: "1px solid var(--cm-line)", borderRadius: 8,
    padding: "10px 12px", fontSize: 14, width: "100%",
    background: "#fff", color: "var(--cm-ink)",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12.5, fontWeight: 600, color: "var(--cm-text-2)",
    display: "block", marginBottom: 6, letterSpacing: "0.02em",
  };
  const reqStyle: React.CSSProperties = { color: "var(--cm-red, #d33)", marginLeft: 4 };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>{L.clinicName}<span style={reqStyle}>*</span></label>
        <input name="clinic_name" required maxLength={120} style={fieldStyle} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>{L.contactName}<span style={reqStyle}>*</span></label>
          <input name="contact_name" required maxLength={80} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>{L.phone}</label>
          <input name="phone" maxLength={40} style={fieldStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>{L.email}<span style={reqStyle}>*</span></label>
        <input name="email" type="email" required maxLength={120} style={fieldStyle} />
      </div>
      <div>
        <label style={labelStyle}>{L.type}<span style={reqStyle}>*</span></label>
        <select name="type" required style={fieldStyle} defaultValue="correct">
          <option value="new">{L.typeNew}</option>
          <option value="correct">{L.typeCorrect}</option>
          <option value="ad">{L.typeAd}</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>{L.message}<span style={reqStyle}>*</span></label>
        <textarea name="message" required maxLength={2000} rows={6}
          style={{ ...fieldStyle, fontFamily: "inherit", resize: "vertical" }} />
      </div>
      {error && (
        <div style={{ color: "var(--cm-red, #d33)", fontSize: 13 }}>{error}</div>
      )}
      <button
        type="submit" disabled={submitting}
        style={{
          alignSelf: "flex-start",
          background: "var(--cm-primary)", color: "#fff",
          border: "none", borderRadius: 8, padding: "12px 24px",
          fontSize: 14, fontWeight: 600, cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? L.submitting : L.submit}
      </button>
    </form>
  );
}
