import { NewsItem } from '../types';

/**
 * Converts any title or string into a clean, SEO-friendly URL slug.
 * - lowercase
 * - words separated by single hyphen (-)
 * - no spaces
 * - without unnecessary special characters / punctuation
 * - stable & unique
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks / diacritics
    .replace(/[$%&+,:;=?@#|'<>.^*()!/[\]\\{}~`"”’“”]/g, '') // remove punctuation & symbols
    .replace(/[^a-z0-9\s-]/g, '') // keep only alphanumeric, spaces, and hyphens
    .trim()
    .replace(/[\s_]+/g, '-') // convert spaces and underscores to single hyphen
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim leading & trailing hyphens
}

/**
 * Returns the canonical slug for an article.
 * Uses article.slug if defined and clean, otherwise generates from article title.
 */
export function getArticleSlug(article: NewsItem): string {
  if (article.slug && article.slug.trim()) {
    return slugify(article.slug);
  }
  const title = article.title || article.judul || '';
  const generated = slugify(title);
  return generated || article.id;
}

/**
 * Returns the full SEO URL for an article (/berita/[slug-artikel]).
 */
export function getArticleUrl(article: NewsItem): string {
  const slug = getArticleSlug(article);
  try {
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://denyutglobal.ai.studio';
    return `${origin}/berita/${slug}`;
  } catch {
    return `https://denyutglobal.ai.studio/berita/${slug}`;
  }
}

/**
 * Finds a published article by slug or internal ID.
 * Supports:
 * 1. Internal article ID (e.g. "art-003")
 * 2. Exact article.slug property
 * 3. Generated slug from title/judul
 * 4. Fuzzy/prefix match for truncated slugs
 * 
 * Strict rule: Only returns articles where status === 'published' && reviewed === true.
 */
export function findPublishedArticleBySlugOrId(
  articles: NewsItem[],
  identifier: string
): NewsItem | undefined {
  if (!identifier) return undefined;
  const cleanId = decodeURIComponent(identifier).trim().toLowerCase();

  // Strict guard: Only published & reviewed articles are accessible publicly
  const published = articles.filter(
    (a) => a.status === 'published' && a.reviewed === true
  );

  // 1. Direct ID match (e.g. "art-003")
  const byId = published.find((a) => a.id.toLowerCase() === cleanId);
  if (byId) return byId;

  // 2. Direct slug match
  const bySlug = published.find(
    (a) => a.slug && slugify(a.slug) === cleanId
  );
  if (bySlug) return bySlug;

  // 3. Title-derived slug match
  const byTitleSlug = published.find(
    (a) => slugify(a.title || a.judul) === cleanId
  );
  if (byTitleSlug) return byTitleSlug;

  // 4. Substring / Prefix match for flexible URL slug compatibility
  const byPartial = published.find((a) => {
    const s1 = a.slug ? slugify(a.slug) : '';
    const s2 = slugify(a.title || a.judul);
    return (
      (s1 && (s1.startsWith(cleanId) || cleanId.startsWith(s1))) ||
      (s2 && (s2.startsWith(cleanId) || cleanId.startsWith(s2))) ||
      (s1 && (s1.includes(cleanId) || cleanId.includes(s1))) ||
      (s2 && (s2.includes(cleanId) || cleanId.includes(s2)))
    );
  });
  if (byPartial) return byPartial;

  return undefined;
}
