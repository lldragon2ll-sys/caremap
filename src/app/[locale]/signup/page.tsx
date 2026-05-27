import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { buildPageMeta } from "@/lib/seo";
import { pick4 } from "@/lib/i18n-dict";
import { getCurrentUser } from "@/lib/supabase-server";
import { SignupForm } from "@/components/SignupForm";

type Params = Promise<{ locale: string }>;
type Search = Promise<{ next?: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMeta({
    locale,
    pathSegment: "/signup",
    title: pick4(locale, "회원가입", "Sign up", "会員登録", "注册"),
    description: pick4(locale,
      "CAREMAP 회원가입 — 비급여·미용 클리닉 후기·커뮤니티 이용.",
      "Sign up for CAREMAP — access clinic reviews and the community.",
      "CAREMAP 会員登録 — クリニックレビュー・コミュニティ利用。",
      "CAREMAP 注册 — 使用诊所评论·社区功能。",
    ),
    indexable: false,
  });
}

export default async function SignupPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) redirect(sp.next ?? "/me");

  return (
    <div style={{ maxWidth: 480, margin: "48px auto 80px", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        {pick4(locale, "회원가입", "Sign up", "会員登録", "注册")}
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--cm-text-2)", lineHeight: 1.6, marginBottom: 28 }}>
        {pick4(locale,
          "이메일·비밀번호로 가입합니다. 가입 후 받은편지함에서 이메일을 확인해 주세요.",
          "Sign up with email and password. Check your inbox for a confirmation link after.",
          "メールアドレスとパスワードで登録します。受信トレイで確認メールをご確認ください。",
          "使用邮箱和密码注册。注册后请在邮箱中确认验证邮件。",
        )}
      </p>
      <SignupForm locale={locale} next={sp.next ?? "/me"} />
    </div>
  );
}
