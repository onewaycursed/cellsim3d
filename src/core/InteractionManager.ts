import * as THREE from 'three';
import type { ElementId } from '../data/elementInfo';

export interface PickableRegistration {
  hitObject: THREE.Object3D;
  highlightRoot: THREE.Object3D;
  infoKey: ElementId;
}

export interface InteractionCallbacks {
  onHoverChange: (entry: PickableRegistration | null) => void;
  onSelect: (entry: PickableRegistration | null) => void;
}

/** Максимальное смещение пальца/мыши, при котором это ещё считается тапом. */
const TAP_THRESHOLD_PX = 8;
/** Максимальная длительность касания, чтобы считать это тапом. */
const TAP_MAX_DURATION_MS = 500;

export class InteractionManager {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private pickables: PickableRegistration[] = [];
  private domElement: HTMLElement;
  private camera: THREE.Camera;
  private callbacks: InteractionCallbacks;
  private hoveredKey: ElementId | null = null;

  // Для отслеживания тапа
  private downX = 0;
  private downY = 0;
  private downTime = 0;
  private isPointerDown = false;

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    callbacks: InteractionCallbacks
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    this.domElement.addEventListener('pointermove', this.handleMove);
    this.domElement.addEventListener('pointerdown', this.handleDown);
    this.domElement.addEventListener('pointerup', this.handleUp);
    this.domElement.addEventListener('pointerleave', this.handleLeave);
    this.domElement.addEventListener('pointercancel', this.handleLeave);
  }

  public register(entry: PickableRegistration): void {
    this.pickables.push(entry);
  }

  public getRegisteredCount(): number {
    return this.pickables.length;
  }

  public dispose(): void {
    this.domElement.removeEventListener('pointermove', this.handleMove);
    this.domElement.removeEventListener('pointerdown', this.handleDown);
    this.domElement.removeEventListener('pointerup', this.handleUp);
    this.domElement.removeEventListener('pointerleave', this.handleLeave);
    this.domElement.removeEventListener('pointercancel', this.handleLeave);
  }

  /** Делает raycast в указанной точке экрана. Возвращает найденный pickable. */
  private pick(clientX: number, clientY: number): PickableRegistration | null {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hitObjects = this.pickables.map(p => p.hitObject);
    const hits = this.raycaster.intersectObjects(hitObjects, false);

    // Приоритет: органеллы внутри клетки важнее мембраны.
    for (const h of hits) {
      const p = this.pickables.find(pk => pk.hitObject === h.object);
      if (p && p.infoKey !== 'membrane') return p;
    }

    // Если попали только в мембрану — возвращаем её.
    if (hits.length > 0) {
      return this.pickables.find(p => p.hitObject === hits[0].object) ?? null;
    }

    return null;
  }

  private handleMove = (e: PointerEvent): void => {
    // На тач-устройствах hover отключён — иначе подсветка дёргается
    // при скольжении пальца по экрану.
    if (e.pointerType !== 'mouse') return;

    const entry = this.pick(e.clientX, e.clientY);
    const newKey = entry?.infoKey ?? null;

    if (newKey !== this.hoveredKey) {
      this.hoveredKey = newKey;
      this.domElement.style.cursor = newKey ? 'pointer' : 'default';
      this.callbacks.onHoverChange(entry);
    }
  };

  private handleDown = (e: PointerEvent): void => {
    // Игнорируем правую кнопку мыши (это панорама камеры).
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    this.isPointerDown = true;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.downTime = performance.now();
  };

  private handleUp = (e: PointerEvent): void => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    // Отсекаем перетаскивание камеры и долгие нажатия.
    const dx = e.clientX - this.downX;
    const dy = e.clientY - this.downY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = performance.now() - this.downTime;

    if (dist > TAP_THRESHOLD_PX || duration > TAP_MAX_DURATION_MS) {
      return; // это было вращение камеры или долгое нажатие
    }

    // Делаем raycast в точке отпускания — не полагаемся на hover.
    const entry = this.pick(e.clientX, e.clientY);

    // На тач-устройствах подсветка «активируется» именно здесь.
    // На десктопе hover уже сработал, повторно не вредит.
    if (e.pointerType !== 'mouse') {
      this.callbacks.onHoverChange(entry);
    }

    this.callbacks.onSelect(entry);
  };

  private handleLeave = (): void => {
    this.isPointerDown = false;
    if (this.hoveredKey !== null) {
      this.hoveredKey = null;
      this.callbacks.onHoverChange(null);
    }
  };
}