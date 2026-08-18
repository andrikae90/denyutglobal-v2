import { NewsItem } from '../types';
import { getArticleSlug } from './slug';

const SITEMAP_BASE_DOMAIN = 'https://denyutglobal.ai.studio';

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
    (item) => item.status === 'published' && item.reviewed === true
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${cleanDomain}/</loc>\n`;
  xml += `    <lastmod>${todayIso}</lastmod>\n`;
  xml += `    <changefreq>hourly</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Published Articles
  for (const article of published) {
    const slug = getArticleSlug(article);
    let lastMod = todayIso;
    if (article.publishedAt) {
      try {
        lastMod = new Date(article.publishedAt).toISOString().split('T')[0];
      } catch {
        lastMod = todayIso;
      }
    }

    const priority = article.isHero || article.isBreaking ? '0.9' : '0.8';

    xml += `  <url>\n`;
    xml += `    <loc>${cleanDomain}/berita/${slug}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}
