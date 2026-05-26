import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildPageMeta } from "@/lib/seo";
import { pick4 } from "@/lib/i18n-dict";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase-server";
import { categoryLabel } from "@/lib/community";
import { CommentForm } from "@/components/CommentForm";
import { ReportButton } from "@/components/ReportButton";

type Params = Promise<{ locale: string; id: string }>;
export const dynamic = "force-dynamic";

type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  hospital_slug: string | null;
  profiles?: { nickname: string | null } | null;
};
type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { nickname: string | null } | null;
};

async function fetchPost(id: number) {
  const supabase = await createSupabaseServerClient();
  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from("community_posts")
      .select("id, title, content, category, created_at, user_id, hospital_slug, profiles(nickname)")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("community_comments")
      .select("id, content, created_at, user_id, profiles(nickname)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
  ]);
  return {
    post: (post as unknown as Post | null) ?? null,
    comments: (comments ?? []) as unknown as Comment[],
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const numId = Number(id);
  if (!numId) return buildPageMeta({ locale, pathSegment: "/community", title: "Community", description: "" });
  const { post } = await fetchPost(numId);
  if (!post) return buildPageMeta({ locale, pathSegment: `/community/${id}`, title: "Post", description: "", indexable: false });
  return buildPageMeta({
    locale,
    pathSegment: `/community/${id}`,
    title: post.title,
    description: post.content.slice(0, 160),
    ogType: "article",
  });
}

export default async function CommunityPostPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const numId = Number(id);
  if (!numId) notFound();
  setRequestLocale(locale);

  const { post, comments } = await fetchPost(numId);
  if (!post) notFound();

  const user = await getCurrentUser();

  return (
    <article style={{ maxWidth: 760, margin: "32px auto 60px", padding: "0 20px" }}>
      <nav style={{ fontSize: 12.5, color: "var(--cm-text-2)", marginBottom: 14 }}>
        <Link href="/community" style={{ color: "var(--cm-text-2)" }}>
          ← {pick4(locale, "커뮤니티", "Community", "コミュニティ", "社区")}
        </Link>
      </nav>

      <header style={{ paddingBottom: 16, borderBottom: "1px solid var(--cm-line)", marginBottom: 18 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--cm-primary)", background: "var(--cm-primary-50)", padding: "3px 9px", borderRadius: 999 }}>
          {categoryLabel(post.category, locale)}
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "10px 0 8px", letterSpacing: "-0.015em", wordBreak: "keep-all" }}>
          {post.title}
        </h1>
        <div style={{ fontSize: 12.5, color: "var(--cm-text-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            {post.profiles?.nickname ?? "익명"} · {new Date(post.created_at).toLocaleString(locale)}
          </span>
          {user && user.id !== post.user_id && (
            <ReportButton kind="post" targetId={post.id} locale={locale} />
          )}
        </div>
      </header>

      <div style={{ fontSize: 15, color: "var(--cm-text)", lineHeight: 1.75, whiteSpace: "pre-wrap", marginBottom: 32 }}>
        {post.content}
      </div>

      {post.hospital_slug && (
        <Link
          href={`/hospital/${encodeURIComponent(post.hospital_slug)}`}
          style={{
            display: "inline-flex", padding: "8px 14px",
            background: "var(--cm-surface)", border: "1px solid var(--cm-line)",
            borderRadius: 999, fontSize: 12.5, color: "var(--cm-ink)",
            textDecoration: "none", marginBottom: 20,
          }}
        >
          🏥 {pick4(locale, "관련 병원 보기", "View related clinic", "関連クリニック", "查看相关诊所")} →
        </Link>
      )}

      <section style={{ borderTop: "1px solid var(--cm-line)", paddingTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          {pick4(locale, "댓글", "Comments", "コメント", "评论")}
          <span style={{ fontSize: 13, color: "var(--cm-text-2)", marginLeft: 6, fontWeight: 500 }}>
            ({comments.length})
          </span>
        </h2>

        {comments.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--cm-text-2)", padding: "16px 0", textAlign: "center" }}>
            {pick4(locale, "아직 댓글이 없습니다.", "No comments yet.", "まだコメントがありません。", "暂无评论。")}
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {comments.map((c) => (
              <li key={c.id} style={{ padding: "12px 14px", background: "var(--cm-surface)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "var(--cm-text-2)", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                  <span>{c.profiles?.nickname ?? "익명"} · {new Date(c.created_at).toLocaleString(locale)}</span>
                  {user && user.id !== c.user_id && (
                    <ReportButton kind="comment" targetId={c.id} locale={locale} />
                  )}
                </div>
                <p style={{ fontSize: 14, color: "var(--cm-text)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                  {c.content}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 18 }}>
          {user ? (
            <CommentForm postId={post.id} locale={locale} />
          ) : (
            <Link
              href={`/login?next=/community/${post.id}`}
              style={{
                display: "inline-flex", padding: "10px 18px",
                background: "var(--cm-ink)", color: "#fff",
                borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {pick4(locale, "로그인하고 댓글 달기", "Log in to comment", "ログインしてコメント", "登录后评论")}
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
