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

export class InteractionManager {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private pickables: PickableRegistration[] = [];
  private domElement: HTMLElement;
  private camera: THREE.Camera;
  private callbacks: InteractionCallbacks;
  private hoveredKey: ElementId | null = null;
  private currentHoverEntry: PickableRegistration | null = null;

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
    this.domElement.addEventListener('pointerleave', this.handleLeave);
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
    this.domElement.removeEventListener('pointerleave', this.handleLeave);
  }

  private handleMove = (e: PointerEvent): void => {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hitObjects = this.pickables.map(p => p.hitObject);
    const hits = this.raycaster.intersectObjects(hitObjects, false);

    // Приоритет: сначала ищем орган внутри клетки.
    // Мембрана срабатывает только если луч не задел ничего кроме неё.
    let entry: PickableRegistration | null = null;

    for (const h of hits) {
      const p = this.pickables.find(pk => pk.hitObject === h.object);
      if (p && p.infoKey !== 'membrane') {
        entry = p;
        break;
      }
    }

    if (!entry && hits.length > 0) {
      entry = this.pickables.find(p => p.hitObject === hits[0].object) ?? null;
    }

    const newKey = entry?.infoKey ?? null;

    if (newKey !== this.hoveredKey) {
      this.hoveredKey = newKey;
      this.currentHoverEntry = entry;
      this.domElement.style.cursor = newKey ? 'pointer' : 'default';
      this.callbacks.onHoverChange(entry);
    }
  };

  private handleDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    this.callbacks.onSelect(this.currentHoverEntry);
  };

  private handleLeave = (): void => {
    if (this.hoveredKey !== null) {
      this.hoveredKey = null;
      this.currentHoverEntry = null;
      this.callbacks.onHoverChange(null);
    }
  };
}