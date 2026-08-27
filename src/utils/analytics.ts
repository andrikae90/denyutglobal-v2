/**
 * analytics.ts
 * Utilitas pelacak Google Analytics 4 (GA4) terisolasi untuk DenyutGlobal.
 * Measurement ID: G-XX1CWQ3HBG
 */

export const GA_MEASUREMENT_ID = 'G-XX1CWQ3HBG';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/**
 * Memeriksa apakah fungsi gtag tersedia di window browser.
 */
export function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Menonaktifkan atau mengaktifkan pengiriman data ke GA4 secara terisolasi.
 * Digunakan agar aktivitas di Ruang Redaksi (/redaksi) tidak mengotori analitik pembaca publik.
 */
export function setEditorialTrackingDisabled(disabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = disabled;
  } catch (err) {
    console.warn('[Analytics] Failed to update editorial tracking state:', err);
  }
}

/**
 * Mengirim event GA4 "subscribe" setelah subscription ke API berhasil.
 * 
 * Parameter:
 * - subscription_status: 'new' | 'already_subscribed'
 */
export function trackSubscribeEvent(status: 'new' | 'already_subscribed'): void {
  if (typeof window === 'undefined') return;
  try {
    if (isGtagAvailable()) {
      window.gtag!('event', 'subscribe', {
        subscription_status: status
      });
    }
  } catch (err) {
    console.warn('[Analytics] Failed to send subscribe event:', err);
  }
}
