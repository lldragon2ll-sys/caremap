"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

const STORAGE_KEY = "caremap:saved-clinics";

function loadSaved(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

function saveAll(set: Set<string>) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export function SaveButton({
  slug,
  className,
  label = "저장",
  labelSaved = "저장됨",
}: {
  slug: string;
  className?: string;
  label?: string;
  labelSaved?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(loadSaved().has(slug));
  }, [slug]);

  const toggle = () => {
    const set = loadSaved();
    if (set.has(slug)) {
      set.delete(slug);
      setSaved(false);
    } else {
      set.add(slug);
      setSaved(true);
    }
    saveAll(set);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-pressed={saved}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}
    >
      <Icon name="heart" size={14} color={mounted && saved ? "var(--cm-red)" : "currentColor"} />
      <span>{mounted && saved ? labelSaved : label}</span>
    </button>
  );
}
