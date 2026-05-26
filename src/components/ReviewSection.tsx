import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { pick4 } from "@/lib/i18n-dict";
import type { Hospital } from "@/lib/types";
import { ReviewForm } from "./ReviewForm";

type Review = {
  id: number;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
  profiles?: { nickname: string | null } | null;
};

/**
 * 병원 상세 페이지 후기 섹션 (서버 컴포넌트).
 * - published 상태만 표시
 * - 의료법 disclaimer 상단 노출
 * - 로그인 사용자만 작성 가능 (form은 클라이언트)
 * - aggregateRating은 노출하지 않음 (실데이터 부족 시 가짜 신호 방지)
 */
export async function ReviewSection({ h, locale }: { h: Hospital; locale: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 후기 목록 (최신 10)
  let reviews: Review[] = [];
  let total = 0;
  let avg: number | null = null;
  try {
    const { data, count } = await supabase
      .from("reviews")
      .select("id, user_id, rating, content, created_at, profiles(nickname)", { count: "exact" })
      .eq("hospital_id", h.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10);
    reviews = (data ?? []) as unknown as Review[];
    total = count ?? 0;
    if (total > 0) {
      const sum = reviews.reduce((a, b) => a + (b.rating ?? 0), 0);
      avg = Math.round((sum / reviews.length) * 10) / 10;
    }
  } catch {
    // 테이블 미생성 — 무시
    return null;
  }

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  return (
    <section className="cm-section-card" id="reviews" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          {pick4(locale, "이용 후기", "Reviews", "ご利用レビュー", "用户评论")}
          <span style={{ fontSize: 13, color: "var(--cm-text-2)", fontWeight: 500, marginLeft: 8 }}>({total})</span>
        </h3>
        {avg != null && (
          <div style={{ fontSize: 14, color: "var(--cm-text)", fontWeight: 600 }}>
            ★ {avg.toFixed(1)}
            <span style={{ color: "var(--cm-text-3)", fontWeight: 400, marginLeft: 6 }}>/ 5.0</span>
          </div>
        )}
      </div>

      {/* 의료법 disclaimer */}
      <p style={{
        fontSize: 12, color: "var(--cm-text-2)", lineHeight: 1.55,
        background: "var(--cm-surface)", padding: "10px 12px", borderRadius: 8,
        marginBottom: 16,
      }}>
        {pick4(locale,
          "이용자가 직접 작성한 개인 의견입니다. 의료광고가 아니며 의료 자문·진단을 대체하지 않습니다. 시술 효과는 개인차가 있으니 의료진과 직접 상담하세요.",
          "Reviews are personal opinions by users. Not medical advertising; does not substitute for medical consultation. Treatment outcomes vary individually — consult medical professionals directly.",
          "ご利用者個人の意見です。医療広告ではなく、医療相談・診断を代替するものではありません。施術効果は個人差がありますので、必ず医療スタッフにご相談ください。",
          "用户个人意见。非医疗广告,不能替代医疗咨询·诊断。治疗效果因人而异,请直接咨询医务人员。",
        )}
      </p>

      {reviews.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--cm-text-2)", padding: "20px 0", textAlign: "center" }}>
          {pick4(locale,
            "아직 작성된 후기가 없습니다. 첫 후기를 남겨주세요.",
            "No reviews yet. Be the first to leave one.",
            "まだレビューがありません。最初のレビューをお寄せください。",
            "暂无评论,欢迎您留下首条评论。",
          )}
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((r) => (
            <li key={r.id} style={{ padding: "14px 16px", border: "1px solid var(--cm-line)", borderRadius: 10, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--cm-ink)" }}>
                  {r.profiles?.nickname ?? "익명"}
                </span>
                <span style={{ fontSize: 13, color: "var(--cm-primary)", fontWeight: 700 }}>
                  {"★".repeat(r.rating)}<span style={{ color: "var(--cm-line)" }}>{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p style={{ fontSize: 14, color: "var(--cm-text)", lineHeight: 1.6, margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
                {r.content}
              </p>
              <div style={{ fontSize: 11.5, color: "var(--cm-text-3)" }}>
                {new Date(r.created_at).toLocaleDateString(locale)}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 후기 작성 폼 */}
      <div style={{ marginTop: 20 }}>
        {!user ? (
          <Link
            href={`/login?next=/hospital/${encodeURIComponent(h.slug)}%23reviews`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 10,
              background: "var(--cm-ink)", color: "#fff",
              fontSize: 13.5, fontWeight: 600, textDecoration: "none",
            }}
          >
            {pick4(locale, "후기 작성하려면 로그인", "Log in to write a review", "レビューを書くにはログイン", "登录后撰写评论")}
          </Link>
        ) : myReview ? (
          <p style={{ fontSize: 13, color: "var(--cm-text-2)", padding: 12, background: "var(--cm-primary-50)", borderRadius: 8 }}>
            ✓ {pick4(locale, "이미 후기를 작성하셨습니다.", "You've already reviewed this clinic.", "既にレビューを投稿済みです。", "您已对该诊所发表评论。")}
          </p>
        ) : (
          <ReviewForm
            hospitalId={h.id}
            hospitalSlug={h.slug}
            hospitalName={h.yadm_nm}
            locale={locale}
          />
        )}
      </div>
    </section>
  );
}
