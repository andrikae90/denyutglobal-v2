import { CategoryId, ArticleSource } from '../types';
import { CATEGORIES } from '../data/categories';

export type SupportedSectionKey = 
  | 'rubrik'
  | 'lokasi'
  | 'judul'
  | 'fakta'
  | 'ringkasan'
  | 'konteks'
  | 'isi'
  | 'sumber'
  | 'slug';

export interface ParsedManuscript {
  rubrik: string | null;
  category: Exclude<CategoryId, 'semua'> | null;
  lokasi: string | null;
  judul: string | null;
  fakta: string | null;
  ringkasan: string | null;
  konteks: string | null;
  isi: string | null;
  sumber: string | null;
  sourcesList: ArticleSource[];
  slug: string | null;
}

export interface SectionFoundStatus {
  rubrik: boolean;
  lokasi: boolean;
  judul: boolean;
  fakta: boolean;
  ringkasan: boolean;
  konteks: boolean;
  isi: boolean;
  sumber: boolean;
  slug: boolean;
}

export interface ManuscriptParseResult {
  success: boolean;
  errorMessage?: string;
  parsed: ParsedManuscript;
  foundSections: SectionFoundStatus;
  missingSections: string[];
  totalFound: number;
}

// Canonical display names for UI report
export const SECTION_LABELS: Record<SupportedSectionKey, string> = {
  rubrik: 'Rubrik Kategori',
  lokasi: 'Lokasi Peristiwa',
  judul: 'Judul Naskah',
  fakta: 'Fakta Utama Terverifikasi',
  ringkasan: 'Ringkasan Berita (Lead Summary)',
  konteks: 'Konteks Signifikansi (Why It Matters)',
  isi: 'Isi Lengkap Berita',
  sumber: 'Sumber Rujukan',
  slug: 'Custom Slug'
};

/**
 * Normalizes category label/string to valid CategoryId in DenyutGlobal
 */
export function normalizeCategoryString(raw: string): Exclude<CategoryId, 'semua'> {
  const clean = raw.toLowerCase().trim();
  if (clean.includes('politik')) return 'politik';
  if (clean.includes('ekonomi') || clean.includes('bisnis') || clean.includes('keuangan') || clean.includes('pasar')) return 'ekonomi';
  if (clean.includes('tekno') || clean.includes('ai') || clean.includes('digital') || clean.includes('cyber') || clean.includes('komputasi')) return 'teknologi';
  if (clean.includes('sains') || clean.includes('ilmiah') || clean.includes('kesehatan') || clean.includes('antariksa') || clean.includes('medis') || clean.includes('science')) return 'sains';
  if (clean.includes('olahraga') || clean.includes('sport') || clean.includes('bola') || clean.includes('atlet')) return 'olahraga';
  if (clean.includes('bencana') || clean.includes('gempa') || clean.includes('gunung') || clean.includes('erupsi') || clean.includes('tsunami') || clean.includes('iklim') || clean.includes('cuaca')) return 'bencana';
  if (clean.includes('indo') || clean.includes('nasional') || clean.includes('nusantara')) return 'indonesia';
  return 'dunia'; // default fallback ke Rubrik Dunia / Global
}

/**
 * Parses raw text from Sumber Rujukan into structured ArticleSource items
 */
