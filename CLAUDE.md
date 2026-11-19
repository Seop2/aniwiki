# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

ANIWIKI (www.aniwiki.link): 한국어 애니메이션 랭킹 · 검색 사이트. TMDB 데이터를 쓰는 Next.js 16 App Router · React 19 · TanStack Query v5 · TypeScript(strict) 앱. 기능 상세는 README.md를 본다.

## 명령

```bash
npm run dev         # .env에 TMDB_TOKEN 또는 TMDB_API_KEY 필요(서버 전용)
npm run build       # 빌드 중 타입 검사도 함께 돈다
npm run typecheck   # next typegen && tsc --noEmit — PageProps · RouteContext · LayoutProps 전역 타입을 생성
```

- 테스트 · 린터는 없다. 확인은 typecheck, build, 그리고 dev 서버에서 브라우저로 직접 한다.
- `main`에 푸시하면 Vercel 프로덕션에 바로 배포된다.
- 파일 이름을 바꾼 뒤 dev 서버가 `Could not parse module ... file not found`를 내면 `.next/dev`가 옛 경로를 들고 있는 것이다. 지우고 다시 띄운다.
- tsconfig의 `allowJs: true`는 지우지 않는다. 지워도 `next dev`가 다시 넣는다.

## 데이터 흐름

- TMDB 토큰은 서버에만 둔다. 브라우저 → `src/lib/apiClient.ts` → `app/api/anime/*` 라우트(입력 검증: `server/respond.ts`, `lib/paths.ts`의 `isKey`) → `src/server/tmdb.ts`(TMDB 요청 · `normalize` · 캐시) 순서로 흐른다. `server/`의 파일은 `import 'server-only'`.
- 캐시 시간은 한 곳에서 정한다. `lib/queries.ts`의 `STALE_TIME`이 React Query staleTime이고, 서버의 `REVALIDATE`(fetch revalidate)와 CDN `s-maxage`도 이 값에서 나온다.
- SSR과 하이드레이션: `app/page.tsx`(랭킹 첫 페이지)와 `app/anime/[type]/[id]/page.tsx`(상세)가 서버에서 데이터를 받아 `HydrationBoundary`로 넘긴다. 이때 쿼리 키는 `listQueryKey` · `detailQueryKey`로 클라이언트와 똑같이 만들어야 재요청이 생기지 않는다. 서버는 localStorage에 저장된 시청처를 모르므로 시청처 필터 없이(OTT 전체 기준) 그린다.
- 넷플릭스 오리지널 목록은 상세를 봐야 판별되므로 `server/netflixOriginals.ts`가 `/netflix-originals.json` 라우트에서 빌드 때와 하루마다(ISR) 만든다. 클라이언트(`hooks/useAnimeList.ts`)는 이 목록을 받아 정렬 · 국가 필터를 직접 적용한다(서버 페이지네이션 없음).

## 라우팅 · 상태

- 랭킹 조건(type · sort · q · original · origin)은 URL 쿼리에 있다. 파싱과 생성은 `lib/paths.ts`의 `parseHomeParams` · `homePath`가 맡고, 기본값은 주소에서 생략한다. 필터를 바꿀 때는 `history.replaceState`를 써서 서버 왕복이 없다.
- 작품 상세: 앱 안에서 열면 `app/@modal/(.)anime/[type]/[id]` 인터셉트 라우트가 모달로 띄우고, 주소로 바로 들어오면 `app/anime/[type]/[id]` 페이지(ISR)로 그린다. 둘 다 `components/detail/DetailContent`를 쓴다. 모달이 떠 있는 동안 `Home`은 마지막 랭킹 조건을 `useRef`로 붙들고 있다.
- 전역 클라이언트 상태는 `components/layout/AppState.tsx` 컨텍스트 하나다(내 TOP 10, 상세 모달 미리보기 item). localStorage 값은 `lib/storage.ts`의 `useStoredValue`(useSyncExternalStore, 하이드레이션 안전)를 거친다.
- 카탈로그 상수(`lib/catalog.ts`의 `MEDIA` · `SORTS` · `ORIGINS` · `PROVIDERS`)가 키의 출처다. `src/types.ts`의 `MediaType` · `SortKey` 같은 공용 타입은 이 값에서 뽑아 쓴다. 새 정렬이나 국가를 추가할 때는 이 상수만 고치면 된다.

## 스타일

- 컴포넌트 CSS는 같은 폴더의 `*.module.css`다. 여러 컴포넌트가 함께 쓰는 것(버튼 `.btn-*`, `.corners` 크롭 마크, 스켈레톤, 모달 안쪽)은 `src/styles/ui.css`의 전역 클래스로 둔다. 디자인 토큰은 `styles/tokens.css`(`[data-theme]`로 다크 모드)에 있다.

## 규칙

- 설명 주석과 한 번만 쓰는 추상화 · 타입은 만들지 않는다. 한 곳에서만 쓰는 타입은 인라인으로 쓰고, 공용 타입만 `src/types.ts`에 둔다.
- TMDB network 213(Netflix)만 보고 넷플릭스 오리지널로 판단하지 않는다. 판별 규칙은 `lib/netflix.ts`의 `isNetflixOriginal`에 있다(README 참고).
- 커밋 메시지는 한국어로 쓴다.
- 코드를 바꾸면 무엇을, 왜 바꿨는지 3줄로 설명할 것
- 새로운 문법이나 라이브러리를 쓰면 짧게 설명할 것
