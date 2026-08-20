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
    
    // Resolve absolute image URL
    let imageUrl = article.gambar || article.image || HOMEPAGE_OG.image;
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = `${PRODUCTION_CANONICAL_DOMAIN}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

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
