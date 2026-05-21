/**
 * 한국어 → 다국어(영문/일본어/중국어) 매핑 사전.
 * 지명: 영어는 Revised Romanization, 일본어는 한자/카타카나, 중국어는 한자.
 * 진료과/종별: 한국 의료기관 분류 표준.
 */

type Lang = "ko" | "en" | "ja" | "zh" | string;

// 시도 (17개)
const SIDO_MAP: Record<string, { en: string; ja: string; zh: string }> = {
  "서울":   { en: "Seoul",     ja: "ソウル",   zh: "首尔" },
  "부산":   { en: "Busan",     ja: "釜山",     zh: "釜山" },
  "대구":   { en: "Daegu",     ja: "大邱",     zh: "大邱" },
  "인천":   { en: "Incheon",   ja: "仁川",     zh: "仁川" },
  "광주":   { en: "Gwangju",   ja: "光州",     zh: "光州" },
  "대전":   { en: "Daejeon",   ja: "大田",     zh: "大田" },
  "울산":   { en: "Ulsan",     ja: "蔚山",     zh: "蔚山" },
  "세종":   { en: "Sejong",    ja: "世宗",     zh: "世宗" },
  "경기":   { en: "Gyeonggi",  ja: "京畿",     zh: "京畿" },
  "강원":   { en: "Gangwon",   ja: "江原",     zh: "江原" },
  "충북":   { en: "Chungbuk",  ja: "忠清北道", zh: "忠清北道" },
  "충남":   { en: "Chungnam",  ja: "忠清南道", zh: "忠清南道" },
  "전북":   { en: "Jeonbuk",   ja: "全羅北道", zh: "全罗北道" },
  "전남":   { en: "Jeonnam",   ja: "全羅南道", zh: "全罗南道" },
  "경북":   { en: "Gyeongbuk", ja: "慶尚北道", zh: "庆尚北道" },
  "경남":   { en: "Gyeongnam", ja: "慶尚南道", zh: "庆尚南道" },
  "제주":   { en: "Jeju",      ja: "済州",     zh: "济州" },
};

