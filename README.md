# CAREMAP

대한민국 전국 병원·의원·치과·한의원 정보 디렉토리. Next.js 16 + Supabase.

## 데이터 소스
- 건강보험심사평가원(HIRA) 병원정보서비스 v2 — 79,688건

## 개발

```bash
npm install
cp .env.local.example .env.local
# .env.local에 Supabase URL/anon key 입력

npm run dev      # http://localhost:3000
npm run build    # 운영 빌드
npm run lint
```

## 배포

### Vercel
1. GitHub에 푸시 → Vercel에서 Import Project
2. **Environment Variables** 등록:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://caremap.store`
   - `NEXT_PUBLIC_SITE_NAME` = `CAREMAP`
   - (검색엔진 등록 후) `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - (검색엔진 등록 후) `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`

### 도메인 (Cafe24 → Vercel)
1. Vercel 프로젝트 Settings → Domains → `caremap.store` 추가
2. Vercel이 알려주는 A/CNAME 레코드를 Cafe24 DNS에 추가
3. 5분~24시간 후 SSL 자동 발급

### 검색엔진 등록
- Google: https://search.google.com/search-console
- Naver: https://searchadvisor.naver.com
- Bing: https://www.bing.com/webmasters

소유 확인 후 받은 코드를 Vercel 환경변수에 추가 → 재배포 → 사이트맵 제출 (`/sitemap.xml`).

## 라우팅

| 경로 | 페이지 |
|---|---|
| `/` | 홈 (검색 + 진료과 + 인기 병원) |
| `/search?q=&area=&kind=` | 검색 결과 (지도 분할) |
| `/[sido]` | 시·도 인덱스 |
| `/[sido]/[sigungu]` | 시·군·구 인덱스 |
| `/[sido]/[sigungu]/[specialty]` | SEO 카테고리 랜딩 (FAQ + JSON-LD) |
| `/hospital/[slug]` | 병원 상세 (Schema.org Hospital) |
| `/sitemap/[id].xml` | 분할 사이트맵 |
| `/robots.txt` | 자동 생성 |

## 데이터 재수집

전체 또는 부분 재동기화:
```bash
cd ..   # 프로젝트 루트
python collect_hospitals.py            # 전체 재수집 (~60분)
python collect_hospitals.py --resume   # 실패 시점부터
python collect_hospitals.py --pages 1-10
```

## 컴플라이언스

- 데이터 출처: HIRA 공공데이터포털 (재가공·재배포 가능)
- 의료법 제56조 (의료광고): 본 사이트는 공공데이터 기반 정보 제공 서비스로 운영. 의료광고심의 사전 검토 권장
- 별점·리뷰는 외부 지도(카카오/네이버/Google)로 딥링크 — 자체 수집 없음
