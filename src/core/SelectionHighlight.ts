import * as THREE from 'three';

interface HighlightEntry {
  root: THREE.Object3D;
  baseScale: THREE.Vector3;
  currentScale: number;
  targetScale: number;
  pulse: number;
}

/**
 * Подсвечивает активный элемент (при наведении или клике):
 * плавно увеличивает масштаб и добавляет лёгкую пульсацию.
 */
export class SelectionHighlight {
  private entries = new Map<THREE.Object3D, HighlightEntry>();
  private activeRoot: THREE.Object3D | null = null;

  public register(root: THREE.Object3D): void {
    if (this.entries.has(root)) return;
    this.entries.set(root, {
      root,
      baseScale: root.scale.clone(),
      currentScale: 1,
      targetScale: 1,
      pulse: Math.random() * Math.PI * 2
    });
  }

  public setActive(root: THREE.Object3D | null): void {
    if (root === this.activeRoot) return;
    this.activeRoot = root;
    this.entries.forEach(e => {
      e.targetScale = e.root === root ? 1.18 : 1;
    });
  }

  public update(dt: number, elapsed: number): void {
    this.entries.forEach(e => {
      // Плавная интерполяция к целевому масштабу
      e.currentScale += (e.targetScale - e.currentScale) * Math.min(1, dt * 8);

      // Пульсация при активной подсветке
      const isActive = e.targetScale > 1.01;
      const pulse = isActive ? Math.sin(elapsed * 3 + e.pulse) * 0.02 : 0;

      const s = e.currentScale + pulse;
      e.root.scale.set(
        e.baseScale.x * s,
        e.baseScale.y * s,
        e.baseScale.z * s
      );
    });
  }
}