import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { buildPageMeta } from "@/lib/seo";
import { pick4 } from "@/lib/i18n-dict";
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase-server";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileForm } from "@/components/ProfileForm";

type Params = Promise<{ locale: string }>;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMeta({
    locale,
    pathSegment: "/me",
    title: pick4(locale, "내 계정", "My Account", "マイアカウント", "我的账户"),
    description: pick4(locale, "내 활동·후기·게시글", "My activity, reviews, posts", "私の活動・レビュー・投稿", "我的活动·评论·帖子"),
    indexable: false,
  });
}

type Profile = {
  id: string;
  nickname: string | null;
  locale: string | null;
};

type Review = { id: number; hospital_slug: string; hospital_name: string; rating: number; created_at: string };
type Post = { id: number; title: string; category: string; created_at: string };

export default async function MePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/me");

  const supabase = await createSupabaseServerClient();

  // 프로필 (없으면 생성)
  let profile: Profile | null = null;
  {
    const { data } = await supabase
      .from("profiles")
      .select("id, nickname, locale")
      .eq("id", user.id)
      .maybeSingle();
    profile = (data as Profile | null) ?? null;
    if (!profile) {
      const seed = `user_${user.id.slice(0, 6)}`;
      await supabase.from("profiles").insert({ id: user.id, nickname: seed, locale });
      profile = { id: user.id, nickname: seed, locale };
    }
  }

  // 내 활동
  let myReviews: Review[] = [];
  let myPosts: Post[] = [];
  try {
    const [r, p] = await Promise.all([
      supabase
        .from("reviews")
        .select("id, hospital_slug, hospital_name, rating, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("community_posts")
        .select("id, title, category, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    myReviews = (r.data ?? []) as Review[];
    myPosts = (p.data ?? []) as Post[];
  } catch {
    // 테이블 미생성 — 무시
  }

  return (
    <div style={{ maxWidth: 760, margin: "48px auto", padding: "0 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
            {pick4(locale, "내 계정", "My Account", "マイアカウント", "我的账户")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--cm-text-2)", margin: "4px 0 0" }}>{user.email}</p>
        </div>
        <LogoutButton locale={locale} />
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2 style={sectionTitle}>{pick4(locale, "프로필", "Profile", "プロフィール", "个人资料")}</h2>
        <ProfileForm
          locale={locale}
          initialNickname={profile.nickname ?? ""}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={sectionTitle}>
          {pick4(locale, "내 후기", "My Reviews", "私のレビュー", "我的评论")} ({myReviews.length})
        </h2>
        {myReviews.length === 0 ? (
          <p style={emptyMsg}>
            {pick4(locale,
              "아직 작성한 후기가 없습니다. 방문한 병원 상세 페이지에서 후기를 남길 수 있어요.",
              "No reviews yet. Leave a review on a hospital detail page.",
              "まだレビューがありません。受診したクリニックの詳細ページで投稿できます。",
              "暂无评论。可在就诊过的医院详情页留下评论。",
            )}
          </p>
        ) : (
          <ul style={listStyle}>
            {myReviews.map((r) => (
              <li key={r.id} style={listItem}>
                <Link href={`/hospital/${encodeURIComponent(r.hospital_slug)}`} style={{ fontWeight: 600 }}>
                  {r.hospital_name}
                </Link>
                <span style={{ color: "var(--cm-text-3)", marginLeft: 8 }}>★ {r.rating}</span>
                <span style={{ color: "var(--cm-text-3)", marginLeft: 8, fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleDateString(locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={sectionTitle}>
          {pick4(locale, "내 게시글", "My Posts", "私の投稿", "我的帖子")} ({myPosts.length})
        </h2>
        {myPosts.length === 0 ? (
          <p style={emptyMsg}>
            {pick4(locale,
              "아직 작성한 게시글이 없습니다.",
              "No posts yet.",
              "まだ投稿がありません。",
              "暂无帖子。",
            )}
          </p>
        ) : (
          <ul style={listStyle}>
            {myPosts.map((p) => (
              <li key={p.id} style={listItem}>
                <Link href={`/community/${p.id}`} style={{ fontWeight: 600 }}>{p.title}</Link>
                <span style={{ color: "var(--cm-text-3)", marginLeft: 8, fontSize: 12 }}>{p.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 17, fontWeight: 700, marginBottom: 12,
  paddingBottom: 8, borderBottom: "1px solid var(--cm-line)",
};
const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 };
const listItem: React.CSSProperties = { fontSize: 14, padding: "10px 12px", border: "1px solid var(--cm-line)", borderRadius: 8 };
const emptyMsg: React.CSSProperties = { fontSize: 13.5, color: "var(--cm-text-2)", padding: "16px 12px", background: "var(--cm-surface)", borderRadius: 8 };
