import { NewsItem, CategoryId } from '../../types';
import { RawRssItem } from './types';
import { newsSummarizer } from '../newsSummarizer';

type AllowedCategory = Exclude<CategoryId, 'semua'>;

// Fallback high quality placeholder images based on category
const FALLBACK_CATEGORY_IMAGES: Record<AllowedCategory, string[]> = {
  dunia: [
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ],
  politik: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80'
  ],
  ekonomi: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80'
  ],
  teknologi: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
  ],
  sains: [
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ],
  olahraga: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'
  ],
  bencana: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80'
  ],
  indonesia: [
    'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'
  ]
};

// Detect Category safely from text
export function detectCategory(title: string, desc: string): { category: AllowedCategory; label: string } {
  const combined = `${title} ${desc}`.toLowerCase();

  if (combined.includes('indonesia') || combined.includes('jakarta') || combined.includes('nusantara')) {
    return { category: 'indonesia', label: 'Indonesia' };
  }
  if (combined.includes('sport') || combined.includes('football') || combined.includes('olympic') || combined.includes('fifa') || combined.includes('soccer') || combined.includes('olahraga')) {
    return { category: 'olahraga', label: 'Olahraga' };
  }
  if (combined.includes('earthquake') || combined.includes('flood') || combined.includes('storm') || combined.includes('volcano') || combined.includes('wildfire') || combined.includes('gempa') || combined.includes('banjir') || combined.includes('bencana') || combined.includes('tsunami')) {
    return { category: 'bencana', label: 'Bencana' };
  }
  if (combined.includes('tech') || combined.includes('ai ') || combined.includes('artificial intelligence') || combined.includes('cyber') || combined.includes('software') || combined.includes('chip') || combined.includes('teknologi')) {
    return { category: 'teknologi', label: 'Teknologi' };
  }
  if (combined.includes('science') || combined.includes('space') || combined.includes('nasa') || combined.includes('climate') || combined.includes('health') || combined.includes('sains') || combined.includes('antariksa') || combined.includes('medis')) {
    return { category: 'sains', label: 'Sains' };
  }
  if (combined.includes('economy') || combined.includes('inflation') || combined.includes('market') || combined.includes('trade') || combined.includes('dollar') || combined.includes('bank') || combined.includes('ekonomi') || combined.includes('bisnis') || combined.includes('saham')) {
    return { category: 'ekonomi', label: 'Ekonomi' };
  }
  if (combined.includes('election') || combined.includes('parliament') || combined.includes('president') || combined.includes('minister') || combined.includes('treaty') || combined.includes('politik') || combined.includes('diplomasi') || combined.includes('kTT')) {
    return { category: 'politik', label: 'Politik' };
  }

  return { category: 'dunia', label: 'Dunia' };
}

// Detect approximate location from text
export function detectLocation(title: string, desc: string, defaultLoc = 'Global'): string {
  const combined = `${title} ${desc}`;
  const locations: [string, RegExp][] = [
    ['Indonesia', /\b(indonesia|jakarta|bali|surabaya)\b/i],
    ['Amerika Serikat', /\b(us|usa|united states|washington|new york|biden|trump)\b/i],
    ['Inggris', /\b(uk|britain|london|british)\b/i],
    ['Jerman', /\b(germany|berlin|german)\b/i],
    ['Prancis', /\b(france|paris|french)\b/i],
    ['Ukraina', /\b(ukraine|kyiv|zelensky)\b/i],
    ['Rusia', /\b(russia|moscow|putin)\b/i],
    ['Tiongkok', /\b(china|beijing|chinese)\b/i],
    ['Jepang', /\b(japan|tokyo|japanese)\b/i],
    ['Timur Tengah', /\b(middle east|gaza|israel|palestine|lebanon|iran|saudi)\b/i],
    ['Australia', /\b(australia|sydney|canberra)\b/i],
    ['Eropa', /\b(europe|european union|brussels)\b/i]
  ];

  for (const [name, regex] of locations) {
    if (regex.test(combined)) return name;
  }
  return defaultLoc;
}

