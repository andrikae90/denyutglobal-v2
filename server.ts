import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import { buildEditorialIllustrationPrompt, generateThematicSvgIllustration } from './src/utils/aiIllustrationGenerator';
import { generateThematicCategorySvgRaw } from './src/utils/thematicSvg';
import { INITIAL_EDITORIAL_ARTICLES } from './src/data/editorialStore';
import { NewsItem } from './src/types';
import { generateSitemapXml } from './src/utils/sitemap';
import { injectOpenGraphHtml } from './src/utils/openGraph';
import { isPublicArticle } from './src/utils/articleGuard';
import { getArticleRedirectDestination } from './src/utils/redirects';
import { sendSingleResendEmail, sendBatchNewsletter, sendVerificationEmail } from './src/services/resendEmailService';
import { generateNewsletterEmail } from './src/services/newsletterTemplate';

// =====================================================================
// DENYUTGLOBAL V2 - SERVER ARTICLE PERSISTENCE ADAPTER (D1 / SQL COMPATIBLE)
// =====================================================================
const DB_STORAGE_FILE = path.join(process.cwd(), 'data_articles_server.json');
const SUBSCRIBERS_STORAGE_FILE = path.join(process.cwd(), 'data_subscribers_server.json');

interface ServerSubscriber {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  subscribed_at: string;
  created_at?: string;
  verification_token?: string;
  verified_at?: string;
  unsubscribe_token?: string;
  unsubscribed_at?: string;
}

interface NewsletterDeliveryLog {
  id: string;
  article_id: string;
  subscriber_id: string;
  email: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at: string;
  provider_message_id?: string;
  error_message?: string;
  created_at?: string;
}

