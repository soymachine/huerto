import { findPlant } from '../data/plants';

interface Props {
  rows: number;
  cols: number;
  getCell: (r: number, c: number) => string | null;
  onCellClick: (cell: { r: number; c: number }) => void;
}

export default function Grid({ rows, cols, getCell, onCellClick }: Props) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${cols}, var(--cell-size))` }}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const plantId = getCell(r, c);
          const plant   = plantId ? findPlant(plantId) : null;
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
            </div>
          );
        })
      )}
    </div>
  );
}
