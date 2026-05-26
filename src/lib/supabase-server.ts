/**
 * Supabase 서버사이드 클라이언트 — RLS 적용, cookie 기반 세션.
 * 서버 컴포넌트 / 라우트 핸들러 / 미들웨어에서 사용.
 *
 * 기존 `supabase` (lib/supabase.ts) 는 익명 데이터 조회용 (RLS bypass with anon key).
 * 이 클라이언트는 로그인한 사용자 컨텍스트로 동작.
 */
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env vars missing");
  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // Server Component에서 set 시도 → 무시 (middleware가 처리)
        }
      },
    },
  });
}

/** 현재 로그인 사용자 (없으면 null) */
export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