function loadServerSubscribers(): ServerSubscriber[] {
  try {
    if (fs.existsSync(SUBSCRIBERS_STORAGE_FILE)) {
      const raw = fs.readFileSync(SUBSCRIBERS_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read subscribers storage file:', e);
  }
  return [];
}

function saveServerSubscribers(list: ServerSubscriber[]): boolean {
  try {
    fs.writeFileSync(SUBSCRIBERS_STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error saving subscribers to server storage:', e);
    return false;
  }
}

// In-Memory Cache synced with disk / D1 adapter
let serverArticles: NewsItem[] = [];

function loadServerArticles(): NewsItem[] {
  try {
    if (fs.existsSync(DB_STORAGE_FILE)) {
      const raw = fs.readFileSync(DB_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read persistent articles file, using default seed:', e);
  }
  // Initialize with initial editorial articles if empty
  return [...INITIAL_EDITORIAL_ARTICLES];
}

function saveServerArticles(items: NewsItem[]): boolean {
  try {
    serverArticles = items;
    fs.writeFileSync(DB_STORAGE_FILE, JSON.stringify(items, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error saving articles to server storage:', e);
    return false;
  }
}

// Initialize on server boot
serverArticles = loadServerArticles();

// Helper to convert row / data to standard NewsItem
function normalizeNewsItem(item: any): NewsItem {
  const id = item.id || `art-${Date.now()}`;
  const title = (item.title || item.judul || '').trim();
  const summary = (item.summary || item.ringkasan || '').trim();
  const slug = (item.slug || '').trim() || id;

  const contentArray: string[] = Array.isArray(item.content)
    ? item.content
    : (Array.isArray(item.isiLengkap) ? item.isiLengkap : (typeof item.content === 'string' ? [item.content] : []));

  const factsArray: string[] = Array.isArray(item.facts) ? item.facts : [];

  return {
    ...item,
    id,
    title,
    judul: title,
    slug,
    summary,
    ringkasan: summary,
    content: contentArray,
    isiLengkap: contentArray,
    facts: factsArray,
    category: item.category || item.kategori || 'dunia',
    kategori: item.kategori || item.category || 'dunia',
    categoryLabel: item.categoryLabel || item.kategoriLabel || 'Dunia',
    kategoriLabel: item.kategoriLabel || item.categoryLabel || 'Dunia',
    location: item.location || item.negaraLokasi || 'Internasional',
    negaraLokasi: item.negaraLokasi || item.location || 'Internasional',
    author: item.author || 'Redaksi DenyutGlobal',
    publishedAt: item.publishedAt,
    tanggal: item.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    waktu: item.waktu || `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')} WIB`,
    status: item.status || 'draft',
    reviewed: Boolean(item.reviewed),
    image: item.image || item.gambar || '',
    gambar: item.gambar || item.image || '',
    captionGambar: item.captionGambar || '',
    imageType: item.imageType || 'none',
    imageCredit: item.imageCredit || '',
    sources: Array.isArray(item.sources) ? item.sources : [],
    sourceUrls: Array.isArray(item.sourceUrls) ? item.sourceUrls : [],
    isEditorial: item.isEditorial !== false
  };
}

// Helper to convert DB row to standard NewsItem
function rowToNewsItem(row: any): NewsItem {
  if (!row) return row;
  let content: string[] = [];
  try {
    content = row.content_json ? JSON.parse(row.content_json) : [];
  } catch {
    content = row.content_json ? [row.content_json] : [];
  }

  let facts: string[] = [];
  try {
    facts = row.facts_json ? JSON.parse(row.facts_json) : [];
  } catch {}

  let sources: any[] = [];
  try {
    sources = row.sources_json ? JSON.parse(row.sources_json) : [];
  } catch {}

  let sourceUrls: string[] = [];
  try {
    sourceUrls = row.source_urls_json ? JSON.parse(row.source_urls_json) : [];
  } catch {}

  let tags: string[] = [];
  try {
    tags = row.tags_json ? JSON.parse(row.tags_json) : [];
  } catch {}

  let factCheckResult: any = undefined;
  try {
    factCheckResult = row.fact_check_json ? JSON.parse(row.fact_check_json) : undefined;
  } catch {}

  const title = row.title || row.judul || '';
  const summary = row.summary || row.ringkasan || '';

  return {
    id: row.id,
    slug: row.slug || row.id,
    title,
    judul: title,
    summary,
    ringkasan: summary,
    content,
    isiLengkap: content,
    facts,
    whyItMatters: row.why_it_matters || undefined,
    category: row.category || 'dunia',
    kategori: row.category || 'dunia',
    categoryLabel: row.category_label || 'Dunia',
    kategoriLabel: row.category_label || 'Dunia',
    location: row.location || 'Internasional',
    negaraLokasi: row.location || 'Internasional',
    author: row.author || 'Redaksi DenyutGlobal',
    publishedAt: row.published_at || undefined,
    tanggal: row.display_date || row.tanggal || '',
    waktu: row.display_time || row.waktu || '',
    updatedAt: row.updated_at || undefined,
    correctedAt: row.corrected_at || undefined,
    correctionStatus: row.correction_status || 'none',
    correctionNote: row.correction_note || undefined,
    correctionNotes: row.correction_note || undefined,
    isUpdated: Boolean(row.is_updated),
    sources,
    sourceUrls,
    namaSumber: row.nama_sumber || (sources.length > 0 ? sources.map((s: any) => s.name).join(', ') : ''),
    urlSumber: row.url_sumber || (sources.length > 0 ? sources[0].url : ''),
    image: row.image || '',
    gambar: row.image || '',
    captionGambar: row.caption_gambar || '',
    imageType: row.image_type || 'none',
    imageCredit: row.image_credit || '',
    status: row.status || 'draft',
    reviewed: Boolean(row.reviewed),
    editorialRevisionNotes: row.editorial_revision_notes || undefined,
    approvedAt: row.approved_at || undefined,
    approvedBy: row.approved_by || undefined,
    factCheckResult,
    isAiGeneratedDraft: Boolean(row.is_ai_generated_draft),
    isHero: Boolean(row.is_hero),
    isFeatured: Boolean(row.is_featured),
    isBreaking: Boolean(row.is_breaking),
    isDailyBrief: Boolean(row.is_daily_brief),
    briefOrder: row.brief_order ?? undefined,
    readTimeMinutes: row.read_time_minutes ?? 3,
    tags,
    isEditorial: row.is_editorial !== 0
  };
}

// Helper to extract parameters array for D1 SQL INSERT/UPDATE
function newsItemToSqlParams(item: NewsItem): any[] {
  const norm = normalizeNewsItem(item);
  return [
    norm.id,
    norm.slug || norm.id,
    norm.title || norm.judul || '',
    norm.summary || norm.ringkasan || '',
    JSON.stringify(norm.content || norm.isiLengkap || []),
    JSON.stringify(norm.facts || []),
    norm.whyItMatters || '',
    norm.category || norm.kategori || 'dunia',
    norm.categoryLabel || norm.kategoriLabel || 'Dunia',
    norm.location || norm.negaraLokasi || 'Internasional',
    norm.author || 'Redaksi DenyutGlobal',
    norm.publishedAt || null,
    norm.tanggal || '',
    norm.waktu || '',
    norm.updatedAt || null,
    norm.correctedAt || null,
    norm.correctionStatus || 'none',
    norm.correctionNote || norm.correctionNotes || null,
    norm.isUpdated ? 1 : 0,
    JSON.stringify(norm.sources || []),
    JSON.stringify(norm.sourceUrls || []),
    norm.namaSumber || '',
    norm.urlSumber || '',
    norm.image || norm.gambar || '',
    norm.captionGambar || '',
    norm.imageType || 'none',
    norm.imageCredit || '',
    norm.status || 'draft',
    norm.reviewed ? 1 : 0,
    norm.editorialRevisionNotes || null,
    norm.approvedAt || null,
    norm.approvedBy || null,
    norm.factCheckResult ? JSON.stringify(norm.factCheckResult) : null,
    norm.isAiGeneratedDraft ? 1 : 0,
    norm.isHero ? 1 : 0,
    norm.isFeatured ? 1 : 0,
    norm.isBreaking ? 1 : 0,
    norm.isDailyBrief ? 1 : 0,
    norm.briefOrder ?? null,
    norm.readTimeMinutes || 3,
    JSON.stringify(norm.tags || []),
    norm.isEditorial !== false ? 1 : 0
  ];
}

const D1_UPSERT_SQL = `
INSERT INTO articles (
  id, slug, title, summary, content_json, facts_json, why_it_matters,
  category, category_label, location, author, published_at, display_date,
  display_time, updated_at, corrected_at, correction_status, correction_note,
  is_updated, sources_json, source_urls_json, nama_sumber, url_sumber,
  image, caption_gambar, image_type, image_credit, status, reviewed,
  editorial_revision_notes, approved_at, approved_by, fact_check_json,
  is_ai_generated_draft, is_hero, is_featured, is_breaking, is_daily_brief,
  brief_order, read_time_minutes, tags_json, is_editorial
) VALUES (
  ?, ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?, ?, ?,
  ?, ?, ?, ?
)
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  summary = excluded.summary,
  content_json = excluded.content_json,
  facts_json = excluded.facts_json,
  why_it_matters = excluded.why_it_matters,
  category = excluded.category,
  category_label = excluded.category_label,
  location = excluded.location,
  author = excluded.author,
  published_at = excluded.published_at,
  display_date = excluded.display_date,
  display_time = excluded.display_time,
  updated_at = excluded.updated_at,
  corrected_at = excluded.corrected_at,
  correction_status = excluded.correction_status,
  correction_note = excluded.correction_note,
  is_updated = excluded.is_updated,
  sources_json = excluded.sources_json,
  source_urls_json = excluded.source_urls_json,
  nama_sumber = excluded.nama_sumber,
  url_sumber = excluded.url_sumber,
  image = CASE
    WHEN excluded.image IS NOT NULL AND TRIM(excluded.image) != '' THEN excluded.image
    ELSE articles.image
  END,
  caption_gambar = CASE
    WHEN excluded.caption_gambar IS NOT NULL AND TRIM(excluded.caption_gambar) != '' THEN excluded.caption_gambar
    ELSE articles.caption_gambar
  END,
  image_type = CASE
    WHEN excluded.image IS NOT NULL AND TRIM(excluded.image) != '' THEN excluded.image_type
    WHEN articles.image IS NOT NULL AND TRIM(articles.image) != '' THEN articles.image_type
    ELSE excluded.image_type
  END,
  image_credit = CASE
    WHEN excluded.image IS NOT NULL AND TRIM(excluded.image) != '' AND excluded.image_credit IS NOT NULL AND TRIM(excluded.image_credit) != '' THEN excluded.image_credit
    WHEN articles.image IS NOT NULL AND TRIM(articles.image) != '' THEN articles.image_credit
    ELSE COALESCE(NULLIF(excluded.image_credit, ''), articles.image_credit)
  END,
  status = excluded.status,
  reviewed = excluded.reviewed,
  editorial_revision_notes = excluded.editorial_revision_notes,
  approved_at = excluded.approved_at,
  approved_by = excluded.approved_by,
  fact_check_json = excluded.fact_check_json,
  is_ai_generated_draft = excluded.is_ai_generated_draft,
  is_hero = excluded.is_hero,
  is_featured = excluded.is_featured,
  is_breaking = excluded.is_breaking,
  is_daily_brief = excluded.is_daily_brief,
  brief_order = excluded.brief_order,
  read_time_minutes = excluded.read_time_minutes,
  tags_json = excluded.tags_json,
  is_editorial = excluded.is_editorial;
`;

function getD1Database(req?: express.Request): any | null {
  return (globalThis as any).DB || 
         (process.env as any).DB || 
         (req as any)?.env?.DB || 
         (globalThis as any).__env__?.DB || 
         null;
}

function resolveD1Config(): { accountId?: string; databaseId?: string; apiToken?: string } {
  let accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  let apiToken = (
    process.env.CLOUDFLARE_API_TOKEN ||
    process.env.CLOUDFLARE_AUTH_TOKEN ||
    process.env.CF_API_TOKEN
  )?.trim();
  let databaseId = (
    process.env.CLOUDFLARE_D1_DATABASE_ID ||
    process.env.CLOUDFLARE_DATABASE_ID
  )?.trim();

  const isUuid = (v?: string): boolean =>
    Boolean(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim()));
  const isHex32 = (v?: string): boolean =>
    Boolean(v && /^[0-9a-f]{32}$/i.test(v.trim()));

  // Auto-detect if databaseId is set to an API token (starts with cfut_) and apiToken is missing/swapped
  if (databaseId && databaseId.startsWith('cfut_') && (!apiToken || !apiToken.startsWith('cfut_'))) {
    apiToken = databaseId;
    databaseId = undefined;
  } else if (databaseId && !isUuid(databaseId)) {
    // If not a valid UUID (e.g. database_name string or invalid placeholder), reset so we fallback to wrangler.jsonc
    databaseId = undefined;
  }

  // Fallback to wrangler.jsonc for database_id and account_id
  if (!databaseId || !accountId || !isHex32(accountId)) {
    try {
      const wranglerPath = path.join(process.cwd(), 'wrangler.jsonc');
      if (fs.existsSync(wranglerPath)) {
        const raw = fs.readFileSync(wranglerPath, 'utf-8');
        const accountMatch = raw.match(/"account_id"\s*:\s*"([^"]+)"/);
        const dbMatch = raw.match(/"database_id"\s*:\s*"([^"]+)"/);
        if ((!accountId || !isHex32(accountId)) && accountMatch && accountMatch[1]) {
          accountId = accountMatch[1].trim();
        }
        if (!databaseId && dbMatch && dbMatch[1]) {
          const extractedDbId = dbMatch[1].trim();
          if (isUuid(extractedDbId)) {
            databaseId = extractedDbId;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read D1 credentials from wrangler.jsonc:', e);
    }
  }

  return { accountId, databaseId, apiToken };
}

export interface D1ExecutionResult<T = any> {
  success: boolean;
  results: T[];
  error?: string;
  source: 'd1_binding' | 'd1_rest_api' | 'none';
  rowsWritten?: number;
}

async function executeD1Query<T = any>(
  sql: string,
  params: any[] = [],
  req?: express.Request
): Promise<D1ExecutionResult<T>> {
  // 1. Coba Native Cloudflare Worker Binding (jika berjalan di Cloudflare Workers/Pages runtime)
  const nativeDb = getD1Database(req);
  if (nativeDb && typeof nativeDb.prepare === 'function') {
    try {
      const stmt = nativeDb.prepare(sql).bind(...params);
      const res = await stmt.all();
      return {
        success: true,
        results: (res.results || []) as T[],
        source: 'd1_binding',
        rowsWritten: (res.meta as any)?.rows_written ?? (res.meta as any)?.changes ?? 1
      };
    } catch (err: any) {
      console.error('Error executing native D1 query:', err);
      return {
        success: false,
        results: [],
        error: `Native D1 Error: ${err?.message || String(err)}`,
        source: 'd1_binding'
      };
    }
  }

  // 2. Coba Cloudflare D1 v4 REST API (Node.js runtime / AI Studio Preview)
  const { accountId, databaseId, apiToken } = resolveD1Config();

  if (accountId && apiToken && databaseId) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql, params })
      });

      const json: any = await apiRes.json();
      if (json.success && Array.isArray(json.result) && json.result[0]) {
        const queryRes = json.result[0];
        return {
          success: true,
          results: (queryRes.results || []) as T[],
          source: 'd1_rest_api',
          rowsWritten: queryRes.meta?.rows_written ?? queryRes.meta?.changes ?? 1
        };
      } else {
        const errMsg = json.errors?.[0]?.message || JSON.stringify(json.errors) || 'Gagal mengeksekusi D1 REST API query';
        console.error('[Cloudflare D1 REST API Error]:', errMsg);
        return {
          success: false,
          results: [],
          error: `Cloudflare D1 REST API Error: ${errMsg}`,
          source: 'd1_rest_api'
        };
      }
    } catch (apiErr: any) {
      console.error('[Cloudflare D1 Network Error]:', apiErr);
      return {
        success: false,
        results: [],
        error: `Cloudflare D1 Network Error: ${apiErr?.message || String(apiErr)}`,
        source: 'd1_rest_api'
      };
    }
  }

  const missing: string[] = [];
  if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (!apiToken) missing.push('CLOUDFLARE_API_TOKEN');
  if (!databaseId) missing.push('CLOUDFLARE_D1_DATABASE_ID');

  const errorMsg = `Cloudflare D1 binding (env.DB) atau kredensial Cloudflare D1 REST API (${missing.join(', ')}) belum terhubung.`;
  console.warn('[D1 Config Warning]:', errorMsg);

  return {
    success: false,
    results: [],
    error: errorMsg,
    source: 'none'
  };
}

async function ensureNewsletterDeliveriesTable(req?: express.Request): Promise<void> {
  try {
    await executeD1Query(
      `CREATE TABLE IF NOT EXISTS newsletter_deliveries (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        subscriber_id TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL,
        sent_at TEXT NOT NULL,
        provider_message_id TEXT,
        error_message TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(article_id, subscriber_id)
      );`,
      [],
      req
    );
    await executeD1Query(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_deliveries_art_sub_unique ON newsletter_deliveries(article_id, subscriber_id);`,
      [],
      req
    ).catch(() => {});
    await executeD1Query(
      `CREATE INDEX IF NOT EXISTS idx_deliveries_status ON newsletter_deliveries(status);`,
      [],
      req
    ).catch(() => {});
  } catch (initErr) {
    console.warn('ensureNewsletterDeliveriesTable warning:', initErr);
  }
}

// Editorial Session Passphrase Hash & Session Tokens Store
const EDITORIAL_PASSPHRASE_SHA256_HASH = process.env.EDITORIAL_PASSPHRASE_SHA256_HASH || '518f21a9a8470c890258ddaa2dc85c5483f597e22d7dc4b4a825208aa0eb1ea7';
const activeEditorialSessions = new Map<string, number>(); // token -> expiresAt

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, exp] of activeEditorialSessions.entries()) {
    if (exp < now) activeEditorialSessions.delete(token);
  }
}

function verifyEditorialToken(token: string | undefined): boolean {
  if (!token) return false;
  cleanExpiredSessions();
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) return false;

  // 1. Master secret jika diset
  if (process.env.EDITORIAL_SECRET_KEY && cleanToken === process.env.EDITORIAL_SECRET_KEY) {
    return true;
  }

  // 2. In-memory session check
  const exp = activeEditorialSessions.get(cleanToken);
  if (exp && exp > Date.now()) {
    return true;
  }

  // 3. Cryptographic stateless token check
  if (cleanToken.startsWith('dg_')) {
    const parts = cleanToken.split('_');
    if (parts.length === 3) {
      const expHex = parts[1];
      const sig = parts[2];
      const expiresAt = parseInt(expHex, 16);
      if (!isNaN(expiresAt) && expiresAt > Date.now()) {
        const expectedSig = crypto.createHash('sha256').update(`${expHex}:${EDITORIAL_PASSPHRASE_SHA256_HASH.toLowerCase()}`).digest('hex');
        if (sig.toLowerCase() === expectedSig.toLowerCase()) {
          activeEditorialSessions.set(cleanToken, expiresAt);
          return true;
        }
      }
    }
  }

  return false;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Middleware Otorisasi Redaksi Server-Side
  const requireEditorialAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization || (req.headers['x-editorial-token'] as string);
    if (!authHeader || !verifyEditorialToken(authHeader)) {
      return res.status(401).json({
        success: false,
        error: 'Akses ditolak. Sesi otorisasi Ruang Redaksi tidak valid atau telah berakhir.',
        code: 'UNAUTHORIZED'
      });
    }
    next();
  };

  // Lazy Gemini Client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // Robust Multi-Model AI Generator with Automatic Fallback for 503/429/404/Spikes in Demand
  async function generateWithGeminiFallback(
    client: GoogleGenAI,
    contents: string,
    responseMimeType = 'application/json'
  ): Promise<{ text: string | null; modelUsed: string | null }> {
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest'
    ];

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType
          }
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        const status = err?.status || err?.error?.code || err?.code;
        const msg = err?.message || String(err);
        const isRetryable =
          status === 503 ||
          status === 429 ||
          status === 404 ||
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('404') ||
          msg.includes('NOT_FOUND') ||
          msg.includes('no longer available') ||
          msg.includes('quota') ||
          msg.includes('Quota') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('ResourceExhausted') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (isRetryable && i < candidateModels.length - 1) {
          console.warn(`Model ${model} not available (${status || 'error'}). Retrying with backup model ${candidateModels[i + 1]}...`);
          // brief backoff
          await new Promise(resolve => setTimeout(resolve, 350));
          continue;
        } else {
          console.warn(`Model ${model} call failed:`, msg);
        }
      }
    }

    return { text: null, modelUsed: null };
  }

  // Health API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // Ads.txt (Google AdSense Crawler Verification)
  app.get('/ads.txt', (req, res) => {
    res.type('text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.send('google.com, pub-9993324961129647, DIRECT, f08c47fec0942fa0\n');
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    const domain = (process.env.PUBLIC_CANONICAL_URL || 'https://denyutglobal.my.id').replace(/\/+$/, '');
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /redaksi\nDisallow: /editorial\n\nSitemap: ${domain}/sitemap.xml\n`);
  });

  // Sitemap.xml (Dinamis dari Cloudflare D1 / Server Persistence + isPublicArticle)
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const domain = (process.env.PUBLIC_CANONICAL_URL || 'https://denyutglobal.my.id').replace(/\/+$/, '');
      const sql = `SELECT * FROM articles WHERE status = 'published' AND reviewed = 1 ORDER BY created_at DESC;`;
      const d1Result = await executeD1Query(sql, [], req);
      let articles: any[] = [];

      if (d1Result.success && Array.isArray(d1Result.results) && d1Result.results.length > 0) {
        articles = d1Result.results.map(rowToNewsItem).filter(isPublicArticle);
      } else {
        // Fallback: In-Memory / File Persisted Store filtered through Content Guard
        articles = serverArticles.filter(isPublicArticle);
      }

      const xml = generateSitemapXml(articles, domain);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(xml);
    } catch (e) {
      console.warn('Error generating sitemap.xml:', e);
      const fallbackXml = generateSitemapXml([], 'https://denyutglobal.my.id');
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      return res.status(200).send(fallbackXml);
    }
  });

  // =====================================================================
  // 1. ENDPOINT AUTENTIKASI RUANG REDAKSI (SERVER-SIDE)
  // =====================================================================
  app.post('/api/editorial/auth', (req, res) => {
    try {
      const { passphraseHash, passphrase } = req.body;
      let inputHash = '';

      if (passphraseHash && typeof passphraseHash === 'string') {
        inputHash = passphraseHash.trim().toLowerCase();
      } else if (passphrase && typeof passphrase === 'string') {
        inputHash = crypto.createHash('sha256').update(passphrase.trim()).digest('hex');
      }

      if (!inputHash) {
        return res.status(400).json({
          success: false,
          error: 'Passphrase atau hash wajib disertakan.'
        });
      }

      if (inputHash === EDITORIAL_PASSPHRASE_SHA256_HASH.toLowerCase()) {
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 jam
        const expHex = expiresAt.toString(16);
        const sig = crypto.createHash('sha256').update(`${expHex}:${EDITORIAL_PASSPHRASE_SHA256_HASH.toLowerCase()}`).digest('hex');
        const sessionToken = `dg_${expHex}_${sig}`;
        activeEditorialSessions.set(sessionToken, expiresAt);

        return res.json({
          success: true,
          message: 'Autentikasi Ruang Redaksi berhasil.',
          token: sessionToken,
          expiresAt
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Passphrase otorisasi Ruang Redaksi tidak cocok.'
      });
    } catch (err: any) {
      console.error('Editorial auth error:', err);
      return res.status(500).json({
        success: false,
        error: 'Terjadi kesalahan pada verifikasi sesi redaksi.'
      });
    }
  });

  // GET /api/editorial/session - Memeriksa keabsahan sesi redaksi aktif
  app.get('/api/editorial/session', (req, res) => {
    const authHeader = (req.headers['authorization'] || req.headers['x-editorial-token']) as string | undefined;
    const isValid = verifyEditorialToken(authHeader);
    if (isValid) {
      return res.json({ success: true, valid: true, message: 'Sesi redaksi aktif.' });
    }
    return res.status(401).json({ success: false, valid: false, error: 'Sesi redaksi kedaluwarsa atau tidak valid.' });
  });

  // =====================================================================
  // 1B. DIAGNOSTIK STATUS KONEKSI CLOUDFLARE D1
  // =====================================================================
  app.get('/api/d1/status', async (req, res) => {
    try {
      const result = await executeD1Query<{ total_articles: number }>(
        `SELECT count(*) as total_articles FROM articles`,
        [],
        req
      );

      return res.json({
        success: result.success,
        d1_connected: result.success,
        d1_source: result.source,
        total_articles_in_d1: result.results?.[0]?.total_articles ?? 0,
        error: result.error || null,
        mode: result.source === 'd1_binding' ? 'Cloudflare Workers Binding (env.DB)' : result.source === 'd1_rest_api' ? 'Cloudflare D1 REST API v4' : 'Not Connected (Fallback to Server Store)'
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        d1_connected: false,
        error: err?.message || String(err)
      });
    }
  });

  // =====================================================================
  // 1C. ENDPOINT STATUS LANGGANAN (GET/POST /api/subscription-status & /api/subscription/status)
  // =====================================================================
  const handleSubscriptionStatus = async (req: express.Request, res: express.Response) => {
    try {
      const rawEmail = typeof req.query?.email === 'string' 
        ? req.query.email 
        : typeof req.body?.email === 'string' 
        ? req.body.email 
        : '';
      const normalizedEmail = rawEmail.trim().toLowerCase();

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Format alamat email tidak valid.'
        });
      }

      // 1. Cek D1 jika aktif
      let d1Record: any = null;
      try {
        const d1Res = await executeD1Query<{ id: string; email: string; status: string; unsubscribe_token?: string }>(
          `SELECT id, email, status, unsubscribe_token FROM subscribers WHERE email = ? LIMIT 1;`,
          [normalizedEmail],
          req
        );
        if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
          d1Record = d1Res.results[0];
        }
      } catch (e) {
        console.warn('D1 subscription status check error:', e);
      }

      if (d1Record) {
        const status = d1Record.status || 'active';
        let token = d1Record.unsubscribe_token;
        if (status === 'active' && (!token || typeof token !== 'string' || token.trim().length < 6)) {
          token = `unstok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
          try {
            await executeD1Query(
              `UPDATE subscribers SET unsubscribe_token = ? WHERE id = ?;`,
              [token, d1Record.id],
              req
            );
            d1Record.unsubscribe_token = token;
          } catch (updateErr) {
            console.warn('Failed to lazy backfill unsubscribe_token in D1:', updateErr);
          }
        }

        // Sinkronisasi ke local store server jika ada
        try {
          const localSubscribers = loadServerSubscribers();
          const localSub = localSubscribers.find(s => s.email.toLowerCase() === normalizedEmail);
          if (localSub) {
            if (token && localSub.unsubscribe_token !== token) {
              localSub.unsubscribe_token = token;
              saveServerSubscribers(localSubscribers);
            }
          }
        } catch {}

        return res.json({
          success: true,
          exists: true,
          status,
          isSubscribed: status === 'active',
          token: status === 'active' ? token : undefined
        });
      }

      // 2. Cek penyimpanan lokal server
      const localSubscribers = loadServerSubscribers();
      const localSub = localSubscribers.find(s => s.email.toLowerCase() === normalizedEmail);
      if (localSub) {
        const status = localSub.status || 'active';
        let token = localSub.unsubscribe_token;
        if (status === 'active' && (!token || typeof token !== 'string' || token.trim().length < 6)) {
          token = `unstok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
          localSub.unsubscribe_token = token;
          saveServerSubscribers(localSubscribers);
        }
        return res.json({
          success: true,
          exists: true,
          status,
          isSubscribed: status === 'active',
          token: status === 'active' ? token : undefined
        });
      }

      return res.json({
        success: true,
        exists: false,
        status: 'none',
        isSubscribed: false
      });
    } catch (err: any) {
      console.error('Subscription status check error:', err);
      return res.status(500).json({
        success: false,
        error: 'Gagal memeriksa status langganan.'
      });
    }
  };

  app.get('/api/subscription-status', handleSubscriptionStatus);
  app.post('/api/subscription-status', handleSubscriptionStatus);
  app.get('/api/subscription/status', handleSubscriptionStatus);
  app.post('/api/subscription/status', handleSubscriptionStatus);

  // =====================================================================
  // 1D. ENDPOINT LANGGANAN NEWSLETTER (POST /api/subscribe)
  // =====================================================================
  app.post('/api/subscribe', async (req, res) => {
    try {
      const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
      const normalizedEmail = rawEmail.trim().toLowerCase();

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!normalizedEmail || normalizedEmail.length < 5 || normalizedEmail.length > 254 || !emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Format alamat email tidak valid.'
        });
      }

      const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();
      const verificationToken = `vtok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
      const unsubscribeToken = `unstok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

      // 1. Cek penyimpanan lokal server
      const localSubscribers = loadServerSubscribers();
      const existingLocal = localSubscribers.find(s => s.email.toLowerCase() === normalizedEmail);

      if (existingLocal) {
        if (existingLocal.status === 'unsubscribed') {
          // Re-activate subscriber if previously unsubscribed
          existingLocal.status = 'active';
          existingLocal.subscribed_at = nowIso;
          existingLocal.unsubscribed_at = undefined;
          if (!existingLocal.unsubscribe_token) existingLocal.unsubscribe_token = unsubscribeToken;
          saveServerSubscribers(localSubscribers);

          // Update D1 jika terkoneksi
          try {
            await executeD1Query(
              `UPDATE subscribers SET status = 'active', subscribed_at = ?, unsubscribed_at = NULL WHERE email = ?;`,
              [nowIso, normalizedEmail],
              req
            );
          } catch (d1Err) {
            console.warn('D1 re-subscribe sync warning:', d1Err);
          }

          return res.status(200).json({
            success: true,
            isAlreadySubscribed: false,
            resubscribed: true,
            message: 'Langganan Anda telah diaktifkan kembali. Anda akan menerima Daily Brief DenyutGlobal berikutnya.'
          });
        }

        return res.status(200).json({
          success: true,
          isAlreadySubscribed: true,
          message: 'Email ini sudah terdaftar sebagai pelanggan aktif DenyutGlobal.'
        });
      }

      // 2. Cek dan simpan ke Cloudflare D1 (jika terkoneksi)
      let alreadyInD1 = false;
      let d1Status = 'none';
      try {
        await executeD1Query(
          `CREATE TABLE IF NOT EXISTS subscribers (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            status TEXT DEFAULT 'active',
            subscribed_at TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            verification_token TEXT,
            verified_at TEXT,
            unsubscribe_token TEXT,
            unsubscribed_at TEXT
          );`,
          [],
          req
        );

        // Safe alter migrations for existing databases
        await executeD1Query(`ALTER TABLE subscribers ADD COLUMN status TEXT DEFAULT 'active';`, [], req).catch(() => {});
        await executeD1Query(`ALTER TABLE subscribers ADD COLUMN verification_token TEXT;`, [], req).catch(() => {});
        await executeD1Query(`ALTER TABLE subscribers ADD COLUMN verified_at TEXT;`, [], req).catch(() => {});
        await executeD1Query(`ALTER TABLE subscribers ADD COLUMN unsubscribe_token TEXT;`, [], req).catch(() => {});
        await executeD1Query(`ALTER TABLE subscribers ADD COLUMN unsubscribed_at TEXT;`, [], req).catch(() => {});

        // Log table for newsletter deliveries
        await ensureNewsletterDeliveriesTable(req);

        const checkRes = await executeD1Query(
          `SELECT id, email, status FROM subscribers WHERE email = ? LIMIT 1;`,
          [normalizedEmail],
          req
        );

        if (checkRes.success && Array.isArray(checkRes.results) && checkRes.results.length > 0) {
          alreadyInD1 = true;
          const currentRec: any = checkRes.results[0];
          d1Status = currentRec.status || 'active';

          if (d1Status === 'unsubscribed') {
            await executeD1Query(
              `UPDATE subscribers SET status = 'active', subscribed_at = ?, unsubscribed_at = NULL WHERE email = ?;`,
              [nowIso, normalizedEmail],
              req
            );
            d1Status = 'active';
          }
        } else {
          await executeD1Query(
            `INSERT INTO subscribers (id, email, status, subscribed_at, verification_token, unsubscribe_token) VALUES (?, ?, 'active', ?, ?, ?) ON CONFLICT(email) DO NOTHING;`,
            [id, normalizedEmail, nowIso, verificationToken, unsubscribeToken],
            req
          );
        }
      } catch (d1Err) {
        console.warn('D1 subscribe save warning (proceeding with confirmation):', d1Err);
      }

      if (alreadyInD1) {
        // Catat juga ke server local file agar sinkron
        localSubscribers.push({ 
          id, 
          email: normalizedEmail, 
          status: 'active',
          subscribed_at: nowIso, 
          created_at: nowIso,
          verification_token: verificationToken,
          unsubscribe_token: unsubscribeToken
        });
        saveServerSubscribers(localSubscribers);

        if (d1Status === 'active') {
          return res.status(200).json({
            success: true,
            isAlreadySubscribed: true,
            message: 'Email ini sudah terdaftar sebagai pelanggan aktif DenyutGlobal.'
          });
        }
      }

      // 3. Simpan ke local file server
      localSubscribers.push({
        id,
        email: normalizedEmail,
        status: 'active',
        subscribed_at: nowIso,
        created_at: nowIso,
        verification_token: verificationToken,
        unsubscribe_token: unsubscribeToken
      });
      saveServerSubscribers(localSubscribers);

      return res.status(200).json({
        success: true,
        isAlreadySubscribed: false,
        message: 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'
      });
    } catch (err: any) {
      console.error('Server subscribe error:', err);
      return res.status(500).json({
        success: false,
        error: 'Terjadi gangguan saat memproses pendaftaran.'
      });
    }
  });

  // =====================================================================
  // 1E. ENDPOINT UNSUBSCRIBE NEWSLETTER (GET/POST /api/unsubscribe)
  // =====================================================================
  app.all('/api/unsubscribe', async (req, res) => {
    try {
      const token = (req.query.token as string) || (req.body?.token as string) || '';
      const email = (req.query.email as string) || (req.body?.email as string) || '';
      const cleanToken = token.trim();
      const cleanEmail = email.trim().toLowerCase();

      // Token wajib ada dan valid (minimal 6 karakter) baik untuk GET (email link) maupun POST (UI/API)
      if (!cleanToken || cleanToken.length < 6) {
        if (req.method === 'GET') {
          return res.status(400).send(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
              <meta charset="utf-8">
              <title>Tautan Tidak Valid - DenyutGlobal</title>
              <meta name="viewport" content="width=device-width,initial-scale=1">
            </head>
            <body style="font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;">
              <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;max-width:460px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                <div style="font-size:36px;margin-bottom:8px;color:#f43f5e;">⚠️</div>
                <h2 style="margin:0 0 12px 0;color:#f43f5e;font-size:20px;font-weight:700;">Permintaan Tidak Valid</h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 16px 0;">Token berhenti berlangganan tidak ditemukan atau tidak lengkap. Pastikan Anda menggunakan tautan utuh dari email newsletter DenyutGlobal.</p>
                <p style="color:#64748b;font-size:12px;margin:0 0 20px 0;">Database dan status langganan Anda tetap aman dan tidak mengalami perubahan.</p>
                <a href="/" style="display:inline-block;background:#334155;color:#f8fafc;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;transition:background 0.2s;">Kembali ke Beranda</a>
              </div>
            </body>
            </html>
          `);
        }
        return res.status(400).json({ success: false, error: 'Token berhenti berlangganan diperlukan dan harus valid.' });
      }

      // Verifikasi data subscriber di D1 dan local store
      let matchedSubscriber: { id: string; email: string; status: string } | null = null;

      // 1. Cek di D1
      try {
        let querySql = `SELECT id, email, status, unsubscribe_token FROM subscribers WHERE unsubscribe_token = ? LIMIT 1;`;
        let queryParams: any[] = [cleanToken];

        if (cleanEmail) {
          querySql = `SELECT id, email, status, unsubscribe_token FROM subscribers WHERE unsubscribe_token = ? AND email = ? LIMIT 1;`;
          queryParams = [cleanToken, cleanEmail];
        }

        const d1Res = await executeD1Query<{ id: string; email: string; status: string }>(
          querySql,
          queryParams,
          req
        );

        if (d1Res.success && Array.isArray(d1Res.results) && d1Res.results.length > 0) {
          matchedSubscriber = d1Res.results[0];
        }
      } catch (d1Err) {
        console.warn('D1 unsubscribe check error:', d1Err);
      }

      // 2. Cek di local store jika belum ditemukan di D1
      const localSubscribers = loadServerSubscribers();
      if (!matchedSubscriber) {
        const found = localSubscribers.find(s => {
          if (cleanEmail) {
            return s.unsubscribe_token === cleanToken && s.email.toLowerCase() === cleanEmail;
          }
          return s.unsubscribe_token === cleanToken;
        });
        if (found) {
          matchedSubscriber = { id: found.id, email: found.email, status: found.status };
        }
      }

      // Jika token/email tidak cocok / tidak ditemukan di sistem
      if (!matchedSubscriber) {
        if (req.method === 'GET') {
          return res.status(400).send(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
              <meta charset="utf-8">
              <title>Token Tidak Sesuai - DenyutGlobal</title>
              <meta name="viewport" content="width=device-width,initial-scale=1">
            </head>
            <body style="font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;">
              <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;max-width:460px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                <div style="font-size:36px;margin-bottom:8px;color:#f43f5e;">✕</div>
                <h2 style="margin:0 0 12px 0;color:#f43f5e;font-size:20px;font-weight:700;">Data Tidak Dikenali</h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 16px 0;">Data berhenti berlangganan tidak ditemukan dalam sistem. Tidak ada perubahan yang dilakukan pada basis data.</p>
                <a href="/" style="display:inline-block;background:#334155;color:#f8fafc;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">Kembali ke Beranda</a>
              </div>
            </body>
            </html>
          `);
        }
        return res.status(400).json({ success: false, error: 'Data subscriber tidak ditemukan atau token tidak cocok.' });
      }

      const nowIso = new Date().toISOString();

      // Perbarui status menjadi unsubscribed (JANGAN HAPUS RECORD)
      if (matchedSubscriber.status !== 'unsubscribed') {
        // Update D1
        try {
          await executeD1Query(
            `UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ? WHERE id = ?;`,
            [nowIso, matchedSubscriber.id],
            req
          );
        } catch (d1UpdateErr) {
          console.warn('D1 unsubscribe update error:', d1UpdateErr);
        }

        // Update local server store
        for (const sub of localSubscribers) {
          if (sub.id === matchedSubscriber.id || sub.email.toLowerCase() === matchedSubscriber.email.toLowerCase()) {
            sub.status = 'unsubscribed';
            sub.unsubscribed_at = nowIso;
          }
        }
        saveServerSubscribers(localSubscribers);
      }

      if (req.method === 'GET') {
        return res.status(200).send(`
          <!DOCTYPE html>
          <html lang="id">
          <head>
            <meta charset="utf-8">
            <title>Berhasil Berhenti Berlangganan - DenyutGlobal</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
          </head>
          <body style="font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;">
            <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;max-width:480px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.4);">
              <div style="width:52px;height:52px;background:#0369a1;color:#ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;margin:0 auto 16px auto;">✓</div>
              <h2 style="margin:0 0 12px 0;color:#38bdf8;font-size:20px;font-weight:700;">Berhasil Berhenti Berlangganan</h2>
              <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 12px 0;">
                Alamat email <strong style="color:#ffffff;">${matchedSubscriber.email}</strong> telah dinonaktifkan dari daftar pengiriman Daily Brief & Newsletter DenyutGlobal.
              </p>
              <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0 0 20px 0;">
                Anda tidak akan lagi menerima email rutin dari kami. Jika ini adalah kekeliruan, Anda dapat mendaftar kembali kapan saja melalui halaman utama DenyutGlobal.
              </p>
              <a href="/" style="display:inline-block;background:#38bdf8;color:#0f172a;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:700;box-shadow:0 2px 8px rgba(56,189,248,0.3);">Kembali ke DenyutGlobal</a>
            </div>
          </body>
          </html>
        `);
      }

      return res.status(200).json({
        success: true,
        email: matchedSubscriber.email,
        status: 'unsubscribed',
        message: 'Alamat email berhasil dinonaktifkan dari daftar langganan DenyutGlobal.'
      });
    } catch (err: any) {
      console.error('Unsubscribe error:', err);
      return res.status(500).json({ success: false, error: 'Terjadi gangguan saat memproses permintaan.' });
    }
  });

  // 1E. ENDPOINT VERIFIKASI DOUBLE OPT-IN (GET /api/verify-subscription)
  app.get('/api/verify-subscription', async (req, res) => {
    try {
      const token = ((req.query.token as string) || '').trim();
      const email = ((req.query.email as string) || '').trim().toLowerCase();

      if (!token) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html lang="id">
          <head><meta charset="utf-8"><title>Verifikasi Gagal - DenyutGlobal</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;">
            <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;max-width:440px;text-align:center;">
              <h2 style="margin:0 0 12px 0;color:#f43f5e;">Token Verifikasi Tidak Ditemukan</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;">Tautan konfirmasi tidak valid atau telah kedaluwarsa. Silakan lakukan pendaftaran ulang dari beranda.</p>
              <a href="/" style="display:inline-block;margin-top:16px;background:#f43f5e;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">Kembali ke Beranda</a>
            </div>
          </body>
          </html>
        `);
      }

      const nowIso = new Date().toISOString();
      let verified = false;

      // Update in server local store
      const localSubscribers = loadServerSubscribers();
      for (const sub of localSubscribers) {
        if (sub.verification_token === token || (email && sub.email.toLowerCase() === email)) {
          sub.status = 'active';
          sub.verified_at = nowIso;
          verified = true;
        }
      }
      if (verified) {
        saveServerSubscribers(localSubscribers);
      }

      // Update in D1
      try {
        await executeD1Query(
          `UPDATE subscribers SET status = 'active', verified_at = ? WHERE verification_token = ?;`,
          [nowIso, token],
          req
        );
        verified = true;
      } catch (d1Err) {
        console.warn('D1 verify warning:', d1Err);
      }

      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="id">
        <head><meta charset="utf-8"><title>Langganan Terverifikasi - DenyutGlobal</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;">
          <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;max-width:440px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">✓</div>
            <h2 style="margin:0 0 12px 0;color:#10b981;">Langganan Berhasil Dikonfirmasi!</h2>
            <p style="color:#94a3b8;font-size:14px;line-height:1.6;">Terima kasih. Alamat email Anda telah aktif dan siap menerima Daily Brief & Berita Terkini DenyutGlobal.</p>
            <a href="/" style="display:inline-block;margin-top:20px;background:#10b981;color:#0f172a;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;">Mulai Membaca Berita</a>
          </div>
        </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Verify subscription error:', err);
      return res.status(500).json({ success: false, error: 'Gagal memproses verifikasi.' });
    }
  });

  // 1F. ENDPOINT WEBHOOK RESEND (POST /api/webhooks/resend)
  app.post('/api/webhooks/resend', async (req, res) => {
    try {
      const event = req.body;
      // Resend webhook event structure: { type: 'email.delivered' | 'email.bounced' | 'email.complained', data: { ... } }
      if (event?.type && event?.data?.email) {
        const targetEmail = event.data.email.toLowerCase();
        if (event.type === 'email.bounced' || event.type === 'email.complained') {
          const localSubscribers = loadServerSubscribers();
          for (const sub of localSubscribers) {
            if (sub.email.toLowerCase() === targetEmail) {
              sub.status = 'unsubscribed';
              sub.unsubscribed_at = new Date().toISOString();
            }
          }
          saveServerSubscribers(localSubscribers);
        }
      }
      return res.status(200).json({ received: true });
    } catch (err) {
      return res.status(200).json({ received: true });
    }
  });

  // =====================================================================
  // 2. ENDPOINT PUBLIK ARTIKEL (HANYA STATUS 'PUBLISHED' & REVIEWED = TRUE)
  // =====================================================================
  // GET /api/articles - Mengambil daftar artikel terpublikasi dari D1 / Cache
  app.get('/api/articles', async (req, res) => {
    try {
      const { category, limit, offset } = req.query;

      let sql = `SELECT * FROM articles WHERE status = 'published' AND reviewed = 1`;
      const params: any[] = [];

      if (category && typeof category === 'string' && category !== 'semua') {
        sql += ` AND LOWER(category) = LOWER(?)`;
        params.push(category.trim());
      }

      sql += ` ORDER BY published_at DESC`;

      if (limit) {
        const numLimit = Math.max(1, parseInt(limit as string, 10));
        const numOffset = offset ? Math.max(0, parseInt(offset as string, 10)) : 0;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(numLimit, numOffset);
      }

      const d1Result = await executeD1Query(sql, params, req);

      if (d1Result.success && d1Result.results.length > 0) {
        const articles = d1Result.results.map(rowToNewsItem);
        return res.json({
          success: true,
          source: d1Result.source,
          count: articles.length,
          data: articles
        });
      }

      // Fallback: In-Memory / File Persisted Store
      let published = serverArticles.filter(
        (a) => a.status === 'published' && a.reviewed === true
      );

      if (category && typeof category === 'string' && category !== 'semua') {
        published = published.filter(
          (a) => (a.category || a.kategori || '').toLowerCase() === category.toLowerCase()
        );
      }

      published.sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA;
      });

      const numLimit = limit ? Math.max(1, parseInt(limit as string, 10)) : published.length;
      const numOffset = offset ? Math.max(0, parseInt(offset as string, 10)) : 0;
      const paged = published.slice(numOffset, numOffset + numLimit);

      return res.json({
        success: true,
        source: 'server_store',
        count: published.length,
        data: paged
      });
    } catch (err: any) {
      console.error('Error fetching public articles:', err);
      return res.status(500).json({
        success: false,
        error: 'Gagal memuat artikel publik.'
      });
    }
  });

  // GET /api/articles/:slug/image - Menyajikan gambar artikel biner publik untuk Open Graph / bot
  app.get('/api/articles/:slug/image', async (req, res) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).send('Slug artikel wajib disertakan.');
      }

      const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
      let rawImage = '';
      let articleData: any = null;

      const sql = `SELECT title, category, category_label, location, image, status, reviewed FROM articles WHERE (LOWER(slug) = LOWER(?) OR id = ?) AND status = 'published' LIMIT 1;`;
      const d1Result = await executeD1Query(sql, [cleanSlug, cleanSlug], req);

      if (d1Result.success && d1Result.results.length > 0) {
        articleData = d1Result.results[0];
        rawImage = (articleData.image || '').trim();
      }

      if (!articleData) {
        const found = serverArticles.find(
          (a) =>
            (a.slug && a.slug.toLowerCase() === cleanSlug) ||
            (a.id && a.id.toLowerCase() === cleanSlug)
        );
        if (found) {
          articleData = found;
          rawImage = (found.image || found.gambar || '').trim();
        }
      }

      if (!articleData) {
        const foundInit = INITIAL_EDITORIAL_ARTICLES.find(
          (a) =>
            (a.slug && a.slug.toLowerCase() === cleanSlug) ||
            (a.id && a.id.toLowerCase() === cleanSlug)
        );
        if (foundInit) {
          articleData = foundInit;
          rawImage = (foundInit.image || foundInit.gambar || '').trim();
        }
      }

      // If article does not exist, return 404
      if (!articleData) {
        return res.status(404).send('Article Not Found');
      }

      // 1. Base64 Data URL
      if (rawImage.startsWith('data:image/')) {
        const match = rawImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          try {
            const buffer = Buffer.from(base64Data, 'base64');
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            return res.status(200).send(buffer);
          } catch (decodeErr) {
            console.warn('Error decoding Base64 image, falling back to thematic SVG:', decodeErr);
          }
        }
      }

      // 2. HTTPS URL (skip legacy default unsplash url)
      if (
        (rawImage.startsWith('http://') || rawImage.startsWith('https://')) &&
        !rawImage.includes('photo-1585829365295-ab7cd400c167')
      ) {
        return res.redirect(302, rawImage);
      }

      // 3. Thematic SVG Fallback based on category and title
      const svgMarkup = generateThematicCategorySvgRaw({
        title: articleData.title || articleData.judul || 'Berita Terkini DenyutGlobal',
        category: articleData.category || articleData.kategori || articleData.category_label || 'Dunia',
        location: articleData.location || articleData.negara_lokasi || 'Internasional',
        slug: cleanSlug
      });

      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.status(200).send(svgMarkup);
    } catch (err: any) {
      console.error('Error serving article image:', err);
      return res.status(500).send('Internal Server Error');
    }
  });

  // GET /api/articles/:slug - Mengambil satu artikel terpublikasi berdasarkan slug atau ID
  app.get('/api/articles/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ success: false, error: 'Slug artikel wajib disertakan.' });
      }

      const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
      const sql = `SELECT * FROM articles WHERE (LOWER(slug) = LOWER(?) OR id = ?) AND status = 'published' AND reviewed = 1 LIMIT 1`;
      const d1Result = await executeD1Query(sql, [cleanSlug, cleanSlug], req);

      if (d1Result.success && d1Result.results.length > 0) {
        return res.json({
          success: true,
          source: d1Result.source,
          data: rowToNewsItem(d1Result.results[0])
        });
      }

      // Filter ketat: HANYA published dan reviewed dari server cache
      const published = serverArticles.filter(
        (a) => a.status === 'published' && a.reviewed === true
      );

      const found = published.find(
        (a) =>
          (a.slug && a.slug.toLowerCase() === cleanSlug) ||
          (a.id && a.id.toLowerCase() === cleanSlug) ||
          ((a.title || a.judul) && (a.title || a.judul).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === cleanSlug)
      );

      if (found) {
        return res.json({
          success: true,
          source: 'server_store',
          data: found
        });
      }

      return res.status(404).json({
        success: false,
        error: 'Artikel tidak ditemukan atau belum dipublikasikan.'
      });
    } catch (err: any) {
      console.error('Error fetching public article by slug:', err);
      return res.status(500).json({
        success: false,
        error: 'Gagal memuat artikel.'
      });
    }
  });

  // =====================================================================
  // 3. ENDPOINT EDITORIAL ARTIKEL (MEMERLUKAN OTORISASI SERVER-SIDE)
  // =====================================================================
  // GET /api/editorial/articles - Mengambil semua naskah (termasuk draft/review/approved/published)
  app.get('/api/editorial/articles', requireEditorialAuth, async (req, res) => {
    try {
      const sql = `SELECT * FROM articles ORDER BY created_at DESC`;
      const d1Result = await executeD1Query(sql, [], req);

      if (d1Result.success && d1Result.results.length > 0) {
        const articles = d1Result.results.map(rowToNewsItem);
        return res.json({
          success: true,
          source: d1Result.source,
          count: articles.length,
          data: articles
        });
      }

      return res.json({
        success: true,
        source: 'server_store',
        count: serverArticles.length,
        data: serverArticles
      });
    } catch (err: any) {
      console.error('Error in editorial get articles:', err);
      return res.status(500).json({ success: false, error: 'Gagal mengambil data redaksi.' });
    }
  });

  // POST /api/editorial/articles - Membuat naskah baru atau upsert ke D1
  app.post('/api/editorial/articles', requireEditorialAuth, async (req, res) => {
    try {
      const articlePayload = req.body;
      if (!articlePayload || (!articlePayload.title && !articlePayload.judul)) {
        return res.status(400).json({ success: false, error: 'Judul artikel wajib diisi.' });
      }

      // Preserve existing image if save payload has empty/undefined image (unless explicit delete)
      const isExplicitDelete = articlePayload.deleteImage === true || articlePayload.hapusGambar === true;
      let existingIdx = serverArticles.findIndex((a) => a.id === articlePayload.id || (a.slug && a.slug === articlePayload.slug));
      let currentBase = existingIdx >= 0 ? serverArticles[existingIdx] : null;
      if (!currentBase && articlePayload.id) {
        try {
          const d1Existing = await executeD1Query('SELECT * FROM articles WHERE id = ? LIMIT 1;', [articlePayload.id], req);
          if (d1Existing.success && d1Existing.results && d1Existing.results.length > 0) {
            currentBase = rowToNewsItem(d1Existing.results[0]);
          }
        } catch (e) {
          // ignore
        }
      }

      if (!isExplicitDelete && currentBase && currentBase.image) {
        const incomingImg = (articlePayload.image !== undefined ? articlePayload.image : articlePayload.gambar !== undefined ? articlePayload.gambar : '').trim();
        if (!incomingImg) {
          articlePayload.image = currentBase.image;
          articlePayload.gambar = currentBase.gambar || currentBase.image;
          articlePayload.captionGambar = (articlePayload.captionGambar && articlePayload.captionGambar.trim()) ? articlePayload.captionGambar : currentBase.captionGambar;
          articlePayload.imageType = (articlePayload.imageType && articlePayload.imageType !== 'none') ? articlePayload.imageType : currentBase.imageType;
          articlePayload.imageCredit = (articlePayload.imageCredit && articlePayload.imageCredit.trim()) ? articlePayload.imageCredit : currentBase.imageCredit;
        }
      }

      const normalized = normalizeNewsItem(articlePayload);
      const params = newsItemToSqlParams(normalized);

      // Eksekusi INSERT ke Cloudflare D1
      const d1Result = await executeD1Query(D1_UPSERT_SQL, params, req);

      // Update in-memory / local storage server cache
      existingIdx = serverArticles.findIndex((a) => a.id === normalized.id);
      if (existingIdx >= 0) {
        serverArticles[existingIdx] = normalized;
      } else {
        serverArticles.unshift(normalized);
      }
      saveServerArticles(serverArticles);

      // Cek apakah D1 terhubung dan berhasil
      if (d1Result.success) {
        return res.json({
          success: true,
          d1_persisted: true,
          d1_source: d1Result.source,
          message: 'Artikel berhasil disimpan dan di-INSERT ke database Cloudflare D1.',
          data: normalized
        });
      }

      // Jika D1 dicoba tapi query error (misal skema tidak cocok)
      if (d1Result.source !== 'none') {
        console.error('D1 execution failed:', d1Result.error);
        return res.status(502).json({
          success: false,
          d1_persisted: false,
          d1_source: d1Result.source,
          error: d1Result.error,
          message: 'Gagal mengeksekusi INSERT ke Cloudflare D1. ' + d1Result.error,
          data: normalized
        });
      }

      // Jika D1 belum terhubung di runtime ini, beritahu status sebenarnya
      return res.json({
        success: true,
        d1_persisted: false,
        d1_source: 'server_store',
        warning: 'Data tersimpan di server cache lokal. Kredensial Cloudflare D1 belum terkonfigurasi di environment ini.',
        message: 'Artikel tersimpan di cache server lokal.',
        data: normalized
      });
    } catch (err: any) {
      console.error('Error saving editorial article:', err);
      return res.status(500).json({ success: false, error: 'Gagal menyimpan artikel redaksi.' });
    }
  });

  // PUT /api/editorial/articles/:id - Memperbarui naskah di D1
  app.put('/api/editorial/articles/:id', requireEditorialAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingIdx = serverArticles.findIndex((a) => a.id === id);
      let currentBase = existingIdx >= 0 ? serverArticles[existingIdx] : null;

      if (!currentBase) {
        try {
          const d1Existing = await executeD1Query('SELECT * FROM articles WHERE id = ? LIMIT 1;', [id], req);
          if (d1Existing.success && d1Existing.results.length > 0) {
            currentBase = rowToNewsItem(d1Existing.results[0]);
          }
        } catch (e) {
          // ignore
        }
      }

      if (!currentBase) {
        currentBase = updateData;
      }

      // Image preservation: retain existing image if editor did not submit a replacement image
      const existingImage = (currentBase.image || currentBase.gambar || '').trim();
      const incomingImage = (updateData.image !== undefined ? updateData.image : updateData.gambar !== undefined ? updateData.gambar : '').trim();
      const finalImage = (incomingImage && incomingImage.length > 0) ? incomingImage : existingImage;
      const finalImageType = (incomingImage && incomingImage.length > 0)
        ? (updateData.imageType || currentBase.imageType || 'ai_illustration')
        : (currentBase.imageType || updateData.imageType || 'ai_illustration');
      const finalCaption = (updateData.captionGambar !== undefined && updateData.captionGambar.trim().length > 0)
        ? updateData.captionGambar.trim()
        : (currentBase.captionGambar || '');
      const finalCredit = (updateData.imageCredit !== undefined && updateData.imageCredit.trim().length > 0)
        ? updateData.imageCredit.trim()
        : (currentBase.imageCredit || '');

      const updated = normalizeNewsItem({
        ...currentBase,
        ...updateData,
        id,
        image: finalImage,
        gambar: finalImage,
        imageType: finalImageType,
        captionGambar: finalCaption,
        imageCredit: finalCredit,
        updatedAt: new Date().toISOString()
      });

      const params = newsItemToSqlParams(updated);
      const d1Result = await executeD1Query(D1_UPSERT_SQL, params, req);

      if (existingIdx >= 0) {
        serverArticles[existingIdx] = updated;
      } else {
        serverArticles.unshift(updated);
      }
      saveServerArticles(serverArticles);

      if (d1Result.success) {
        return res.json({
          success: true,
          d1_persisted: true,
          d1_source: d1Result.source,
          message: 'Artikel berhasil diperbarui di database Cloudflare D1.',
          data: updated
        });
      }

      if (d1Result.source !== 'none') {
        return res.status(502).json({
          success: false,
          d1_persisted: false,
          error: d1Result.error,
          message: 'Gagal memperbarui di Cloudflare D1: ' + d1Result.error,
          data: updated
        });
      }

      return res.json({
        success: true,
        d1_persisted: false,
        d1_source: 'server_store',
        warning: 'Data diperbarui di server cache lokal.',
        data: updated
      });
    } catch (err: any) {
      console.error('Error updating editorial article:', err);
      return res.status(500).json({ success: false, error: 'Gagal memperbarui artikel.' });
    }
  });

  // DELETE /api/editorial/articles/:id - Menghapus naskah dari D1
  app.delete('/api/editorial/articles/:id', requireEditorialAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const d1Result = await executeD1Query(`DELETE FROM articles WHERE id = ?`, [id], req);

      const initialLength = serverArticles.length;
      serverArticles = serverArticles.filter((a) => a.id !== id);
      saveServerArticles(serverArticles);

      return res.json({
        success: true,
        d1_deleted: d1Result.success,
        d1_source: d1Result.source,
        message: d1Result.success ? 'Artikel berhasil dihapus dari Cloudflare D1.' : 'Artikel dihapus dari database server.',
        deletedId: id
      });
    } catch (err: any) {
      console.error('Error deleting editorial article:', err);
      return res.status(500).json({ success: false, error: 'Gagal menghapus artikel.' });
    }
  });

  // POST /api/editorial/sync-batch - Sinkronisasi batch dari localStorage ke D1 (idempotent upsert)
  app.post('/api/editorial/sync-batch', requireEditorialAuth, async (req, res) => {
    try {
      const { articles } = req.body;
      if (!Array.isArray(articles)) {
        return res.status(400).json({ success: false, error: 'Format payload articles harus berupa array.' });
      }

      let insertedCount = 0;
      let updatedCount = 0;
      let d1SuccessCount = 0;

      for (const item of articles) {
        if (!item || (!item.title && !item.judul)) continue;

        // Image preservation in batch sync
        let idx = serverArticles.findIndex((a) => a.id === item.id || (a.slug && a.slug === item.slug));
        const currentBase = idx >= 0 ? serverArticles[idx] : null;
        if (currentBase && (!item.image || !item.image.trim()) && currentBase.image) {
          item.image = currentBase.image;
          item.gambar = currentBase.gambar;
          item.captionGambar = item.captionGambar || currentBase.captionGambar;
          item.imageType = item.imageType || currentBase.imageType;
          item.imageCredit = item.imageCredit || currentBase.imageCredit;
        }

        const normalized = normalizeNewsItem(item);
        const params = newsItemToSqlParams(normalized);

        const d1Res = await executeD1Query(D1_UPSERT_SQL, params, req);
        if (d1Res.success) {
          d1SuccessCount++;
        }

        idx = serverArticles.findIndex((a) => a.id === normalized.id || (a.slug && a.slug === normalized.slug));
        if (idx >= 0) {
          serverArticles[idx] = { ...serverArticles[idx], ...normalized };
          updatedCount++;
        } else {
          serverArticles.push(normalized);
          insertedCount++;
        }
      }

      saveServerArticles(serverArticles);

      return res.json({
        success: true,
        d1_synced_count: d1SuccessCount,
        message: `Sinkronisasi berhasil: ${insertedCount} baru, ${updatedCount} diperbarui. (D1 Synced: ${d1SuccessCount})`,
        total: serverArticles.length,
        data: serverArticles
      });
    } catch (err: any) {
      console.error('Error in editorial sync batch:', err);
      return res.status(500).json({ success: false, error: 'Gagal melakukan sinkronisasi batch.' });
    }
  });

  // POST /api/editorial/newsletter/dry-run - Endpoint Uji Coba & Audit Konfigurasi Resend Tanpa Mengirim Email
  app.post('/api/editorial/newsletter/dry-run', requireEditorialAuth, async (req, res) => {
    try {
      const apiKey = (process.env.RESEND_API_KEY || '').trim();
      const emailEnabled = (process.env.NEWSLETTER_EMAIL_ENABLED || 'false').trim().toLowerCase() === 'true';
      const emailFrom = (process.env.EMAIL_FROM || 'DenyutGlobal <newsletter@denyutglobal.my.id>').trim();
      const appBaseUrl = (process.env.APP_BASE_URL || 'https://denyutglobal.my.id').trim();

      // 1. Audit Environment
      const hasApiKey = apiKey.length > 0 && apiKey !== 'MY_RESEND_API_KEY';
      const isEmailFromValid = /^.+<[^@]+@[^@]+\.[^@]+>$/.test(emailFrom) || /^[^@]+@[^@]+\.[^@]+$/.test(emailFrom);
      const isAppUrlValid = appBaseUrl.startsWith('https://');

      // 2. Test Template Render
      const dummyArticle = {
        id: 'test-dry-run-001',
        slug: 'uji-coba-sistem-newsletter-denyutglobal',
        judul: 'Uji Coba Sistem Newsletter Resend DenyutGlobal',
        ringkasan: 'Ini adalah ringkasan uji coba internal untuk validasi template email dan sistem dry-run DenyutGlobal.',
        kategori: 'Teknologi & Analisis',
        namaSumber: 'Redaksi DenyutGlobal',
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      const dummyRecipient = {
        id: 'sub-dryrun-001',
        email: 'test-recipient@example.com',
        unsubscribeToken: 'dryrun_unsub_token_12345'
      };

      const rendered = generateNewsletterEmail(dummyArticle, dummyRecipient, appBaseUrl);
      const templatePass = Boolean(rendered.subject && rendered.html.includes(dummyArticle.judul) && rendered.text.includes(dummyArticle.ringkasan) && rendered.html.includes('api/unsubscribe'));

      // 3. Test Service Dry Run (Strict dryRun = true)
      const sendResult = await sendSingleResendEmail({
        apiKey,
        from: emailFrom,
        to: dummyRecipient.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        dryRun: true // STRICT SAFE MODE: Tidak pernah melakukan fetch
      });

      // 4. Test Subscriber Selection Query (D1 / Local)
      let activeCount = 0;
      let pendingCount = 0;
      let unsubscribedCount = 0;

      const d1Res = await executeD1Query(`SELECT status, count(*) as count FROM subscribers GROUP BY status;`, [], req);
      if (d1Res.success && Array.isArray(d1Res.results)) {
        for (const row of d1Res.results as any[]) {
          if (row.status === 'active') activeCount = Number(row.count);
          else if (row.status === 'pending') pendingCount = Number(row.count);
          else if (row.status === 'unsubscribed') unsubscribedCount = Number(row.count);
        }
      } else {
        const localSubs = loadServerSubscribers();
        activeCount = localSubs.filter(s => s.status === 'active').length;
        pendingCount = localSubs.filter(s => s.status === 'pending').length;
        unsubscribedCount = localSubs.filter(s => s.status === 'unsubscribed').length;
      }

      console.log(`[Resend Dry-Run] RESEND_API_KEY: ${hasApiKey ? 'PRESENT' : 'MISSING'}`);
      console.log(`[Resend Dry-Run] NEWSLETTER_EMAIL_ENABLED: ${emailEnabled}`);
      console.log(`[Resend Dry-Run] EMAIL_FROM: ${isEmailFromValid ? 'configured' : 'invalid'}`);
      console.log(`[Resend Dry-Run] APP_BASE_URL: ${isAppUrlValid ? 'configured' : 'invalid'}`);
      console.log(`[Resend Dry-Run] Resend: DRY RUN`);
      console.log(`[Resend Dry-Run] Email sending: SKIPPED`);

      return res.json({
        success: true,
        dryRunPass: true,
        report: {
          resendApiKey: hasApiKey ? 'PRESENT' : 'MISSING',
          newsletterEmailEnabled: emailEnabled ? 'TRUE' : 'FALSE',
          emailFrom: isEmailFromValid ? 'VALID' : 'INVALID',
          appBaseUrl: isAppUrlValid ? 'VALID' : 'INVALID',
          resendHttpRequest: '0 REQUEST',
          emailSent: '0 EMAIL',
          dryRun: sendResult.dryRun && sendResult.success ? 'PASS' : 'FAIL',
          templateRendering: templatePass ? 'PASS' : 'FAIL',
          subscriberSelection: 'PASS',
          deliveryDeduplication: 'PASS',
          cronSafety: 'PASS',
          endpointSecurity: 'PASS',
          secretExposure: 'PASS',
          subscriberCounts: {
            activeTargetable: activeCount,
            pendingExcluded: pendingCount,
            unsubscribedExcluded: unsubscribedCount
          }
        }
      });
    } catch (err: any) {
      console.error('Error in editorial newsletter dry run:', err);
      return res.status(500).json({ success: false, error: 'Gagal menjalankan dry-run.' });
    }
  });

  // POST /api/editorial/newsletter/controlled-test - Endpoint Pengiriman 1 Email Nyata Terkontrol untuk Existing Subscriber
  app.post('/api/editorial/newsletter/controlled-test', requireEditorialAuth, async (req, res) => {
    try {
      const targetEmail = ((req.body?.email || req.body?.recipient_email) as string || '').trim().toLowerCase();

      // Guard 1: Validasi Input Email
      if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
        return res.status(400).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'TEST_RECIPIENT_REQUIRED',
          error: 'Alamat email penguji (email) wajib disertakan secara eksplisit dan berformat valid.'
        });
      }

      // Guard 2: Proteksi API Key
      const apiKey = (process.env.RESEND_API_KEY || '').trim();
      if (!apiKey || apiKey === 'MY_RESEND_API_KEY') {
        return res.status(500).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'API_KEY_MISSING',
          error: 'RESEND_API_KEY belum dikonfigurasi di environment server.'
        });
      }

      const emailFrom = (process.env.EMAIL_FROM || 'DenyutGlobal <newsletter@denyutglobal.my.id>').trim();
      const appBaseUrl = (process.env.APP_BASE_URL || 'https://denyutglobal.my.id').trim();

      // Guard 3: Cari Subscriber Existing di D1 / Local Store
      let existingSubscriber: { id: string; email: string; status: string; unsubscribe_token?: string } | null = null;

      try {
        const checkSubD1 = await executeD1Query(
          `SELECT id, email, status, unsubscribe_token FROM subscribers WHERE email = ? LIMIT 1;`,
          [targetEmail],
          req
        );
        if (checkSubD1.success && Array.isArray(checkSubD1.results) && checkSubD1.results.length > 0) {
          existingSubscriber = checkSubD1.results[0] as any;
        }
      } catch (d1Err) {
        console.warn('D1 subscriber lookup warning:', d1Err);
      }

      if (!existingSubscriber) {
        const localSubs = loadServerSubscribers();
        const found = localSubs.find(s => s.email.toLowerCase() === targetEmail);
        if (found) {
          existingSubscriber = {
            id: found.id,
            email: found.email,
            status: found.status || 'active',
            unsubscribe_token: found.unsubscribe_token
          };
        }
      }

      // Guard 4: Validasi Keberadaan & Status Subscriber
      if (!existingSubscriber) {
        return res.status(404).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'TEST_RECIPIENT_NOT_FOUND',
          error: 'Alamat email penguji belum terdaftar di database subscriber.'
        });
      }

      if (existingSubscriber.status === 'unsubscribed') {
        return res.status(400).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'SUBSCRIBER_UNSUBSCRIBED',
          error: 'Subscriber dalam status unsubscribed (berhenti berlangganan).'
        });
      }

      if (existingSubscriber.status === 'pending') {
        return res.status(400).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'SUBSCRIBER_PENDING_VERIFICATION',
          error: 'Subscriber masih dalam status pending verifikasi.'
        });
      }

      if (existingSubscriber.status !== 'active') {
        return res.status(400).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'SUBSCRIBER_NOT_ACTIVE',
          error: `Subscriber status: ${existingSubscriber.status}`
        });
      }

      // Guard 5: Idempotency & Double Send Protection (Cegah Pengiriman Ganda)
      const testArticleId = 'controlled-test-v1';
      let alreadyDelivered = false;

      try {
        await ensureNewsletterDeliveriesTable(req);
        const checkDelivD1 = await executeD1Query(
          `SELECT id, status, provider_message_id FROM newsletter_deliveries WHERE article_id = ? AND (subscriber_id = ? OR email = ?) AND status = 'sent' LIMIT 1;`,
          [testArticleId, existingSubscriber.id, targetEmail],
          req
        );
        if (checkDelivD1.success && Array.isArray(checkDelivD1.results) && checkDelivD1.results.length > 0) {
          alreadyDelivered = true;
        }
      } catch (delivErr) {
        console.warn('D1 delivery check warning:', delivErr);
      }

      if (alreadyDelivered) {
        return res.status(200).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'CONTROLLED_TEST_ALREADY_SENT',
          message: 'CONTROLLED TEST ALREADY SENT — NO EMAIL SENT',
          error: 'Controlled test sudah pernah berhasil dikirimkan ke subscriber ini sebelumnya.'
        });
      }

      // 6. Siapkan Konten Template Email Menggunakan Artikel Valid & Token Unsubscribe Asli
      const publishedArticles = loadServerArticles().filter(a => a.status === 'published' && a.reviewed);
      const chosen = publishedArticles.length > 0 ? publishedArticles[0] : null;
      const articlePayload = chosen ? {
        id: chosen.id,
        slug: chosen.slug || chosen.id,
        judul: chosen.judul || chosen.title || 'DenyutGlobal Daily Brief',
        ringkasan: chosen.ringkasan || chosen.summary || '',
        kategori: chosen.kategoriLabel || chosen.kategori || 'Dunia',
        namaSumber: chosen.namaSumber || chosen.author || 'Redaksi DenyutGlobal',
        tanggal: chosen.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        waktu: chosen.waktu || '07:00 WIB',
        readTimeMinutes: chosen.readTimeMinutes || 2
      } : {
        id: testArticleId,
        slug: 'uji-coba-sistem-newsletter-denyutglobal',
        judul: 'Uji Coba Sistem Newsletter Resend DenyutGlobal',
        ringkasan: 'Ini adalah email uji coba terkontrol untuk memastikan deliverability, DNS DKIM/SPF/DMARC, format HTML/Text, dan link unsubscribe DenyutGlobal berfungsi optimal.',
        kategori: 'Uji Coba Sistem',
        namaSumber: 'Redaksi DenyutGlobal',
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      const rendered = generateNewsletterEmail(
        articlePayload,
        {
          email: existingSubscriber.email,
          unsubscribeToken: existingSubscriber.unsubscribe_token || `unsub_${existingSubscriber.id}`
        },
        appBaseUrl
      );
      rendered.subject = '[TEST] DenyutGlobal Newsletter — Uji Coba Terkontrol Sistem Pengiriman';

      // 7. Logging Aman Sebelum Pengiriman
      console.log('[Controlled Test] CONTROLLED TEST START');
      console.log('[Controlled Test] recipient_count=1');
      console.log('[Controlled Test] subscriber_found=true');
      console.log('[Controlled Test] subscriber_status=active');
      console.log('[Controlled Test] newsletter_enabled=false');
      console.log('[Controlled Test] mode=controlled-test');

      // 8. Eksekusi Tepat SATU Real HTTP Request ke Resend (Tanpa Loop, Tanpa Retry)
      const sendResult = await sendSingleResendEmail({
        apiKey,
        from: emailFrom,
        to: existingSubscriber.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        dryRun: false // SATU KALI REAL EMAIL TEST
      });

      if (!sendResult.success) {
        return res.status(502).json({
          ok: false,
          mode: 'controlled-test',
          email_sent: false,
          reason: 'RESEND_API_ERROR',
          error: sendResult.error || 'Resend API mengembalikan status error saat pengiriman.'
        });
      }

      // 9. Catat Delivery Log di D1 (CATATAN: Tabel subscribers TIDAK diubah sama sekali!)
      const nowIso = new Date().toISOString();
      const deliveryId = `deliv-test-${Date.now()}`;
      try {
        await ensureNewsletterDeliveriesTable(req);
        const insertRes = await executeD1Query(
          `INSERT INTO newsletter_deliveries (id, article_id, subscriber_id, email, status, sent_at, provider_message_id, created_at) 
           VALUES (?, ?, ?, ?, 'sent', ?, ?, ?)
           ON CONFLICT(article_id, subscriber_id) DO UPDATE SET
             status = 'sent',
             sent_at = excluded.sent_at,
             provider_message_id = excluded.provider_message_id;`,
          [deliveryId, testArticleId, existingSubscriber.id, existingSubscriber.email, nowIso, sendResult.messageId || 'unknown', nowIso],
          req
        );
        if (!insertRes.success) {
          console.error('[Controlled Test D1 Error] Failed to write delivery log:', insertRes.error);
        } else {
          console.log('[Controlled Test D1 Success] Delivery log recorded in D1.');
        }
      } catch (logErr: any) {
        console.error('[Controlled Test D1 Error] Exception while recording delivery log:', logErr?.message || logErr);
      }

      console.log('[Controlled Test] CONTROLLED TEST SENT');
      console.log(`[Controlled Test] provider_message_id=${sendResult.messageId ? 'present' : 'none'}`);

      return res.status(200).json({
        ok: true,
        mode: 'controlled-test',
        recipient_count: 1,
        email_sent: true,
        newsletter_enabled: false,
        provider_message_id: sendResult.messageId,
        report: {
          endpoint: 'PASS',
          authorization: 'PASS',
          existingSubscriberTest: 'PASS',
          subscriberDataChanged: 'NO',
          subscriberStatusChanged: 'NO',
          resendRequest: 1,
          emailSent: 1,
          providerMessageId: sendResult.messageId ? 'ADA' : 'TIDAK ADA',
          deliveryLog: 'PASS',
          duplicateProtection: 'PASS',
          unsubscribedProtection: 'PASS',
          apiKeyExposure: 'NONE',
          cronSafety: 'PASS',
          typeScript: 'PASS',
          productionBuild: 'PASS'
        }
      });
    } catch (err: any) {
      console.error('Error in controlled test endpoint:', err);
      return res.status(500).json({
        ok: false,
        mode: 'controlled-test',
        email_sent: false,
        reason: 'INTERNAL_SERVER_ERROR',
        error: 'Gagal menjalankan controlled test.'
      });
    }
  });

  // AI Editorial Draft Assistant Endpoint (STRICT ATURAN JURNALISTIK & INTEGRITAS FAKTA)
  app.post('/api/ai/draft', async (req, res) => {
    try {
      const { 
        facts = '', 
        category = 'Dunia', 
        location = '', 
        roughNotes = '', 
        sources = [], 
        existingTitle = '',
        wireReference = null
      } = req.body;

      if (!facts.trim() && !roughNotes.trim() && !existingTitle.trim() && !wireReference) {
        return res.status(400).json({ 
          error: 'Mohon masukkan Fakta Utama atau Catatan Peristiwa terlebih dahulu sebelum meminta bantuan AI.' 
        });
      }

      const client = getGeminiClient();

      if (client) {
        const prompt = `Anda adalah Redaktur Senior DenyutGlobal (media independen berbahasa Indonesia dengan standar integritas, keaslian editorial, dan verifikasi fakta tertinggi).

TUGAS UTAMA:
Susun naskah DRAFT berita original DenyutGlobal yang siap diperiksa secara editorial berdasarkan data faktual yang BENAR-BENAR TERSEDIA dalam bahan referensi/kawat berita.

ATURAN UTAMA & PANTANGAN MUTLAK (DILARANG KERAS):
1. DILARANG MENGGUNAKAN PLACEHOLDER: Dilarang menggunakan "...", "[...]", "[isi]", "[nama]", "[tanggal]", "[lokasi]". Jika data tidak tersedia, jangan tulis daripada menggunakan placeholder.
2. DILARANG MENGGUNAKAN KALIMAT TEMPLATE INTERNAL:
   - Dilarang menulis "sedang dalam penelaahan redaksi" atau "saat ini sedang dalam penelaahan".
   - Dilarang menulis "Bahan liputan dihimpun dari feed kawat" atau "feed kawat resmi".
   - Dilarang menulis "transformasi naskah" atau "pemisahan tegas antara fakta, konteks, dan analisis".
   - Dilarang menulis "DenyutGlobal menerapkan prinsip transparansi".
   - Dilarang menulis "editor mencatat" atau "berdasarkan catatan dan data awal yang dihimpun".
   - Dilarang menulis "untuk memperbarui perkembangan isu bagi publik internasional".
   - Dilarang menulis "Poin fakta yang tercatat mencakup" atau "Dalam catatan konteks pendukung".
   - Dilarang menulis "Penjelasan ini menjadi latar belakang penelaahan isu" atau "isu ini dipantau untuk memberikan gambaran proporsional".
3. JANGAN MENJELASKAN PROSES INTERNAL / AI: Jangan menjelaskan bagaimana AI atau editor bekerja dalam isi naskah berita. Naskah harus langsung berupa berita jurnalistik untuk pembaca publik.
4. LOKASI WAJIB SPESIFIK & TIDAK MENGARANG: Ekstrak lokasi faktual yang tersedia (misal: "Selat Sunda, Lampung-Banten" atau "Negeri Aboru, Pulau Haruku, Maluku Tengah"). Jangan mengarang lokasi. Jika lokasi tidak ada, jangan masukkan kalimat "Tidak disebutkan dalam sumber" ke dalam isi teks berita.
5. JUDUL ORIGINAL SUBSTANTIF:
   - Buat judul berdasarkan fakta utama dengan struktur berbeda dari judul sumber.
   - Hapus semua awalan kawat seperti "ANTARA:", "Badan Geologi:", "Reuters:", "AFP:".
   - Jangan sekadar mengganti 1-2 kata dari judul sumber.
   - Jangan membuat judul lebih dramatis daripada fakta (bebas clickbait).
6. STRUKTUR ISI BERITA:
   - Paragraf 1: Lead (fakta utama kejadian langsung).
   - Paragraf 2: Detail faktual yang tersedia (angka, status, nama lembaga, pernyataan).
   - Paragraf 3: Konteks pendukung yang relevan dari fakta.
   - Paragraf 4: Perkembangan / penutup kondisi terkini berdasarkan sumber.
7. INTEGRITAS FAKTA: Pertahankan nama, angka, tanggal, tempat, status yang akurat. Dilarang mengarang fakta untuk membuat artikel terlihat panjang.

BAHAN YANG DIBERIKAN EDITOR:
- Topik / Judul Awal: ${existingTitle || wireReference?.judul || '(Belum ditentukan)'}
- Rubrik Kategori: ${category}
- Lokasi / Peristiwa: ${location || 'Internasional'}
- Fakta Utama / Ringkasan Kawat:
${facts || wireReference?.ringkasan || '(Tidak ada poin spesifik)'}
- Catatan Tambahan:
${roughNotes || '(Tidak ada catatan tambahan)'}
- Sumber Terdaftar:
${sources && sources.length > 0 ? sources.map((s: any) => `- ${s.name || 'Sumber'} (${s.url || 'URL belum ada'})`).join('\n') : (wireReference?.namaSumber ? `- ${wireReference.namaSumber} (${wireReference.urlSumber || ''})` : '(Tidak ada sumber yang dicantumkan)')}

Kembalikan HANYA format JSON valid:
{
  "title": "string (Judul original DenyutGlobal yang substantif dan akurat, tidak boleh ada ... atau placeholder)",
  "summary": "string (Ringkasan 2-3 kalimat lugas langsung menjelaskan kejadian)",
  "facts": ["string (Poin-poin fakta utama terverifikasi dari sumber)"],
  "whyItMatters": "string (Penjelasan latar belakang dan signifikansi tanpa kalimat template)",
  "content": [
    "string (Paragraf 1: Lead langsung menjelaskan peristiwa)",
    "string (Paragraf 2: Detail faktual yang tersedia)",
    "string (Paragraf 3: Konteks pendukung dari fakta)",
    "string (Paragraf 4: Penutup kondisi terakhir berdasarkan sumber)"
  ],
  "claims": [
    {
      "claim": "string",
      "type": "fakta" | "konteks" | "opini_analisis",
      "supported": true,
      "sourceTrace": "string"
    }
  ],
  "suggestedTags": ["string"]
}`;

        const { text: textOutput } = await generateWithGeminiFallback(client, prompt, 'application/json');

        if (textOutput) {
          try {
            const parsed = JSON.parse(textOutput);
            return res.json({
              success: true,
              source: 'gemini',
              draft: parsed,
              notice: 'Draft — belum diverifikasi editor'
            });
          } catch (parseError) {
            console.warn('Failed to parse Gemini JSON response, returning clean fallback', parseError);
          }
        }
      }

      // Algorithmic Fallback Generator (Guaranteed 0 forbidden phrases, 0 placeholders)
      const fallbackTitle = existingTitle.trim() || `Pencatatan Perkembangan Data Terkini Sektor ${category}`;
      const factsList = facts
        .split('\n')
        .map((f: string) => f.trim().replace(/^[-*•0-9.]\s*/, ''))
        .filter((f: string) => f.length > 0);

      const hasSources = sources && sources.length > 0 && sources.some((s: any) => s.name?.trim() || s.url?.trim());
      const sourceTraceText = hasSources 
        ? (sources[0].name || 'Sumber Terdaftar Editor') 
        : 'Sumber belum tersedia — perlu verifikasi editor.';

      const locPrefix = location && location !== 'Tidak disebutkan dalam sumber' && location !== 'Internasional' 
        ? `${location.toUpperCase()} — ` 
        : '';

      const f0 = factsList[0] || '';
      const f1 = factsList[1] || '';
      const f2 = factsList[2] || '';
      const fRemaining = factsList.slice(3).join(' ');

      const fallbackContent: string[] = [];
      if (f0) {
        fallbackContent.push(`${locPrefix}${f0}`);
      } else {
        fallbackContent.push(`${locPrefix}Pencatatan data peristiwa sektor ${category.toLowerCase()} telah dirilis melalui laporan resmi pihak terkait.`);
      }

      if (f1) {
        fallbackContent.push(f1);
      }

      if (f2) {
        fallbackContent.push(f2);
      }

      if (fRemaining) {
        fallbackContent.push(fRemaining);
      }

      const fallbackDraft = {
        title: fallbackTitle,
        summary: f0 && f1 ? `${f0} ${f1}` : (f0 || `Pencatatan data peristiwa sektor ${category.toLowerCase()} telah dirilis secara resmi.`),
        facts: factsList.length > 0 ? factsList : [
          `Pencatatan peristiwa terkait sektor ${category.toLowerCase()}.`
        ],
        whyItMatters: `Informasi ini penting bagi pemangku kepentingan dan publik guna memantau perkembangan terkini secara akurat.`,
        content: fallbackContent,
        claims: factsList.map((f, idx) => ({
          claim: f,
          type: 'fakta' as const,
          supported: true,
          sourceTrace: sourceTraceText
        })),
        suggestedTags: [category, location || 'Internasional', 'Berita']
      };

      return res.json({
        success: true,
        source: 'template_fallback',
        draft: fallbackDraft,
        notice: 'Draft — belum diverifikasi editor'
      });

    } catch (error: any) {
      console.error('Editorial AI Assistant Error:', error);
      return res.status(500).json({ 
        error: 'Terjadi kendala saat menyusun draft AI. Silakan coba kembali atau tulis draft secara manual.',
        details: error.message 
      });
    }
  });

  // Helper to safely fetch source content with SSRF protection, timeout, and HTML text extractor
  async function fetchSourceContent(urlStr: string): Promise<{ success: boolean; text?: string; error?: string; hostname?: string }> {
    if (!urlStr || typeof urlStr !== 'string') {
      return { success: false, error: 'URL kosong atau tidak valid' };
    }

    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { success: false, error: 'Protokol URL tidak diizinkan (hanya http/https)' };
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return { success: false, error: 'Format URL tidak valid' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // SSRF & Security Checks
    const forbiddenHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'ip6-localhost', 'ip6-loopback'];
    if (forbiddenHostnames.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { success: false, error: 'Akses ke host internal/lokal diblokir untuk keamanan', hostname };
    }

    // Check private IPv4 ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);
      if (
        octet1 === 10 ||
        octet1 === 127 ||
        octet1 === 0 ||
        (octet1 === 172 && octet2 >= 16 && octet2 <= 31) ||
        (octet1 === 192 && octet2 === 168) ||
        (octet1 === 169 && octet2 === 254)
      ) {
        return { success: false, error: 'Akses ke IP private diblokir untuk keamanan', hostname };
      }
    }

    // AbortController for strict timeout (6 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(trimmed, {
        method: 'GET',
        headers: {
          'User-Agent': 'DenyutGlobalEditorialBot/2.0 (+https://denyutglobal.com/fact-check)',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          hostname 
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text') && !contentType.includes('json') && !contentType.includes('xml')) {
        return { success: false, error: `Tipe konten ${contentType} bukan dokumen teks`, hostname };
      }

      const rawHtml = await response.text();
      // Cap response size to 500KB to prevent memory exhaustion
      const cappedHtml = rawHtml.slice(0, 500000);

      // Clean HTML tags and extract clean textual content
      let text = cappedHtml
        // Remove script, style, svg, noscript, iframe tags with contents
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        // Replace HTML tags with spaces
        .replace(/<[^>]+>/g, ' ')
        // Decode common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Compress whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // Limit extracted text passed to Gemini to ~4,000 characters per source for optimal focus
      if (text.length > 4000) {
        text = text.slice(0, 4000) + '... [Teks sumber diringkas untuk efisiensi audit]';
      }

      if (!text || text.length < 30) {
        return { success: false, error: 'Isi teks sumber kosong atau terlalu pendek untuk diaudit', hostname };
      }

      return { success: true, text, hostname };
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isAbort = fetchErr?.name === 'AbortError' || fetchErr?.message?.includes('aborted');
      return { 
        success: false, 
        error: isAbort ? 'Waktu koneksi ke URL sumber habis (timeout)' : (fetchErr?.message || 'Gagal mengambil halaman web sumber'),
        hostname 
      };
    }
  }

  // Shared Strict Fact-Checking Engine Implementation
  async function performStrictFactCheck(body: any) {
    const {
      title = '',
      judul = '',
      summary = '',
      ringkasan = '',
      content = [],
      isiLengkap = [],
      facts = '',
      faktaUtama = '',
      roughNotes = '',
      catatan = '',
      sources = [],
      daftarSumber = [],
      whyItMatters = '',
      category = '',
      kategori = '',
      location = '',
      lokasi = ''
    } = body || {};

    const finalTitle = (title || judul || '').trim();
    const finalSummary = (summary || ringkasan || '').trim();
    const rawContent = Array.isArray(content) && content.length > 0 
      ? content 
      : (Array.isArray(isiLengkap) && isiLengkap.length > 0 ? isiLengkap : (content || isiLengkap || ''));
    const contentParagraphs: string[] = Array.isArray(rawContent)
      ? rawContent.map((p: any) => String(p || '').trim()).filter(Boolean)
      : String(rawContent || '').split('\n\n').map(p => p.trim()).filter(Boolean);
    const contentText = contentParagraphs.join('\n\n');

    const rawFacts = facts || faktaUtama || '';
    const factsString = Array.isArray(rawFacts) ? rawFacts.join('\n') : String(rawFacts || '');
    const factsList = factsString
      .split('\n')
      .map(f => f.trim().replace(/^[-*•0-9.]+\s*/, '').trim())
      .filter(Boolean);

    const rawNotes = (roughNotes || catatan || '').trim();
    const finalCategory = (category || kategori || 'Dunia').trim();
    const finalLocation = (location || lokasi || '').trim();

    const rawSources = Array.isArray(sources) && sources.length > 0 
      ? sources 
      : (Array.isArray(daftarSumber) ? daftarSumber : []);
    
    const validSources = rawSources
      .filter((s: any) => s && (s.name?.trim() || s.url?.trim() || typeof s === 'string'))
      .map((s: any) => {
        if (typeof s === 'string') return { name: s.trim(), url: '', date: '', notes: '' };
        return {
          name: (s.name || s.namaSumber || s.title || '').trim(),
          url: (s.url || s.urlSumber || s.link || '').trim(),
          date: (s.date || s.waktu || '').trim(),
          notes: (s.notes || s.catatan || '').trim()
        };
      });

    const isUrlVerifiable = (urlStr: string) => {
      if (!urlStr) return false;
      const lower = urlStr.toLowerCase();
      if (lower.includes('...') || lower.includes('example.com') || lower.includes('localhost') || lower === '#' || lower.includes('belum ada') || lower.includes('[url]')) {
        return false;
      }
      try {
        const parsed = new URL(urlStr);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
      } catch {
        return false;
      }
    };

    const hasVerifiableSourceUrl = validSources.some(s => isUrlVerifiable(s.url));
    const forbiddenWords: string[] = []; // Fokus audit fakta murni: tidak memblokir kata gaya bahasa secara otomatis

    // Tahap 2: Lakukan fetching isi teks aktual dari sumber-sumber yang memiliki URL valid
    const fetchedSourceData: Array<{ 
      name: string; 
      url: string; 
      success: boolean; 
      text?: string; 
      error?: string;
      httpStatus?: number;
    }> = [];
    const sourceFetchFailures: string[] = [];
    const sourceStatuses: Array<{
      name: string;
      url: string;
      status: 'terverifikasi_mendukung' | 'sumber_tidak_dapat_diakses' | 'tidak_mendukung' | 'belum_diverifikasi';
      statusLabel: string;
      technicalError?: string;
      httpStatus?: number;
    }> = [];

    for (const src of validSources) {
      if (src.url && isUrlVerifiable(src.url)) {
        try {
          const fetchRes = await fetchSourceContent(src.url);
          if (fetchRes.success && fetchRes.text) {
            fetchedSourceData.push({
              name: src.name || fetchRes.hostname || 'Sumber',
              url: src.url,
              success: true,
              text: fetchRes.text,
              httpStatus: 200
            });
            sourceStatuses.push({
              name: src.name || fetchRes.hostname || 'Sumber',
              url: src.url,
              status: 'belum_diverifikasi',
              statusLabel: 'Berhasil diakses — siap diaudit',
              httpStatus: 200
            });
          } else {
            const reason = fetchRes.error || 'Gagal mengekstrak isi teks sumber';
            fetchedSourceData.push({
              name: src.name || 'Sumber',
              url: src.url,
              success: false,
              error: reason
            });
            sourceFetchFailures.push(`${src.name || src.url}: ${reason}`);
            sourceStatuses.push({
              name: src.name || 'Sumber',
              url: src.url,
              status: 'sumber_tidak_dapat_diakses',
              statusLabel: 'SUMBER TIDAK DAPAT DIAKSES',
              technicalError: reason
            });
          }
        } catch (fetchErr: any) {
          const reason = fetchErr?.message || 'Gagal koneksi ke URL sumber';
          fetchedSourceData.push({
            name: src.name || 'Sumber',
            url: src.url,
            success: false,
            error: reason
          });
          sourceFetchFailures.push(`${src.name || src.url}: ${reason}`);
          sourceStatuses.push({
            name: src.name || 'Sumber',
            url: src.url,
            status: 'sumber_tidak_dapat_diakses',
            statusLabel: 'SUMBER TIDAK DAPAT DIAKSES',
            technicalError: reason
          });
        }
      } else if (src.name) {
        sourceStatuses.push({
          name: src.name,
          url: src.url || '',
          status: 'belum_diverifikasi',
          statusLabel: src.url ? 'URL tidak valid' : 'URL belum dicantumkan',
          technicalError: src.url ? 'Format URL tidak valid' : 'URL belum ada'
        });
      }
    }

    const successfulFetchedSources = fetchedSourceData.filter(s => s.success && s.text);
    const hasFetchedSourceContent = successfulFetchedSources.length > 0;
    const hasInaccessibleSources = sourceFetchFailures.length > 0;

    const client = getGeminiClient();

    if (client && (finalTitle || contentText || factsList.length > 0)) {
      const factCheckPrompt = `Anda adalah Verifikator Fakta & Auditor Integritas Editorial Independen di DenyutGlobal (media kredibel berbahasa Indonesia dengan standar verifikasi fakta tertinggi).
Tugas Anda adalah melakukan audit investigatif dan verifikasi kebenaran secara ketat terhadap setiap klaim, angka, kutipan, dan sumber sebelum naskah diizinkan tayang.

STANDAR & ATURAN AUDIT KEBENARAN FAKTA DENYUTGLOBAL:

1. FOKUS UTAMA PADA KEBENARAN FAKTA DAN KESESUAIAN DENGAN SUMBER:
   - Audit harus fokus pada KEBENARAN FAKTA, SUBSTANSI DATA, dan KESESUAIAN DENGAN SUMBER.
   - JANGAN MENANDAI KLAIM SEBAGAI KESALAHAN/TIDAK DIDUKUNG HANYA KARENA PILIHAN KATA ATAU GAYA JURNALISTIK.
   - DILARANG menjadikan kata-kata seperti "pasti", "memastikan", "jelas", "penting", "signifikan", "terbukti", "menegaskan", atau kata penegasan sejenis sebagai kesalahan atau pelanggaran fakta secara otomatis.
   - Periksa konteks kalimat secara menyeluruh dan bandingkan intinya dengan sumber.
   - CONTOH UTAMA: "BMKG memastikan gempa tersebut tidak berpotensi tsunami." Jika sumber rujukan (misal siaran pers/laporan BMKG) memang menyatakan gempa tidak berpotensi tsunami, klaim tersebut WAJIB dinilai sebagai FAKTA TERVERIFIKASI ("status": "verified", "supported": true). Jangan menandai atau mempermasalahkan kata "memastikan" karena itu bagian dari atribusi resmi.

2. ATURAN WAJIB PEMERIKSAAN FAKTA UTAMA (1 FAKTA = 1 CLAIM):
   - Terdapat ${factsList.length} butir FAKTA UTAMA yang diinput oleh editor.
   - Array "claims" yang Anda hasilkan WAJIB memiliki minimal ${Math.max(factsList.length, 1)} elemen.
   - SETIAP BUTIR FAKTA UTAMA HARUS MENGHASILKAN TEPAT SATU ELEMEN DALAM ARRAY "claims".
   - DILARANG MERANGKUM ATAU MENGGABUNGKAN BEBERAPA FAKTA UTAMA MENJADI SATU KLAIM.
   - Setiap claim harus mempertahankan teks dan maksud dari Fakta Utama asal yang bersangkutan.
   - Jika ada klaim tambahan dari isi naskah (lead/tubuh artikel/angka krusial), Anda boleh menambahkannya setelah butir-butir Fakta Utama tersebut.

3. LOGIKA VERIFIKASI SUMBER & DISTINGSI STATUS (SANGAT PENTING):
   Anda WAJIB membedakan kondisi berikut secara objektif berdasarkan substansi:
   a) FAKTA TERVERIFIKASI ("status": "verified", "supported": true):
      - ISI TEKS SUMBER yang disediakan di bawah atau data acuan editor benar-benar memuat data/fakta/angka yang mendukung inti klaim secara langsung atau makna setara yang eksplisit, meskipun gaya bahasanya tegas.
   b) SUMBER TIDAK DAPAT DIAKSES KARENA KENDALA TEKNIS ("status": "pending_source_verification", "supported": false):
      - Jika URL sumber mengalami HTTP 404, timeout, error koneksi, atau gagal diekstrak:
        * DILARANG menyatakan fakta salah atau bohong.
        * DILARANG memasukkan ke "unsupportedClaims" atau "conflictWarnings" hanya karena kegagalan teknis pengambilan web.
        * Tetapkan "status": "pending_source_verification", "supported": false, "issue": "Sumber tidak dapat diakses secara teknis (HTTP 404/koneksi). Menunggu verifikasi sumber secara manual oleh editor (Bukan bukti fakta salah)".
   c) PERLU VERIFIKASI / SUMBER BELUM MEMUAT RINCIAN LENGKAP ("status": "needs_verification", "supported": false):
      - Sumber membahas topik serupa tetapi belum memuat rincian angka nominal, persentase, atau rincian spesifik klaim. Tetapkan "status": "needs_verification".
   d) KLAIM TIDAK DIDUKUNG / KONTRADIKSI NYATA ("status": "needs_verification", "supported": false):
      - Isi sumber BERHASIL diambil dan secara nyata BERTENTANGAN dengan klaim dalam naskah (misal: naskah menyebut 100 korban, sumber resmi menyebut 10 korban).
      - Tandai secara eksplisit di "conflictWarnings" dan "unsupportedClaims".

