# CLAUDE.md

@AGENTS.md

ANIWIKI(www.aniwiki.link): TMDB 데이터로 만든 한국어 애니메이션 랭킹 · 검색 사이트. Next.js 16 App Router · React 19 · TanStack Query v5 · zustand · TypeScript(strict). 기능 · 구조 설명은 README.md.

## 명령

```bash
npm run dev         # .env에 TMDB_TOKEN 또는 TMDB_API_KEY 필요
npm run typecheck   # next typegen && tsc --noEmit
npm run build
```

- 테스트 · 린터가 없다. 코드를 바꾸면 `typecheck`를 돌리고, 화면이 바뀌면 dev 서버를 브라우저로 열어 확인한다. 이유: 자동 테스트가 없어서 이 두 가지가 유일한 검증이다.
- `main`에 푸시하면 Vercel 프로덕션에 바로 배포된다. 푸시 전에 `npm run build`가 통과하는지 확인한다.

## 지도

- `src/app/`: 라우팅만 둔다(page · layout · route · `@modal` 인터셉트 모달). 컴포넌트는 두지 않는다.
- `src/server/`: 서버 전용(`import 'server-only'`). TMDB 요청 · 정규화 · 캐시.
- `src/lib/`: 상수 · 순수 함수. 일부(`share`, `top10Image`, `storage`)는 브라우저 전용.
- `src/hooks/`, `src/stores/`(zustand), `src/components/`(랭킹 화면 컴포넌트는 바로 아래, 나머지는 `detail` · `top10` · `discover` · `layout` · `common` 기능 폴더), `src/styles/`.

## 코드만 보고는 틀리기 쉬운 것

- TMDB 토큰은 서버에만 둔다. 브라우저는 `lib/apiClient.ts` → `app/api/*`만 부른다. 이유: 클라이언트 코드에서 TMDB를 직접 부르면 토큰이 번들에 노출된다.
- SSR로 미리 채운 쿼리는 `lib/queries.ts`의 `listQueryKey` · `detailQueryKey`로만 키를 만든다. 이유: 서버와 클라이언트의 키가 다르면 하이드레이션 직후 같은 요청을 다시 보낸다.
- localStorage는 렌더 중에 직접 읽지 않는다. `useStoredValue`(useSyncExternalStore)나 zustand `persist`(`skipHydration` + `Shell`에서 `rehydrate()`)를 거친다. 이유: 서버 HTML과 첫 렌더가 달라져 하이드레이션 오류가 난다.
- 넷플릭스 오리지널을 TMDB network 213만 보고 판단하지 않는다. 판별은 `lib/netflix.ts`의 `isNetflixOriginal`로만 한다. 이유: 213은 "어느 나라든 넷플릭스 방영"이라, 한국은 라프텔 독점인 「타코피의 원죄」도 오리지널로 잡힌다.
- 캐시 시간은 `lib/queries.ts`의 `STALE_TIME` 한 곳에서만 바꾼다. 서버 `revalidate`와 CDN `s-maxage`도 이 값을 쓴다.
- 정렬 · 국가 · 시청처를 추가할 때는 `lib/catalog.ts` 상수만 고친다. `src/types.ts`의 `SortKey` 같은 타입이 이 값에서 자동으로 나온다.
- 여러 컴포넌트가 함께 쓰는 CSS는 `styles/ui.css`의 전역 클래스로 둔다. 다른 폴더의 `*.module.css`를 import하지 않는다.
- import 경로는 다른 폴더면 `@/…`, 같은 폴더면 `./…`로 쓴다. 순서는 외부 패키지 → `@/types` → 나머지 `@/` → `./` → CSS. 이유: `../../`를 쓰면 파일을 옮길 때마다 경로가 깨진다.
- 한 곳에서만 쓰는 타입 · 헬퍼 · 컴포넌트는 따로 빼지 않고 쓰는 곳에 둔다. 공용 타입만 `src/types.ts`에 둔다.

## 환경 함정

- 파일 이름을 바꾼 뒤 dev 서버가 `Could not parse module ... file not found`를 내면, `.next/dev`가 옛 경로를 들고 있는 것이다. 지우고 다시 띄운다.
- tsconfig의 `allowJs: true`와 AGENTS.md 블록은 지우지 않는다. 이유: `next dev`가 다시 넣어서 diff만 생긴다.

## 작업 방식

- 커밋 메시지는 한국어로 쓴다.
- 코드를 바꾸면 무엇을, 왜 바꿨는지 3줄로 설명한다. 새 문법이나 라이브러리를 쓰면 짧게 설명한다. 이유: 사용자가 TypeScript를 배우는 중이다.
- 구조나 기능을 바꾸면 README.md의 해당 부분도 같이 고친다.
