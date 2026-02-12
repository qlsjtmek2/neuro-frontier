import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameStatus, GameSession, GameSettings, CognitiveTask } from '../types';

interface GameStore {
  status: GameStatus;
  score: number;
  hits: number;
  misses: number;
  cognitiveHits: number;
  cognitiveMisses: number;
  responseTimes: number[];
  session: GameSession | null;
  history: GameSession[];
  settings: GameSettings;
  currentTask: CognitiveTask | null;

  // Actions
  startCountdown: () => void;
  startGame: () => void;
  endGame: () => void;
  addHit: (responseTime: number) => void;
  addMiss: () => void;
  addCognitiveHit: () => void;
  addCognitiveMiss: () => void;
  setNewTask: () => void;
  resetGame: () => void;
  adjustDifficulty: (success: boolean) => void;
  clearHistory: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  duration: 60,
  targetMinRadius: 20,
  targetMaxRadius: 40,
  spawnRate: 1000,
  targetLifespan: 1500,
  difficultyMultiplier: 1.0,
};

const generateTask = (): CognitiveTask => {
  const num = Math.floor(Math.random() * 100);
  return {
    question: num.toString(),
    answer: num % 2 === 0 ? 'RIGHT' : 'LEFT', // Even: D (Right), Odd: A (Left)
    type: 'PARITY',
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      status: 'IDLE',
      score: 0,
      hits: 0,
      misses: 0,
      cognitiveHits: 0,
      cognitiveMisses: 0,
      responseTimes: [],
      session: null,
      history: [],
      settings: DEFAULT_SETTINGS,
      currentTask: null,

      startCountdown: () => {
        set({ status: 'COUNTDOWN' });
      },

      startGame: () => {
        set({
          status: 'PLAYING',
          score: 0,
          hits: 0,
          misses: 0,
          cognitiveHits: 0,
          cognitiveMisses: 0,
          responseTimes: [],
          settings: { ...DEFAULT_SETTINGS },
          currentTask: generateTask(),
          session: {
            id: Date.now().toString(),
            startTime: Date.now(),
            endTime: null,
            score: 0,
            totalTargets: 0,
            hits: 0,
            misses: 0,
            cognitiveHits: 0,
            cognitiveMisses: 0,
            averageResponseTime: 0,
          },
        });
      },

      endGame: () => {
        const { score, hits, misses, cognitiveHits, cognitiveMisses, responseTimes, session, history } = get();
        const avgRT = responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0;

        const updatedSession: GameSession = {
          ...(session as GameSession),
          endTime: Date.now(),
          score,
          hits,
          misses,
          cognitiveHits,
          cognitiveMisses,
          totalTargets: hits + misses,
          averageResponseTime: avgRT,
        };

        set({
          status: 'RESULT',
          currentTask: null,
          session: updatedSession,
          history: [updatedSession, ...history].slice(0, 50), // Keep last 50 sessions
        });
      },

      addHit: (responseTime: number) => {
        if (get().status !== 'PLAYING') return;
        const { score, hits, responseTimes } = get();
        set({
          score: score + 100,
          hits: hits + 1,
          responseTimes: [...responseTimes, responseTime],
        });
        get().adjustDifficulty(true);
      },

      addMiss: () => {
        if (get().status !== 'PLAYING') return;
        const { score, misses } = get();
        set({
          score: Math.max(0, score - 50),
          misses: misses + 1,
        });
        get().adjustDifficulty(false);
      },

      addCognitiveHit: () => {
        if (get().status !== 'PLAYING') return;
        set((state) => ({
          score: state.score + 200,
          cognitiveHits: state.cognitiveHits + 1,
          currentTask: generateTask(),
        }));
      },

      addCognitiveMiss: () => {
        if (get().status !== 'PLAYING') return;
        set((state) => ({
          score: Math.max(0, state.score - 500),
          cognitiveMisses: state.cognitiveMisses + 1,
          currentTask: generateTask(),
        }));
      },

      setNewTask: () => {
        set({ currentTask: generateTask() });
      },

      adjustDifficulty: (success: boolean) => {
        const { settings } = get();
        const factor = success ? 0.98 : 1.05;
        
        set({
          settings: {
            ...settings,
            spawnRate: Math.max(300, settings.spawnRate * factor),
            targetLifespan: Math.max(500, settings.targetLifespan * factor),
          }
        });
      },

      resetGame: () => {
        set({
          status: 'IDLE',
          score: 0,
          hits: 0,
          misses: 0,
          cognitiveHits: 0,
          cognitiveMisses: 0,
          responseTimes: [],
          session: null,
          currentTask: null,
          settings: DEFAULT_SETTINGS,
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'neuro-physical-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ history: state.history }), // Only persist history
    }
  )
);