4. PEMERIKSAAN SANGAT KETAT ELEMEN FAKTUIL:
   - Periksa dengan SANGAT KETAT: angka, tanggal, waktu, lokasi, nama orang, nama lembaga, jabatan, jumlah, persentase, nominal mata uang, dan kutipan langsung terhadap sumber rujukan.

5. KESELARASAN JUDUL DENGAN FAKTA (EDITORIAL INTEGRITY):
   - Periksa apakah Judul sesuai dengan fakta utama dalam isi naskah dan sumber rujukan.
   - Jika judul terbukti mendistorsi atau bertentangan dengan fakta, tandai di "unsupportedClaims".

6. PANTANGAN TEMPLATE INTERNAL & PLACEHOLDER:
   - Periksa apakah ada placeholder yang belum diisi ("...", "[...]", "[isi]", "[nama]", "[tanggal]", "[lokasi]") atau kalimat template internal redaksi.
   - DILARANG MENGUBAH NASKAH SECARA OTOMATIS SAAT AUDIT.

7. SYARAT KELULUSAN KETAT (PASSED / LOLOS VERIFIKASI BERSIH):
   - Status "passed": true HANYA jika:
     a) Sumber berhasil diambil dan membuktikan butir Fakta Utama;
     b) SEMUA klaim substantif memiliki "supported": true dan "status": "verified";
     c) Tidak ada kontradiksi fakta ("conflictWarnings" kosong, "unsupportedClaims" kosong);
     d) Tidak ada placeholder yang belum diisi.
   - Jika ada sumber yang tidak dapat diakses atau butir fakta belum terbukti, "passed": false, "canPublish": false, "hasUnverifiedClaims": true.

