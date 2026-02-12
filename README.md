# 🧠 Neuro Frontier (뉴로 프론티어)

> **"Pioneering the edge of your potential"**  
> 에이징 커브를 극복하고 민첩성과 집중력을 동시에 훈련하는 인지-운동 이중 과업(Dual-Task) 웹 게임입니다.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deployed%20to-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://neuro-frontier.pages.dev/)

---

## 🎮 Live Demo
**지금 바로 훈련을 시작하세요:** [https://neuro-frontier.pages.dev/](https://neuro-frontier.pages.dev/)

---

## 🚀 주요 기능

### 1. 인지-운동 이중 과업 (Dual-Task)
단순한 클릭 반응을 넘어, 뇌의 고차원 판단 능력을 동시에 요구합니다.
- **Physical**: 화면 사방에 나타나는 타겟을 마우스로 정밀하게 타격 (Mouse Agility).
- **Cognitive**: 화면 중앙의 숫자를 보고 홀수/짝수를 판단하여 키보드(A/D)로 응답 (Dual-Task Parity).

### 2. 실시간 적응형 난이도 (Adaptive Closed-Loop)
사용자의 실력에 맞춰 난이도가 실시간으로 진화합니다.
- 반응 속도가 빠를수록 타겟 생성 주기가 짧아지고 유지 시간이 줄어듭니다.
- 오답률이 높아지면 난이도를 하향 조정하여 사용자가 항상 '몰입(Flow)' 상태를 유지하도록 돕습니다.

### 3. 억제 통제 훈련 (Go/No-Go)
- **Blue Target**: 즉시 타격 (Go).
- **Red Target**: 절대 타격 금지 (No-Go). 뇌의 충동을 억제하고 정교한 제어 능력을 기릅니다.

### 4. 퍼포먼스 데이터 시각화
- 훈련 세션 완료 후 정확도, 평균 반응 시간(RT), 인지 과제 성적 등 상세 리포트 제공.
- 로컬 스토리지를 활용한 과거 훈련 이력(History) 저장 및 성장 추이 확인.

---

## 🛠 기술 스택
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand (Persistence Middleware)
- **Engine**: Canvas API (60FPS Game Loop)
- **Deployment**: Cloudflare Pages

---

## 📦 설치 및 로컬 실행

1. 저장소 클론
```bash
git clone https://github.com/qlsjtmek2/neuro-frontier.git
cd neuro-frontier
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

---

## 💡 개발 철학
에이징 커브로 인해 저하되는 **정보 처리 속도(Processing Speed)**와 **작업 기억(Working Memory)**을 물리적 운동과 결합하여 개선하는 가장 현대적인 트레이닝 방법론을 지향합니다.
