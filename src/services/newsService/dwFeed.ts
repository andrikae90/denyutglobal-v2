import { NewsItem } from '../../types';
import { NewsFeedResult } from './types';
import { fetchRssFeed } from './rssFetcher';
import { normalizeRssItem } from './normalizeNews';

// Deutsche Welle Public RSS Feeds (DW World English and DW Indonesia)
const DW_RSS_URLS = [
  'https://rss.dw.com/xml/rss-id-all',      // DW Indonesia All
  'https://rss.dw.com/rdf/rss-en-world',    // DW World English
  'https://rss.dw.com/rdf/rss-id-news'     // DW Berita Indonesia
];

export async function fetchDwFeed(): Promise<NewsFeedResult> {
  for (const url of DW_RSS_URLS) {
    try {
      const rawItems = await fetchRssFeed(url);
      if (rawItems && rawItems.length > 0) {
        const items: NewsItem[] = rawItems.slice(0, 15).map((raw, idx) => 
          normalizeRssItem(raw, 'DW', idx)
        );

        return {
          items,
          sourceName: 'DW',
          status: 'success'
        };
      }
    } catch {
      continue;
    }
  }

  return {
    items: [],
    sourceName: 'DW',
    status: 'error',
    errorMessage: 'Gagal memuat feed DW dari semua endpoint yang tersedia.'
  };
}
