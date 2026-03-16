import { useState, useRef, useEffect } from 'react';
import { PLANTS, findPlant } from '../data/plants';
import { PLANT_INFO } from '../data/plantInfo';
import PlantInfoModal from './PlantInfoModal';
import type { Season } from '../lib/storage';

export interface RotationWarning {
  prevPlantName: string;
  familyLabel:   string;
}

export interface CompatWarning {
  id:    string;
  name:  string;
  emoji: string;
}

interface Props {
  cell:             { r: number; c: number };
  season:           Season;
  year:             number;
  currentPlant:     string | null;
  note:             string;
  rotationWarning:  RotationWarning | null;
  compatWarnings:   CompatWarning[];
  onSelect:         (plantId: string) => void;
  onRemove:         () => void;
  onNoteChange:     (text: string) => void;
  onClose:          () => void;
}

export default function PlantModal({
  cell, season, year, currentPlant,
  note, rotationWarning, compatWarnings,
  onSelect, onRemove, onNoteChange, onClose,
}: Props) {
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);
  const [localNote,   setLocalNote]   = useState(note);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local note if parent changes (e.g. different cell opened)
  useEffect(() => { setLocalNote(note); }, [note]);

  // Debounced save — 600ms after the user stops typing
  const handleNoteChange = (text: string) => {
    setLocalNote(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onNoteChange(text), 600);
  };

  // ── Info view ─────────────────────────────────────────────────────────────
  if (infoPlantId) {
    return (
      <PlantInfoModal
        plantId={infoPlantId}
        onBack={() => setInfoPlantId(null)}
        onClose={onClose}
      />
    );
  }

  const hasWarnings = rotationWarning || compatWarnings.length > 0;

  // ── Picker view ───────────────────────────────────────────────────────────
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-head">
        <h2 className="modal-title" id="modalTitle">Elegir una planta</h2>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>
      <p className="modal-sub">
        Parcela {cell.r + 1}–{cell.c + 1}&nbsp;·&nbsp;
        {season === 'summer' ? '☀️ Verano' : '❄️ Invierno'} {year}
      </p>

      {/* ── Warnings ── */}
      {hasWarnings && (
        <div className="modal-warnings">
          {rotationWarning && (
            <div className="warning-item warning-rot">
              <span className="warning-icon">↺</span>
              <span>
                <strong>Rotación:</strong> la temporada anterior había{' '}
                <strong>{rotationWarning.prevPlantName}</strong> aquí
                ({rotationWarning.familyLabel}). Considera cambiar de familia.
              </span>
            </div>
          )}
          {compatWarnings.map(p => (
            <div key={p.id} className="warning-item warning-compat">
              <span className="warning-icon">!</span>
              <span>
                <strong>Incompatibilidad:</strong> {p.emoji} <strong>{p.name}</strong>{' '}
                no es buena planta vecina para <strong>{currentPlant ? (findPlant(currentPlant)?.name ?? '') : ''}</strong>.
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Plant grid ── */}
      <div>
        {Object.entries(PLANTS).map(([cat, plants]) => (
          <div key={cat}>
            <div className="modal-cat-label">{cat}</div>
            <div className="plant-grid">
              {plants.map(p => (
                <div
                  key={p.id}
                  className={`plant-opt${p.id === currentPlant ? ' chosen' : ''}`}
                  onClick={() => onSelect(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onSelect(p.id)}
                >
                  <span className="plant-opt-emoji">{p.emoji}</span>
                  <span className="plant-opt-name">{p.name}</span>
                  {PLANT_INFO[p.id] && (
                    <button
                      className="plant-info-btn"
                      onClick={e => { e.stopPropagation(); setInfoPlantId(p.id); }}
                      aria-label={`Información sobre ${p.name}`}
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
        <label className="notes-label" htmlFor="cell-note">✎ Notas de esta parcela</label>
        <textarea
          id="cell-note"
          className="notes-input"
          value={localNote}
          onChange={e => handleNoteChange(e.target.value)}
          placeholder="Añade observaciones sobre esta parcela…"
          rows={3}
        />
      </div>

      {/* ── Footer ── */}
      <div className="modal-footer">
        <button className="btn-remove" onClick={onRemove} disabled={!currentPlant}>
          Quitar planta de esta parcela
        </button>
      </div>
    </div>
  );
}
