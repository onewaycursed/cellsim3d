import type { Scenario } from '../types/scenario';

export const glycolysis: Scenario = {
  id: 'glycolysis',
  title: 'Гликолиз и синтез АТФ',
  category: 'physiology',
  description:
    'Митохондрии активно производят АТФ путём окислительного ' +
    'фосфорилирования. Молекулы АТФ (жёлтые) распространяются ' +
    'по цитоплазме к местам потребления энергии.',
  references: [
    { label: 'Alberts, Molecular Biology of the Cell, 7th ed., ch. 14' }
  ],
  organelleEffects: [
    { target: 'mitochondria', property: 'emissiveIntensity', to: 1.4 }
  ],
  particleEmitters: [
    { particleType: 'atp', count: 120, spawnRegion: 'mitochondria' }
  ],
  autoRotate: true
};