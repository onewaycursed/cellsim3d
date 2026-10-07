import { EXCLUSION_ZONES } from '../config/exclusions';

/**
 * Проверяет, не пересекаются ли занятые зоны.
 * Выводит предупреждения в консоль.
 * Полезно при добавлении новых органелл.
 */
export function validateLayout(): void {
  const n = EXCLUSION_ZONES.length;
  let hasOverlap = false;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = EXCLUSION_ZONES[i];
      const b = EXCLUSION_ZONES[j];

      const dx = a.center[0] - b.center[0];
      const dy = a.center[1] - b.center[1];
      const dz = a.center[2] - b.center[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const minDist = a.radius + b.radius;

      if (dist < minDist) {
        hasOverlap = true;
        console.warn(
          `[Layout] Пересечение зон ${i} и ${j}: ` +
          `расстояние ${dist.toFixed(2)}, нужно ${minDist.toFixed(2)}`
        );
      }
    }
  }

  if (!hasOverlap) {
    console.log('[Layout] Все органеллы размещены без пересечений');
  }
}