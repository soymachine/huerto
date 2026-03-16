import { findPlant } from '../data/plants';
import { CROP_FAMILY, FAMILY_COLOR, FAMILY_ABBR, FAMILY_LABEL } from '../data/cropFamilies';

export interface CellWarnings {
  rotation:       boolean;
  rotationDetail: string;
  compat:         boolean;
  compatDetail:   string;
  hasNote:        boolean;
}

interface Props {
  rows:            number;
  cols:            number;
  showFamilies:    boolean;
  getCell:         (r: number, c: number) => string | null;
  getCellWarnings: (r: number, c: number) => CellWarnings;
  onCellClick:     (cell: { r: number; c: number }) => void;
}

export default function Grid({ rows, cols, showFamilies, getCell, getCellWarnings, onCellClick }: Props) {
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

          const family      = plantId ? CROP_FAMILY[plantId] : null;
          const familyColor = showFamilies && family ? FAMILY_COLOR[family] : undefined;
          const familyAbbr  = showFamilies && family ? FAMILY_ABBR[family]  : undefined;
          const familyLabel = showFamilies && family ? FAMILY_LABEL[family] : undefined;

          return (
            <div
              key={`${r}-${c}`}
              className={`cell${plant ? ' has-plant' : ''}${showFamilies && family ? ' family-mode' : ''}`}
              style={familyColor ? { background: familyColor, borderColor: familyColor } : undefined}
              title={
                showFamilies && familyLabel
                  ? `${plant?.name ?? ''} · ${familyLabel}`
                  : plant ? plant.name : 'Haz clic para plantar algo aquí'
              }
              onClick={() => onCellClick({ r, c })}
            >
              {plant ? (
                <>
                  <span className="cell-emoji">{plant.emoji}</span>
                  {showFamilies && familyAbbr ? (
                    <span className="cell-family-abbr">{familyAbbr}</span>
                  ) : (
                    <span className="cell-name">{plant.name}</span>
                  )}
                </>
              ) : (
                <span className="cell-plus">+</span>
              )}

              {/* ── Warning / note badges ── */}
              {!showFamilies && (warnings.rotation || warnings.compat || warnings.hasNote) && (
                <div className="cell-badges">
                  {warnings.rotation && (
                    <span className="cbadge cbadge-rot" data-tooltip={warnings.rotationDetail}>↺</span>
                  )}
                  {warnings.compat && (
                    <span className="cbadge cbadge-compat" data-tooltip={warnings.compatDetail}>!</span>
                  )}
                  {warnings.hasNote && (
                    <span className="cbadge cbadge-note" data-tooltip="Esta parcela tiene notas">✎</span>
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
