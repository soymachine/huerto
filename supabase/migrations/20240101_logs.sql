-- ─── Logs table ───────────────────────────────────────────────────────────────
-- Records every significant user action in the app.
-- Fire-and-forget inserts from the client; admin reads via service role.

CREATE TABLE IF NOT EXISTS logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id  uuid        REFERENCES gardens(id) ON DELETE SET NULL,
  action     text        NOT NULL,
  meta       jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fast lookup: user's logs newest-first, optionally filtered by garden
CREATE INDEX IF NOT EXISTS logs_user_created_idx  ON logs (user_id,  created_at DESC);
CREATE INDEX IF NOT EXISTS logs_garden_created_idx ON logs (garden_id, created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own log entries
CREATE POLICY "logs_insert_own" ON logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own logs (useful for future self-service audit)
CREATE POLICY "logs_select_own" ON logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role (used by the admin edge function) bypasses RLS automatically.
