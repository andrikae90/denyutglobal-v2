import { NewsItem } from '../types';
import { getArticleSlug, PRODUCTION_CANONICAL_DOMAIN } from './slug';

const SCRIPT_ARTICLE_ID = 'denyutglobal-schema-newsarticle';
const SCRIPT_BREADCRUMB_ID = 'denyutglobal-schema-breadcrumbs';

/**
 * Generates Structured Data (Schema.org) for the Homepage:
 * - WebSite
 * - NewsMediaOrganization
 */
export function getHomepageStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${PRODUCTION_CANONICAL_DOMAIN}/#organization`,
        'name': 'DenyutGlobal',
        'url': `${PRODUCTION_CANONICAL_DOMAIN}/`,
        'logo': {
          '@type': 'ImageObject',
          '@id': `${PRODUCTION_CANONICAL_DOMAIN}/#logo`,
          'url': `${PRODUCTION_CANONICAL_DOMAIN}/favicon.svg`,
          'caption': 'DenyutGlobal'
        },
        'description': 'Portal berita modern berbahasa Indonesia yang menyajikan informasi global terkini secara ringkas dan kredibel.',
        'knowsLanguage': ['id']
      },
      {
        '@type': 'WebSite',
        '@id': `${PRODUCTION_CANONICAL_DOMAIN}/#website`,
        'url': `${PRODUCTION_CANONICAL_DOMAIN}/`,
        'name': 'DenyutGlobal',
        'alternateName': 'Denyut Global',
        'description': 'DenyutGlobal adalah portal berita berbahasa Indonesia yang menyajikan informasi dan perkembangan terbaru dari berbagai belahan dunia secara ringkas, jelas, dan mudah dipahami.',
        'publisher': {
          '@id': `${PRODUCTION_CANONICAL_DOMAIN}/#organization`
        },
        'inLanguage': 'id-ID',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${PRODUCTION_CANONICAL_DOMAIN}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };
}

/**
 * Generates Structured Data (Schema.org) for a News Article:
 * - NewsArticle
 */
export function getArticleNewsStructuredData(article: NewsItem) {
  const slug = getArticleSlug(article);
  const articleUrl = `${PRODUCTION_CANONICAL_DOMAIN}/berita/${slug}`;
  const headline = article.judul || article.title || '';
  const description = article.ringkasan || article.summary || '';

  // Resolve ISO date string for publication
  let datePublished = article.publishedAt;
  if (!datePublished) {
    // If not provided, fallback to current or standard timestamp
    datePublished = new Date().toISOString();
  }

  // Resolve modified date
  const dateModified = article.updatedAt || article.correctedAt || datePublished;

  // Resolve images array
  const images: string[] = [];
  const rawImage = article.gambar || article.image;
  if (rawImage) {
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      images.push(rawImage);
    } else {
      images.push(`${PRODUCTION_CANONICAL_DOMAIN}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`);
    }
  }

  const articleBody = (article.isiLengkap || article.content || []).join('\n\n') || description;
  const authorName = article.author || 'Redaksi DenyutGlobal';
  const section = article.kategoriLabel || article.categoryLabel || article.kategori || article.category || 'Berita';

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    'headline': headline,
    'description': description,
    'url': articleUrl,
    ...(images.length > 0 ? { 'image': images } : {}),
    'datePublished': datePublished,
    'dateModified': dateModified,
    'inLanguage': 'id-ID',
    'articleSection': section,
    'articleBody': articleBody,
    'author': {
      '@type': 'Person',
      'name': authorName,
      'url': `${PRODUCTION_CANONICAL_DOMAIN}/`
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'DenyutGlobal',
      'url': `${PRODUCTION_CANONICAL_DOMAIN}/`,
      'logo': {
        '@type': 'ImageObject',
        'url': `${PRODUCTION_CANONICAL_DOMAIN}/favicon.svg`
      }
    }
  };
}

/**
 * Generates Structured Data (Schema.org) for Article Breadcrumbs:
 * - BreadcrumbList (Beranda → Berita → Judul Artikel)
 */
export function getArticleBreadcrumbStructuredData(article: NewsItem) {
  const slug = getArticleSlug(article);
  const articleUrl = `${PRODUCTION_CANONICAL_DOMAIN}/berita/${slug}`;
  const headline = article.judul || article.title || 'Artikel Berita';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Beranda',
        'item': `${PRODUCTION_CANONICAL_DOMAIN}/`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Berita',
        'item': `${PRODUCTION_CANONICAL_DOMAIN}/`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': headline,
        'item': articleUrl
      }
    ]
  };
}

/**
 * Injects or updates dynamic JSON-LD scripts in document.head.
 * Ensures strictly no duplication when navigating between homepage and articles.
 */
export function updateStructuredData(article: NewsItem | null) {
  if (typeof document === 'undefined') return;

  if (article && article.status === 'published' && article.reviewed) {
    // 1. Inject or update NewsArticle schema
    const newsSchema = getArticleNewsStructuredData(article);
    let newsScript = document.getElementById(SCRIPT_ARTICLE_ID) as HTMLScriptElement | null;
    if (!newsScript) {
      newsScript = document.createElement('script');
      newsScript.id = SCRIPT_ARTICLE_ID;
      newsScript.type = 'application/ld+json';
      document.head.appendChild(newsScript);
    }
    newsScript.textContent = JSON.stringify(newsSchema);

    // 2. Inject or update BreadcrumbList schema
    const breadcrumbSchema = getArticleBreadcrumbStructuredData(article);
    let breadcrumbScript = document.getElementById(SCRIPT_BREADCRUMB_ID) as HTMLScriptElement | null;
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = SCRIPT_BREADCRUMB_ID;
      breadcrumbScript.type = 'application/ld+json';
      document.head.appendChild(breadcrumbScript);
    }
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
  } else {
    // When on homepage, clean up article-specific schemas to avoid pollution/conflict
    const newsScript = document.getElementById(SCRIPT_ARTICLE_ID);
    if (newsScript) newsScript.remove();

    const breadcrumbScript = document.getElementById(SCRIPT_BREADCRUMB_ID);
    if (breadcrumbScript) breadcrumbScript.remove();
  }
}
