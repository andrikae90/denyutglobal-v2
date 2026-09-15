import worker from './worker';
import { uploadEditorialImageToCloudinary } from './src/services/cloudinaryImageService';

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
  const sessionRequest = new Request(sessionUrl.toString(), {
    method: 'GET',
    headers: authHeaders
  });
  const response = await worker.fetch(sessionRequest, env as any, ctx as any);
  if (response.ok) return null;
  return response;
}

function dataUrlToFile(dataUrl: string): File | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl.trim());
  if (!match) return null;

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  try {
    const binary = atob(base64);
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
  if (!file) {
    throw new Error('Format foto tidak valid untuk penyimpanan Cloudinary. Gunakan JPEG, PNG, atau WebP.');
  }

  const uploaded = await uploadEditorialImageToCloudinary(file, env);
  return {
    ...article,
    image: uploaded.secureUrl,
    gambar: uploaded.secureUrl,
    imageType: 'photo',
    imageCredit: typeof article.imageCredit === 'string' && article.imageCredit.trim()
      ? article.imageCredit
      : 'Dok. Redaksi DenyutGlobal',
    cloudinaryPublicId: uploaded.publicId
  };
}

async function prepareEditorialJsonRequest(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Request> {
  const body = await request.json();

  if (request.url.includes('/api/editorial/sync-batch')) {
    if (Array.isArray(body?.articles)) {
      body.articles = await Promise.all(body.articles.map((article: any) => migrateArticleImageToCloudinary(article, env)));
    }
  } else {
    return new Request(request, { body: JSON.stringify(await migrateArticleImageToCloudinary(body, env)) });
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
        const preparedRequest = await prepareEditorialJsonRequest(request, env, ctx);
        return await worker.fetch(preparedRequest, env as any, ctx as any);
      } catch (error: any) {
        console.error('Cloudinary editorial image migration error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error?.message || 'Gagal memproses gambar editorial ke Cloudinary.'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff'
          }
        });
      }
    }

    return worker.fetch(request, env as any, ctx as any);
  }
};
