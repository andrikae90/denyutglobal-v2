import { NewsItem } from '../types';
import { getArticleSlug } from './slug';

const SITEMAP_BASE_DOMAIN = 'https://denyutglobal.my.id';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates valid XML sitemap string conforming to http://www.sitemaps.org/schemas/sitemap/0.9
 * Only includes the homepage and strictly published & reviewed articles with clean SEO slugs (/berita/[slug]).
 */
export function generateSitemapXml(articles: NewsItem[], baseDomain: string = SITEMAP_BASE_DOMAIN): string {
  const cleanDomain = baseDomain.replace(/\/+$/, '');
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];

  // Strictly filter only published & reviewed articles
  const published = articles.filter(
    (item) => item && item.status === 'published' && Boolean(item.reviewed)
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${escapeXml(`${cleanDomain}/`)}</loc>\n`;
  xml += `    <lastmod>${todayIso}</lastmod>\n`;
  xml += `    <changefreq>hourly</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Published Articles
  for (const article of published) {
    const slug = getArticleSlug(article);
    if (!slug) continue;
    let lastMod = todayIso;
    if (article.publishedAt) {
      try {
        lastMod = new Date(article.publishedAt).toISOString().split('T')[0];
      } catch {
        lastMod = todayIso;
      }
    }

    const priority = article.isHero || article.isBreaking ? '0.9' : '0.8';
    const loc = `${cleanDomain}/berita/${slug}`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}
