import { CachedSummaryItem } from './types';

const CACHE_STORAGE_KEY = 'denyutglobal_news_summary_cache_v1';

class SummaryCache {
  private memoryCache = new Map<string, CachedSummaryItem>();

  constructor() {
    this.loadFromStorage();
  }

  private getCacheKey(source: string, sourceUrl: string, title: string): string {
    const cleanUrl = sourceUrl.trim().toLowerCase().split('?')[0];
    const cleanTitle = title.trim().toLowerCase().slice(0, 40);
    return `${source}:${cleanUrl || cleanTitle}`;
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([key, val]) => {
          this.memoryCache.set(key, val as CachedSummaryItem);
        });
      }
    } catch (e) {
      console.warn('Failed to load news summary cache from localStorage', e);
    }
  }

  public get(source: string, sourceUrl: string, title: string): CachedSummaryItem | null {
    const key = this.getCacheKey(source, sourceUrl, title);
    return this.memoryCache.get(key) || null;
  }

  public set(source: string, sourceUrl: string, title: string, item: CachedSummaryItem) {
    const key = this.getCacheKey(source, sourceUrl, title);
    this.memoryCache.set(key, item);
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const obj: Record<string, CachedSummaryItem> = {};
      this.memoryCache.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save news summary cache to localStorage', e);
    }
  }
}

export const summaryCache = new SummaryCache();