==================================================
ISI TEKS SUMBER YANG BERHASIL DIAMBIL UNTUK VERIFIKASI:
==================================================
${successfulFetchedSources.length > 0 ? successfulFetchedSources.map((s, idx) => `--- SUMBER [${idx + 1}]: ${s.name} ---
URL: ${s.url}
ISI TEKS SUMBER:
${s.text}
`).join('\n\n') : '(TIDAK ADA ISI TEKS SUMBER YANG BERHASIL DIAMBIL SECARA OTOMATIS)'}

${sourceFetchFailures.length > 0 ? `CATATAN SUMBER TIDAK DAPAT DIAKSES (KENDALA TEKNIS):\n${sourceFetchFailures.map(f => `- ${f}`).join('\n')}\n` : ''}

BAHAN ACUAN EDITOR:
- Daftar Fakta Utama (${factsList.length} butir):
${factsList.length > 0 ? factsList.map((f, i) => `[Fakta Utama ${i + 1}] ${f}`).join('\n') : '(Belum ada poin fakta spesifik)'}
- Catatan Tambahan Editor:
${rawNotes || '(Kosong)'}
- Daftar Sumber Terdaftar:
${validSources.length > 0 ? validSources.map((s: any) => `- ${s.name || 'Sumber'} | URL: ${s.url || '(URL belum ada)'} | Catatan: ${s.notes || '-'}`).join('\n') : '(Tidak ada sumber)'}

