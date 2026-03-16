export type Season = 'summer' | 'winter';
export type GardenData = Record<string, Record<string, string>>;

export interface UIState {
  year: number;
  season: Season;
  cols: number;
  rows: number;
}

const GARDEN_KEY = 'el-huerto-v1';
const UI_KEY     = 'el-huerto-ui';

export function loadData(): { gardenData: GardenData; ui: UIState | null } {
  try {
    const rawGarden = localStorage.getItem(GARDEN_KEY);
    const rawUI     = localStorage.getItem(UI_KEY);
    return {
      gardenData: rawGarden ? (JSON.parse(rawGarden) as GardenData) : {},
      ui:         rawUI     ? (JSON.parse(rawUI)     as UIState)     : null,
    };
  } catch {
    return { gardenData: {}, ui: null };
  }
}

export function saveData(gardenData: GardenData, ui: UIState): void {
  try {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(gardenData));
    localStorage.setItem(UI_KEY,     JSON.stringify(ui));
  } catch {
    // ignore storage errors
  }
}
