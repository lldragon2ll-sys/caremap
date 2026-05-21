/**
 * 한국어 → 영문 매핑 사전.
 * 시도/시군구는 Revised Romanization 기준. 진료과는 한국 의료기관 분류 표준.
 */

// 시도 (17개)
export const SIDO_EN: Record<string, string> = {
  "서울": "Seoul",
  "부산": "Busan",
  "대구": "Daegu",
  "인천": "Incheon",
  "광주": "Gwangju",
  "대전": "Daejeon",
  "울산": "Ulsan",
  "세종": "Sejong",
  "경기": "Gyeonggi",
  "강원": "Gangwon",
  "충북": "Chungbuk",
  "충남": "Chungnam",
  "전북": "Jeonbuk",
  "전남": "Jeonnam",
  "경북": "Gyeongbuk",
  "경남": "Gyeongnam",
  "제주": "Jeju",
};

// 진료과 (한국어 → 영문, 디렉토리에서 사용되는 핵심 항목)
export const SPECIALTY_EN: Record<string, string> = {
  "성형외과": "Plastic Surgery",
  "피부과": "Dermatology",
  "치과": "Dental",
  "치과의원": "Dental Clinic",
  "치과병원": "Dental Hospital",
  "치과교정과": "Orthodontics",
  "소아치과": "Pediatric Dentistry",
  "구강악안면외과": "Oral & Maxillofacial Surgery",
  "안과": "Ophthalmology",
  "한의원": "Korean Medicine",
  "한방": "Korean Medicine",
  "한방병원": "Korean Medicine Hospital",
  "정신과": "Psychiatry",
  "정신건강의학과": "Psychiatry",
  "정형외과": "Orthopedics",
  "재활의학과": "Rehabilitation",
  "재활": "Rehabilitation",
  "마취통증의학과": "Pain Medicine",
  "마취통증과": "Pain Medicine",
  "통증": "Pain Medicine",
  "비뇨의학과": "Urology",
  "비뇨의학": "Urology",
  "산부인과": "OB/GYN",
  "가정의학과": "Family Medicine",
  "가정의학": "Family Medicine",
  "이비인후과": "ENT",
  "이비인후": "ENT",
  "소아청소년과": "Pediatrics",
  "소아청소년": "Pediatrics",
  "내과": "Internal Medicine",
  "외과": "General Surgery",
  "신경외과": "Neurosurgery",
  "신경과": "Neurology",
  "심장혈관흉부외과": "Cardiothoracic Surgery",
  "영상의학과": "Radiology",
  "방사선종양학과": "Radiation Oncology",
  "병리과": "Pathology",
  "진단검사의학과": "Lab Medicine",
  "응급의학과": "Emergency Medicine",
  "직업환경의학과": "Occupational Medicine",
  "예방의학과": "Preventive Medicine",
  "핵의학과": "Nuclear Medicine",
  "결핵과": "Tuberculosis",
};

// 종별 (의료기관 유형)
export const KIND_EN: Record<string, string> = {
  "상급종합": "Tertiary Hospital",
  "종합병원": "General Hospital",
  "병원": "Hospital",
  "의원": "Clinic",
  "치과의원": "Dental Clinic",
  "치과병원": "Dental Hospital",
  "한의원": "Korean Medicine Clinic",
  "한방병원": "Korean Medicine Hospital",
  "요양병원": "Long-term Care Hospital",
  "정신병원": "Psychiatric Hospital",
  "조산원": "Midwifery Clinic",
  "보건소": "Public Health Center",
  "보건지소": "Public Health Sub-Center",
  "보건진료소": "Community Health Clinic",
  "보건의료원": "Community Health Hospital",
};

// 시군구 일반적인 접미사 영문화 (예: "강남구" → "Gangnam-gu")
// 행정구역 256개를 일일이 적는 대신 Revised Romanization 매핑 + 접미사 규칙
// 보다 정확한 표기는 필요 시 추가 가능
export const SIGGU_SUFFIX_EN: Record<string, string> = {
  "구": "-gu",
  "시": "-si",
  "군": "-gun",
  "도": "-do",
  "동": "-dong",
  "읍": "-eup",
  "면": "-myeon",
};

