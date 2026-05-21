/**
 * romanize.ts에서 내부적으로 사용하는 영문 매핑 (i18n-dict의 영문 키만 추출).
 * 별도 파일로 두어 클라이언트 번들 사이즈 안전.
 */

export const SIDO_MAP_INTERNAL: Record<string, string> = {
  "서울": "Seoul", "부산": "Busan", "대구": "Daegu", "인천": "Incheon",
  "광주": "Gwangju", "대전": "Daejeon", "울산": "Ulsan", "세종": "Sejong",
  "경기": "Gyeonggi", "강원": "Gangwon", "충북": "Chungbuk", "충남": "Chungnam",
  "전북": "Jeonbuk", "전남": "Jeonnam", "경북": "Gyeongbuk", "경남": "Gyeongnam",
  "제주": "Jeju",
};

export const SIGGU_MAP_INTERNAL: Record<string, string> = {
  "강남구": "Gangnam-gu", "서초구": "Seocho-gu", "송파구": "Songpa-gu",
  "강동구": "Gangdong-gu", "강서구": "Gangseo-gu", "양천구": "Yangcheon-gu",
  "구로구": "Guro-gu", "금천구": "Geumcheon-gu", "영등포구": "Yeongdeungpo-gu",
  "동작구": "Dongjak-gu", "관악구": "Gwanak-gu", "마포구": "Mapo-gu",
  "은평구": "Eunpyeong-gu", "서대문구": "Seodaemun-gu", "종로구": "Jongno-gu",
  "용산구": "Yongsan-gu", "성동구": "Seongdong-gu", "광진구": "Gwangjin-gu",
  "동대문구": "Dongdaemun-gu", "중랑구": "Jungnang-gu", "성북구": "Seongbuk-gu",
  "강북구": "Gangbuk-gu", "도봉구": "Dobong-gu", "노원구": "Nowon-gu",
  "해운대구": "Haeundae-gu", "수영구": "Suyeong-gu", "부산진구": "Busanjin-gu",
  "사하구": "Saha-gu", "기장군": "Gijang-gun",
  "수원시": "Suwon", "성남시": "Seongnam", "용인시": "Yongin", "고양시": "Goyang",
  "안산시": "Ansan", "안양시": "Anyang", "부천시": "Bucheon", "남양주시": "Namyangju",
  "화성시": "Hwaseong", "평택시": "Pyeongtaek", "의정부시": "Uijeongbu",
  "광명시": "Gwangmyeong",
};

export const SPECIALTY_MAP_INTERNAL: Record<string, string> = {
  "성형외과": "Plastic Surgery", "피부과": "Dermatology",
  "치과의원": "Dental Clinic", "치과병원": "Dental Hospital",
  "치과교정과": "Orthodontics", "소아치과": "Pediatric Dentistry",
  "구강악안면외과": "Oral Surgery", "안과": "Eye",
  "한의원": "Korean Medicine", "한방병원": "Korean Medicine Hospital",
  "한방": "Korean Medicine",
  "치과": "Dental", // 짧은 키워드는 나중에 (긴 키워드 먼저 매칭)
  "정신건강의학과": "Psychiatry", "정신과": "Psychiatry",
  "정형외과": "Orthopedics", "재활의학과": "Rehab",
  "마취통증의학과": "Pain", "마취통증과": "Pain",
  "비뇨의학과": "Urology", "산부인과": "OB-GYN",
  "가정의학과": "Family Medicine", "이비인후과": "ENT",
  "소아청소년과": "Pediatrics", "내과": "Internal Medicine",
  "외과": "Surgery", "신경외과": "Neurosurgery", "신경과": "Neurology",
  "심장혈관흉부외과": "Cardiothoracic", "영상의학과": "Radiology",
  "방사선종양학과": "Radiation Oncology", "병리과": "Pathology",
  "진단검사의학과": "Lab Medicine", "응급의학과": "Emergency",
  "직업환경의학과": "Occupational", "예방의학과": "Preventive",
  "핵의학과": "Nuclear Medicine", "결핵과": "Tuberculosis",
};

export const KIND_MAP_INTERNAL: Record<string, string> = {
  "상급종합": "Tertiary Hospital", "종합병원": "General Hospital",
  "치과의원": "Dental Clinic", "치과병원": "Dental Hospital",
  "한방병원": "Korean Medicine Hospital", "한의원": "Korean Medicine Clinic",
  "요양병원": "Long-term Care", "정신병원": "Psychiatric Hospital",
  "보건소": "Public Health Center", "보건지소": "Public Health Sub-Center",
  "보건진료소": "Community Health Clinic", "보건의료원": "Community Health Hospital",
  "조산원": "Midwifery",
  "의원": "Clinic", "병원": "Hospital", // 짧은 키워드는 마지막
};
