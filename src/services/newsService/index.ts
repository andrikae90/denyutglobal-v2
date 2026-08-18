import { NewsItem } from '../../types';
import { SAMPLE_NEWS_ITEMS } from '../../data/newsData';
import { fetchBbcWorldFeed } from './bbcFeed';
import { fetchDwFeed } from './dwFeed';
import { fetchAntaraFeed } from './antaraFeed';
import { AggregatedNewsResult } from './types';

export * from './types';
export * from './normalizeNews';
export * from './bbcFeed';
export * from './dwFeed';
export * from './antaraFeed';

class NewsService {
  private cache: {
    data: AggregatedNewsResult | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0
  };

  private CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

  /**
   * Aggregates news from BBC News, DW, and ANTARA News.
   * Fallbacks to SAMPLE_NEWS_ITEMS if all fail or while offline.
   */
  public async getAggregatedNews(options?: { forceRefresh?: boolean }): Promise<AggregatedNewsResult> {
    const now = Date.now();
    if (!options?.forceRefresh && this.cache.data && (now - this.cache.timestamp < this.CACHE_TTL_MS)) {
      return this.cache.data;
    }

    try {
      // Parallel fetch from BBC, DW, and ANTARA feeds
      const [bbcRes, dwRes, antaraRes] = await Promise.allSettled([
        fetchBbcWorldFeed(),
        fetchDwFeed(),
        fetchAntaraFeed()
      ]);

      const liveItems: NewsItem[] = [];

      if (bbcRes.status === 'fulfilled' && bbcRes.value.status === 'success') {
        liveItems.push(...bbcRes.value.items);
      }
      if (dwRes.status === 'fulfilled' && dwRes.value.status === 'success') {
        liveItems.push(...dwRes.value.items);
      }
      if (antaraRes.status === 'fulfilled' && antaraRes.value.status === 'success') {
        liveItems.push(...antaraRes.value.items);
      }

      // If we got live items from RSS
      if (liveItems.length > 0) {
        // Sort and rank items by publication recency and completeness
        const sorted = this.interleaveAndRank(liveItems);

        const result: AggregatedNewsResult = {
          items: sorted,
          status: 'live',
          totalLive: liveItems.length,
          lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        this.cache = { data: result, timestamp: now };
        return result;
      }
    } catch (e) {
      console.warn('NewsService aggregation error, switching to demo mode:', e);
    }

    // Fallback: Demo data marked with explicit demo flags
    const demoItems: NewsItem[] = SAMPLE_NEWS_ITEMS.map((item) => ({
      ...item,
      isLiveFeed: false,
      sourceFeedType: 'demo' as const
    }));

    const fallbackResult: AggregatedNewsResult = {
      items: demoItems,
      status: 'demo',
      totalLive: 0,
      lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    return fallbackResult;
  }

  /**
   * Sort items by publication timestamp and assign editorial layout tags
   */
  private interleaveAndRank(items: NewsItem[]): NewsItem[] {
    if (items.length === 0) return [];

    // Sort by publication date if available
    const sorted = [...items].sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });

    // Assign layout roles dynamically
    return sorted.map((item, index) => ({
      ...item,
      isHero: index === 0,
      isFeatured: index >= 1 && index <= 4,
      isBreaking: index === 0,
      isDailyBrief: index >= 1 && index <= 5,
      briefOrder: index >= 1 && index <= 5 ? index : undefined
    }));
  }
}

export const newsService = new NewsService();
