import { NewsItem, CategoryId } from '../../types';

export interface RawRssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  imageUrl?: string;
  category?: string;
  guid?: string;
  author?: string;
}

export interface NewsFeedResult {
  items: NewsItem[];
  sourceName: string;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface AggregatedNewsResult {
  items: NewsItem[];
  status: 'live' | 'demo' | 'offline';
  totalLive: number;
  lastUpdated: string;
}