export function parseSourcesBlock(rawSources: string): ArticleSource[] {
  if (!rawSources || !rawSources.trim()) {
    return [{ name: '', url: '', date: '', notes: '' }];
  }

  const lines = rawSources
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const parsedList: ArticleSource[] = [];

  for (const line of lines) {
    // Strip leading bullets (1., -, *, •)
    let cleanLine = line.replace(/^(\d+[\.\)]|\-|\*|•)\s*/, '').trim();
    if (!cleanLine) continue;

    // Check for date pattern in parentheses like (21 Agustus 2026) or (2026-08-21)
    let date = '';
    const dateMatch = cleanLine.match(/\((\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})\)/);
    if (dateMatch) {
      date = dateMatch[1];
      cleanLine = cleanLine.replace(dateMatch[0], '').trim();
    }

    // Look for URL pattern
    const urlMatch = cleanLine.match(/https?:\/\/[^\s\)\],]+/i);
    const url = urlMatch ? urlMatch[0] : '';

    let name = cleanLine;

    // If URL found, extract name by removing the URL and remaining delimiters
    if (url) {
      name = cleanLine
        .replace(url, '')
        .replace(/\s*[\(\[\{]\s*[\)\]\}]\s*/g, ' ')
        .replace(/[\(\[\{]\s*$/g, '')
        .replace(/^\s*[\)\]\}]/g, '')
        .replace(/\s*[\-\|–—:\(\)\[\]\{\}]\s*$/g, '')
        .replace(/^\s*[\-\|–—:\(\)\[\]\{\}]\s*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!name) {
        // Derive name from domain if name became empty
        try {
          const domain = new URL(url).hostname.replace(/^www\./, '');
          name = domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch {
          name = url;
        }
      }
    } else {
      name = cleanLine
        .replace(/\s*[\-\|–—:\(\)\[\]\{\}]\s*$/g, '')
        .replace(/^\s*[\-\|–—:\(\)\[\]\{\}]\s*/g, '')
        .trim();
    }

    parsedList.push({
      name: name || cleanLine,
      url,
      date,
      notes: ''
    });
  }

  return parsedList.length > 0 ? parsedList : [{ name: rawSources.trim(), url: '', date: '', notes: '' }];
}

/**
 * Checks if a line matches a section header pattern.
 * Returns the matched section key and any inline content after the colon.
 */
