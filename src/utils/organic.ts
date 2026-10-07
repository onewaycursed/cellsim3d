import * as THREE from 'three';

/**
 * Многооктавный процедурный шум на основе суммы синусов.
 * Даёт органическую неровность без внешних зависимостей.
 */
export function organicNoise(x: number, y: number, z: number, seed = 0): number {
  return (
    Math.sin(x * 1.7 + seed) * Math.cos(y * 1.3 + seed * 0.7) * Math.sin(z * 1.5 + seed * 1.3) * 0.5 +
    Math.sin(x * 3.1 + seed * 1.7) * Math.cos(y * 2.9 + seed) * Math.sin(z * 3.3 + seed * 0.5) * 0.3 +
    Math.sin(x * 6.7 + seed * 2.3) * Math.cos(y * 7.1 + seed * 1.1) * Math.sin(z * 6.3 + seed * 1.9) * 0.2
  );
}

/**
 * Смещает вершины геометрии вдоль нормалей, создавая рельеф.
 * amplitude — сила деформации.
 * frequency — масштаб шума (больше = мельче детали).
 * seed — фаза шума.
 */
export function deformGeometry(
  geo: THREE.BufferGeometry,
  amplitude: number,
  frequency: number = 1,
  seed: number = 0
): void {
  geo.computeVertexNormals();
  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = organicNoise(x * frequency, y * frequency, z * frequency, seed);

    pos.setXYZ(
      i,
      x + norm.getX(i) * n * amplitude,
      y + norm.getY(i) * n * amplitude,
      z + norm.getZ(i) * n * amplitude
    );
  }

  geo.computeVertexNormals();
}

/** Двойная деформация: крупная форма + мелкий рельеф. */
export function deformDouble(
  geo: THREE.BufferGeometry,
  ampBig: number,
  freqBig: number,
  ampSmall: number,
  freqSmall: number,
  seed: number = 0
): void {
  deformGeometry(geo, ampBig, freqBig, seed);
  deformGeometry(geo, ampSmall, freqSmall, seed + 17.3);
}