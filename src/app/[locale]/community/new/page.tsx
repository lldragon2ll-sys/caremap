import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { buildPageMeta } from "@/lib/seo";
import { pick4 } from "@/lib/i18n-dict";
import { getCurrentUser } from "@/lib/supabase-server";
import { NewPostForm } from "@/components/NewPostForm";

type Params = Promise<{ locale: string }>;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMeta({
    locale,
    pathSegment: "/community/new",
    title: pick4(locale, "새 글 쓰기", "New Post", "新規投稿", "新建帖子"),
    description: "",
    indexable: false,
  });
}

export default async function NewCommunityPostPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/community/new");

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 26, fontWeight: 700, marginBottom: 14 }}>
        {pick4(locale, "새 글 쓰기", "Write a new post", "新規投稿", "新建帖子")}
      </h1>
      <p style={{ fontSize: 12.5, color: "var(--cm-text-2)", lineHeight: 1.55, padding: 12, background: "var(--cm-surface)", borderRadius: 8, marginBottom: 20 }}>
        {pick4(locale,
          "이용자가 작성한 개인 의견입니다. 의료 광고·가격 비교·효과 보장 표현은 자동 보류됩니다. 의료법 제56조에 따라 의료광고로 해석될 수 있는 내용은 관리자가 검토 후 게재 결정합니다.",
          "Personal opinions only. Medical advertising, price comparisons, and guaranteed-effect language are automatically held. Content that may be construed as medical advertising under Article 56 will be moderated.",
          "ご利用者個人の意見です。医療広告・価格比較・効果保証表現は自動保留。医療法第56条に基づき管理者が審査します。",
          "用户个人意见。医疗广告·价格比较·效果保证表述将自动暂停。依据医疗法第56条由管理员审核。",
        )}
      </p>
      <NewPostForm locale={locale} />
    </div>
  );
}
