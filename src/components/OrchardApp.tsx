import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react';
import type { Lang } from '../context/LangContext';
import { AuthProvider }   from '../context/AuthContext';
import { LangProvider, useLang } from '../context/LangContext';
import { useGardenData }  from '../hooks/useGardenData';
import { findPlant }      from '../data/plants';
import { PLANT_INFO }     from '../data/plantInfo';
import { CROP_FAMILY, getPreviousSeasonKey, hasRotationIssue } from '../data/cropFamilies';
import AssociationsTable from './AssociationsTable';
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
    gardenData, notesData, datesData,
    year,   setYear,
    season, setSeason,
    cols,   setCols,
    rows,   setRows,
    ready,  syncing,
    setCell, setNote, setDate, moveCell, copySeason, insertRow, insertCol, deleteRow, deleteCol,
    undo, redo, canUndo, canRedo,
  } = useGardenData();

  const [view,             setView]             = useState<View>('garden');
  const [activeCell,       setActiveCell]       = useState<{ r: number; c: number } | null>(null);
  const [showAuthModal,    setShowAuthModal]    = useState(false);
  const [showAssociations, setShowAssociations] = useState(false);
  const [showAssocTable,   setShowAssocTable]   = useState(false);

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
      if (e.key === 'Escape') { setActiveCell(null); setShowAuthModal(false); setShowAssocTable(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Undo / redo keyboard shortcuts ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ── Core helpers ──────────────────────────────────────────────────────────
  const seasonKey    = `${year}-${season}`;
  const getCell      = useCallback(
    (r: number, c: number) => gardenData[seasonKey]?.[`${r},${c}`] ?? null,
    [gardenData, seasonKey],
  );
  const currentPlant = activeCell ? getCell(activeCell.r, activeCell.c) : null;
  const planted      = gardenData[seasonKey] ? Object.values(gardenData[seasonKey]) : [];

  // ── Per-cell warnings ─────────────────────────────────────────────────────
  const getCellWarnings = useCallback((r: number, c: number): CellWarnings => {
    const plantId = getCell(r, c);
    if (!plantId) return { rotation: false, rotationDetail: '', compat: false, compatDetail: '', good: false, goodDetail: '', noteText: '', dateText: '' };

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

    const goodNeighbors: string[] = [];
    if (info) {
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
        const nId = getCell(r + dr, c + dc);
        if (!nId) return;
        if (info.companions.includes(nId) || PLANT_INFO[nId]?.companions.includes(plantId)) {
          const name = findPlant(nId)?.name;
          if (name && !goodNeighbors.includes(name)) goodNeighbors.push(name);
        }
      });
    }
    const good       = goodNeighbors.length > 0;
    const goodDetail = good ? `✓ Buena asociación con: ${goodNeighbors.join(', ')}` : '';

    const noteText     = notesData[seasonKey]?.[`${r},${c}`] ?? '';

    const rawDate  = datesData[seasonKey]?.[`${r},${c}`] ?? '';
    let dateText = '';
    if (rawDate) {
      const d = new Date(rawDate + 'T00:00:00');
      if (!isNaN(d.getTime())) dateText = `${d.getDate()} ${t.monthsAbbr[d.getMonth()]}`;
    }

    return { rotation, rotationDetail, compat, compatDetail, good, goodDetail, noteText, dateText };
  }, [getCell, gardenData, notesData, datesData, year, season, seasonKey, t]);

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
  const activeDate = activeCell
    ? (datesData[seasonKey]?.[`${activeCell.r},${activeCell.c}`] ?? '')
    : '';

  if (!ready) {
    return <div className="app-loading"><span>{t.loading}</span></div>;
  }

  return (
    <div className="wrap">

      {/* ── Header ── */}
      <header className="page-header">

        {/* ── Row 1: Logo · Year · Season · Garden ── */}
        <div className="header-top">
          {syncing && <span className="sync-dot" title={t.loading} />}
          <h1 className="header-logo">{t.appTitle}</h1>

          <span className="header-sep" />

          <div className="year-row">
            <button className="year-btn" onClick={() => setYear(year - 1)}>−</button>
            <span className="year-val">{year}</span>
            <button className="year-btn" onClick={() => setYear(year + 1)}>+</button>
          </div>

          <span className="header-sep" />

          <div className="season-row">
            <button className={`season-btn${season === 'summer' ? ' active' : ''}`} data-s="summer" onClick={() => setSeason('summer')} title={t.summer}>☀️</button>
            <button className={`season-btn${season === 'winter' ? ' active' : ''}`} data-s="winter" onClick={() => setSeason('winter')} title={t.winter}>❄️</button>
          </div>

          <span className="header-sep" />

          <GardenSelector
            gardens={gardens}
            activeId={activeGardenId}
            onSwitch={switchGarden}
            onCreate={createGarden}
            onRename={renameGarden}
            onDelete={deleteGarden}
          />
        </div>

        {/* ── Row 2: Tabs (left) · Actions (right) ── */}
        <div className="header-tabs">
          <div className="header-tabs-left">

            {/* Garden + Families grouped in the same frame */}
            <div className={`tab-group${view === 'garden' ? ' tab-group-active' : ''}`}>
              <button
                className={`view-tab tab-group-btn${view === 'garden' ? ' active' : ' icon-only'}`}
                onClick={() => setView('garden')}
                title={view !== 'garden' ? t.tabGarden : undefined}
              >⊞{view === 'garden' ? ` ${t.tabGarden}` : ''}</button>

              {view === 'garden' && (
                <>
                  <button
                    className={`view-tab tab-group-btn${showAssociations ? ' active' : ''}`}
                    onClick={() => setShowAssociations(v => !v)}
                    title={t.tabAssociations}
                  >🤝 {t.tabAssociations}</button>
                  {showAssociations && (
                    <button
                      className="view-tab tab-group-btn"
                      onClick={() => setShowAssocTable(true)}
                      title={t.assocTableTitle}
                    >⊞ {t.assocTableTitle}</button>
                  )}
                </>
              )}
            </div>

            {/* Copy season — only in garden view */}
            {view === 'garden' && hasPrevData && (
              <button className="copy-season-btn icon-only" onClick={handleCopySeason} title={`${t.copySeason} ← ${prevSeasonLabel}`}>⬆</button>
            )}

            {/* Calendar tab: icon+label when active, icon-only when not */}
            <button
              className={`view-tab${view === 'calendar' ? ' active' : ' icon-only'}`}
              onClick={() => setView('calendar')}
              title={view !== 'calendar' ? t.tabCalendar : undefined}
            >📅{view === 'calendar' ? ` ${t.tabCalendar}` : ''}</button>

          </div>
          <div className="header-tabs-right">
            <button className="print-btn" onClick={undo} disabled={!canUndo} title={t.undo}><ArrowCounterClockwise size={16} weight="bold" /></button>
            <button className="print-btn" onClick={redo} disabled={!canRedo} title={t.redo}><ArrowClockwise size={16} weight="bold" /></button>
            <button className="print-btn" onClick={() => window.print()} title={t.print}>🖨</button>
            <ConfigButton
              cols={cols} rows={rows}
              onCols={setCols} onRows={setRows}
              lang={lang} setLang={setLang}
            />
            <UserMenu onLoginClick={() => setShowAuthModal(true)} />
          </div>
        </div>

      </header>

      {/* ── Print-only season header ── */}
      <div className="print-header">
        <span>{gardens.find(g => g.id === activeGardenId)?.name}</span>
        <span>{season === 'summer' ? `☀️ ${t.summer}` : `❄️ ${t.winter}`} {year}</span>
      </div>

      {/* ── Garden view ── */}
      {view === 'garden' && (
        <>
          <div className="grid-outer">
            <button className="grid-insert-btn grid-insert-btn--col" onClick={() => insertCol(0)} title="Insertar columna a la izquierda">＋</button>
            <div className="grid-scroll">
              <div className="grid-insert-wrap">
                {/* Insert row top */}
                <button className="grid-insert-btn grid-insert-btn--row" onClick={() => insertRow(0)} title="Insertar fila arriba">＋</button>
                <Grid
                  rows={rows}
                  cols={cols}
                  showAssociations={showAssociations}
                  getCell={getCell}
                  getCellWarnings={getCellWarnings}
                  onCellClick={setActiveCell}
                  onCellMove={moveCell}
                  onInsertRow={(at) => insertRow(at)}
                  onInsertCol={(at) => insertCol(at)}
                  onDeleteRow={deleteRow}
                  onDeleteCol={deleteCol}
                />
                {/* Insert row bottom */}
                <button className="grid-insert-btn grid-insert-btn--row" onClick={() => insertRow(rows)} title="Insertar fila abajo">＋</button>
              </div>
            </div>
            <button className="grid-insert-btn grid-insert-btn--col" onClick={() => insertCol(cols)} title="Insertar columna a la derecha">＋</button>
          </div>

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
            date={activeDate}
            rotationWarning={rotationWarning}
            compatWarnings={compatWarnings}
            onSelect={plantId => { setCell(activeCell.r, activeCell.c, plantId); setActiveCell(null); }}
            onRemove={() =>       { setCell(activeCell.r, activeCell.c, null);   setActiveCell(null); }}
            onNoteChange={text => setNote(activeCell.r, activeCell.c, text)}
            onDateChange={date => setDate(activeCell.r, activeCell.c, date)}
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

      {/* ── Associations table overlay ── */}
      {showAssocTable && (
        <AssociationsTable onClose={() => setShowAssocTable(false)} />
      )}

      <footer className="app-version">v1.4</footer>

    </div>
  );
}

// ─── Config button + panel ────────────────────────────────────────────────────

function ConfigButton({
  cols, rows, onCols, onRows, lang, setLang,
}: {
  cols: number; rows: number;
  onCols: (n: number) => void; onRows: (n: number) => void;
  lang: Lang; setLang: (l: Lang) => void;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const clampCols = (n: number) => Math.max(1, Math.min(20, n));
  const clampRows = (n: number) => Math.max(1, Math.min(30, n));

  return (
    <div className="cfg-wrap" ref={wrapRef}>
      <button
        className={`cfg-trigger-btn${open ? ' active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title={t.settings}
      >⚙</button>

      {open && (
        <div className="cfg-panel">
          <p className="cfg-panel-title">{t.settings}</p>

          {/* Grid size */}
          <div className="cfg-section">
            <p className="cfg-section-label">{t.gridSize}</p>
            <div className="cfg-row">
              <span className="cfg-field-label">{t.colLabel}</span>
              <div className="cfg-stepper">
                <button className="cfg-step-btn" onClick={() => onCols(clampCols(cols - 1))}>−</button>
                <span className="cfg-step-val">{cols}</span>
                <button className="cfg-step-btn" onClick={() => onCols(clampCols(cols + 1))}>+</button>
              </div>
            </div>
            <div className="cfg-row">
              <span className="cfg-field-label">{t.rowLabel}</span>
              <div className="cfg-stepper">
                <button className="cfg-step-btn" onClick={() => onRows(clampRows(rows - 1))}>−</button>
                <span className="cfg-step-val">{rows}</span>
                <button className="cfg-step-btn" onClick={() => onRows(clampRows(rows + 1))}>+</button>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="cfg-section">
            <p className="cfg-section-label">{t.language}</p>
            <div className="lang-toggle">
              <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
              <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
