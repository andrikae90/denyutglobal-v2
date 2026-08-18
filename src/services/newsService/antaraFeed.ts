import { NewsItem } from '../../types';
import { NewsFeedResult } from './types';
import { fetchRssFeed } from './rssFetcher';
import { normalizeRssItem } from './normalizeNews';

// Official verified public RSS feeds of LKBN ANTARA
const ANTARA_RSS_URLS = [
  'https://www.antaranews.com/rss/terkini.xml',
  'https://www.antaranews.com/rss/top-news.xml',
  'https://www.antaranews.com/rss/nasional.xml',
  'https://www.antaranews.com/rss/politik.xml',
  'https://www.antaranews.com/rss/ekonomi.xml'
];

/**
 * Fetches and normalizes news from official LKBN ANTARA RSS feeds.
 * If endpoints are unreachable, gracefully returns an error or not_connected state without generating fake data.
 */
export async function fetchAntaraFeed(): Promise<NewsFeedResult> {
  for (const url of ANTARA_RSS_URLS) {
    try {
      const rawItems = await fetchRssFeed(url);
      if (rawItems && rawItems.length > 0) {
        const items: NewsItem[] = rawItems.slice(0, 15).map((raw, idx) => 
          normalizeRssItem(raw, 'ANTARA', idx)
        );

        return {
          items,
          sourceName: 'ANTARA',
          status: 'success'
        };
      }
    } catch {
      // Try next official endpoint
      continue;
    }
  }

  // Graceful fallback when feed is currently unreachable
  return {
    items: [],
    sourceName: 'ANTARA',
    status: 'error',
    errorMessage: 'Feed resmi ANTARA saat ini sedang dalam status tidak terhubung (not_connected) atau tidak dapat dijangkau.'
  };
}
