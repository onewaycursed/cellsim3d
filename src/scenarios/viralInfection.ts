import type { Scenario } from '../types/scenario';

export const viralInfection: Scenario = {
  id: 'viralInfection',
  title: 'Вирусная инфекция',
  category: 'pathology',
  description:
    'Вирионы проникают через мембрану, высвобождают геном, ' +
    'перепрограммируют клетку на репликацию вирусных частиц.',
  references: [
    { label: 'Lodish, Molecular Cell Biology, 9th ed., ch. 6' }
  ],
  organelleEffects: [
    { target: 'membrane', property: 'emissive', to: 0x5522aa },
    { target: 'nucleus', property: 'emissiveIntensity', to: 1.2 }
  ],
  particleEmitters: [
    { particleType: 'virion', count: 50, spawnRegion: 'space' }
  ],
  autoRotate: true
};