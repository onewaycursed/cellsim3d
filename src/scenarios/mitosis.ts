import type { Scenario } from '../types/scenario';

export const mitosis: Scenario = {
  id: 'mitosis',
  title: 'Митотическое деление',
  category: 'physiology',
  description:
    'Клетка готовится к делению: конденсация хроматина, ' +
    'формирование веретена деления, расхождение хромосом, ' +
    'цитокинез.',
  references: [
    { label: 'Alberts, Molecular Biology of the Cell, 7th ed., ch. 17' }
  ],
  organelleEffects: [
    { target: 'nucleus', property: 'emissiveIntensity', to: 0.9 },
    { target: 'nucleus', property: 'color', to: 0xaa55ee }
  ],
  particleEmitters: [],
  autoRotate: true
};