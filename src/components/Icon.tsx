/* Inline SVG icon set — ported from design_handoff_caremap/shared.jsx */
type Props = {
  name:
    | "search" | "pin" | "star" | "clock" | "phone" | "cal" | "arrow" | "arrow-r"
    | "chev" | "globe" | "heart" | "share" | "check" | "sliders" | "list" | "map"
    | "home" | "user" | "plus" | "minus" | "wifi" | "battery" | "menu" | "shield" | "sparkle";
  size?: number;
  color?: string;
  stroke?: number;
};

export function Icon({ name, size = 16, color = "currentColor", stroke = 1.7 }: Props) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none" as const, stroke: color, strokeWidth: stroke,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "search":  return (<svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case "pin":     return (<svg {...p}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>);
    case "star":    return (<svg {...p} fill="currentColor" stroke="none"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"/></svg>);
    case "clock":   return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "phone":   return (<svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>);
    case "cal":     return (<svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>);
    case "arrow":   return (<svg {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
    case "arrow-r": return (<svg {...p}><path d="M9 6l6 6-6 6"/></svg>);
    case "chev":    return (<svg {...p}><path d="M6 9l6 6 6-6"/></svg>);
    case "globe":   return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case "heart":   return (<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>);
    case "share":   return (<svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5"/></svg>);
    case "check":   return (<svg {...p}><path d="M20 6 9 17l-5-5"/></svg>);
    case "sliders": return (<svg {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>);
    case "list":    return (<svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/></svg>);
    case "map":     return (<svg {...p}><path d="M3 6v15l6-3 6 3 6-3V3l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></svg>);
    case "home":    return (<svg {...p}><path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/></svg>);
    case "user":    return (<svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>);
    case "plus":    return (<svg {...p}><path d="M12 5v14M5 12h14"/></svg>);
    case "minus":   return (<svg {...p}><path d="M5 12h14"/></svg>);
    case "wifi":    return (<svg {...p}><path d="M5 12.55a11 11 0 0 1 14 0M8.5 16.42a6 6 0 0 1 7 0M12 20h.01"/></svg>);
    case "battery": return (<svg {...p}><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/><rect x="4" y="9" width="13" height="6" fill="currentColor"/></svg>);
    case "menu":    return (<svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
    case "shield":  return (<svg {...p}><path d="M12 2 4 5v7c0 5 4 9 8 10 4-1 8-5 8-10V5z"/><path d="m9 12 2 2 4-4"/></svg>);
    case "sparkle": return (<svg {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>);
    default: return null;
  }
}
