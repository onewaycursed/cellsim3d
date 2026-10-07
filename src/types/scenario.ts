/**
 * Типы данных для сценариев.
 * Соответствует разделу 8.1 проектной документации.
 */

export type OrganelleId =
  | 'membrane'
  | 'nucleus'
  | 'mitochondria'
  | 'er'
  | 'golgi'
  | 'lysosomes';

export type EffectProperty =
  | 'color'
  | 'emissive'
  | 'emissiveIntensity'
  | 'scale'
  | 'opacity';

export interface OrganelleEffect {
  target: OrganelleId;
  property: EffectProperty;
  to: number | string;
  startTime?: number;
  endTime?: number;
  easing?: 'linear' | 'easeInOut';
}

export type ParticleType = 'atp' | 'ros' | 'calcium' | 'protein' | 'virion';

export interface EmitterConfig {
  particleType: ParticleType;
  count: number;
  spawnRegion: OrganelleId | 'space';
  lifetime?: number;
}

export interface Reference {
  label: string;
  url?: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: 'physiology' | 'pathology';
  description: string;
  references: Reference[];
  organelleEffects: OrganelleEffect[];
  particleEmitters: EmitterConfig[];
  autoRotate?: boolean;
}