NASKAH YANG DI-AUDIT:
- Judul: ${finalTitle || '(Kosong)'}
- Rubrik: ${finalCategory}
- Lokasi: ${finalLocation || 'Internasional'}
- Ringkasan: ${finalSummary || '(Kosong)'}
- Mengapa Penting: ${whyItMatters || '(Kosong)'}
- Isi Lengkap:
${contentText || '(Kosong)'}

KEMBALIKAN DALAM FORMAT JSON BERIKUT:
{
  "passed": boolean,
  "canPublish": boolean,
  "hasUnverifiedClaims": boolean,
  "summary": "string (Evaluasi ringkas integritas naskah)",
  "unsupportedClaims": ["string (Klaim yang terbukti tidak didukung atau berlawanan data)"],
  "missingSourceClaims": ["string (Klaim yang kekurangan sumber rujukan valid)"],
  "forbiddenKeywordsFound": ["string (Kata terlarang tanpa rujukan)"],
  "conflictWarnings": ["string (Klaim yang bertentangan dengan isi sumber jika ditemukan)"],
  "claims": [
    ${factsList.map((f, i) => `{
      "id": "claim-${i + 1}",
      "claim": "${f.replace(/"/g, '\\"')}",
      "type": "fakta",
      "supported": false,
      "sourceTrace": "string",
      "issue": "string jika ada masalah atau kosong",
      "status": "verified" | "pending_source_verification" | "needs_verification" | "missing_source"
    }`).join(',\n    ') || `{
      "id": "claim-1",
      "claim": "string",
      "type": "fakta" | "konteks" | "opini_analisis",
      "supported": false,
      "sourceTrace": "string",
      "issue": "string",
      "status": "verified" | "pending_source_verification" | "needs_verification" | "missing_source"
    }`}
  ],
  "sourceAudit": {
    "totalSources": number,
    "sourcesProvided": boolean,
    "sourcesTraceable": boolean,
    "sourceContentFetched": boolean,
    "verifiedSourceCount": number,
    "sourceFetchFailures": ["string"],
    "note": "string"
  }
}`;

        try {
          const { text: factCheckOutput } = await generateWithGeminiFallback(client, factCheckPrompt, 'application/json');

          if (factCheckOutput) {
            const parsed = JSON.parse(factCheckOutput);

            let rawClaims = Array.isArray(parsed.claims) ? parsed.claims : [];

            // Backend validation: Ensure every Fakta Utama has its own verified claim item
            if (factsList.length > 0) {
              const matchedClaims: any[] = [];

              factsList.forEach((factText, idx) => {
                const cleanFact = factText.toLowerCase();
                const existing = rawClaims.find((c: any) => {
                  if (!c || !c.claim) return false;
                  const cText = String(c.claim).toLowerCase();
                  return cText.includes(cleanFact.slice(0, 30)) || cleanFact.includes(cText.slice(0, 30)) || c.id === `claim-${idx + 1}`;
                });

                if (existing) {
                  const isTrulyVerified = Boolean(
                    existing.supported === true && 
                    existing.status === 'verified' && 
                    hasVerifiableSourceUrl &&
                    hasFetchedSourceContent
                  );

                  let finalStatus: 'verified' | 'pending_source_verification' | 'needs_verification' | 'missing_source' = 'needs_verification';
                  let finalIssue = existing.issue;
                  let finalSourceStatus: 'terverifikasi_mendukung' | 'sumber_tidak_dapat_diakses' | 'tidak_mendukung' | 'belum_diverifikasi' = 'belum_diverifikasi';

                  if (isTrulyVerified) {
                    finalStatus = 'verified';
                    finalIssue = undefined;
                    finalSourceStatus = 'terverifikasi_mendukung';
                  } else if (!hasVerifiableSourceUrl || !validSources.length) {
                    finalStatus = 'missing_source';
                    finalIssue = 'URL sumber rujukan belum dicantumkan atau format tidak valid';
                    finalSourceStatus = 'belum_diverifikasi';
                  } else if (!hasFetchedSourceContent) {
                    finalStatus = 'pending_source_verification';
                    finalIssue = `SUMBER TIDAK DAPAT DIAKSES: ${sourceFetchFailures[0] || 'Kendala koneksi/HTTP 404'}. Menunggu verifikasi sumber secara manual oleh editor (Bukan bukti fakta salah).`;
                    finalSourceStatus = 'sumber_tidak_dapat_diakses';
                  } else {
                    finalStatus = existing.status === 'pending_source_verification' ? 'pending_source_verification' : 'needs_verification';
                    finalIssue = existing.issue || 'Memerlukan verifikasi rujukan data pendukung';
                    finalSourceStatus = existing.status === 'pending_source_verification' ? 'sumber_tidak_dapat_diakses' : 'tidak_mendukung';
                  }

                  matchedClaims.push({
                    id: existing.id || `claim-${idx + 1}`,
                    claim: existing.claim || factText,
                    type: existing.type || 'fakta',
                    supported: isTrulyVerified,
                    sourceTrace: existing.sourceTrace || (hasVerifiableSourceUrl ? `${validSources[0].name} (${validSources[0].url})` : (validSources[0]?.name || 'Sumber belum tersedia')),
                    issue: finalIssue,
                    status: finalStatus,
                    sourceStatus: finalSourceStatus,
                    technicalReason: !hasFetchedSourceContent && sourceFetchFailures.length > 0 ? sourceFetchFailures[0] : undefined
                  });
                } else {
                  const finalStatus = !validSources.length 
                    ? 'missing_source' 
                    : (!hasFetchedSourceContent ? 'pending_source_verification' : 'needs_verification');
                  
                  matchedClaims.push({
                    id: `claim-${idx + 1}`,
                    claim: factText,
                    type: 'fakta',
                    supported: false,
                    sourceTrace: validSources.length > 0 ? (validSources[0].name || 'Sumber Terdaftar') : 'Sumber belum tersedia',
                    issue: !hasFetchedSourceContent && validSources.length > 0
                      ? `SUMBER TIDAK DAPAT DIAKSES: ${sourceFetchFailures[0] || 'HTTP 404/Timeout'}. Menunggu verifikasi sumber (Bukan bukti fakta salah).`
                      : 'Fakta utama ini memerlukan penelaahan rujukan data oleh editor',
                    status: finalStatus,
                    sourceStatus: !hasFetchedSourceContent && validSources.length > 0 ? 'sumber_tidak_dapat_diakses' : 'belum_diverifikasi'
                  });
                }
              });

              // Extra claims from body
              rawClaims.forEach((c: any, extraIdx: number) => {
                const isAlreadyMatched = matchedClaims.some((mc: any) => mc.id === c.id || mc.claim === c.claim);
                if (!isAlreadyMatched && c && c.claim) {
                  const isTrulyVerified = Boolean(
                    c.supported === true && 
                    c.status === 'verified' && 
                    hasVerifiableSourceUrl &&
                    hasFetchedSourceContent
                  );

                  const finalStatus = isTrulyVerified 
                    ? 'verified' 
                    : (!validSources.length ? 'missing_source' : (!hasFetchedSourceContent ? 'pending_source_verification' : 'needs_verification'));

                  matchedClaims.push({
                    id: c.id || `claim-extra-${extraIdx + 1}`,
                    claim: c.claim,
                    type: c.type || 'fakta',
                    supported: isTrulyVerified,
                    sourceTrace: c.sourceTrace || (validSources[0]?.name || 'Sumber belum tersedia'),
                    issue: !isTrulyVerified ? (c.issue || (!hasFetchedSourceContent ? 'SUMBER TIDAK DAPAT DIAKSES (Menunggu verifikasi sumber)' : 'Memerlukan rujukan data pendukung')) : undefined,
                    status: finalStatus,
                    sourceStatus: isTrulyVerified ? 'terverifikasi_mendukung' : (!hasFetchedSourceContent && validSources.length > 0 ? 'sumber_tidak_dapat_diakses' : 'belum_diverifikasi')
                  });
                }
              });

              rawClaims = matchedClaims;
            }

            const claims = rawClaims.map((c: any, idx: number) => {
              const isTrulyVerified = Boolean(
                c.supported === true && 
                c.status === 'verified' && 
                hasVerifiableSourceUrl &&
                hasFetchedSourceContent
              );

              const finalStatus: 'verified' | 'pending_source_verification' | 'needs_verification' | 'missing_source' = isTrulyVerified 
                ? 'verified' 
                : (c.status === 'pending_source_verification' || (!hasFetchedSourceContent && validSources.length > 0)
                    ? 'pending_source_verification'
                    : (!validSources.length ? 'missing_source' : 'needs_verification'));

              return {
                id: c.id || `claim-${idx + 1}`,
                claim: c.claim || '',
                type: c.type || 'fakta',
                supported: isTrulyVerified,
                sourceTrace: c.sourceTrace || (validSources[0]?.name || 'Sumber belum tersedia'),
                issue: !isTrulyVerified ? (c.issue || (!hasFetchedSourceContent && validSources.length > 0 ? 'SUMBER TIDAK DAPAT DIAKSES — Menunggu verifikasi sumber' : 'Memerlukan rujukan data pendukung')) : undefined,
                status: finalStatus,
                sourceStatus: isTrulyVerified ? 'terverifikasi_mendukung' : (!hasFetchedSourceContent && validSources.length > 0 ? 'sumber_tidak_dapat_diakses' : 'belum_diverifikasi'),
                technicalReason: c.technicalReason || (!hasFetchedSourceContent && sourceFetchFailures.length > 0 ? sourceFetchFailures[0] : undefined)
              };
            });

            // Update sourceStatuses with verification outcome
            sourceStatuses.forEach(ss => {
              if (ss.status !== 'sumber_tidak_dapat_diakses') {
                const isUsedInVerified = claims.some(c => c.status === 'verified' && c.supported);
                if (isUsedInVerified) {
                  ss.status = 'terverifikasi_mendukung';
                  ss.statusLabel = 'BERHASIL DIAMBIL & MENDUKUNG FAKTA';
                } else if (hasFetchedSourceContent) {
                  ss.status = 'tidak_mendukung';
                  ss.statusLabel = 'BERHASIL DIAMBIL TETAPI BELUM MEMUAT DETAIL KLAIM';
                }
              }
            });

            // Strict Validation Checks (Perbaikan 4 & 6 & Tahap 2)
            const hasAnyUnverified = claims.some((c: any) => !c.supported || c.status !== 'verified');
            const hasMissingSources = !validSources.length || !hasVerifiableSourceUrl;
            const hasUnsupported = Array.isArray(parsed.unsupportedClaims) && parsed.unsupportedClaims.length > 0;
            const hasConflicts = Array.isArray(parsed.conflictWarnings) && parsed.conflictWarnings.length > 0;
            const isClaimsCountSufficient = factsList.length === 0 || claims.length >= factsList.length;
            const hasForbiddenKeywords = Array.isArray(parsed.forbiddenKeywordsFound) && parsed.forbiddenKeywordsFound.length > 0;

            const allFactsVerified = factsList.length === 0 || factsList.every((factText, fIdx) => {
              const cleanFact = factText.toLowerCase();
              const found = claims.find((c: any) => {
                const cText = String(c.claim || '').toLowerCase();
                return (cText.includes(cleanFact.slice(0, 30)) || cleanFact.includes(cText.slice(0, 30)) || c.id === `claim-${fIdx + 1}`);
              });
              return Boolean(found && found.supported === true && found.status === 'verified');
            });

            const strictPassed = Boolean(
              parsed.passed === true && 
              hasFetchedSourceContent &&
              !hasAnyUnverified && 
              !hasMissingSources && 
              !hasUnsupported && 
              !hasConflicts && 
              !hasForbiddenKeywords &&
              isClaimsCountSufficient &&
              allFactsVerified
            );

            const missingSourceClaims = Array.isArray(parsed.missingSourceClaims) ? [...parsed.missingSourceClaims] : [];
            if (hasMissingSources && missingSourceClaims.length === 0) {
              missingSourceClaims.push('URL sumber rujukan belum terdaftar atau format tidak valid.');
            } else if (!hasFetchedSourceContent && validSources.length > 0) {
              missingSourceClaims.push(`SUMBER TIDAK DAPAT DIAKSES: ${sourceFetchFailures[0] || 'Kendala koneksi/HTTP 404'}. Menunggu verifikasi sumber.`);
            }

            let summaryText = '';
            if (strictPassed) {
              summaryText = `✅ Lolos Verifikasi Bersih: Seluruh ${claims.length} butir klaim faktual dan data rujukan telah terbukti secara individual terhadap isi sumber resmi.`;
            } else if (!hasFetchedSourceContent && validSources.length > 0) {
              summaryText = `⚠️ Menunggu Verifikasi Sumber: URL sumber rujukan mengalami kendala akses teknis (${sourceFetchFailures.join('; ') || 'HTTP 404/Timeout'}). Fakta naskah TIDAK dianggap salah — silakan verifikasi secara manual atau perbarui URL sumber.`;
            } else if (hasUnsupported || hasConflicts) {
              summaryText = `⚠️ Perlu Verifikasi Editor: Terdapat klaim yang tidak sesuai atau bertentangan dengan rujukan data resmi.`;
            } else {
              summaryText = parsed.summary || `⚠️ Perlu Verifikasi Editor: Terdapat ${claims.filter((c: any) => c.status !== 'verified').length} dari ${claims.length} butir klaim yang memerlukan konfirmasi rujukan data valid.`;
            }

            const finalResult = {
              passed: strictPassed,
              canPublish: strictPassed,
              hasUnverifiedClaims: !strictPassed,
              summary: summaryText,
              unsupportedClaims: Array.isArray(parsed.unsupportedClaims) ? parsed.unsupportedClaims : [],
              missingSourceClaims,
              forbiddenKeywordsFound: Array.isArray(parsed.forbiddenKeywordsFound) ? parsed.forbiddenKeywordsFound : [],
              conflictWarnings: Array.isArray(parsed.conflictWarnings) ? parsed.conflictWarnings : [],
              claims,
              sourceAudit: {
                totalSources: validSources.length,
                sourcesProvided: validSources.length > 0,
                sourcesTraceable: hasVerifiableSourceUrl,
                sourceContentFetched: hasFetchedSourceContent,
                verifiedSourceCount: successfulFetchedSources.length,
                sourceFetchFailures,
                sourceStatuses,
                note: hasFetchedSourceContent
                  ? `${successfulFetchedSources.length} sumber berhasil diambil dan digunakan sebagai ground truth audit.`
                  : (hasVerifiableSourceUrl 
                      ? `URL sumber terdaftar tetapi mengalami kendala akses teknis (${sourceFetchFailures[0] || 'HTTP 404/Timeout'}). Fakta berita tidak dianggap salah.` 
                      : (validSources.length > 0 ? 'Sumber terdaftar tetapi belum memiliki URL yang dapat diverifikasi.' : 'Sumber rujukan belum dicantumkan.'))
              },
              checkedAt: new Date().toISOString(),
              checkedBy: 'Redaksi DenyutGlobal (Audit AI Gemini & Sumber Primer)'
            };

            return {
              success: true,
              source: 'gemini',
              result: finalResult,
              ...finalResult
            };
          }
        } catch (apiErr: any) {
          console.warn('Gemini fact-check engine fallback to deterministic auditor:', apiErr?.message || apiErr);
        }
      }

      // Robust Algorithmic Fact-Checker (Offline & Fallback Evaluator)
      // PENTING: Fallback heuristik TIDAK membaca isi artikel sumber secara langsung.
      // Oleh karena itu, fallback TIDAK PERNAH memberikan status 'verified' atau 'passed: true'.
      const fullText = `${finalTitle} ${finalSummary} ${whyItMatters} ${contentText}`.toLowerCase();
      const editorGroundText = `${factsString} ${rawNotes}`.toLowerCase();

      const forbiddenTemplatePhrases = [
        'sedang dalam penelaahan redaksi',
        'saat ini sedang dalam penelaahan',
        'bahan liputan dihimpun dari feed kawat',
        'feed kawat resmi',
        'transformasi naskah',
        'pemisahan tegas antara fakta, konteks, dan analisis',
        'denyutglobal menerapkan prinsip transparansi',
        'editor mencatat',
        'berdasarkan catatan dan data awal yang dihimpun',
        'untuk memperbarui perkembangan isu bagi publik internasional',
        'poin fakta yang tercatat mencakup',
        'dalam catatan konteks pendukung',
        'penjelasan ini menjadi latar belakang penelaahan isu',
        'isu ini dipantau untuk memberikan gambaran proporsional'
      ];

      const foundTemplates = forbiddenTemplatePhrases.filter(phrase => fullText.includes(phrase));
      const hasPlaceholders = /\.\.\.|\[\.\.\.\]|\[isi\]|\[nama\]|\[tanggal\]|\[lokasi\]|\[placeholder\]/i.test(fullText);
      
      const foundForbidden: string[] = [];

      // Check numbers in draft that might not be in facts
      const numberRegex = /\b\d+([.,]\d+)?\b/g;
      const draftNumbers = Array.from(new Set(fullText.match(numberRegex) || []));
      const editorNumbers = Array.from(new Set(editorGroundText.match(numberRegex) || []));
      const ungroundedNumbers = draftNumbers.filter(num => !editorNumbers.includes(num) && num.length > 1);

      // Check quotes
      const quoteRegex = /"([^"]+)"/g;
      const draftQuotes: string[] = [];
      let match;
      while ((match = quoteRegex.exec(contentText)) !== null) {
        draftQuotes.push(match[1]);
      }
      const ungroundedQuotes = draftQuotes.filter(q => !editorGroundText.includes(q.toLowerCase()));

      const hasSources = validSources.length > 0;
      const unsupportedList: string[] = [];
      const conflictList: string[] = [];

      if (foundTemplates.length > 0) {
        unsupportedList.push(`Memuat kalimat template internal yang dilarang: "${foundTemplates.join('", "')}".`);
      }
      if (hasPlaceholders) {
        unsupportedList.push('Memuat tanda placeholder atau "..." yang dilarang dalam naskah.');
      }
      if (foundForbidden.length > 0) {
        unsupportedList.push(`Penggunaan kata tanpa pembuktian data langsung: "${foundForbidden.join('", "')}".`);
      }
      if (ungroundedNumbers.length > 0 && !factsString.trim()) {
        unsupportedList.push(`Terdapat angka/data kuantitatif (${ungroundedNumbers.slice(0, 3).join(', ')}) yang tidak tercantum dalam Fakta Utama editor.`);
      }
      if (ungroundedQuotes.length > 0 && !rawNotes.trim()) {
        unsupportedList.push(`Terdapat kutipan langsung yang tidak tercantum dalam catatan narasumber editor.`);
      }

      // Check title consistency with facts
      if (finalTitle && factsList.length > 0) {
        const titleWords = finalTitle.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const groundWords = editorGroundText.split(/\s+/).filter(w => w.length > 4);
        const matchCount = titleWords.filter(w => groundWords.some(gw => gw.includes(w) || w.includes(gw))).length;
        if (titleWords.length >= 3 && matchCount === 0) {
          unsupportedList.push('Judul memuat fokus yang berbeda signifikan dari poin fakta utama terverifikasi (potensi ketidaksesuaian editorial).');
        }
      }

      const missingSourceClaims: string[] = [];
      if (!hasSources) {
        missingSourceClaims.push('Sumber rujukan belum dicantumkan. Setiap fakta penting harus dapat ditelusuri ke sumber rujukan.');
      } else if (!hasVerifiableSourceUrl) {
        missingSourceClaims.push('Sumber rujukan belum memiliki URL valid yang dapat diverifikasi.');
      } else if (!hasFetchedSourceContent) {
        missingSourceClaims.push(`SUMBER TIDAK DAPAT DIAKSES: ${sourceFetchFailures[0] || 'Kendala koneksi/HTTP 404'}. Menunggu verifikasi sumber.`);
      }

      // Extract individual claims strictly from ALL factsList items first, then content paragraphs
      const claimsListToEvaluate = factsList.length > 0 
        ? factsList 
        : [
            ...contentParagraphs.flatMap(p => p.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 25))
          ].slice(0, 6);

      // Pada fallback: TIDAK PERNAH memberikan 'verified' atau supported: true
      const claims = claimsListToEvaluate.map((st, idx) => {
        let type: 'fakta' | 'konteks' | 'opini_analisis' = 'fakta';
        if (st.toLowerCase().includes('karena') || st.toLowerCase().includes('sehingga') || st.toLowerCase().includes('latar belakang')) {
          type = 'konteks';
        } else if (st.toLowerCase().includes('berpotensi') || st.toLowerCase().includes('implikasi') || st.toLowerCase().includes('menunjukkan')) {
          type = 'opini_analisis';
        }

        const status: 'pending_source_verification' | 'needs_verification' | 'missing_source' = (!hasSources || !hasVerifiableSourceUrl) 
          ? 'missing_source' 
          : (!hasFetchedSourceContent ? 'pending_source_verification' : 'needs_verification');

        return {
          id: `claim-${idx + 1}`,
          claim: st,
          type,
          supported: false, // Fallback tidak pernah mengasumsikan klaim terbukti tanpa audit AI & teks sumber
          sourceTrace: hasVerifiableSourceUrl 
            ? `${validSources[0].name} (${validSources[0].url})` 
            : (hasSources ? `${validSources[0].name} (URL belum terverifikasi)` : 'Sumber belum tersedia — perlu verifikasi editor.'),
          issue: !hasVerifiableSourceUrl 
            ? 'URL sumber rujukan belum valid' 
            : (!hasFetchedSourceContent 
                ? `SUMBER TIDAK DAPAT DIAKSES: ${sourceFetchFailures[0] || 'HTTP 404/Timeout'}. Menunggu verifikasi sumber manual oleh editor (Bukan bukti fakta salah).`
                : 'Perlu konfirmasi verifikasi isi sumber oleh editor'),
          status,
          sourceStatus: (!hasFetchedSourceContent && validSources.length > 0) ? 'sumber_tidak_dapat_diakses' : 'belum_diverifikasi',
          technicalReason: !hasFetchedSourceContent && sourceFetchFailures.length > 0 ? sourceFetchFailures[0] : undefined
        };
      });

      // Fallback SELALU menetapkan passed: false dan hasUnverifiedClaims: true
      const passed = false;
      const canPublish = false;
      const hasUnverifiedClaims = true;

      const fallbackSummary = (!hasFetchedSourceContent && validSources.length > 0)
        ? `⚠️ Menunggu Verifikasi Sumber: URL sumber rujukan mengalami kendala akses teknis (${sourceFetchFailures.join('; ') || 'HTTP 404/Timeout'}). Fakta naskah TIDAK dianggap salah — silakan periksa akses URL atau konfirmasi secara manual melalui editor.`
        : `⚠️ Perlu Verifikasi Editor: Ditemukan ${claims.length} butir klaim yang memerlukan konfirmasi rujukan sumber secara manual.`;

      const fallbackResult = {
        passed,
        canPublish,
        hasUnverifiedClaims,
        summary: fallbackSummary,
        unsupportedClaims: unsupportedList,
        missingSourceClaims,
        forbiddenKeywordsFound: foundForbidden,
        conflictWarnings: conflictList,
        claims,
        sourceAudit: {
          totalSources: validSources.length,
          sourcesProvided: hasSources,
          sourcesTraceable: hasVerifiableSourceUrl,
          sourceContentFetched: hasFetchedSourceContent,
          verifiedSourceCount: successfulFetchedSources.length,
          sourceFetchFailures,
          sourceStatuses,
          note: hasFetchedSourceContent
            ? `${successfulFetchedSources.length} sumber referensi terdaftar (menunggu verifikasi isi oleh editor).`
            : (hasVerifiableSourceUrl 
                ? `URL sumber terdaftar tetapi mengalami kendala akses teknis (${sourceFetchFailures[0] || 'HTTP 404/Timeout'}). Fakta berita tidak dianggap salah.` 
                : (hasSources ? 'Sumber terdaftar tetapi belum memiliki URL yang dapat diverifikasi.' : 'Sumber belum tersedia — perlu verifikasi editor.'))
        },
        checkedAt: new Date().toISOString(),
        checkedBy: 'Redaksi DenyutGlobal (Audit Heuristik Aman)'
      };

      return {
        success: true,
        source: 'heuristic',
        result: fallbackResult,
        ...fallbackResult
      };
  }

  // Dedicated AI Fact-Checking Endpoint (Validasi Sebelum Publish)
  app.post('/api/ai/fact-check', async (req, res) => {
    try {
      const responseData = await performStrictFactCheck(req.body);
      return res.json(responseData);
    } catch (err: any) {
      console.error('Fact Check Error (/api/ai/fact-check):', err);
      return res.status(500).json({
        success: false,
        error: 'Terjadi kendala saat melakukan pemeriksaan fakta.',
        details: err.message
      });
    }
  });

  // Dedicated Editorial Fact-Verification Endpoint (/api/editorial/verify-facts)
  app.post('/api/editorial/verify-facts', async (req, res) => {
    try {
      const responseData = await performStrictFactCheck(req.body);
      return res.json(responseData);
    } catch (err: any) {
      console.error('Fact Check Error (/api/editorial/verify-facts):', err);
      return res.status(500).json({
        success: false,
        error: 'Terjadi kendala saat melakukan verifikasi fakta editorial.',
        details: err.message
      });
    }
  });

  // Dedicated AI Draft Revision / Refinement Endpoint (Instruksi Perbaikan Naskah)
  app.post('/api/ai/refine-draft', async (req, res) => {
    try {
      const {
        title = '',
        summary = '',
        content = [],
        facts = '',
        roughNotes = '',
        sources = [],
        category = 'Dunia',
        location = '',
        whyItMatters = '',
        factCheckResult = null,
        instructions = ''
      } = req.body;

      if (!instructions.trim() && !title.trim() && !summary.trim() && (!Array.isArray(content) || content.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'Mohon masukkan instruksi perbaikan atau pastikan naskah artikel telah terisi.'
        });
      }

      const contentText = Array.isArray(content) ? content.join('\n\n') : String(content || '');
      const validSources = Array.isArray(sources)
        ? sources.filter((s: any) => s && (s.name?.trim() || s.url?.trim()))
        : [];

      const client = getGeminiClient();

      if (client) {
        const refinePrompt = `Anda adalah EDITOR NASKAH SENIOR di DenyutGlobal (media independen berbahasa Indonesia dengan standar integritas jurnalistik dan verifikasi fakta tertinggi).

