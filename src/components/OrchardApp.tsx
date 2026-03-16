import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { useGardenData } from '../hooks/useGardenData';
import { findPlant } from '../data/plants';
import { PLANT_INFO } from '../data/plantInfo';
import {
  CROP_FAMILY,
  FAMILY_LABEL,
  getPreviousSeasonKey,
  hasRotationIssue,
} from '../data/cropFamilies';
import type { CellWarnings } from './Grid';
import type { RotationWarning, CompatWarning } from './PlantModal';
import Controls   from './Controls';
import Grid       from './Grid';
import PlantModal from './PlantModal';
import Legend     from './Legend';
import UserMenu   from './UserMenu';
import AuthModal  from './AuthModal';
import '../styles/global.css';

// ─── Root: wraps everything with the Auth provider ────────────────────────────

export default function OrchardApp() {
  return (
    <AuthProvider>
      <OrchardInner />
    </AuthProvider>
  );
}

// ─── Inner app: has access to AuthContext ─────────────────────────────────────

function OrchardInner() {
  const {
    gardenData,
    notesData,
    year,   setYear,
    season, setSeason,
    cols,   setCols,
    rows,   setRows,
    ready,  syncing,
    setCell,
    setNote,
  } = useGardenData();

  const [activeCell,    setActiveCell]    = useState<{ r: number; c: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Winter body class ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('winter', season === 'winter');
  }, [season]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCell(null);
        setShowAuthModal(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const seasonKey    = `${year}-${season}`;
  const getCell      = useCallback(
    (r: number, c: number) => gardenData[seasonKey]?.[`${r},${c}`] ?? null,
    [gardenData, seasonKey],
  );
  const currentPlant = activeCell ? getCell(activeCell.r, activeCell.c) : null;
  const planted      = gardenData[seasonKey] ? Object.values(gardenData[seasonKey]) : [];

  // ── Per-cell warnings for the grid ────────────────────────────────────────
  const getCellWarnings = useCallback((r: number, c: number): CellWarnings => {
    const plantId = getCell(r, c);
    if (!plantId) return { rotation: false, compat: false, hasNote: false };

    // Rotation check — same botanical family as previous season?
    const prevKey     = getPreviousSeasonKey(year, season);
    const prevPlantId = gardenData[prevKey]?.[`${r},${c}`] ?? null;
    const rotation    = hasRotationIssue(plantId, prevPlantId);

    // Compat check — any incompatible neighbor in the 4 cardinal cells?
    const info   = PLANT_INFO[plantId];
    const compat = !!info && (
      [[-1,0],[1,0],[0,-1],[0,1]].some(([dr, dc]) => {
        const nId = getCell(r + dr, c + dc);
        if (!nId) return false;
        return info.avoid.includes(nId) || PLANT_INFO[nId]?.avoid.includes(plantId);
      })
    );

    const hasNote = !!(notesData[seasonKey]?.[`${r},${c}`]);

    return { rotation, compat, hasNote };
  }, [getCell, gardenData, notesData, year, season, seasonKey]);

  // ── Warnings for the active cell (shown inside PlantModal) ───────────────
  const rotationWarning = useMemo((): RotationWarning | null => {
    if (!activeCell || !currentPlant) return null;
    const { r, c } = activeCell;
    const prevKey     = getPreviousSeasonKey(year, season);
    const prevPlantId = gardenData[prevKey]?.[`${r},${c}`] ?? null;
    if (!hasRotationIssue(currentPlant, prevPlantId) || !prevPlantId) return null;
    return {
      prevPlantName: findPlant(prevPlantId)?.name ?? prevPlantId,
      familyLabel:   FAMILY_LABEL[CROP_FAMILY[currentPlant]] ?? '',
    };
  }, [activeCell, currentPlant, gardenData, year, season]);

  const compatWarnings = useMemo((): CompatWarning[] => {
    if (!activeCell || !currentPlant) return [];
    const { r, c } = activeCell;
    const info = PLANT_INFO[currentPlant];
    if (!info) return [];
    const seen = new Set<string>();
    return [[-1,0],[1,0],[0,-1],[0,1]]
      .map(([dr, dc]) => getCell(r + dr, c + dc))
      .filter((nId): nId is string => {
        if (!nId || seen.has(nId)) return false;
        seen.add(nId);
        return info.avoid.includes(nId) || !!(PLANT_INFO[nId]?.avoid.includes(currentPlant));
      })
      .map(id => {
        const p = findPlant(id);
        return p ? { id: p.id, name: p.name, emoji: p.emoji } : null;
      })
      .filter((x): x is CompatWarning => x !== null);
  }, [activeCell, currentPlant, getCell]);

  const activeNote = activeCell
    ? (notesData[seasonKey]?.[`${activeCell.r},${activeCell.c}`] ?? '')
    : '';

  if (!ready) {
    return <div className="app-loading"><span>Cargando el huerto…</span></div>;
  }

  return (
    <div className="wrap">

      {/* ── Header ── */}
      <header className="page-header">
        <div className="header-left">
          <h1>El Huerto</h1>
          <p>Planificador estacional de cultivos</p>
        </div>
        <div className="header-right">
          <span className="header-meta">
            {syncing && <span className="sync-dot" title="Guardando…" />}
            {season === 'summer' ? `☀️ Verano ${year}` : `❄️ Invierno ${year}`}
          </span>
          <UserMenu onLoginClick={() => setShowAuthModal(true)} />
        </div>
      </header>

      {/* ── Controls ── */}
      <Controls
        year={year}    season={season}
        cols={cols}    rows={rows}
        onYearChange={setYear}
        onSeasonChange={setSeason}
        onColsChange={setCols}
        onRowsChange={setRows}
      />

      {/* ── Grid ── */}
      <div className="grid-scroll">
        <Grid
          rows={rows}
          cols={cols}
          getCell={getCell}
          getCellWarnings={getCellWarnings}
          onCellClick={setActiveCell}
        />
      </div>

      {/* ── Legend ── */}
      <Legend planted={planted} />

      {/* ── Plant picker overlay ── */}
      <div
        className={`overlay${activeCell ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setActiveCell(null); }}
      >
        {activeCell && (
          <PlantModal
            cell={activeCell}
            season={season}
            year={year}
            currentPlant={currentPlant}
            note={activeNote}
            rotationWarning={rotationWarning}
            compatWarnings={compatWarnings}
            onSelect={plantId => { setCell(activeCell.r, activeCell.c, plantId); setActiveCell(null); }}
            onRemove={() =>       { setCell(activeCell.r, activeCell.c, null);   setActiveCell(null); }}
            onNoteChange={text => setNote(activeCell.r, activeCell.c, text)}
            onClose={() => setActiveCell(null)}
          />
        )}
      </div>

      {/* ── Auth overlay ── */}
      <div
        className={`overlay${showAuthModal ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setShowAuthModal(false); }}
      >
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>

    </div>
  );
}
