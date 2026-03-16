export type Season    = 'summer' | 'winter';
export type GardenData = Record<string, Record<string, string>>;
export type NotesData  = Record<string, Record<string, string>>;  // seasonKey → cellKey → text

export interface UIState {
  year: number;
  season: Season;
  cols: number;
  rows: number;
}

const GARDEN_KEY = 'el-huerto-v1';
const UI_KEY     = 'el-huerto-ui';
const NOTES_KEY  = 'el-huerto-notes-v1';

// ─── Garden data ──────────────────────────────────────────────────────────────

export function loadData(): { gardenData: GardenData; ui: UIState | null } {
  try {
    const rawGarden = localStorage.getItem(GARDEN_KEY);
    const rawUI     = localStorage.getItem(UI_KEY);
    return {
      gardenData: rawGarden ? (JSON.parse(rawGarden) as GardenData) : {},
      ui:         rawUI     ? (JSON.parse(rawUI)     as UIState)    : null,
    };
  } catch {
    return { gardenData: {}, ui: null };
  }
}

export function saveData(gardenData: GardenData, ui: UIState): void {
  try {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(gardenData));
    localStorage.setItem(UI_KEY,     JSON.stringify(ui));
  } catch { /* ignore */ }
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function loadNotes(): NotesData {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? (JSON.parse(raw) as NotesData) : {};
  } catch {
    return {};
  }
}

export function saveNotes(notes: NotesData): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch { /* ignore */ }
}

export function clearLocalNotes(): void {
  try { localStorage.removeItem(NOTES_KEY); } catch { /* ignore */ }
}