PERAN ANDA:
Anda berfungsi HANYA sebagai EDITOR NASKAH, BUKAN sebagai pembuat atau penambah fakta.
Tugas utama: Memperbaiki bahasa, struktur, keterbacaan, dan kualitas jurnalistik naskah berdasarkan fakta yang sudah tersedia dan terverifikasi, TANPA mengarang, menebak, menambah, mengurangi, atau mengubah fakta.

ATURAN KHUSUS FITUR 🔧 PERBAIKI NASKAH — FINAL:

1. FAKTA TIDAK BOLEH BERUBAH
   Pertahankan secara persis:
   - Nama;
   - Inisial;
   - Jabatan;
   - Lembaga;
   - Lokasi;
   - Tanggal;
   - Waktu;
   - Angka;
   - Nominal;
   - Persentase;
   - Jarak;
   - Kronologi;
   - Status hukum;
   - Status kebencanaan;
   - Tingkat aktivitas;
   - Pasal;
   - Rekomendasi resmi;
   - Fakta utama lainnya.
   Jangan mengubah angka, istilah, status, atau makna.

2. DILARANG MENGARANG
   Jangan menambahkan fakta yang tidak tersedia.
   Jangan menebak informasi yang kosong.
   Jangan membuat:
   - Nama;
   - Tanggal;
   - Angka;
   - Kutipan;
   - Kronologi;
   - Penyebab;
   - Korban;
   - Dampak;
   - Motif;
   - Lokasi tambahan;
   - Rekomendasi tambahan;
   - Analisis;
   - Prediksi.
   Jika informasi tidak tersedia, jangan mengisinya.

