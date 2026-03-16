import { findPlant } from '../data/plants';

export interface CellWarnings {
  rotation:       boolean;
  rotationDetail: string;   // e.g. "Tomate (Solanácea) estuvo aquí la temporada anterior"
  compat:         boolean;
  compatDetail:   string;   // e.g. "Incompatible con: Cebolla, Ajo"
  hasNote:        boolean;
}

interface Props {
  rows: number;
  cols: number;
  getCell:         (r: number, c: number) => string | null;
  getCellWarnings: (r: number, c: number) => CellWarnings;
  onCellClick:     (cell: { r: number; c: number }) => void;
}

export default function Grid({ rows, cols, getCell, getCellWarnings, onCellClick }: Props) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${cols}, var(--cell-size))` }}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const plantId  = getCell(r, c);
          const plant    = plantId ? findPlant(plantId) : null;
          const warnings = getCellWarnings(r, c);

          return (
            <div
              key={`${r}-${c}`}
              className={`cell${plant ? ' has-plant' : ''}`}
              title={plant ? plant.name : 'Haz clic para plantar algo aquí'}
              onClick={() => onCellClick({ r, c })}
            >
              {plant ? (
                <>
                  <span className="cell-emoji">{plant.emoji}</span>
                  <span className="cell-name">{plant.name}</span>
                </>
              ) : (
                <span className="cell-plus">+</span>
              )}

              {/* ── Warning / note badges ── */}
              {(warnings.rotation || warnings.compat || warnings.hasNote) && (
                <div className="cell-badges">
                  {warnings.rotation && (
                    <span
                      className="cbadge cbadge-rot"
                      data-tooltip={warnings.rotationDetail}
                    >↺</span>
                  )}
                  {warnings.compat && (
                    <span
                      className="cbadge cbadge-compat"
                      data-tooltip={warnings.compatDetail}
                    >!</span>
                  )}
                  {warnings.hasNote && (
                    <span
                      className="cbadge cbadge-note"
                      data-tooltip="Esta parcela tiene notas"
                    >✎</span>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
