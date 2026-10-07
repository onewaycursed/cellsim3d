import * as THREE from 'three';
import { ORGANELLE_COLORS } from '../config/palette';
import { deformGeometry } from '../utils/organic';

export class Golgi {
  public readonly group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(2.2, -1.6, 2.8);
    this.group.rotation.set(0.6, 0.4, -0.5);

    const cisternaMaterial = new THREE.MeshStandardMaterial({
      color: ORGANELLE_COLORS.golgi,
      emissive: 0xaa6611,
      emissiveIntensity: 0.35,
      roughness: 0.65,
      metalness: 0.1
    });

    for (let i = 0; i < 5; i++) {
      const s = 1 - i * 0.1;

      const geo = new THREE.TorusGeometry(0.95 * s, 0.14, 12, 48, Math.PI * 1.5);
      deformGeometry(geo, 0.04, 3.0, i * 2.1);

      const cisterna = new THREE.Mesh(geo, cisternaMaterial);
      cisterna.rotation.x = Math.PI / 2;
      cisterna.position.y = i * 0.2 - 0.4;
      cisterna.rotation.z = i * 0.12;
      cisterna.scale.y = 1 - i * 0.05;
      cisterna.userData.pickInfo = {
        elementId: 'golgi',
        highlightUnit: this.group
      };
      this.group.add(cisterna);
    }

    const vesicleGeo = new THREE.SphereGeometry(0.12, 12, 8);
    deformGeometry(vesicleGeo, 0.02, 4, 2.5);

    for (let i = 0; i < 8; i++) {
      const v = new THREE.Mesh(vesicleGeo, cisternaMaterial);
      const angle = Math.random() * Math.PI * 1.5;
      v.position.set(
        Math.cos(angle) * (1.2 + Math.random() * 0.4),
        -0.6 + Math.random() * 0.3,
        Math.sin(angle) * (1.2 + Math.random() * 0.4)
      );
      v.scale.setScalar(0.8 + Math.random() * 0.7);
      v.userData.pickInfo = {
        elementId: 'vesicle',
        highlightUnit: this.group
      };
      this.group.add(v);
    }
  }

  public update(_dt: number, elapsed: number): void {
    this.group.rotation.z = -0.5 + Math.sin(elapsed * 0.4) * 0.1;
    const s = 1 + Math.sin(elapsed * 0.7 + 1.2) * 0.02;
    this.group.scale.set(s, s, s);
  }
}