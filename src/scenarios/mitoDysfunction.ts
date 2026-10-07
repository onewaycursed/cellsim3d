import type { Scenario } from '../types/scenario';

export const mitoDysfunction: Scenario = {
  id: 'mitoDysfunction',
  title: 'Митохондриальная дисфункция',
  category: 'pathology',
  description:
    'Снижение мембранного потенциала митохондрий, падение ' +
    'продукции АТФ, утечка цитохрома c. Клетка переходит на ' +
    'анаэробный метаболизм.',
  references: [
    { label: 'Lodish, Molecular Cell Biology, 9th ed., ch. 16' }
  ],
  organelleEffects: [
    { target: 'mitochondria', property: 'color', to: 0x664433 },
    { target: 'mitochondria', property: 'emissiveIntensity', to: 0.1 }
  ],
  particleEmitters: [
    { particleType: 'ros', count: 80, spawnRegion: 'mitochondria' }
  ],
  autoRotate: true
};