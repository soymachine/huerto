import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';

const SEEN_KEY = 'el-huerto-seen-landing';

export default function LandingOverlay() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setVisible(true);
    } catch {}
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
  };

  if (!visible) return null;

  return (
    <div className="landing-overlay" onClick={dismiss}>
      <div className="landing-card" onClick={e => e.stopPropagation()}>
        <div className="landing-icon">🌱</div>
        <h1 className="landing-title">{t.landingTitle}</h1>
        <p className="landing-subtitle">
          {t.landingSubtitle.split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 ? <br /> : null}</span>
          ))}
        </p>
        <div className="landing-features">
          <span>📅 Calendario de siembra</span>
          <span>↺ Rotación de cultivos</span>
          <span>🤝 Asociaciones entre plantas</span>
        </div>
        <button className="landing-btn" onClick={dismiss}>{t.landingStart}</button>
      </div>
    </div>
  );
}