// 진료과
const SPECIALTY_MAP: Record<string, { en: string; ja: string; zh: string }> = {
  "성형외과":         { en: "Plastic Surgery",       ja: "美容外科",       zh: "整形外科" },
  "피부과":           { en: "Dermatology",           ja: "皮膚科",         zh: "皮肤科" },
  "치과":             { en: "Dental",                ja: "歯科",           zh: "牙科" },
  "치과의원":         { en: "Dental Clinic",         ja: "歯科クリニック", zh: "牙科诊所" },
  "치과병원":         { en: "Dental Hospital",       ja: "歯科病院",       zh: "牙科医院" },
  "치과교정과":       { en: "Orthodontics",          ja: "歯科矯正",       zh: "牙齿矫正" },
  "소아치과":         { en: "Pediatric Dentistry",   ja: "小児歯科",       zh: "儿童牙科" },
  "구강악안면외과":   { en: "Oral & Maxillofacial",  ja: "口腔顎顔面外科", zh: "口腔颌面外科" },
  "안과":             { en: "Ophthalmology",         ja: "眼科",           zh: "眼科" },
  "한의원":           { en: "Korean Medicine",       ja: "韓医院",         zh: "韩医院" },
  "한방":             { en: "Korean Medicine",       ja: "韓方",           zh: "韩方" },
  "한방병원":         { en: "Korean Medicine Hospital", ja: "韓医院病院", zh: "韩医院医院" },
  "정신과":           { en: "Psychiatry",            ja: "精神科",         zh: "精神科" },
  "정신건강의학과":   { en: "Psychiatry",            ja: "精神科",         zh: "精神科" },
  "정형외과":         { en: "Orthopedics",           ja: "整形外科",       zh: "骨科" },
  "재활의학과":       { en: "Rehabilitation",        ja: "リハビリ科",     zh: "康复科" },
  "재활":             { en: "Rehabilitation",        ja: "リハビリ",       zh: "康复" },
  "마취통증의학과":   { en: "Pain Medicine",         ja: "麻酔疼痛科",     zh: "麻醉疼痛科" },
  "마취통증과":       { en: "Pain Medicine",         ja: "麻酔疼痛科",     zh: "麻醉疼痛科" },
  "통증":             { en: "Pain Medicine",         ja: "疼痛科",         zh: "疼痛科" },
  "비뇨의학과":       { en: "Urology",               ja: "泌尿器科",       zh: "泌尿外科" },
  "비뇨의학":         { en: "Urology",               ja: "泌尿器",         zh: "泌尿" },
  "산부인과":         { en: "OB/GYN",                ja: "産婦人科",       zh: "妇产科" },
  "가정의학과":       { en: "Family Medicine",       ja: "家庭医学科",     zh: "家庭医学科" },
  "가정의학":         { en: "Family Medicine",       ja: "家庭医学",       zh: "家庭医学" },
  "이비인후과":       { en: "ENT",                   ja: "耳鼻咽喉科",     zh: "耳鼻喉科" },
  "이비인후":         { en: "ENT",                   ja: "耳鼻咽喉",       zh: "耳鼻喉" },
  "소아청소년과":     { en: "Pediatrics",            ja: "小児科",         zh: "儿科" },
  "소아청소년":       { en: "Pediatrics",            ja: "小児",           zh: "儿科" },
  "내과":             { en: "Internal Medicine",     ja: "内科",           zh: "内科" },
  "외과":             { en: "General Surgery",       ja: "外科",           zh: "外科" },
  "신경외과":         { en: "Neurosurgery",          ja: "脳神経外科",     zh: "神经外科" },
  "신경과":           { en: "Neurology",             ja: "神経内科",       zh: "神经内科" },
  "심장혈관흉부외과": { en: "Cardiothoracic Surgery", ja: "心臓血管胸部外科", zh: "心血管胸外科" },
  "영상의학과":       { en: "Radiology",             ja: "放射線科",       zh: "放射科" },
  "방사선종양학과":   { en: "Radiation Oncology",    ja: "放射線腫瘍科",   zh: "放射肿瘤科" },
  "병리과":           { en: "Pathology",             ja: "病理科",         zh: "病理科" },
  "진단검사의학과":   { en: "Lab Medicine",          ja: "検査医学科",     zh: "检验医学科" },
  "응급의학과":       { en: "Emergency Medicine",    ja: "救急医学科",     zh: "急诊医学科" },
  "직업환경의학과":   { en: "Occupational Medicine", ja: "職業環境医学",   zh: "职业环境医学" },
  "예방의학과":       { en: "Preventive Medicine",   ja: "予防医学",       zh: "预防医学" },
  "핵의학과":         { en: "Nuclear Medicine",      ja: "核医学",         zh: "核医学" },
  "결핵과":           { en: "Tuberculosis",          ja: "結核科",         zh: "结核科" },
};

// 종별
const KIND_MAP: Record<string, { en: string; ja: string; zh: string }> = {
  "상급종합":     { en: "Tertiary Hospital",         ja: "上級総合病院",   zh: "上级综合医院" },
  "종합병원":     { en: "General Hospital",          ja: "総合病院",       zh: "综合医院" },
  "병원":         { en: "Hospital",                  ja: "病院",           zh: "医院" },
  "의원":         { en: "Clinic",                    ja: "クリニック",     zh: "诊所" },
  "치과의원":     { en: "Dental Clinic",             ja: "歯科クリニック", zh: "牙科诊所" },
  "치과병원":     { en: "Dental Hospital",           ja: "歯科病院",       zh: "牙科医院" },
  "한의원":       { en: "Korean Medicine Clinic",    ja: "韓医院",         zh: "韩医诊所" },
  "한방병원":     { en: "Korean Medicine Hospital",  ja: "韓医院病院",     zh: "韩医医院" },
  "요양병원":     { en: "Long-term Care Hospital",   ja: "療養病院",       zh: "疗养医院" },
  "정신병원":     { en: "Psychiatric Hospital",      ja: "精神科病院",     zh: "精神病院" },
  "조산원":       { en: "Midwifery Clinic",          ja: "助産院",         zh: "助产院" },
  "보건소":       { en: "Public Health Center",      ja: "保健所",         zh: "保健所" },
  "보건지소":     { en: "Public Health Sub-Center",  ja: "保健支所",       zh: "保健分所" },
  "보건진료소":   { en: "Community Health Clinic",   ja: "保健診療所",     zh: "社区保健诊所" },
  "보건의료원":   { en: "Community Health Hospital", ja: "保健医療院",     zh: "社区保健医院" },
};

