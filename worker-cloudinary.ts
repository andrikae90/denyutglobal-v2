import worker from './worker';
import { uploadEditorialImageToCloudinary } from './src/services/cloudinaryImageService';
import type { ExecutionContext } from '@cloudflare/workers-types';

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

const MAX_DATA_URL_LENGTH = 14 * 1024 * 1024;

function dataUrlToFile(dataUrl: string): File | null {
  const value = dataUrl.trim();
  if (value.length > MAX_DATA_URL_LENGTH) throw new Error('Ukuran gambar terlalu besar. Maksimal 10 MB.');
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(value);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    if (bytes.byteLength > 10 * 1024 * 1024) throw new Error('Ukuran gambar terlalu besar. Maksimal 10 MB.');
    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';
    return new File([bytes], `editorial-image.${extension}`, { type: mimeType });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Maksimal 10 MB')) throw error;
    return null;
  }
}

async function prepareNewEditorialImage(article: any, env: WorkerEnv): Promise<any> {
  if (!article || typeof article !== 'object') return article;

  const imageType = typeof article.imageType === 'string' ? article.imageType : '';
  const image = typeof article.image === 'string' ? article.image.trim() : '';

  // CRITICAL: only a newly uploaded data URL is sent to Cloudinary.
  // Existing remote URLs, Cloudinary URLs, AI illustrations, and empty images are untouched.
  if (imageType !== 'photo' || !image.startsWith('data:image/')) return article;

  const file = dataUrlToFile(image);
  if (!file) throw new Error('Format gambar tidak valid. Gunakan JPG, PNG, atau WebP.');

  const uploaded = await uploadEditorialImageToCloudinary(file, env);
  return {
    ...article,
    image: uploaded.secureUrl,
    gambar: uploaded.secureUrl,
    imageType: 'photo',
    cloudinaryPublicId: uploaded.publicId,
    imageCredit: typeof article.imageCredit === 'string' ? article.imageCredit : ''
  };
}

async function prepareEditorialJsonRequest(request: Request, env: WorkerEnv): Promise<Request> {
  const body = await request.json();
  if (request.url.includes('/api/editorial/sync-batch')) {
    if (Array.isArray(body?.articles)) {
      body.articles = await Promise.all(body.articles.map((article: any) => prepareNewEditorialImage(article, env)));
    }
  } else {
    const prepared = await prepareNewEditorialImage(body, env);
    return new Request(request, { body: JSON.stringify(prepared) });
  }
  return new Request(request, { body: JSON.stringify(body) });
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
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
        console.error('New editorial image upload error:', error);
        const message = error?.message || 'Gagal memproses gambar baru.';
        const isClientError = /Format gambar|Ukuran gambar|Tipe gambar|File gambar/i.test(message);
        return jsonResponse({ success: false, error: message }, isClientError ? 400 : 502);
      }
    }

    // All read routes and every non-upload operation go directly to the original worker.
    // No legacy-image migration, scheduled task, or URL rewrite exists in this wrapper.
    return worker.fetch(request, env as any, ctx as any);
  }
};
