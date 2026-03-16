import type { Season } from '../lib/storage';

// ─── Botanical family for each plant ─────────────────────────────────────────

export const CROP_FAMILY: Record<string, string> = {
  tomato:     'solanaceae',
  chili:      'solanaceae',
  pepper:     'solanaceae',
  eggplant:   'solanaceae',
  potato:     'solanaceae',
  zucchini:   'cucurbit',
  cucumber:   'cucurbit',
  pumpkin:    'cucurbit',
  cabbage:    'brassica',
  broccoli:   'brassica',
  radish:     'brassica',
  carrot:     'apiaceae',
  celery:     'apiaceae',
  parsley:    'apiaceae',
  fennel:     'apiaceae',
  onion:      'allium',
  garlic:     'allium',
  bean:       'legume',
  pea:        'legume',
  lettuce:    'asteraceae',
  corn:       'grass',
  chard:      'chenopod',
  spinach:    'chenopod',
  strawberry: 'rosaceae',
};

export const FAMILY_LABEL: Record<string, string> = {
  solanaceae:  'Solanácea',
  cucurbit:    'Cucurbitácea',
  brassica:    'Crucífera',
  apiaceae:    'Umbelífera',
  allium:      'Liliácea',
  legume:      'Leguminosa',
  asteraceae:  'Compuesta',
  grass:       'Gramínea',
  chenopod:    'Quenopodiácea',
  rosaceae:    'Rosácea',
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