// 시군구 — 자주 등장하는 곳만 (정확한 표기)
const SIGGU_MAP: Record<string, { en: string; ja: string; zh: string }> = {
  // 서울
  "강남구":     { en: "Gangnam-gu",      ja: "江南区",       zh: "江南区" },
  "서초구":     { en: "Seocho-gu",       ja: "瑞草区",       zh: "瑞草区" },
  "송파구":     { en: "Songpa-gu",       ja: "松坡区",       zh: "松坡区" },
  "강동구":     { en: "Gangdong-gu",     ja: "江東区",       zh: "江东区" },
  "강서구":     { en: "Gangseo-gu",      ja: "江西区",       zh: "江西区" },
  "양천구":     { en: "Yangcheon-gu",    ja: "陽川区",       zh: "阳川区" },
  "구로구":     { en: "Guro-gu",         ja: "九老区",       zh: "九老区" },
  "금천구":     { en: "Geumcheon-gu",    ja: "衿川区",       zh: "衿川区" },
  "영등포구":   { en: "Yeongdeungpo-gu", ja: "永登浦区",     zh: "永登浦区" },
  "동작구":     { en: "Dongjak-gu",      ja: "銅雀区",       zh: "铜雀区" },
  "관악구":     { en: "Gwanak-gu",       ja: "冠岳区",       zh: "冠岳区" },
  "마포구":     { en: "Mapo-gu",         ja: "麻浦区",       zh: "麻浦区" },
  "은평구":     { en: "Eunpyeong-gu",    ja: "恩平区",       zh: "恩平区" },
  "서대문구":   { en: "Seodaemun-gu",    ja: "西大門区",     zh: "西大门区" },
  "종로구":     { en: "Jongno-gu",       ja: "鍾路区",       zh: "钟路区" },
  "중구":       { en: "Jung-gu",         ja: "中区",         zh: "中区" },
  "용산구":     { en: "Yongsan-gu",      ja: "龍山区",       zh: "龙山区" },
  "성동구":     { en: "Seongdong-gu",    ja: "城東区",       zh: "城东区" },
  "광진구":     { en: "Gwangjin-gu",     ja: "広津区",       zh: "广津区" },
  "동대문구":   { en: "Dongdaemun-gu",   ja: "東大門区",     zh: "东大门区" },
  "중랑구":     { en: "Jungnang-gu",     ja: "中浪区",       zh: "中浪区" },
  "성북구":     { en: "Seongbuk-gu",     ja: "城北区",       zh: "城北区" },
  "강북구":     { en: "Gangbuk-gu",      ja: "江北区",       zh: "江北区" },
  "도봉구":     { en: "Dobong-gu",       ja: "道峰区",       zh: "道峰区" },
  "노원구":     { en: "Nowon-gu",        ja: "蘆原区",       zh: "芦原区" },
  // 부산
  "해운대구":   { en: "Haeundae-gu",     ja: "海雲台区",     zh: "海云台区" },
  "수영구":     { en: "Suyeong-gu",      ja: "水営区",       zh: "水营区" },
  "부산진구":   { en: "Busanjin-gu",     ja: "釜山鎮区",     zh: "釜山镇区" },
  "남구":       { en: "Nam-gu",          ja: "南区",         zh: "南区" },
  "동구":       { en: "Dong-gu",         ja: "東区",         zh: "东区" },
  "서구":       { en: "Seo-gu",          ja: "西区",         zh: "西区" },
  "북구":       { en: "Buk-gu",          ja: "北区",         zh: "北区" },
  "사하구":     { en: "Saha-gu",         ja: "沙下区",       zh: "沙下区" },
  "기장군":     { en: "Gijang-gun",      ja: "機張郡",       zh: "机张郡" },
  // 경기
  "수원시":     { en: "Suwon",           ja: "水原市",       zh: "水原市" },
  "성남시":     { en: "Seongnam",        ja: "城南市",       zh: "城南市" },
  "용인시":     { en: "Yongin",          ja: "龍仁市",       zh: "龙仁市" },
  "고양시":     { en: "Goyang",          ja: "高陽市",       zh: "高阳市" },
  "안산시":     { en: "Ansan",           ja: "安山市",       zh: "安山市" },
  "안양시":     { en: "Anyang",          ja: "安養市",       zh: "安养市" },
  "부천시":     { en: "Bucheon",         ja: "富川市",       zh: "富川市" },
  "남양주시":   { en: "Namyangju",       ja: "南楊州市",     zh: "南杨州市" },
  "화성시":     { en: "Hwaseong",        ja: "華城市",       zh: "华城市" },
  "평택시":     { en: "Pyeongtaek",      ja: "平澤市",       zh: "平泽市" },
  "의정부시":   { en: "Uijeongbu",       ja: "議政府市",     zh: "议政府市" },
  "광명시":     { en: "Gwangmyeong",     ja: "光明市",       zh: "光明市" },
};

