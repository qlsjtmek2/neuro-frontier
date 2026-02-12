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

// Dual-task visual RT 기준: mean ~450ms, SD ~120ms
function getResponseTimePercentile(avgRT: number): number {
  const z = (avgRT - 450) / 120;
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

const App: React.FC = () => {
  const { status, startCountdown, startGame, score, session, resetGame } = useGameStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      {status === 'IDLE' && (
        <div className="flex flex-col md:flex-row gap-8 items-start max-w-6xl w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Menu */}
          <div className="text-center space-y-8 p-10 bg-secondary rounded-3xl shadow-2xl border border-white/10 flex-1 w-full md:sticky md:top-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter text-primary">
                NEURO <br />
                <span className="text-white">FRONTIER</span>
              </h1>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>
            
            <p className="text-slate-400 text-lg leading-relaxed">
              인지-운동 이중 과업을 통한 <br />
              <span className="text-white font-medium">에이징 커브 극복</span> 트레이닝
            </p>

            <button
              onClick={startCountdown}
              className="w-full py-5 bg-primary hover:bg-blue-600 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-xl shadow-blue-500/25 group"
            >
              트레이닝 시작
              <span className="block text-xs font-normal text-blue-200 mt-1 opacity-60 group-hover:opacity-100 uppercase tracking-widest">Start Session</span>
            </button>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-background/50 rounded-xl border border-white/5">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Motor</div>
                <div className="text-xs text-slate-300">Mouse Agility</div>
              </div>
              <div className="p-4 bg-background/50 rounded-xl border border-white/5">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Cognitive</div>
                <div className="text-xs text-slate-300">Dual-Task Parity</div>
              </div>
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

      {status === 'RESULT' && session && (
        <div className="text-center space-y-6 p-10 bg-secondary rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full mx-4">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white">훈련 요약</h2>
            <p className="text-slate-400">데이터 기반 인지-운동 퍼포먼스 분석</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Primary Metrics */}
            <div className="col-span-1 md:col-span-2 p-6 bg-primary/10 rounded-2xl border border-primary/20 flex justify-between items-center">
              <div className="text-left">
                <div className="text-primary text-sm font-bold uppercase tracking-widest">Final Score</div>
                <div className="text-5xl font-black text-primary">{score}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Response Time</div>
                <div className="text-4xl font-black text-accent">{Math.round(session.averageResponseTime)}ms</div>
                {session.averageResponseTime > 0 && (
                  <div className="text-sm font-bold mt-1">
                    <span className="text-slate-500">상위 </span>
                    <span className={`${getResponseTimePercentile(session.averageResponseTime) <= 30 ? 'text-success' : getResponseTimePercentile(session.averageResponseTime) <= 60 ? 'text-accent' : 'text-error'}`}>
                      {getResponseTimePercentile(session.averageResponseTime)}%
                    </span>
                  </div>
                )}
              </div>
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
