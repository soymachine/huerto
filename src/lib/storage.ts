export type Season     = 'summer' | 'winter';
export type GardenData = Record<string, Record<string, string>>; // seasonKey → cellKey → plantId
export type NotesData  = Record<string, Record<string, string>>; // seasonKey → cellKey → text

export interface LocalGarden {
  id:   string;
  name: string;
  cols: number;
  rows: number;
}

export interface UIState {
  year:   number;
  season: Season;
}

// ── Storage keys ──────────────────────────────────────────────────────────────

const GARDENS_KEY = 'el-huerto-gardens';
const ACTIVE_KEY  = 'el-huerto-active';
const UI_KEY      = 'el-huerto-ui';
const dataKey     = (id: string) => `el-huerto-data-${id}`;
const notesKey    = (id: string) => `el-huerto-notes-${id}`;

// ── ID generator ──────────────────────────────────────────────────────────────

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Gardens list ──────────────────────────────────────────────────────────────

export function loadGardens(): LocalGarden[] {
  try { return JSON.parse(localStorage.getItem(GARDENS_KEY) ?? '[]'); } catch { return []; }
}
export function saveGardens(list: LocalGarden[]): void {
  try { localStorage.setItem(GARDENS_KEY, JSON.stringify(list)); } catch {}
}

// ── Active garden ─────────────────────────────────────────────────────────────

export function loadActiveId(): string | null {
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
}
export function saveActiveId(id: string): void {
  try { localStorage.setItem(ACTIVE_KEY, id); } catch {}
}

// ── Garden data ───────────────────────────────────────────────────────────────

export function loadGardenData(id: string): GardenData {
  try { return JSON.parse(localStorage.getItem(dataKey(id)) ?? '{}'); } catch { return {}; }
}
export function saveGardenData(id: string, data: GardenData): void {
  try { localStorage.setItem(dataKey(id), JSON.stringify(data)); } catch {}
}
export function clearGardenData(id: string): void {
  try { localStorage.removeItem(dataKey(id)); } catch {}
}

// ── Garden notes ──────────────────────────────────────────────────────────────

export function loadGardenNotes(id: string): NotesData {
  try { return JSON.parse(localStorage.getItem(notesKey(id)) ?? '{}'); } catch { return {}; }
}
export function saveGardenNotes(id: string, notes: NotesData): void {
  try { localStorage.setItem(notesKey(id), JSON.stringify(notes)); } catch {}
}
export function clearGardenNotes(id: string): void {
  try { localStorage.removeItem(notesKey(id)); } catch {}
}

// ── UI state (global – year + season) ────────────────────────────────────────

export function loadUIState(): UIState {
  try {
    const raw = localStorage.getItem(UI_KEY);
    if (raw) return JSON.parse(raw) as UIState;
  } catch {}
  return { year: new Date().getFullYear(), season: 'summer' };
}
export function saveUIState(ui: UIState): void {
  try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch {}
}

// ── Legacy migration (single-garden → multi-garden) ──────────────────────────

export function migrateLegacy(): void {
  if (localStorage.getItem(GARDENS_KEY)) return; // already migrated

  const rawData  = localStorage.getItem('el-huerto-v1');
  const rawUI    = localStorage.getItem('el-huerto-ui');
  const rawNotes = localStorage.getItem('el-huerto-notes-v1');

  if (!rawData && !rawUI) return;

  const gardenData = rawData ? (JSON.parse(rawData) as GardenData) : {};
  const ui         = rawUI   ? (JSON.parse(rawUI)   as (UIState & { cols?: number; rows?: number })) : null;

  const id = genId();
  const garden: LocalGarden = {
    id,
    name: 'Mi Huerto',
    cols: ui?.cols ?? 6,
    rows: ui?.rows ?? 10,
  };

  saveGardens([garden]);
  saveActiveId(id);
  if (Object.keys(gardenData).length > 0) saveGardenData(id, gardenData);
  saveUIState({ year: ui?.year ?? new Date().getFullYear(), season: ui?.season ?? 'summer' });

  if (rawNotes) {
    try { saveGardenNotes(id, JSON.parse(rawNotes)); } catch {}
    localStorage.removeItem('el-huerto-notes-v1');
  }
  localStorage.removeItem('el-huerto-v1');
  localStorage.removeItem('el-huerto-ui');
}
