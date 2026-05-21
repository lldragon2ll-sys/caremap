export function Skeleton({
  width = "100%",
  height = 16,
  radius = 6,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width, height, borderRadius: radius,
        background: "linear-gradient(90deg, var(--cm-line) 0%, #f3f4f6 40%, var(--cm-line) 80%)",
        backgroundSize: "200% 100%",
        animation: "cm-skeleton 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function HospitalRowSkeleton() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "32px 80px 1fr",
      gap: 16, padding: "16px 18px", borderBottom: "1px solid var(--cm-line)",
      alignItems: "center",
    }}>
      <Skeleton width={20} height={20} radius={4} />
      <Skeleton width={64} height={64} radius={12} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width={120} height={14} />
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={12} />
      </div>
    </div>
  );
}

export function HospitalCardSkeleton() {
  return (
    <div className="cm-hcard" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton height={120} radius={10} />
      <Skeleton width="70%" height={16} />
      <Skeleton width="50%" height={12} />
      <Skeleton width="40%" height={12} />
    </div>
  );
}
