export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'RESULT';

export interface Target {
  id: string;
  x: number;
  y: number;
  radius: number;
  createdAt: number;
  expiresAt: number;
  type: 'GO' | 'NO_GO';
}

export interface CognitiveTask {
  question: string;
  answer: 'LEFT' | 'RIGHT'; // e.g., LEFT for odd, RIGHT for even
  type: 'PARITY' | 'MATH';
}

export interface GameSession {
  id: string;
  startTime: number;
  endTime: number | null;
  score: number;
  totalTargets: number;
  hits: number;
  misses: number;
  cognitiveHits: number;
  cognitiveMisses: number;
  averageResponseTime: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  targets: Target[];
  session: GameSession | null;
  settings: GameSettings;
  currentTask: CognitiveTask | null;
}

export interface GameSettings {
  duration: number; // seconds
  targetMinRadius: number;
  targetMaxRadius: number;
  spawnRate: number; // ms
  targetLifespan: number; // ms
  difficultyMultiplier: number;
}
