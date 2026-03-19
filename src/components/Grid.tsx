import { findPlant } from '../data/plants';
import { CROP_FAMILY, FAMILY_COLOR, FAMILY_ABBR } from '../data/cropFamilies';
import { useLang } from '../context/LangContext';

export interface CellWarnings {
  rotation:       boolean;
  rotationDetail: string;
  compat:         boolean;
  compatDetail:   string;
  noteText:       string;   // '' if no note
  dateText:       string;   // formatted 'dd mmm' or '' if no date
}

interface Props {
  rows:            number;
  cols:            number;
  showFamilies:    boolean;
  getCell:         (r: number, c: number) => string | null;
  getCellWarnings: (r: number, c: number) => CellWarnings;
  onCellClick:     (cell: { r: number; c: number }) => void;
}

const NOTE_PREVIEW_LEN = 80;

export default function Grid({ rows, cols, showFamilies, getCell, getCellWarnings, onCellClick }: Props) {
  const { lang, t } = useLang();
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
          const familyLabel = showFamilies && family ? (t.familyNames[family] ?? family) : undefined;
          const plantName   = plant ? (lang === 'en' ? (plant.nameEn ?? plant.name) : plant.name) : null;

          const noteTooltip = warnings.noteText.length > NOTE_PREVIEW_LEN
            ? warnings.noteText.slice(0, NOTE_PREVIEW_LEN) + '… (clic para ver más)'
            : warnings.noteText;

          return (
            <div
              key={`${r}-${c}`}
              className={`cell${plant ? ' has-plant' : ''}${showFamilies && family ? ' family-mode' : ''}`}
              style={familyColor ? { background: familyColor, borderColor: familyColor } : undefined}
              title={
                showFamilies && familyLabel
                  ? `${plantName ?? ''} · ${familyLabel}`
                  : plantName ?? t.clickToPlant
              }
              onClick={() => onCellClick({ r, c })}
            >
              {plant ? (
                <>
                  <span className="cell-emoji">{plant.emoji}</span>
                  {showFamilies && familyAbbr ? (
                    <span className="cell-family-abbr">{familyAbbr}</span>
                  ) : (
                    <span className="cell-name">{plantName}</span>
                  )}
                </>
              ) : (
                <span className="cell-plus">+</span>
              )}

              {/* ── Warning / note / date badges ── */}
              {!showFamilies && (warnings.rotation || warnings.compat || warnings.noteText || warnings.dateText) && (
                <div className="cell-badges">
                  {warnings.rotation && (
                    <span className="cbadge cbadge-rot" data-tooltip={warnings.rotationDetail}>↺</span>
                  )}
                  {warnings.compat && (
                    <span className="cbadge cbadge-compat" data-tooltip={warnings.compatDetail}>!</span>
                  )}
                  {warnings.noteText && (
                    <span className="cbadge cbadge-note" data-tooltip={noteTooltip}>✎</span>
                  )}
                  {warnings.dateText && (
                    <span className="cbadge cbadge-date" data-tooltip={warnings.dateText}>📅</span>
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
