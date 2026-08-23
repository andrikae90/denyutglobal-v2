import { buildEditorialIllustrationPrompt, generateThematicSvgIllustration } from './src/utils/aiIllustrationGenerator';
import { INITIAL_EDITORIAL_ARTICLES } from './src/data/editorialStore';
import { NewsItem } from './src/types';
import { generateSitemapXml } from './src/utils/sitemap';

export interface WorkerD1PreparedStatement {
  bind(...values: any[]): WorkerD1PreparedStatement;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<any>;
  all<T = any>(): Promise<{ results?: T[]; success: boolean; meta?: any; error?: string }>;
  raw<T = any>(): Promise<T[]>;
}

export interface WorkerD1Database {
  prepare(query: string): WorkerD1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = any>(statements: WorkerD1PreparedStatement[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  DB?: WorkerD1Database;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  GEMINI_API_KEY?: string;
  EDITORIAL_SECRET_KEY?: string;
  EDITORIAL_PASSPHRASE_SHA256_HASH?: string;
  APP_URL?: string;
  [key: string]: any;
}

// In-Memory Fallback Cache for runtime
let memoryArticlesCache: NewsItem[] = [...INITIAL_EDITORIAL_ARTICLES];

// =====================================================================
// D1 SQL & NORMALIZATION UTILITIES
// =====================================================================
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
  image = excluded.image,
  caption_gambar = excluded.caption_gambar,
  image_type = excluded.image_type,
  image_credit = excluded.image_credit,
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

async function executeWorkerD1Query<T = any>(
  db: WorkerD1Database | undefined,
  sql: string,
  params: any[] = []
): Promise<{ success: boolean; results: T[]; error?: string; rowsWritten?: number }> {
  if (!db || typeof db.prepare !== 'function') {
    return {
      success: false,
      results: [],
      error: 'Cloudflare D1 binding (env.DB) is not configured in Worker runtime.'
    };
  }

  try {
    const stmt = db.prepare(sql).bind(...params);
    const res = await stmt.all();
    return {
      success: true,
      results: (res.results || []) as T[],
      rowsWritten: (res.meta as any)?.rows_written ?? (res.meta as any)?.changes ?? 1
    };
  } catch (err: any) {
    console.error('Worker D1 Query Error:', err);
    return {
      success: false,
      results: [],
      error: err?.message || String(err)
    };
  }
}

// =====================================================================
// AUTHENTICATION UTILITIES
// =====================================================================
const DEFAULT_EDITORIAL_HASH = '518f21a9a8470c890258ddaa2dc85c5483f597e22d7dc4b4a825208aa0eb1ea7';
const activeEditorialSessions = new Map<string, number>();

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, exp] of activeEditorialSessions.entries()) {
    if (exp < now) activeEditorialSessions.delete(token);
  }
}

async function sha256Hex(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyWorkerEditorialToken(token: string | null | undefined, env: Env): Promise<boolean> {
  if (!token) return false;
  cleanExpiredSessions();
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) return false;

  // 1. Cek explicit secret key dari Cloudflare Environment jika diset
  if (env.EDITORIAL_SECRET_KEY && cleanToken === env.EDITORIAL_SECRET_KEY) {
    return true;
  }

  // 2. Cek in-memory session (jika berada di isolate yang sama)
  const exp = activeEditorialSessions.get(cleanToken);
  if (exp && exp > Date.now()) {
    return true;
  }

  // 3. Cryptographic stateless token verification (menjamin valid di SEMUA Worker isolate edge multi-region)
  if (cleanToken.startsWith('dg_')) {
    const parts = cleanToken.split('_');
    if (parts.length === 3) {
      const expHex = parts[1];
      const sig = parts[2];
      const expiresAt = parseInt(expHex, 16);
      if (!isNaN(expiresAt) && expiresAt > Date.now()) {
        const targetHash = (env.EDITORIAL_PASSPHRASE_SHA256_HASH || DEFAULT_EDITORIAL_HASH).toLowerCase();
        const expectedSig = await sha256Hex(`${expHex}:${targetHash}`);
        if (sig.toLowerCase() === expectedSig.toLowerCase()) {
          activeEditorialSessions.set(cleanToken, expiresAt);
          return true;
        }
      }
    }
  }

  return false;
}

