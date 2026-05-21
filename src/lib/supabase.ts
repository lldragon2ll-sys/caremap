import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.",
    );
  }
  _client = createClient(url, anon, { auth: { persistSession: false } });
  return _client;
}

/**
 * Proxy로 .from() 등 호출 시점에 환경변수 검증 (모듈 import 시점에는 검사하지 않음)
 * 빌드 시 generateStaticParams가 try/catch로 감싸져 있어 환경변수 없어도 빌드는 통과
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const v = c[prop as string];
    return typeof v === "function" ? (v as (...args: unknown[]) => unknown).bind(c) : v;
  },
});
