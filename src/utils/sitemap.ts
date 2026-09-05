import { NewsItem } from '../types';
import { slugify } from './slug';
import { isPublicArticle } from './articleGuard';

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
 * Interface representing possible article input for sitemap generation.
 * Accepts full NewsItem or lightweight Cloudflare D1 query results.
 */
export interface SitemapArticleInput {
  id?: string;
  slug?: string;
  title?: string;
  judul?: string;
  updated_at?: string | null;
  created_at?: string | null;
  published_at?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  publishedAt?: string | null;
  status?: string;
  reviewed?: boolean | number;
  isHero?: boolean | number;
  is_hero?: boolean | number;
  isBreaking?: boolean | number;
  is_breaking?: boolean | number;
  [key: string]: any;
}

export const SITEMAP_STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'hourly' },
  { path: '/kategori/dunia', priority: '0.8', changefreq: 'hourly' },
  { path: '/kategori/asia', priority: '0.8', changefreq: 'hourly' },
  { path: '/kategori/eropa', priority: '0.8', changefreq: 'hourly' },
  { path: '/kategori/timur-tengah', priority: '0.8', changefreq: 'hourly' },
  { path: '/kategori/amerika', priority: '0.8', changefreq: 'hourly' },
  { path: '/kategori/indonesia', priority: '0.8', changefreq: 'hourly' },
  { path: '/kategori/analisis-opini', priority: '0.8', changefreq: 'daily' },
  { path: '/kategori/sosial-budaya', priority: '0.8', changefreq: 'daily' },
  { path: '/pedoman-redaksi', priority: '0.6', changefreq: 'monthly' },
  { path: '/pedoman-media-siber', priority: '0.6', changefreq: 'monthly' },
  { path: '/kebijakan-koreksi', priority: '0.6', changefreq: 'monthly' },
  { path: '/laporkan-koreksi', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.6', changefreq: 'monthly' },
  { path: '/disclaimer', priority: '0.6', changefreq: 'monthly' },
  { path: '/kontak', priority: '0.6', changefreq: 'monthly' },
  { path: '/tentang-kami', priority: '0.6', changefreq: 'monthly' }
];

/**
 * Generates valid XML sitemap string conforming to http://www.sitemaps.org/schemas/sitemap/0.9
 * - Homepage: https://denyutglobal.my.id/
 * - Articles: https://denyutglobal.my.id/berita/{slug}
 * - Uses updated_at as lastmod if available; otherwise uses created_at
 */
export function generateSitemapXml(
  articles: (NewsItem | SitemapArticleInput)[],
  baseDomain: string = SITEMAP_BASE_DOMAIN
): string {
  const cleanDomain = (baseDomain || SITEMAP_BASE_DOMAIN).replace(/\/+$/, '');
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];

  // Strictly filter only verified, non-empty, published & reviewed articles
  const published = (Array.isArray(articles) ? articles : []).filter(isPublicArticle);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static Pages & Categories
  for (const page of SITEMAP_STATIC_PAGES) {
    const loc = page.path === '/' ? `${cleanDomain}/` : `${cleanDomain}${page.path}`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${todayIso}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 2. Published & Reviewed Articles
  for (const article of published) {
    const a = article as SitemapArticleInput;
    // Determine slug
    let rawSlug = a.slug;
    if (!rawSlug || !String(rawSlug).trim()) {
      rawSlug = a.title || a.judul || a.id || '';
    }
    const cleanSlug = slugify(String(rawSlug));
    if (!cleanSlug) continue;

    // Determine lastmod: updated_at if available; if empty/null, use created_at
    const rawDate = a.updated_at || a.updatedAt || a.created_at || a.createdAt || a.published_at || a.publishedAt;
    let lastMod = todayIso;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          lastMod = d.toISOString().split('T')[0];
        }
      } catch {
        lastMod = todayIso;
      }
    }

    const isHighPriority = Boolean(
      a.isHero ||
      a.is_hero ||
      a.isBreaking ||
      a.is_breaking
    );
    const priority = isHighPriority ? '0.9' : '0.8';
    const loc = `${cleanDomain}/berita/${cleanSlug}`;

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

