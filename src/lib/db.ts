import { supabase } from './supabase';
import type { GardenData } from './storage';

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
}

// ─── Garden ───────────────────────────────────────────────────────────────────

export async function getOrCreateGarden(
  userId: string,
  defaultCols = 6,
  defaultRows = 10,
): Promise<Garden> {
  const { data: existing } = await supabase
    .from('gardens')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (existing) return existing as Garden;

  const { data: created, error } = await supabase
    .from('gardens')
    .insert({ user_id: userId, cols: defaultCols, rows: defaultRows })
    .select()
    .single();

  if (error) throw error;
  return created as Garden;
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
): Promise<void> {
  await supabase.from('plantings').upsert(
    {
      garden_id: gardenId,
      year,
      season,
      row_idx: rowIdx,
      col_idx: colIdx,
      plant_id: plantId,
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

// ─── Migration ────────────────────────────────────────────────────────────────

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
