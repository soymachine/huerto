import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { GardenData, NotesData, Season, LocalGarden } from '../lib/storage';
import {
  loadGardens, saveGardens, loadActiveId, saveActiveId,
  loadGardenData, saveGardenData, loadGardenNotes, saveGardenNotes,
  clearGardenData, clearGardenNotes,
  loadUIState, saveUIState, migrateLegacy, genId,
} from '../lib/storage';
import {
  loadOrInitGardens,
  createGarden  as dbCreateGarden,
  renameGarden  as dbRenameGarden,
  deleteGarden  as dbDeleteGarden,
  loadPlantings, upsertPlanting, removePlanting, bulkUpsertPlantings,
  migrateLocalData, migrateLocalNotes,
  updateGardenSize, plantingsToGardenData,
  fetchNotes, upsertNote, dbNotesToNotesData,
} from '../lib/db';

// ─────────────────────────────────────────────────────────────────────────────

export interface GardenMeta {
  id:   string;
  name: string;
  cols: number;
  rows: number;
}

export function useGardenData() {
  const { user } = useAuth();

  // ── Garden list ─────────────────────────────────────────────────────────────
  const [gardens,       setGardens]       = useState<GardenMeta[]>([]);
  const [activeGardenId, setActiveGardenId] = useState<string | null>(null);

  // ── Active garden data ───────────────────────────────────────────────────────
  const [gardenData, setGardenData] = useState<GardenData>({});
  const [notesData,  setNotesData]  = useState<NotesData>({});
  const [cols,       setCols]        = useState(6);
  const [rows,       setRows]        = useState(10);

  // ── Global UI state ──────────────────────────────────────────────────────────
  const [year,   setYear]   = useState(new Date().getFullYear());
  const [season, setSeason] = useState<Season>('summer');

  const [ready,     setReady]     = useState(false);
  const [syncing,   setSyncing]   = useState(false);
  const [switching, setSwitching] = useState(false);

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeGardenId;

  // ── Init on auth change ─────────────────────────────────────────────────────
  useEffect(() => {
    setReady(false);
    if (user) initWithUser(user.id);
    else      initWithoutUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── No-user init ─────────────────────────────────────────────────────────────
  const initWithoutUser = () => {
    migrateLegacy();

    let list = loadGardens();
    if (list.length === 0) {
      const g: LocalGarden = { id: genId(), name: 'Mi Huerto', cols: 6, rows: 10 };
      list = [g];
      saveGardens(list);
      saveActiveId(g.id);
    }

    const ui      = loadUIState();
    const activeId = loadActiveId() ?? list[0].id;
    const active   = list.find(g => g.id === activeId) ?? list[0];

    setGardens(list);
    setActiveGardenId(active.id);
    setCols(active.cols);
    setRows(active.rows);
    setYear(ui.year);
    setSeason(ui.season);
    setGardenData(loadGardenData(active.id));
    setNotesData(loadGardenNotes(active.id));
    setReady(true);
  };

  // ── User init ────────────────────────────────────────────────────────────────
  const initWithUser = async (userId: string) => {
    setSyncing(true);
    try {
      const ui = loadUIState();
      setYear(ui.year);
      setSeason(ui.season);

      const dbGardens = await loadOrInitGardens(userId);
      const list: GardenMeta[] = dbGardens.map(g => ({ id: g.id, name: g.name, cols: g.cols, rows: g.rows }));
      setGardens(list);

      const storedActiveId = loadActiveId();
      const active = list.find(g => g.id === storedActiveId) ?? list[0];
      setActiveGardenId(active.id);
      setCols(active.cols);
      setRows(active.rows);

      // One-time migration of any local data
      const localData  = loadGardenData(active.id);
      const localNotes = loadGardenNotes(active.id);
      if (Object.keys(localData).length > 0) {
        await migrateLocalData(active.id, localData);
        clearGardenData(active.id);
      }
      if (Object.keys(localNotes).length > 0) {
        await migrateLocalNotes(active.id, localNotes);
        clearGardenNotes(active.id);
      }

      const [plantings, dbNotes] = await Promise.all([
        loadPlantings(active.id),
        fetchNotes(active.id),
      ]);
      setGardenData(plantingsToGardenData(plantings));
      setNotesData(dbNotesToNotesData(dbNotes));
    } catch (err) {
      console.error('[useGardenData] Supabase init failed:', err);
    } finally {
      setSyncing(false);
      setReady(true);
    }
  };

  // ── Persist to localStorage when NOT logged in ───────────────────────────────
  useEffect(() => {
    if (!ready || user || !activeGardenId) return;
    saveGardenData(activeGardenId, gardenData);
  }, [gardenData, ready, user, activeGardenId]);

  useEffect(() => {
    if (!ready || user || !activeGardenId) return;
    saveGardenNotes(activeGardenId, notesData);
  }, [notesData, ready, user, activeGardenId]);

  // ── Always persist UI prefs ──────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    saveUIState({ year, season });
  }, [year, season, ready]);

  // ── Switch garden ────────────────────────────────────────────────────────────
  const switchGarden = useCallback(async (id: string) => {
    if (id === activeIdRef.current) return;
    setSwitching(true);
    const garden = gardens.find(g => g.id === id);
    if (!garden) { setSwitching(false); return; }

    saveActiveId(id);
    setActiveGardenId(id);
    setCols(garden.cols);
    setRows(garden.rows);

    if (user) {
      const [plantings, dbNotes] = await Promise.all([loadPlantings(id), fetchNotes(id)]);
      setGardenData(plantingsToGardenData(plantings));
      setNotesData(dbNotesToNotesData(dbNotes));
    } else {
      setGardenData(loadGardenData(id));
      setNotesData(loadGardenNotes(id));
    }
    setSwitching(false);
  }, [gardens, user]);

  // ── Create garden ─────────────────────────────────────────────────────────────
  const createGarden = useCallback(async (name: string) => {
    if (user) {
      const g = await dbCreateGarden(user.id, name);
      const meta: GardenMeta = { id: g.id, name: g.name, cols: g.cols, rows: g.rows };
      setGardens(prev => [...prev, meta]);
      await switchGarden(meta.id);
    } else {
      const meta: LocalGarden = { id: genId(), name, cols: 6, rows: 10 };
      const next = [...gardens, meta];
      setGardens(next);
      saveGardens(next);
      // Switch manually (gardens state not updated yet in switchGarden closure)
      saveActiveId(meta.id);
      setActiveGardenId(meta.id);
      setCols(meta.cols);
      setRows(meta.rows);
      setGardenData({});
      setNotesData({});
    }
  }, [user, gardens, switchGarden]);

  // ── Rename garden ─────────────────────────────────────────────────────────────
  const renameGarden = useCallback(async (id: string, name: string) => {
    setGardens(prev => prev.map(g => g.id === id ? { ...g, name } : g));
    if (user) {
      await dbRenameGarden(id, name);
    } else {
      const list = loadGardens();
      saveGardens(list.map(g => g.id === id ? { ...g, name } : g));
    }
  }, [user]);

  // ── Delete garden ─────────────────────────────────────────────────────────────
  const deleteGarden = useCallback(async (id: string) => {
    let next = gardens.filter(g => g.id !== id);
    if (next.length === 0) {
      const fallback: LocalGarden = { id: genId(), name: 'Mi Huerto', cols: 6, rows: 10 };
      next = [fallback];
      if (!user) saveGardens(next);
    }
    setGardens(next);

    if (user) {
      await dbDeleteGarden(id);
    } else {
      saveGardens(next);
      clearGardenData(id);
      clearGardenNotes(id);
    }

    if (id === activeIdRef.current) await switchGarden(next[0].id);
  }, [gardens, user, switchGarden]);

  // ── Cell operations ──────────────────────────────────────────────────────────
  const setCell = async (r: number, c: number, plantId: string | null) => {
    const sk = `${year}-${season}`;
    const ck = `${r},${c}`;

    setGardenData(prev => {
      const next = { ...prev, [sk]: { ...(prev[sk] ?? {}) } };
      if (plantId === null) delete next[sk][ck];
      else next[sk][ck] = plantId;
      return next;
    });

    const gid = activeIdRef.current;
    if (user && gid) {
      if (plantId === null) await removePlanting(gid, year, season, r, c);
      else                  await upsertPlanting(gid, year, season, r, c, plantId);
    }
  };

  // ── Note operations ──────────────────────────────────────────────────────────
  const setNote = useCallback(async (r: number, c: number, text: string) => {
    const sk = `${year}-${season}`;
    const ck = `${r},${c}`;

    setNotesData(prev => {
      const next = { ...prev, [sk]: { ...(prev[sk] ?? {}) } };
      if (!text.trim()) delete next[sk][ck];
      else next[sk][ck] = text;
      return next;
    });

    const gid = activeIdRef.current;
    if (user && gid) await upsertNote(gid, year, season, r, c, text);
  }, [user, year, season]);

  // ── Copy previous season ─────────────────────────────────────────────────────
  const copySeason = useCallback(async (): Promise<boolean> => {
    const prevKey = season === 'summer' ? `${year - 1}-winter` : `${year}-summer`;
    const fromData = gardenData[prevKey];
    if (!fromData || Object.keys(fromData).length === 0) return false;

    const toKey = `${year}-${season}`;
    setGardenData(prev => ({ ...prev, [toKey]: { ...fromData } }));

    const gid = activeIdRef.current;
    if (user && gid) {
      setSyncing(true);
      try {
        await bulkUpsertPlantings(gid, year, season, fromData);
      } finally {
        setSyncing(false);
      }
    }
    return true;
  }, [gardenData, year, season, user]);

  // ── Grid size operations ──────────────────────────────────────────────────────
  const handleSetCols = async (newCols: number) => {
    setCols(newCols);
    const gid = activeIdRef.current;
    setGardens(prev => prev.map(g => g.id === gid ? { ...g, cols: newCols } : g));
    if (user && gid) await updateGardenSize(gid, newCols, rows);
    else if (gid) { const l = loadGardens(); saveGardens(l.map(g => g.id === gid ? { ...g, cols: newCols } : g)); }
  };
  const handleSetRows = async (newRows: number) => {
    setRows(newRows);
    const gid = activeIdRef.current;
    setGardens(prev => prev.map(g => g.id === gid ? { ...g, rows: newRows } : g));
    if (user && gid) await updateGardenSize(gid, cols, newRows);
    else if (gid) { const l = loadGardens(); saveGardens(l.map(g => g.id === gid ? { ...g, rows: newRows } : g)); }
  };

  return {
    // Garden management
    gardens, activeGardenId,
    switchGarden, createGarden, renameGarden, deleteGarden,
    // Active garden data
    gardenData, notesData,
    year,   setYear,
    season, setSeason,
    cols,   setCols: handleSetCols,
    rows,   setRows: handleSetRows,
    ready,
    syncing: syncing || switching,
    setCell, setNote, copySeason,
  };
}
