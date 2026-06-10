"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 숫자 카운트업 애니메이션 — 스크롤 진입 시 0→target.
 * 시각적 흥미 유발 + 체류시간↑. prefers-reduced-motion 존중.
 */
export function StatCounter({
  target,
  label,
  suffix = "",
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVal(target); return; }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !done.current) {
            done.current = true;
            const duration = 1200;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(target * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{
        fontSize: "clamp(28px, 5vw, 42px)",
        fontWeight: 800,
        color: "var(--cm-primary)",
        lineHeight: 1.1,
        fontVariantNumeric: "tabular-nums",
        fontFamily: "var(--cm-font-display)",
      }}>
        {val.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 13.5, color: "var(--cm-text-2)", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
