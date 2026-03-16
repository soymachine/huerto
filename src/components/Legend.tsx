import { findPlant } from '../data/plants';

interface Props {
  planted: string[];
}

export default function Legend({ planted }: Props) {
  const unique = [...new Set(planted)];
  return (
    <div className="legend">
      <span className="legend-label">Plantado esta temporada:</span>
      {unique.length === 0 ? (
        <span className="legend-chip">Nada plantado aún</span>
      ) : (
        unique.map(id => {
          const p = findPlant(id);
          return p ? (
            <span key={id} className="legend-chip">{p.emoji} {p.name}</span>
          ) : null;
        })
      )}
    </div>
  );
}
