-- =====================================================================
-- DENYUTGLOBAL V2 - CLOUDFLARE D1 SQL MIGRATION
-- File: migrations/0001_initial_articles_d1.sql
-- Keterangan: Inisialisasi skema tabel artikel DenyutGlobal D1
-- =====================================================================

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content_json TEXT NOT NULL,          -- JSON Array: ["paragraf 1", "paragraf 2", ...]
  facts_json TEXT,                     -- JSON Array: ["fakta 1", "fakta 2", ...]
  why_it_matters TEXT,
  category TEXT NOT NULL,              -- 'dunia', 'politik', 'ekonomi', 'teknologi', 'sains', 'olahraga', 'bencana', 'indonesia'
  category_label TEXT NOT NULL,
  location TEXT,
  author TEXT NOT NULL DEFAULT 'Redaksi DenyutGlobal',
  published_at TEXT,                   -- ISO 8601 Timestamp: '2026-08-15T09:15:00Z'
  display_date TEXT NOT NULL,          -- '15 Agustus 2026'
  display_time TEXT NOT NULL,          -- '09:15 WIB'
  updated_at TEXT,
  corrected_at TEXT,
  correction_status TEXT DEFAULT 'none', -- 'none', 'corrected', 'updated', 'editorial_fix'
  correction_note TEXT,
  is_updated INTEGER DEFAULT 0,
  sources_json TEXT,                   -- JSON Array: [{ "name": "...", "url": "...", "date": "...", "notes": "..." }]
  source_urls_json TEXT,               -- JSON Array: ["https://..."]
  nama_sumber TEXT,
  url_sumber TEXT,
  image TEXT,                          -- URL / Base64 Data URL / SVG
  caption_gambar TEXT,
  image_type TEXT DEFAULT 'none',      -- 'ai_illustration', 'photo', 'none'
  image_credit TEXT,
  status TEXT NOT NULL DEFAULT 'draft',-- 'draft', 'review', 'approved', 'published'
  reviewed INTEGER NOT NULL DEFAULT 0, -- 1 (true) / 0 (false)
  editorial_revision_notes TEXT,
  approved_at TEXT,
  approved_by TEXT,
  fact_check_json TEXT,                -- JSON Objek FactCheckResult
  is_ai_generated_draft INTEGER DEFAULT 0,
  is_hero INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_breaking INTEGER DEFAULT 0,
  is_daily_brief INTEGER DEFAULT 0,
  brief_order INTEGER,
  read_time_minutes INTEGER DEFAULT 3,
  tags_json TEXT,                      -- JSON Array: ["tag1", "tag2"]
  is_editorial INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indeks Performa Query
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_reviewed ON articles(status, reviewed);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
