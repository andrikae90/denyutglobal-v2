/**
 * subscriptionService.ts
 * Layanan terpusat untuk pendaftaran newsletter & langganan Daily Brief DenyutGlobal.
 */

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Memeriksa validitas format alamat email
 */
export function validateEmail(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Menormalkan format email (trim dan lowercase)
 */
export function normalizeEmail(input: string): string {
  return (input || '').trim().toLowerCase();
}

/**
 * Mengirim permintaan pendaftaran subscriber ke backend API / Cloudflare D1
 */
export async function subscribeNewsletter(rawEmail: string): Promise<SubscribeResponse> {
  const normalized = normalizeEmail(rawEmail);

  if (!normalized) {
    return {
      success: false,
      error: 'Silakan masukkan alamat email Anda.'
    };
  }

  if (!validateEmail(normalized)) {
    return {
      success: false,
      error: 'Masukkan alamat email yang valid.'
    };
  }

  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: normalized })
    });

    const data: any = await response.json().catch(() => null);

    if (response.ok && data?.success) {
      return {
        success: true,
        message: data.message || 'Terima kasih! Anda telah berhasil berlangganan Daily Brief DenyutGlobal.'
      };
    }

    return {
      success: false,
      error: data?.error || 'Pendaftaran belum berhasil. Silakan coba beberapa saat lagi.'
    };
  } catch (err: any) {
    console.error('[SubscriptionService] Network or unexpected error:', err);
    return {
      success: false,
      error: 'Terjadi gangguan koneksi. Pastikan internet Anda terhubung lalu coba lagi.'
    };
  }
}
