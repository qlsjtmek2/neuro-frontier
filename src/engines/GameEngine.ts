import type { Target, GameSettings } from '../types';

interface EngineOptions {
  onHit: (responseTime: number) => void;
  onMiss: () => void;
  onNoGoHit: () => void;
}

interface VisualEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  startTime: number;
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private targets: Target[] = [];
  private effects: VisualEffect[] = [];
  private animationId: number | null = null;
  private lastSpawnTime: number = 0;
  private options: EngineOptions;
  
  private settings: GameSettings;

  constructor(canvas: HTMLCanvasElement, options: EngineOptions, initialSettings: GameSettings) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.options = options;
    this.settings = initialSettings;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousedown', (e) => this.handleInput(e.clientX, e.clientY));
  }

  public updateSettings(newSettings: GameSettings) {
    this.settings = newSettings;
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
  }

  public start() {
    this.stop();
    this.targets = [];
    this.lastSpawnTime = performance.now();
    this.animate(performance.now());
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate = (time: number) => {
    this.update(time);
    this.draw();
    this.animationId = requestAnimationFrame(this.animate);
  };

  private update(time: number) {
    // Remove expired targets
    this.targets = this.targets.filter(t => {
      if (time > t.expiresAt) {
        if (t.type === 'GO') {
          this.options.onMiss();
        }
        return false;
      }
      return true;
    });

    // Spawn new targets
    if (time - this.lastSpawnTime > this.settings.spawnRate) {
      this.spawnTarget(time);
      this.lastSpawnTime = time;
    }
  }

  private spawnTarget(time: number) {
    const radius = Math.random() * (this.settings.targetMaxRadius - this.settings.targetMinRadius) + this.settings.targetMinRadius;
    const x = Math.random() * (window.innerWidth - radius * 2) + radius;
    const y = Math.random() * (window.innerHeight - radius * 2) + radius;
    
    // 20% chance for NO_GO target
    const type = Math.random() > 0.8 ? 'NO_GO' : 'GO';

    this.targets.push({
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      radius,
      createdAt: time,
      expiresAt: time + this.settings.targetLifespan,
      type,
    });
  }

  private handleInput(clientX: number, clientY: number) {
    const now = performance.now();

    const hitIndex = this.targets.findIndex(t => {
      const dist = Math.sqrt((clientX - t.x) ** 2 + (clientY - t.y) ** 2);
      return dist <= t.radius;
    });

    const hitTarget = hitIndex >= 0 ? this.targets[hitIndex] : null;

    if (hitTarget) {
      if (hitTarget.type === 'GO') {
        this.options.onHit(now - hitTarget.createdAt);
      } else {
        this.options.onNoGoHit();
      }
      this.targets.splice(hitIndex, 1);
    }

    // Add click effect
    this.effects.push({
      x: clientX,
      y: clientY,
      radius: 0,
      maxRadius: hitTarget ? 50 : 30,
      startTime: now,
      color: hitTarget
        ? hitTarget.type === 'GO' ? '#3b82f6' : '#ef4444'
        : '#64748b',
    });
  }

  private draw() {
    const now = performance.now();
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw effects (ripples)
    this.effects = this.effects.filter(e => {
      const elapsed = now - e.startTime;
      const duration = 400;
      if (elapsed > duration) return false;

      const progress = elapsed / duration;
      const opacity = 1 - progress;
      const radius = e.maxRadius * progress;

      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `${e.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.closePath();
      return true;
    });

    this.targets.forEach(t => {
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      
      // Visual distinction for GO/NO_GO
      if (t.type === 'GO') {
        this.ctx.fillStyle = '#3b82f6'; // Primary Blue
      } else {
        this.ctx.fillStyle = '#ef4444'; // Error Red
      }
      
      this.ctx.fill();
      this.ctx.closePath();

      // Progress ring
      const progress = (performance.now() - t.createdAt) / (t.expiresAt - t.createdAt);
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius + 5, 0, Math.PI * 2 * (1 - progress));
      this.ctx.strokeStyle = t.type === 'GO' ? '#f8fafc' : '#ef4444';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.closePath();
    });
  }
}
