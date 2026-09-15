import worker from './worker';
import { uploadEditorialImageToCloudinary, uploadLegacyRemoteImageToCloudinary } from './src/services/cloudinaryImageService';
import type { ExecutionContext, ScheduledController } from '@cloudflare/workers-types';

type WorkerEnv = Record<string, any>;

function copyEditorialHeaders(request: Request): Headers {
  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const editorialToken = request.headers.get('x-editorial-token');
  if (authorization) headers.set('authorization', authorization);
  if (editorialToken) headers.set('x-editorial-token', editorialToken);
  return headers;
}

async function verifyEditorialSession(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response | null> {
  const authHeaders = copyEditorialHeaders(request);
  if (!authHeaders.has('authorization') && !authHeaders.has('x-editorial-token')) {
    return new Response(JSON.stringify({ success: false, error: 'Akses ditolak. Sesi redaksi tidak ditemukan.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
  const sessionUrl = new URL('/api/editorial/session', request.url);
  const sessionRequest = new Request(sessionUrl.toString(), { method: 'GET', headers: authHeaders });
  const response = await worker.fetch(sessionRequest, env as any, ctx as any);
  if (response.ok) return null;
  return response;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function dataUrlToFile(dataUrl: string): File | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl.trim());
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';
    return new File([bytes], `editorial-image.${extension}`, { type: mimeType });
  } catch {
    return null;
  }
}

async function migrateArticleImageToCloudinary(article: any, env: WorkerEnv): Promise<any> {
  if (!article || typeof article !== 'object') return article;
  const imageType = typeof article.imageType === 'string' ? article.imageType : '';
  const image = typeof article.image === 'string' ? article.image.trim() : '';
  if (imageType !== 'photo' || !image.startsWith('data:image/')) return article;
  const file = dataUrlToFile(image);
  if (!file) throw new Error('Format foto tidak valid untuk penyimpanan Cloudinary. Gunakan JPEG, PNG, atau WebP.');
  const uploaded = await uploadEditorialImageToCloudinary(file, env);
  return {
    ...article,
    image: uploaded.secureUrl,
    gambar: uploaded.secureUrl,
    imageType: 'photo',
    imageCredit: typeof article.imageCredit === 'string' && article.imageCredit.trim() ? article.imageCredit : 'Dok. Redaksi DenyutGlobal',
    cloudinaryPublicId: uploaded.publicId
  };
}

async function ensureMigrationTable(db: any): Promise<void> {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS image_migration_log (
      article_id TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      cloudinary_url TEXT NOT NULL,
      cloudinary_public_id TEXT,
      migrated_at TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1
    )
  `).run();
}

function isCloudinaryUrl(value: string): boolean {
  return /(^|:)\/\/res\.cloudinary\.com\//i.test(value.trim());
}

async function migrateLegacyBatch(env: WorkerEnv, limit: number): Promise<{ requested: number; migrated: any[]; failed: any[] }> {
  if (!env.DB) throw new Error('Cloudflare D1 tidak tersedia.');
  await ensureMigrationTable(env.DB);
  const safeLimit = Math.min(Math.max(Math.floor(limit || 1), 1), 5);
  const result: any = await env.DB.prepare(`
    SELECT id, slug, image, image_type, image_credit
    FROM articles
    WHERE image LIKE 'http%'
      AND image NOT LIKE '%res.cloudinary.com/%'
    ORDER BY COALESCE(published_at, updated_at) ASC, id ASC
    LIMIT ?
  `).bind(safeLimit).all();
  const candidates = result?.results || [];
  const migrated: any[] = [];
  const failed: any[] = [];

  for (const row of candidates) {
    const originalUrl = String(row.image || '').trim();
    try {
      if (!originalUrl || isCloudinaryUrl(originalUrl)) continue;
      const uploaded = await uploadLegacyRemoteImageToCloudinary(originalUrl, env);
      const now = new Date().toISOString();
      const update = await env.DB.prepare(`
        UPDATE articles
        SET image = ?, image_type = 'photo', image_credit = CASE WHEN TRIM(COALESCE(image_credit, '')) != '' THEN image_credit ELSE 'Dok. Redaksi DenyutGlobal' END
        WHERE id = ? AND image = ?
      `).bind(uploaded.secureUrl, row.id, originalUrl).run();
      if (update?.success === false || Number(update?.meta?.changes ?? 1) < 1) {
        throw new Error('URL artikel tidak berhasil diperbarui; URL lama tetap dipertahankan.');
      }
      await env.DB.prepare(`
        INSERT INTO image_migration_log (article_id, original_url, cloudinary_url, cloudinary_public_id, migrated_at, verified)
        VALUES (?, ?, ?, ?, ?, 1)
        ON CONFLICT(article_id) DO UPDATE SET
          original_url = excluded.original_url,
          cloudinary_url = excluded.cloudinary_url,
          cloudinary_public_id = excluded.cloudinary_public_id,
          migrated_at = excluded.migrated_at,
          verified = excluded.verified
      `).bind(row.id, originalUrl, uploaded.secureUrl, uploaded.publicId, now).run();
      migrated.push({ id: row.id, slug: row.slug, cloudinaryUrl: uploaded.secureUrl, bytes: uploaded.bytes });
    } catch (error: any) {
      failed.push({ id: row.id, slug: row.slug, error: error?.message || 'Migrasi gagal.' });
    }
  }
  return { requested: candidates.length, migrated, failed };
}

async function handleLegacyImageMigration(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response | null> {
  const pathname = new URL(request.url).pathname;
  if (pathname !== '/api/editorial/image-migration' && pathname !== '/api/editorial/image-migration/status') return null;

  const authFailure = await verifyEditorialSession(request, env, ctx);
  if (authFailure) return authFailure;
  if (!env.DB) return jsonResponse({ success: false, error: 'Cloudflare D1 tidak tersedia.' }, 503);

  try {
    await ensureMigrationTable(env.DB);

    if (pathname.endsWith('/status')) {
      if (request.method !== 'GET') return jsonResponse({ success: false, error: 'Method tidak diizinkan.' }, 405);
      const row: any = await env.DB.prepare(`
        SELECT
          COUNT(*) AS total_articles,
          SUM(CASE WHEN image IS NOT NULL AND TRIM(image) != '' THEN 1 ELSE 0 END) AS articles_with_images,
          SUM(CASE WHEN image LIKE 'data:image/%' THEN 1 ELSE 0 END) AS data_url_images,
          SUM(CASE WHEN image LIKE 'http%' AND image NOT LIKE '%res.cloudinary.com/%' THEN 1 ELSE 0 END) AS legacy_remote_images,
          SUM(CASE WHEN image LIKE '%res.cloudinary.com/%' THEN 1 ELSE 0 END) AS cloudinary_images
        FROM articles
      `).first();
      const migrated: any = await env.DB.prepare('SELECT COUNT(*) AS count FROM image_migration_log WHERE verified = 1').first();
      return jsonResponse({
        success: true,
        totalArticles: Number(row?.total_articles || 0),
        articlesWithImages: Number(row?.articles_with_images || 0),
        dataUrlImages: Number(row?.data_url_images || 0),
        legacyRemoteImages: Number(row?.legacy_remote_images || 0),
        cloudinaryImages: Number(row?.cloudinary_images || 0),
        verifiedMigrations: Number(migrated?.count || 0),
        note: 'Gambar lama tidak dihapus. URL artikel hanya diganti setelah upload Cloudinary berhasil.'
      });
    }

    if (request.method !== 'POST') return jsonResponse({ success: false, error: 'Method tidak diizinkan.' }, 405);
    const body: any = await request.json().catch(() => ({}));
    const requestedLimit = Number(body?.limit ?? 5);
    const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? Math.floor(requestedLimit) : 5, 1), 5);
    const dryRun = body?.dryRun === true;

    if (dryRun) {
      const result: any = await env.DB.prepare(`
        SELECT id, slug, image
        FROM articles
        WHERE image LIKE 'http%'
          AND image NOT LIKE '%res.cloudinary.com/%'
        ORDER BY COALESCE(published_at, updated_at) ASC, id ASC
        LIMIT ?
      `).bind(limit).all();
      const candidates = result?.results || [];
      return jsonResponse({
        success: true,
        dryRun: true,
        count: candidates.length,
        candidates: candidates.map((row: any) => ({ id: row.id, slug: row.slug, image: row.image }))
      });
    }

    const result = await migrateLegacyBatch(env, limit);
    return jsonResponse({ success: true, dryRun: false, ...result, note: 'URL lama tidak dihapus dari sumber. Jika migrasi gagal, artikel tetap menggunakan URL lama.' });
  } catch (error: any) {
    console.error('Legacy image migration error:', error);
    return jsonResponse({ success: false, error: 'Migrasi gambar lama gagal diproses.' }, 500);
  }
}

async function prepareEditorialJsonRequest(request: Request, env: WorkerEnv): Promise<Request> {
  const body = await request.json();
  if (request.url.includes('/api/editorial/sync-batch')) {
    if (Array.isArray(body?.articles)) body.articles = await Promise.all(body.articles.map((article: any) => migrateArticleImageToCloudinary(article, env)));
  } else {
    return new Request(request, { body: JSON.stringify(await migrateArticleImageToCloudinary(body, env)) });
  }
  return new Request(request, { body: JSON.stringify(body) });
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const migrationResponse = await handleLegacyImageMigration(request, env, ctx);
    if (migrationResponse) return migrationResponse;

    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();
    const isEditorialWrite =
      (pathname === '/api/editorial/articles' && method === 'POST') ||
      (pathname.startsWith('/api/editorial/articles/') && method === 'PUT') ||
      (pathname === '/api/editorial/sync-batch' && method === 'POST');

    if (isEditorialWrite) {
      const authFailure = await verifyEditorialSession(request, env, ctx);
      if (authFailure) return authFailure;
      try {
        const preparedRequest = await prepareEditorialJsonRequest(request, env);
        return await worker.fetch(preparedRequest, env as any, ctx as any);
      } catch (error: any) {
        console.error('Cloudinary editorial image migration error:', error);
        return jsonResponse({ success: false, error: error?.message || 'Gagal memproses gambar editorial ke Cloudinary.' }, 400);
      }
    }
    return worker.fetch(request, env as any, ctx as any);
  },

  async scheduled(_controller: ScheduledController, env: WorkerEnv, _ctx: ExecutionContext): Promise<void> {
    try {
      // One legacy image per day: gradual migration that stays conservative with the Free plan quota.
      const result = await migrateLegacyBatch(env, 1);
      console.log('Daily Cloudinary legacy-image migration:', JSON.stringify(result));
    } catch (error) {
      console.error('Daily Cloudinary legacy-image migration failed:', error);
    }
  }
};
