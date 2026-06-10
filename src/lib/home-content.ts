/**
 * 홈페이지용 다국어 콘텐츠 — FAQ, 신뢰 배지, 가치 제안.
 * 모두 사실 기반 (HIRA 공공데이터 + 의료법 제56조 준수). 과장·허위 없음.
 */

export type HomeFAQItem = { q: string; a: string };

export function getHomeFAQ(locale: string): HomeFAQItem[] {
  if (locale === "en") {
    return [
      {
        q: "Is CAREMAP free to use?",
        a: "Yes. CAREMAP is a completely free directory of Korean clinics and hospitals. We aggregate official public data from HIRA (Health Insurance Review & Assessment Service) so you can search, compare and contact clinics at no cost.",
      },
      {
        q: "How accurate is the clinic information?",
        a: "All clinic data — names, addresses, phone numbers, number of doctors and specialties — comes directly from Korea's HIRA public dataset, the official government source for medical institution records. We refresh the data regularly.",
      },
      {
        q: "Can foreigners visit these clinics?",
        a: "Many Korean clinics, especially in Gangnam (Seoul) and Busan, are registered to serve international patients and offer interpreter services. Look for clinics with higher doctor counts and check our region guides for medical-tourism-friendly areas.",
      },
      {
        q: "How do I find the nearest clinic?",
        a: "Use the \"Find clinics near me\" button on the home page. With your permission, CAREMAP sorts all clinics by real distance from your location — across every page, not just the current one.",
      },
      {
        q: "Are the reviews real?",
        a: "Reviews are written by registered CAREMAP members and are personal opinions, not medical advertising. Per Article 56 of Korea's Medical Service Act, we do not inject fabricated ratings or promotional claims. Always consult medical professionals directly.",
      },
      {
        q: "What kinds of clinics can I find?",
        a: "Plastic surgery, dermatology, dental, ophthalmology, Korean medicine, orthopedics, ENT, internal medicine and more — with a focus on out-of-pocket (non-covered) and cosmetic care across all 17 provinces of Korea.",
      },
    ];
  }
  if (locale === "ja") {
    return [
      {
        q: "CAREMAPは無料で使えますか?",
        a: "はい。CAREMAPは韓国のクリニック・病院を検索できる完全無料のディレクトリです。健康保険審査評価院(HIRA)の公共データを集約しており、検索・比較・問い合わせがすべて無料です。",
      },
      {
        q: "クリニック情報はどのくらい正確ですか?",
        a: "クリニック名・住所・電話番号・医師数・診療科は、韓国政府の公式医療機関データであるHIRA公共データセットから直接取得しています。データは定期的に更新されます。",
      },
      {
        q: "外国人でも受診できますか?",
        a: "江南(ソウル)や釜山を中心に、多くのクリニックが外国人患者登録を行い通訳サービスを提供しています。医師数の多いクリニックを選び、地域ガイドで医療観光に適したエリアをご確認ください。",
      },
      {
        q: "近くのクリニックを探すには?",
        a: "ホームの「現在地から近いクリニック」ボタンをご利用ください。位置情報を許可すると、CAREMAPが全ページ横断で実際の距離順に並べ替えます。",
      },
      {
        q: "レビューは本物ですか?",
        a: "レビューは登録会員による個人的な意見であり、医療広告ではありません。韓国医療法第56条に基づき、虚偽の評価や宣伝文句は一切挿入しません。必ず医療スタッフに直接ご相談ください。",
      },
      {
        q: "どんな診療科がありますか?",
        a: "美容整形・皮膚科・歯科・眼科・韓医院・整形外科・耳鼻咽喉科・内科など、自由診療(非保険)・美容を中心に、韓国全17地域のクリニックを検索できます。",
      },
    ];
  }
  if (locale === "zh") {
    return [
      {
        q: "CAREMAP是免费的吗?",
        a: "是的。CAREMAP是一个完全免费的韩国诊所与医院目录。我们汇总健康保险审查评价院(HIRA)的公共数据,您可以免费搜索、比较并联系诊所。",
      },
      {
        q: "诊所信息有多准确?",
        a: "诊所名称、地址、电话、医师人数和科室均直接来自韩国政府官方医疗机构数据HIRA公共数据集。数据定期更新。",
      },
      {
        q: "外国人可以就诊吗?",
        a: "以江南(首尔)和釜山为中心,许多诊所已登记接待外国患者并提供翻译服务。建议选择医师较多的诊所,并查看地区指南了解适合医疗旅游的区域。",
      },
      {
        q: "如何查找最近的诊所?",
        a: "请使用首页的\"查找附近诊所\"按钮。授权位置后,CAREMAP会跨全部页面按实际距离为您排序。",
      },
      {
        q: "评论是真实的吗?",
        a: "评论由注册会员撰写,为个人意见,并非医疗广告。依据韩国医疗法第56条,我们不会注入虚假评分或宣传内容。请务必直接咨询医务人员。",
      },
      {
        q: "可以找到哪些类型的诊所?",
        a: "整形外科、皮肤科、牙科、眼科、韩医院、骨科、耳鼻喉科、内科等,以自费(非医保)和美容项目为主,覆盖韩国全部17个地区。",
      },
    ];
  }
  // ko (default)
  return [
    {
      q: "CAREMAP은 무료인가요?",
      a: "네, CAREMAP은 전국 병원·의원·치과·한의원 정보를 무료로 검색·비교할 수 있는 의료 디렉토리입니다. 건강보험심사평가원(HIRA) 공공데이터를 기반으로 하며 이용에 어떠한 비용도 들지 않습니다.",
    },
    {
      q: "병원 정보는 얼마나 정확한가요?",
      a: "상호명·주소·전화번호·의사 수·진료과목 등 모든 정보는 대한민국 정부 공식 의료기관 데이터인 건강보험심사평가원(HIRA) 공공데이터에서 직접 가져옵니다. 데이터는 주기적으로 갱신됩니다.",
    },
    {
      q: "가까운 병원은 어떻게 찾나요?",
      a: "홈 화면의 \"내 근처 클리닉 찾기\" 버튼을 누르세요. 위치 권한을 허용하면 CAREMAP이 전체 검색 결과를 실제 거리순으로 정렬해 드립니다. (1페이지뿐 아니라 전국 결과 전체 기준)",
    },
    {
      q: "후기는 실제 이용자가 쓴 건가요?",
      a: "후기는 가입한 CAREMAP 회원이 직접 작성한 개인 의견이며 의료광고가 아닙니다. 의료법 제56조에 따라 가짜 평점이나 과장된 홍보 문구를 임의로 삽입하지 않습니다. 시술 결정은 반드시 의료진과 직접 상담하세요.",
    },
    {
      q: "어떤 진료과를 찾을 수 있나요?",
      a: "성형외과·피부과·치과·안과·한의원·정형외과·이비인후과·내과 등 비급여·미용 진료를 중심으로 전국 17개 시·도의 의료기관을 검색할 수 있습니다.",
    },
    {
      q: "외국인도 이용할 수 있나요?",
      a: "강남(서울)·부산 등을 중심으로 다수의 클리닉이 외국인 환자 등록 의료기관으로 통역 서비스를 제공합니다. CAREMAP은 한국어·영어·일본어·중국어 4개 언어를 지원합니다.",
    },
  ];
}

