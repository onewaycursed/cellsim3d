import { CELL_RADIUS } from './palette';

/**
 * Карта занятых зон в клетке.
 * ER и другие органеллы используют её, чтобы не пересекаться.
 */
export interface ExclusionZone {
  center: [number, number, number];
  radius: number;
}

export const EXCLUSION_ZONES: ExclusionZone[] = [
  // Ядро
  { center: [-1.2, 0.6, 0.2], radius: 2.6 },

  // Митохондрии
  { center: [ 3.2,  1.8,  1.2], radius: 1.6 },
  { center: [ 2.6, -2.5, -1.5], radius: 1.6 },
  { center: [-3.8, -1.5,  2.2], radius: 1.6 },
  { center: [-0.5,  3.5, -2.5], radius: 1.6 },
  { center: [-3.2,  2.8, -1.8], radius: 1.6 },

  // Аппарат Гольджи
  { center: [ 2.2, -1.6,  2.8], radius: 1.6 },

  // Лизосомы
  { center: [-2.5, -2.5, -2.0], radius: 0.7 },
  { center: [ 1.0,  2.2, -3.5], radius: 0.7 },
  { center: [-0.5, -2.8,  2.5], radius: 0.7 }
];

/**
 * Ограничивает точку внутри мембраны.
 * Если точка дальше, чем CELL_RADIUS - margin от центра сцены,
 * она сдвигается по направлению к центру.
 */
function clampInsideCell(
  point: { x: number; y: number; z: number },
  margin: number
): { x: number; y: number; z: number } {
  const maxR = CELL_RADIUS - margin;
  const dist = Math.sqrt(
    point.x * point.x + point.y * point.y + point.z * point.z
  );

  if (dist > maxR) {
    const scale = maxR / dist;
    return {
      x: point.x * scale,
      y: point.y * scale,
      z: point.z * scale
    };
  }

  return point;
}

/**
 * Если точка внутри какой-либо запретной зоны — сдвигает её наружу.
 * Если точка снаружи клетки — возвращает внутрь.
 * Порядок: сначала выталкиваем из зон, потом вдавливаем внутрь клетки.
 */
export function pushOutOfExclusions(
  point: { x: number; y: number; z: number },
  margin: number = 0.3,
  cellMargin: number = 0.6
): { x: number; y: number; z: number } {
  let p = { ...point };

  // Выталкиваем из занятых зон
  for (const zone of EXCLUSION_ZONES) {
    const dx = p.x - zone.center[0];
    const dy = p.y - zone.center[1];
    const dz = p.z - zone.center[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const minDist = zone.radius + margin;

    if (dist < minDist) {
      const scale = minDist / Math.max(dist, 0.01);
      p.x = zone.center[0] + dx * scale;
      p.y = zone.center[1] + dy * scale;
      p.z = zone.center[2] + dz * scale;
    }
  }

  // Вдавливаем внутрь мембраны
  p = clampInsideCell(p, cellMargin);

  return p;
}