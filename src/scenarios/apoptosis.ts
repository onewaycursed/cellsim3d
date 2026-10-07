import type { Scenario } from '../types/scenario';

export const apoptosis: Scenario = {
  id: 'apoptosis',
  title: 'Апоптоз',
  category: 'pathology',
  description:
    'Программируемая клеточная смерть: сморщивание клетки, ' +
    'блеббинг мембраны, фрагментация ядра, высвобождение ' +
    'цитохрома c, активация каспаз.',
  references: [
    { label: 'Alberts, Molecular Biology of the Cell, 7th ed., ch. 18' }
  ],
  organelleEffects: [
    { target: 'membrane', property: 'emissive', to: 0xff4466 },
    { target: 'membrane', property: 'opacity', to: 0.25 },
    { target: 'nucleus', property: 'color', to: 0xff2288 },
    { target: 'nucleus', property: 'emissiveIntensity', to: 1.0 },
    { target: 'mitochondria', property: 'emissiveIntensity', to: 0.15 }
  ],
  particleEmitters: [
    { particleType: 'ros', count: 100, spawnRegion: 'mitochondria' },
    { particleType: 'calcium', count: 60, spawnRegion: 'space' }
  ],
  autoRotate: true
};