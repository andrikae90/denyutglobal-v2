import { NewsItem } from '../../types';
import { NewsFeedResult } from './types';
import { fetchRssFeed } from './rssFetcher';
import { normalizeRssItem } from './normalizeNews';

const BBC_WORLD_RSS = 'https://feeds.bbci.co.uk/news/world/rss.xml';

export async function fetchBbcWorldFeed(): Promise<NewsFeedResult> {
  try {
    const rawItems = await fetchRssFeed(BBC_WORLD_RSS);
    if (!rawItems || rawItems.length === 0) {
      throw new Error('Tidak ada item berita ditemukan dari feed BBC World.');
    }

    const items: NewsItem[] = rawItems.slice(0, 15).map((raw, idx) => 
      normalizeRssItem(raw, 'BBC News', idx)
    );

    return {
      items,
      sourceName: 'BBC News',
      status: 'success'
    };
  } catch (error: any) {
    console.warn('BBC RSS fetch failed:', error.message);
    return {
      items: [],
      sourceName: 'BBC News',
      status: 'error',
      errorMessage: error.message
    };
  }
}
