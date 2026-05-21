import { HospitalRowSkeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="cm-split no-map">
      <div className="results">
        <div className="results-head">
          <div className="crumbs">…</div>
          <h1 style={{ height: 28, width: 200, background: "var(--cm-line)", borderRadius: 6 }} />
          <div className="count">…</div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => <HospitalRowSkeleton key={i} />)}
      </div>
    </div>
  );
}
