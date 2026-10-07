import type { Scenario } from '../types/scenario';
import { normal } from './normal';
import { glycolysis } from './glycolysis';
import { proteinSynthesis } from './proteinSynthesis';
import { mitosis } from './mitosis';
import { oxidativeStress } from './oxidativeStress';
import { mitoDysfunction } from './mitoDysfunction';
import { erStress } from './erStress';
import { apoptosis } from './apoptosis';
import { autophagy } from './autophagy';
import { viralInfection } from './viralInfection';

/**
 * Реестр сценариев. Новые сценарии добавляются сюда одной строкой.
 * Соответствует требованию F-11.
 */
export const SCENARIOS: Scenario[] = [
  normal,
  glycolysis,
  proteinSynthesis,
  mitosis,
  oxidativeStress,
  mitoDysfunction,
  erStress,
  apoptosis,
  autophagy,
  viralInfection
];