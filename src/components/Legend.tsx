import { findPlant } from '../data/plants';
import { useLang }   from '../context/LangContext';

interface Props { planted: string[]; }

export default function Legend({ planted }: Props) {
  const { t, lang } = useLang();
  const unique = [...new Set(planted)];
  return (
    <div className="legend">
      <span className="legend-label">{t.plantedThisSeason}</span>
      {unique.length === 0 ? (
        <span className="legend-chip">{t.nothingPlanted}</span>
      ) : (
        unique.map(id => {
          const p = findPlant(id);
          return p ? (
            <span key={id} className="legend-chip">{p.emoji} {lang === 'en' ? p.nameEn : p.name}</span>
          ) : null;
        })
      )}
    </div>
  );
}