function matchSectionHeader(rawLine: string): { key: SupportedSectionKey; inlineContent: string } | null {
  // Strip Markdown heading hashes, bold/italic markers, and bullets
  const stripped = rawLine
    .trim()
    .replace(/^[#>\-\*•\d\.\s]+/, '')
    .replace(/^[*_]{1,3}/, '')
    .replace(/[*_]{1,3}$/, '')
    .trim();

  // Pattern matchers (ordered from most specific to general)
  const headerRules: { key: SupportedSectionKey; regex: RegExp }[] = [
    // 1. RUBRIK KATEGORI
    {
      key: 'rubrik',
      regex: /^(?:RUBRIK\s*(?:\/|&)?\s*KATEGORI|KATEGORI\s*(?:\/|&)?\s*RUBRIK|RUBRIK|KATEGORI|CATEGORY|RUBRIC)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 2. LOKASI PERISTIWA
    {
      key: 'lokasi',
      regex: /^(?:LOKASI\s*PERISTIWA|LOKASI\s*(?:\/|&)?\s*WILAYAH|WILAYAH\s*(?:\/|&)?\s*LOKASI|NEGARA\s*(?:\/|&)?\s*LOKASI|LOKASI|WILAYAH|LOCATION)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 3. JUDUL NASKAH
    {
      key: 'judul',
      regex: /^(?:JUDUL\s*NASKAH\s*ORIGINAL|JUDUL\s*NASKAH|JUDUL\s*BERITA|JUDUL\s*ARTIKEL|JUDUL|HEADLINE|TITLE)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 4. POIN-POIN FAKTA UTAMA TERVERIFIKASI
    {
      key: 'fakta',
      regex: /^(?:POIN(?:[\-\s]POIN)?\s*FAKTA\s*UTAMA\s*TERVERIFIKASI|POIN(?:[\-\s]POIN)?\s*FAKTA\s*TERVERIFIKASI|FAKTA\s*UTAMA\s*TERVERIFIKASI|POIN(?:[\-\s]POIN)?\s*FAKTA\s*UTAMA|POIN(?:[\-\s]POIN)?\s*FAKTA|FAKTA\s*UTAMA|FAKTA\s*TERVERIFIKASI|FAKTA\s*KUNCI|VERIFIED\s*FACTS|KEY\s*FACTS|FAKTA)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 5. RINGKASAN BERITA (LEAD SUMMARY)
    {
      key: 'ringkasan',
      regex: /^(?:RINGKASAN\s*BERITA\s*\(LEAD\s*SUMMARY\)|RINGKASAN\s*BERITA\s*(?:\/|&)?\s*LEAD\s*SUMMARY|RINGKASAN\s*BERITA|LEAD\s*SUMMARY|RINGKASAN|LEAD|SUMMARY)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 6. KONTEKS SIGNIFIKANSI / MENGAPA INI PENTING (WHY IT MATTERS)
    {
      key: 'konteks',
      regex: /^(?:KONTEKS\s*SIGNIFIKANSI\s*(?:\/|&)?\s*MENGAPA\s*INI\s*PENTING\s*\(WHY\s*IT\s*MATTERS\)|KONTEKS\s*SIGNIFIKANSI\s*\(WHY\s*IT\s*MATTERS\)|MENGAPA\s*INI\s*PENTING\s*\(WHY\s*IT\s*MATTERS\)|KONTEKS\s*SIGNIFIKANSI\s*(?:\/|&)?\s*MENGAPA\s*INI\s*PENTING|KONTEKS\s*SIGNIFIKANSI|KONTEKS\s*(?:&|\/)\s*SIGNIFIKANSI|MENGAPA\s*INI\s*PENTING|WHY\s*IT\s*MATTERS|SIGNIFIKANSI|KONTEKS\s*BERITA|KONTEKS)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 7. ISI LENGKAP BERITA (STRUKTUR 6-BAGIAN ORIGINAL)
    {
      key: 'isi',
      regex: /^(?:ISI\s*LENGKAP\s*BERITA\s*\(STRUKTUR\s*6[\-\s]BAGIAN\s*ORIGINAL\)|ISI\s*LENGKAP\s*BERITA\s*\(STRUKTUR\s*6[\-\s]BAGIAN\)|ISI\s*LENGKAP\s*BERITA|ISI\s*LENGKAP\s*NASKAH|ISI\s*BERITA|ISI\s*LENGKAP|NASKAH\s*LENGKAP|BODY\s*BERITA|BODY\s*NASKAH|BODY|FULL\s*ARTICLE|CONTENT)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 8. SUMBER RUJUKAN TERDAFTAR & KETERLACAKAN DATA
    {
      key: 'sumber',
      regex: /^(?:SUMBER\s*RUJUKAN\s*TERDAFTAR\s*(?:&|DAN)\s*KETERLACAKAN\s*DATA|SUMBER\s*RUJUKAN\s*TERDAFTAR|KETERLACAKAN\s*DATA|SUMBER\s*RUJUKAN|SUMBER\s*(?:&|\/)\s*RUJUKAN|SUMBER\s*BERITA|SUMBER|SOURCES|REFERENCES)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    },
    // 9. SLUG
    {
      key: 'slug',
      regex: /^(?:SLUG\s*ARTIKEL|SLUG\s*URL|SLUG|URL\s*SLUG)(?:[:：\-]|\s*[\*]{2}|\s*$)(.*)$/i
    }
  ];

  for (const rule of headerRules) {
    const match = stripped.match(rule.regex);
    if (match) {
      // Clean inline content: strip leading/trailing Markdown bold, colons, or whitespace
      let inlineContent = (match[1] || '').trim();
      inlineContent = inlineContent.replace(/^[:：\-*_\s]+/, '').replace(/[*_]{1,3}$/, '').trim();
      return { key: rule.key, inlineContent };
    }
  }

  return null;
}

/**
 * Deterministic structure-based parser for complete news manuscripts.
 * 
 * Rules:
 * - NO AI / LLM guessing
 * - 100% exact text retention (never summarize, translate, or mutate)
 * - Missing sections are set to null and flagged in missingSections
 * - Handles arbitrary newlines, bullets, Markdown headings, bold markers, and varied section lengths.
 */
export function parseCompleteManuscript(rawText: string): ManuscriptParseResult {
  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      errorMessage: 'Area teks Naskah Lengkap masih kosong. Silakan paste naskah berita lengkap terlebih dahulu.',
      parsed: {
        rubrik: null,
        category: null,
        lokasi: null,
        judul: null,
        fakta: null,
        ringkasan: null,
        konteks: null,
        isi: null,
        sumber: null,
        sourcesList: [],
        slug: null
      },
      foundSections: {
        rubrik: false,
        lokasi: false,
        judul: false,
        fakta: false,
        ringkasan: false,
        konteks: false,
        isi: false,
        sumber: false,
        slug: false
      },
      missingSections: [
        'Rubrik Kategori',
        'Lokasi Peristiwa',
        'Judul Naskah',
        'Fakta Utama Terverifikasi',
        'Ringkasan Berita (Lead Summary)',
        'Konteks Signifikansi (Why It Matters)',
        'Isi Lengkap Berita',
        'Sumber Rujukan'
      ],
      totalFound: 0
    };
  }

  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const sectionBuffers: Record<SupportedSectionKey, string[]> = {
    rubrik: [],
    lokasi: [],
    judul: [],
    fakta: [],
    ringkasan: [],
    konteks: [],
    isi: [],
    sumber: [],
    slug: []
  };

  const detectedSections = new Set<SupportedSectionKey>();
  let currentSection: SupportedSectionKey | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const match = matchSectionHeader(rawLine);

    if (match) {
      currentSection = match.key;
      detectedSections.add(match.key);
      if (match.inlineContent && match.inlineContent.length > 0) {
        sectionBuffers[currentSection].push(match.inlineContent);
      }
    } else if (currentSection) {
      sectionBuffers[currentSection].push(rawLine);
    }
  }

  // If no supported header was recognized at all
  if (detectedSections.size === 0) {
    return {
      success: false,
      errorMessage: 'Format naskah tidak dikenali. Pastikan naskah menggunakan label yang didukung (mis. RUBRIK KATEGORI:, LOKASI PERISTIWA:, JUDUL NASKAH:, dsb.).',
      parsed: {
        rubrik: null,
        category: null,
        lokasi: null,
        judul: null,
        fakta: null,
        ringkasan: null,
        konteks: null,
        isi: null,
        sumber: null,
        sourcesList: [],
        slug: null
      },
      foundSections: {
        rubrik: false,
        lokasi: false,
        judul: false,
        fakta: false,
        ringkasan: false,
        konteks: false,
        isi: false,
        sumber: false,
        slug: false
      },
      missingSections: [
        'Rubrik Kategori',
        'Lokasi Peristiwa',
        'Judul Naskah',
        'Fakta Utama Terverifikasi',
        'Ringkasan Berita (Lead Summary)',
        'Konteks Signifikansi (Why It Matters)',
        'Isi Lengkap Berita',
        'Sumber Rujukan'
      ],
      totalFound: 0
    };
  }

  // Helper to extract trimmed text from buffer
  const extractText = (key: SupportedSectionKey): string | null => {
    if (!detectedSections.has(key)) return null;
    const text = sectionBuffers[key].join('\n').trim();
    return text.length > 0 ? text : null;
  };

  const rubrikRaw = extractText('rubrik');
  const lokasiRaw = extractText('lokasi');
  const judulRaw = extractText('judul');
  const faktaRaw = extractText('fakta');
  const ringkasanRaw = extractText('ringkasan');
  const konteksRaw = extractText('konteks');
  const isiRaw = extractText('isi');
  const sumberRaw = extractText('sumber');
  const slugRaw = extractText('slug');

  const foundSections: SectionFoundStatus = {
    rubrik: Boolean(rubrikRaw),
    lokasi: Boolean(lokasiRaw),
    judul: Boolean(judulRaw),
    fakta: Boolean(faktaRaw),
    ringkasan: Boolean(ringkasanRaw),
    konteks: Boolean(konteksRaw),
    isi: Boolean(isiRaw),
    sumber: Boolean(sumberRaw),
    slug: Boolean(slugRaw)
  };

  const requiredSections: SupportedSectionKey[] = [
    'rubrik',
    'lokasi',
    'judul',
    'fakta',
    'ringkasan',
    'konteks',
    'isi',
    'sumber'
  ];

  const missingSections = requiredSections
    .filter(sec => !foundSections[sec])
    .map(sec => SECTION_LABELS[sec]);

  const totalFound = requiredSections.filter(sec => foundSections[sec]).length + (foundSections.slug ? 1 : 0);

  const parsed: ParsedManuscript = {
    rubrik: rubrikRaw,
    category: rubrikRaw ? normalizeCategoryString(rubrikRaw) : null,
    lokasi: lokasiRaw,
    judul: judulRaw,
    fakta: faktaRaw,
    ringkasan: ringkasanRaw,
    konteks: konteksRaw,
    isi: isiRaw,
    sumber: sumberRaw,
    sourcesList: sumberRaw ? parseSourcesBlock(sumberRaw) : [],
    slug: slugRaw
  };

  return {
    success: true,
    parsed,
    foundSections,
    missingSections,
    totalFound
  };
}
