import { useState, useCallback, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { findPlant } from '../data/plants';
import { useLang } from '../context/LangContext';

export interface CellWarnings {
  rotation:       boolean;
  rotationDetail: string;
  compat:         boolean;
  compatDetail:   string;
  good:           boolean;   // has compatible neighbor nearby
  goodDetail:     string;    // "✓ Buena asociación con: X, Y"
  noteText:       string;   // '' if no note
  dateText:       string;   // formatted 'dd mmm' or '' if no date
}

interface Props {
  rows:             number;
  cols:             number;
  showAssociations: boolean;
  getCell:          (r: number, c: number) => string | null;
  getCellWarnings:  (r: number, c: number) => CellWarnings;
  onCellClick:      (cell: { r: number; c: number }) => void;
  onCellMove?:      (from: { r: number; c: number }, to: { r: number; c: number }) => void;
  onInsertRow?:     (atRow: number) => void;
  onInsertCol?:     (atCol: number) => void;
}

interface TooltipState { text: string; x: number; y: number; }

const NOTE_PREVIEW_LEN = 80;
const TOOLTIP_PAD = 10; // min margin from viewport edges

function Badge({
  cls, label, tip, onShow, onHide,
}: {
  cls: string; label: string; tip: string;
  onShow: (t: TooltipState) => void;
  onHide: () => void;
}) {
  const handleEnter = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onShow({ text: tip, x: r.left + r.width / 2, y: r.top });
  }, [tip, onShow]);

  return (
    <span
      className={`cbadge ${cls}`}
      onMouseEnter={handleEnter}
      onMouseLeave={onHide}
    >{label}</span>
  );
}

function TooltipPortal({ tip }: { tip: TooltipState | null }) {
  if (!tip) return null;

  const TOOLTIP_W = 220;
  // Clamp x so tooltip stays within viewport
  const rawLeft = tip.x - TOOLTIP_W / 2;
  const left = Math.max(
    TOOLTIP_PAD,
    Math.min(rawLeft, window.innerWidth - TOOLTIP_W - TOOLTIP_PAD)
  );

  return createPortal(
    <div
      className="cbadge-tooltip-portal"
      style={{ top: tip.y - 8, left }}
    >
      {tip.text}
    </div>,
    document.body
  );
}

export default function Grid({ rows, cols, showAssociations, getCell, getCellWarnings, onCellClick, onCellMove, onInsertRow, onInsertCol }: Props) {
  const { lang, t } = useLang();
  const [tooltip,  setTooltip]  = useState<TooltipState | null>(null);
  const [dragSrc,  setDragSrc]  = useState<{ r: number; c: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ r: number; c: number } | null>(null);

  const showTip = useCallback((t: TooltipState) => setTooltip(t), []);
  const hideTip = useCallback(() => setTooltip(null), []);

  return (
    <>
      <div className="grid">
        {Array.from({ length: rows }, (_, r) => (
          <Fragment key={`row-${r}`}>
            <div className="grid-row">
              {Array.from({ length: cols }, (_, c) => {
                const plantId  = getCell(r, c);
                const plant    = plantId ? findPlant(plantId) : null;
                const warnings = getCellWarnings(r, c);

                const plantName = plant ? (lang === 'en' ? (plant.nameEn ?? plant.name) : plant.name) : null;

                const noteTooltip = warnings.noteText.length > NOTE_PREVIEW_LEN
                  ? warnings.noteText.slice(0, NOTE_PREVIEW_LEN) + '… (clic para ver más)'
                  : warnings.noteText;

                const isDragSrc  = dragSrc?.r  === r && dragSrc?.c  === c;
                const isDragOver = dragOver?.r === r && dragOver?.c === c;

                return (
                  <Fragment key={`cell-${r}-${c}`}>
                    <div
                      className={`cell${plant ? ' has-plant' : ''}${isDragSrc ? ' cell-drag-src' : ''}${isDragOver ? ' cell-drag-over' : ''}`}
                      title={plantName ?? t.clickToPlant}
                      draggable={!!plant && !!onCellMove}
                      onDragStart={plant && onCellMove ? (e) => {
                        setDragSrc({ r, c });
                        e.dataTransfer.effectAllowed = 'move';
                        hideTip();
                      } : undefined}
                      onDragOver={onCellMove ? (e) => {
                        if (!dragSrc || (dragSrc.r === r && dragSrc.c === c)) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setDragOver({ r, c });
                      } : undefined}
                      onDragLeave={onCellMove ? () => setDragOver(null) : undefined}
                      onDrop={onCellMove ? (e) => {
                        e.preventDefault();
                        if (dragSrc && (dragSrc.r !== r || dragSrc.c !== c)) {
                          onCellMove(dragSrc, { r, c });
                        }
                        setDragSrc(null);
                        setDragOver(null);
                      } : undefined}
                      onDragEnd={onCellMove ? () => {
                        setDragSrc(null);
                        setDragOver(null);
                      } : undefined}
                      onClick={() => { if (!dragSrc) onCellClick({ r, c }); }}
                    >
                      {plant ? (
                        <>
                          <span className="cell-emoji">{plant.emoji}</span>
                          <span className="cell-name">{plantName}</span>
                        </>
                      ) : (
                        <span className="cell-plus">+</span>
                      )}

                      {/* ── Warning / note / date badges ── */}
                      {((!showAssociations && (warnings.rotation || warnings.noteText || warnings.dateText)) || (showAssociations && (warnings.compat || warnings.good))) && (
                        <div className="cell-badges">
                          {!showAssociations && warnings.rotation && (
                            <Badge cls="cbadge-rot" label="↺" tip={warnings.rotationDetail} onShow={showTip} onHide={hideTip} />
                          )}
                          {showAssociations && warnings.compat && (
                            <Badge cls="cbadge-compat" label="!" tip={warnings.compatDetail} onShow={showTip} onHide={hideTip} />
                          )}
                          {showAssociations && warnings.good && (
                            <Badge cls="cbadge-good" label="✓" tip={warnings.goodDetail} onShow={showTip} onHide={hideTip} />
                          )}
                          {!showAssociations && warnings.noteText && (
                            <Badge cls="cbadge-note" label="✎" tip={noteTooltip} onShow={showTip} onHide={hideTip} />
                          )}
                          {!showAssociations && warnings.dateText && (
                            <Badge cls="cbadge-date" label="📅" tip={warnings.dateText} onShow={showTip} onHide={hideTip} />
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Col insert strip ── */}
                    {c < cols - 1 && onInsertCol && (
                      <div
                        className="col-insert-strip"
                        onClick={() => onInsertCol(c + 1)}
                        title={`Insertar columna aquí`}
                      >＋</div>
                    )}
                  </Fragment>
                );
              })}
            </div>

            {/* ── Row insert strip ── */}
            {r < rows - 1 && onInsertRow && (
              <div
                className="row-insert-strip"
                onClick={() => onInsertRow(r + 1)}
                title={`Insertar fila aquí`}
              >＋</div>
            )}
          </Fragment>
        ))}
      </div>
      <TooltipPortal tip={tooltip} />
    </>
  );
}
