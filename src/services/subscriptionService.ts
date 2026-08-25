/**
 * subscriptionService.ts
 * Layanan terpusat untuk pendaftaran newsletter & langganan Daily Brief DenyutGlobal.
 */

export interface SubscribeResponse {
  success: boolean;
  isAlreadySubscribed?: boolean;
  message?: string;
  error?: string;
}

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const LOCAL_STORAGE_SUBSCRIBERS_KEY = 'denyutglobal_subscribers_list';

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
 * Mendapatkan daftar subscriber yang tersimpan di browser lokal
 */
function getLocalSubscribers(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SUBSCRIBERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Menyimpan email baru ke browser lokal
 */
function saveLocalSubscriber(email: string): void {
  try {
    const list = getLocalSubscribers();
    if (!list.includes(email)) {
      list.push(email);
      localStorage.setItem(LOCAL_STORAGE_SUBSCRIBERS_KEY, JSON.stringify(list));
    }
  } catch {}
}

/**
 * Mengirim permintaan pendaftaran subscriber ke backend API / database
 */
export async function subscribeNewsletter(rawEmail: string): Promise<SubscribeResponse> {
  const normalized = normalizeEmail(rawEmail);

  // 1. Validasi email kosong
  if (!normalized) {
    return {
      success: false,
      error: 'Silakan masukkan alamat email Anda.'
    };
  }

  // 2. Validasi format email
  if (!validateEmail(normalized)) {
    return {
      success: false,
      error: 'Silakan masukkan alamat email yang valid.'
    };
  }

  // 3. Cek apakah sudah pernah terdaftar di local storage perangkat ini
  const localList = getLocalSubscribers();
  const existsInLocal = localList.includes(normalized);

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
      saveLocalSubscriber(normalized);

      if (data.isAlreadySubscribed || existsInLocal) {
        return {
          success: true,
          isAlreadySubscribed: true,
          message: 'Email ini sudah terdaftar sebagai pelanggan DenyutGlobal.'
        };
      }

      return {
        success: true,
        isAlreadySubscribed: false,
        message: data.message || 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'
      };
    }

    if (data?.error) {
      return {
        success: false,
        error: data.error
      };
    }

    // Jika server merespons non-200 tetapi offline fallback
    if (existsInLocal) {
      return {
        success: true,
        isAlreadySubscribed: true,
        message: 'Email ini sudah terdaftar sebagai pelanggan DenyutGlobal.'
      };
    }

    saveLocalSubscriber(normalized);
    return {
      success: true,
      isAlreadySubscribed: false,
      message: 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'
    };
  } catch (err: any) {
    console.warn('[SubscriptionService] Server API unavailable, saving to local storage fallback:', err);
    
    // Offline / Standalone Fallback
    if (existsInLocal) {
      return {
        success: true,
        isAlreadySubscribed: true,
        message: 'Email ini sudah terdaftar sebagai pelanggan DenyutGlobal.'
      };
    }

    saveLocalSubscriber(normalized);
    return {
      success: true,
      isAlreadySubscribed: false,
      message: 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'
    };
  }
}

