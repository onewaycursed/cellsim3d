import type { Scenario } from '../types/scenario';

export const normal: Scenario = {
  id: 'normal',
  title: 'Нормальное состояние',
  category: 'physiology',
  description:
    'Клетка в гомеостазе. Органеллы функционируют нормально, ' +
    'метаболизм сбалансирован, редокс-баланс поддерживается.',
  references: [
    { label: 'Alberts, Molecular Biology of the Cell, 7th ed., ch. 1' }
  ],
  organelleEffects: [],
  particleEmitters: [],
  autoRotate: true
};