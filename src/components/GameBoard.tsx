import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engines/GameEngine';
import { useGameStore } from '../store/useGameStore';

export const GameBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { 
    status, score, settings, currentTask, hits,
    addHit, addMiss, addCognitiveHit, addCognitiveMiss, endGame 
  } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(60);

  // Sync settings with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Handle Keyboard Input for Cognitive Task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'PLAYING' || !currentTask) return;

      const code = e.code;
      if (code === 'KeyA' || code === 'KeyD') {
        const inputAnswer = code === 'KeyA' ? 'LEFT' : 'RIGHT';
        if (inputAnswer === currentTask.answer) {
          addCognitiveHit();
        } else {
          addCognitiveMiss();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, currentTask, addCognitiveHit, addCognitiveMiss]);

  // Engine creation (once)
  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, {
        onHit: (rt) => addHit(rt),
        onMiss: () => addMiss(),
        onNoGoHit: () => addMiss(),
      }, settings);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game lifecycle - start/stop based on status only
  useEffect(() => {
    if (status === 'PLAYING') {
      setTimeLeft(settings.duration);
      engineRef.current?.start();

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        engineRef.current?.stop();
      };
    }

    engineRef.current?.stop();
  }, [status, endGame, settings.duration]);

  return (
    <div className="fixed inset-0 bg-background cursor-crosshair overflow-hidden">
      <canvas ref={canvasRef} />
      
      {/* Central Cognitive Task Overlay */}
      {status === 'PLAYING' && currentTask && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-secondary/80 backdrop-blur-md px-12 py-8 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in duration-300">
              <div className="text-6xl font-black text-white mb-2">{currentTask.question}</div>
              <div className="flex justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-tighter">
                <span>[A] ODD</span>
                <span className="mx-4">|</span>
                <span>EVEN [D]</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Score</div>
          <div className="text-4xl font-black text-primary">{score}</div>
        </div>
        
        <div className="text-center">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Time</div>
          <div className={`text-4xl font-black ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Hits</div>
          <div className="text-4xl font-black text-success">{hits}</div>
        </div>
      </div>

      {/* Adaptive Difficulty Indicator (Optional Visual) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] pointer-events-none">
        Adaptive Speed: {Math.round(1000 / settings.spawnRate * 10) / 10} targets/sec
      </div>
    </div>
  );
};
