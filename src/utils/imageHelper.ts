/**
 * Utility helper to safely resolve image URLs and prevent empty string ("")
 * from being passed to <img src="..."> in React.
 */

import {
  generateThematicCategorySvgDataUrl,
  generateThematicCategorySvgRaw,
  ThematicSvgOptions
} from './thematicSvg';

export { generateThematicCategorySvgDataUrl, generateThematicCategorySvgRaw };
export type { ThematicSvgOptions };

/**
 * Fallback dynamic editorial SVG image for general news when no specific article context is available.
 * No longer points to the single static Unsplash printing press photo.
 */
export const DEFAULT_NEWS_IMAGE = generateThematicCategorySvgDataUrl({
  category: 'dunia',
  title: 'Berita Terkini DenyutGlobal'
});

/**
 * Utility helper to safely resolve image URLs.
 * Priority:
 * 1. Valid non-empty original image (Base64 data:image, valid HTTPS/HTTP URL, or valid relative path)
 * 2. Deterministic category-based thematic SVG illustration derived from article context
 * 3. General editorial thematic SVG (never a single repeated third-party photo)
 */
export function getValidImageUrl(
  ...candidates: (string | undefined | null | ThematicSvgOptions)[]
): string {
  let fallbackContext: ThematicSvgOptions | undefined;

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      // Skip empty strings and legacy single default unsplash URL if found in legacy records
      if (
        trimmed.length > 0 &&
        !trimmed.includes('photo-1585829365295-ab7cd400c167')
      ) {
        return trimmed;
      }
    } else if (typeof candidate === 'object') {
      // Capture the article object for thematic fallback if strings are empty
      if (!fallbackContext) {
        fallbackContext = candidate;
      }
    }
  }

  // Generate deterministic SVG fallback tailored to category and title
  return generateThematicCategorySvgDataUrl(fallbackContext || {});
}

export function hasValidImage(...candidates: (string | undefined | null)[]): boolean {
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed.length > 0 && !trimmed.includes('photo-1585829365295-ab7cd400c167')) {
        return true;
      }
    }
  }
  return false;
}

