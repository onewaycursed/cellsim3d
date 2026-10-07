import type { Scenario } from '../types/scenario';

export const autophagy: Scenario = {
  id: 'autophagy',
  title: 'Аутофагия',
  category: 'pathology',
  description:
    'Клетка переваривает повреждённые органеллы в аутофагосомах, ' +
    'сливающихся с лизосомами. Защитный механизм при стрессе ' +
    'и голодании.',
  references: [
    { label: 'Lodish, Molecular Cell Biology, 9th ed., ch. 17' }
  ],
  organelleEffects: [
    { target: 'lysosomes', property: 'emissiveIntensity', to: 1.6 },
    { target: 'lysosomes', property: 'color', to: 0xff66cc }
  ],
  particleEmitters: [],
  autoRotate: true
};