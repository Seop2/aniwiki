# ANIWIKI

TMDB 애니메이션 랭킹/검색 사이트 (Next.js 16 App Router + React 19 + TanStack Query v5 + TypeScript)

## 실행

```bash
npm install
cp .env.example .env   # TMDB_TOKEN(v4 Read Access Token) 또는 TMDB_API_KEY(v3 API Key) 입력 — 서버에서만 쓴다
npm run dev            # 배포 빌드 확인: npm run build && npm start
npm run typecheck      # 타입 검사(next typegen + tsc)
```

## 기능
- TV 시리즈 / 극장판 전환 (`/discover/{tv|movie}?with_genres=16`)
- 정렬: 평점순(투표 200표 이상) · 인기순 · 투표수순 · 최신순
- 제목 검색 (`/search/{tv|movie}` → 애니메이션 장르만 필터, 정렬은 클라이언트)
- 제작 국가: 전체 · 일본 · 서양 (`?origin=jp|west`, `with_origin_country`, 서양은 미국 · 영국 · 프랑스 등 OR). 검색에는 미적용, 넷플릭스 오리지널 목록은 원어(`original_language`)로 거름
- **볼 수 있는 곳**: 넷플릭스 · 디즈니+ · 티빙 · 왓챠 칩으로 한국에서 구독으로 볼 수 있는 작품만 (`watch_region=KR&with_watch_providers=…`, 여러 개는 OR, 선택은 localStorage 저장, 검색에는 미적용). 아무것도 안 고르면 이 서비스들 중 한 곳이라도 있는 작품만 랭킹에 나옴. 라프텔은 TMDB에 없음. 크런치롤은 한국에서 대부분 재생이 안 되는데 TMDB에는 있다고 나와 필터 · 상세 모두에서 숨김
- **넷플릭스 오리지널**: 한국 넷플릭스에 있는 오리지널만 모아 보기 + 상세 배지. 판별은 `lib/netflix.ts`의 `isNetflixOriginal`
  - network 213(Netflix)은 "어느 나라든 넷플릭스 방영"이라 쓰지 않는다(예: 타코피의 원죄 — 한국은 라프텔 독점)
  - TV: 방송사가 넷플릭스 하나뿐 / 극장판: 15개국 이상 "Netflix" 디지털 공개 + 일반 극장 개봉이 그보다 앞서지 않음 / 공통: 넷플릭스 제작사
  - 상세를 봐야 판별되므로 `src/server/netflixOriginals.ts`가 목록을 만들고 `/netflix-originals.json` 라우트가 빌드 때 + 하루마다(ISR) 갱신
- **PV 영상**: 상세에 TMDB `videos` 중 YouTube 하나(공식 > 예고편 > 티저, 한국어 > 일본어 > 영어, 같으면 먼저 공개된 것). 썸네일만 그리다 누르면 iframe
- **카카오톡 공유**: TOP 10. `NEXT_PUBLIC_KAKAO_JS_KEY`(카카오 디벨로퍼스 JavaScript 키)가 없으면 버튼을 숨김. 도메인은 두 곳에 등록: 플랫폼 키 > JavaScript 키 > JavaScript SDK 도메인(SDK 사용) · 앱 > 제품 링크 관리 > 웹 도메인(카드를 눌렀을 때 사이트로 이동, 빠지면 카드는 뜨는데 안 열림). 피드 이미지는 `/api/og/top10`
- "더 보기" 무한 페이지네이션 (`useInfiniteQuery`)
- 다크 모드 (localStorage 저장, 시스템 설정 기본값)
- 모바일: 연도/투표수 컬럼을 제목 아래로 이동
- **나만의 인생 애니 TOP 10**: 상세 모달에서 담고, 헤더 「내 TOP 10」에서 순서 편집 · 닉네임 입력 (localStorage 저장)
  - 공유 이미지(1080×1350 PNG, Canvas로 직접 그림) 저장 / 모바일은 시스템 공유 시트로 바로 공유
  - 공유 링크 `/top10?top10=t1429.m372058&name=…` (예전 `/?top10=…`는 `next.config` redirect) — 작품 ID만 담고, 받는 쪽에서 TMDB로 불러와 읽기 전용 화면 표시
  - 링크 미리보기 이미지는 `/api/og/top10?…`(next/og `ImageResponse`)가 담긴 작품 포스터로 그림
  - 링크 복사 · X 공유 · Web Share API, 공유 방식별 `top10_share` 이벤트(Vercel Analytics — Pro 플랜에서만 기록)
- **숨은 명작 찾기** (`/discover`): 본 유명작(원피스 · 나루토 · 진격 등 16편)을 포스터 그리드에서 고르면 덜 알려진 명작 20편 추천
  - 고른 작품들의 TMDB 추천 목록(각 40편)을 합산 — 여러 작품에서, 앞 순위로 추천될수록 높은 점수
  - 일본 애니 · 평점 7.5↑ · 투표 100~1,500(유명작은 2,000~8,000) · 방영 1년 경과 · 총집편 제외, 1995년 이전은 점수 절반
  - 카드마다 추천 이유(「진격의 거인을 본 사람에게」)와 완결 · 화수, 「이미 봤어요」로 제외(localStorage)
  - 기준값은 `lib/discover.ts`의 `GEM` 상수
