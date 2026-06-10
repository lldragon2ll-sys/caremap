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
  {
    slug: "hair-transplant",
    specialty: "성형외과",
    title: {
      ko: "한국 모발이식 가이드 (탈모·헤어라인)",
      en: "Hair Transplant in Korea: Complete Guide",
      ja: "韓国の植毛ガイド (薄毛・ヘアライン)",
      zh: "韩国植发指南 (脱发·发际线)",
    },
    lede: {
      ko: "한국은 모발이식 분야에서 세계적으로 손꼽히는 기술력을 보유하고 있습니다. 강남 일대를 중심으로 비절개(FUE)와 절개(FUT) 방식을 모두 시행하는 전문 의료기관이 밀집해 있으며, 모든 시술은 의료법 제56조에 따른 정식 의료기관에서만 이루어집니다.",
      en: "Korea is recognized worldwide for its hair transplant expertise. Specialized clinics concentrated in Gangnam perform both non-incisional (FUE) and incisional (FUT) techniques, and all procedures are carried out only at licensed institutions under Article 56 of the Medical Service Act.",
      ja: "韓国は植毛分野で世界トップクラスの技術力を誇ります。江南エリアを中心に非切開(FUE)・切開(FUT)の両方式を行う専門医療機関が集まり、すべての施術は医療法第56条に基づく正規医療機関のみで行われます。",
      zh: "韩国在植发领域拥有世界顶尖技术。以江南地区为中心,聚集了同时开展非切开(FUE)与切开(FUT)方式的专业医疗机构,所有手术仅在依据医疗法第56条的正规医疗机构进行。",
    },
    sections: [
      {
        heading: { ko: "주요 시술 방식", en: "Main Techniques", ja: "主な施術方式", zh: "主要术式" },
        body: {
          ko: "비절개(FUE)는 뒤통수에서 모낭을 하나씩 채취해 흉터가 거의 없고 회복이 빠릅니다. 절개(FUT)는 두피를 절개해 한 번에 많은 모낭을 확보하므로 대면적 이식에 적합합니다. 이 외에 헤어라인 교정, 정수리(가마) 보강, 이마축소, 눈썹·수염 이식이 대표적입니다. 비절개와 절개 중 선택은 탈모 범위·모발 밀도·예산에 따라 의료진과 상담해 결정합니다.",
          en: "FUE (non-incisional) extracts follicles one by one from the back of the head, leaving minimal scarring and allowing fast recovery. FUT (incisional) removes a strip of scalp to harvest many follicles at once, suited to large-area grafts. Other common procedures include hairline correction, crown reinforcement, forehead reduction, and eyebrow/beard transplants. The choice between FUE and FUT depends on the extent of hair loss, density, and budget — discuss with your medical team.",
          ja: "FUE(非切開)は後頭部から毛包を1つずつ採取し、傷跡がほとんどなく回復が早いです。FUT(切開)は頭皮を切開して一度に多くの毛包を確保するため、広範囲移植に適しています。その他、ヘアライン矯正、つむじ補強、額縮小、眉・髭の移植が代表的です。FUEとFUTの選択は薄毛範囲・毛髪密度・予算により医療陣と相談して決定します。",
          zh: "FUE(非切开)从后枕部逐个提取毛囊,几乎无疤痕、恢复快。FUT(切开)切取头皮一次性获取大量毛囊,适合大面积移植。此外还有发际线矫正、头顶(旋)加密、缩额、眉毛·胡须移植等。FUE与FUT的选择需根据脱发范围·毛发密度·预算与医疗团队商议决定。",
        },
      },
      {
        heading: { ko: "비용 가이드", en: "Cost Guide", ja: "費用ガイド", zh: "费用指南" },
        body: {
          ko: "모발이식 비용은 보통 이식 모낭(그래프트) 수 단위로 책정됩니다. 일반적으로 2,000~3,000 모낭 단위 시술이 많으며 모낭당 단가는 의료기관·방식(FUE/FUT)·로봇 장비 사용 여부에 따라 차이가 큽니다. 모든 시술은 비급여이므로 반드시 사전 견적과 총 모낭 수 기준 명세를 확인하세요. 사후관리(약물·두피 케어) 포함 여부도 함께 확인하는 것이 좋습니다.",
          en: "Hair transplant pricing is usually based on the number of grafts (follicular units). Procedures of 2,000–3,000 grafts are common, and per-graft pricing varies significantly by clinic, technique (FUE/FUT), and whether robotic equipment is used. All procedures are out-of-pocket, so always confirm an estimate and an itemized total-graft quote. Also check whether aftercare (medication, scalp care) is included.",
          ja: "植毛費用は通常、移植する毛包(グラフト)数単位で算定されます。一般的に2,000〜3,000グラフトの施術が多く、グラフト単価は医療機関・方式(FUE/FUT)・ロボット機器の使用有無により差が大きいです。すべて自由診療のため、必ず事前見積もりと総グラフト数基準の明細をご確認ください。アフターケア(薬剤・頭皮ケア)の含有有無も確認しましょう。",
          zh: "植发费用通常按移植毛囊(毛囊单位)数量计价。一般2,000–3,000株的手术较常见,每株单价因诊所·方式(FUE/FUT)·是否使用机器人设备差异较大。所有项目均为自费,请务必确认报价单及按总毛囊数列出的明细。同时建议确认术后护理(药物·头皮护理)是否包含。",
        },
      },
      {
        heading: { ko: "회복과 결과", en: "Recovery & Results", ja: "回復と結果", zh: "恢复与效果" },
        body: {
          ko: "이식 후 2~3주 내 이식모가 일시적으로 빠지는 휴지기 탈락이 정상적으로 나타나며, 새 모발은 보통 3~4개월부터 자라기 시작해 9~12개월에 밀도가 안정됩니다. 시술 후 일정 기간 음주·흡연·격렬한 운동·사우나는 제한됩니다. 결과에는 개인차가 있으므로 의료진과 충분히 상담하고, 경과 사진과 사후관리 일정을 서면으로 안내받는 것이 좋습니다.",
          en: "A temporary 'shock loss' of transplanted hair within 2–3 weeks is normal; new hair typically starts growing from 3–4 months and density stabilizes around 9–12 months. Alcohol, smoking, strenuous exercise, and saunas are restricted for a period after surgery. Results vary individually, so consult thoroughly with your medical team and ask for progress photos and a written aftercare schedule.",
          ja: "移植後2〜3週間以内に移植毛が一時的に抜ける休止期脱落は正常な反応で、新しい毛髪は通常3〜4ヶ月から生え始め、9〜12ヶ月で密度が安定します。施術後一定期間は飲酒・喫煙・激しい運動・サウナが制限されます。結果には個人差があるため、医療陣と十分相談し、経過写真とアフターケア日程を書面でご案内いただくことをお勧めします。",
          zh: "移植后2–3周内移植毛暂时脱落的休止期脱落属正常现象,新发通常从3–4个月开始生长,9–12个月密度趋于稳定。术后一段时间需限制饮酒·吸烟·剧烈运动·桑拿。效果因人而异,请与医疗团队充分沟通,并要求提供经过照片与书面术后护理日程。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "모발이식 후 흉터가 남나요?", en: "Will there be scarring after a hair transplant?", ja: "植毛後に傷跡は残りますか?", zh: "植发后会留疤吗?" },
        a: {
          ko: "비절개(FUE)는 점 형태의 미세 흔적만 남아 짧은 머리에도 눈에 잘 띄지 않습니다. 절개(FUT)는 채취 부위에 선형 흉터가 남을 수 있습니다. 방식별 차이를 의료진과 상담하세요.",
          en: "FUE leaves only tiny dot-like marks, barely visible even with short hair. FUT may leave a linear scar at the donor site. Discuss the differences with your medical team.",
          ja: "FUEは点状の微細な痕のみで、短髪でも目立ちにくいです。FUTは採取部位に線状の傷跡が残る場合があります。方式別の違いを医療陣にご相談ください。",
          zh: "FUE仅留下点状细微痕迹,即使短发也不明显。FUT在供区可能留下线状疤痕。请就方式差异咨询医疗团队。",
        },
      },
      {
        q: { ko: "외국인도 통역 지원을 받을 수 있나요?", en: "Is interpreter support available for foreigners?", ja: "外国人も通訳サポートを受けられますか?", zh: "外国人能获得翻译支持吗?" },
        a: {
          ko: "외국인 환자 등록 의료기관에서는 영어·일본어·중국어 통역이 제공됩니다. 강남 일대에 다수 위치하며, 예약 시 통역 가능 언어를 먼저 확인하세요.",
          en: "Foreign-patient-registered clinics provide English, Japanese, and Chinese interpretation, many located in Gangnam. Confirm available languages when booking.",
          ja: "外国人患者登録医療機関では英・日・中語の通訳が提供されます。江南エリアに多数あり、予約時に対応言語をご確認ください。",
          zh: "外国患者登记医疗机构提供英·日·中语翻译,多位于江南地区。预约时请先确认可提供的语言。",
        },
      },
    ],
  },
  {
    slug: "obesity",
    specialty: "가정의학과",
    title: {
      ko: "한국 비만·체형 클리닉 가이드",
      en: "Weight & Body Contouring Clinics in Korea",
      ja: "韓国の肥満・ボディ管理クリニックガイド",
      zh: "韩国减肥·体形管理诊所指南",
    },
    lede: {
      ko: "한국의 비만·체형 클리닉은 내과·가정의학과 전문의의 의학적 평가를 기반으로 운영됩니다. 식이·운동 상담부터 의료기기 기반 체형관리까지 다양한 프로그램이 있으며, 모든 의료 행위는 의료법에 따른 정식 의료기관에서 이루어집니다.",
      en: "Weight and body-contouring clinics in Korea operate on the basis of medical evaluation by internal medicine and family medicine specialists. Programs range from diet and exercise counseling to device-based body care, and all medical procedures take place at licensed institutions under the Medical Service Act.",
      ja: "韓国の肥満・ボディ管理クリニックは、内科・家庭医学科専門医による医学的評価に基づいて運営されます。食事・運動相談から医療機器ベースのボディケアまで多様なプログラムがあり、すべての医療行為は医療法に基づく正規医療機関で行われます。",
      zh: "韩国的减肥·体形管理诊所基于内科·家庭医学科专科医师的医学评估运营。项目涵盖饮食·运动咨询到基于医疗设备的体形管理,所有医疗行为均在依据医疗法的正规医疗机构进行。",
    },
    sections: [
      {
        heading: { ko: "프로그램 유형", en: "Program Types", ja: "プログラムの種類", zh: "项目类型" },
        body: {
          ko: "비만 클리닉의 프로그램은 크게 (1) 의학적 상담·검사 기반 체중관리 (2) 식이·생활습관 코칭 (3) 의료기기를 활용한 체형관리로 나뉩니다. 시작 전 기초대사량·체성분 검사, 혈액검사 등 건강 평가가 선행되는 것이 일반적입니다. 개인의 건강 상태에 따라 적합한 방법이 다르므로 반드시 전문의 상담을 거쳐야 합니다.",
          en: "Obesity clinic programs broadly fall into (1) medically supervised weight management based on consultation and testing, (2) diet and lifestyle coaching, and (3) device-based body care. A health assessment — basal metabolic rate, body composition, blood tests — typically precedes any program. The right approach varies by individual health status, so a specialist consultation is essential.",
          ja: "肥満クリニックのプログラムは大きく(1)医学的相談・検査ベースの体重管理(2)食事・生活習慣コーチング(3)医療機器を活用したボディ管理に分かれます。開始前に基礎代謝量・体成分検査、血液検査などの健康評価が先行するのが一般的です。個人の健康状態により適した方法が異なるため、必ず専門医相談が必要です。",
          zh: "减肥诊所项目大致分为(1)基于医学咨询·检查的体重管理(2)饮食·生活习惯指导(3)利用医疗设备的体形管理。开始前通常先进行基础代谢量·体成分检查、血液检查等健康评估。适合的方法因个人健康状况而异,务必经过专科医师咨询。",
        },
      },
      {
        heading: { ko: "안전 수칙", en: "Safety Notes", ja: "安全に関する注意", zh: "安全须知" },
        body: {
          ko: "체중 감량은 의학적 관리하에 점진적으로 진행하는 것이 안전합니다. 처방이 필요한 의약품은 반드시 의사 진료 후 처방받아야 하며, 효과·부작용은 개인차가 있습니다. 과도한 단기 감량이나 검증되지 않은 방법은 건강에 해로울 수 있으므로, 의료진과 충분히 상담하고 정기적인 경과 관찰을 받는 것이 중요합니다.",
          en: "Weight loss is safest when done gradually under medical supervision. Prescription medications must be prescribed only after a doctor's examination, and effects and side effects vary by individual. Excessive rapid weight loss or unverified methods can harm your health, so consult thoroughly with your medical team and undergo regular follow-up.",
          ja: "減量は医学的管理のもとで段階的に進めるのが安全です。処方が必要な医薬品は必ず医師の診療後に処方を受ける必要があり、効果・副作用には個人差があります。過度な短期減量や検証されていない方法は健康に害を及ぼす可能性があるため、医療陣と十分相談し、定期的な経過観察を受けることが重要です。",
          zh: "在医学管理下循序渐进地减重最为安全。需处方的药品必须经医师诊疗后开具,效果·副作用因人而异。过度短期减重或未经验证的方法可能损害健康,请与医疗团队充分沟通并接受定期复查。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "비만 클리닉은 보험이 적용되나요?", en: "Is obesity treatment covered by insurance?", ja: "肥満クリニックは保険適用されますか?", zh: "减肥诊所适用医保吗?" },
        a: {
          ko: "미용·체형 목적의 관리는 대부분 비급여입니다. 다만 비만이 동반 질환(당뇨·고혈압 등) 치료와 연관된 경우 일부 급여가 적용될 수 있으니 의료기관에 확인하세요.",
          en: "Cosmetic and body-shaping care is mostly out-of-pocket. However, if obesity is linked to treatment of comorbidities (diabetes, hypertension, etc.), some coverage may apply — check with the clinic.",
          ja: "美容・ボディ目的の管理はほとんど自由診療です。ただし肥満が合併疾患(糖尿病・高血圧など)の治療に関連する場合、一部保険適用される場合があるため医療機関にご確認ください。",
          zh: "美容·塑形目的的管理大多为自费。但如肥胖与合并症(糖尿病·高血压等)治疗相关,部分可能适用医保,请向医疗机构确认。",
        },
      },
    ],
  },
  {
    slug: "health-checkup",
    specialty: "내과",
    title: {
      ko: "한국 건강검진 가이드 (종합검진·의료관광)",
      en: "Health Checkups in Korea: Comprehensive Screening Guide",
      ja: "韓国の健康診断ガイド (総合検診・医療観光)",
      zh: "韩国体检指南 (综合体检·医疗旅游)",
    },
    lede: {
      ko: "한국의 종합건강검진은 신속한 진행과 높은 정밀도로 의료관광객에게도 인기가 높습니다. 상급종합병원과 전문 검진센터가 영상검사·내시경·혈액검사 등을 하루 또는 1박 2일 패키지로 제공하며, 외국인 환자를 위한 다국어 검진 패키지도 운영됩니다.",
      en: "Korea's comprehensive health checkups are popular among medical tourists for their speed and precision. Tertiary hospitals and dedicated screening centers offer imaging, endoscopy, and blood tests in one-day or two-day packages, including multilingual checkup packages for international patients.",
      ja: "韓国の総合健康診断は、迅速な進行と高い精度で医療観光客にも人気です。上級総合病院や専門検診センターが画像検査・内視鏡・血液検査などを日帰りまたは1泊2日パッケージで提供し、外国人患者向けの多言語検診パッケージも運営されています。",
      zh: "韩国的综合体检以高效快捷和高精度深受医疗游客欢迎。上级综合医院和专业体检中心以一日或两日套餐提供影像检查·内镜·血液检查等,并为外国患者运营多语言体检套餐。",
    },
    sections: [
      {
        heading: { ko: "검진 항목", en: "What's Included", ja: "検診項目", zh: "检查项目" },
        body: {
          ko: "기본 종합검진은 신체계측, 혈액·소변검사, 흉부 X선, 심전도, 복부 초음파, 위·대장 내시경을 포함하는 경우가 많습니다. 정밀 패키지에는 CT·MRI·PET-CT, 심장·뇌혈관 검사, 암표지자 검사 등이 추가됩니다. 연령·성별·가족력에 따라 권장 항목이 다르므로, 검진센터와 상담해 본인에게 맞는 구성을 선택하세요.",
          en: "A basic comprehensive checkup often includes body measurements, blood/urine tests, chest X-ray, ECG, abdominal ultrasound, and gastric/colon endoscopy. Advanced packages add CT/MRI/PET-CT, cardiac and cerebrovascular tests, and tumor-marker screening. Recommended items vary by age, sex, and family history — consult the screening center to choose a fitting plan.",
          ja: "基本的な総合検診は、身体計測、血液・尿検査、胸部X線、心電図、腹部超音波、胃・大腸内視鏡を含むことが多いです。精密パッケージにはCT・MRI・PET-CT、心臓・脳血管検査、腫瘍マーカー検査などが追加されます。年齢・性別・家族歴により推奨項目が異なるため、検診センターと相談してご自身に合った構成をお選びください。",
          zh: "基础综合体检通常包括身体测量、血液·尿液检查、胸部X光、心电图、腹部超声、胃·肠内镜。精密套餐增加CT·MRI·PET-CT、心脏·脑血管检查、肿瘤标志物检查等。推荐项目因年龄·性别·家族史而异,请咨询体检中心选择适合自己的方案。",
        },
      },
      {
        heading: { ko: "예약과 결과", en: "Booking & Results", ja: "予約と結果", zh: "预约与结果" },
        body: {
          ko: "검진은 보통 사전 예약제로 운영되며, 위·대장 내시경 포함 시 전날 식이 조절과 장 정결제 복용이 필요합니다. 결과는 검진 후 1~2주 내 제공되며, 외국인 환자는 영문 결과지와 의사 소견서를 요청할 수 있습니다. 이상 소견 발견 시 동일 병원 내 진료과 연계가 가능한 곳을 선택하면 편리합니다.",
          en: "Checkups are usually by advance reservation; if gastric/colon endoscopy is included, dietary restriction and bowel-prep the day before are required. Results are typically provided within 1–2 weeks, and international patients can request English result reports and a physician's opinion. Choosing a center that can refer you to in-house departments if abnormalities are found is convenient.",
          ja: "検診は通常事前予約制で、胃・大腸内視鏡を含む場合は前日の食事制限と腸洗浄剤の服用が必要です。結果は検診後1〜2週間以内に提供され、外国人患者は英文結果票と医師の所見書を依頼できます。異常所見が見つかった場合に同一病院内の診療科へ連携できる施設を選ぶと便利です。",
          zh: "体检通常采用预约制,如含胃·肠内镜,需前一天饮食控制并服用肠道清洁剂。结果一般在体检后1–2周内提供,外国患者可申请英文结果单与医师意见书。如发现异常,选择可在同院内转诊相关科室的机构较为便利。",
        },
      },
    ],
    faq: [
      {
        q: { ko: "외국인도 건강검진을 받을 수 있나요?", en: "Can foreigners get a health checkup?", ja: "外国人も健康診断を受けられますか?", zh: "外国人可以体检吗?" },
        a: {
          ko: "네, 다수의 상급종합병원과 검진센터가 외국인 전용 다국어 패키지를 운영합니다. 여권 지참이 필요하며, 영문 결과지 발급이 가능합니다.",
          en: "Yes — many tertiary hospitals and screening centers run multilingual packages for foreigners. Bring your passport; English result reports are available.",
          ja: "はい、多くの上級総合病院や検診センターが外国人専用の多言語パッケージを運営しています。パスポート持参が必要で、英文結果票の発行が可能です。",
          zh: "可以,许多上级综合医院和体检中心运营外国人专用多语言套餐。需携带护照,可开具英文结果单。",
        },
      },
    ],
  },
];

/** 모든 가이드에 공통으로 붙는 추가 섹션 (방문 전 체크리스트 + 예산 계획 + 의료법 안내) */
const COMMON_SECTIONS: GuideContent["sections"] = [
  {
    heading: {
      ko: "방문 전 사전 체크리스트",
      en: "Pre-visit Checklist",
      ja: "受診前のチェックリスト",
      zh: "就诊前清单",
    },
    body: {
      ko: "(1) 의료법 제56조 광고 사전심의 번호 확인 (2) 상담의와 집도의가 같은지 확인 (3) 마취과 전문의 상주 여부 (4) 시술 후 부작용·재수술 정책 명문화 여부 (5) 외국인 환자 등록 의료기관 인증 여부 (6) 통역 서비스 제공 언어 (7) 예약·취소·환불 정책 서면 확인 (8) 의료비 영수증 및 진단서 발급 가능 여부. 이 8가지를 전화 또는 첫 상담 시 반드시 확인하시기 바랍니다. CAREMAP은 HIRA(건강보험심사평가원) 공공데이터로 인증된 의료기관만 노출합니다.",
      en: "(1) Verify the medical advertising review number per Article 56 of the Korean Medical Service Act. (2) Confirm the consulting physician is the same as the surgeon. (3) Check that a board-certified anesthesiologist is on-site. (4) Get the side-effect / revision policy in writing. (5) Confirm the clinic is registered to serve foreign patients. (6) Ask which languages interpreters are available in. (7) Get the booking, cancellation, and refund policy in writing. (8) Confirm medical receipts and diagnostic certificates are available. Check all eight points by phone or at the first consultation. CAREMAP only lists clinics verified through Korea's HIRA public dataset.",
      ja: "(1)医療法第56条審議番号の確認 (2)カウンセリング医と執刀医が同一か (3)麻酔科専門医の常駐 (4)副作用・修正手術ポリシーの書面化 (5)外国人患者登録医療機関の認証 (6)通訳サービスの対応言語 (7)予約・キャンセル・返金ポリシーの書面確認 (8)医療費領収書・診断書の発行可否。以上8項目をお電話または初回カウンセリング時に必ずご確認ください。CAREMAPはHIRA(韓国公共データ)で認証された医療機関のみ掲載します。",
      zh: "(1)确认医疗法第56条审议号 (2)咨询医师与执刀医师是否一致 (3)是否有麻醉科专科医师驻诊 (4)书面确认副作用·修复手术政策 (5)外国患者登记医疗机构认证 (6)翻译服务支持的语言 (7)书面确认预约·取消·退款政策 (8)能否开具医疗费收据与诊断书。请通过电话或首次咨询时必须确认以上8项。CAREMAP仅展示通过韩国HIRA公共数据认证的医疗机构。",
    },
  },
  {
    heading: {
      ko: "예산 계획 가이드",
      en: "Budgeting Tips",
      ja: "予算計画ガイド",
      zh: "预算规划指南",
    },
    body: {
      ko: "비급여 시술은 의료기관별 가격 차이가 큽니다. 총 비용은 [시술비 + 마취비 + 입원비 + 검사비 + 회복실 사용료]로 구성되며, 견적서에 모두 명시되어야 합니다. 항공·숙박·통역을 포함한 의료관광 패키지의 경우 시술비의 1.3~1.5배 정도가 일반적인 총 예산입니다. 사후관리(드레싱·실밥 제거 등) 비용 포함 여부도 사전 확인이 필수입니다. 한국은 의료비 카드 분납이 보편적이며, 다수 의료기관에서 외화 결제(USD/JPY/CNY)를 지원합니다.",
      en: "Out-of-pocket procedure prices vary significantly between clinics. Total cost typically breaks down as [procedure + anesthesia + admission + lab + recovery room]; all should be itemized on the estimate. For medical tourism packages including flight, lodging, and interpretation, total budget is typically 1.3–1.5× the procedure cost. Confirm whether follow-up care (dressing, suture removal) is included. Korean clinics commonly offer installment payment and foreign currency (USD / JPY / CNY) payment is widely supported.",
      ja: "自由診療は医療機関ごとに価格差が大きいです。総費用は[施術料+麻酔料+入院料+検査料+回復室使用料]で構成され、見積書に明記される必要があります。航空・宿泊・通訳を含む医療観光パッケージの場合、施術費の1.3〜1.5倍が一般的な総予算です。アフターケア(包帯交換・抜糸など)費用の含有有無も事前確認必須。韓国はカード分割払いが一般的で、多数の医療機関が外貨決済(USD/JPY/CNY)をサポートします。",
      zh: "自费项目各诊所价格差异较大。总费用通常包括[手术费+麻醉费+住院费+检查费+恢复室使用费],均应在报价单中详细列出。如包含机票、住宿、翻译的医疗旅游套餐,总预算通常为手术费的1.3–1.5倍。请事先确认术后护理(换药、拆线等)是否包含。韩国诊所普遍支持信用卡分期付款,多数医院支持外币(USD/JPY/CNY)结算。",
    },
  },
  {
    heading: {
      ko: "한국 의료시스템 안내",
      en: "Understanding the Korean Medical System",
      ja: "韓国の医療システム",
      zh: "韩国医疗体系介绍",
    },
    body: {
      ko: "한국 의료기관은 [의원(1차) — 병원(2차) — 종합병원·상급종합(3차)]의 3단계로 분류됩니다. 비급여 미용·성형 시술은 주로 의원급에서 이루어지며, 상급종합병원은 중증 질환 위주입니다. 모든 의료기관은 의료법에 따라 면허 등록 후 운영되며, 시술 사진·광고는 의료법 제56조에 따른 사전심의 통과가 의무입니다. 외국인 환자는 의료비자(C-3-3)로 단기 체류 가능하며, 90일 이상은 의료관광비자(C-3-3 또는 G-1) 발급 가능. 한국의 외국인 환자 등록 의료기관은 보건복지부에서 인증을 관리합니다.",
      en: "Korean medical institutions are classified into 3 tiers: clinics (primary care), hospitals (secondary), and general / tertiary hospitals (advanced care). Out-of-pocket cosmetic and plastic surgery is mostly done at primary clinics, while tertiary hospitals focus on serious illness. All institutions operate under Korean Medical Service Act licensing, and any procedure photos or advertising require advance review under Article 56. Foreign patients may stay short-term on a medical visa (C-3-3); stays over 90 days require a medical tourism visa. Foreign-patient-registered institutions are certified by Korea's Ministry of Health and Welfare.",
      ja: "韓国の医療機関は[クリニック(1次)—病院(2次)—総合病院・上級総合(3次)]の3階層に分類されます。自由診療の美容・整形施術は主にクリニックで行われ、上級総合病院は重症疾患中心です。すべての医療機関は医療法に基づき免許登録後運営され、施術写真・広告は医療法第56条による事前審議通過が義務です。外国人患者は医療ビザ(C-3-3)で短期滞在可能、90日以上は医療観光ビザ発給可能。韓国の外国人患者登録医療機関は保健福祉部が認証管理します。",
      zh: "韩国医疗机构分为3级:诊所(一级)—医院(二级)—综合医院·上级综合医院(三级)。自费美容·整形项目主要在诊所进行,上级综合医院专注重症疾病。所有医疗机构均按韩国医疗法注册执照运营,任何手术照片或广告必须依据医疗法第56条通过事前审议。外国患者可凭医疗签证(C-3-3)短期停留,90天以上需医疗旅游签证。韩国外国患者登记医疗机构由保健福祉部认证管理。",
    },
  },
];

export function getGuide(slug: string): GuideContent | null {
  const base = GUIDES.find((g) => g.slug === slug);
  if (!base) return null;
  // 공통 섹션을 항상 끝에 붙임 (콘텐츠 깊이 증가 → SEO 강화)
  return { ...base, sections: [...base.sections, ...COMMON_SECTIONS] };
}
