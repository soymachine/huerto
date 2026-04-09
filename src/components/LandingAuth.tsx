import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const APP_URL = (import.meta.env.BASE_URL ?? '/huerto/').replace(/\/$/, '') + '/app/';

export default function LandingAuth() {
  const [open,     setOpen]     = useState(false);
  const [mode,     setMode]     = useState<'login' | 'register'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [ok,       setOk]       = useState('');
  const [user,     setUser]     = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const reset = () => { setError(''); setOk(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        window.location.href = APP_URL;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) { setError(error.message); return; }
        setOk('¡Cuenta creada! Revisa tu correo para confirmar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
  };

  return (
    <div className="lp-auth-wrap" ref={wrapRef}>
      {user ? (
        <>
          <a href={APP_URL} className="lp-btn-primary">Ir al huerto →</a>
          <button className="lp-btn-ghost" onClick={() => setOpen(v => !v)}>
            {user.split('@')[0]}
          </button>
        </>
      ) : (
        <button className="lp-btn-ghost" onClick={() => setOpen(v => !v)}>
          Iniciar sesión
        </button>
      )}

      {open && (
        <div className="lp-auth-panel">
          {user ? (
            <div className="lp-auth-user-info">
              <div style={{ fontSize: '2rem' }}>🌱</div>
              <div className="lp-auth-user-email">{user}</div>
              <a href={APP_URL} className="lp-auth-submit" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                Abrir el huerto
              </a>
              <button className="lp-auth-signout" onClick={signOut}>Cerrar sesión</button>
            </div>
          ) : (
            <>
              <h3>{mode === 'login' ? 'Acceder' : 'Crear cuenta'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="lp-auth-field">
                  <label>Correo electrónico</label>
                  <input
                    className="lp-auth-input"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); reset(); }}
                    required
                    autoFocus
                    placeholder="tu@correo.com"
                  />
                </div>
                <div className="lp-auth-field">
                  <label>Contraseña</label>
                  <input
                    className="lp-auth-input"
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); reset(); }}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                {error && <p className="lp-auth-error">{error}</p>}
                {ok    && <p className="lp-auth-ok">{ok}</p>}
                <button type="submit" className="lp-auth-submit" disabled={loading}>
                  {loading ? '…' : mode === 'login' ? 'Entrar' : 'Registrarse'}
                </button>
              </form>
              <div className="lp-auth-toggle">
                {mode === 'login' ? (
                  <>¿Sin cuenta? <button onClick={() => { setMode('register'); reset(); }}>Regístrate aquí</button></>
                ) : (
                  <>¿Ya tienes cuenta? <button onClick={() => { setMode('login'); reset(); }}>Inicia sesión</button></>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
