import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose: () => void;
}

type Mode = 'login' | 'register';

const ERRORS: Record<string, string> = {
  'Invalid login credentials':   'Correo o contraseña incorrectos.',
  'Email not confirmed':         'Confirma tu correo antes de entrar.',
  'User already registered':     'Ya existe una cuenta con este correo.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
};

function friendlyError(msg: string): string {
  return ERRORS[msg] ?? msg;
}

export default function AuthModal({ onClose }: Props) {
  const { signIn, signUp } = useAuth();

  const [mode,     setMode]     = useState<Mode>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (error) { setError(friendlyError(error)); return; }

    if (mode === 'register') { setSuccess(true); return; }

    onClose(); // login successful — close modal
  };

  return (
    <div
      className="modal auth-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="authModalTitle"
    >
      {/* Header */}
      <div className="modal-head">
        <h2 className="modal-title" id="authModalTitle">
          {mode === 'login' ? 'Acceder al huerto' : 'Crear una cuenta'}
        </h2>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>
      <p className="modal-sub">
        {mode === 'login'
          ? 'Tus datos se guardan en la nube y puedes acceder desde cualquier dispositivo.'
          : 'Crea una cuenta gratuita para guardar el huerto en la nube de forma segura.'}
      </p>

      {/* Success state */}
      {success ? (
        <div className="auth-success">
          <span className="auth-success-icon">✉️</span>
          <p>Revisa tu correo y confirma la cuenta para empezar.</p>
          <button className="auth-submit" onClick={onClose}>Cerrar</button>
        </div>
      ) : (
        <>
          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">
                Correo electrónico
              </label>
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.es"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">
                Contraseña
              </label>
              <input
                id="auth-password"
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Un momento...'
                : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          {/* Switch mode */}
          <p className="auth-switch">
            {mode === 'login' ? (
              <>¿Sin cuenta aún?{' '}
                <button type="button" onClick={() => switchMode('register')}>
                  Regístrate aquí
                </button>
              </>
            ) : (
              <>¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => switchMode('login')}>
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
