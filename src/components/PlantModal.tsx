import { useState, useRef, useEffect } from 'react';
import { PLANTS, findPlant } from '../data/plants';
import { PLANT_INFO } from '../data/plantInfo';
import PlantInfoModal from './PlantInfoModal';
import { useLang } from '../context/LangContext';
import type { Season } from '../lib/storage';

export interface RotationWarning { prevPlantName: string; familyLabel: string; }
export interface CompatWarning   { id: string; name: string; emoji: string; }

interface Props {
  cell:            { r: number; c: number };
  season:          Season;
  year:            number;
  currentPlant:    string | null;
  note:            string;
  date:            string;
  rotationWarning: RotationWarning | null;
  compatWarnings:  CompatWarning[];
  onSelect:        (plantId: string) => void;
  onRemove:        () => void;
  onNoteChange:    (text: string) => void;
  onDateChange:    (date: string) => void;
  onClose:         () => void;
}

export default function PlantModal({ cell, season, year, currentPlant, note, date, rotationWarning, compatWarnings, onSelect, onRemove, onNoteChange, onDateChange, onClose }: Props) {
  const { t, lang } = useLang();
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);
  const [localNote,   setLocalNote]   = useState(note);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocalNote(note); }, [note]);

  const handleNoteChange = (text: string) => {
    setLocalNote(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onNoteChange(text), 600);
  };

  if (infoPlantId) {
    return <PlantInfoModal plantId={infoPlantId} onBack={() => setInfoPlantId(null)} onClose={onClose} />;
  }

  const currentPlantObj = currentPlant ? findPlant(currentPlant) : null;
  const hasWarnings     = rotationWarning || compatWarnings.length > 0;

  // Sort plants by current language name
  const sortedPlants = (plants: typeof PLANTS[string]) =>
    [...plants].sort((a, b) =>
      (lang === 'en' ? a.nameEn : a.name).localeCompare(lang === 'en' ? b.nameEn : b.name)
    );

  return (
    <div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-head">
        <h2 className="modal-title" id="modalTitle">{t.choosePlant}</h2>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>
      <p className="modal-sub">
        {t.plot} {cell.r + 1}–{cell.c + 1}&nbsp;·&nbsp;
        {season === 'summer' ? `☀️ ${t.summer}` : `❄️ ${t.winter}`} {year}
      </p>

      {/* ── Current plant + date + remove button (same row) ── */}
      {currentPlantObj ? (
        <div className="current-plant-bar">
          <span className="current-plant-label">{t.currentlyPlanted}:</span>
          <span className="current-plant-pill">
            {currentPlantObj.emoji} {lang === 'en' ? currentPlantObj.nameEn : currentPlantObj.name}
          </span>
          <div className="current-plant-date">
            <input
              id="cell-date"
              type="date"
              className="date-input date-input-inline"
              value={date}
              onChange={e => onDateChange(e.target.value)}
              title={t.plantingDate}
            />
            {date && (
              <button className="date-clear-btn" onClick={() => onDateChange('')} title={t.clearDate}>✕</button>
            )}
          </div>
          <button className="btn-remove-inline" onClick={onRemove}>✕ {t.removePlant}</button>
        </div>
      ) : (
        /* Date row for empty cells (no plant yet) */
        <div className="empty-date-row">
          <label className="notes-label" htmlFor="cell-date">📅 {t.plantingDate}</label>
          <div className="date-row">
            <input id="cell-date" type="date" className="date-input" value={date} onChange={e => onDateChange(e.target.value)} />
            {date && <button className="date-clear-btn" onClick={() => onDateChange('')} title={t.clearDate}>✕</button>}
          </div>
        </div>
      )}

      {/* ── Warnings ── */}
      {hasWarnings && (
        <div className="modal-warnings">
          {rotationWarning && (
            <div className="warning-item warning-rot">
              <span className="warning-icon">↺</span>
              <span><strong>{t.rotationWarning}:</strong> {t.rotationDetail(rotationWarning.prevPlantName, rotationWarning.familyLabel)}</span>
            </div>
          )}
          {compatWarnings.map(p => (
            <div key={p.id} className="warning-item warning-compat">
              <span className="warning-icon">!</span>
              <span><strong>{t.compatWarning}:</strong> {t.compatDetail(`${p.emoji} ${p.name}`, currentPlantObj ? (lang === 'en' ? currentPlantObj.nameEn : currentPlantObj.name) : '')}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Plant grid ── */}
      <div>
        {Object.entries(PLANTS).map(([cat, plants]) => (
          <div key={cat}>
            <div className="modal-cat-label">{t.categories[cat] ?? cat}</div>
            <div className="plant-grid">
              {sortedPlants(plants).map(p => (
                <div
                  key={p.id}
                  className={`plant-opt${p.id === currentPlant ? ' chosen' : ''}`}
                  onClick={() => onSelect(p.id)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onSelect(p.id)}
                >
                  <span className="plant-opt-emoji">{p.emoji}</span>
                  <span className="plant-opt-name">{lang === 'en' ? p.nameEn : p.name}</span>
                  {PLANT_INFO[p.id] && (
                    <button
                      className="plant-info-btn"
                      onClick={e => { e.stopPropagation(); setInfoPlantId(p.id); }}
                      aria-label={`Info ${p.name}`}
                      tabIndex={-1}
                    >ℹ</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Notes ── */}
      <div className="notes-section">
        <label className="notes-label" htmlFor="cell-note">✎ {t.plantNotes}</label>
        <textarea
          id="cell-note" className="notes-input" value={localNote} rows={3}
          onChange={e => handleNoteChange(e.target.value)}
          placeholder={t.notesPlaceholder}
        />
      </div>
    </div>
  );
}
