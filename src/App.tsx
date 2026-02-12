import React, { useState, useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { GameBoard } from './components/GameBoard';

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

// Dual-task visual RT 기준 완화: 이중 과업 부하 고려
// mean ~650ms, SD ~150ms (500ms 이하면 초엘리트 수준)
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

const App: React.FC = () => {
  const { status, startCountdown, startGame, score, session, resetGame, history } = useGameStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const bestScore = history && history.length > 0 
    ? Math.max(...history.map(s => s.score)) 
    : 0;

  const rank = session ? getPerformanceRank(session.averageResponseTime) : null;

  if (!isHydrated) return <div className="min-h-screen bg-background" />;

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
                    <p className="text-sm text-slate-300"><span className="text-blue-500 font-bold">파란색 타겟</span>을 마우스로 빠르게 클릭하세요.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-[10px]">2</span>
                    </div>
                    <p className="text-sm text-slate-300">중앙의 숫자가 <span className="text-white font-bold">홀수면 [A]</span>, <span className="text-white font-bold">짝수면 [D]</span> 키를 누르세요.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-[10px]">3</span>
                    </div>
                    <p className="text-sm text-slate-300"><span className="text-error font-bold">빨간색 타겟</span>을 클릭하면 점수가 깎이니 주의하세요!</p>
                  </div>
                </div>
              </div>

              <button
                onClick={startCountdown}
                className="w-full py-5 bg-primary hover:bg-blue-400 text-white rounded-2xl font-black text-2xl transition-all active:scale-[0.98] shadow-[0_0_25px_rgba(59,130,246,0.4)] border-2 border-blue-400/50 group"
              >
                트레이닝 시작
                <span className="block text-xs font-bold text-blue-100 mt-1 opacity-70 group-hover:opacity-100 uppercase tracking-[0.2em]">Start Training</span>
              </button>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="w-full md:w-80 space-y-4">
            <div className="flex justify-between items-end px-2">
              <h3 className="text-xl font-bold text-white">최근 기록</h3>
              <button 
                onClick={() => { if(confirm('기록을 모두 삭제하시겠습니까?')) useGameStore.getState().clearHistory(); }}
                className="text-[10px] font-bold text-slate-500 hover:text-error transition-colors uppercase tracking-widest"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {useGameStore.getState().history.length === 0 ? (
                <div className="p-8 text-center bg-secondary/30 rounded-2xl border border-dashed border-white/10">
                  <p className="text-slate-500 text-sm italic">아직 기록이 없습니다.</p>
                </div>
              ) : (
                useGameStore.getState().history.map((s) => (
                  <div key={s.id} className="p-4 bg-secondary/50 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-slate-500 font-medium">
                        {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        </div>
      )}
    </div>
  );
};

export default App;
