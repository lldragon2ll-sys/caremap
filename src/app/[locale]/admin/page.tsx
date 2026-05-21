import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getTopSearches, getTopViewedHospitals } from "@/lib/db";

type Params = Promise<{ locale: string }>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · CAREMAP",
  robots: { index: false, follow: false },
};

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";

async function isAuthorized(): Promise<boolean> {
  if (!ADMIN_TOKEN) return false;
  const c = await cookies();
  const cookieToken = c.get("admin_token")?.value;
  if (cookieToken === ADMIN_TOKEN) return true;
  const h = await headers();
  const headerToken = h.get("x-admin-token");
  return headerToken === ADMIN_TOKEN;
}

async function getRegistrations(): Promise<Array<{
  id: number; clinic_name: string; contact_name: string; email: string;
  type: string; created_at: string; status: string; message: string;
}>> {
  try {
    const { data } = await supabase
      .from("clinic_registrations")
      .select("id, clinic_name, contact_name, email, type, created_at, status, message")
      .order("created_at", { ascending: false })
      .limit(30);
    return (data ?? []) as Array<{
      id: number; clinic_name: string; contact_name: string; email: string;
      type: string; created_at: string; status: string; message: string;
    }>;
  } catch {
    return [];
  }
}

export default async function AdminPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!await isAuthorized()) {
    return <AdminLogin />;
  }

  const [topSearches, topViewed, registrations] = await Promise.all([
    getTopSearches(20),
    getTopViewedHospitals(20),
    getRegistrations(),
  ]);

  const totalSearches = topSearches.reduce((a, b) => a + b.cnt, 0);
  const totalViews = topViewed.length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          CAREMAP Admin
        </h1>
        <p style={{ fontSize: 13, color: "var(--cm-text-2)", margin: "6px 0 0" }}>
          Last 7 days · stats from search_logs + hospital_views
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        <StatCard label="Top Search Queries" value={topSearches.length.toString()} />
        <StatCard label="Total Search Volume" value={totalSearches.toLocaleString()} />
        <StatCard label="Top Viewed Hospitals" value={totalViews.toLocaleString()} />
      </div>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Search Volume</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Query</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Count</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Share</th>
            </tr>
          </thead>
          <tbody>
            {topSearches.map((s, i) => (
              <tr key={i}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={tdStyle}>{s.query}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.cnt.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: "right", color: "var(--cm-text-2)" }}>
                  {totalSearches > 0 ? `${((s.cnt / totalSearches) * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
            {topSearches.length === 0 && (
              <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "var(--cm-text-2)" }}>No data</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Top Viewed Hospitals</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Hospital</th>
              <th style={thStyle}>Region</th>
              <th style={thStyle}>Kind</th>
            </tr>
          </thead>
          <tbody>
            {topViewed.map((h, i) => (
              <tr key={h.id}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={tdStyle}>{h.yadm_nm}</td>
                <td style={tdStyle}>{[h.sido_cd_nm, h.sggu_cd_nm].filter(Boolean).join(" ")}</td>
                <td style={tdStyle}>{h.cl_cd_nm ?? "—"}</td>
              </tr>
            ))}
            {topViewed.length === 0 && (
              <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "var(--cm-text-2)" }}>No data</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Recent Registrations</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>When</th>
              <th style={thStyle}>Clinic</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Message (excerpt)</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>{new Date(r.created_at).toLocaleString("ko-KR")}</td>
                <td style={tdStyle}>{r.clinic_name}</td>
                <td style={tdStyle}>{r.contact_name}<br /><span style={{ color: "var(--cm-text-2)", fontSize: 12 }}>{r.email}</span></td>
                <td style={tdStyle}>{r.type}</td>
                <td style={tdStyle}>{r.status}</td>
                <td style={{ ...tdStyle, maxWidth: 320 }}>
                  {r.message.length > 80 ? r.message.slice(0, 80) + "…" : r.message}
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "var(--cm-text-2)" }}>No registrations yet</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      border: "1px solid var(--cm-line)", borderRadius: 12, padding: "16px 18px",
      background: "#fff",
    }}>
      <div style={{ fontSize: 12, color: "var(--cm-text-2)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse",
  background: "#fff", border: "1px solid var(--cm-line)",
  borderRadius: 8, overflow: "hidden", fontSize: 13.5,
};
const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "10px 12px",
  background: "var(--cm-primary-50, #f7f8fa)",
  borderBottom: "1px solid var(--cm-line)",
  fontWeight: 600, color: "var(--cm-text-2)",
  fontSize: 12, letterSpacing: "0.03em", textTransform: "uppercase",
};
const tdStyle: React.CSSProperties = {
  padding: "10px 12px", borderBottom: "1px solid var(--cm-line)",
  color: "var(--cm-ink)", verticalAlign: "top",
};

function AdminLogin() {
  return (
    <div style={{ maxWidth: 400, margin: "120px auto", padding: 24, textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Admin Login
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--cm-text-2)", marginBottom: 18, lineHeight: 1.6 }}>
        관리자 토큰이 필요합니다. <code>ADMIN_TOKEN</code> 환경 변수 값을 쿠키 <code>admin_token</code>으로 설정하세요.
      </p>
      <form action="/api/admin-login" method="post" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          name="token" type="password" required placeholder="Admin token"
          style={{
            border: "1px solid var(--cm-line)", borderRadius: 8,
            padding: "10px 12px", fontSize: 14,
          }}
        />
        <button type="submit" style={{
          background: "var(--cm-primary)", color: "#fff",
          border: "none", borderRadius: 8, padding: "10px 16px",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          Sign in
        </button>
      </form>
    </div>
  );
}
