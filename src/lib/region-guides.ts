/** 지역 의료관광 가이드 (SEO + 외국인 환자 유치) */
export type RegionGuide = {
  slug: string;     // /guide/region/<slug>
  region: string;   // 한국어 매핑용
  title: { ko: string; en: string; ja: string; zh: string };
  lede: { ko: string; en: string; ja: string; zh: string };
  highlights: Array<{ ko: string; en: string; ja: string; zh: string }>;
  airport: { ko: string; en: string; ja: string; zh: string };
};

export const REGION_GUIDES: RegionGuide[] = [
  {
    slug: "seoul-medical-tourism",
    region: "서울",
    title: {
      ko: "서울 의료관광 가이드 — 강남·서초·명동",
      en: "Seoul Medical Tourism: Gangnam, Seocho & Myeong-dong",
      ja: "ソウル医療観光ガイド — 江南・瑞草・明洞",
      zh: "首尔医疗旅游指南 — 江南·瑞草·明洞",
    },
    lede: {
      ko: "서울은 세계 의료관광 허브 중 하나로, 강남·서초·명동 지역에 외국인 환자 등록 의료기관이 집중되어 있습니다. 인천공항에서 강남까지 공항버스로 약 70분.",
      en: "Seoul is a global medical tourism hub, with foreign-patient-registered institutions concentrated in Gangnam, Seocho and Myeong-dong. About 70 minutes from Incheon Airport to Gangnam by limousine bus.",
      ja: "ソウルは世界的な医療観光ハブで、江南・瑞草・明洞に外国人患者登録医療機関が集中しています。仁川空港から江南までリムジンバスで約70分。",
      zh: "首尔是全球医疗旅游中心之一,江南·瑞草·明洞集中外国患者登记医疗机构。仁川机场到江南乘机场大巴约70分钟。",
    },
    highlights: [
      { ko: "성형외과 1,000+곳 (강남·서초)", en: "1,000+ plastic surgery clinics in Gangnam & Seocho",
        ja: "美容整形1,000院以上(江南・瑞草)", zh: "整形外科1000+家 (江南·瑞草)" },
      { ko: "피부과·뷰티 클리닉 밀집 (강남·청담)", en: "Concentrated dermatology & beauty clinics (Gangnam, Cheongdam)",
        ja: "皮膚科・美容クリニック密集(江南・清潭)", zh: "皮肤科·美容诊所聚集 (江南·清潭)" },
      { ko: "VIP 진료 종합병원 (강남세브란스·삼성서울)", en: "VIP care at major hospitals (Gangnam Severance, Samsung Seoul)",
        ja: "VIP診療総合病院(江南セブランス・サムスンソウル)", zh: "VIP综合医院 (江南世福兰斯·三星首尔)" },
    ],
    airport: {
      ko: "인천(ICN) 공항버스 6017·6020·6703 — 강남 직행",
      en: "From ICN: Airport Limousine 6017 / 6020 / 6703 — direct to Gangnam",
      ja: "仁川(ICN)空港バス 6017・6020・6703 — 江南直行",
      zh: "仁川(ICN)机场大巴 6017·6020·6703 — 直达江南",
    },
  },
  {
    slug: "busan-medical-tourism",
    region: "부산",
    title: {
      ko: "부산 의료관광 가이드 — 해운대·서면",
      en: "Busan Medical Tourism: Haeundae & Seomyeon",
      ja: "釜山医療観光ガイド — 海雲台・西面",
      zh: "釜山医疗旅游指南 — 海云台·西面",
    },
    lede: {
      ko: "부산은 일본·중국 환자가 많이 찾는 의료관광 도시로, 해운대·서면 지역에 미용·성형 클리닉이 밀집해 있습니다. 김해공항(PUS)에서 해운대까지 약 50분.",
      en: "Busan is a popular medical tourism city for Japanese and Chinese patients. Beauty and plastic surgery clinics are concentrated in Haeundae and Seomyeon. About 50 minutes from Gimhae Airport (PUS) to Haeundae.",
      ja: "釜山は日本・中国患者に人気の医療観光都市で、海雲台・西面に美容・整形クリニックが集中しています。金海空港(PUS)から海雲台まで約50分。",
      zh: "釜山是日本和中国患者偏爱的医疗旅游城市,海云台·西面集中了美容·整形诊所。金海机场(PUS)到海云台约50分钟。",
    },
    highlights: [
      { ko: "관광·미용 결합 일정 가능", en: "Combine sightseeing with cosmetic procedures",
        ja: "観光と美容を組み合わせた行程が可能", zh: "可结合观光与美容项目" },
      { ko: "서울 대비 합리적 가격대", en: "More affordable pricing than Seoul",
        ja: "ソウルより手頃な価格帯", zh: "价格比首尔更实惠" },
    ],
    airport: {
      ko: "김해공항(PUS) 공항버스·지하철 — 해운대·서면",
      en: "From PUS: airport bus or subway — to Haeundae / Seomyeon",
      ja: "金海空港(PUS)空港バス・地下鉄 — 海雲台・西面",
      zh: "金海机场(PUS)机场大巴·地铁 — 海云台·西面",
    },
  },
  {
    slug: "jeju-medical-tourism",
    region: "제주",
    title: {
      ko: "제주 의료관광 가이드 — 휴양과 치료를 한 번에",
      en: "Jeju Medical Tourism: Wellness & Treatment",
      ja: "済州医療観光ガイド — リゾートと治療を同時に",
      zh: "济州医疗旅游指南 — 度假与治疗一次完成",
    },
    lede: {
      ko: "제주도는 비자 면제 지역으로 중국·동남아 환자의 접근성이 우수합니다. 리조트 체류와 종합검진·미용 시술을 결합한 패키지가 인기입니다.",
      en: "Jeju is a visa-free zone offering excellent access for Chinese and Southeast Asian patients. Packages combining resort stays with comprehensive check-ups or cosmetic procedures are popular.",
      ja: "済州島はビザ免除エリアで、中国・東南アジア患者のアクセスが良好です。リゾート滞在と総合検診・美容施術を組み合わせたパッケージが人気です。",
      zh: "济州岛是免签地区,中国及东南亚患者出行便利。结合度假与综合体检·美容项目的套餐受欢迎。",
    },
    highlights: [
      { ko: "비자 면제 입국 가능 (일부 국가)", en: "Visa-free entry (for select countries)",
        ja: "ビザ免除での入国可能(対象国)", zh: "可免签入境(部分国家)" },
      { ko: "종합검진 + 휴양 패키지", en: "Health check-up + resort packages",
        ja: "総合検診+リゾートパッケージ", zh: "体检+度假套餐" },
    ],
    airport: {
      ko: "제주국제공항(CJU) — 시내 차로 15분",
      en: "Jeju International Airport (CJU) — 15 min by car to city",
      ja: "済州国際空港(CJU) — 市内まで車で15分",
      zh: "济州国际机场(CJU) — 市区车程15分钟",
    },
  },
];

export function getRegionGuide(slug: string): RegionGuide | null {
  return REGION_GUIDES.find((g) => g.slug === slug) ?? null;
}
