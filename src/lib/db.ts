import { supabase } from './supabase';
import type { GardenData, NotesData, DatesData } from './storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Garden {
  id: string;
  user_id: string;
  name: string;
  cols: number;
  rows: number;
  created_at: string;
}

export interface Planting {
  id: string;
  garden_id: string;
  year: number;
  season: string;
  row_idx: number;
  col_idx: number;
  plant_id: string;
  planted_at?: string | null; // ISO date 'YYYY-MM-DD'
}

export interface DbNote {
  id: string;
  garden_id: string;
  year: number;
  season: string;
  row_idx: number;
  col_idx: number;
  content: string;
}

// ─── Garden CRUD ──────────────────────────────────────────────────────────────

export async function loadAllGardens(userId: string): Promise<Garden[]> {
  const { data } = await supabase
    .from('gardens')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return (data ?? []) as Garden[];
}

export async function createGarden(
  userId: string,
  name: string,
  cols = 6,
  rows = 10,
): Promise<Garden> {
  const { data, error } = await supabase
    .from('gardens')
    .insert({ user_id: userId, name, cols, rows })
    .select()
    .single();
  if (error) throw error;
  return data as Garden;
}

/** Loads all user gardens; creates a default one if none exist yet. */
export async function loadOrInitGardens(
  userId: string,
  defaultCols = 6,
  defaultRows = 10,
): Promise<Garden[]> {
  const existing = await loadAllGardens(userId);
  if (existing.length > 0) return existing;
  const garden = await createGarden(userId, 'Mi Huerto', defaultCols, defaultRows);
  return [garden];
}

export async function renameGarden(gardenId: string, name: string): Promise<void> {
  await supabase.from('gardens').update({ name }).eq('id', gardenId);
}

export async function deleteGarden(gardenId: string): Promise<void> {
  await supabase.from('gardens').delete().eq('id', gardenId);
}

export async function updateGardenSize(
  gardenId: string,
  cols: number,
  rows: number,
): Promise<void> {
  await supabase.from('gardens').update({ cols, rows }).eq('id', gardenId);
}

// ─── Plantings ────────────────────────────────────────────────────────────────

export async function loadPlantings(gardenId: string): Promise<Planting[]> {
  const { data } = await supabase
    .from('plantings')
    .select('*')
    .eq('garden_id', gardenId);
  return (data ?? []) as Planting[];
}

export async function upsertPlanting(
  gardenId: string,
  year: number,
  season: string,
  rowIdx: number,
  colIdx: number,
  plantId: string,
  plantedAt?: string, // 'YYYY-MM-DD' or '' to clear
): Promise<void> {
  await supabase.from('plantings').upsert(
    {
      garden_id: gardenId, year, season, row_idx: rowIdx, col_idx: colIdx, plant_id: plantId,
      ...(plantedAt !== undefined ? { planted_at: plantedAt || null } : {}),
    },
    { onConflict: 'garden_id,year,season,row_idx,col_idx' },
  );
}

