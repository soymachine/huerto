import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminInner />
    </AuthProvider>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id:           string;
  email:        string;
  created_at:   string;
  last_sign_in: string | null;
  gardens:      number;
}

interface ImportResult {
  ok:      boolean;
  results: Record<string, string>;
}

// ─── Edge function call helper ────────────────────────────────────────────────

const ADMIN_EMAIL = import.meta.env.PUBLIC_ADMIN_EMAIL as string | undefined;
const FN_URL      = `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/admin-backup`;

async function callAdmin(action: string, extra?: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(FN_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...extra }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? data.message ?? `HTTP ${res.status}`);
  return data;
}

// ─── Date helper ─────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30)  return `hace ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months}m`;
  return `hace ${Math.floor(months / 12)}a`;
}

// ─── Inner app ────────────────────────────────────────────────────────────────

function AdminInner() {
  const { user, loading } = useAuth();
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [status,       setStatus]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [importing,    setImporting]    = useState(false);
  const [exporting,    setExporting]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email && ADMIN_EMAIL && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Load users on mount (once admin is confirmed)
  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  async function fetchUsers() {
    setLoadingUsers(true);
    setStatus(null);
    try {
      const { users: list } = await callAdmin('users');
      setUsers(list.sort((a: AdminUser, b: AdminUser) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (e: unknown) {
      setStatus({ msg: (e as Error).message, ok: false });
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setStatus(null);
    try {
      const data = await callAdmin('export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const ts   = new Date().toISOString().slice(0, 10);
      a.href     = url;
      a.download = `huerto-backup-${ts}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ msg: 'Backup exportado correctamente.', ok: true });
    } catch (e: unknown) {
      setStatus({ msg: (e as Error).message, ok: false });
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm(`¿Restaurar la base de datos desde "${file.name}"? Los datos existentes se sobreescribirán.`)) {
      e.target.value = '';
      return;
    }
    setImporting(true);
    setStatus(null);
    try {
      const text   = await file.text();
      const parsed = JSON.parse(text);
      const result: ImportResult = await callAdmin('import', { data: parsed });
      const summary = Object.entries(result.results)
        .map(([t, v]) => `${t}: ${v}`)
        .join(' · ');
      setStatus({ msg: `Restaurado. ${summary}`, ok: true });
      await fetchUsers();
    } catch (e: unknown) {
      setStatus({ msg: (e as Error).message, ok: false });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  // ── Auth states ────────────────────────────────────────────────────────────

  if (loading) {
    return <div style={s.page}><p style={s.muted}>Cargando…</p></div>;
  }

  if (!user) {
    return (
      <div style={s.page}>
        <p style={s.muted}>Debes iniciar sesión para acceder al panel de administración.</p>
        <a href={import.meta.env.BASE_URL || '/'} style={s.link}>← Volver al huerto</a>
      </div>
    );
  }

  if (!ADMIN_EMAIL) {
    return (
      <div style={s.page}>
        <p style={{ ...s.muted, color: '#B04A28' }}>
          La variable <code>PUBLIC_ADMIN_EMAIL</code> no está configurada en el build.
          Añade el secret <code>ADMIN_EMAIL</code> en GitHub y vuelve a lanzar el deploy del site.
        </p>
        <p style={{ ...s.muted, fontSize: '0.8rem', marginTop: 8 }}>
          Usuario actual: <strong>{user.email}</strong>
        </p>
        <a href={import.meta.env.BASE_URL || '/'} style={s.link}>← Volver al huerto</a>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return (
      <div style={s.page}>
        <p style={s.muted}>No tienes permisos para acceder a esta página.</p>
        <p style={{ ...s.muted, fontSize: '0.8rem', marginTop: 8 }}>
          Usuario actual: <strong>{user.email}</strong>
        </p>
        <a href={import.meta.env.BASE_URL || '/'} style={s.link}>← Volver al huerto</a>
      </div>
    );
  }

  // ── Admin panel ────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>

      {/* Header */}
      <header style={s.header}>
        <span style={s.headerTitle}>Admin</span>
        <span style={s.headerSep}>·</span>
        <span style={s.headerSub}>El Huerto</span>
        <div style={{ flex: 1 }} />
        <a href={import.meta.env.BASE_URL || '/'} style={s.link}>← Huerto</a>
      </header>

      {/* Status banner */}
      {status && (
        <div style={{ ...s.banner, background: status.ok ? '#dff0cc' : '#fde8e0', color: status.ok ? '#3a6020' : '#b04a28' }}>
          {status.msg}
        </div>
      )}

      {/* Users */}
      <section style={s.section}>
        <div style={s.sectionHead}>
          <h2 style={s.h2}>Usuarios {!loadingUsers && <span style={s.badge}>{users.length}</span>}</h2>
          <button style={s.btnGhost} onClick={fetchUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>

        {loadingUsers ? (
          <p style={s.muted}>Cargando usuarios…</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Email</th>
                  <th style={{ ...s.th, ...s.thNum }}>Huertos</th>
                  <th style={s.th}>Alta</th>
                  <th style={s.th}>Último acceso</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={s.tr}>
                    <td style={s.td}>{u.email}</td>
                    <td style={{ ...s.td, ...s.tdNum }}>{u.gardens}</td>
                    <td style={{ ...s.td, ...s.tdMuted }}>{fmt(u.created_at)}</td>
                    <td style={{ ...s.td, ...s.tdMuted }}>{relativeTime(u.last_sign_in)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} style={{ ...s.td, ...s.tdMuted }}>Sin usuarios.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Backup */}
      <section style={s.section}>
        <h2 style={s.h2}>Base de datos</h2>
        <div style={s.backupRow}>
          <button style={s.btnPrimary} onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exportando…' : '↓ Exportar backup'}
          </button>
          <button style={s.btnGhost} onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? 'Restaurando…' : '↑ Importar backup'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
        <p style={{ ...s.muted, fontSize: '0.78rem', marginTop: 10 }}>
          El backup incluye huertos, plantas, notas y recordatorios de todos los usuarios.
          La importación hace upsert (no borra filas existentes).
        </p>
      </section>

    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Lato', sans-serif",
    maxWidth: 820,
    margin: '0 auto',
    padding: '40px 24px 80px',
    color: '#2A2010',
    background: '#F5F0E4',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 36,
    borderBottom: '1.5px solid #C5B89A',
    paddingBottom: 16,
  },
  headerTitle: { fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', color: '#2A2010' },
  headerSep:   { color: '#C5B89A' },
  headerSub:   { fontSize: '1rem', color: '#7A6A50' },
  link:        { color: '#3A6020', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 },

  banner: {
    padding: '10px 16px',
    borderRadius: 6,
    marginBottom: 24,
    fontSize: '0.88rem',
    lineHeight: 1.5,
  },

  section: {
    marginBottom: 48,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 16,
  },
  h2: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7A6A50',
    margin: 0,
  },
  badge: {
    background: '#C5B89A',
    color: '#2A2010',
    borderRadius: 20,
    padding: '1px 8px',
    fontSize: '0.7rem',
    marginLeft: 6,
    fontWeight: 700,
  },

  tableWrap: {
    overflowX: 'auto' as const,
    borderRadius: 8,
    border: '1.5px solid #C5B89A',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.88rem',
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left' as const,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#7A6A50',
    background: '#EDE5D0',
    borderBottom: '1px solid #C5B89A',
  },
  thNum: { textAlign: 'right' as const },
  tr: {},
  td: {
    padding: '10px 16px',
    borderBottom: '1px solid #EDE5D0',
    verticalAlign: 'middle' as const,
  },
  tdMuted: { color: '#7A6A50' },
  tdNum:   { textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' },

  backupRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
    marginTop: 12,
  },
  btnPrimary: {
    padding: '9px 18px',
    background: '#3A6020',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnGhost: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#2A2010',
    border: '1.5px solid #C5B89A',
    borderRadius: 6,
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  muted: {
    color: '#7A6A50',
    fontSize: '0.9rem',
    margin: 0,
  },
};
