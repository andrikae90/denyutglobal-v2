-- =====================================================================
-- MIGRATION 0002: TABEL SUBSCRIBERS UNTUK FITUR LANGGANAN DENYUTGLOBAL (D1)
-- =====================================================================

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
