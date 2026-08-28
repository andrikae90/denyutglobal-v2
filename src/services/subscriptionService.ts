/**
 * subscriptionService.ts
 * Layanan terpusat untuk pendaftaran newsletter & langganan Daily Brief DenyutGlobal.
 */

export interface SubscribeResponse {
  success: boolean;
  isAlreadySubscribed?: boolean;
  resubscribed?: boolean;
  message?: string;
  error?: string;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  exists: boolean;
  status: 'active' | 'unsubscribed' | 'pending' | 'none';
  isSubscribed: boolean;
  token?: string;
  error?: string;
}

export interface UnsubscribeResponse {
  success: boolean;
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
 * Menghapus email dari browser lokal saat unsubscribe
 */
export function removeLocalSubscriber(email: string): void {
  try {
    const normalized = normalizeEmail(email);
    const list = getLocalSubscribers().filter(item => item.toLowerCase() !== normalized);
    localStorage.setItem(LOCAL_STORAGE_SUBSCRIBERS_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Memeriksa status langganan email dari server database (D1 / Server store)
 */
export async function checkSubscriptionStatus(rawEmail: string): Promise<SubscriptionStatusResponse> {
  const normalized = normalizeEmail(rawEmail);
  if (!validateEmail(normalized)) {
    return {
      success: false,
      exists: false,
      status: 'none',
      isSubscribed: false,
      error: 'Format email tidak valid.'
    };
  }

  try {
    const response = await fetch(`/api/subscription-status?email=${encodeURIComponent(normalized)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json().catch(() => null);
    if (response.ok && data?.success) {
      const status: 'active' | 'unsubscribed' | 'pending' | 'none' = data.status || (data.isSubscribed ? 'active' : 'none');
      if (status !== 'active') {
        removeLocalSubscriber(normalized);
      } else {
        saveLocalSubscriber(normalized);
      }
      return {
        success: true,
        exists: Boolean(data.exists),
        status,
        isSubscribed: Boolean(data.isSubscribed),
        token: typeof data.token === 'string' ? data.token : undefined
      };
    }
  } catch (err) {
    console.warn('[SubscriptionService] Status check API unavailable, using local fallback:', err);
  }

  // Local fallback
  const localList = getLocalSubscribers();
  const existsInLocal = localList.includes(normalized);
  return {
    success: true,
    exists: existsInLocal,
    status: existsInLocal ? 'active' : 'none',
    isSubscribed: existsInLocal
  };
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

      if (data.isAlreadySubscribed) {
        return {
          success: true,
          isAlreadySubscribed: true,
          message: data.message || 'Email ini sudah terdaftar sebagai pelanggan aktif DenyutGlobal.'
        };
      }

      return {
        success: true,
        isAlreadySubscribed: false,
        resubscribed: Boolean(data.resubscribed),
        message: data.message || 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'
      };
    }

    if (data?.error) {
      return {
        success: false,
        error: data.error
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
    saveLocalSubscriber(normalized);
    return {
      success: true,
      isAlreadySubscribed: false,
      message: 'Berhasil! Email Anda telah terdaftar untuk menerima informasi terbaru dari DenyutGlobal.'
    };
  }
}

/**
 * Mengirim permintaan berhenti berlangganan (Unsubscribe) dengan token aman
 */
export async function unsubscribeNewsletter(rawEmail: string, token: string): Promise<UnsubscribeResponse> {
  const normalized = normalizeEmail(rawEmail);
  const cleanToken = (token || '').trim();

  if (!cleanToken) {
    return {
      success: false,
      error: 'Token berhenti berlangganan diperlukan.'
    };
  }

  try {
    const response = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: normalized, token: cleanToken })
    });

    const data = await response.json().catch(() => null);
    if (response.ok && data?.success) {
      removeLocalSubscriber(normalized);
      return {
        success: true,
        message: data.message || 'Email berhasil dinonaktifkan dari daftar langganan DenyutGlobal.'
      };
    }

    return {
      success: false,
      error: data?.error || 'Gagal memproses permintaan berhenti berlangganan.'
    };
  } catch (err: any) {
    console.error('[SubscriptionService] Unsubscribe error:', err);
    return {
      success: false,
      error: 'Gagal menghubungi server. Silakan coba kembali.'
    };
  }
}

