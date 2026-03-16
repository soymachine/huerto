import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { GardenData, NotesData, Season } from '../lib/storage';
import { loadData, saveData, loadNotes, saveNotes, clearLocalNotes } from '../lib/storage';
import {
  getOrCreateGarden,
  loadPlantings,
  upsertPlanting,
  removePlanting,
  migrateLocalData,
  migrateLocalNotes,
  updateGardenSize,
  plantingsToGardenData,
  fetchNotes,
  upsertNote,
  dbNotesToNotesData,
} from '../lib/db';

// ─────────────────────────────────────────────────────────────────────────────

export function useGardenData() {
  const { user } = useAuth();

  const [gardenData, setGardenData] = useState<GardenData>({});
  const [notesData,  setNotesData]  = useState<NotesData>({});
  const [gardenId,   setGardenId]   = useState<string | null>(null);
  const [year,       setYear]        = useState(new Date().getFullYear());
  const [season,     setSeason]      = useState<Season>('summer');
  const [cols,       setCols]        = useState(6);
  const [rows,       setRows]        = useState(10);
  const [ready,      setReady]       = useState(false);
  const [syncing,    setSyncing]     = useState(false);

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
    const notes = loadNotes();
    setGardenData(gd);
    setNotesData(notes);
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
      const { ui, gardenData: localData } = loadData();
      const localNotes = loadNotes();
      const defaultCols = ui?.cols ?? 6;
      const defaultRows = ui?.rows ?? 10;
      if (ui) { setYear(ui.year); setSeason(ui.season); }

      const garden = await getOrCreateGarden(userId, defaultCols, defaultRows);
      setGardenId(garden.id);
      setCols(garden.cols);
      setRows(garden.rows);

      // Migrate local plant data
      if (Object.keys(localData).length > 0) {
        await migrateLocalData(garden.id, localData);
        localStorage.removeItem('el-huerto-v1');
      }

      // Migrate local notes
      if (Object.keys(localNotes).length > 0) {
        await migrateLocalNotes(garden.id, localNotes);
        clearLocalNotes();
      }

      // Load everything from Supabase in parallel
      const [plantings, dbNotes] = await Promise.all([
        loadPlantings(garden.id),
        fetchNotes(garden.id),
      ]);
      setGardenData(plantingsToGardenData(plantings));
      setNotesData(dbNotesToNotesData(dbNotes));
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

  useEffect(() => {
    if (!ready || user) return;
    saveNotes(notesData);
  }, [notesData, ready, user]);

  // ── Always persist UI prefs ─────────────────────────────────────────────────
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

    setGardenData(prev => {
      const next = { ...prev, [sk]: { ...(prev[sk] ?? {}) } };
      if (plantId === null) delete next[sk][ck];
      else next[sk][ck] = plantId;
      return next;
    });

    const gid = gardenIdRef.current;
    if (user && gid) {
      if (plantId === null) await removePlanting(gid, year, season, r, c);
      else                  await upsertPlanting(gid, year, season, r, c, plantId);
    }
  };

  // ── Note operations ─────────────────────────────────────────────────────────
  const setNote = useCallback(async (r: number, c: number, text: string) => {
    const sk = `${year}-${season}`;
    const ck = `${r},${c}`;

    setNotesData(prev => {
      const next = { ...prev, [sk]: { ...(prev[sk] ?? {}) } };
      if (!text.trim()) delete next[sk][ck];
      else next[sk][ck] = text;
      return next;
    });

    const gid = gardenIdRef.current;
    if (user && gid) {
      await upsertNote(gid, year, season, r, c, text);
    }
  }, [user, year, season]);

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
    notesData,
    year,   setYear,
    season, setSeason,
    cols,   setCols: handleSetCols,
    rows,   setRows: handleSetRows,
    ready,
    syncing,
    setCell,
    setNote,
  };
}