- **화면별 주소** (App Router): `/?type=movie&sort=popular&q=…&original=1`(랭킹 · 검색, 기본값은 생략) · `/top10?…`(공유 TOP 10) · `/anime/{tv|movie}/{id}`(작품 상세) · `/discover?seen=…`(숨은 명작)
  - 작품 상세는 앱 안에서 열면 `@modal/(.)anime/…` 인터셉트 라우트로 모달(뒤 화면 유지, 뒤로가기로 닫힘), 주소로 바로 들어오면 서버에서 그린 페이지(제목 · 줄거리 · og:image, 10분 ISR)
  - 랭킹 필터 · 검색어는 주소에 있어 새로고침 · 링크 공유에도 유지. 필터 변경은 `history.replaceState`라 서버 왕복 없이 바로 반영
  - 랭킹 첫 페이지는 서버에서 그림(시청처 필터 OTT 전체 기준). 저장된 시청처(localStorage)가 있으면 브라우저가 그 조건으로 다시 받음
  - 내 TOP 10 · 상세 모달 미리보기는 layout의 `AppState` 컨텍스트
  - canonical은 페이지 metadata로(상세는 자기 주소, 쿼리로 바뀌는 화면은 쿼리 없는 주소), 알 수 없는 주소는 404
  - `<Analytics route path>`로 화면별 집계(무료 플랜). 숨은 명작 결과(`?seen=…`)는 `/discover/results`로 따로 세어 고르기 → 결과 전환을 볼 수 있음
- **TMDB 토큰은 서버에만**: 브라우저는 `/api/anime` · `/api/anime/{type}/{id}` · `…/recommendations`를 부르고, 서버(`src/server/tmdb.ts`)가 TMDB에 요청 · 정규화 · 캐시(React Query staleTime과 같은 시간, CDN `s-maxage`)
- **사이트맵**: `app/sitemap.ts`가 TMDB 평점순 · 인기순 상위 작품과 시드 작품의 상세 주소를 담아 하루마다 갱신. TMDB 요청이 실패하면 고정 주소만 담음

## 구조
```
src/
├── app/                   # App Router
│   ├── layout.tsx         # 메타 태그 · 글꼴 · 테마 스크립트, Providers > AppState > Shell + {modal}
│   ├── page.tsx           # / 랭킹(첫 페이지 SSR)
│   ├── discover/ top10/   # 숨은 명작 · 공유 TOP 10
│   ├── anime/[type]/[id]/ # 작품 상세 페이지(SSR · ISR)
│   ├── @modal/            # 앱 안에서 연 상세 모달((.)anime 인터셉트), 다른 화면에서는 비움
│   ├── api/anime/…        # TMDB 프록시(입력 검증)
│   ├── api/og/top10/      # 공유 TOP 10 미리보기 이미지
│   ├── netflix-originals.json/ sitemap.ts
│   └── providers.tsx      # QueryClient
├── server/                # 서버 전용(server-only)
│   ├── tmdb.ts            # TMDB 요청 · 정규화 · 캐시 시간
│   ├── respond.ts         # 라우트 입력 검증 · 응답 헬퍼
│   ├── netflixOriginals.ts · sitemapPaths.ts
├── hooks/                 # useAnimeList(useInfiniteQuery) · useAnimeDetail · useMyTop10 · useSeen · useTheme …
├── data/seeds.ts          # /discover에서 고를 수 있는 유명작 16편
├── lib/apiClient.ts       # 브라우저용 데이터 요청(app/api/* 호출) — React Query 훅이 쓴다
├── lib/catalog.ts         # PROVIDERS · SORTS · posterUrl (화면 · 서버 공용)
├── lib/discover.ts        # 숨은 명작 필터 · 점수 계산(rankHiddenGems)
├── lib/media.ts           # TMDB 응답 매핑(MEDIA, normalize)
├── lib/netflix.ts         # 넷플릭스 오리지널 판별
├── lib/paths.ts           # 랭킹 · 상세 주소 만들기 · 파라미터 검증
├── lib/storage.ts         # localStorage 값을 하이드레이션 안전하게 읽는 useStoredValue
├── lib/queries.ts         # React Query staleTime · 쿼리 키(서버 SSR과 공용) — 서버 캐시도 같은 시간
├── lib/share.ts           # 공유 링크 인코딩/파싱, 이미지·링크 공유
├── lib/top10Image.ts      # 공유 이미지 Canvas 렌더링
├── types.ts               # 공용 타입(MediaType · AnimeItem · AnimeDetail · Top10 …), 값에서 뽑아 쓴다
├── global.d.ts            # window.Kakao · 환경 변수 타입
├── components/            # 기능별 폴더. 각 컴포넌트의 CSS는 같은 폴더에
│   ├── common/            # Modal(모달 틀), Poster(포스터 · 빈 칸)
│   ├── layout/            # Shell(헤더 · 로고 · 검색창), AppState(내 TOP 10 · 모달 미리보기), PageAnalytics, Header, SearchBar
│   ├── ranking/           # Home, Filters, RankingTable, RankingRow
│   ├── detail/            # DetailContent(본문), DetailModal, DetailPage
│   ├── top10/             # Top10Modal, SharedTop10, ShareActions
│   └── discover/          # Discover
└── styles/                # layout에서 먼저 import (공통 → 컴포넌트 순서로 덮어쓰기)
    ├── tokens.css         # 디자인 토큰(:root / [data-theme=dark])
    ├── base.css           # 리셋 · body · focus
    └── ui.css             # 여러 컴포넌트가 함께 쓰는 것(버튼, 크롭 마크, 작품 행, 스켈레톤, 모달 틀)
scripts/og-image.html      # public/og-image.png 원본
```

## 주의
- TMDB discover는 최대 500페이지까지만 조회됩니다.
