import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { GardenData, Season } from '../lib/storage';
import { loadData, saveData } from '../lib/storage';
import {
  getOrCreateGarden,
  loadPlantings,
  upsertPlanting,
  removePlanting,
  migrateLocalData,
  updateGardenSize,
  plantingsToGardenData,
} from '../lib/db';

// ─────────────────────────────────────────────────────────────────────────────

export function useGardenData() {
  const { user } = useAuth();

  const [gardenData, setGardenData] = useState<GardenData>({});
  const [gardenId,   setGardenId]   = useState<string | null>(null);
  const [year,       setYear]        = useState(new Date().getFullYear());
  const [season,     setSeason]      = useState<Season>('summer');
  const [cols,       setCols]        = useState(6);
  const [rows,       setRows]        = useState(10);
  const [ready,      setReady]       = useState(false);
  const [syncing,    setSyncing]     = useState(false);

  // Keep latest gardenId in a ref so async callbacks always see the current value
  const gardenIdRef = useRef<string | null>(null);
  gardenIdRef.current = gardenId;

  // ── Init on auth change ─────────────────────────────────────────────────────
  useEffect(() => {
    setReady(false);
    if (user) {
      loadFromSupabase(user.id);
    } else {
      loadFromLocalStorage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── LocalStorage load ───────────────────────────────────────────────────────
  const loadFromLocalStorage = () => {
    const { gardenData: gd, ui } = loadData();
    setGardenData(gd);
    setGardenId(null);
    if (ui) {
      setYear(ui.year);
      setSeason(ui.season);
      setCols(ui.cols);
      setRows(ui.rows);
    }
    setReady(true);
  };

  // ── Supabase load ───────────────────────────────────────────────────────────
  const loadFromSupabase = async (userId: string) => {
    setSyncing(true);
    try {
      // Restore UI preferences from localStorage
      const { ui, gardenData: localData } = loadData();
      const defaultCols = ui?.cols ?? 6;
      const defaultRows = ui?.rows ?? 10;
      if (ui) {
        setYear(ui.year);
        setSeason(ui.season);
      }

      // Get or create the user's garden
      const garden = await getOrCreateGarden(userId, defaultCols, defaultRows);
      setGardenId(garden.id);
      setCols(garden.cols);
      setRows(garden.rows);

      // Migrate localStorage data if present (only first login)
      if (Object.keys(localData).length > 0) {
        await migrateLocalData(garden.id, localData);
        // Clear local garden data after migration (keep UI prefs)
        localStorage.removeItem('el-huerto-v1');
      }

      // Load all plantings from Supabase
      const plantings = await loadPlantings(garden.id);
      setGardenData(plantingsToGardenData(plantings));
    } catch (err) {
      console.error('[useGardenData] Supabase load failed:', err);
    } finally {
      setSyncing(false);
      setReady(true);
    }
  };

  // ── Persist to localStorage when NOT logged in ──────────────────────────────
  useEffect(() => {
    if (!ready || user) return;
    saveData(gardenData, { year, season, cols, rows });
  }, [gardenData, year, season, cols, rows, ready, user]);

  // ── Always persist UI state (year, season) to localStorage ─────────────────
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem('el-huerto-ui', JSON.stringify({ year, season, cols, rows }));
    } catch { /* ignore */ }
  }, [year, season, cols, rows, ready]);

  // ── Cell operations ─────────────────────────────────────────────────────────
  const setCell = async (r: number, c: number, plantId: string | null) => {
    const sk = `${year}-${season}`;
    const ck = `${r},${c}`;

    // Optimistic update — instant UI response
    setGardenData(prev => {
      const next = { ...prev, [sk]: { ...(prev[sk] ?? {}) } };
      if (plantId === null) delete next[sk][ck];
      else next[sk][ck] = plantId;
      return next;
    });

    // Sync to Supabase if logged in
    const gid = gardenIdRef.current;
    if (user && gid) {
      if (plantId === null) {
        await removePlanting(gid, year, season, r, c);
      } else {
        await upsertPlanting(gid, year, season, r, c, plantId);
      }
    }
  };

  // ── Grid size operations ────────────────────────────────────────────────────
  const handleSetCols = async (newCols: number) => {
    setCols(newCols);
    const gid = gardenIdRef.current;
    if (user && gid) await updateGardenSize(gid, newCols, rows);
  };

  const handleSetRows = async (newRows: number) => {
    setRows(newRows);
    const gid = gardenIdRef.current;
    if (user && gid) await updateGardenSize(gid, cols, newRows);
  };

  return {
    gardenData,
    year,   setYear,
    season, setSeason,
    cols,   setCols: handleSetCols,
    rows,   setRows: handleSetRows,
    ready,
    syncing,
    setCell,
  };
}
