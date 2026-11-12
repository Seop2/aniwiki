# ANIWIKI

TMDB 애니메이션 랭킹/검색 사이트 (React 19 + Vite 8 + TanStack Query v5)

## 실행

```bash
npm install
cp .env.example .env   # VITE_TMDB_TOKEN(v4 Read Access Token) 또는 VITE_TMDB_API_KEY(v3 API Key) 입력
npm run dev
```

## 기능
- TV 시리즈 / 극장판 전환 (`/discover/{tv|movie}?with_genres=16`)
- 정렬: 평점순(투표 200표 이상) · 인기순 · 투표수순 · 최신순
- 제목 검색 (`/search/{tv|movie}` → 애니메이션 장르만 필터, 정렬은 클라이언트)
- "더 보기" 무한 페이지네이션 (`useInfiniteQuery`)
- 다크 모드 (localStorage 저장, 시스템 설정 기본값)
- 모바일: 연도/투표수 컬럼을 제목 아래로 이동
- **나만의 인생 애니 TOP 10**: 상세 모달에서 담고, 헤더 「내 TOP 10」에서 순서 편집 · 닉네임 입력 (localStorage 저장)
  - 공유 이미지(1080×1350 PNG, Canvas로 직접 그림) 저장 / 모바일은 시스템 공유 시트로 바로 공유
  - 공유 링크 `/top10?top10=t1429.m372058&name=…` (예전 `/?top10=…`도 자동 전환) — 작품 ID만 담고, 받는 쪽에서 TMDB로 불러와 읽기 전용 화면 표시
  - 링크 복사 · X 공유 · Web Share API, 공유 방식별 `top10_share` 이벤트(Vercel Analytics — Pro 플랜에서만 기록)
- **숨은 명작 찾기** (`/discover`): 본 유명작(원피스 · 나루토 · 진격 등 16편)을 포스터 그리드에서 고르면 덜 알려진 명작 20편 추천
  - 고른 작품들의 TMDB 추천 목록(각 40편)을 합산 — 여러 작품에서, 앞 순위로 추천될수록 높은 점수
  - 일본 애니 · 평점 7.5↑ · 투표 100~1,500(유명작은 2,000~8,000) · 방영 1년 경과 · 총집편 제외, 1995년 이전은 점수 절반
  - 카드마다 추천 이유(「진격의 거인을 본 사람에게」)와 완결 · 화수, 「이미 봤어요」로 제외(localStorage)
  - 기준값은 `lib/discover.js`의 `GEM` 상수
- **화면별 주소**: `/`(랭킹) · `/top10?…`(공유 TOP 10) · `/anime/{tv|movie}/{id}`(작품 상세 모달) · `/discover?seen=…`(숨은 명작)
  - 라이브러리 없는 최소 라우터(`lib/router.js`)로 `<Analytics route path>`에 페이지뷰를 보내 무료 플랜에서도 화면별로 집계
  - 앱 안에서 연 상세는 뒤로가기로 닫히고, 상세 주소로 바로 들어오면 랭킹 위에 모달이 열림
  - Vercel에서는 `vercel.json` rewrite로 모든 경로를 `index.html`로 보냄(SPA 폴백)

## 구조
```
src/
├── api/tmdb.js            # fetch 래퍼, MEDIA/SORTS 설정, 응답 정규화
├── hooks/useAnimeList.js  # useInfiniteQuery 래핑
├── hooks/useTheme.js
├── hooks/useMyTop10.js    # 내 TOP 10 (localStorage)
├── data/seeds.js          # /discover에서 고를 수 있는 유명작 16편
├── lib/discover.js        # 숨은 명작 필터 · 점수 계산(rankHiddenGems)
├── lib/router.js          # 경로 파싱, history 기반 useRoute
├── lib/share.js           # 공유 링크 인코딩/파싱, 이미지·링크 공유
├── lib/top10Image.js      # 공유 이미지 Canvas 렌더링
├── components/            # Header, SearchBar, Filters, RankingTable, RankingRow, DetailModal,
│                          # Top10Modal, SharedTop10, ShareActions, Discover
├── App.jsx
└── index.css              # 디자인 토큰(:root / [data-theme=dark])
```

## 주의
- 클라이언트에서 토큰을 쓰므로 빌드 결과물에 토큰이 노출됩니다. 배포 시에는 서버(Next.js Route Handler, Vercel Function 등)를 프록시로 두세요.
- TMDB discover는 최대 500페이지까지만 조회됩니다.
