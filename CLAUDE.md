# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Neuro Frontier** — 인지-운동 이중 과업(Dual-Task)을 통한 에이징 커브 극복 트레이닝 웹 앱.
마우스로 타겟을 클릭하는 운동 과제와 키보드(A/D)로 홀짝을 판단하는 인지 과제를 동시에 수행한다.

## 개발 명령어

- `npm run dev` — Vite 개발 서버 실행 (직접 실행하지 말고 사용자에게 안내)
- `npm run build` — TypeScript 컴파일 + Vite 프로덕션 빌드 (`tsc -b && vite build`)
- `npm run lint` — ESLint 실행
- `npm run preview` — 빌드 결과 프리뷰

## 기술 스택

- **React 19** + **TypeScript 5.9** + **Vite 8 beta** (rolldown 기반)
- **Tailwind CSS v4** (`@tailwindcss/vite` 플러그인 방식, `@import "tailwindcss"` 사용)
- **Zustand 5** (persist middleware로 localStorage 연동)
- **Canvas API** — 게임 렌더링 엔진 (requestAnimationFrame 루프)

## 아키텍처

### 게임 상태 흐름

```
IDLE → COUNTDOWN → PLAYING → RESULT → IDLE
```

`GameStatus` 타입(`src/types/index.ts`)이 이 흐름을 정의하며, `App.tsx`에서 status 값에 따라 화면을 조건부 렌더링한다.

### 핵심 모듈

| 파일 | 역할 |
|---|---|
| `src/App.tsx` | 메인 컴포넌트. 상태별 화면 분기(메뉴, 카운트다운, 게임, 결과). CountdownOverlay 인라인 정의 |
| `src/components/GameBoard.tsx` | Canvas 게임 화면 + HUD(점수/시간/히트) + 인지 과제 오버레이. GameEngine 인스턴스 관리 |
| `src/engines/GameEngine.ts` | **Class 기반** Canvas 렌더링 엔진. 타겟 생성/소멸, 클릭 판정, 리플 이펙트, DPR 대응 리사이즈 처리 |
| `src/store/useGameStore.ts` | Zustand 스토어. 게임 전체 상태 + 액션. persist로 `history`만 localStorage 저장 (key: `neuro-physical-storage`) |
| `src/types/index.ts` | 전체 타입 정의 (Target, CognitiveTask, GameSession, GameSettings, GameState) |

### 주요 게임 메커니즘

- **Go/No-Go**: 타겟의 20%가 NO_GO(빨간색). 클릭하면 감점
- **적응형 난이도(Adaptive)**: Hit 시 spawnRate·targetLifespan이 0.98배로 빨라지고, Miss 시 1.05배로 느려짐. 하한선: spawnRate 300ms, targetLifespan 500ms
- **점수 체계**: GO 히트 +100, 인지 정답 +200, Miss -50, 인지 오답 -100 (최소 0)
- **세션 기록**: 최근 50개 세션을 localStorage에 보관

### 커스텀 색상 (src/index.css @theme)

`background`, `foreground`, `primary`, `secondary`, `accent`, `success`, `error` 가 `@theme` 디렉티브로 정의되어 있으므로 UI 작업 시 이 토큰을 사용할 것 (예: `bg-background`, `text-primary`).

### 유틸리티 함수 (App.tsx)

- `normalCDF(x)` — 정규분포 누적분포함수 근사 (Abramowitz & Stegun 방식)
- `getResponseTimePercentile(avgRT)` — 평균 반응시간을 Dual-task RT 기준(mean 450ms, SD 120ms)으로 상위 퍼센타일 계산. 결과 화면에서 사용

## 알아야 할 사항

- `App.css`는 Vite 템플릿 기본 파일로 현재 사용되지 않음. 스타일은 `index.css` + Tailwind 유틸리티 클래스로 처리
- GameEngine은 React 외부의 순수 클래스이며, `useRef`로 인스턴스를 유지한다. React 리렌더와 무관하게 Canvas 루프가 독립 동작
- Vite 8 beta + rolldown 사용 중. **타입 import 시 반드시 `import type` 사용** (`verbatimModuleSyntax` 활성화 + rolldown이 값 import로 타입을 찾으면 `MISSING_EXPORT` 에러 발생)
- Tailwind v4는 `@tailwindcss/vite` 플러그인으로 직접 통합. `tailwind.config.js` 파일은 v4에서 자동 인식하지 않으므로 사용하지 않음. 색상/테마 커스터마이징은 `index.css`의 `@theme` 블록에서 처리

## 교훈 (실수 방지)

- **GameBoard의 useEffect에 `settings`를 의존성으로 넣지 말 것.** adaptive difficulty가 매 hit/miss마다 settings를 변경하므로, 게임 루프와 타이머가 매번 리셋되는 치명적 버그를 일으킨다. settings 동기화는 별도 useEffect(`updateSettings`)로 처리한다.
- **GameEngine.start()는 반드시 stop()을 먼저 호출할 것.** 그렇지 않으면 requestAnimationFrame 루프가 중복 실행된다.
- **Zustand 액션에서 외부 시스템(엔진) 콜백이 호출될 수 있으므로, 상태 가드(`if (get().status !== 'PLAYING') return`)를 넣을 것.** 게임 종료 후에도 엔진이 한두 프레임 더 돌면서 콜백을 호출할 수 있다.
- **키보드 입력은 `e.key` 대신 `e.code`를 사용할 것.** 한글 IME 활성화 시 `e.key`는 'ㅁ', 'ㅇ' 등을 반환하지만, `e.code`는 물리 키 코드('KeyA', 'KeyD')를 반환하므로 IME 상태와 무관하게 동작한다.
