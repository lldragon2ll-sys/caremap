import { Icon } from "./Icon";

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="stars" style={{ display: "inline-flex", gap: 1, color: "var(--cm-yellow)" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ opacity: i < filled ? 1 : 0.22 }}>
          <Icon name="star" size={size} color="currentColor" />
        </span>
      ))}
    </span>
  );
}
