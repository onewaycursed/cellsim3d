import type { Scenario } from '../types/scenario';

export const erStress: Scenario = {
  id: 'erStress',
  title: 'ER-стресс и мисфолдинг',
  category: 'pathology',
  description:
    'Накопление неправильно свёрнутых белков в ЭР активирует ' +
    'UPR (unfolded protein response). При необратимости — ' +
    'запуск апоптоза.',
  references: [
    { label: 'Alberts, Molecular Biology of the Cell, 7th ed., ch. 12' }
  ],
  organelleEffects: [
  { target: 'er', property: 'emissive', to: 0xff7733 },
  { target: 'er', property: 'emissiveIntensity', to: 0.9 }
],
  particleEmitters: [
    { particleType: 'protein', count: 60, spawnRegion: 'er' }
  ],
  autoRotate: true
};