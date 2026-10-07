import * as THREE from 'three';
import { ORGANELLE_COLORS } from '../config/palette';
import { deformGeometry } from '../utils/organic';

interface MitoPlacement {
  position: [number, number, number];
  rotation: [number, number, number];
}

export class Mitochondria {
  public readonly group: THREE.Group;
  public readonly meshes: THREE.Mesh[] = [];
  public readonly materials: THREE.MeshStandardMaterial[] = [];

  private basePositions: THREE.Vector3[] | null = null;
  private baseRotations: THREE.Euler[] | null = null;

  private placements: MitoPlacement[] = [
    { position: [ 3.2,  1.8,  1.2], rotation: [0.4, 0.7, 0.2] },
    { position: [ 2.6, -2.5, -1.5], rotation: [1.2, 0.3, 0.5] },
    { position: [-3.8, -1.5,  2.2], rotation: [0.7, 1.4, 0.9] },
    { position: [-0.5,  3.5, -2.5], rotation: [1.8, 0.5, 0.3] },
    { position: [-3.2,  2.8, -1.8], rotation: [0.2, 2.1, 1.1] }
  ];

  constructor() {
    this.group = new THREE.Group();
    for (const p of this.placements) {
      this.group.add(this.createMito(p));
    }
  }

  private createMito(placement: MitoPlacement): THREE.Group {
    const g = new THREE.Group();

    const bodyGeo = new THREE.SphereGeometry(1, 48, 32);
    bodyGeo.scale(0.68, 1.4, 0.68);
    deformGeometry(bodyGeo, 0.05, 1.4, 3.3);
    deformGeometry(bodyGeo, 0.02, 4.5, 8.1);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: ORGANELLE_COLORS.mitochondria,
      emissive: 0xaa3300,
      emissiveIntensity: 0.35,
      roughness: 0.65,
      metalness: 0.05,
      transparent: true,
      opacity: 0.65
    });
    this.materials.push(bodyMaterial);

    const body = new THREE.Mesh(bodyGeo, bodyMaterial);
    body.userData.pickInfo = {
      elementId: 'mitochondrion',
      highlightUnit: g
    };
    g.add(body);
    this.meshes.push(body);

    const cristaeMaterial = new THREE.MeshStandardMaterial({
      color: ORGANELLE_COLORS.cristae,
      emissive: 0xff8844,
      emissiveIntensity: 0.45,
      roughness: 0.5,
      metalness: 0.05
    });

    const cristaeCount = 5;
    for (let i = 0; i < cristaeCount; i++) {
      const y = (i - (cristaeCount - 1) / 2) * 0.38;
      const baseR = 0.45 - Math.abs(i - 2) * 0.04;

      const points: THREE.Vector3[] = [];
      const segs = 60;
      const turns = 2;

      for (let j = 0; j <= segs; j++) {
        const t = j / segs;
        const angle = t * Math.PI * 2 * turns;
        const wobble = Math.sin(t * Math.PI * 3 + i) * 0.04;
        const r = baseR + wobble;

        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          y + Math.sin(angle * 2) * 0.04,
          Math.sin(angle) * r
        ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const crista = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 64, 0.03, 6, false),
        cristaeMaterial
      );
      crista.userData.pickInfo = {
        elementId: 'cristae',
        highlightUnit: g
      };
      g.add(crista);
    }

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 20, 14),
      new THREE.MeshBasicMaterial({
        color: 0xff6622,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    glow.scale.set(0.68, 1.4, 0.68);
    g.add(glow);

    g.position.set(...placement.position);
    g.rotation.set(...placement.rotation);
    return g;
  }

  public update(_dt: number, elapsed: number): void {
    if (!this.basePositions || !this.baseRotations) {
      this.basePositions = this.group.children.map(c => c.position.clone());
      this.baseRotations = this.group.children.map(c => c.rotation.clone());
    }

    const positions = this.basePositions;
    const rotations = this.baseRotations;

    this.group.children.forEach((child, i) => {
      const bp = positions[i];
      const br = rotations[i];

      child.position.x = bp.x + Math.sin(elapsed * 0.3 + i * 2.1) * 0.04;
      child.position.y = bp.y + Math.sin(elapsed * 0.5 + i * 1.3) * 0.04;
      child.position.z = bp.z + Math.cos(elapsed * 0.4 + i * 1.7) * 0.04;

      child.rotation.x = br.x + Math.sin(elapsed * 0.4 + i * 0.7) * 0.02;
      child.rotation.z = br.z + Math.cos(elapsed * 0.35 + i * 1.1) * 0.02;
    });
  }
}