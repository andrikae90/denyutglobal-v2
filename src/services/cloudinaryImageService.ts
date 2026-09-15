const CLOUDINARY_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const CLOUDINARY_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export interface CloudinaryUploadEnv {
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

export interface CloudinaryUploadResult {
  success: true;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
}

function createSafePublicId(): string {
  const random = crypto.randomUUID().replace(/-/g, '');
  return `editorial/${new Date().toISOString().slice(0, 10)}/${random}`;
}

async function validateImageBytes(file: File): Promise<void> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header.length >= 8 &&
    header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47 &&
    header[4] === 0x0d && header[5] === 0x0a && header[6] === 0x1a && header[7] === 0x0a;
  const isWebp = header.length >= 12 &&
    header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
  if (!isJpeg && !isPng && !isWebp) throw new Error('Format gambar tidak valid. Gunakan JPG, PNG, atau WebP.');
}

async function uploadFileToCloudinary(file: File, env: CloudinaryUploadEnv, publicId?: string): Promise<CloudinaryUploadResult> {
  const cloudName = (env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (env.CLOUDINARY_API_SECRET || '').trim();
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary belum dikonfigurasi lengkap di Cloudflare Secrets.');
  if (!file || file.size <= 0) throw new Error('File gambar wajib diisi.');
  if (file.size > CLOUDINARY_MAX_IMAGE_BYTES) throw new Error('Ukuran gambar terlalu besar. Maksimal 10 MB.');
  if (!CLOUDINARY_ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) throw new Error('Tipe gambar tidak diizinkan. Gunakan JPG, PNG, atau WebP.');
  await validateImageBytes(file);

  const form = new FormData();
  form.append('file', file, file.name || 'editorial-image');
  form.append('public_id', publicId || createSafePublicId());
  form.append('overwrite', 'false');
  form.append('unique_filename', 'false');
  form.append('resource_type', 'image');

  const basicToken = btoa(`${apiKey}:${apiSecret}`);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicToken}` },
    body: form
  });
  if (!response.ok) {
    let providerMessage = '';
    try {
      const errorBody: any = await response.json();
      providerMessage = typeof errorBody?.error?.message === 'string' ? errorBody.error.message : '';
    } catch {}
    console.error('Cloudinary upload failed:', response.status, providerMessage || 'provider error');
    throw new Error('Gagal mengunggah gambar ke penyimpanan gambar.');
  }

  const result: any = await response.json();
  const secureUrl = typeof result?.secure_url === 'string' ? result.secure_url : '';
  const returnedPublicId = typeof result?.public_id === 'string' ? result.public_id : '';
  const format = typeof result?.format === 'string' ? result.format : '';
  const bytes = typeof result?.bytes === 'number' ? result.bytes : file.size;
  if (!secureUrl || !returnedPublicId) throw new Error('Respons Cloudinary tidak lengkap.');
  return { success: true, secureUrl, publicId: returnedPublicId, format, bytes };
}

export async function uploadEditorialImageToCloudinary(file: File, env: CloudinaryUploadEnv): Promise<CloudinaryUploadResult> {
  return uploadFileToCloudinary(file, env);
}

export async function uploadLegacyRemoteImageToCloudinary(imageUrl: string, env: CloudinaryUploadEnv): Promise<CloudinaryUploadResult> {
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new Error('URL gambar lama tidak valid.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Sumber gambar lama harus menggunakan HTTP atau HTTPS.');

  const response = await fetch(parsed.toString(), {
    method: 'GET',
    redirect: 'follow',
    headers: { Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8' }
  });
  if (!response.ok) throw new Error(`Gambar lama tidak dapat diambil (HTTP ${response.status}).`);

  const contentType = (response.headers.get('content-type') || '').split(';', 1)[0].trim().toLowerCase();
  if (!CLOUDINARY_ALLOWED_MIME_TYPES.has(contentType)) throw new Error('Gambar lama bukan JPEG, PNG, atau WebP yang didukung.');
  const contentLength = Number(response.headers.get('content-length') || '0');
  if (contentLength > CLOUDINARY_MAX_IMAGE_BYTES) throw new Error('Gambar lama lebih besar dari 10 MB.');

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > CLOUDINARY_MAX_IMAGE_BYTES) throw new Error('Gambar lama lebih besar dari 10 MB.');
  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : 'webp';
  const sourceName = parsed.pathname.split('/').pop()?.replace(/[^a-zA-Z0-9._-]/g, '_') || `legacy-image.${extension}`;
  const file = new File([bytes], sourceName.includes('.') ? sourceName : `${sourceName}.${extension}`, { type: contentType });
  return uploadFileToCloudinary(file, env);
}