// 접미사 자동 변환 (매핑 안 된 시군구용)
const SIGGU_SUFFIX_EN: Record<string, string> = {
  "구": "-gu", "시": "-si", "군": "-gun",
  "도": "-do", "동": "-dong", "읍": "-eup", "면": "-myeon",
};

function pickLang<T>(map: Record<string, { en: T; ja: T; zh: T }>, key: string, lang: Lang): T | null {
  const entry = map[key];
  if (!entry) return null;
  if (lang === "en") return entry.en;
  if (lang === "ja") return entry.ja;
  if (lang === "zh") return entry.zh;
  return null;
}

export function tSido(name: string | null | undefined, locale: Lang): string {
  if (!name) return "";
  if (locale === "ko") return name;
  return pickLang(SIDO_MAP, name, locale) ?? name;
}

export function tSiggu(name: string | null | undefined, locale: Lang): string {
  if (!name) return "";
  if (locale === "ko") return name;
  const direct = pickLang(SIGGU_MAP, name, locale);
  if (direct) return direct;
  // 영문은 접미사 변환만 폴백
  if (locale === "en") {
    for (const [k, v] of Object.entries(SIGGU_SUFFIX_EN)) {
      if (name.endsWith(k)) {
        return name.slice(0, -k.length) + v;
      }
    }
  }
  return name;
}

export function tSpecialty(name: string | null | undefined, locale: Lang): string {
  if (!name) return "";
  if (locale === "ko") return name;
  return pickLang(SPECIALTY_MAP, name, locale) ?? name;
}

export function tKind(name: string | null | undefined, locale: Lang): string {
  if (!name) return "";
  if (locale === "ko") return name;
  return pickLang(KIND_MAP, name, locale) ?? name;
}

// 검색 placeholder/popular용 — 진료과 한국어 키를 locale에 맞게 변환
export function localizedSpecialtyKey(ko: string, locale: Lang): string {
  if (locale === "ko") return ko;
  return tSpecialty(ko, locale);
}

// TopNav 토글용
export const LOCALE_LABELS: Record<string, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};
