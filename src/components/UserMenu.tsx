import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

interface Props { onLoginClick: () => void; }

export default function UserMenu({ onLoginClick }: Props) {
  const { user, signOut } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

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
          <button className="user-dropdown-btn" onClick={() => { signOut(); setOpen(false); }}>{t.signOut}</button>
        </div>
      )}
    </div>
  );
}
