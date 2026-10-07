import type { Scenario } from '../types/scenario';

export const oxidativeStress: Scenario = {
  id: 'oxidativeStress',
  title: 'Оксидативный стресс',
  category: 'pathology',
  description:
    'Накопление активных форм кислорода (ROS, красные частицы) ' +
    'повреждает мембраны, белки и ДНК. Митохондрии теряют ' +
    'эффективность, развивается патологический каскад.',
  references: [
    { label: 'Alberts, Molecular Biology of the Cell, 7th ed., ch. 14' },
    { label: 'Lodish, Molecular Cell Biology, 9th ed., ch. 16' }
  ],
  organelleEffects: [
    // Митохондрии тускнеют
    { target: 'mitochondria', property: 'color', to: 0xaa5533 },
    { target: 'mitochondria', property: 'emissiveIntensity', to: 0.2 },
    // Мембрана приобретает красноватое свечение
    { target: 'membrane', property: 'emissive', to: 0x441122 }
  ],
  particleEmitters: [
    { particleType: 'ros', count: 180, spawnRegion: 'mitochondria' }
  ],
  autoRotate: true
};