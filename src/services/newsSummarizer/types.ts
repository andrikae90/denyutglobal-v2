import { CategoryId } from '../../types';

export interface SummarizerInput {
  originalTitle: string;
  originalSummary: string;
  source: 'BBC News' | 'DW' | string;
  sourceUrl: string;
  category: Exclude<CategoryId, 'semua'>;
  location: string;
  publishedAt?: string;
}

export interface SummarizerOutput {
  originalTitle: string;
  titleId: string;
  originalSummary: string;
  summaryId: string;
  whyItMatters: string;
  source: string;
  sourceUrl: string;
  category: Exclude<CategoryId, 'semua'>;
  location: string;
  publishedAt?: string;
  translatedAt: string;
  isCached: boolean;
}

export interface CachedSummaryItem {
  originalTitle: string;
  titleId: string;
  originalSummary: string;
  summaryId: string;
  whyItMatters: string;
  translatedAt: string;
}
