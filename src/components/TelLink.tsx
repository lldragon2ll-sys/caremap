"use client";
import { trackLead } from "@/lib/analytics";

type Props = {
  tel: string;
  hospitalSlug?: string;
  hospitalName?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

/**
 * 전화 클릭 트래킹 wrapper.
 * tel: 링크와 동일 동작이지만 GA4/Pixel에 lead_phone 이벤트 발화.
 */
export function TelLink({ tel, hospitalSlug, hospitalName, className, children, ariaLabel }: Props) {
  const onClick = () => {
    trackLead({ hospitalSlug, hospitalName, channel: "phone", value: 1000 });
  };
  return (
    <a href={`tel:${tel}`} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
