import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * /auth/callback?code=... — Supabase magic link / OAuth 콜백
 * code → session 교환 후 next= 파라미터로 리디렉트.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supaAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = await cookies();
    const supabase = createServerClient(supaUrl, supaAnon, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(toSet) {
          for (const { name, value, options } of toSet) {
            try { cookieStore.set(name, value, options as CookieOptions); } catch {}
          }
        },
      },
    });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // origin = www.caremap.store
  const dest = new URL(next.startsWith("/") ? next : "/", url.origin);
  return NextResponse.redirect(dest);
}
