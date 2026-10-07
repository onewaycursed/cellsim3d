import * as THREE from 'three';
import { ORGANELLE_COLORS, CELL_RADIUS } from '../config/palette';

/**
 * Плазматическая мембрана эукариотической клетки.
 * Тонкая полупрозрачная оболочка с лёгкой процедурной деформацией
 * и мягким свечением по контуру.
 * Соответствует требованию F-07.
 */
export class Membrane {
  public readonly group: THREE.Group;
  public readonly mesh: THREE.Mesh;
  public readonly wireframe: THREE.Mesh;
  public readonly glowSphere: THREE.Mesh;

  constructor(radius: number = CELL_RADIUS) {
    this.group = new THREE.Group();

    const geometry = this.buildGeometry(radius);

    // Основная поверхность — полупрозрачная, слабо светящаяся.
    const material = new THREE.MeshPhysicalMaterial({
      color: ORGANELLE_COLORS.membrane,
      transparent: true,
      opacity: 0.12,
      roughness: 0.5,
      metalness: 0,
      side: THREE.DoubleSide,
      emissive: 0x2244aa,
      emissiveIntensity: 0.6,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, material);

    // Пометка для системы интерактивности.
    this.mesh.userData.pickInfo = {
      elementId: 'membrane',
      highlightUnit: this.group
    };

    this.group.add(this.mesh);

    // Отдельная, более редкая сетка для wireframe — чтобы линии не сливались.
    const wireGeometry = new THREE.SphereGeometry(radius * 1.001, 24, 16);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: ORGANELLE_COLORS.membraneWire,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
      depthWrite: false
    });
    this.wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
    this.group.add(this.wireframe);

    // Мягкое гало вокруг клетки — эффект свечения по контуру.
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: ORGANELLE_COLORS.membraneGlow,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.08, 48, 32),
      glowMaterial
    );
    this.group.add(this.glowSphere);
  }

  /**
   * Процедурная деформация сферы: сумма нескольких синусов,
   * чтобы мембрана не выглядела как идеальный шар.
   */
  private buildGeometry(radius: number): THREE.SphereGeometry {
    const geo = new THREE.SphereGeometry(radius, 96, 64);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        Math.sin(v.x * 1.3 + 1.2) * Math.cos(v.y * 1.7) *
          Math.sin(v.z * 1.1 + 0.5) * 0.22 +
        Math.sin(v.x * 3.1) * Math.cos(v.z * 2.7) * 0.08;
      const len = v.length();
      v.multiplyScalar((len + n) / len);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  /** Мягкое «дыхание» мембраны в покое (требование F-10). */
  public update(_dt: number, elapsed: number): void {
    const scale = 1 + Math.sin(elapsed * 0.6) * 0.005;
    this.mesh.scale.setScalar(scale);
    this.wireframe.scale.setScalar(scale);
    this.glowSphere.scale.setScalar(scale);
  }
}