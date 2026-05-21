/**
 * 진료과별 가이드 콘텐츠 — SEO 강화용.
 * 영어/일본어/중국어 검색 트래픽을 노린 의료관광 정보 위주.
 */
export type GuideContent = {
  slug: string;       // URL: /guide/<slug>
  specialty: string;  // 한국어 (DB·검색 매핑용)
  title: { ko: string; en: string; ja: string; zh: string };
  lede: { ko: string; en: string; ja: string; zh: string };
  sections: Array<{
    heading: { ko: string; en: string; ja: string; zh: string };
    body: { ko: string; en: string; ja: string; zh: string };
  }>;
  faq: Array<{
    q: { ko: string; en: string; ja: string; zh: string };
    a: { ko: string; en: string; ja: string; zh: string };
  }>;
};

export const GUIDES: GuideContent[] = [
  {
    slug: "plastic-surgery",
    specialty: "성형외과",
    title: {
      ko: "한국 성형외과 의료관광 가이드 (강남·서울)",
      en: "Plastic Surgery in Korea: Medical Tourism Guide",
      ja: "韓国の美容整形 医療観光ガイド (江南・ソウル)",
      zh: "韩国整形外科医疗旅游指南 (江南·首尔)",
    },
    lede: {
      ko: "한국은 세계적으로 손꼽히는 성형외과 인프라를 보유한 나라입니다. 강남·서초 일대에는 1,000곳 이상의 성형외과가 밀집해 있으며, 의료법 제56조에 따라 광고 사전심의를 통과한 정식 의료기관만 운영됩니다.",
      en: "Korea is home to one of the world's most advanced plastic surgery industries. Over 1,000 clinics are concentrated in the Gangnam and Seocho districts of Seoul, and only licensed institutions that pass advance review under Article 56 of the Medical Service Act can operate.",
      ja: "韓国は世界トップクラスの美容整形インフラを誇ります。江南・瑞草エリアには1,000院以上が集まり、医療法第56条に基づく事前審議を通過した正規医療機関のみが運営されています。",
      zh: "韩国拥有世界顶尖的整形外科产业。江南·瑞草地区聚集了1000多家诊所,仅依据医疗法第56条通过事前审议的正规医疗机构可运营。",
    },
    sections: [
      {
        heading: { ko: "주요 시술 종류", en: "Popular Procedures", ja: "主な施術", zh: "主要术式" },
        body: {
          ko: "쌍꺼풀(눈매교정), 코 성형, 안면윤곽(양악·광대축소), 가슴 성형, 지방흡입, 리프팅(실/HIFU)이 한국 성형외과의 대표 시술입니다. 비절개 방법과 회복이 빠른 시술 위주로 발전해 왔습니다.",
          en: "Double-eyelid surgery, rhinoplasty, facial contouring (orthognathic & cheekbone reduction), breast augmentation, liposuction, and lifting (thread / HIFU) are the most popular procedures. Korean clinics emphasize non-invasive techniques and quick recovery.",
          ja: "二重まぶた、鼻整形、輪郭(両顎・頬骨)、豊胸、脂肪吸引、リフト(糸/HIFU)が代表的な施術です。非切開と短いダウンタイムを重視した方法が発展しています。",
          zh: "双眼皮、鼻整形、轮廓(双颚·颧骨)、丰胸、抽脂、提升(线雕/HIFU)是热门项目。韩国诊所侧重微创和短恢复期方法。",
        },
      },
      {
        heading: { ko: "비용 가이드", en: "Cost Guide", ja: "費用ガイド", zh: "费用指南" },
        body: {
          ko: "쌍꺼풀 1,500,000–3,500,000원, 코 성형 3,000,000–7,000,000원, 안면윤곽 6,000,000–15,000,000원 범위가 일반적입니다. 모든 시술은 비급여이며, 클리닉별로 큰 차이가 있어 반드시 사전 견적이 필요합니다.",
          en: "Typical ranges: double-eyelid 1.5–3.5M KRW, rhinoplasty 3–7M KRW, facial contouring 6–15M KRW. All procedures are out-of-pocket; prices vary significantly between clinics, so always request a quote in advance.",
          ja: "目安料金:二重150〜350万ウォン、鼻300〜700万ウォン、輪郭600〜1,500万ウォン。すべて自由診療で、クリニックによる差が大きいため、事前見積もりを必ずお取りください。",
          zh: "参考价格:双眼皮150–350万韩元、鼻整形300–700万韩元、轮廓600–1500万韩元。所有项目均为自费,各诊所价格差异较大,请务必事先索取报价。",
        },
      },
      {
        heading: { ko: "클리닉 선택 체크리스트", en: "Choosing a Clinic", ja: "クリニック選び", zh: "选择诊所" },
        body: {
          ko: "(1) 의료법 제56조 사전심의 번호 확인 (2) 상담의와 집도의가 같은지 (3) 마취과 전문의 상주 여부 (4) 부작용·재수술 정책 (5) 통역사 제공 (외국인 환자 등록 의료기관).",
          en: "(1) Verify the medical advertising review number (Article 56). (2) Make sure the consulting doctor is the same as the operating surgeon. (3) Confirm an anesthesiologist is on-site. (4) Check the revision and complications policy. (5) Look for clinics registered to serve foreign patients (with interpreters).",
          ja: "(1)医療法第56条審議番号の確認 (2)カウンセリング医と執刀医が同一か (3)麻酔科専門医の常駐 (4)修正・副作用への対応 (5)通訳サービス(外国人患者登録医療機関)。",
          zh: "(1)确认医疗法第56条审议号 (2)咨询医师与执刀医师是否一致 (3)是否有麻醉科专科医师驻诊 (4)修复·副作用政策 (5)外国患者登记医疗机构(配翻译)。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "외국인도 한국 성형외과 시술이 가능한가요?", en: "Can foreigners get plastic surgery in Korea?", ja: "外国人も韓国で美容整形を受けられますか?", zh: "外国人可以在韩国做整形手术吗?" },
        a: {
          ko: "네, 외국인 환자 등록 의료기관 인증을 받은 클리닉에서는 영어·일본어·중국어 통역 서비스가 제공됩니다. 의료비자(C-3-3)도 발급 가능합니다.",
          en: "Yes. Clinics registered to serve foreign patients offer English, Japanese and Chinese interpretation services. A medical visa (C-3-3) is also available.",
          ja: "はい。外国人患者登録医療機関認証を受けたクリニックでは、英語・日本語・中国語の通訳サービスを提供します。医療ビザ(C-3-3)も取得可能です。",
          zh: "可以。获外国患者登记认证的诊所提供英·日·中翻译服务。也可申请医疗签证(C-3-3)。",
        },
      },
      {
        q: { ko: "회복 기간은 얼마나 걸리나요?", en: "What's the recovery time?", ja: "回復期間はどれくらいですか?", zh: "恢复期需要多久?" },
        a: {
          ko: "쌍꺼풀 1~2주, 코 성형 2~3주, 안면윤곽은 4~6주 정도 부기와 멍이 가라앉습니다. 출국 일정은 시술별 회복 기간을 고려해 잡으시기 바랍니다.",
          en: "Double-eyelid: 1–2 weeks. Rhinoplasty: 2–3 weeks. Facial contouring: 4–6 weeks for swelling and bruising to subside. Plan your travel dates around the procedure's recovery period.",
          ja: "二重1〜2週、鼻2〜3週、輪郭は4〜6週で腫れ・内出血が落ち着きます。出国日程は施術ごとの回復期間を考慮してご計画ください。",
          zh: "双眼皮1–2周、鼻整形2–3周、轮廓4–6周肿胀和淤青消退。请按手术恢复期安排回国行程。",
        },
      },
    ],
  },
  {
    slug: "dermatology",
    specialty: "피부과",
    title: {
      ko: "한국 피부과 가이드 — 시술·관리·미용",
      en: "Korean Dermatology Guide: Treatments & Aesthetics",
      ja: "韓国の皮膚科ガイド — 施術・スキンケア",
      zh: "韩国皮肤科指南 — 治疗·护肤·美容",
    },
    lede: {
      ko: "한국 피부과는 의료 시술과 미용 시술 모두에서 세계적 명성을 갖추고 있습니다. K-뷰티 산업의 핵심으로, 레이저·필러·실리프팅·스킨부스터 등 최신 기술이 빠르게 도입됩니다.",
      en: "Korean dermatology is world-renowned for both medical and aesthetic treatments. As the core of the K-beauty industry, the latest technologies — lasers, fillers, thread lifting and skin boosters — are quickly adopted.",
      ja: "韓国の皮膚科は医療施術と美容施術の両方で世界的な評価を得ています。K-ビューティ産業の中核として、レーザー・フィラー・糸リフト・スキンブースターなど最新技術が素早く導入されます。",
      zh: "韩国皮肤科在医疗与美容治疗领域享誉世界。作为K-Beauty产业核心,激光·填充·线雕·水光等最新技术迅速引入。",
    },
    sections: [
      {
        heading: { ko: "대표 시술", en: "Signature Treatments", ja: "代表的施術", zh: "代表项目" },
        body: {
          ko: "물광주사(스킨부스터), 보톡스, 필러, 레이저토닝(멜라닌), 슈링크/울쎄라(HIFU 리프팅), 인모드/포텐자(RF 마이크로니들) 등이 대표적입니다.",
          en: "Skin boosters, Botox, fillers, laser toning (for pigmentation), Ulthera / Shrink (HIFU lifting), InMode / Potenza (RF microneedling) are signature treatments.",
          ja: "水光注射、ボトックス、フィラー、レーザートーニング(色素)、シュリンク・ウルセラ(HIFUリフト)、インモード・ポテンツァ(RFマイクロニードル)などが代表的です。",
          zh: "水光针、肉毒素、填充剂、镭射调色(色素)、超声刀·Shrink(HIFU提升)、InMode·Potenza(RF微针)等。",
        },
      },
      {
        heading: { ko: "의료 vs 미용 구분", en: "Medical vs. Aesthetic", ja: "医療と美容の区別", zh: "医疗与美容的区分" },
        body: {
          ko: "여드름·아토피·건선·탈모 등 질환 치료는 건강보험 급여 대상입니다. 미용 시술은 모두 비급여로, 비용은 클리닉별로 다릅니다.",
          en: "Treatments for conditions like acne, atopic dermatitis, psoriasis and hair loss are covered by Korean national health insurance. All aesthetic procedures are out-of-pocket, with prices varying by clinic.",
          ja: "ニキビ・アトピー・乾癬・脱毛など疾患治療は健康保険適用です。美容施術はすべて自由診療で、料金はクリニックによります。",
          zh: "痤疮、特异性皮炎、银屑病、脱发等疾病治疗属医保覆盖。美容项目均为自费,价格因诊所而异。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "한국 피부과는 외국인도 진료 가능한가요?", en: "Can foreigners visit Korean dermatology clinics?", ja: "外国人も受診できますか?", zh: "外国人可以就诊吗?" },
        a: {
          ko: "네. 강남·명동 등 외국인 환자 등록 의료기관에서는 영어·일본어·중국어 진료가 가능합니다.",
          en: "Yes. Foreign-patient-registered clinics in Gangnam, Myeong-dong and similar areas offer English, Japanese and Chinese consultations.",
          ja: "はい。江南・明洞などの外国人患者登録医療機関では英・日・中語での診察が可能です。",
          zh: "可以。江南·明洞等外国患者登记医疗机构提供英·日·中语诊疗。",
        },
      },
    ],
  },
  {
    slug: "dental",
    specialty: "치과",
    title: {
      ko: "한국 치과 가이드 — 임플란트·교정·미백",
      en: "Korean Dental Guide: Implants, Orthodontics & Whitening",
      ja: "韓国の歯科ガイド — インプラント・矯正・ホワイトニング",
      zh: "韩国牙科指南 — 种植·矫正·美白",
    },
    lede: {
      ko: "한국 치과는 임플란트와 교정 분야에서 세계적 경쟁력을 갖추고 있습니다. 디지털 스캐너·CAD/CAM·당일 보철 등 첨단 시스템을 갖춘 클리닉이 증가하고 있습니다.",
      en: "Korean dentistry is globally competitive in implants and orthodontics. Clinics equipped with digital scanners, CAD/CAM and same-day prosthetics are growing.",
      ja: "韓国の歯科はインプラントと矯正で世界的競争力があります。デジタルスキャナー・CAD/CAM・即日補綴を備えたクリニックが増加しています。",
      zh: "韩国牙科在种植和矫正领域具有世界竞争力。配备数字扫描仪·CAD/CAM·当日修复的诊所不断增加。",
    },
    sections: [
      {
        heading: { ko: "주요 시술 가격", en: "Pricing", ja: "料金", zh: "价格" },
        body: {
          ko: "임플란트 1개 800,000–1,800,000원, 투명교정 3,000,000–6,000,000원, 치아미백 200,000–500,000원이 일반적입니다.",
          en: "Single implant 800k–1.8M KRW, clear aligners 3–6M KRW, whitening 200k–500k KRW.",
          ja: "インプラント1本80〜180万ウォン、透明矯正300〜600万ウォン、ホワイトニング20〜50万ウォン。",
          zh: "种植1颗80–180万韩元、隐形矫正300–600万韩元、美白20–50万韩元。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "한국 임플란트 보증 기간은?", en: "What's the warranty on Korean implants?", ja: "韓国のインプラント保証期間は?", zh: "韩国种植牙保修期是?" },
        a: {
          ko: "대부분 5~10년이며 일부 클리닉은 평생 보증을 제공합니다. 정기 검진 조건이 붙는 경우가 많습니다.",
          en: "Most warranties are 5–10 years; some clinics offer lifetime warranty. Regular check-ups are usually a condition.",
          ja: "通常5〜10年、一部のクリニックは生涯保証を提供します。定期検診が条件のことが多いです。",
          zh: "通常5–10年,部分诊所提供终身保修。多数附定期检查条件。",
        },
      },
    ],
  },
  {
    slug: "ophthalmology",
    specialty: "안과",
    title: {
      ko: "한국 안과 가이드 — 라식·라섹·스마일",
      en: "Korean Ophthalmology Guide: LASIK, LASEK & SMILE",
      ja: "韓国の眼科ガイド — LASIK・LASEK・SMILE",
      zh: "韩国眼科指南 — LASIK·LASEK·SMILE",
    },
    lede: {
      ko: "한국 안과는 시력교정수술 분야에서 세계적 수술량과 안전성을 자랑합니다. ReLEx SMILE, LASIK, LASEK 등 최신 술식이 모두 가능합니다.",
      en: "Korean ophthalmology is renowned for vision correction surgery volume and safety. The latest procedures — ReLEx SMILE, LASIK, LASEK — are all available.",
      ja: "韓国の眼科は視力矯正手術で世界的な症例数と安全性を誇ります。ReLEx SMILE、LASIK、LASEKなど最新術式が可能です。",
      zh: "韩国眼科在视力矫正手术领域以全球手术量与安全性著称。可提供ReLEx SMILE、LASIK、LASEK等最新术式。",
    },
    sections: [
      {
        heading: { ko: "수술 비용", en: "Surgery Cost", ja: "手術費用", zh: "手术费用" },
        body: {
          ko: "라식 1,500,000–2,500,000원, 라섹 1,500,000–2,000,000원, 스마일라식 2,500,000–3,500,000원 수준이며, 모두 비급여입니다.",
          en: "LASIK 1.5–2.5M KRW, LASEK 1.5–2M KRW, SMILE 2.5–3.5M KRW. All are out-of-pocket.",
          ja: "LASIK 150〜250万ウォン、LASEK 150〜200万ウォン、SMILE 250〜350万ウォン。すべて自由診療です。",
          zh: "LASIK 150–250万韩元、LASEK 150–200万韩元、SMILE 250–350万韩元。均为自费。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "수술 후 회복은 얼마나 걸리나요?", en: "How long is the recovery?", ja: "術後の回復は?", zh: "术后恢复需要多久?" },
        a: {
          ko: "라식·스마일은 다음 날부터 일상생활 가능, 라섹은 7~10일 정도 시력 안정에 시간이 걸립니다.",
          en: "LASIK and SMILE allow normal activity from the next day. LASEK requires 7–10 days for vision to stabilize.",
          ja: "LASIK・SMILEは翌日から日常生活可能、LASEKは7〜10日視力安定に時間がかかります。",
          zh: "LASIK·SMILE次日可恢复日常活动,LASEK需7–10天视力稳定。",
        },
      },
    ],
  },
  {
    slug: "korean-medicine",
    specialty: "한의원",
    title: {
      ko: "한국 한의원 가이드 — 침·한약·다이어트",
      en: "Korean Medicine Guide: Acupuncture, Herbal & Diet",
      ja: "韓国の韓医院ガイド — 鍼・漢方薬・ダイエット",
      zh: "韩医院指南 — 针灸·中药·瘦身",
    },
    lede: {
      ko: "한의학은 한국의 전통 의학 체계로, 침·뜸·한약을 통한 통합 치료를 제공합니다. 다이어트 한약, 비만 클리닉, 침 통증치료가 외국인에게 인기 있습니다.",
      en: "Korean traditional medicine offers integrated treatments through acupuncture, moxibustion and herbal medicine. Weight-loss herbs, obesity clinics and acupuncture for pain are popular with foreign visitors.",
      ja: "韓国の伝統医学である韓医学は、鍼・お灸・漢方薬による統合治療を提供します。ダイエット漢方、肥満クリニック、鍼治療が外国人に人気です。",
      zh: "韩医学是韩国传统医学体系,通过针灸、艾灸和中药提供综合治疗。瘦身中药、肥胖诊所与针灸止痛深受外国游客喜爱。",
    },
    sections: [
      {
        heading: { ko: "주요 치료", en: "Common Treatments", ja: "主な治療", zh: "主要治疗" },
        body: {
          ko: "다이어트 한약, 추나요법(척추 교정), 침·약침, 어혈제거 부항, 사상체질 진단 등이 대표적입니다.",
          en: "Weight-loss herbal medicine, Chuna therapy (spinal correction), acupuncture and pharmaco-acupuncture, cupping, and Sasang constitutional diagnosis.",
          ja: "ダイエット漢方、推拿療法(脊椎矯正)、鍼・薬鍼、瘀血除去カッピング、四象体質診断などが代表的です。",
          zh: "瘦身中药、推拿(脊椎矫正)、针灸·药针、拔罐、四象体质诊断等。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "한의원에서 영어 진료 가능한가요?", en: "Are English services available?", ja: "英語対応の韓医院は?", zh: "有英语服务的韩医院吗?" },
        a: {
          ko: "외국인 환자 등록 한의원에서는 영어·일본어·중국어 진료가 제공됩니다. 강남·홍대 일대에 다수 위치합니다.",
          en: "Foreign-patient-registered Korean medicine clinics offer English, Japanese and Chinese consultations, especially in Gangnam and Hongdae.",
          ja: "外国人患者登録韓医院では英・日・中語診療が提供されます。江南・弘大エリアに多数あります。",
          zh: "外国患者登记韩医院提供英·日·中语诊疗,江南·弘大地区较多。",
        },
      },
    ],
  },
];

export function getGuide(slug: string): GuideContent | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
