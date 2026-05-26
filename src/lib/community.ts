/** 커뮤니티 카테고리 상수 + 4개 언어 라벨 */
export const COMMUNITY_CATEGORIES = ["question", "experience", "tourism", "general"] as const;
export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export function categoryLabel(cat: string, locale: string): string {
  const c = cat as CommunityCategory;
  switch (c) {
    case "question":   return locale === "en" ? "Questions" : locale === "ja" ? "質問" : locale === "zh" ? "提问" : "질문";
    case "experience": return locale === "en" ? "Experiences" : locale === "ja" ? "体験談" : locale === "zh" ? "经验" : "후기";
    case "tourism":    return locale === "en" ? "Medical tourism" : locale === "ja" ? "医療観光" : locale === "zh" ? "医疗旅游" : "의료관광";
    case "general":    return locale === "en" ? "General" : locale === "ja" ? "雑談" : locale === "zh" ? "杂谈" : "자유";
    default:           return cat;
  }
}