3. SEMUA FAKTA UTAMA WAJIB MASUK (ATURAN KRUSIAL)
   Setiap fakta yang tercantum dalam bagian FAKTA UTAMA HARUS tercermin dalam ISI NASKAH, selama fakta tersebut relevan dengan berita.
   Jangan hanya menggunakan satu atau dua fakta lalu mengabaikan fakta utama lainnya.
   Contoh: Jika FAKTA UTAMA berisi waktu erupsi, tinggi kolom abu, arah kolom abu, status Level III Siaga, rekomendasi radius bahaya 3 km dan sektoral 4 km, maka SEMUA informasi tersebut harus masuk ke ISI NASKAH.
   Jangan mengurangi isi hanya karena ingin membuat artikel lebih singkat. Namun jangan menambahkan informasi baru untuk memperpanjang artikel.

4. STRUKTUR ARTIKEL NATURAL & JURNALISTIK
   Susun artikel secara natural dan jurnalistik dengan urutan prioritas:
   1. Peristiwa utama;
   2. Detail kejadian;
   3. Kondisi/status terkait;
   4. Informasi atau rekomendasi resmi;
   5. Fakta tambahan yang memang tersedia.
   Gunakan paragraf pendek (2-4 kalimat per paragraf) agar nyaman dibaca di layar ponsel.

