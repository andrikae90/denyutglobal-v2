/**
 * Deterministic Thematic SVG Illustration Generator for DenyutGlobal
 *
 * Generates editorial, high-aesthetic vector SVG graphics tailored to specific news categories,
 * article titles, and slugs without relying on external CDNs or human face photos.
 * Safe for UTF-8 URL encoding, <img src="..."> in React, and direct image/svg+xml HTTP responses.
 */

export interface ThematicSvgOptions {
  category?: string;
  kategori?: string;
  categoryLabel?: string;
  kategoriLabel?: string;
  title?: string;
  judul?: string;
  slug?: string;
  location?: string;
  negaraLokasi?: string;
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeXml(str = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function normalizeCategoryKey(rawCategory = ''): string {
  const norm = rawCategory.trim().toLowerCase();
  if (norm.includes('politik') || norm.includes('hukum') || norm.includes('diplomasi')) return 'politik';
  if (norm.includes('ekonomi') || norm.includes('bisnis') || norm.includes('keuangan') || norm.includes('pasar')) return 'ekonomi';
  if (norm.includes('teknologi') || norm.includes('digital') || norm.includes('cyber') || norm.includes('ai')) return 'teknologi';
  if (norm.includes('sains') || norm.includes('antariksa') || norm.includes('riset') || norm.includes('medis')) return 'sains';
  if (norm.includes('olahraga') || norm.includes('sport') || norm.includes('sepak bola')) return 'olahraga';
  if (norm.includes('bencana') || norm.includes('gempa') || norm.includes('gunung') || norm.includes('iklim') || norm.includes('cuaca')) return 'bencana';
  if (norm.includes('indonesia') || norm.includes('nasional') || norm.includes('nusantara')) return 'indonesia';
  if (norm.includes('dunia') || norm.includes('global') || norm.includes('internasional')) return 'dunia';
  return 'umum';
}

/**
 * Generates raw SVG markup for an editorial category fallback illustration.
 */
export function generateThematicCategorySvgRaw(options: ThematicSvgOptions = {}): string {
  const rawTitle = options.title || options.judul || 'Berita Terkini DenyutGlobal';
  const categoryRaw = options.category || options.kategori || options.categoryLabel || options.kategoriLabel || 'Dunia';
  const categoryKey = normalizeCategoryKey(categoryRaw);
  const locationRaw = options.location || options.negaraLokasi || (categoryKey === 'indonesia' ? 'Indonesia' : 'Internasional');
  const slug = options.slug || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Deterministic seed for visual nuance (accents, angles)
  const seed = hashString(`${categoryKey}:${slug}:${rawTitle}`);
  const angle = 30 + (seed % 45);

  const safeTitle = escapeXml(rawTitle.length > 90 ? rawTitle.slice(0, 87) + '...' : rawTitle);
  const safeLocation = escapeXml(locationRaw.length > 25 ? locationRaw.slice(0, 22) + '...' : locationRaw).toUpperCase();

  // Category-specific themes
  let bgStart = '#0f172a';
  let bgEnd = '#1e293b';
  let primaryAccent = '#e11d48';
  let secondaryAccent = '#38bdf8';
  let categoryLabel = 'DUNIA & GLOBAL';
  let motifSvg = '';

  switch (categoryKey) {
    case 'politik':
      bgStart = '#181224';
      bgEnd = '#281a38';
      primaryAccent = '#e11d48';
      secondaryAccent = '#c084fc';
      categoryLabel = 'POLITIK & KEBIJAKAN';
      motifSvg = `
        <!-- Civic Pillars & Diplomatic Council Geometry -->
        <g stroke="${secondaryAccent}" stroke-width="2" opacity="0.35" fill="none">
          <path d="M 680 500 L 680 240 M 740 500 L 740 240 M 800 500 L 800 240 M 860 500 L 860 240 M 920 500 L 920 240" stroke-width="4" stroke-linecap="round" />
          <path d="M 640 240 L 960 240 L 800 130 Z" fill="${bgStart}" fill-opacity="0.8" stroke="${primaryAccent}" stroke-width="3" />
          <line x1="620" y1="500" x2="980" y2="500" stroke="${secondaryAccent}" stroke-width="4" />
          <circle cx="800" cy="190" r="16" fill="${primaryAccent}" fill-opacity="0.4" stroke="${primaryAccent}" stroke-width="2" />
        </g>
        <circle cx="800" cy="320" r="180" fill="none" stroke="${primaryAccent}" stroke-width="1.5" stroke-dasharray="8,8" opacity="0.25" />
      `;
      break;

    case 'ekonomi':
      bgStart = '#0f172a';
      bgEnd = '#1f2937';
      primaryAccent = '#f59e0b';
      secondaryAccent = '#38bdf8';
      categoryLabel = 'EKONOMI & PASAR';
      motifSvg = `
        <!-- Financial Market Trends & Growth Polyline -->
        <defs>
          <linearGradient id="econArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${primaryAccent}" stop-opacity="0.28" />
            <stop offset="100%" stop-color="${primaryAccent}" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="M 520 480 L 640 410 L 730 440 L 840 310 L 950 350 L 1080 180" fill="none" stroke="${primaryAccent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 520 480 L 640 410 L 730 440 L 840 310 L 950 350 L 1080 180 L 1080 540 L 520 540 Z" fill="url(#econArea)" />
        <g fill="${secondaryAccent}" opacity="0.4">
          <rect x="580" y="380" width="18" height="130" rx="3" />
          <rect x="670" y="340" width="18" height="170" rx="3" fill="${primaryAccent}" opacity="0.6" />
          <rect x="780" y="280" width="18" height="230" rx="3" />
          <rect x="890" y="240" width="18" height="270" rx="3" fill="${primaryAccent}" opacity="0.7" />
          <rect x="1000" y="160" width="18" height="350" rx="3" />
        </g>
        <circle cx="1080" cy="180" r="9" fill="${primaryAccent}" />
      `;
      break;

    case 'teknologi':
      bgStart = '#070b14';
      bgEnd = '#13192f';
      primaryAccent = '#818cf8';
      secondaryAccent = '#06b6d4';
      categoryLabel = 'TEKNOLOGI & DIGITAL';
      motifSvg = `
        <!-- Microchip Architecture & Circuit Node Trace -->
        <rect x="680" y="180" width="280" height="280" rx="28" fill="#13192f" stroke="${primaryAccent}" stroke-width="3" />
        <rect x="730" y="230" width="180" height="180" rx="16" fill="#1e1b4b" stroke="${secondaryAccent}" stroke-width="2" />
        <circle cx="820" cy="320" r="42" fill="${primaryAccent}" fill-opacity="0.25" />
        <circle cx="820" cy="320" r="20" fill="${secondaryAccent}" />
        <g stroke="${secondaryAccent}" stroke-width="2.5" stroke-linecap="round" opacity="0.6">
          <line x1="560" y1="240" x2="680" y2="240" stroke-dasharray="6,4" />
          <line x1="520" y1="320" x2="680" y2="320" />
          <line x1="560" y1="400" x2="680" y2="400" stroke-dasharray="6,4" />
          <line x1="960" y1="240" x2="1080" y2="240" stroke-dasharray="6,4" />
          <line x1="960" y1="320" x2="1120" y2="320" />
          <line x1="960" y1="400" x2="1080" y2="400" stroke-dasharray="6,4" />
          <line x1="820" y1="80" x2="820" y2="180" />
          <line x1="820" y1="460" x2="820" y2="560" />
        </g>
        <circle cx="520" cy="320" r="6" fill="${primaryAccent}" />
        <circle cx="1120" cy="320" r="6" fill="${primaryAccent}" />
        <circle cx="820" cy="80" r="6" fill="${primaryAccent}" />
        <circle cx="820" cy="560" r="6" fill="${primaryAccent}" />
      `;
      break;

    case 'olahraga':
      bgStart = '#041d1a';
      bgEnd = '#0b2e27';
      primaryAccent = '#10b981';
      secondaryAccent = '#a3e635';
      categoryLabel = 'OLAHRAGA & PRESTASI';
      motifSvg = `
        <!-- Kinetic Stadium Track & Dynamic Vector Curves -->
        <ellipse cx="820" cy="340" rx="260" ry="140" fill="none" stroke="${primaryAccent}" stroke-width="3" opacity="0.6" transform="rotate(-15 820 340)" />
        <ellipse cx="820" cy="340" rx="200" ry="100" fill="none" stroke="${secondaryAccent}" stroke-width="2.5" opacity="0.5" stroke-dasharray="10,6" transform="rotate(-15 820 340)" />
        <ellipse cx="820" cy="340" rx="140" ry="60" fill="none" stroke="#f8fafc" stroke-width="2" opacity="0.3" transform="rotate(-15 820 340)" />
        <path d="M 640 480 Q 820 220 1020 280" fill="none" stroke="${secondaryAccent}" stroke-width="4" stroke-linecap="round" opacity="0.75" />
        <circle cx="640" cy="480" r="8" fill="${primaryAccent}" />
        <circle cx="1020" cy="280" r="8" fill="${secondaryAccent}" />
      `;
      break;

    case 'sains':
      bgStart = '#09091a';
      bgEnd = '#191535';
      primaryAccent = '#a855f7';
      secondaryAccent = '#38bdf8';
      categoryLabel = 'SAINS & EKSPLORASI';
      motifSvg = `
        <!-- Atomic Orbital Rings & Astronomical Matrix -->
        <ellipse cx="820" cy="320" rx="220" ry="70" fill="none" stroke="${secondaryAccent}" stroke-width="2.5" opacity="0.5" transform="rotate(30 820 320)" />
        <ellipse cx="820" cy="320" rx="220" ry="70" fill="none" stroke="${primaryAccent}" stroke-width="2.5" opacity="0.5" transform="rotate(-30 820 320)" />
        <ellipse cx="820" cy="320" rx="220" ry="70" fill="none" stroke="#cbd5e1" stroke-width="1.8" opacity="0.35" transform="rotate(90 820 320)" />
        <circle cx="820" cy="320" r="28" fill="${primaryAccent}" fill-opacity="0.3" stroke="${primaryAccent}" stroke-width="3" />
        <circle cx="820" cy="320" r="14" fill="${secondaryAccent}" />
        <circle cx="980" cy="410" r="6" fill="${secondaryAccent}" />
        <circle cx="660" cy="230" r="6" fill="${primaryAccent}" />
        <circle cx="820" cy="110" r="6" fill="#f8fafc" />
      `;
      break;

    case 'bencana':
      bgStart = '#1c1917';
      bgEnd = '#292524';
      primaryAccent = '#f97316';
      secondaryAccent = '#ef4444';
      categoryLabel = 'TANGGAP BENCANA';
      motifSvg = `
        <!-- Topographic Alert Lines & Seismic Wave Pulse -->
        <circle cx="820" cy="320" r="220" fill="none" stroke="${secondaryAccent}" stroke-width="1.5" opacity="0.2" />
        <circle cx="820" cy="320" r="160" fill="none" stroke="${primaryAccent}" stroke-width="2" stroke-dasharray="8,6" opacity="0.4" />
        <circle cx="820" cy="320" r="90" fill="none" stroke="${secondaryAccent}" stroke-width="2.5" opacity="0.6" />
        <circle cx="820" cy="320" r="14" fill="${primaryAccent}" />
        <path d="M 520 420 L 620 420 L 660 330 L 700 480 L 740 260 L 780 440 L 820 320 L 900 420 L 1100 420" fill="none" stroke="${primaryAccent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;

    case 'indonesia':
      bgStart = '#180f12';
      bgEnd = '#261217';
      primaryAccent = '#e11d48';
      secondaryAccent = '#fbbf24';
      categoryLabel = 'NASIONAL & INDONESIA';
      motifSvg = `
        <!-- Indonesian Archipelago Contour & National Crest Silhouette -->
        <g stroke="${primaryAccent}" stroke-width="2" opacity="0.45" fill="none">
          <ellipse cx="820" cy="310" rx="240" ry="120" stroke="${secondaryAccent}" stroke-width="1.5" stroke-dasharray="6,6" />
          <!-- Iconic needle monument silhouette -->
          <path d="M 816 140 L 824 140 L 826 310 L 838 320 L 838 340 L 802 340 L 802 320 L 814 310 Z" fill="${secondaryAccent}" fill-opacity="0.8" stroke="none" />
          <rect x="790" y="340" width="60" height="12" rx="2" fill="${primaryAccent}" stroke="none" />
          <!-- Wave contour representing archipelago sea -->
          <path d="M 560 380 Q 690 350 820 380 T 1080 380" stroke="${primaryAccent}" stroke-width="3" />
          <path d="M 600 420 Q 730 395 860 420 T 1120 420" stroke="${secondaryAccent}" stroke-width="2" opacity="0.6" />
        </g>
        <circle cx="820" cy="130" r="10" fill="${secondaryAccent}" />
      `;
      break;

    default: // 'dunia' and 'umum'
      bgStart = '#0b1329';
      bgEnd = '#17223b';
      primaryAccent = '#e11d48';
      secondaryAccent = '#38bdf8';
      categoryLabel = 'DUNIA & GLOBAL';
      motifSvg = `
        <!-- Minimalist Globe Coordinates & Editorial Pulse -->
        <circle cx="820" cy="320" r="190" fill="none" stroke="${secondaryAccent}" stroke-width="2" opacity="0.35" />
        <ellipse cx="820" cy="320" rx="190" ry="80" fill="none" stroke="${secondaryAccent}" stroke-width="2" opacity="0.35" />
        <ellipse cx="820" cy="320" rx="90" ry="190" fill="none" stroke="${secondaryAccent}" stroke-width="2" opacity="0.35" />
        <circle cx="820" cy="320" r="8" fill="${primaryAccent}" />
        <path d="M 540 320 L 720 320 L 750 260 L 780 370 L 810 290 L 840 340 L 870 320 L 1100 320" fill="none" stroke="${primaryAccent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${bgStart}" />
      <stop offset="100%" stop-color="${bgEnd}" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.88" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0.96" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="675" fill="url(#bgGrad)" />

  <!-- Subtle Precision Editorial Grid -->
  <g stroke="#ffffff" stroke-width="1" opacity="0.035">
    <line x1="0" y1="135" x2="1200" y2="135" />
    <line x1="0" y1="270" x2="1200" y2="270" />
    <line x1="0" y1="405" x2="1200" y2="405" />
    <line x1="0" y1="540" x2="1200" y2="540" />
    <line x1="200" y1="0" x2="200" y2="675" />
    <line x1="400" y1="0" x2="400" y2="675" />
    <line x1="600" y1="0" x2="600" y2="675" />
    <line x1="800" y1="0" x2="800" y2="675" />
    <line x1="1000" y1="0" x2="1000" y2="675" />
  </g>

  <!-- Dynamic Thematic Geometry Motif -->
  ${motifSvg}

  <!-- Header Section: Category Badge & Location -->
  <g transform="translate(64, 56)">
    <rect x="0" y="0" width="240" height="40" rx="20" fill="#0f172a" fill-opacity="0.92" stroke="${primaryAccent}" stroke-width="1.8" />
    <circle cx="20" cy="20" r="6" fill="${primaryAccent}" />
    <text x="36" y="25" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="0.8">${categoryLabel}</text>
  </g>

  <g transform="translate(320, 56)">
    <rect x="0" y="0" width="210" height="40" rx="20" fill="#0f172a" fill-opacity="0.8" stroke="#334155" stroke-width="1.2" />
    <text x="24" y="25" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="600" letter-spacing="0.6">• ${safeLocation}</text>
  </g>

  <!-- Editorial Card Overlay on Bottom Half -->
  <g transform="translate(64, 460)">
    <rect x="0" y="0" width="1072" height="155" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" />
    
    <!-- DenyutGlobal Top Brand Micro-heading -->
    <text x="32" y="38" fill="${secondaryAccent}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">DENYUTGLOBAL • LIPUTAN REDAKSI</text>
    
    <!-- Article Title -->
    <text x="32" y="78" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="700">${safeTitle}</text>
    
    <!-- Meta Caption & Indicator -->
    <circle cx="36" cy="118" r="4" fill="${primaryAccent}" />
    <text x="48" y="122" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="500">Visual Tematik Otomatis Redaksi • Bebas Hak Cipta Pihak Ketiga</text>
  </g>
</svg>`;
}

/**
 * Returns a valid UTF-8 SVG data URL for direct embedding in <img src="...">
 * Compatible with all modern browsers without requiring Buffer or network calls.
 */
export function generateThematicCategorySvgDataUrl(options: ThematicSvgOptions = {}): string {
  const svg = generateThematicCategorySvgRaw(options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
