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
  { path: '/tentang-kami', priority: '0.6', changefreq: 'monthly' },
  { path: '/kontak', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.6', changefreq: 'monthly' },
  { path: '/ketentuan-layanan', priority: '0.6', changefreq: 'monthly' },
  { path: '/disclaimer', priority: '0.6', changefreq: 'monthly' },
  { path: '/pedoman-redaksi', priority: '0.6', changefreq: 'monthly' },
  { path: '/pedoman-media-siber', priority: '0.6', changefreq: 'monthly' },
  { path: '/kebijakan-koreksi', priority: '0.6', changefreq: 'monthly' }
];

/**
 * Parses diverse date formats into standard YYYY-MM-DD for sitemap lastmod.
 * Handles ISO timestamps, SQLite datetimes, and Indonesian date strings (e.g., '9 September 2026, 18:22 WIB').
 */
export function parseDateToYmd(rawDate: any): string | null {
  if (!rawDate) return null;
  const str = String(rawDate).trim();
  if (!str) return null;

  // 1. Direct match YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
  }

  // 2. Standard Date object parsing
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  // 3. Indonesian localized date format: "9 September 2026"
  const indoMonths: Record<string, string> = {
    januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
    juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
  };
  const indoMatch = str.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (indoMatch) {
    const day = indoMatch[1].padStart(2, '0');
    const month = indoMonths[indoMatch[2]];
    const year = indoMatch[3];
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

/**
 * Sanitizes base domain to ensure canonical production URL is always used,
 * preventing accidental localhost or workers.dev leakage into sitemap.
 */
export function sanitizeSitemapDomain(domain?: string): string {
  if (!domain) return SITEMAP_BASE_DOMAIN;
  const trimmed = domain.replace(/\/+$/, '').trim();
  if (!trimmed || trimmed.includes('localhost') || trimmed.includes('127.0.0.1') || trimmed.includes('workers.dev')) {
    return SITEMAP_BASE_DOMAIN;
  }
  return trimmed;
}

/**
 * Generates valid XML sitemap string conforming to http://www.sitemaps.org/schemas/sitemap/0.9
 * - Homepage: https://denyutglobal.my.id/
 * - Articles: https://denyutglobal.my.id/berita/{slug}
 * - Uses updated_at as lastmod if available; otherwise uses published_at or created_at
 * - Strictly deduplicates all URLs
 */
export function generateSitemapXml(
  articles: (NewsItem | SitemapArticleInput)[],
  baseDomain: string = SITEMAP_BASE_DOMAIN
): string {
  const cleanDomain = sanitizeSitemapDomain(baseDomain);
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];
  const seenUrls = new Set<string>();

  // Strictly filter only verified, non-empty, published & reviewed articles
  const published = (Array.isArray(articles) ? articles : []).filter(isPublicArticle);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static Pages & Categories
  for (const page of SITEMAP_STATIC_PAGES) {
    const loc = page.path === '/' ? `${cleanDomain}/` : `${cleanDomain}${page.path}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

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

    const loc = `${cleanDomain}/berita/${cleanSlug}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    // Determine lastmod: updated_at if available and valid; then published_at/created_at
    const lastMod =
      parseDateToYmd(a.updated_at || a.updatedAt) ||
      parseDateToYmd(a.published_at || a.publishedAt) ||
      parseDateToYmd(a.created_at || a.createdAt) ||
      todayIso;

    const isHighPriority = Boolean(
      a.isHero ||
      a.is_hero ||
      a.isBreaking ||
      a.is_breaking
    );
    const priority = isHighPriority ? '0.9' : '0.8';

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

