import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider }   from '../context/AuthContext';
import { LangProvider, useLang } from '../context/LangContext';
import { useGardenData }  from '../hooks/useGardenData';
import { findPlant }      from '../data/plants';
import { PLANT_INFO }     from '../data/plantInfo';
import { CROP_FAMILY, FAMILY_COLOR, FAMILY_ABBR, getPreviousSeasonKey, hasRotationIssue } from '../data/cropFamilies';
import type { CellWarnings }                  from './Grid';
import type { RotationWarning, CompatWarning } from './PlantModal';
import Grid           from './Grid';
import PlantModal     from './PlantModal';
import Legend         from './Legend';
import UserMenu       from './UserMenu';
import AuthModal      from './AuthModal';
import GardenSelector from './GardenSelector';
import TaskCalendar   from './TaskCalendar';
import '../styles/global.css';

type View = 'garden' | 'calendar';

// ─── Root: Auth + Lang providers ─────────────────────────────────────────────

export default function OrchardApp() {
  return (
    <AuthProvider>
      <LangProvider>
        <OrchardInner />
      </LangProvider>
    </AuthProvider>
  );
}

// ─── Inner app ────────────────────────────────────────────────────────────────

function OrchardInner() {
  const { t, lang, setLang } = useLang();
  const {
    gardens, activeGardenId,
    switchGarden, createGarden, renameGarden, deleteGarden,
    gardenData, notesData,
    year,   setYear,
    season, setSeason,
    cols,   setCols,
    rows,   setRows,
    ready,  syncing,
    setCell, setNote, copySeason,
  } = useGardenData();

  const [view,          setView]          = useState<View>('garden');
  const [activeCell,    setActiveCell]    = useState<{ r: number; c: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFamilies,  setShowFamilies]  = useState(false);

  // ── Previous season data ───────────────────────────────────────────────────
  const prevSeasonKey = season === 'summer' ? `${year - 1}-winter` : `${year}-summer`;
  const prevSeasonLabel = season === 'summer'
    ? `${t.winter} ${year - 1}`
    : `${t.summer} ${year}`;
  const hasPrevData = Object.keys(gardenData[prevSeasonKey] ?? {}).length > 0;

  const handleCopySeason = async () => {
    if (!window.confirm(t.copySeasonConfirm(prevSeasonLabel))) return;
    await copySeason();
  };

  // ── Winter body class ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('winter', season === 'winter');
  }, [season]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setActiveCell(null); setShowAuthModal(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Core helpers ──────────────────────────────────────────────────────────
  const seasonKey    = `${year}-${season}`;
  const getCell      = useCallback(
    (r: number, c: number) => gardenData[seasonKey]?.[`${r},${c}`] ?? null,
    [gardenData, seasonKey],
  );
  const currentPlant = activeCell ? getCell(activeCell.r, activeCell.c) : null;
  const planted      = gardenData[seasonKey] ? Object.values(gardenData[seasonKey]) : [];

  const activeFamilies = useMemo(() => {
    const seen = new Set<string>();
    planted.forEach(id => { const f = CROP_FAMILY[id]; if (f) seen.add(f); });
    return [...seen].sort((a, b) =>
      (t.familyNames[a] ?? a).localeCompare(t.familyNames[b] ?? b),
    );
  }, [planted, t]);

  // ── Per-cell warnings ─────────────────────────────────────────────────────
  const getCellWarnings = useCallback((r: number, c: number): CellWarnings => {
    const plantId = getCell(r, c);
    if (!plantId) return { rotation: false, rotationDetail: '', compat: false, compatDetail: '', hasNote: false };

    const prevKey     = getPreviousSeasonKey(year, season);
    const prevPlantId = gardenData[prevKey]?.[`${r},${c}`] ?? null;
    const rotation    = hasRotationIssue(plantId, prevPlantId);
    const rotationDetail = rotation && prevPlantId
      ? `↺ ${t.rotationDetail(findPlant(prevPlantId)?.name ?? prevPlantId, t.familyNames[CROP_FAMILY[plantId]] ?? '')}`
      : '';

    const info = PLANT_INFO[plantId];
    const incompatibleNeighbors: string[] = [];
    if (info) {
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
        const nId = getCell(r + dr, c + dc);
        if (!nId) return;
        if (info.avoid.includes(nId) || PLANT_INFO[nId]?.avoid.includes(plantId)) {
          const name = findPlant(nId)?.name;
          if (name && !incompatibleNeighbors.includes(name)) incompatibleNeighbors.push(name);
        }
      });
    }
    const compat       = incompatibleNeighbors.length > 0;
    const compatDetail = compat ? `! Incompatible con: ${incompatibleNeighbors.join(', ')}` : '';
    const hasNote      = !!(notesData[seasonKey]?.[`${r},${c}`]);

    return { rotation, rotationDetail, compat, compatDetail, hasNote };
  }, [getCell, gardenData, notesData, year, season, seasonKey]);

  // ── Modal warnings ────────────────────────────────────────────────────────
  const rotationWarning = useMemo((): RotationWarning | null => {
    if (!activeCell || !currentPlant) return null;
    const { r, c } = activeCell;
    const prevKey     = getPreviousSeasonKey(year, season);
    const prevPlantId = gardenData[prevKey]?.[`${r},${c}`] ?? null;
    if (!hasRotationIssue(currentPlant, prevPlantId) || !prevPlantId) return null;
    return {
      prevPlantName: findPlant(prevPlantId)?.name ?? prevPlantId,
      familyLabel:   t.familyNames[CROP_FAMILY[currentPlant]] ?? '',
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
    return <div className="app-loading"><span>{t.loading}</span></div>;
  }

  return (
    <div className="wrap">

      {/* ── Header — single compact row ── */}
      <header className="page-header">
        {syncing && <span className="sync-dot" title={t.loading} />}
        <h1 className="header-logo">{t.appTitle}</h1>

        <span className="header-sep" />

        {/* Year */}
        <div className="year-row">
          <button className="year-btn" onClick={() => setYear(year - 1)}>−</button>
          <span className="year-val">{year}</span>
          <button className="year-btn" onClick={() => setYear(year + 1)}>+</button>
        </div>

        {/* Season */}
        <div className="season-row">
          <button className={`season-btn${season === 'summer' ? ' active' : ''}`} data-s="summer" onClick={() => setSeason('summer')}>☀️ {t.summer}</button>
          <button className={`season-btn${season === 'winter' ? ' active' : ''}`} data-s="winter" onClick={() => setSeason('winter')}>❄️ {t.winter}</button>
        </div>

        {/* Garden selector */}
        <GardenSelector
          gardens={gardens}
          activeId={activeGardenId}
          onSwitch={switchGarden}
          onCreate={createGarden}
          onRename={renameGarden}
          onDelete={deleteGarden}
        />

        <span className="header-sep" />

        {/* View tabs */}
        <button className={`view-tab${view === 'garden' ? ' active' : ''}`} onClick={() => setView('garden')}>🌱 {t.tabGarden}</button>
        <button className={`view-tab${view === 'calendar' ? ' active' : ''}`} onClick={() => setView('calendar')}>📅 {t.tabCalendar}</button>

        {/* Families toggle */}
        <button
          className={`families-ctrl-btn${showFamilies ? ' active' : ''}`}
          onClick={() => setShowFamilies(v => !v)}
          title={t.familiesHint}
        >🌿 {t.familiesLabel}</button>

        {/* Copy season (icon only, tooltip shows season name) */}
        {hasPrevData && (
          <button className="copy-season-btn icon-only" onClick={handleCopySeason} title={`${t.copySeason} ← ${prevSeasonLabel}`}>⬆</button>
        )}

        <span className="header-sep" />

        <button className="print-btn" onClick={() => window.print()} title={t.print}>🖨</button>
        <div className="lang-toggle">
          <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
          <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
        <UserMenu onLoginClick={() => setShowAuthModal(true)} />
      </header>

      {/* ── Grid size bar (compact, below header) ── */}
      {view === 'garden' && (
        <GridSizeBar cols={cols} rows={rows} onCols={setCols} onRows={setRows} />
      )}

      {/* ── Print-only season header ── */}
      <div className="print-header">
        <span>{gardens.find(g => g.id === activeGardenId)?.name}</span>
        <span>{season === 'summer' ? `☀️ ${t.summer}` : `❄️ ${t.winter}`} {year}</span>
      </div>

      {/* ── Garden view ── */}
      {view === 'garden' && (
        <>
          <div className="grid-scroll">
            <Grid
              rows={rows}
              cols={cols}
              showFamilies={showFamilies}
              getCell={getCell}
              getCellWarnings={getCellWarnings}
              onCellClick={setActiveCell}
            />
          </div>

          {/* Family overlay legend */}
          {showFamilies && activeFamilies.length > 0 && (
            <div className="family-legend">
              <span className="family-legend-title">{t.botanicalFamilies}</span>
              {activeFamilies.map(family => (
                <span
                  key={family}
                  className="family-legend-chip"
                  style={{ background: FAMILY_COLOR[family] ?? '#eee' }}
                >
                  <strong>{FAMILY_ABBR[family]}</strong>
                  {t.familyNames[family]}
                </span>
              ))}
            </div>
          )}

          <Legend planted={planted} />
        </>
      )}

      {/* ── Calendar view ── */}
      {view === 'calendar' && (
        <TaskCalendar gardenData={gardenData} year={year} />
      )}

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
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>

    </div>
  );
}

// ─── Grid size helper ────────────────────────────────────────────────────────

function GridSizeBar({ cols, rows, onCols, onRows }: { cols: number; rows: number; onCols: (n: number) => void; onRows: (n: number) => void }) {
  const { t } = useLang();
  const [c, setC] = useState(String(cols));
  const [r, setR] = useState(String(rows));
  useEffect(() => setC(String(cols)), [cols]);
  useEffect(() => setR(String(rows)), [rows]);
  const cc = () => { const n = parseInt(c); const v = Math.max(1, Math.min(20, isNaN(n) ? cols : n)); setC(String(v)); onCols(v); };
  const cr = () => { const n = parseInt(r); const v = Math.max(1, Math.min(30, isNaN(n) ? rows : n)); setR(String(v)); onRows(v); };
  return (
    <div className="grid-size-bar">
      <span className="ctrl-label">{t.gridSize}</span>
      <div className="size-row">
        <div className="size-field">
          <span className="size-sublabel">{t.colLabel}</span>
          <input className="size-inp" type="number" value={c} min={1} max={20} onChange={e => setC(e.target.value)} onBlur={cc} onKeyDown={e => e.key === 'Enter' && cc()} />
        </div>
        <span className="size-x">×</span>
        <div className="size-field">
          <span className="size-sublabel">{t.rowLabel}</span>
          <input className="size-inp" type="number" value={r} min={1} max={30} onChange={e => setR(e.target.value)} onBlur={cr} onKeyDown={e => e.key === 'Enter' && cr()} />
        </div>
      </div>
    </div>
  );
}
