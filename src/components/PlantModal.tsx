import { useState } from 'react';
import { PLANTS } from '../data/plants';
import { PLANT_INFO } from '../data/plantInfo';
import PlantInfoModal from './PlantInfoModal';
import type { Season } from '../lib/storage';

interface Props {
  cell: { r: number; c: number };
  season: Season;
  year: number;
  currentPlant: string | null;
  onSelect: (plantId: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function PlantModal({
  cell, season, year, currentPlant, onSelect, onRemove, onClose,
}: Props) {
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);

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
                    >
                      ℹ
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="modal-footer">
        <button
          className="btn-remove"
          onClick={onRemove}
          disabled={!currentPlant}
        >
          Quitar planta de esta parcela
        </button>
      </div>
    </div>
  );
}