// 자주 등장하는 시군구 (한국 행정구역의 주요 ~80개) — 가능한 영문 표기
export const SIGGU_EN: Record<string, string> = {
  // 서울 25구
  "강남구": "Gangnam-gu",
  "서초구": "Seocho-gu",
  "송파구": "Songpa-gu",
  "강동구": "Gangdong-gu",
  "강서구": "Gangseo-gu",
  "양천구": "Yangcheon-gu",
  "구로구": "Guro-gu",
  "금천구": "Geumcheon-gu",
  "영등포구": "Yeongdeungpo-gu",
  "동작구": "Dongjak-gu",
  "관악구": "Gwanak-gu",
  "마포구": "Mapo-gu",
  "은평구": "Eunpyeong-gu",
  "서대문구": "Seodaemun-gu",
  "종로구": "Jongno-gu",
  "중구": "Jung-gu",
  "용산구": "Yongsan-gu",
  "성동구": "Seongdong-gu",
  "광진구": "Gwangjin-gu",
  "동대문구": "Dongdaemun-gu",
  "중랑구": "Jungnang-gu",
  "성북구": "Seongbuk-gu",
  "강북구": "Gangbuk-gu",
  "도봉구": "Dobong-gu",
  "노원구": "Nowon-gu",
  // 부산 주요
  "해운대구": "Haeundae-gu",
  "수영구": "Suyeong-gu",
  "부산진구": "Busanjin-gu",
  "남구": "Nam-gu",
  "동구": "Dong-gu",
  "서구": "Seo-gu",
  "북구": "Buk-gu",
  "사하구": "Saha-gu",
  "기장군": "Gijang-gun",
  // 경기 주요
  "수원시": "Suwon",
  "성남시": "Seongnam",
  "용인시": "Yongin",
  "고양시": "Goyang",
  "안산시": "Ansan",
  "안양시": "Anyang",
  "부천시": "Bucheon",
  "남양주시": "Namyangju",
  "화성시": "Hwaseong",
  "평택시": "Pyeongtaek",
  "의정부시": "Uijeongbu",
  "광명시": "Gwangmyeong",
  "김포시": "Gimpo",
  "광주시": "Gwangju (Gyeonggi)",
  "이천시": "Icheon",
  "양주시": "Yangju",
  "오산시": "Osan",
  "구리시": "Guri",
  "안성시": "Anseong",
  "포천시": "Pocheon",
  "의왕시": "Uiwang",
  "하남시": "Hanam",
  "여주시": "Yeoju",
  "동두천시": "Dongducheon",
  "과천시": "Gwacheon",
};

// 종별·이름·시도·시군구·진료과 변환 헬퍼
export function tSido(name: string | null | undefined, locale: string): string {
  if (!name) return "";
  if (locale === "en") return SIDO_EN[name] ?? name;
  return name;
}

export function tSiggu(name: string | null | undefined, locale: string): string {
  if (!name) return "";
  if (locale !== "en") return name;
  // 직접 매핑 있으면 사용
  const direct = SIGGU_EN[name];
  if (direct) return direct;
  // 접미사 자동 변환 (예: "강남구" → "Gangnam-gu" 처리 안 됐을 때)
  for (const [k, v] of Object.entries(SIGGU_SUFFIX_EN)) {
    if (name.endsWith(k)) {
      const stem = name.slice(0, -k.length);
      return stem + v; // stem은 한글 그대로 남음 (전부 매핑하기엔 큼). 사용자가 확인 가능.
    }
  }
  return name;
}

export function tSpecialty(name: string | null | undefined, locale: string): string {
  if (!name) return "";
  if (locale === "en") return SPECIALTY_EN[name] ?? name;
  return name;
}

export function tKind(name: string | null | undefined, locale: string): string {
  if (!name) return "";
  if (locale === "en") return KIND_EN[name] ?? name;
  return name;
}
