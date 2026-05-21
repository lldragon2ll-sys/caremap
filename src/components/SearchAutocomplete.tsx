"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";

type Suggest = { type: "specialty" | "region" | "hospital"; label: string; value: string; sub?: string };

const ICON: Record<Suggest["type"], string> = {
  specialty: "🏥",
  region: "📍",
  hospital: "🩺",
};

export function SearchAutocomplete({
  locale,
  placeholder,
  defaultValue = "",
  name = "q",
  id,
  className,
  inputStyle,
}: {
  locale: string;
  placeholder?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  className?: string;
  inputStyle?: React.CSSProperties;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<Suggest[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // 초기 mount 시 defaultValue로 인해 dropdown이 자동으로 열리지 않도록
  const userInteracted = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!value.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }
    // 사용자가 직접 타이핑하기 전까지는 자동완성을 fetch하지 않음
    if (!userInteracted.current) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        const res = await fetch(
          `/api/suggest?q=${encodeURIComponent(value)}&locale=${locale}`,
          { signal: abortRef.current.signal },
        );
        const data = await res.json();
        setItems(data.results ?? []);
        setOpen((data.results ?? []).length > 0);
        setHighlight(-1);
      } catch {
        // aborted / network — silent
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [value, locale]);

  const submit = (chosen?: Suggest) => {
    const target = chosen ?? items[highlight] ?? null;
    const q = target ? target.value : value.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <input
        id={id}
        name={name}
        type="search"
        autoComplete="off"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { userInteracted.current = true; setValue(e.target.value); }}
        onFocus={() => items.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, items.length - 1));
            setOpen(true);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, -1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        style={inputStyle}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="cm-suggest-list"
      />
      {open && (
        <ul
          id="cm-suggest-list"
          role="listbox"
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "#fff", border: "1px solid var(--cm-line)", borderRadius: 10,
            boxShadow: "var(--cm-shadow)", padding: 4, margin: 0, listStyle: "none",
            zIndex: 50, maxHeight: 360, overflowY: "auto",
          }}
        >
          {loading && items.length === 0 && (
            <li style={{ padding: "10px 12px", fontSize: 12, color: "var(--cm-text-2)" }}>…</li>
          )}
          {items.map((s, i) => (
            <li key={`${s.type}-${s.value}-${i}`} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => submit(s)}
                style={{
                  width: "100%", textAlign: "left", border: "none",
                  background: i === highlight ? "var(--cm-primary-50)" : "transparent",
                  padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{ fontSize: 14 }} aria-hidden>{ICON[s.type]}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "var(--cm-ink)" }}>
                    {s.label}
                  </span>
                  {s.sub && (
                    <span style={{ display: "block", fontSize: 11.5, color: "var(--cm-text-2)" }}>
                      {s.sub}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