// Clean HTML tags and entities
export function stripHtml(input = ''): string {
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Format date into Indonesian string
export function formatDateId(dateInput?: string): { tanggal: string; waktu: string } {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) throw new Error('Invalid date');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const tanggal = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const waktu = `${hours}:${mins} WIB`;

    return { tanggal, waktu };
  } catch {
    return {
      tanggal: 'Hari ini',
      waktu: 'Terbaru'
    };
  }
}

// Normalize raw RSS item into DenyutGlobal NewsItem
export function normalizeRssItem(
  raw: RawRssItem,
  sourceName: 'BBC News' | 'DW' | 'ANTARA',
  index: number
): NewsItem {
  const cleanTitle = stripHtml(raw.title || 'Laporan Berita Aktual');
  const cleanDesc = stripHtml(raw.description || 'Simak perkembangan informasi terbaru melalui tautan sumber resmi.');
  const defaultLocation = sourceName === 'ANTARA' ? 'Indonesia' : (sourceName === 'BBC News' ? 'Global' : 'Internasional');
  
  let { category, label: kategoriLabel } = detectCategory(cleanTitle, cleanDesc);
  // For ANTARA, if not clearly categorized to another sector, prioritize category 'indonesia'
  if (sourceName === 'ANTARA' && category === 'dunia') {
    category = 'indonesia';
    kategoriLabel = 'Indonesia';
  }

  const location = detectLocation(cleanTitle, cleanDesc, defaultLocation);
  const { tanggal, waktu } = formatDateId(raw.pubDate || raw.isoDate);

  // Pick an image or fallback
  let image = raw.imageUrl;
  if (!image || !image.startsWith('http')) {
    const fallbackList = FALLBACK_CATEGORY_IMAGES[category] || FALLBACK_CATEGORY_IMAGES.indonesia;
    image = fallbackList[index % fallbackList.length];
  }

  const defaultUrl = sourceName === 'ANTARA' 
    ? 'https://www.antaranews.com' 
    : (sourceName === 'BBC News' ? 'https://www.bbc.com/news' : 'https://www.dw.com');
  const sourceUrl = raw.link || defaultUrl;
  const id = `rss-${sourceName.toLowerCase().replace(/\s+/g, '')}-${index}-${encodeURIComponent(cleanTitle.slice(0, 20)).replace(/%/g, '')}`;

  // Process through standardized newsSummarizer
  const processed = newsSummarizer.processArticle({
    originalTitle: cleanTitle,
    originalSummary: cleanDesc,
    source: sourceName,
    sourceUrl,
    category,
    location,
    publishedAt: raw.pubDate || raw.isoDate
  });

  const finalJudul = processed.titleId || cleanTitle;
  const finalRingkasan = processed.summaryId || cleanDesc;
  const finalIsiLengkap = [
    finalRingkasan,
    `Laporan ini disiarkan secara resmi oleh ${sourceName}. Untuk membaca liputan lengkap aslinya, silakan klik tombol "Baca berita asli" di bawah.`,
    `Mengapa berita ini penting?\n${processed.whyItMatters}`
  ];

  const sourceFeedType: 'bbc' | 'dw' | 'antara' = sourceName === 'BBC News' 
    ? 'bbc' 
    : (sourceName === 'DW' ? 'dw' : 'antara');

  return {
    id,
    judul: finalJudul,
    ringkasan: finalRingkasan,
    isiLengkap: finalIsiLengkap,
    kategori: category,
    kategoriLabel,
    gambar: image,
    captionGambar: `Dokumentasi Siaran ${sourceName}`,
    tanggal,
    waktu,
    namaSumber: sourceName,
    urlSumber: sourceUrl,
    negaraLokasi: location,
    isHero: index === 0 && sourceName === 'BBC News',
    isFeatured: index >= 1 && index <= 3,
    isBreaking: index === 0,
    readTimeMinutes: Math.max(2, Math.min(5, Math.ceil(finalRingkasan.split(' ').length / 30))),
    isLiveFeed: true,
    sourceFeedType,
    originalTitle: cleanTitle,
    titleId: processed.titleId,
    originalSummary: cleanDesc,
    summaryId: processed.summaryId,
    whyItMatters: processed.whyItMatters,
    publishedAt: raw.pubDate || raw.isoDate,
    translatedAt: processed.translatedAt,
    isTranslated: sourceName !== 'ANTARA'
  };
}
