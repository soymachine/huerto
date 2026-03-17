import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getReminder, saveReminder } from '../lib/db';

interface Props { onLoginClick: () => void; }

export default function UserMenu({ onLoginClick }: Props) {
  const { user, signOut } = useAuth();
  const { t } = useLang();
  const [open,           setOpen]           = useState(false);
  const [reminderOn,     setReminderOn]     = useState(false);
  const [reminderLoaded, setReminderLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load reminder preference when dropdown opens
  useEffect(() => {
    if (!open || !user || reminderLoaded) return;
    getReminder(user.id).then(enabled => {
      setReminderOn(enabled);
      setReminderLoaded(true);
    });
  }, [open, user, reminderLoaded]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const toggleReminder = async () => {
    if (!user) return;
    const next = !reminderOn;
    setReminderOn(next);
    await saveReminder(user.id, user.email ?? '', next);
  };

  if (!user) {
    return <button className="user-login-btn" onClick={onLoginClick}>{t.signIn}</button>;
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-avatar" onClick={() => setOpen(v => !v)}>{initials}</button>
      {open && (
        <div className="user-dropdown">
          <span className="user-dropdown-email">{user.email}</span>
          <hr className="user-dropdown-divider" />
          <div className="reminder-row">
            <span className="reminder-label">📧 {t.monthlyReminder}</span>
            <button
              className={`reminder-toggle${reminderOn ? ' on' : ''}`}
              onClick={toggleReminder}
              title={t.reminderHint}
            >
              {reminderOn ? t.reminderOn : t.reminderOff}
            </button>
          </div>
          <hr className="user-dropdown-divider" />
          <button className="user-dropdown-btn" onClick={() => { signOut(); setOpen(false); }}>{t.signOut}</button>
        </div>
      )}
    </div>
  );
}
