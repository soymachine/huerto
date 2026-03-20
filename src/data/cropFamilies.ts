import type { Season } from '../lib/storage';

// ─── Botanical family for each plant ─────────────────────────────────────────

export const CROP_FAMILY: Record<string, string> = {
  // Solanáceas
  tomato:      'solanaceae',
  chili:       'solanaceae',
  pepper:      'solanaceae',
  eggplant:    'solanaceae',
  potato:      'solanaceae',
  // Cucurbitáceas
  zucchini:    'cucurbit',
  cucumber:    'cucurbit',
  pumpkin:     'cucurbit',
  melon:       'cucurbit',
  watermelon:  'cucurbit',
  // Crucíferas / Brassicaceae
  cabbage:     'brassica',
  broccoli:    'brassica',
  cauliflower: 'brassica',
  radish:      'brassica',
  turnip:      'brassica',
  // Umbelíferas / Apiaceae
  carrot:      'apiaceae',
  celery:      'apiaceae',
  parsley:     'apiaceae',
  fennel:      'apiaceae',
  // Liliáceas / Allium
  onion:       'allium',
  garlic:      'allium',
  leek:        'allium',
  // Leguminosas
  bean:        'legume',
  pea:         'legume',
  fava:        'legume',
  // Compuestas / Asteraceae
  lettuce:     'asteraceae',
  artichoke:   'asteraceae',
  // Gramíneas
  corn:        'grass',
  // Quenopodiáceas / Amaranthaceae
  chard:       'chenopod',
  spinach:     'chenopod',
  beet:        'chenopod',
  // Rosáceas
  strawberry:  'rosaceae',
  // Boragináceas
  borage:      'boraginaceae',
  // Labiadas / Lamiaceae
  basil:       'lamiaceae',
};

// ─── Family display colours (used for the rotation overlay on the grid) ───────

export const FAMILY_COLOR: Record<string, string> = {
  solanaceae:   '#FFE5D5',
  cucurbit:     '#FFF5CE',
  brassica:     '#DFF0D8',
  apiaceae:     '#D5E8F5',
  allium:       '#EDE5FA',
  legume:       '#FAFAD0',
  asteraceae:   '#FFF8D8',
  grass:        '#E5F5E5',
  chenopod:     '#D5F5EC',
  rosaceae:     '#FAE0E8',
  boraginaceae: '#D8E8FF',
  lamiaceae:    '#F5E8FF',
};

export const FAMILY_ABBR: Record<string, string> = {
  solanaceae:   'SOL',
  cucurbit:     'CUC',
  brassica:     'BRA',
  apiaceae:     'API',
  allium:       'ALL',
  legume:       'LEG',
  asteraceae:   'AST',
  grass:        'GRA',
  chenopod:     'CHE',
  rosaceae:     'ROS',
  boraginaceae: 'BOR',
  lamiaceae:    'LAM',
};

export const FAMILY_LABEL: Record<string, string> = {
  solanaceae:   'Solanácea',
  cucurbit:     'Cucurbitácea',
  brassica:     'Crucífera',
  apiaceae:     'Umbelífera',
  allium:       'Liliácea',
  legume:       'Leguminosa',
  asteraceae:   'Compuesta',
  grass:        'Gramínea',
  chenopod:     'Quenopodiácea',
  rosaceae:     'Rosácea',
  boraginaceae: 'Boraginacea',
  lamiaceae:    'Labiada',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the season key (e.g. "2025-winter") that immediately precedes the given one.
 * Order: … → winter 2024 → summer 2025 → winter 2025 → summer 2026 → …
 */
export function getPreviousSeasonKey(year: number, season: Season): string {
  if (season === 'winter') return `${year}-summer`;
  return `${year - 1}-winter`;
}

/**
 * Returns true when planting the same botanical family as what was in the previous season.
 */
export function hasRotationIssue(currentId: string, prevId: string | null): boolean {
  if (!prevId) return false;
  const f1 = CROP_FAMILY[currentId];
  const f2 = CROP_FAMILY[prevId];
  return !!f1 && f1 === f2;
}
