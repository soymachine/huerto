import { useState, useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { useGardenData } from '../hooks/useGardenData';
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
    year,   setYear,
    season, setSeason,
    cols,   setCols,
    rows,   setRows,
    ready,  syncing,
    setCell,
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
  const getCell      = (r: number, c: number) => gardenData[seasonKey]?.[`${r},${c}`] ?? null;
  const currentPlant = activeCell ? getCell(activeCell.r, activeCell.c) : null;
  const planted      = gardenData[seasonKey] ? Object.values(gardenData[seasonKey]) : [];

  if (!ready) {
    return (
      <div className="app-loading">
        <span>Cargando el huerto…</span>
      </div>
    );
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
        <Grid rows={rows} cols={cols} getCell={getCell} onCellClick={setActiveCell} />
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
            onSelect={plantId => { setCell(activeCell.r, activeCell.c, plantId); setActiveCell(null); }}
            onRemove={() =>       { setCell(activeCell.r, activeCell.c, null);   setActiveCell(null); }}
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
