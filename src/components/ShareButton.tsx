"use client";
import { useState } from "react";
import { Icon } from "./Icon";

export function ShareButton({
  url,
  title,
  text,
  className,
  label = "공유",
  labelCopied = "복사됨",
}: {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  label?: string;
  labelCopied?: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({ url, title, text });
        return;
      } catch {
        // 사용자가 취소했거나 실패 — fallback으로 clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={share}
      className={className}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}
    >
      <Icon name="share" size={14} />
      <span>{copied ? labelCopied : label}</span>
    </button>
  );
}
