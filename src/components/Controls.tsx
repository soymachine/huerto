import { useState, useEffect } from 'react';
import type { Season } from '../lib/storage';
import { useLang } from '../context/LangContext';

interface Props {
  year: number; season: Season; cols: number; rows: number;
  onYearChange:   (y: number) => void;
  onSeasonChange: (s: Season) => void;
  onColsChange:   (c: number) => void;
  onRowsChange:   (r: number) => void;
}

export default function Controls({ year, season, cols, rows, onYearChange, onSeasonChange, onColsChange, onRowsChange }: Props) {
  const { t } = useLang();
  const [colsVal, setColsVal] = useState(String(cols));
  const [rowsVal, setRowsVal] = useState(String(rows));

  useEffect(() => setColsVal(String(cols)), [cols]);
  useEffect(() => setRowsVal(String(rows)), [rows]);

  const commitCols = () => { const n = parseInt(colsVal); const v = Math.max(1, Math.min(20, isNaN(n) ? cols : n)); setColsVal(String(v)); onColsChange(v); };
  const commitRows = () => { const n = parseInt(rowsVal); const v = Math.max(1, Math.min(30, isNaN(n) ? rows : n)); setRowsVal(String(v)); onRowsChange(v); };

  return (
    <div className="controls">
      <div className="ctrl-block">
        <span className="ctrl-label">{t.year}</span>
        <div className="year-row">
          <button className="year-btn" onClick={() => onYearChange(year - 1)}>−</button>
          <span className="year-val">{year}</span>
          <button className="year-btn" onClick={() => onYearChange(year + 1)}>+</button>
        </div>
      </div>
      <div className="ctrl-block">
        <span className="ctrl-label">{t.season}</span>
        <div className="season-row">
          <button className={`season-btn${season === 'summer' ? ' active' : ''}`} data-s="summer" onClick={() => onSeasonChange('summer')}>☀️ {t.summer}</button>
          <button className={`season-btn${season === 'winter' ? ' active' : ''}`} data-s="winter" onClick={() => onSeasonChange('winter')}>❄️ {t.winter}</button>
        </div>
      </div>
      <div className="ctrl-block">
        <span className="ctrl-label">{t.gridSize}</span>
        <div className="size-row">
          <div className="size-field">
            <span className="size-sublabel">{t.colLabel}</span>
            <input className="size-inp" type="number" value={colsVal} min={1} max={20} onChange={e => setColsVal(e.target.value)} onBlur={commitCols} onKeyDown={e => e.key === 'Enter' && commitCols()} />
          </div>
          <span className="size-x">×</span>
          <div className="size-field">
            <span className="size-sublabel">{t.rowLabel}</span>
            <input className="size-inp" type="number" value={rowsVal} min={1} max={30} onChange={e => setRowsVal(e.target.value)} onBlur={commitRows} onKeyDown={e => e.key === 'Enter' && commitRows()} />
          </div>
        </div>
      </div>
    </div>
  );
}
