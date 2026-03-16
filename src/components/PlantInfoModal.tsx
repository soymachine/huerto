import { findPlant } from '../data/plants';
import { PLANT_INFO, DIFFICULTY_LABEL } from '../data/plantInfo';

// 3-letter Spanish month abbreviations
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

interface Props {
  plantId: string;
  onBack: () => void;
  onClose: () => void;
}

interface RowProps {
  icon: string;
  label: string;
  months: number[];
  type: 'sow' | 'transplant' | 'harvest';
}

// Each row returns 13 siblings (label + 12 blocks) that live
// directly inside the parent CSS-grid — perfect alignment guaranteed.
function CalendarRow({ icon, label, months, type }: RowProps) {
  return (
    <>
      <span className="cal-label-cell">
        <span className="cal-icon">{icon}</span>
        <span className="cal-label-text">{label}</span>
      </span>
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className={`cal-block${months.includes(i + 1) ? ` cal-${type}` : ''}`}
          title={months.includes(i + 1) ? MONTHS[i] : undefined}
        />
      ))}
    </>
  );
}

export default function PlantInfoModal({ plantId, onBack, onClose }: Props) {
  const plant = findPlant(plantId);
  const info  = PLANT_INFO[plantId];

  if (!plant || !info) return null;

  const diffClass = ['', 'diff-easy', 'diff-mid', 'diff-hard'][info.difficulty];

  return (
    <div className="modal plant-info-modal" role="dialog" aria-modal="true">

      {/* ── Head ── */}
      <div className="modal-head">
        <button className="info-back-btn" onClick={onBack} aria-label="Volver al listado">
          ← Volver
        </button>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      {/* ── Hero ── */}
      <div className="plant-info-hero">
        <span className="plant-info-emoji" role="img" aria-label={plant.name}>
          {plant.emoji}
        </span>
        <div>
          <h2 className="plant-info-name">{plant.name}</h2>
          <span className={`difficulty-badge ${diffClass}`}>
            {DIFFICULTY_LABEL[info.difficulty]}
          </span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="plant-info-stats">
        <div className="stat-item">
          <span className="stat-label">Espaciado</span>
          <span className="stat-value">{info.spacing}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Profundidad</span>
          <span className="stat-value">{info.depth}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ciclo</span>
          <span className="stat-value">{info.duration}</span>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="plant-info-section">
        <h3 className="plant-info-section-title">Calendario</h3>

        {/*
          Single CSS grid: 1 label column + 12 month columns.
          CalendarRow returns fragments so each cell is a direct grid child.
        */}
        <div className="cal-table">

          {/* Month header */}
          <span className="cal-label-cell" aria-hidden="true" />
          {MONTHS.map((m, i) => (
            <span key={i} className="cal-month-hdr">{m}</span>
          ))}

          {/* Activity rows */}
          <CalendarRow
            icon="🌱" label="Siembra"
            months={info.sowMonths} type="sow"
          />
          {info.transplantMonths && (
            <CalendarRow
              icon="🪴" label="Trasplante"
              months={info.transplantMonths} type="transplant"
            />
          )}
          <CalendarRow
            icon="🧺" label="Cosecha"
            months={info.harvestMonths} type="harvest"
          />

        </div>
      </div>

      {/* ── Companions ── */}
      {info.companions.length > 0 && (
        <div className="plant-info-section">
          <h3 className="plant-info-section-title">Cultivos compañeros</h3>
          <div className="companion-pills">
            {info.companions.map(id => {
              const p = findPlant(id);
              return p ? (
                <span key={id} className="companion-pill companion">
                  {p.emoji} {p.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* ── Avoid ── */}
      {info.avoid.length > 0 && (
        <div className="plant-info-section">
          <h3 className="plant-info-section-title">Evitar junto a</h3>
          <div className="companion-pills">
            {info.avoid.map(id => {
              const p = findPlant(id);
              return p ? (
                <span key={id} className="companion-pill avoid">
                  {p.emoji} {p.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* ── Tip ── */}
      <div className="plant-tip">
        <span className="plant-tip-icon" role="img" aria-label="Consejo">💡</span>
        <p>{info.tip}</p>
      </div>

    </div>
  );
}