export async function removePlanting(
  gardenId: string,
  year: number,
  season: string,
  rowIdx: number,
  colIdx: number,
): Promise<void> {
  await supabase
    .from('plantings')
    .delete()
    .match({ garden_id: gardenId, year, season, row_idx: rowIdx, col_idx: colIdx });
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function fetchNotes(gardenId: string): Promise<DbNote[]> {
  const { data } = await supabase
    .from('notes')
    .select('*')
    .eq('garden_id', gardenId);
  return (data ?? []) as DbNote[];
}

export async function upsertNote(
  gardenId: string,
  year: number,
  season: string,
  rowIdx: number,
  colIdx: number,
  content: string,
): Promise<void> {
  if (!content.trim()) {
    // Empty note → delete it
    await supabase
      .from('notes')
      .delete()
      .match({ garden_id: gardenId, year, season, row_idx: rowIdx, col_idx: colIdx });
    return;
  }
  await supabase.from('notes').upsert(
    {
      garden_id: gardenId,
      year,
      season,
      row_idx: rowIdx,
      col_idx: colIdx,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'garden_id,year,season,row_idx,col_idx' },
  );
}

// ─── Migrations ───────────────────────────────────────────────────────────────

export async function migrateLocalData(
  gardenId: string,
  localData: GardenData,
): Promise<void> {
  const inserts: object[] = [];

  for (const [sk, cells] of Object.entries(localData)) {
    const [yearStr, season] = sk.split('-');
    const year = parseInt(yearStr);
    for (const [ck, plantId] of Object.entries(cells)) {
      const [rowStr, colStr] = ck.split(',');
      inserts.push({
        garden_id: gardenId,
        year,
        season,
        row_idx: parseInt(rowStr),
        col_idx: parseInt(colStr),
        plant_id: plantId,
      });
    }
  }

  if (inserts.length > 0) {
    await supabase
      .from('plantings')
      .upsert(inserts, { onConflict: 'garden_id,year,season,row_idx,col_idx' });
  }
}

export async function migrateLocalNotes(
  gardenId: string,
  localNotes: NotesData,
): Promise<void> {
  const inserts: object[] = [];

  for (const [sk, cells] of Object.entries(localNotes)) {
    const [yearStr, season] = sk.split('-');
    const year = parseInt(yearStr);
    for (const [ck, content] of Object.entries(cells)) {
      if (!content.trim()) continue;
      const [rowStr, colStr] = ck.split(',');
      inserts.push({
        garden_id: gardenId,
        year,
        season,
        row_idx: parseInt(rowStr),
        col_idx: parseInt(colStr),
        content,
      });
    }
  }

  if (inserts.length > 0) {
    await supabase
      .from('notes')
      .upsert(inserts, { onConflict: 'garden_id,year,season,row_idx,col_idx' });
  }
}

// ─── Bulk copy plantings (for copy-season feature) ────────────────────────────

export async function bulkUpsertPlantings(
  gardenId: string,
  year: number,
  season: string,
  cells: Record<string, string>, // cellKey "r,c" → plantId
): Promise<void> {
  const inserts = Object.entries(cells).map(([ck, plantId]) => {
    const [r, c] = ck.split(',').map(Number);
    return { garden_id: gardenId, year, season, row_idx: r, col_idx: c, plant_id: plantId };
  });
  if (inserts.length === 0) return;
  await supabase.from('plantings').upsert(inserts, { onConflict: 'garden_id,year,season,row_idx,col_idx' });
}

// ─── Grid delete row/col data ─────────────────────────────────────────────────

export async function deleteGardenRowData(gardenId: string, rowIdx: number): Promise<void> {
  await supabase.from('plantings').delete().eq('garden_id', gardenId).eq('row_idx', rowIdx);
  await supabase.from('notes').delete().eq('garden_id', gardenId).eq('row_idx', rowIdx);
}

export async function deleteGardenColData(gardenId: string, colIdx: number): Promise<void> {
  await supabase.from('plantings').delete().eq('garden_id', gardenId).eq('col_idx', colIdx);
  await supabase.from('notes').delete().eq('garden_id', gardenId).eq('col_idx', colIdx);
}

// ─── Grid shift (insert row/col at top/left) ──────────────────────────────────

export async function shiftGardenRows(gardenId: string, delta: number, fromIdx = 0): Promise<void> {
  await supabase.rpc('shift_garden_rows', { p_garden_id: gardenId, p_delta: delta, p_from_idx: fromIdx });
}

export async function shiftGardenCols(gardenId: string, delta: number, fromIdx = 0): Promise<void> {
  await supabase.rpc('shift_garden_cols', { p_garden_id: gardenId, p_delta: delta, p_from_idx: fromIdx });
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export async function getReminder(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('reminders')
    .select('enabled')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as { enabled: boolean } | null)?.enabled ?? false;
}

export async function saveReminder(userId: string, email: string, enabled: boolean): Promise<void> {
  await supabase.from('reminders').upsert(
    { user_id: userId, email, enabled },
    { onConflict: 'user_id' },
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function plantingsToGardenData(plantings: Planting[]): GardenData {
  const result: GardenData = {};
  for (const p of plantings) {
    const sk = `${p.year}-${p.season}`;
    if (!result[sk]) result[sk] = {};
    result[sk][`${p.row_idx},${p.col_idx}`] = p.plant_id;
  }
  return result;
}

export function plantingsToDatesData(plantings: Planting[]): DatesData {
  const result: DatesData = {};
  for (const p of plantings) {
    if (!p.planted_at) continue;
    const sk = `${p.year}-${p.season}`;
    if (!result[sk]) result[sk] = {};
    result[sk][`${p.row_idx},${p.col_idx}`] = p.planted_at;
  }
  return result;
}

export function dbNotesToNotesData(notes: DbNote[]): NotesData {
  const result: NotesData = {};
  for (const n of notes) {
    const sk = `${n.year}-${n.season}`;
    if (!result[sk]) result[sk] = {};
    result[sk][`${n.row_idx},${n.col_idx}`] = n.content;
  }
  return result;
}
