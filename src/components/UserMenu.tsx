import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onLoginClick: () => void;
}

export default function UserMenu({ onLoginClick }: Props) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) {
    return (
      <button className="user-login-btn" onClick={onLoginClick}>
        Iniciar sesión
      </button>
    );
  }

  const initials = (user.email ?? '??').slice(0, 2).toUpperCase();

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-avatar"
        onClick={() => setOpen(o => !o)}
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className="user-dropdown">
          <span className="user-dropdown-email">{user.email}</span>
          <hr className="user-dropdown-divider" />
          <button
            className="user-dropdown-btn"
            onClick={() => { signOut(); setOpen(false); }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
