import * as THREE from 'three';
import { ORGANELLE_COLORS } from '../config/palette';
import { deformGeometry } from '../utils/organic';

export class Nucleus {
  public readonly group: THREE.Group;
  public readonly mesh: THREE.Mesh;
  public readonly nucleolus: THREE.Mesh;
  public readonly chromatin: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(-1.2, 0.6, 0.2);

    // Оболочка с рельефом
    const geo = new THREE.SphereGeometry(2.1, 64, 48);
    deformGeometry(geo, 0.05, 0.8, 3.1);
    deformGeometry(geo, 0.015, 3.5, 7.7);

    const material = new THREE.MeshPhysicalMaterial({
      color: ORGANELLE_COLORS.nucleus,
      emissive: 0x5522aa,
      emissiveIntensity: 0.3,
      roughness: 0.55,
      metalness: 0,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geo, material);
    this.mesh.userData.pickInfo = {
      elementId: 'nucleus',
      highlightUnit: this.group
    };
    this.group.add(this.mesh);

    // Ядерные поры
    const poreGeo = new THREE.SphereGeometry(0.045, 8, 6);
    const poreMat = new THREE.MeshStandardMaterial({
      color: 0x2a1555,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.9,
      metalness: 0
    });

    const pores = new THREE.Group();
    const poreCount = 24;
    for (let i = 0; i < poreCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / poreCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = 2.08 * Math.sin(phi) * Math.cos(theta);
      const y = 2.08 * Math.cos(phi);
      const z = 2.08 * Math.sin(phi) * Math.sin(theta);

      const pore = new THREE.Mesh(poreGeo, poreMat);
      pore.position.set(x, y, z);
      pore.lookAt(x * 2, y * 2, z * 2);
      pores.add(pore);
    }
    this.group.add(pores);

    // Сетка
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xcc88ff,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
      depthWrite: false
    });
    const nucWire = new THREE.Mesh(
      new THREE.SphereGeometry(2.11, 16, 12),
      wireMaterial
    );
    this.group.add(nucWire);

    // Ядрышко
    const nucleolusGeo = new THREE.SphereGeometry(0.7, 32, 24);
    deformGeometry(nucleolusGeo, 0.04, 2.2, 5.3);

    this.nucleolus = new THREE.Mesh(
      nucleolusGeo,
      new THREE.MeshStandardMaterial({
        color: ORGANELLE_COLORS.nucleolus,
        emissive: 0xcc2288,
        emissiveIntensity: 0.8,
        roughness: 0.6,
        metalness: 0.1
      })
    );
    this.nucleolus.position.set(-0.55, 0.65, 0.35);
    this.nucleolus.userData.pickInfo = {
      elementId: 'nucleolus',
      highlightUnit: this.group
    };
    this.group.add(this.nucleolus);

    // Хроматин
    this.chromatin = new THREE.Group();
    const chromatinMaterial = new THREE.MeshStandardMaterial({
      color: ORGANELLE_COLORS.chromatin,
      emissive: 0x8844cc,
      emissiveIntensity: 0.3,
      roughness: 0.7,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 8; i++) {
      const points: THREE.Vector3[] = [];
      const turns = 1.5 + Math.random() * 1.2;
      const radius = 0.6 + Math.random() * 0.9;
      const axis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      const baseOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6
      );

      const perp1 = new THREE.Vector3(1, 0, 0).cross(axis).normalize();
      const perp2 = axis.clone().cross(perp1).normalize();

      const segs = 40;
      for (let j = 0; j <= segs; j++) {
        const t = j / segs;
        const angle = t * Math.PI * 2 * turns;
        const r = radius * Math.sin(t * Math.PI);

        points.push(baseOffset.clone()
          .addScaledVector(perp1, Math.cos(angle) * r)
          .addScaledVector(perp2, Math.sin(angle) * r)
          .addScaledVector(axis, (t - 0.5) * 1.4)
        );
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 64, 0.035, 6, false),
        chromatinMaterial
      );
      tube.userData.pickInfo = {
        elementId: 'chromatin',
        highlightUnit: this.group
      };
      this.chromatin.add(tube);
    }
    this.group.add(this.chromatin);
  }

  public update(_dt: number, elapsed: number): void {
    this.group.rotation.y = Math.sin(elapsed * 0.2) * 0.15;
    this.nucleolus.rotation.x = elapsed * 0.3;
    this.nucleolus.rotation.y = elapsed * 0.2;
    this.chromatin.rotation.y = elapsed * 0.1;

    const s = 1 + Math.sin(elapsed * 0.5 + 0.7) * 0.008;
    this.mesh.scale.set(s, s, s);
  }
}