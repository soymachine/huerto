// Supabase Edge Function — admin-backup
// Handles three actions:
//   users  → list all registered users with garden counts
//   export → dump all tables to JSON
//   import → restore from a previously exported JSON backup
//
// Auth: caller must be authenticated and their email must match the
// ADMIN_EMAIL environment variable set in the Supabase project.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_EMAIL      = Deno.env.get('ADMIN_EMAIL')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // ── Auth check ────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);
  if (user.email !== ADMIN_EMAIL)  return json({ error: 'Forbidden' }, 403);

  // ── Dispatch ──────────────────────────────────────────────────────────────
  const body   = await req.json().catch(() => ({}));
  const action = body.action as string;

  // ── users ─────────────────────────────────────────────────────────────────
  if (action === 'users') {
    const [{ data: authData }, { data: gardens }] = await Promise.all([
      sb.auth.admin.listUsers({ perPage: 1000 }),
      sb.from('gardens').select('user_id'),
    ]);

    const counts = (gardens ?? []).reduce<Record<string, number>>((acc, g) => {
      acc[g.user_id] = (acc[g.user_id] ?? 0) + 1;
      return acc;
    }, {});

    const users = (authData?.users ?? []).map(u => ({
      id:           u.id,
      email:        u.email ?? '—',
      created_at:   u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
      gardens:      counts[u.id] ?? 0,
    }));

    return json({ users });
  }

  // ── export ────────────────────────────────────────────────────────────────
  if (action === 'export') {
    const [
      { data: gardens },
      { data: plantings },
      { data: notes },
      { data: reminders },
      { data: authData },
    ] = await Promise.all([
      sb.from('gardens').select('*'),
      sb.from('plantings').select('*'),
      sb.from('notes').select('*'),
      sb.from('reminders').select('*'),
      sb.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    return json({
      version:     '1.0',
      exported_at: new Date().toISOString(),
      users:       (authData?.users ?? []).map(u => ({
        id: u.id, email: u.email, created_at: u.created_at,
      })),
      gardens:    gardens    ?? [],
      plantings:  plantings  ?? [],
      notes:      notes      ?? [],
      reminders:  reminders  ?? [],
    });
  }

  // ── import ────────────────────────────────────────────────────────────────
  if (action === 'import') {
    const backup = body.data as Record<string, unknown[]> | undefined;
    if (!backup) return json({ error: 'No data provided' }, 400);

    const results: Record<string, string> = {};

    const upsert = async (table: string, rows: unknown[], conflict: string) => {
      if (!rows?.length) { results[table] = 'skipped (empty)'; return; }
      const { error } = await sb.from(table).upsert(rows, { onConflict: conflict });
      results[table] = error ? `error: ${error.message}` : `${rows.length} rows`;
    };

    // Order matters: gardens before plantings/notes (FK constraint)
    await upsert('gardens',   backup.gardens   ?? [], 'id');
    await upsert('plantings', backup.plantings ?? [], 'id');
    await upsert('notes',     backup.notes     ?? [], 'id');
    await upsert('reminders', backup.reminders ?? [], 'user_id');

    return json({ ok: true, results });
  }

  // ── logs ──────────────────────────────────────────────────────────────────
  if (action === 'logs') {
    const { userId, page = 0, pageSize = 100 } = body as {
      userId?: string; page?: number; pageSize?: number;
    };
    if (!userId) return json({ error: 'userId required' }, 400);
    const from = page * pageSize;
    const to   = from + pageSize - 1;
    const { data, count } = await sb
      .from('logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);
    return json({ logs: data ?? [], total: count ?? 0, page, pageSize });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
});
