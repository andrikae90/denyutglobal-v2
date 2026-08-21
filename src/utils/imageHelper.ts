/**
 * Utility helper to safely resolve image URLs and prevent empty string ("")
 * from being passed to <img src="..."> in React.
 */

export const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

export function getValidImageUrl(...candidates: (string | undefined | null)[]): string {
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return DEFAULT_NEWS_IMAGE;
}

export function hasValidImage(...candidates: (string | undefined | null)[]): boolean {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return true;
    }
  }
  return false;
}
