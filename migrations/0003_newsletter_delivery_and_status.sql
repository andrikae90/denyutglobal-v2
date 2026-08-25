-- =====================================================================
-- MIGRATION 0003: PENYEMPURNAAN TABEL SUBSCRIBERS & LOG PENGIRIMAN NEWSLETTER
-- =====================================================================

-- 1. Pastikan kolom status, verifikasi, dan unsubscribe ada di tabel subscribers
-- (Catatan: SQLite D1 mendukung ALTER TABLE ADD COLUMN)
-- Kolom-kolom ini akan di-alter secara aman oleh runtime migration script jika tabel sudah ada.

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  subscribed_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  verification_token TEXT,
  verified_at TEXT,
  unsubscribe_token TEXT,
  unsubscribed_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_vtok ON subscribers(verification_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unstok ON subscribers(unsubscribe_token);

-- 2. Tabel Log Pengiriman Newsletter untuk Audit & Pencegahan Duplikasi
CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  subscriber_id TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'sent', 'failed', 'bounced', 'dry_run'
  sent_at TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(article_id, subscriber_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_deliveries_art_sub_unique ON newsletter_deliveries(article_id, subscriber_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_art_sub ON newsletter_deliveries(article_id, subscriber_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON newsletter_deliveries(status);
