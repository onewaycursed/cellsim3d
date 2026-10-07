import * as THREE from 'three';
import { ORGANELLE_COLORS } from '../config/palette';
import { deformGeometry } from '../utils/organic';

interface Granule {
  mesh: THREE.Mesh;
  basePos: THREE.Vector3;
  phase: number;
}

interface LysosomeHandle {
  shell: THREE.Mesh;
  basePos: THREE.Vector3;
  phase: number;
  granules: Granule[];
}

export class Lysosomes {
  public readonly group: THREE.Group;
  private handles: LysosomeHandle[] = [];

  private positions: Array<[number, number, number]> = [
    [-2.5, -2.5, -2.0],
    [ 1.0,  2.2, -3.5],
    [-0.5, -2.8,  2.5]
  ];

  constructor() {
    this.group = new THREE.Group();

    const SHELL_RADIUS = 0.45;
    const shellGeo = new THREE.SphereGeometry(SHELL_RADIUS, 32, 24);
    deformGeometry(shellGeo, 0.04, 3.0, 1.7);
    deformGeometry(shellGeo, 0.015, 6.5, 4.3);

    const shellMat = new THREE.MeshStandardMaterial({
      color: ORGANELLE_COLORS.lysosome,
      emissive: 0xaa1166,
      emissiveIntensity: 0.5,
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });

    const granuleGeo = new THREE.SphereGeometry(0.055, 8, 6);
    const granuleMat = new THREE.MeshStandardMaterial({
      color: 0xff88cc,
      emissive: 0xaa1166,
      emissiveIntensity: 0.7,
      roughness: 0.4,
      transparent: true,
      opacity: 0.95
    });

    const MAX_GRANULE_RADIUS = 0.28;

    this.positions.forEach((pos, lysoIdx) => {
      const basePos = new THREE.Vector3(...pos);
      const shell = new THREE.Mesh(shellGeo, shellMat);
      shell.position.copy(basePos);
      shell.userData.pickInfo = {
        elementId: 'lysosome',
        highlightUnit: shell
      };
      this.group.add(shell);

      const granules: Granule[] = [];
      const count = 8 + Math.floor(Math.random() * 5);

      for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const r = Math.cbrt(Math.random()) * MAX_GRANULE_RADIUS;

        const offset = new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );

        const g = new THREE.Mesh(granuleGeo, granuleMat);
        const granuleBasePos = basePos.clone().add(offset);
        g.position.copy(granuleBasePos);
        g.userData.pickInfo = {
          elementId: 'granule',
          highlightUnit: shell
        };
        this.group.add(g);

        granules.push({
          mesh: g,
          basePos: granuleBasePos,
          phase: Math.random() * Math.PI * 2
        });
      }

      this.handles.push({
        shell,
        basePos,
        phase: lysoIdx * 1.7,
        granules
      });
    });
  }

  public update(_dt: number, elapsed: number): void {
    this.handles.forEach(h => {
      h.shell.position.x = h.basePos.x + Math.sin(elapsed * 0.6 + h.phase) * 0.03;
      h.shell.position.y = h.basePos.y + Math.cos(elapsed * 0.7 + h.phase) * 0.03;
      h.shell.position.z = h.basePos.z + Math.sin(elapsed * 0.5 + h.phase * 1.3) * 0.03;

      h.granules.forEach(g => {
        g.mesh.position.x = g.basePos.x + Math.sin(elapsed * 0.9 + g.phase) * 0.015;
        g.mesh.position.y = g.basePos.y + Math.cos(elapsed * 1.1 + g.phase) * 0.015;
        g.mesh.position.z = g.basePos.z + Math.sin(elapsed * 1.0 + g.phase * 1.4) * 0.015;
      });
    });
  }
}