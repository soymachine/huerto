import { useMemo } from 'react';
import { ALL_PLANTS } from '../data/plants';
import { PLANT_INFO } from '../data/plantInfo';
import { useLang } from '../context/LangContext';

interface Props {
  onClose: () => void;
}

export default function AssociationsTable({ onClose }: Props) {
  const { t, lang } = useLang();

  // Only plants that have PLANT_INFO data, sorted by Spanish name
  const plants = useMemo(() =>
    ALL_PLANTS
      .filter(p => PLANT_INFO[p.id])
      .sort((a, b) => a.name.localeCompare(b.name, 'es')),
  []);

  function getRelation(aId: string, bId: string): 'good' | 'bad' | 'self' | 'none' {
    if (aId === bId) return 'self';
    const aInfo = PLANT_INFO[aId];
    const bInfo = PLANT_INFO[bId];
    const isBad =
      aInfo?.avoid.includes(bId) ||
      bInfo?.avoid.includes(aId);
    if (isBad) return 'bad';
    const isGood =
      aInfo?.companions.includes(bId) ||
      bInfo?.companions.includes(aId);
    if (isGood) return 'good';
    return 'none';
  }

  return (
    <div className="assoc-table-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="assoc-table-modal">
        <div className="assoc-table-header">
          <h2 className="assoc-table-title">{t.assocTableTitle}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="assoc-table-legend">
          <span className="assoc-legend-item assoc-legend-good">■ {t.assocGood}</span>
          <span className="assoc-legend-item assoc-legend-bad">■ {t.assocBad}</span>
        </div>
        <div className="assoc-table-scroll">
          <table className="assoc-table">
            <thead>
              <tr>
                <th className="assoc-th-empty" />
                {plants.map(p => (
                  <th key={p.id} className="assoc-col-header">
                    <div className="assoc-col-label">
                      <span className="assoc-col-emoji">{p.emoji}</span>
                      <span className="assoc-col-name">{lang === 'en' ? (p.nameEn ?? p.name) : p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plants.map(rowPlant => (
                <tr key={rowPlant.id}>
                  <td className="assoc-row-header">
                    <span className="assoc-row-emoji">{rowPlant.emoji}</span>
                    <span className="assoc-row-name">{lang === 'en' ? (rowPlant.nameEn ?? rowPlant.name) : rowPlant.name}</span>
                  </td>
                  {plants.map(colPlant => {
                    const rel = getRelation(rowPlant.id, colPlant.id);
                    return (
                      <td
                        key={colPlant.id}
                        className={`assoc-cell assoc-cell-${rel}`}
                        title={
                          rel === 'good' ? `${rowPlant.name} + ${colPlant.name}: ${t.assocGood}` :
                          rel === 'bad'  ? `${rowPlant.name} + ${colPlant.name}: ${t.assocBad}` :
                          ''
                        }
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
