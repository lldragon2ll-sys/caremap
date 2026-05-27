import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { buildPageMeta } from "@/lib/seo";
import { pick4 } from "@/lib/i18n-dict";
import { getCurrentUser } from "@/lib/supabase-server";
import { LoginForm } from "@/components/LoginForm";

type Params = Promise<{ locale: string }>;
type Search = Promise<{ next?: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMeta({
    locale,
    pathSegment: "/login",
    title: pick4(locale, "로그인", "Log in", "ログイン", "登录"),
    description: pick4(locale,
      "CAREMAP 회원 로그인. 매직링크 또는 이메일로 로그인하세요.",
      "Log in to CAREMAP — magic link or email/password.",
      "CAREMAP 会員ログイン。マジックリンクまたはメールでログイン。",
      "CAREMAP 会员登录。使用魔术链接或邮箱登录。",
    ),
    indexable: false,
  });
}

export default async function LoginPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) {
    redirect(sp.next ?? "/me");
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "var(--cm-font-display)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        {pick4(locale, "로그인", "Log in", "ログイン", "登录")}
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--cm-text-2)", lineHeight: 1.6, marginBottom: 28 }}>
        {pick4(locale,
          "가입한 이메일과 비밀번호로 로그인하세요.",
          "Log in with your registered email and password.",
          "登録済みのメールアドレスとパスワードでログインしてください。",
          "请使用已注册的邮箱和密码登录。",
        )}
      </p>
      <LoginForm locale={locale} next={sp.next ?? "/me"} />
    </div>
  );
}
