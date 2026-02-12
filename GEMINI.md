# Neuro Frontier (Physical Training)

에이징 커브를 극복하고 민첩성과 집중력을 동시에 훈련하는 인지-운동 이중 과업(Cognitive-Motor Dual-Task) 웹 게임입니다.

## 📋 프로젝트 개요
- **목적**: 정보 처리 속도(뇌)와 신체 반응 속도(몸)를 정밀하게 결합한 훈련 도구 제공.
- **핵심 원리**:
  - **이중 과업 (Dual-Task)**: 마우스 에임 민첩성 훈련과 키보드 인지 과제(홀짝 판단)를 동시에 수행.
  - **적응형 폐쇄 루프 (Adaptive Closed-Loop)**: 사용자의 퍼포먼스(RT, 정확도)에 따라 실시간으로 타겟 생성 속도 및 유지 시간을 조정.
  - **억제 제어 (Inhibitory Control)**: Go/No-Go 타겟 시스템을 통해 불필요한 반응을 억제하는 능력 단련.

## 🛠 기술 스택
- **Framework**: React 19 (Vite 8)
- **Language**: TypeScript
- **Backend**: Supabase (Database, Global Leaderboard)
- **State Management**: Zustand (with Persist middleware)
- **Styling**: Tailwind CSS v4
- **Rendering**: Canvas API (requestAnimationFrame 기반 60FPS 게임 루프)

## 🏗 시스템 아키텍처
- **UI Layer (React)**: 메뉴, 카운트다운, 결과 대시보드, 세션 통계 UI 담당.
- **Game Layer (Canvas + Vanilla TS)**: `src/engines/GameEngine.ts`. 타겟 렌더링, 정밀 입력 판정, 시각적 피드백(Ripple) 담당.
- **State Layer (Zustand)**: `src/store/useGameStore.ts`. 전역 게임 상태, 세션 기록, 난이도 매개변수 관리.
- **Backend Layer (Supabase)**: 글로벌 랭킹 데이터 저장 및 실시간 조회.

## 🔑 환경 변수 (.env)
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous API Key

## 🚀 주요 명령어
- `npm run dev`: 개발 서버 실행 (http://localhost:5173)
- `npm run build`: 프로덕션 빌드 생성
- `npm run lint`: ESLint를 이용한 코드 스타일 검사

## 📂 주요 파일 및 구조
- `src/App.tsx`: 메인 진입점, 화면 전환 및 오버레이 관리.
- `src/engines/GameEngine.ts`: Canvas 기반 핵심 게임 엔진 및 렌더링 로직.
- `src/store/useGameStore.ts`: 게임 로직, 난이도 조정 알고리즘, 세션 이력 관리.
- `src/components/GameBoard.tsx`: Canvas 요소 래퍼 및 React-Engine 가교 역할.
- `src/types/index.ts`: 게임 전반에서 사용되는 핵심 타입 정의.

## 💡 개발 가이드라인
- **반응성 최우선**: 입력 지연(Input Lag)을 최소화하기 위해 게임 로직은 순수 TypeScript 기반의 엔진에서 직접 처리합니다.
- **적응형 난이도 유지**: 사용자가 훈련에 몰입(Flow)할 수 있도록, 성공/실패에 따른 난이도 보정치(현재 약 2~5%)를 정밀하게 유지해야 합니다.
- **시각적 피드백**: 타격감(Game Feel)을 위해 클릭 파동 효과 및 HUD 애니메이션이 중요하게 다루어집니다.
- **데이터 활용**: 사용자의 성장 추이를 보여주기 위해 세션 이력(`history`)은 항상 로컬 스토리지에 유지됩니다.