/** 신뢰 배지 — 사실 기반 가치 제안 */
export function getTrustBadges(locale: string): { icon: string; title: string; desc: string }[] {
  if (locale === "en") {
    return [
      { icon: "🏛️", title: "Official HIRA Data", desc: "Government-sourced medical records" },
      { icon: "🆓", title: "100% Free", desc: "No fees, no sign-up to search" },
      { icon: "🌐", title: "4 Languages", desc: "Korean · English · Japanese · Chinese" },
      { icon: "⚖️", title: "Law-Compliant", desc: "Article 56 Medical Service Act" },
    ];
  }
  if (locale === "ja") {
    return [
      { icon: "🏛️", title: "HIRA公式データ", desc: "政府提供の医療機関情報" },
      { icon: "🆓", title: "完全無料", desc: "登録不要・検索無料" },
      { icon: "🌐", title: "4か国語対応", desc: "韓・英・日・中" },
      { icon: "⚖️", title: "医療法準拠", desc: "医療法第56条遵守" },
    ];
  }
  if (locale === "zh") {
    return [
      { icon: "🏛️", title: "HIRA官方数据", desc: "政府医疗机构记录" },
      { icon: "🆓", title: "完全免费", desc: "无需注册即可搜索" },
      { icon: "🌐", title: "支持4种语言", desc: "韩·英·日·中" },
      { icon: "⚖️", title: "合规运营", desc: "遵守医疗法第56条" },
    ];
  }
  return [
    { icon: "🏛️", title: "HIRA 공식 데이터", desc: "정부 공공데이터 기반" },
    { icon: "🆓", title: "100% 무료", desc: "가입 없이 바로 검색" },
    { icon: "🌐", title: "4개 언어 지원", desc: "한국어·영어·일본어·중국어" },
    { icon: "⚖️", title: "의료법 준수", desc: "의료법 제56조 기반 운영" },
  ];
}
