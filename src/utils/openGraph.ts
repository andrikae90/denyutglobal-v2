import { NewsItem } from '../types';
import { getArticleSlug, PRODUCTION_CANONICAL_DOMAIN } from './slug';
import { getArticleParagraphs } from './articleGuard';
import { getArticleNewsStructuredData, getArticleBreadcrumbStructuredData } from './schema';
import { LegalDocument } from '../data/legalContent';

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
  // If rawImage is empty, use the article's own deterministic public image endpoint
  if (slug) {
    return `${domain}/api/articles/${encodeURIComponent(slug)}/image`;
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

  // 6. Replace or Inject Schema.org JSON-LD (NewsArticle + BreadcrumbList)
  try {
    const newsSchema = getArticleNewsStructuredData(article);
    const breadcrumbSchema = getArticleBreadcrumbStructuredData(article);
    const schemaHtml = `
  <script id="denyutglobal-schema-newsarticle" type="application/ld+json">
${JSON.stringify(newsSchema, null, 2)}
  </script>
  <script id="denyutglobal-schema-breadcrumbs" type="application/ld+json">
${JSON.stringify(breadcrumbSchema, null, 2)}
  </script>`;

    if (/<script\s+id=["']denyutglobal-schema-homepage["'][^>]*>[\s\S]*?<\/script>/i.test(output)) {
      output = output.replace(
        /<script\s+id=["']denyutglobal-schema-homepage["'][^>]*>[\s\S]*?<\/script>/i,
        schemaHtml
      );
    } else if (/<\/head>/i.test(output)) {
      output = output.replace(/<\/head>/i, `${schemaHtml}\n</head>`);
    }
  } catch (schemaErr) {
    console.warn('Failed to inject article JSON-LD schema', schemaErr);
  }

  // 7. Phase 6, 7 & 8: Server-Rendered Article Content Fallback (Crawler & No-JS Visibility)
  try {
    const categoryLabel = article.kategoriLabel || article.categoryLabel || article.kategori || article.category || 'Berita Global';
    const author = article.author || 'Redaksi DenyutGlobal';
    const publishedAt = article.publishedAt || article.tanggal || new Date().toISOString();
    const location = article.location || article.negaraLokasi || '';

    const paragraphs = getArticleParagraphs(article);
    const paragraphsHtml = paragraphs.length > 0
      ? paragraphs.map((p) => `<p class="mb-4 text-slate-800 leading-relaxed">${escapeHtml(p)}</p>`).join('\n      ')
      : `<p class="mb-4 text-slate-800 leading-relaxed">${escapeHtml(summary)}</p>`;

    // Facts list if available
    let factsHtml = '';
    let rawFacts = article.facts || article.facts_json;
    if (typeof rawFacts === 'string') {
      try { rawFacts = JSON.parse(rawFacts); } catch {}
    }
    if (Array.isArray(rawFacts) && rawFacts.length > 0) {
      const items = rawFacts
        .filter(Boolean)
        .map((f: any) => `<li class="text-sm text-slate-700">${escapeHtml(String(f))}</li>`)
        .join('\n          ');
      factsHtml = `
      <div class="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Fakta Kunci</h3>
        <ul class="list-disc pl-5 space-y-1">
          ${items}
        </ul>
      </div>`;
    }

    // Why it matters if available
    let whyItMattersHtml = '';
    const whyItMatters = article.whyItMatters || article.why_it_matters;
    if (whyItMatters && typeof whyItMatters === 'string' && whyItMatters.trim()) {
      whyItMattersHtml = `
      <div class="my-6 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-lg">
        <h3 class="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">Mengapa Informasi Ini Penting</h3>
        <p class="text-sm text-rose-950 leading-relaxed">${escapeHtml(whyItMatters.trim())}</p>
      </div>`;
    }

    let displayDate = publishedAt;
    try {
      displayDate = new Date(publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {}

    const serverRenderedArticle = `
    <div id="root">
      <article data-server-rendered="true" class="server-rendered-article max-w-4xl mx-auto px-4 py-8">
        <header class="mb-6 pb-4 border-b border-slate-200">
          <div class="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">${escapeHtml(categoryLabel)}</div>
          <h1 class="text-2xl sm:text-4xl font-bold font-serif text-slate-900 leading-tight mb-3">${escapeHtml(title)}</h1>
          <div class="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-2">
            <span>Oleh <strong>${escapeHtml(author)}</strong></span>
            <span>•</span>
            <time datetime="${escapeHtml(publishedAt)}">${escapeHtml(displayDate)}</time>
            ${location ? `<span>•</span><span>${escapeHtml(location)}</span>` : ''}
          </div>
        </header>
        ${summary ? `
        <section class="text-base sm:text-lg text-slate-700 font-medium leading-relaxed mb-6 p-4 bg-slate-100/80 rounded-lg border-l-4 border-rose-600">
          ${escapeHtml(summary)}
        </section>` : ''}
        <div class="article-body prose max-w-none text-slate-800 leading-relaxed">
          ${paragraphsHtml}
        </div>
        ${factsHtml}
        ${whyItMattersHtml}
      </article>
    </div>`;

    if (/<div\s+id=["']root["']>[\s\S]*?<\/div>/i.test(output)) {
      output = output.replace(/<div\s+id=["']root["']>[\s\S]*?<\/div>/i, serverRenderedArticle);
    }
  } catch (renderErr) {
    console.warn('Failed to inject server-rendered article content fallback', renderErr);
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

/**
 * Injects Legal Page metadata, Open Graph, and crawlable server fallback HTML.
 */
export function injectLegalOpenGraphHtml(
  html: string,
  legalDoc: LegalDocument,
  baseUrl: string = PRODUCTION_CANONICAL_DOMAIN
): string {
  if (!legalDoc) return html;

  const domain = baseUrl.replace(/\/+$/, '');
  const canonicalUrl = `${domain}${legalDoc.path}`;
  const fullTitle = legalDoc.metaTitle;
  const description = legalDoc.metaDescription;
  const imageUrl = HOMEPAGE_OG.image;

  let output = html;

  // 1. Replace Title
  if (/<title>[\s\S]*?<\/title>/i.test(output)) {
    output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  }

  // 2. Replace Description
  if (/<meta\s+name=["']description["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']description["'][^>]*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
  }

  // 3. Replace Canonical
  if (/<link\s+rel=["']canonical["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<link\s+rel=["']canonical["'][^>]*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
    );
  }

  // 4. Replace Open Graph Tags
  if (/<meta\s+property=["']og:type["'][^>]*\/?>/i.test(output)) {
    output = output.replace(/<meta\s+property=["']og:type["'][^>]*\/?>/i, `<meta property="og:type" content="website" />`);
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
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    );
  }
  if (/<meta\s+property=["']og:url["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+property=["']og:url["'][^>]*\/?>/i,
      `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
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
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    );
  }
  if (/<meta\s+name=["']twitter:image["'][^>]*\/?>/i.test(output)) {
    output = output.replace(
      /<meta\s+name=["']twitter:image["'][^>]*\/?>/i,
      `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`
    );
  }

  // 6. Inject Schema.org JSON-LD (WebPage)
  try {
    const legalSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: legalDoc.metaTitle,
      headline: legalDoc.title,
      description: legalDoc.metaDescription,
      url: canonicalUrl,
      inLanguage: 'id-ID',
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'DenyutGlobal',
        url: domain,
        logo: {
          '@type': 'ImageObject',
          url: `${domain}/icon-192.png`
        }
      },
      breadcrumb: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: domain
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Informasi & Legal',
            item: `${domain}/tentang-kami`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: legalDoc.title,
            item: canonicalUrl
          }
        ]
      }
    };

    const schemaHtml = `
  <script id="denyutglobal-schema-legalpage" type="application/ld+json">
${JSON.stringify(legalSchema, null, 2)}
  </script>`;

    if (/<script\s+id=["']denyutglobal-schema-homepage["'][^>]*>[\s\S]*?<\/script>/i.test(output)) {
      output = output.replace(
        /<script\s+id=["']denyutglobal-schema-homepage["'][^>]*>[\s\S]*?<\/script>/i,
        schemaHtml
      );
    } else if (/<\/head>/i.test(output)) {
      output = output.replace(/<\/head>/i, `${schemaHtml}\n</head>`);
    }
  } catch (schemaErr) {
    console.warn('Failed to inject legal page JSON-LD schema', schemaErr);
  }

  // 7. Inject Server-Rendered Legal Content into Fallback Container (for crawlers & no-JS)
  try {
    const sectionsHtml = legalDoc.sections
      .map((sec, idx) => {
        const secNum = sec.number ?? (idx + 1);
        const heading = escapeHtml(sec.heading);
        const pars = sec.paragraphs
          .map((p) => `<p class="mb-3 text-slate-700 leading-relaxed">${escapeHtml(p)}</p>`)
          .join('\n      ');
        const bullets = sec.bulletPoints && sec.bulletPoints.length > 0
          ? `<ul class="list-disc pl-5 mb-4 space-y-1.5 text-slate-700 leading-relaxed text-sm">
        ${sec.bulletPoints.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n        ')}
      </ul>`
          : '';
        const callout = sec.callout
          ? `<div class="my-4 p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-sm text-slate-800">
        ${sec.callout.title ? `<strong class="block font-semibold text-rose-950 mb-1">${escapeHtml(sec.callout.title)}</strong>` : ''}
        <p>${escapeHtml(sec.callout.text)}</p>
      </div>`
          : '';

        return `
    <section class="mb-8 p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
      <div class="flex items-center gap-2 mb-3">
        <span class="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">${secNum}</span>
        <h2 class="text-lg font-bold text-slate-900">${heading}</h2>
      </div>
      ${pars}
      ${bullets}
      ${callout}
    </section>`;
      })
      .join('\n');

    const fallbackLegalHtml = `
  <div data-server-fallback="true" class="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-4xl mx-auto">
      <nav class="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
        <a href="/" class="hover:underline text-rose-600">Beranda</a>
        <span>/</span>
        <span>Informasi &amp; Legal</span>
        <span>/</span>
        <span class="text-slate-800 font-medium">${escapeHtml(legalDoc.title)}</span>
      </nav>

      <header class="mb-8 pb-6 border-b border-slate-200">
        <div class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 mb-2">
          ${escapeHtml(legalDoc.categoryBadge)}
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-950 mb-3 tracking-tight">${escapeHtml(legalDoc.title)}</h1>
        ${legalDoc.tagline ? `<p class="text-rose-600 font-medium italic text-base sm:text-lg mb-2">${escapeHtml(legalDoc.tagline)}</p>` : ''}
        <p class="text-sm text-slate-500">Terakhir Diperbarui: ${escapeHtml(legalDoc.lastUpdated)} &bull; Redaksi DenyutGlobal</p>
        <p class="mt-4 text-slate-700 leading-relaxed text-base">${escapeHtml(legalDoc.summary)}</p>
      </header>

      <main>
        ${sectionsHtml}
      </main>

      <footer class="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p class="mb-3">&copy; 2026 DenyutGlobal. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
        <div class="flex flex-wrap justify-center gap-4 text-slate-600">
          <a href="/tentang-kami" class="hover:underline">Tentang Kami</a>
          <a href="/kontak" class="hover:underline">Kontak</a>
          <a href="/privacy-policy" class="hover:underline">Kebijakan Privasi</a>
          <a href="/ketentuan-layanan" class="hover:underline">Ketentuan Layanan</a>
          <a href="/disclaimer" class="hover:underline">Disclaimer</a>
          <a href="/pedoman-redaksi" class="hover:underline">Pedoman Redaksi</a>
          <a href="/pedoman-media-siber" class="hover:underline">Pedoman Media Siber</a>
          <a href="/kebijakan-koreksi" class="hover:underline">Kebijakan Koreksi</a>
        </div>
      </footer>
    </div>
  </div>`;

    if (/<div\s+data-server-fallback=["']true["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/i.test(output)) {
      output = output.replace(
        /<div\s+data-server-fallback=["']true["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/i,
        fallbackLegalHtml
      );
    } else if (/<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i.test(output)) {
      output = output.replace(
        /(<div\s+id=["']root["'][^>]*>)([\s\S]*?)(<\/div>)/i,
        `$1${fallbackLegalHtml}$3`
      );
    }
  } catch (contentErr) {
    console.warn('Failed to inject server-rendered legal page fallback content', contentErr);
  }

  return output;
}

/**
 * Updates DOM metadata for Legal Pages in client-side React navigation.
 */
export function updateClientLegalMetadata(legalDoc: LegalDocument | null): void {
  if (typeof document === 'undefined') return;

  if (legalDoc) {
    document.title = legalDoc.metaTitle;

    // Description
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.setAttribute('name', 'description');
      document.head.appendChild(desc);
    }
    desc.setAttribute('content', legalDoc.metaDescription);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', legalDoc.canonicalUrl);

    // Set OG Tags
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:title', legalDoc.metaTitle);
    setMetaTag('property', 'og:description', legalDoc.metaDescription);
    setMetaTag('property', 'og:url', legalDoc.canonicalUrl);
    setMetaTag('property', 'og:image', HOMEPAGE_OG.image);

    setMetaTag('name', 'twitter:card', HOMEPAGE_OG.twitterCard);
    setMetaTag('name', 'twitter:title', legalDoc.metaTitle);
    setMetaTag('name', 'twitter:description', legalDoc.metaDescription);
    setMetaTag('name', 'twitter:image', HOMEPAGE_OG.image);
  } else {
    // Revert to Homepage
    document.title = HOMEPAGE_OG.title;
    let desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', HOMEPAGE_OG.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', HOMEPAGE_OG.url);

    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (el) el.setAttribute('content', content);
    };

    setMetaTag('property', 'og:type', HOMEPAGE_OG.type);
    setMetaTag('property', 'og:title', HOMEPAGE_OG.title);
    setMetaTag('property', 'og:description', HOMEPAGE_OG.description);
    setMetaTag('property', 'og:url', HOMEPAGE_OG.url);
    setMetaTag('property', 'og:image', HOMEPAGE_OG.image);
  }
}

