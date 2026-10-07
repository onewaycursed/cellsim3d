/**
 * Простая система tween-анимации.
 * Позволяет плавно менять числовые значения во времени.
 */
export class Transition {
  private startValue: number;
  private endValue: number;
  private duration: number;
  private elapsed = 0;
  private onUpdate: (v: number) => void;
  private onComplete?: () => void;
  private done = false;

  constructor(
    from: number,
    to: number,
    duration: number,
    onUpdate: (v: number) => void,
    onComplete?: () => void
  ) {
    this.startValue = from;
    this.endValue = to;
    this.duration = duration;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  public update(dt: number): void {
    if (this.done) return;
    this.elapsed += dt;
    const t = Math.min(1, this.elapsed / this.duration);
    // easeInOutCubic
    const eased = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const value = this.startValue + (this.endValue - this.startValue) * eased;
    this.onUpdate(value);
    if (t >= 1) {
      this.done = true;
      this.onComplete?.();
    }
  }

  public isDone(): boolean {
    return this.done;
  }
}

/** Менеджер, который обновляет все активные переходы. */
export class TransitionManager {
  private transitions: Transition[] = [];

  public add(t: Transition): void {
    this.transitions.push(t);
  }

  public update(dt: number): void {
    this.transitions.forEach(t => t.update(dt));
    this.transitions = this.transitions.filter(t => !t.isDone());
  }

  public clear(): void {
    this.transitions = [];
  }
}