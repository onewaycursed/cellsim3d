import * as THREE from 'three';

export interface ParticleFXOptions {
  count: number;
  color: number;
  size: number;
  blending?: THREE.Blending;
}

/** Генерирует круглый мягкий спрайт процедурно. */
function createCircleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

let sharedTexture: THREE.Texture | null = null;

export class ParticleFX {
  public readonly points: THREE.Points;
  public readonly count: number;
  public readonly data: any[] = [];

  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private sizes: Float32Array;
  private updateFn: ((dt: number, elapsed: number) => void) | null = null;

  constructor({ count, color, size, blending }: ParticleFXOptions) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);

    if (!sharedTexture) sharedTexture = createCircleTexture();

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(this.sizes, 1)
    );

    this.material = new THREE.PointsMaterial({
      color,
      size,
      map: sharedTexture,
      transparent: true,
      opacity: 0.75,
      blending: blending ?? THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      alphaTest: 0.01
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  public setUpdate(fn: (dt: number, elapsed: number) => void): void {
    this.updateFn = fn;
  }

  public update(dt: number, elapsed: number): void {
    if (this.updateFn) this.updateFn(dt, elapsed);
    this.geometry.attributes.position.needsUpdate = true;
  }

  public setPosition(i: number, x: number, y: number, z: number): void {
    this.positions[i * 3] = x;
    this.positions[i * 3 + 1] = y;
    this.positions[i * 3 + 2] = z;
  }

  public setSize(i: number, s: number): void {
    this.sizes[i] = s;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}