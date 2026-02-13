import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import { GameBoard } from './components/GameBoard';
import { AdSense } from './components/AdSense';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// Normal CDF approximation (Abramowitz & Stegun)
function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

function getResponseTimePercentile(avgRT: number): number {
  const z = (avgRT - 650) / 150;
  return Math.max(1, Math.min(99, Math.round(normalCDF(z) * 100)));
}

const CountdownOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) return;
    const timer = setTimeout(() => {
      if (count === 1) {
        onComplete();
      } else {
        setCount(count - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div key={count} className="text-[12rem] font-black text-primary animate-in zoom-in-50 fade-in duration-500">
        {count}
      </div>
    </div>
  );
};

const getPerformanceRank = (rt: number) => {
  const p = getResponseTimePercentile(rt);
  if (p <= 5) return { label: '탈 인간급', color: 'text-primary', percentile: `상위 ${p}%` };
  if (p <= 15) return { label: '프로 운동선수', color: 'text-success', percentile: `상위 ${p}%` };
  if (p <= 35) return { label: '우수한 집중력', color: 'text-accent', percentile: `상위 ${p}%` };
  if (p <= 65) return { label: '평균 수준', color: 'text-white', percentile: `상위 ${p}%` };
  return { label: '훈련 필요', color: 'text-slate-500', percentile: `상위 ${p}%` };
};

const MainGame: React.FC = () => {
  const { 
    status, startCountdown, startGame, score, session, resetGame, history, 
    nickname, setNickname, submitScore, fetchLeaderboard, leaderboard 
  } = useGameStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const bestScore = history && history.length > 0 
    ? Math.max(...history.map(s => s.score)) 
    : 0;

  const rank = session ? getPerformanceRank(session.averageResponseTime) : null;

  const handleStartCountdown = () => {
    setHasSubmitted(false);
    startCountdown();
  };

  const handleSubmitScore = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요!');
      return;
    }
    setIsSubmitting(true);
    const { success, error } = await submitScore();
    setIsSubmitting(false);
    if (success) {
      setHasSubmitted(true);
      alert('기록이 등록되었습니다!');
    } else {
      console.error(error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 md:justify-center font-sans overflow-y-auto">
      {status === 'IDLE' && (
        <div className="flex flex-col md:flex-row gap-8 items-start max-w-6xl w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Menu */}
          <div className="text-center space-y-8 p-10 bg-secondary rounded-3xl shadow-2xl border border-white/10 flex-1 w-full">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter">
                <span className="text-blue-500">NEURO</span> <br />
                <span className="text-white">FRONTIER</span>
              </h1>
              <div className="h-1.5 w-24 bg-blue-500 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
            
            {/* Best Score Badge */}
            {bestScore > 0 && (
              <div className="inline-block px-6 py-3 bg-primary/10 rounded-2xl border border-primary/30">
                <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Personal Best</span>
                <div className="text-3xl font-black text-white">{bestScore}</div>
              </div>
            )}

            <div className="space-y-6">
              <div className="text-left space-y-4 bg-background/40 p-6 rounded-2xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">How to Play</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-[10px]">1</span>
                    </div>
                    <p className="text-sm text-slate-300">정확한 측정을 위해 <span className="text-white font-bold">화면을 크게 키워주세요.</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-[10px]">2</span>
                    </div>
                    <p className="text-sm text-slate-300"><span className="text-blue-500 font-bold">파란색 타겟</span>을 마우스로 빠르게 클릭하세요.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-[10px]">3</span>
                    </div>
                    <p className="text-sm text-slate-300">중앙의 숫자가 <span className="text-white font-bold">홀수면 [A]</span>, <span className="text-white font-bold">짝수면 [D]</span> 키를 누르세요.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-[10px]">4</span>
                    </div>
                    <p className="text-sm text-slate-300"><span className="text-error font-bold">빨간색 타겟</span>을 클릭하면 점수가 깎이니 주의하세요!</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartCountdown}
                className="w-full py-5 bg-primary hover:bg-blue-400 text-white rounded-2xl font-black text-2xl transition-all active:scale-[0.98] shadow-[0_0_25px_rgba(59,130,246,0.4)] border-2 border-blue-400/50 group"
              >
                트레이닝 시작
                <span className="block text-xs font-bold text-blue-100 mt-1 opacity-70 group-hover:opacity-100 uppercase tracking-[0.2em]">Start Training</span>
              </button>

              {/* Main Menu Bottom Ad */}
              <AdSense slot="1234567890" />
            </div>
          </div>

          {/* Sidebar: Leaderboard & History */}
          <div className="w-full md:w-80 space-y-8">
            {/* Global Leaderboard */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-2">
                <h3 className="text-xl font-bold text-white">글로벌 랭킹</h3>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Top 10</span>
              </div>
              <div className="space-y-2">
                {useGameStore.getState().isLeaderboardLoading ? (
                  <div className="p-4 text-center bg-secondary/30 rounded-xl border border-dashed border-white/5 text-slate-500 text-xs flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                    데이터를 불러오는 중...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center bg-secondary/30 rounded-xl border border-dashed border-white/5">
                    <p className="text-slate-500 text-sm italic">아직 등록된 기록이 없습니다.</p>
                  </div>
                ) : (
                  leaderboard.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-white/5">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-accent text-background' : i === 1 ? 'bg-slate-300 text-background' : i === 2 ? 'bg-orange-400 text-background' : 'text-slate-500'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{entry.nickname}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{entry.avg_rt}ms | {entry.accuracy}%</div>
                      </div>
                      <div className="text-primary font-black">{entry.score}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History Sidebar */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-2">
                <h3 className="text-xl font-bold text-white">최근 기록</h3>
                <button 
                  onClick={() => { if(confirm('기록을 모두 삭제하시겠습니까?')) useGameStore.getState().clearHistory(); }}
                  className="text-[10px] font-bold text-slate-500 hover:text-error transition-colors uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="p-8 text-center bg-secondary/30 rounded-2xl border border-dashed border-white/10">
                    <p className="text-slate-500 text-sm italic">아직 기록이 없습니다.</p>
                  </div>
                ) : (
                  history.map((s) => (
                    <div key={s.id} className="p-4 bg-secondary/50 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-slate-500 font-medium">
                          {new Date(s.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-primary font-black text-lg group-hover:scale-110 transition-transform">{s.score}</div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <div className="text-slate-400">RT: <span className="text-accent">{Math.round(s.averageResponseTime)}ms</span></div>
                        <div className="text-slate-400">ACC: <span className="text-success">{s.totalTargets > 0 ? Math.round((s.hits / s.totalTargets) * 100) : 0}%</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Description Section (For SEO & AdSense) */}
      {status === 'IDLE' && (
        <div className="max-w-4xl w-full px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white border-l-4 border-blue-500 pl-4">인지-운동 이중 과업(Dual-Task) 트레이닝이란?</h2>
            <div className="grid md:grid-cols-2 gap-8 text-slate-400 leading-relaxed text-sm">
              <p>
                Neuro Frontier는 현대 스포츠 과학과 인지 심리학에서 중요하게 다루는 <strong>'이중 과업(Dual-Task)'</strong> 원리를 기반으로 설계되었습니다. 단순한 반응 속도 측정을 넘어, 신체적 민첩성(마우스 클릭)과 고차원적 인지 판단(키보드 수 연산)을 동시에 수행하도록 강제함으로써 뇌의 정보 처리 효율을 극대화합니다.
              </p>
              <p>
                우리의 뇌는 두 가지 이상의 복잡한 작업을 동시에 수행할 때 '병목 현상'을 겪습니다. 지속적인 이중 과업 훈련은 이러한 병목 구간을 단축시키고, 실전 게임(LOL, FPS 등)이나 일상생활에서 예상치 못한 상황이 발생했을 때 더 빠르고 정확한 판단을 내릴 수 있는 능력을 길러줍니다.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white border-l-4 border-blue-500 pl-4">에이징 커브를 극복하는 과학적 접근</h2>
            <div className="bg-secondary/30 p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-blue-500 font-black text-lg">01. 억제 제어</div>
                  <p className="text-xs text-slate-500 leading-relaxed">불필요한 자극(빨간색 타겟)을 무시하고 필요한 자극에만 반응하는 능력을 단련하여 실수율을 줄입니다.</p>
                </div>
                <div className="space-y-2">
                  <div className="text-blue-500 font-black text-lg">02. 적응형 난이도</div>
                  <p className="text-xs text-slate-500 leading-relaxed">사용자의 현재 퍼포먼스를 실시간으로 분석하여, 너무 쉽지도 어렵지도 않은 '몰입(Flow)' 상태의 난이도를 유지합니다.</p>
                </div>
                <div className="space-y-2">
                  <div className="text-blue-500 font-black text-lg">03. 정밀한 피드백</div>
                  <p className="text-xs text-slate-500 leading-relaxed">밀리초(ms) 단위의 반응 속도와 정확도를 시각화하여 자신의 성장 추이를 객관적으로 파악할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              © 2026 Neuro Frontier. All rights reserved.
            </div>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy-policy" className="hover:text-white transition-colors underline decoration-blue-500/50 underline-offset-4">Privacy Policy</Link>
            </div>
          </footer>
        </div>
      )}

      {status === 'COUNTDOWN' && <CountdownOverlay onComplete={startGame} />}

      {status === 'PLAYING' && <GameBoard />}

      {status === 'RESULT' && session && rank && (
        <div className="text-center space-y-6 p-10 bg-secondary rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full mx-4 animate-in zoom-in duration-500">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white">훈련 요약</h2>
            <p className="text-slate-400">데이터 기반 인지-운동 퍼포먼스 분석</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Primary Metrics: Rank & Percentile */}
            <div className="col-span-1 md:col-span-2 p-8 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col items-center justify-center space-y-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10 text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Performance Tier</div>
              <div className={`relative z-10 text-5xl font-black ${rank.color} drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`}>{rank.label}</div>
              <div className="relative z-10 text-white/60 font-bold text-lg">{rank.percentile} 수준</div>
            </div>

            {/* Final Score */}
            <div className="p-6 bg-background/50 rounded-xl border border-white/5 flex flex-col justify-center">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Final Score</div>
              <div className="text-4xl font-black text-primary">{score}</div>
            </div>

            {/* Response Time */}
            <div className="p-6 bg-background/50 rounded-xl border border-white/5 flex flex-col justify-center">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Avg Response</div>
              <div className="text-4xl font-black text-accent">{Math.round(session.averageResponseTime)}ms</div>
            </div>

            {/* Leaderboard Submission */}
            <div className="col-span-1 md:col-span-2 p-6 bg-secondary/50 rounded-2xl border border-white/5 space-y-4">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">Global Leaderboard</div>
              {!hasSubmitted ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="닉네임 입력"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={12}
                    className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 whitespace-nowrap"
                  >
                    {isSubmitting ? '등록 중...' : '기록 등록'}
                  </button>
                </div>
              ) : (
                <div className="py-3 text-success font-bold flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  글로벌 랭킹에 등록되었습니다!
                </div>
              )}
            </div>

            {/* Motor Performance */}
            <div className="p-5 bg-background/50 rounded-xl border border-white/5 space-y-2">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Motor Agility (Mouse)</div>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-success">{session.hits} <span className="text-xs text-slate-500">Hits</span></div>
                <div className="text-xl font-bold text-white">
                  {session.totalTargets > 0 ? Math.round((session.hits / session.totalTargets) * 100) : 0}%
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-success h-full transition-all duration-1000" 
                  style={{ width: `${session.totalTargets > 0 ? (session.hits / session.totalTargets) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Cognitive Performance */}
            <div className="p-5 bg-background/50 rounded-xl border border-white/5 space-y-2">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cognitive Task (Keyboard)</div>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-primary">{session.cognitiveHits} <span className="text-xs text-slate-500">Correct</span></div>
                <div className="text-xl font-bold text-white">
                  {session.cognitiveHits + session.cognitiveMisses > 0 
                    ? Math.round((session.cognitiveHits / (session.cognitiveHits + session.cognitiveMisses)) * 100) 
                    : 0}%
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-1000" 
                  style={{ width: `${(session.cognitiveHits + session.cognitiveMisses) > 0 ? (session.cognitiveHits / (session.cognitiveHits + session.cognitiveMisses)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCountdown}
              className="py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              다시 도전하기
            </button>
            <button
              onClick={resetGame}
              className="py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
            >
              메인으로
            </button>
          </div>

          {/* Result Screen Bottom Ad */}
          <AdSense slot="0987654321" />
        </div>
      )}
    </div>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return <div className="min-h-screen bg-background" />;

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainGame />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
      </Routes>
    </Router>
  );
};

export default App;