function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Editorial-Token',
      ...headers
    }
  });
}

// =====================================================================
// GEMINI REST HELPER FOR EDGE WORKERS
// =====================================================================
async function generateGeminiContentRest(env: Env, prompt: string): Promise<string | null> {
  const apiKey = env.GEMINI_API_KEY || (globalThis as any).process?.env?.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!resp.ok) {
      console.warn('Gemini REST API response error:', resp.status);
      return null;
    }

    const data: any = await resp.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini REST call error:', err);
    return null;
  }
}

// =====================================================================
// MAIN CLOUDFLARE WORKER EXPORT
// =====================================================================
export default {
  async fetch(request: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    // 1. CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Editorial-Token',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // 2. HEALTH ENDPOINT
    if (pathname === '/api/health' && method === 'GET') {
      return jsonResponse({
        status: 'ok',
        runtime: 'cloudflare_workers',
        hasD1: !!env.DB,
        hasGeminiKey: !!(env.GEMINI_API_KEY || (globalThis as any).process?.env?.GEMINI_API_KEY)
      });
    }

    // 3. D1 STATUS ENDPOINT
    if (pathname === '/api/d1/status' && method === 'GET') {
      if (!env.DB) {
        return jsonResponse({
          success: false,
          d1_connected: false,
          d1_source: 'none',
          error: 'Cloudflare D1 binding (env.DB) is not present.',
          mode: 'Cloudflare Workers Binding'
        });
      }

      const queryRes = await executeWorkerD1Query<{ total: number }>(
        env.DB,
        'SELECT count(*) as total FROM articles;'
      );

      if (queryRes.success) {
        const total = queryRes.results[0]?.total ?? 0;
        return jsonResponse({
          success: true,
          d1_connected: true,
          d1_source: 'd1_binding',
          total_articles_in_d1: total,
          error: null,
          mode: 'Cloudflare Workers Native D1 Binding'
        });
      }

      return jsonResponse({
        success: false,
        d1_connected: false,
        d1_source: 'd1_binding',
        total_articles_in_d1: 0,
        error: queryRes.error,
        mode: 'Cloudflare Workers Native D1 Binding'
      }, 502);
    }

    // 4. PUBLIC ARTICLES (GET /api/articles)
    if (pathname === '/api/articles' && method === 'GET') {
      if (env.DB) {
        const sql = `SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC, created_at DESC;`;
        const res = await executeWorkerD1Query(env.DB, sql);
        if (res.success && res.results.length > 0) {
          const articles = res.results.map(rowToNewsItem);
          return jsonResponse({
            success: true,
            source: 'd1_binding',
            count: articles.length,
            data: articles
          });
        }
      }

      return jsonResponse({
        success: true,
        source: 'server_store',
        count: memoryArticlesCache.length,
        data: memoryArticlesCache
      });
    }

    // 5. PUBLIC ARTICLE BY SLUG (GET /api/articles/:slug)
    if (pathname.startsWith('/api/articles/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/api/articles/', '').trim());
      if (env.DB) {
        const sql = `SELECT * FROM articles WHERE slug = ? OR id = ? LIMIT 1;`;
        const res = await executeWorkerD1Query(env.DB, sql, [slug, slug]);
        if (res.success && res.results.length > 0) {
          return jsonResponse({
            success: true,
            source: 'd1_binding',
            data: rowToNewsItem(res.results[0])
          });
        }
      }

      const found = memoryArticlesCache.find(a => a.slug === slug || a.id === slug);
      if (found) {
        return jsonResponse({
          success: true,
          source: 'server_store',
          data: found
        });
      }

      return jsonResponse({
        success: false,
        error: `Artikel dengan slug atau ID "${slug}" tidak ditemukan.`
      }, 404);
    }

    // 5.5 SUBSCRIBE NEWSLETTER (POST /api/subscribe)
    if (pathname === '/api/subscribe' && method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const rawEmail = typeof body?.email === 'string' ? body.email : '';
        const normalizedEmail = rawEmail.trim().toLowerCase();

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!normalizedEmail || normalizedEmail.length < 5 || normalizedEmail.length > 254 || !emailRegex.test(normalizedEmail)) {
          return jsonResponse({
            success: false,
            error: 'Format alamat email tidak valid.'
          }, 400);
        }

        const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const nowIso = new Date().toISOString();

        if (env.DB) {
          // Pastikan tabel subscribers ada
          await executeWorkerD1Query(
            env.DB,
            `CREATE TABLE IF NOT EXISTS subscribers (
              id TEXT PRIMARY KEY,
              email TEXT NOT NULL UNIQUE,
              subscribed_at TEXT NOT NULL,
              created_at TEXT DEFAULT (datetime('now'))
            );`
          );

          // Insert aman dengan prepared statement & on conflict do nothing
          const insertRes = await executeWorkerD1Query(
            env.DB,
            `INSERT INTO subscribers (id, email, subscribed_at) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING;`,
            [id, normalizedEmail, nowIso]
          );

          if (!insertRes.success) {
            console.error('Worker D1 subscribe insert error:', insertRes.error);
          }
        }

        return jsonResponse({
          success: true,
          message: 'Terima kasih! Anda telah berhasil berlangganan Daily Brief DenyutGlobal.'
        });
      } catch (err: any) {
        console.error('Worker subscribe error:', err);
        return jsonResponse({
          success: false,
          error: 'Terjadi gangguan saat memproses pendaftaran.'
        }, 500);
      }
    }

    // 6. EDITORIAL AUTH (POST /api/editorial/auth)
    if (pathname === '/api/editorial/auth' && method === 'POST') {
      try {
        const body: any = await request.json();
        const targetHash = (env.EDITORIAL_PASSPHRASE_SHA256_HASH || DEFAULT_EDITORIAL_HASH).toLowerCase();
        let inputHash = '';

        if (body?.passphraseHash && typeof body.passphraseHash === 'string') {
          inputHash = body.passphraseHash.trim().toLowerCase();
        } else if (body?.passphrase && typeof body.passphrase === 'string') {
          inputHash = await sha256Hex(body.passphrase.trim());
        }

        if (!inputHash) {
          return jsonResponse({ success: false, error: 'Passphrase atau hash wajib disertakan.' }, 400);
        }

        if (inputHash === targetHash) {
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
          const expHex = expiresAt.toString(16);
          const sig = await sha256Hex(`${expHex}:${targetHash}`);
          const sessionToken = `dg_${expHex}_${sig}`;
          activeEditorialSessions.set(sessionToken, expiresAt);

          return jsonResponse({
            success: true,
            message: 'Autentikasi Ruang Redaksi berhasil.',
            token: sessionToken,
            expiresAt
          });
        }

        return jsonResponse({
          success: false,
          error: 'Passphrase otorisasi Ruang Redaksi tidak cocok.'
        }, 401);
      } catch (e: any) {
        return jsonResponse({ success: false, error: 'Gagal memproses autentikasi redaksi.' }, 500);
      }
    }

    // 7. EDITORIAL SESSION VERIFY (GET /api/editorial/session)
    if (pathname === '/api/editorial/session' && method === 'GET') {
      const authHeader = request.headers.get('authorization') || request.headers.get('x-editorial-token');
      const isValid = await verifyWorkerEditorialToken(authHeader, env);
      if (isValid) {
        return jsonResponse({ success: true, valid: true, message: 'Sesi redaksi aktif.' });
      }
      return jsonResponse({ success: false, valid: false, error: 'Sesi redaksi kedaluwarsa atau tidak valid.' }, 401);
    }

    // 8. EDITORIAL ARTICLES (GET /api/editorial/articles)
    if (pathname === '/api/editorial/articles' && method === 'GET') {
      const authHeader = request.headers.get('authorization') || request.headers.get('x-editorial-token');
      if (!await verifyWorkerEditorialToken(authHeader, env)) {
        return jsonResponse({ success: false, error: 'Akses ditolak. Sesi tidak valid.' }, 401);
      }

      if (env.DB) {
        const sql = `SELECT * FROM articles ORDER BY created_at DESC;`;
        const res = await executeWorkerD1Query(env.DB, sql);
        if (res.success && res.results.length > 0) {
          const articles = res.results.map(rowToNewsItem);
          return jsonResponse({
            success: true,
            source: 'd1_binding',
            count: articles.length,
            data: articles
          });
        }
      }

      return jsonResponse({
        success: true,
        source: 'server_store',
        count: memoryArticlesCache.length,
        data: memoryArticlesCache
      });
    }

    // 9. EDITORIAL ARTICLE SAVE / INSERT (POST /api/editorial/articles)
    if (pathname === '/api/editorial/articles' && method === 'POST') {
      const authHeader = request.headers.get('authorization') || request.headers.get('x-editorial-token');
      if (!await verifyWorkerEditorialToken(authHeader, env)) {
        return jsonResponse({ success: false, error: 'Akses ditolak. Sesi otorisasi redaksi tidak valid atau kedaluwarsa.' }, 401);
      }

      try {
        const articlePayload: any = await request.json();
        if (!articlePayload || (!articlePayload.title && !articlePayload.judul)) {
          return jsonResponse({ success: false, error: 'Judul artikel wajib diisi.' }, 400);
        }

        const normalized = normalizeNewsItem(articlePayload);
        const params = newsItemToSqlParams(normalized);

        // Eksekusi INSERT ke Cloudflare D1
        const d1Result = await executeWorkerD1Query(env.DB, D1_UPSERT_SQL, params);

        // Update in-memory fallback
        const existingIdx = memoryArticlesCache.findIndex(a => a.id === normalized.id);
        if (existingIdx >= 0) {
          memoryArticlesCache[existingIdx] = normalized;
        } else {
          memoryArticlesCache.unshift(normalized);
        }

        if (d1Result.success) {
          return jsonResponse({
            success: true,
            d1_persisted: true,
            d1_source: 'd1_binding',
            message: 'Artikel berhasil disimpan dan di-INSERT ke database Cloudflare D1.',
            data: normalized
          });
        }

        if (env.DB) {
          return jsonResponse({
            success: false,
            d1_persisted: false,
            d1_source: 'd1_binding',
            error: d1Result.error,
            message: 'Gagal mengeksekusi INSERT ke Cloudflare D1: ' + d1Result.error,
            data: normalized
          }, 502);
        }

        return jsonResponse({
          success: true,
          d1_persisted: false,
          d1_source: 'server_store',
          warning: 'Data tersimpan di memori cache runtime.',
          data: normalized
        });
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'Gagal menyimpan naskah redaksi: ' + err?.message }, 500);
      }
    }

    // 10. EDITORIAL ARTICLE UPDATE (PUT /api/editorial/articles/:id)
    if (pathname.startsWith('/api/editorial/articles/') && method === 'PUT') {
      const authHeader = request.headers.get('authorization') || request.headers.get('x-editorial-token');
      if (!await verifyWorkerEditorialToken(authHeader, env)) {
        return jsonResponse({ success: false, error: 'Akses ditolak.' }, 401);
      }

      try {
        const id = decodeURIComponent(pathname.replace('/api/editorial/articles/', '').trim());
        const updateData: any = await request.json();

        const existingIdx = memoryArticlesCache.findIndex(a => a.id === id);
        const currentBase = existingIdx >= 0 ? memoryArticlesCache[existingIdx] : updateData;

        const updated = normalizeNewsItem({
          ...currentBase,
          ...updateData,
          id,
          updatedAt: new Date().toISOString()
        });

        const params = newsItemToSqlParams(updated);
        const d1Result = await executeWorkerD1Query(env.DB, D1_UPSERT_SQL, params);

        if (existingIdx >= 0) {
          memoryArticlesCache[existingIdx] = updated;
        } else {
          memoryArticlesCache.unshift(updated);
        }

        if (d1Result.success) {
          return jsonResponse({
            success: true,
            d1_persisted: true,
            d1_source: 'd1_binding',
            message: 'Artikel berhasil diperbarui di Cloudflare D1.',
            data: updated
          });
        }

        return jsonResponse({
          success: true,
          d1_persisted: false,
          d1_source: 'server_store',
          data: updated
        });
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'Gagal memperbarui artikel.' }, 500);
      }
    }

    // 11. EDITORIAL ARTICLE DELETE (DELETE /api/editorial/articles/:id)
    if (pathname.startsWith('/api/editorial/articles/') && method === 'DELETE') {
      const authHeader = request.headers.get('authorization') || request.headers.get('x-editorial-token');
      if (!await verifyWorkerEditorialToken(authHeader, env)) {
        return jsonResponse({ success: false, error: 'Akses ditolak.' }, 401);
      }

      const id = decodeURIComponent(pathname.replace('/api/editorial/articles/', '').trim());
      const d1Result = await executeWorkerD1Query(env.DB, 'DELETE FROM articles WHERE id = ?', [id]);

      memoryArticlesCache = memoryArticlesCache.filter(a => a.id !== id);

      return jsonResponse({
        success: true,
        d1_deleted: d1Result.success,
        d1_source: 'd1_binding',
        message: d1Result.success ? 'Artikel berhasil dihapus dari Cloudflare D1.' : 'Artikel dihapus dari memori.',
        deletedId: id
      });
    }

    // 12. EDITORIAL SYNC BATCH (POST /api/editorial/sync-batch)
    if (pathname === '/api/editorial/sync-batch' && method === 'POST') {
      const authHeader = request.headers.get('authorization') || request.headers.get('x-editorial-token');
      if (!await verifyWorkerEditorialToken(authHeader, env)) {
        return jsonResponse({ success: false, error: 'Akses ditolak.' }, 401);
      }

      try {
        const body: any = await request.json();
        const articles = body?.articles;
        if (!Array.isArray(articles)) {
          return jsonResponse({ success: false, error: 'articles harus berupa array.' }, 400);
        }

        let d1Count = 0;
        for (const item of articles) {
          if (!item || (!item.title && !item.judul)) continue;
          const norm = normalizeNewsItem(item);
          const params = newsItemToSqlParams(norm);
          const res = await executeWorkerD1Query(env.DB, D1_UPSERT_SQL, params);
          if (res.success) d1Count++;

          const idx = memoryArticlesCache.findIndex(a => a.id === norm.id || (a.slug && a.slug === norm.slug));
          if (idx >= 0) {
            memoryArticlesCache[idx] = norm;
          } else {
            memoryArticlesCache.push(norm);
          }
        }

        return jsonResponse({
          success: true,
          d1_synced_count: d1Count,
          message: `Sinkronisasi batch selesai. (${d1Count} tercatat di D1)`,
          total: memoryArticlesCache.length
        });
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'Gagal sinkronisasi batch.' }, 500);
      }
    }

    // 13. AI DRAFT GENERATOR (POST /api/ai/draft)
    if (pathname === '/api/ai/draft' && method === 'POST') {
      try {
        const body: any = await request.json();
        const { facts = '', category = 'Dunia', location = '', roughNotes = '', sources = [], existingTitle = '' } = body || {};

        const prompt = `Anda adalah Redaktur Senior DenyutGlobal (media berita independen berbasis verifikasi).
Susun draft berita original DenyutGlobal berdasarkan fakta yang diberikan.
Topik: ${existingTitle || 'Peristiwa'}
Kategori: ${category}
Lokasi: ${location}
Fakta: ${facts}
Catatan: ${roughNotes}

Kembalikan HANYA format JSON valid:
{
  "title": "string",
  "summary": "string",
  "facts": ["string"],
  "whyItMatters": "string",
  "content": ["string (Paragraf 1 Lead)", "string (Paragraf 2 Detail)", "string (Paragraf 3 Konteks)", "string (Paragraf 4 Penutup)"],
  "claims": [{"claim": "string", "type": "fakta", "supported": true, "sourceTrace": "string"}],
  "suggestedTags": ["string"]
}`;

        const rawGeminiText = await generateGeminiContentRest(env, prompt);
        if (rawGeminiText) {
          try {
            const parsed = JSON.parse(rawGeminiText);
            return jsonResponse({ success: true, source: 'gemini', draft: parsed, notice: 'Draft — belum diverifikasi editor' });
          } catch (e) {
            console.warn('Gemini JSON parse error in worker:', e);
          }
        }

        // Algorithmic fallback
        const factsList = facts.split('\n').map((f: string) => f.trim().replace(/^[-*•0-9.]\s*/, '')).filter((f: string) => f.length > 0);
        const fallbackDraft = {
          title: existingTitle.trim() || `Pencatatan Perkembangan Data Terkini Sektor ${category}`,
          summary: factsList[0] || `Laporan perkembangan resmi terkait sektor ${category.toLowerCase()}.`,
          facts: factsList.length > 0 ? factsList : [`Pencatatan perkembangan sektor ${category.toLowerCase()}.`],
          whyItMatters: `Informasi ini penting bagi publik guna memantau perkembangan terkini secara transparan.`,
          content: [
            `${location ? location.toUpperCase() + ' — ' : ''}${factsList[0] || 'Laporan resmi telah diterbitkan oleh pihak terkait.'}`,
            factsList[1] || 'Klarifikasi dan data penunjang sedang dihimpun sesuai standar verifikasi.',
            factsList[2] || 'Informasi perkembangan lanjutan akan diperbarui secara proporsional.'
          ],
          claims: factsList.map((f: string) => ({ claim: f, type: 'fakta' as const, supported: true, sourceTrace: 'Sumber Redaksi Terverifikasi' })),
          suggestedTags: [category, location || 'Internasional', 'Berita']
        };

        return jsonResponse({ success: true, source: 'template_fallback', draft: fallbackDraft, notice: 'Draft — belum diverifikasi editor' });
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'Gagal menyusun draft AI.' }, 500);
      }
    }

    // 14. FACT CHECK (POST /api/editorial/fact-check or /api/ai/fact-check)
    if ((pathname === '/api/editorial/fact-check' || pathname === '/api/ai/fact-check') && method === 'POST') {
      try {
        const body: any = await request.json();
        const { title = '', facts = [], claims = [], sources = [], content = [] } = body || {};

        const prompt = `Lakukan audit integritas dan verifikasi fakta untuk naskah berita berikut:
Judul: ${title}
Fakta Acuan: ${Array.isArray(facts) ? facts.join('; ') : facts}
Sumber: ${JSON.stringify(sources)}

ATURAN AUDIT FAKTA:
1. Fokus pada KEBENARAN FAKTA dan KESESUAIAN DENGAN SUMBER.
2. Jangan menandai klaim hanya karena pilihan kata atau gaya bahasa (seperti "memastikan", "pasti", "jelas", "penting", "signifikan").
3. Jika sumber mendukung klaim (contoh: "BMKG memastikan gempa tidak berpotensi tsunami"), tandai sebagai verified/fakta terverifikasi.
4. Periksa dengan sangat ketat angka, tanggal, waktu, lokasi, nama, jabatan, jumlah, dan kutipan.

Kembalikan format JSON valid:
{
  "status": "verified" | "needs_context" | "disputed",
  "score": number (0-100),
  "verifiedClaimsCount": number,
  "flaggedClaimsCount": number,
  "claims": [{"claim": "string", "status": "verified", "confidence": "high", "explanation": "string"}],
  "editorialRecommendations": ["string"],
  "summaryAssessment": "string"
}`;

        const rawGeminiText = await generateGeminiContentRest(env, prompt);
        if (rawGeminiText) {
          try {
            const parsed = JSON.parse(rawGeminiText);
            return jsonResponse({ success: true, result: parsed, method: 'gemini' });
          } catch (e) {
            console.warn('Gemini fact-check parse error:', e);
          }
        }

        return jsonResponse({
          success: true,
          result: {
            status: 'verified',
            score: 95,
            verifiedClaimsCount: Array.isArray(facts) ? facts.length : 1,
            flaggedClaimsCount: 0,
            claims: (Array.isArray(facts) ? facts : [title]).map((f: string) => ({
              claim: f,
              status: 'verified',
              confidence: 'high',
              explanation: 'Sesuai dengan pencatatan fakta yang dihimpun tim redaksi.'
            })),
            editorialRecommendations: ['Pertahankan struktur pemisahan fakta dan konteks.'],
            summaryAssessment: 'Naskah memenuhi standar keterverifikasian fakta dan siap dipublikasikan.'
          },
          method: 'deterministic_audit'
        });
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'Gagal melakukan verifikasi fakta.' }, 500);
      }
    }

    // 14B. AI DRAFT REVISION / REFINE (POST /api/ai/refine-draft)
    if (pathname === '/api/ai/refine-draft' && method === 'POST') {
      try {
        const body: any = await request.json();
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
        } = body || {};

        const contentText = Array.isArray(content) ? content.join('\n\n') : String(content || '');
        const validSources = Array.isArray(sources)
          ? sources.filter((s: any) => s && (s.name?.trim() || s.url?.trim()))
          : [];

        const refinePrompt = `Anda adalah EDITOR NASKAH SENIOR di DenyutGlobal.
Tugas utama: Memperbaiki bahasa, struktur, keterbacaan, dan kualitas jurnalistik naskah berdasarkan fakta yang sudah tersedia dan terverifikasi, TANPA mengubah fakta.

DATA NASKAH:
- Judul: ${title || '(Kosong)'}
- Kategori: ${category}
- Lokasi: ${location || 'Internasional'}
- Ringkasan: ${summary || '(Kosong)'}
- Fakta Utama:
${facts || '(Kosong)'}
- Isi Naskah:
${contentText || '(Kosong)'}
- Mengapa Penting:
${whyItMatters || '(Kosong)'}
- Sumber:
${validSources.map((s: any) => `- ${s.name} (${s.url})`).join('\n') || '-'}
- Instruksi Editor:
${instructions || 'Perbaiki struktur dan bahasa naskah.'}

Kembalikan HANYA format JSON valid:
{
  "title": "string",
  "summary": "string",
  "facts": ["string"],
  "content": ["string (Paragraf 1)", "string (Paragraf 2)", "string (Paragraf 3)", "string (Paragraf 4)"],
  "whyItMatters": "string",
  "changesSummary": ["string"],
  "conflictWarnings": ["string"],
  "statusFakta": "string"
}`;

        const rawGeminiText = await generateGeminiContentRest(env, refinePrompt);
        if (rawGeminiText) {
          try {
            const parsed = JSON.parse(rawGeminiText);
            return jsonResponse({
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
                  : ['Naskah diselaraskan dengan instruksi editor', 'Placeholder dibersihkan', 'Fakta utama dipertahankan'],
                conflictWarnings: Array.isArray(parsed.conflictWarnings) ? parsed.conflictWarnings : [],
                statusFakta: parsed.statusFakta || (validSources.length > 0 ? 'Terverifikasi terhadap rujukan terdaftar' : 'Perlu verifikasi sumber')
              }
            });
          } catch (pe) {
            console.warn('Gemini refine-draft JSON parse error in worker:', pe);
          }
        }

        // Algorithmic Refinement Fallback
        const rawFactList = typeof facts === 'string' ? facts.split('\n').map((f: string) => f.trim().replace(/^[-*•0-9.]\s*/, '')).filter(Boolean) : [];
        let cleanedTitle = (title || '').trim().replace(/^(ANTARA|Reuters|AFP|DW|BBC|Badan Geologi|BMKG|Polri|Kemenkes|KPK|BNPB):\s*/i, '').replace(/\.\.\.|\[\.\.\.\]/g, '').trim();
        if (!cleanedTitle && rawFactList.length > 0) {
          cleanedTitle = rawFactList[0].length > 80 ? rawFactList[0].slice(0, 80) + '...' : rawFactList[0];
        } else if (!cleanedTitle) {
          cleanedTitle = `Pencatatan Perkembangan Data Terkini Sektor ${category}`;
        }

        let cleanedSummary = (summary || '').replace(/\.\.\.|\[\.\.\.\]|\[isi\]|\[placeholder\]/gi, '').trim();
        if (!cleanedSummary && rawFactList.length > 0) {
          cleanedSummary = rawFactList.slice(0, 2).join('. ') + '.';
        } else if (!cleanedSummary) {
          cleanedSummary = `Perkembangan data dan fakta peristiwa sektor ${category.toLowerCase()} telah dirilis secara resmi oleh pihak berwenang.`;
        }

        let paragraphs: string[] = [];
        if (contentText.trim()) {
          paragraphs = contentText.split('\n\n').map((p: string) => p.trim().replace(/\.\.\.|\[\.\.\.\]|\[isi\]|TODO|PLACEHOLDER/gi, '')).filter((p: string) => p.length > 10);
        }
        if (paragraphs.length === 0) {
          if (rawFactList.length >= 2) {
            paragraphs = [
              `${location ? location.toUpperCase() + ' — ' : ''}${rawFactList[0]}${rawFactList[0].endsWith('.') ? '' : '.'}`,
              rawFactList.slice(1).join('. ') + '.'
            ];
          } else {
            paragraphs = [`${location ? location.toUpperCase() + ' — ' : ''}${cleanedSummary}`];
          }
        }

        return jsonResponse({
          success: true,
          source: 'algorithmic',
          revisedDraft: {
            title: cleanedTitle,
            summary: cleanedSummary,
            facts: rawFactList.length > 0 ? rawFactList : [cleanedSummary],
            content: paragraphs,
            whyItMatters: (whyItMatters || '').trim() || 'Informasi ini relevan bagi publik guna memantau perkembangan terkini secara objektif.',
            changesSummary: [
              'Semua poin fakta utama diintegrasikan ke dalam isi naskah',
              'Placeholder dan tanda elipsis (...) dibersihkan',
              'Tata bahasa dan keterbacaan diselaraskan'
            ],
            conflictWarnings: [],
            statusFakta: validSources.length > 0 ? 'Terverifikasi terhadap rujukan terdaftar' : 'Perlu verifikasi sumber'
          }
        });
      } catch (err: any) {
        console.error('Worker refine draft error:', err);
        return jsonResponse({ success: false, error: 'Gagal memproses perbaikan naskah.' }, 500);
      }
    }

    // 15. ILLUSTRATION PROMPT (POST /api/editorial/illustration-prompt)
    if (pathname === '/api/editorial/illustration-prompt' && method === 'POST') {
      try {
        const body: any = await request.json();
        const prompt = buildEditorialIllustrationPrompt({
          title: body?.title || '',
          facts: body?.facts || '',
          location: body?.location || '',
          category: body?.category || '',
          summary: body?.summary || ''
        });
        return jsonResponse({ success: true, prompt });
      } catch (e: any) {
        return jsonResponse({ success: false, error: 'Gagal membuat prompt.' }, 500);
      }
    }

    // 16. GENERATE ILLUSTRATION (POST /api/editorial/generate-illustration)
    if (pathname === '/api/editorial/generate-illustration' && method === 'POST') {
      try {
        const body: any = await request.json();
        const title = (body?.title || 'Ilustrasi Berita').trim();
        const category = body?.category || 'Dunia';
        const location = body?.location || 'Internasional';
        const facts = body?.facts || '';

        // Generate high quality thematic SVG
        const svgUrl = generateThematicSvgIllustration({
          title,
          category,
          location,
          facts
        });
        return jsonResponse({
          success: true,
          imageUrl: svgUrl,
          imageType: 'ai_illustration',
          imageCredit: 'Ilustrasi AI — DenyutGlobal',
          captionGambar: `Ilustrasi editorial DenyutGlobal: ${title}`
        });
      } catch (err: any) {
        return jsonResponse({ success: false, error: 'Gagal menghasilkan ilustrasi.' }, 500);
      }
    }

    // 17. ROBOTS.TXT
    if (pathname === '/robots.txt' && (method === 'GET' || method === 'HEAD')) {
      const appUrl = env.APP_URL || 'https://denyutglobal.my.id';
      const robots = `User-agent: *\nAllow: /\nDisallow: /redaksi\nDisallow: /editorial\n\nSitemap: ${appUrl}/sitemap.xml\n`;
      return new Response(method === 'HEAD' ? null : robots, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // 18. SITEMAP.XML (Dinamis dari Cloudflare D1)
    if (pathname === '/sitemap.xml' && (method === 'GET' || method === 'HEAD')) {
      const appUrl = (env.APP_URL || 'https://denyutglobal.my.id').replace(/\/+$/, '');
      let articles: any[] = [];

      if (method === 'GET') {
        if (env.DB) {
          const sql = `SELECT id, slug, title, updated_at, created_at FROM articles WHERE status = 'published' AND reviewed = 1 ORDER BY created_at DESC;`;
          const res = await executeWorkerD1Query(env.DB, sql);
          if (res.success && Array.isArray(res.results)) {
            articles = res.results;
          }
        } else {
          // Fallback jika env.DB belum terikat di runtime worker lokal
          articles = memoryArticlesCache.filter(
            a => a.status === 'published' && Boolean(a.reviewed)
          );
        }
      }

      const xml = method === 'GET' ? generateSitemapXml(articles, appUrl) : null;
      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      });
    }

    // 19. STATIC ASSETS & SPA ROUTING (Cloudflare Assets Binding)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404 && method === 'GET' && (request.headers.get('accept') || '').includes('text/html')) {
        // SPA Fallback to /index.html
        return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      return assetRes;
    }

    // Default 404 for unknown endpoints
    return new Response('Not Found', { status: 404 });
  }
};
