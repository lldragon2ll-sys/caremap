type Kind = "sponsored" | "verified" | "new" | "kind";

export function Badge({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  return <span className={`cm-badge ${kind}`}>{children}</span>;
}
