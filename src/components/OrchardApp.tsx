import { useState, useEffect } from 'react';
import type { Season, GardenData } from '../lib/storage';
import { loadData, saveData } from '../lib/storage';
import Controls from './Controls';
import Grid from './Grid';
import PlantModal from './PlantModal';
import Legend from './Legend';
import '../styles/global.css';

export default function OrchardApp() {
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [season,     setSeason]     = useState<Season>('summer');
  const [cols,       setCols]       = useState(6);
  const [rows,       setRows]       = useState(10);
  const [gardenData, setGardenData] = useState<GardenData>({});
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [ready,      setReady]      = useState(false);

  // ── Hydrate from localStorage ──────────────────────────────────────
  useEffect(() => {
    const { gardenData: gd, ui } = loadData();
    setGardenData(gd);
    if (ui) {
      setYear(ui.year);
      setSeason(ui.season);
      setCols(ui.cols);
      setRows(ui.rows);
    }
    setReady(true);
  }, []);

  // ── Persist to localStorage ────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    saveData(gardenData, { year, season, cols, rows });
  }, [gardenData, year, season, cols, rows, ready]);

  // ── Toggle body.winter class ───────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('winter', season === 'winter');
  }, [season]);

  // ── Escape key closes modal ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCell(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────
  const seasonKey = `${year}-${season}`;

  const getCell = (r: number, c: number): string | null =>
    gardenData[seasonKey]?.[`${r},${c}`] ?? null;

  const setCell = (r: number, c: number, plantId: string | null) => {
    setGardenData(prev => {
      const next = { ...prev, [seasonKey]: { ...(prev[seasonKey] ?? {}) } };
      if (plantId === null) delete next[seasonKey][`${r},${c}`];
      else next[seasonKey][`${r},${c}`] = plantId;
      return next;
    });
  };

  const currentPlant = activeCell ? getCell(activeCell.r, activeCell.c) : null;

  return (
    <div className="wrap">

      {/* ── Header ── */}
      <header className="page-header">
        <div className="header-left">
          <h1>El Huerto</h1>
          <p>Planificador estacional de cultivos</p>
        </div>
        <div className="header-meta">
          {season === 'summer' ? `☀️ Verano ${year}` : `❄️ Invierno ${year}`}
        </div>
      </header>

      {/* ── Controls ── */}
      <Controls
        year={year}
        season={season}
        cols={cols}
        rows={rows}
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
          onCellClick={setActiveCell}
        />
      </div>

      {/* ── Legend ── */}
      <Legend
        planted={gardenData[seasonKey] ? Object.values(gardenData[seasonKey]) : []}
      />

      {/* ── Modal overlay ── */}
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
            onSelect={plantId => {
              setCell(activeCell.r, activeCell.c, plantId);
              setActiveCell(null);
            }}
            onRemove={() => {
              setCell(activeCell.r, activeCell.c, null);
              setActiveCell(null);
            }}
            onClose={() => setActiveCell(null)}
          />
        )}
      </div>

    </div>
  );
}
