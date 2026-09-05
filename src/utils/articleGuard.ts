/**
 * DenyutGlobal Article Guard — Central Content Quality & Public Visibility Validator
 * 
 * An article is strictly considered eligible for public display, sitemap inclusion,
 * and server-side crawler rendering ONLY when it passes all quality checks:
 * 1. status === 'published'
 * 2. reviewed === true / 1
 * 3. title is non-empty after trimming
 * 4. slug is non-empty after trimming
 * 5. content is non-empty
 * 6. content contains genuine readable text after trimming whitespace
 */

/**
 * Extracts plain text from an article's content across various schemas
 * (content array, isiLengkap array, content_json string/parsed, body).
 */
export function extractArticleText(article: any): string {
  if (!article || typeof article !== 'object') return '';

  const raw = article.content ?? article.isiLengkap ?? article.content_json ?? article.body;
  if (raw === null || raw === undefined) return '';

  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item !== null && item !== undefined)
      .map((item) => (typeof item === 'string' ? item : String(item)))
      .join(' ')
      .trim();
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return '';

    // Check if it is a JSON serialized array or object
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => item !== null && item !== undefined)
            .map((item) => (typeof item === 'string' ? item : String(item)))
            .join(' ')
            .trim();
        }
        if (parsed && typeof parsed === 'object') {
          return Object.values(parsed)
            .filter((item) => item !== null && item !== undefined)
            .map((item) => (typeof item === 'string' ? item : String(item)))
            .join(' ')
            .trim();
        }
      } catch {
        // Not valid JSON, treat as raw text
      }
    }
    return trimmed;
  }

  if (typeof raw === 'object') {
    return Object.values(raw)
      .filter((item) => item !== null && item !== undefined)
      .map((item) => (typeof item === 'string' ? item : String(item)))
      .join(' ')
      .trim();
  }

  return String(raw).trim();
}

/**
 * Known internal test phrases for auditing and blocking dummy/test records.
 * Uses exact phrases or word boundaries to prevent false positives on legitimate news
 * (e.g. "demonstrasi" or "protes").
 */
const INTERNAL_TEST_PATTERNS = [
  /\buji[\s_-]?coba\b/i,
  /\btesting\b/i,
  /\btest\s+article\b/i,
  /\bverifikasi[\s_-]?database\b/i,
  /\bintegrasi[\s_-]?d1\b/i,
  /\bsample[\s_-]?article\b/i,
  /\bdemo[\s_-]?article\b/i,
  /\blorem\s+ipsum\b/i
];

/**
 * Checks if an article passes all public quality and visibility criteria.
 */
export function isPublicArticle(article: any): boolean {
  if (!article || typeof article !== 'object') return false;

  // 1. Status must be strictly 'published'
  if (article.status !== 'published') return false;

  // 2. Must be reviewed by editorial team (true, 1, or '1')
  const isReviewed =
    article.reviewed === true ||
    article.reviewed === 1 ||
    article.reviewed === '1';
  if (!isReviewed) return false;

  // 3. Title must not be empty
  const title = (article.title || article.judul || '').trim();
  if (!title) return false;

  // 4. Slug must not be empty
  const slug = (article.slug || '').trim();
  if (!slug) return false;

  // 5. Must not be explicitly tagged as demo/mock data
  if (article.isDemo === true || article.sourceFeedType === 'demo') {
    return false;
  }

  // 6. Block internal testing/dummy titles
  for (const pattern of INTERNAL_TEST_PATTERNS) {
    if (pattern.test(title) || pattern.test(slug)) {
      return false;
    }
  }

  // 7. Content must have genuine text (minimum 25 characters of trimmed readable text)
  const text = extractArticleText(article);
  if (!text || text.length < 25) {
    return false;
  }

  return true;
}

/**
 * Normalizes article paragraphs for safe server rendering.
 * Returns array of non-empty paragraph strings.
 */
export function getArticleParagraphs(article: any): string[] {
  if (!article || typeof article !== 'object') return [];

  const raw = article.content ?? article.isiLengkap ?? article.content_json ?? article.body;
  if (raw === null || raw === undefined) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((p) => String(p).trim())
      .filter((p) => p.length > 0);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((p) => String(p).trim())
            .filter((p) => p.length > 0);
        }
      } catch {
        // Fallback to splitting by newlines
      }
    }
    return trimmed
      .split(/\n{2,}|\r\n\r\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  return [];
}
