/**
 * Единая цветовая палитра проекта.
 * Соответствует разделу 6.4 проектной документации.
 */

export const MOLECULE_COLORS = {
  ATP:     0xffe066, // жёлтый
  ROS:     0xff3355, // красный
  CALCIUM: 0x44ddff, // голубой
  PROTEIN: 0x66ff88, // зелёный
  VIRION:  0xcc66ff  // фиолетовый
} as const;

export const ORGANELLE_COLORS = {
  membrane:     0x4488ff,
  membraneWire: 0x66aaff,
  membraneGlow: 0x4488ff,
  nucleus:      0x8844cc,
  nucleolus:    0xff55bb,
  chromatin:    0xdd99ff,
  mitochondria: 0xff8844,
  cristae:      0xffcc99,
  er:           0x22aaff,
  ribosome:     0x66ff88,
  golgi:        0xffaa33,
  lysosome:     0xff44aa
} as const;

export const BACKGROUND_COLOR = 0x05050f;

/** Целевой радиус клетки в единицах сцены. */
export const CELL_RADIUS = 6.5;