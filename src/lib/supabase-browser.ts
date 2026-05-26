"use client";
/**
 * Supabase 브라우저 클라이언트 — 클라이언트 컴포넌트에서 auth 액션 (sign in/up/out).
 * 한 번만 생성. cookie 자동 관리.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env vars missing");
  _client = createBrowserClient(url, anon);
  return _client;
}