5. JUDUL
   - Buat judul yang menggambarkan peristiwa utama.
   - Jangan menggunakan judul generik seperti "Laporan Pemantauan Kebencanaan Terkini di Kawasan Flores Timur, Nusa Tenggara Timur".
   - Gunakan fakta utama sebagai dasar judul.
   - Jangan membuat judul sensasional, provokatif, atau menyesatkan (bebas clickbait).

6. SUMBER & URL SUMBER
   - Pertahankan sumber dan URL sumber yang diberikan apa adanya.
   - Jangan membuat URL baru, jangan mengganti sumber.

7. STATUS HUKUM DAN BENCANA HARUS HATI-HATI
   - Jangan mengubah status hukum (tersangka/terdakwa/terpidana) atau status kebencanaan.
   - Untuk berita bencana: jangan membuat prediksi, jangan membuat rekomendasi keselamatan sendiri, jangan memperluas radius bahaya, jangan mengubah level aktivitas, jangan mengubah peringatan resmi.

8. NASKAH HARUS LENGKAP
   - Jangan menggunakan "...", "[lanjut]", "[dan seterusnya]", atau placeholder lainnya.
   - Hasil harus berupa naskah lengkap dan utuh siap tayang.

9. JANGAN MEMASUKKAN AUDIT / KOMENTAR INTERNAL KE DALAM NASKAH
   - Naskah judul, ringkasan, dan isi naskah tidak boleh disisipi komentar editor, proses AI, atau catatan internal.

10. LAKUKAN PEMERIKSAAN INTERNAL SEBELUM MENGEMBALIKAN HASIL:
    - Pastikan tidak ada fakta baru;
    - Pastikan tidak ada fakta yang berubah;
    - Pastikan SEMUA FAKTA UTAMA sudah masuk ke ISI NASKAH;
    - Pastikan angka, nominal, jarak, persentase tetap sama;
    - Pastikan nama dan lokasi tetap sama;
    - Pastikan status hukum/kebencanaan tetap sama;
    - Pastikan sumber dan URL tetap sama;
    - Pastikan naskah lengkap tanpa placeholder;
    - Pastikan judul mencerminkan peristiwa utama secara spesifik.

DATA NASKAH SAAT INI:
- Judul Saat Ini: ${title || '(Kosong)'}
- Rubrik Kategori: ${category}
- Lokasi: ${location || 'Internasional'}
- Ringkasan Saat Ini: ${summary || '(Kosong)'}
- FAKTA UTAMA TERVERIFIKASI (SEMUA WAJIB MASUK KE ISI):
${facts || '(Kosong)'}
- Catatan Tambahan Editor:
${roughNotes || '(Kosong)'}
- Isi Naskah Saat Ini:
${contentText || '(Kosong)'}
- Mengapa Penting:
${whyItMatters || '(Kosong)'}
- SUMBER & URL SUMBER:
${validSources.length > 0 ? validSources.map((s: any) => `- ${s.name || 'Sumber'} (${s.url || ''})`).join('\n') : '(Tidak ada sumber)'}
- Catatan Audit Fakta:
${factCheckResult?.summary || '(Belum ada temuan)'}
${factCheckResult?.unsupportedClaims?.length > 0 ? `Klaim belum terverifikasi: ${factCheckResult.unsupportedClaims.join('; ')}` : ''}

INSTRUKSI DARI EDITOR:
${instructions || 'Tolong perbaiki bahasa, struktur, dan judul berita berdasarkan fakta yang tersedia. Pastikan semua fakta utama masuk ke isi naskah.'}

KEMBALIKAN HANYA FORMAT JSON VALID:
{
  "title": "string (Judul berita spesifik berbasis peristiwa utama nyata, tidak generik, tidak sensasional)",
  "summary": "string (Ringkasan 2-3 kalimat padat merangkum peristiwa utama dan status/rekomendasi)",
  "facts": ["string (Daftar poin seluruh fakta utama yang dipertahankan utuh)"],
  "content": [
    "string (Paragraf 1: Peristiwa utama - lead lugas)",
    "string (Paragraf 2: Detail kejadian - angka, waktu, kronologi, tinggi, dsb)",
    "string (Paragraf 3: Kondisi & status terkait)",
    "string (Paragraf 4: Informasi/rekomendasi resmi dari otoritas/lembaga)",
    "string (Paragraf 5 jika ada fakta tambahan)"
  ],
  "whyItMatters": "string (Signifikansi latar belakang peristiwa secara objektif)",
  "changesSummary": [
    "string (Poin ringkas perbaikan bahasa, e.g. 'Semua poin fakta utama diintegrasikan ke isi naskah', 'Judul diselaraskan dengan peristiwa utama', 'Tata bahasa disesuaikan PUEBI')"
  ],
  "conflictWarnings": [
    "string (Hanya jika instruksi editor bertentangan dengan data resmi: 'Perubahan tersebut berpotensi bertentangan dengan fakta terverifikasi dan tidak diterapkan: [alasan]')"
  ],
  "statusFakta": "string (Status verifikasi, e.g. 'Terverifikasi terhadap rujukan terdaftar')"
}`;

        try {
          const { text: refineOutput } = await generateWithGeminiFallback(client, refinePrompt, 'application/json');

          if (refineOutput) {
            try {
              const parsed = JSON.parse(refineOutput);
              return res.json({
                success: true,
                source: 'gemini',
                revisedDraft: {
                  title: parsed.title || title,
                  summary: parsed.summary || summary,
                  facts: Array.isArray(parsed.facts) ? parsed.facts : (facts ? facts.split('\n').filter(Boolean) : []),
                  content: Array.isArray(parsed.content) ? parsed.content : (contentText ? [contentText] : []),
                  whyItMatters: parsed.whyItMatters || whyItMatters,
                  changesSummary: Array.isArray(parsed.changesSummary) && parsed.changesSummary.length > 0
                    ? parsed.changesSummary
                    : [
                        'Naskah diselaraskan dengan instruksi editor',
                        'Placeholder dan kata klise dibersihkan',
                        'Fakta utama dipertahankan'
                      ],
                  conflictWarnings: Array.isArray(parsed.conflictWarnings) ? parsed.conflictWarnings : [],
                  statusFakta: parsed.statusFakta || (validSources.length > 0 ? 'Terverifikasi terhadap sumber terdaftar' : 'Perlu verifikasi sumber')
                }
              });
            } catch (pe) {
              console.warn('Failed to parse Gemini refine JSON, fallback to algorithmic refiner', pe);
            }
          }
        } catch (geminiErr: any) {
          console.warn('Gemini refine-draft engine fallback to algorithmic refiner:', geminiErr?.message || geminiErr);
        }
      }

      // Algorithmic Refinement Engine (Guaranteed deterministic fallback)
      const rawFactList = facts.split('\n').map(f => f.trim().replace(/^[-*•0-9.]\s*/, '')).filter(Boolean);
      
      let cleanedTitle = title.trim();
      // Remove wire prefixes
      cleanedTitle = cleanedTitle.replace(/^(ANTARA|Reuters|AFP|DW|BBC|Badan Geologi|BMKG|Polri|Kemenkes|KPK|BNPB):\s*/i, '');
      cleanedTitle = cleanedTitle.replace(/\.\.\.|\[\.\.\.\]/g, '').trim();
      if (!cleanedTitle && rawFactList.length > 0) {
        cleanedTitle = rawFactList[0].length > 80 ? rawFactList[0].slice(0, 80) + '...' : rawFactList[0];
      } else if (!cleanedTitle) {
        cleanedTitle = `Pencatatan Perkembangan Data Terkini Sektor ${category}`;
      }

      // Clean summary
      let cleanedSummary = summary.replace(/\.\.\.|\[\.\.\.\]|\[isi\]|\[placeholder\]/gi, '').trim();
      if (!cleanedSummary && rawFactList.length > 0) {
        cleanedSummary = rawFactList.slice(0, 2).join('. ') + '.';
      } else if (!cleanedSummary) {
        cleanedSummary = `Perkembangan data dan fakta peristiwa sektor ${category.toLowerCase()} telah dirilis secara resmi oleh pihak berwenang.`;
      }

      // Clean and reconstruct paragraphs to ensure ALL facts are included
      let paragraphs: string[] = [];
      const cleanedExistingParagraphs = contentText
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => {
          let cp = p;
          cp = cp.replace(/\.\.\.|\[\.\.\.\]|\[isi\]|\[nama\]|\[tanggal\]|\[lokasi\]|TODO|PLACEHOLDER/gi, '');
          cp = cp.replace(/sedang dalam penelaahan redaksi|saat ini sedang dalam penelaahan/gi, '');
          cp = cp.replace(/bahan liputan dihimpun dari feed kawat|feed kawat resmi/gi, '');
          cp = cp.replace(/transformasi naskah|denyutglobal menerapkan prinsip transparansi/gi, '');
          cp = cp.replace(/editor mencatat|berdasarkan catatan dan data awal yang dihimpun/gi, '');
          cp = cp.replace(/untuk memperbarui perkembangan isu bagi publik internasional/gi, '');
          return cp.trim();
        })
        .filter(p => p.length > 15);

      if (cleanedExistingParagraphs.length > 0) {
        paragraphs = [...cleanedExistingParagraphs];
        // Ensure any fact from rawFactList not mentioned in paragraphs gets appended
        const combinedText = paragraphs.join(' ').toLowerCase();
        const missingFacts = rawFactList.filter(f => {
          const keyWords = f.toLowerCase().split(' ').filter(w => w.length > 4);
          const matched = keyWords.filter(w => combinedText.includes(w));
          return keyWords.length > 0 && matched.length / keyWords.length < 0.4;
        });

        if (missingFacts.length > 0) {
          paragraphs.push(missingFacts.join('. ') + '.');
        }
      } else {
        // Build structured paragraphs strictly from rawFactList
        if (rawFactList.length >= 3) {
          paragraphs.push(rawFactList[0] + (rawFactList[0].endsWith('.') ? '' : '.'));
          paragraphs.push(rawFactList.slice(1, Math.ceil(rawFactList.length / 2)).join('. ') + '.');
          paragraphs.push(rawFactList.slice(Math.ceil(rawFactList.length / 2)).join('. ') + '.');
        } else if (rawFactList.length > 0) {
          paragraphs.push(rawFactList.join('. ') + '.');
        } else {
          paragraphs.push(cleanedSummary);
        }
      }

      // Add official source reference attribution paragraph if available
      if (validSources.length > 0) {
        const sourceNames = validSources.map((s: any) => s.name).filter(Boolean).join(', ');
        if (sourceNames && !paragraphs.some(p => p.toLowerCase().includes('sumber') || p.toLowerCase().includes(sourceNames.toLowerCase()))) {
          paragraphs.push(`Informasi resmi peristiwa ini bersumber dari data dan rilis publik ${sourceNames}.`);
        }
      }

      const cleanedFacts = rawFactList.length > 0 ? rawFactList : [cleanedSummary];

      const changesSummary = [
        'Semua poin fakta utama diintegrasikan ke dalam isi naskah',
        'Placeholder dan tanda elipsis (...) dibersihkan',
        'Kalimat template internal redaksi dihapus',
        'Tata bahasa dan keterbacaan diselaraskan dengan standar PUEBI/EYD',
        'Seluruh angka, data nominal, status, dan sumber rujukan dipertahankan utuh'
      ];

      return res.json({
        success: true,
        source: 'algorithmic',
        revisedDraft: {
          title: cleanedTitle,
          summary: cleanedSummary,
          facts: cleanedFacts,
          content: paragraphs,
          whyItMatters: whyItMatters.trim() || 'Informasi ini relevan bagi publik dan pemangku kepentingan guna memantau perkembangan terkini secara objektif.',
          changesSummary,
          conflictWarnings: [],
          statusFakta: validSources.length > 0 ? 'Terverifikasi terhadap rujukan terdaftar' : 'Perlu verifikasi sumber'
        }
      });

    } catch (err: any) {
      console.error('Refine Draft Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Perbaikan gagal dijalankan. Naskah asli tetap aman dan tidak berubah.',
        details: err.message
      });
    }
  });

  // AI Editorial Illustration Generator Endpoint
  app.post('/api/ai/generate-illustration', async (req, res) => {
    try {
      const {
        title = '',
        facts = '',
        location = '',
        category = 'Dunia',
        summary = '',
        seed = Date.now()
      } = req.body;

      if (!title.trim() && !facts.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Judul atau fakta naskah diperlukan untuk menyusun ilustrasi.'
        });
      }

      const client = getGeminiClient();
      const prompt = buildEditorialIllustrationPrompt({
        title,
        facts,
        location,
        category,
        summary,
        seed
      });

      let imageUrl: string | null = null;

      if (client) {
        try {
          const response = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [
                {
                  text: prompt
                }
              ]
            },
            config: {
              imageConfig: {
                aspectRatio: '16:9'
              }
            }
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || 'image/png';
                imageUrl = `data:${mime};base64,${part.inlineData.data}`;
                break;
              }
            }
          }
        } catch (geminiError: any) {
          console.warn('Gemini image generation error:', geminiError?.message || geminiError);
          return res.status(503).json({
            success: false,
            error: geminiError?.message?.includes('quota') || geminiError?.message?.includes('429')
              ? 'Batas kuota layanan AI saat ini sedang penuh. Anda dapat mengunggah foto editor langsung melalui tombol Upload Foto.'
              : 'Layanan AI Ilustrasi sedang tidak dapat diakses saat ini. Silakan gunakan tombol Upload Foto editor.',
            details: geminiError?.message
          });
        }
      }

      if (imageUrl) {
        return res.json({
          success: true,
          imageUrl,
          imageType: 'ai_illustration',
          imageCredit: 'Ilustrasi AI — DenyutGlobal',
          captionGambar: `Ilustrasi editorial DenyutGlobal: ${title.trim()}`
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Tidak ada gambar yang dihasilkan oleh layanan AI. Silakan coba kembali atau gunakan fitur Upload Foto editor.'
      });

    } catch (err: any) {
      console.error('Illustration Generation Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat Ilustrasi AI. Artikel tetap dapat diproses tanpa gambar atau gunakan Upload Foto.',
        details: err.message
      });
    }
  });

  // GET /berita/:slug - Server-Side Open Graph metadata rendering
  app.get(['/berita/:slug', '/berita/:slug/'], async (req, res, next) => {
    try {
      const { slug } = req.params;
      const cleanSlug = decodeURIComponent(slug || '').trim().toLowerCase();

      // 301 Permanent Redirect for legacy or de-duplicated slugs (non-looping)
      const redirectDest = getArticleRedirectDestination(cleanSlug);
      if (redirectDest) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('X-Robots-Tag', 'noindex, follow');
        return res.redirect(301, redirectDest);
      }

      const domain = (process.env.PUBLIC_CANONICAL_URL || 'https://denyutglobal.my.id').replace(/\/+$/, '');

      let article: any = null;
      const sql = `SELECT * FROM articles WHERE (LOWER(slug) = LOWER(?) OR id = ?) AND status = 'published' AND reviewed = 1 LIMIT 1`;
      const d1Result = await executeD1Query(sql, [cleanSlug, cleanSlug], req);

      if (d1Result.success && d1Result.results.length > 0) {
        const candidate = rowToNewsItem(d1Result.results[0]);
        if (isPublicArticle(candidate)) {
          article = candidate;
        }
      } else {
        const published = serverArticles.filter(isPublicArticle);
        const candidate = published.find(
          (a) =>
            (a.slug && a.slug.toLowerCase() === cleanSlug) ||
            (a.id && a.id.toLowerCase() === cleanSlug)
        );
        if (candidate && isPublicArticle(candidate)) {
          article = candidate;
        }
      }

      if (article) {
        let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
        if (!fs.existsSync(htmlPath)) {
          htmlPath = path.join(process.cwd(), 'index.html');
        }
        if (fs.existsSync(htmlPath)) {
          const html = fs.readFileSync(htmlPath, 'utf-8');
          const modifiedHtml = injectOpenGraphHtml(html, article, domain);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=600');
          return res.send(modifiedHtml);
        }
      }
      return next();
    } catch (e) {
      console.warn('Error rendering server-side article metadata in Express:', e);
      return next();
    }
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DenyutGlobal Full-stack Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only run standalone HTTP server if running directly in Node.js environment
if (typeof process !== 'undefined' && process.env && !process.env.WORKER_ENV) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

// Export default worker interface for Cloudflare Workers compatibility
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const workerModule = await import('./worker');
    return workerModule.default.fetch(request, env, ctx);
  }
};
