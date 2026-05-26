import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildPageMeta } from "@/lib/seo";
import { pick4 } from "@/lib/i18n-dict";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase-server";
import { COMMUNITY_CATEGORIES, categoryLabel } from "@/lib/community";

type Params = Promise<{ locale: string }>;
type Search = Promise<{ cat?: string; page?: string }>;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const { locale } = await params;
  const { cat } = await searchParams;
  const catLabel = cat ? categoryLabel(cat, locale) : null;
  return buildPageMeta({
    locale,
    pathSegment: cat ? `/community?cat=${cat}` : "/community",
    title: catLabel
      ? `${catLabel} — ${pick4(locale, "커뮤니티", "Community", "コミュニティ", "社区")}`
      : pick4(locale, "CAREMAP 커뮤니티", "CAREMAP Community", "CAREMAPコミュニティ", "CAREMAP社区"),
    description: pick4(locale,
      "후기·질문·의료관광 정보를 회원들과 공유하는 CAREMAP 커뮤니티.",
      "Share experiences, questions, and medical tourism tips with the CAREMAP community.",
      "レビュー・質問・医療観光情報を共有するCAREMAPコミュニティ。",
      "在CAREMAP社区分享评论·提问·医疗旅游信息。",
    ),
  });
}

type Post = {
  id: number;
  title: string;
  category: string;
  created_at: string;
  user_id: string;
  comment_count: number | null;
  profiles?: { nickname: string | null } | null;
};

export default async function CommunityPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const cat = sp.cat && (COMMUNITY_CATEGORIES as readonly string[]).includes(sp.cat) ? sp.cat : null;

  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  let posts: Post[] = [];
  let total = 0;
  try {
    let q = supabase
      .from("community_posts")
      .select("id, title, category, created_at, user_id, comment_count, profiles(nickname)", { count: "exact" })
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (cat) q = q.eq("category", cat);
    const { data, count } = await q;
    posts = (data ?? []) as unknown as Post[];
    total = count ?? 0;
  } catch {}
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div style={{ maxWidth: 900, margin: "32px auto 48px", padding: "0 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 30, fontWeight: 700, margin: 0 }}>
            {pick4(locale, "커뮤니티", "Community", "コミュニティ", "社区")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--cm-text-2)", margin: "4px 0 0" }}>
            {pick4(locale, "회원들이 공유하는 후기와 질문", "Member experiences and questions", "会員のレビューと質問", "会员的评论与提问")}
          </p>
        </div>
        <Link
          href={user ? "/community/new" : "/login?next=/community/new"}
          style={{
            background: "var(--cm-primary)", color: "#fff",
            padding: "10px 18px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 600, textDecoration: "none",
          }}
        >
          {pick4(locale, "+ 글 쓰기", "+ Write", "+ 投稿", "+ 写帖")}
        </Link>
      </header>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        <Link href="/community" className={`cm-filter-chip${!cat ? " active" : ""}`}>
          {pick4(locale, "전체", "All", "すべて", "全部")}
        </Link>
        {COMMUNITY_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/community?cat=${c}`}
            className={`cm-filter-chip${cat === c ? " active" : ""}`}
          >
            {categoryLabel(c, locale)}
          </Link>
        ))}
      </div>

      {/* 글 목록 */}
      {posts.length === 0 ? (
        <p style={{ padding: "60px 20px", textAlign: "center", fontSize: 14, color: "var(--cm-text-2)" }}>
          {pick4(locale,
            "아직 작성된 글이 없습니다. 첫 글을 남겨주세요.",
            "No posts yet. Be the first.",
            "まだ投稿がありません。最初の投稿をお寄せください。",
            "暂无帖子,欢迎您发表第一帖。",
          )}
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 1, border: "1px solid var(--cm-line)", borderRadius: 10, overflow: "hidden" }}>
          {posts.map((p) => (
            <li key={p.id} style={{ background: "#fff", padding: "14px 18px", borderBottom: "1px solid var(--cm-line)" }}>
              <Link href={`/community/${p.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cm-primary)", background: "var(--cm-primary-50)", padding: "2px 8px", borderRadius: 999 }}>
                    {categoryLabel(p.category, locale)}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--cm-ink)" }}>{p.title}</span>
                  {p.comment_count != null && p.comment_count > 0 && (
                    <span style={{ fontSize: 12, color: "var(--cm-primary)", fontWeight: 600 }}>
                      [{p.comment_count}]
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--cm-text-3)" }}>
                  {p.profiles?.nickname ?? "익명"} · {new Date(p.created_at).toLocaleDateString(locale)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, fontSize: 13 }}>
          {page > 1 && <Link href={`/community?${cat ? `cat=${cat}&` : ""}page=${page - 1}`} className="cm-filter-chip">{pick4(locale, "이전", "Prev", "前へ", "上一页")}</Link>}
          <span style={{ alignSelf: "center", color: "var(--cm-text-2)" }}>{page} / {totalPages}</span>
          {page < totalPages && <Link href={`/community?${cat ? `cat=${cat}&` : ""}page=${page + 1}`} className="cm-filter-chip">{pick4(locale, "다음", "Next", "次へ", "下一页")}</Link>}
        </div>
      )}
    </div>
  );
}
