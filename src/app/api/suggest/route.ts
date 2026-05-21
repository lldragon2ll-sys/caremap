import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchKeyToKorean, tSpecialty, tSiggu } from "@/lib/i18n-dict";

export const runtime = "edge";

const SPECIALTIES = [
  "성형외과", "피부과", "치과", "안과", "한의원",
  "정형외과", "산부인과", "소아청소년과", "내과", "이비인후과",
  "신경외과", "비뇨의학과", "정신건강의학과", "가정의학과", "재활의학과",
];
const REGIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
  "강남구", "서초구", "송파구", "마포구", "용산구", "중구", "종로구",
  "해운대구", "수원시", "성남시", "고양시", "용인시",
];

type Suggest = { type: "specialty" | "region" | "hospital"; label: string; value: string; sub?: string };

/**
 * GET /api/suggest?q=...&locale=...
 * - 진료과/지역 정확/접두/포함 매칭
 * - 병원명 (yadm_nm) trigram ilike (최대 5개)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = (url.searchParams.get("q") ?? "").trim();
  const locale = (url.searchParams.get("locale") ?? "ko") as "ko" | "en" | "ja" | "zh";
  if (!qRaw || qRaw.length < 1) return NextResponse.json({ results: [] });
  if (qRaw.length > 50) return NextResponse.json({ results: [] }, { status: 400 });

  const q = qRaw.toLowerCase();
  const out: Suggest[] = [];

  // 진료과: locale-aware (en/ja/zh로 입력해도 매칭)
  for (const ko of SPECIALTIES) {
    const label = tSpecialty(ko, locale);
    if (label.toLowerCase().includes(q) || ko.toLowerCase().includes(q)) {
      out.push({ type: "specialty", label, value: label });
      if (out.length >= 5) break;
    }
  }

  // 지역
  for (const ko of REGIONS) {
    const label = tSiggu(ko, locale);
    if (label.toLowerCase().includes(q) || ko.toLowerCase().includes(q)) {
      out.push({ type: "region", label, value: label });
      if (out.filter((s) => s.type !== "hospital").length >= 8) break;
    }
  }

  // 병원명 (한국어로 변환 후 ilike)
  const koTerms = searchKeyToKorean(qRaw, locale);
  const koQ = koTerms[0] ?? qRaw;
  try {
    const { data } = await supabase
      .from("hospitals")
      .select("yadm_nm, slug, sggu_cd_nm, sido_cd_nm")
      .ilike("yadm_nm", `%${koQ.replace(/[%_\\]/g, "")}%`)
      .order("dr_tot_cnt", { ascending: false })
      .limit(5);
    for (const h of (data ?? []) as Array<{ yadm_nm: string; slug: string; sggu_cd_nm: string | null; sido_cd_nm: string | null }>) {
      out.push({
        type: "hospital",
        label: h.yadm_nm,
        value: h.yadm_nm,
        sub: [h.sido_cd_nm, h.sggu_cd_nm].filter(Boolean).join(" "),
      });
    }
  } catch {}

  return NextResponse.json({ results: out.slice(0, 12) }, {
    headers: { "cache-control": "public, max-age=30, s-maxage=60" },
  });
}
