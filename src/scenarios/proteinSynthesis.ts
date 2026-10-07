import type { Scenario } from '../types/scenario';

export const proteinSynthesis: Scenario = {
  id: 'proteinSynthesis',
  title: 'Синтез белка',
  category: 'physiology',
  description:
    'Транскрипция в ядре, мРНК выходит в цитоплазму, трансляция ' +
    'на рибосомах шероховатого ЭР, фолдинг и транспорт через ' +
    'аппарат Гольджи.',
  references: [
    { label: 'Alberts, Molecular Biology of the Cell, 7th ed., ch. 6' }
  ],
  organelleEffects: [
    { target: 'nucleus', property: 'emissiveIntensity', to: 0.8 }
  ],
  particleEmitters: [
    { particleType: 'protein', count: 80, spawnRegion: 'nucleus' }
  ],
  autoRotate: true
};