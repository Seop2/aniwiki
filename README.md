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

## 구조
```
src/
├── api/tmdb.js            # fetch 래퍼, MEDIA/SORTS 설정, 응답 정규화
├── hooks/useAnimeList.js  # useInfiniteQuery 래핑
├── hooks/useTheme.js
├── components/            # Header, SearchBar, Filters, RankingTable, RankingRow
├── App.jsx
└── index.css              # 디자인 토큰(:root / [data-theme=dark])
```

## 주의
- 클라이언트에서 토큰을 쓰므로 빌드 결과물에 토큰이 노출됩니다. 배포 시에는 서버(Next.js Route Handler, Vercel Function 등)를 프록시로 두세요.
- TMDB discover는 최대 500페이지까지만 조회됩니다.
