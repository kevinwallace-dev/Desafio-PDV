CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  dark_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  enable_signature BOOLEAN NOT NULL DEFAULT FALSE,
  profile_signature TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notifications_enabled_check CHECK (notifications_enabled IN (true, false)),
  CONSTRAINT dark_mode_enabled_check CHECK (dark_mode_enabled IN (true, false)),
  CONSTRAINT enable_signature_check CHECK (enable_signature IN (true, false))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_changed ON audit_logs (user_id, changed_at DESC);

INSERT INTO users (id) VALUES (1) ON CONFLICT DO NOTHING;
