import * as THREE from 'three';
import { ORGANELLE_COLORS } from '../config/palette';
import { deformGeometry } from '../utils/organic';
import { pushOutOfExclusions } from '../config/exclusions';

const NUCLEUS_CENTER = new THREE.Vector3(-1.2, 0.6, 0.2);
const NUCLEUS_EXCLUSION = 2.6;

export class EndoplasmicReticulum {
  public readonly group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();

    const erMaterial = new THREE.MeshStandardMaterial({
      color: ORGANELLE_COLORS.er,
      emissive: 0x114477,
      emissiveIntensity: 0.4,
      roughness: 0.6,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9
    });

    const ribbonEndpoints: THREE.Vector3[] = [];

    for (let i = 0; i < 6; i++) {
      const basePhi = Math.random() * Math.PI * 0.7 + Math.PI * 0.15;
      const baseTheta = (i / 6) * Math.PI * 2 + Math.random() * 0.4;

      const rawPoints: THREE.Vector3[] = [];
      const segments = 10;

      for (let j = 0; j < segments; j++) {
        const t = j / (segments - 1);
        const r = NUCLEUS_EXCLUSION + 0.2 + t * 2.0;

        const dPhi = Math.sin(t * Math.PI * 2 + i) * 0.18;
        const dTheta = Math.cos(t * Math.PI * 1.5 + i) * 0.22;

        const phi = basePhi + dPhi;
        const theta = baseTheta + dTheta;

        const raw = {
          x: NUCLEUS_CENTER.x + r * Math.sin(phi) * Math.cos(theta),
          y: NUCLEUS_CENTER.y + r * Math.cos(phi),
          z: NUCLEUS_CENTER.z + r * Math.sin(phi) * Math.sin(theta)
        };

        const safe = pushOutOfExclusions(raw, 0.4, 0.8);

        rawPoints.push(new THREE.Vector3(safe.x, safe.y, safe.z));
      }

      const curve = new THREE.CatmullRomCurve3(rawPoints);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 96, 0.085, 8, false),
        erMaterial
      );
      tube.userData.pickInfo = {
        elementId: 'er',
        highlightUnit: this.group
      };
      this.group.add(tube);

      for (let t = 0; t <= 1; t += 0.06) {
        ribbonEndpoints.push(curve.getPoint(t));
      }
    }

    // Рибосомы
    const ribosomeGeo = new THREE.SphereGeometry(0.07, 8, 6);
    deformGeometry(ribosomeGeo, 0.008, 8, 3);

    const ribosomeMaterial = new THREE.MeshStandardMaterial({
      color: ORGANELLE_COLORS.ribosome,
      emissive: 0x229944,
      emissiveIntensity: 0.7,
      roughness: 0.4,
      metalness: 0.1
    });

    const ribosomeCount = 70;
    const ribosomes = new THREE.InstancedMesh(
      ribosomeGeo,
      ribosomeMaterial,
      ribosomeCount
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < ribosomeCount; i++) {
      const p = ribbonEndpoints[Math.floor(Math.random() * ribbonEndpoints.length)];
      dummy.position.copy(p);
      dummy.position.x += (Math.random() - 0.5) * 0.18;
      dummy.position.y += (Math.random() - 0.5) * 0.18;
      dummy.position.z += (Math.random() - 0.5) * 0.18;
      dummy.scale.setScalar(0.8 + Math.random() * 0.5);
      dummy.updateMatrix();
      ribosomes.setMatrixAt(i, dummy.matrix);
    }
    ribosomes.userData.pickInfo = {
      elementId: 'ribosome',
      highlightUnit: this.group
    };
    this.group.add(ribosomes);
  }

  public update(_dt: number, elapsed: number): void {
    const s = 1 + Math.sin(elapsed * 0.8) * 0.008;
    this.group.scale.set(s, s, s);
    this.group.rotation.y = Math.sin(elapsed * 0.15) * 0.05;
  }
}