import { NewsItem } from '../types';
import { getArticleSlug, PRODUCTION_CANONICAL_DOMAIN } from './slug';

export const HOMEPAGE_OG = {
  title: 'DenyutGlobal — Menangkap Denyut Dunia, Setiap Hari',
  description: 'DenyutGlobal adalah portal berita berbahasa Indonesia yang menyajikan informasi dan perkembangan terbaru dari berbagai belahan dunia secara ringkas, jelas, dan mudah dipahami.',
  url: `${PRODUCTION_CANONICAL_DOMAIN}/`,
  image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  type: 'website',
  siteName: 'DenyutGlobal',
  locale: 'id_ID',
  twitterCard: 'summary_large_image'
};

/**
 * Resolves a safe public HTTP/HTTPS URL for an article's Open Graph image.
 * If the article image is stored as Base64 (data:image/...), it uses the public image endpoint.
 */
export function getArticleOgImageUrl(
  article: { slug?: string; id?: string; image?: string; gambar?: string } | null,
  baseUrl: string = PRODUCTION_CANONICAL_DOMAIN
): string {
  if (!article) return HOMEPAGE_OG.image;
  const rawImage = (article.image || article.gambar || '').trim();
  const domain = baseUrl.replace(/\/+$/, '');
  const slug = getArticleSlug(article as any);

  if (rawImage.startsWith('data:image/')) {
    return `${domain}/api/articles/${encodeURIComponent(slug)}/image`;
  }
  if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
    return rawImage;
  }
  if (rawImage.startsWith('/')) {
    return `${domain}${rawImage}`;
  }
  return HOMEPAGE_OG.image;
}

/**
 * Escapes characters for safe inclusion in HTML meta tags and attributes.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Injects article Open Graph, Twitter Card, and SEO metadata into HTML template.
 */
export function injectOpenGraphHtml(
  html: string,
  article: any,
  baseUrl: string = PRODUCTION_CANONICAL_DOMAIN
): string {
  if (!article) return html;

  const slug = getArticleSlug(article);
  const domain = baseUrl.replace(/\/+$/, '');
  const articleUrl = `${domain}/berita/${encodeURIComponent(slug)}`;
  const title = article.judul || article.title || HOMEPAGE_OG.title;
  const fullTitle = `${title} — DenyutGlobal`;
  const summary = (article.ringkasan || article.summary || article.whyItMatters || HOMEPAGE_OG.description)
    .replace(/\s+/g, ' ')
    .trim();
  const imageUrl = getArticleOgImageUrl(article, domain);

  let output = html;

  // 1. Replace Title
  if (/<title>[\s\S]*?<\/title>/i.test(output)) {
    output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  }

  // 2. Replace Description
  if (/<meta\s+name=["']description["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']description["'][^>]*\/?>/i,
      `<meta name="description" content="${escapeHtml(summary)}" />`
    );
  }

  // 3. Replace Canonical
  if (/<link\s+rel=["']canonical["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<link\s+rel=["']canonical["'][^>]*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(articleUrl)}" />`
    );
  }

  // 4. Replace Open Graph Tags
  if (/<meta\s+property=["']og:type["'][^>]*\/?>/i.test(output)) {
    output = output.replace(/<meta\s+property=["']og:type["'][^>]*\/?>/i, `<meta property="og:type" content="article" />`);
  }
  if (/<meta\s+property=["']og:title["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:title["'][^>]*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`
    );
  }
  if (/<meta\s+property=["']og:description["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:description["'][^>]*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(summary)}" />`
    );
  }
  if (/<meta\s+property=["']og:url["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:url["'][^>]*\/?>/i,
      `<meta property="og:url" content="${escapeHtml(articleUrl)}" />`
    );
  }
  if (/<meta\s+property=["']og:image["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:image["'][^>]*\/?>/i,
      `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`
    );
  }

  // 5. Replace Twitter Card Tags
  if (/<meta\s+name=["']twitter:title["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']twitter:title["'][^>]*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`
    );
  }
  if (/<meta\s+name=["']twitter:description["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']twitter:description["'][^>]*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(summary)}" />`
    );
  }
  if (/<meta\s+name=["']twitter:image["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']twitter:image["'][^>]*\/?>/i,
      `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`
    );
  }

  return output;
}

/**
 * Safely sets or updates a <meta> tag by property or name in document.head.
 * Removes any duplicate tags with the same attribute name.
 */
function setMetaTag(attributeName: 'property' | 'name', attributeValue: string, content: string) {
  if (typeof document === 'undefined') return;

  const elements = document.querySelectorAll(`meta[${attributeName}="${attributeValue}"]`);
  
  if (elements.length > 0) {
    elements[0].setAttribute('content', content);
    // Remove duplicates if any
    for (let i = 1; i < elements.length; i++) {
      elements[i].remove();
    }
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute(attributeName, attributeValue);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
}

/**
 * Dynamically updates Open Graph and Twitter Card metadata for active article or homepage.
 * Prevents duplicates and maintains 100% synchronization with canonical URL and Schema.org.
 */
export function updateOpenGraphMetadata(article: NewsItem | null) {
  if (typeof document === 'undefined') return;

  if (article && article.status === 'published' && article.reviewed) {
    const slug = getArticleSlug(article);
    const articleUrl = `${PRODUCTION_CANONICAL_DOMAIN}/berita/${slug}`;
    const headline = article.judul || article.title || HOMEPAGE_OG.title;
    const summary = article.ringkasan || article.summary || HOMEPAGE_OG.description;
    const imageUrl = getArticleOgImageUrl(article, PRODUCTION_CANONICAL_DOMAIN);

    // Set Article Open Graph Tags
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:title', headline);
    setMetaTag('property', 'og:description', summary);
    setMetaTag('property', 'og:url', articleUrl);
    setMetaTag('property', 'og:image', imageUrl);
    setMetaTag('property', 'og:site_name', HOMEPAGE_OG.siteName);
    setMetaTag('property', 'og:locale', HOMEPAGE_OG.locale);

    // Set Article Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', headline);
    setMetaTag('name', 'twitter:description', summary);
    setMetaTag('name', 'twitter:image', imageUrl);
  } else {
    // Revert to Homepage Open Graph Tags
    setMetaTag('property', 'og:type', HOMEPAGE_OG.type);
    setMetaTag('property', 'og:title', HOMEPAGE_OG.title);
    setMetaTag('property', 'og:description', HOMEPAGE_OG.description);
    setMetaTag('property', 'og:url', HOMEPAGE_OG.url);
    setMetaTag('property', 'og:image', HOMEPAGE_OG.image);
    setMetaTag('property', 'og:site_name', HOMEPAGE_OG.siteName);
    setMetaTag('property', 'og:locale', HOMEPAGE_OG.locale);

    // Revert to Homepage Twitter Card Tags
    setMetaTag('name', 'twitter:card', HOMEPAGE_OG.twitterCard);
    setMetaTag('name', 'twitter:title', HOMEPAGE_OG.title);
    setMetaTag('name', 'twitter:description', HOMEPAGE_OG.description);
    setMetaTag('name', 'twitter:image', HOMEPAGE_OG.image);
  }
}
