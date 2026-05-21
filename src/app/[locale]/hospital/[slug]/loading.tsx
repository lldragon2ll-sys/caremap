import { Skeleton } from "@/components/Skeleton";

export default function HospitalDetailLoading() {
  return (
    <div className="cm-detail" style={{ padding: 24 }}>
      <div>
        <Skeleton height={220} radius={12} style={{ display: "block", marginBottom: 18 }} />
        <Skeleton width="40%" height={28} style={{ display: "block", marginBottom: 12 }} />
        <Skeleton width="60%" height={16} style={{ display: "block", marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={70} radius={10} style={{ display: "block" }} />
          ))}
        </div>
        <Skeleton height={120} radius={10} style={{ display: "block", marginBottom: 18 }} />
        <Skeleton height={120} radius={10} style={{ display: "block" }} />
      </div>
      <aside>
        <Skeleton height={200} radius={10} style={{ display: "block", marginBottom: 16 }} />
        <Skeleton height={280} radius={10} style={{ display: "block" }} />
      </aside>
    </div>
  );
}
