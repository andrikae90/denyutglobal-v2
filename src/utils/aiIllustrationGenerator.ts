/**
 * aiIllustrationGenerator.ts
 * Utilitas untuk menyusun prompt dan menghasilkan Ilustrasi AI Editorial DenyutGlobal.
 * Sesuai ATURAN KHUSUS FITUR 🖼️ AI ILUSTRASI — DENYUTGLOBAL:
 * 
 * 1. RELEVANSI BERITA:
 *    - Relevan dengan: judul, peristiwa utama, lokasi, objek utama, konteks berita.
 *    - Tidak membuat gambar generik yang hanya berhubungan longgar dengan lokasi.
 * 
 * 2. BERITA BENCANA (GUNUNG API):
 *    - Tampilkan gunung yang relevan dengan berita (e.g. Gunung Lewotobi Laki-laki, Anak Krakatau, Marapi, Merapi, Semeru, Sinabung, Ruang, Ibu, dll).
 *    - Tampilkan kondisi erupsi jika fakta menyebut erupsi.
 *    - Tampilkan kolom abu vulkanik jika fakta menyebut kolom abu.
 *    - Gunakan suasana yang sesuai dengan peristiwa tanpa mendramatisir hal yang tidak disebutkan sumber.
 * 
 * 3. DILARANG:
 *    - Gambar yang tidak berkaitan dengan berita.
 *    - Objek/lokasi salah atau peristiwa berbeda.
 *    - Kondisi ekstrem fiktif yang tidak didukung fakta.
 *    - Korban atau kerusakan jika tidak disebutkan.
 *    - Teks berita palsu di dalam gambar.
 *    - Logo lembaga resmi tiruan.
 *    - Visual foto dokumentasi nyata (harus berupa ilustrasi editorial berita profesional).
 * 
 * 4. LABEL & KREDIT:
 *    - "Ilustrasi AI — DenyutGlobal"
 *    - Metadata AI tersimpan secara transparan.
 */

export interface IllustrationPromptParams {
  title: string;
  facts?: string | string[];
  location?: string;
  category?: string;
  summary?: string;
  seed?: number;
}

interface VolcanoEntity {
  name: string;
  location: string;
  type: 'twin_cone' | 'island_cone' | 'stratovolcano' | 'caldera';
}

function detectVolcanoEntity(text: string): VolcanoEntity | null {
  const t = text.toLowerCase();
  if (t.includes('lewotobi laki-laki') || t.includes('lewotobi')) {
    return { name: 'Gunung Lewotobi Laki-laki', location: 'Flores Timur, Nusa Tenggara Timur (NTT)', type: 'twin_cone' };
  }
  if (t.includes('anak krakatau') || t.includes('krakatau')) {
    return { name: 'Gunung Anak Krakatau', location: 'Selat Sunda, Lampung/Banten', type: 'island_cone' };
  }
  if (t.includes('marapi') && !t.includes('merapi')) {
    return { name: 'Gunung Marapi', location: 'Sumatera Barat', type: 'stratovolcano' };
  }
  if (t.includes('merapi')) {
    return { name: 'Gunung Merapi', location: 'DI Yogyakarta / Jawa Tengah', type: 'stratovolcano' };
  }
  if (t.includes('semeru') || t.includes('mahameru')) {
    return { name: 'Gunung Semeru', location: 'Lumajang / Malang, Jawa Timur', type: 'stratovolcano' };
  }
  if (t.includes('sinabung')) {
    return { name: 'Gunung Sinabung', location: 'Karo, Sumatera Utara', type: 'stratovolcano' };
  }
  if (t.includes('ruang')) {
    return { name: 'Gunung Ruang', location: 'Kepulauan Sitaro, Sulawesi Utara', type: 'island_cone' };
  }
  if (t.includes('ibu')) {
    return { name: 'Gunung Ibu', location: 'Halmahera Barat, Maluku Utara', type: 'stratovolcano' };
  }
  if (t.includes('dukono')) {
    return { name: 'Gunung Dukono', location: 'Halmahera Utara, Maluku Utara', type: 'stratovolcano' };
  }
  if (t.includes('gunung') || t.includes('volcano') || t.includes('erupsi')) {
    return { name: 'Gunung Api Aktif', location: 'Indonesia', type: 'stratovolcano' };
  }
  return null;
}

export function buildEditorialIllustrationPrompt(params: IllustrationPromptParams): string {
  const { title, facts, location, category = 'Dunia', summary } = params;

  const combinedFactsText = Array.isArray(facts) 
    ? facts.join(' ') 
    : typeof facts === 'string' ? facts : '';
  
  const allContext = `${title} ${combinedFactsText} ${summary || ''} ${location || ''}`.toLowerCase();

  // 1. Check for Volcano Disaster Details
  const volcano = detectVolcanoEntity(allContext);
  const isEruption = allContext.includes('erupsi') || allContext.includes('meletus') || allContext.includes('semburan') || allContext.includes('letusan');
  const hasAshPlume = allContext.includes('kolom abu') || allContext.includes('abu vulkanik') || allContext.includes('abu');
  
  // Extract ash column height if mentioned in facts
  let ashHeightDetail = '';
  const heightMatch = allContext.match(/(\d+[.,]?\d*)\s*(meter|m|km)\b/i);
  if (heightMatch && hasAshPlume) {
    ashHeightDetail = ` reaching approximately ${heightMatch[1]} meters into the sky`;
  }

  // Extract ash direction if mentioned
  let directionDetail = '';
  if (allContext.includes('barat daya')) directionDetail = ' drifting toward southwest';
  else if (allContext.includes('barat')) directionDetail = ' drifting toward west';
  else if (allContext.includes('timur')) directionDetail = ' drifting toward east';
  else if (allContext.includes('utara')) directionDetail = ' drifting toward north';
  else if (allContext.includes('selatan')) directionDetail = ' drifting toward south';

  // Determine specific core subject theme
  let specificSubjectDescription = '';

  if (volcano) {
    if (isEruption || hasAshPlume) {
      if (volcano.name === 'Gunung Lewotobi Laki-laki') {
        specificSubjectDescription = `Editorial news illustration depicting the active eruption of Mount Lewotobi Laki-laki in East Flores, East Nusa Tenggara, Indonesia. The distinctive twin volcanic cone ridge of Lewotobi with a dense, billowing vertical volcanic ash plume column ascending from the summit crater${ashHeightDetail}${directionDetail}. Dramatic atmospheric volcanic sky over Flores coastal terrain, realistic informative journalistic composition.`;
      } else if (volcano.name === 'Gunung Anak Krakatau') {
        specificSubjectDescription = `Editorial news illustration depicting Mount Anak Krakatau in active volcanic eruption within the Sunda Strait maritime waters. Volcanic ash plume column billowing into the sky above the sea, dark volcanic island silhouette surrounded by ocean waters under atmospheric sky.`;
      } else {
        specificSubjectDescription = `Editorial news illustration depicting ${volcano.name} in ${volcano.location} during active eruption. A prominent volcanic cone summit emitting a vertical ash plume column billowing into the troposphere${ashHeightDetail}${directionDetail}, capturing the authentic geographical profile of the region.`;
      }
    } else {
      specificSubjectDescription = `Editorial news illustration of ${volcano.name} in ${volcano.location} with its authentic geological mountain silhouette under clear atmospheric sky, informative volcanic monitoring context.`;
    }
  } else if (allContext.includes('mangrove') || allContext.includes('karbon') || allContext.includes('iklim') || allContext.includes('konservasi') || allContext.includes('hutan')) {
    specificSubjectDescription = `Editorial news artwork representing coastal mangrove blue carbon conservation in ${location || 'Indonesia'}. Aerial view of lush green mangrove tidal forests, clear estuarine water channels, serene environmental ecosystem composition.`;
  } else if (allContext.includes('devisa') || allContext.includes('ekonomi') || allContext.includes('bank') || allContext.includes('moneter') || allContext.includes('saham')) {
    specificSubjectDescription = `Editorial illustration representing global financial architecture and central bank monetary policy in ${location || 'Indonesia'}. Modern glass facade of a central bank building with subtle analytical economic data chart curves in the backdrop.`;
  } else if (allContext.includes('semikonduktor') || allContext.includes('ai') || allContext.includes('chip') || allContext.includes('teknologi')) {
    specificSubjectDescription = `Editorial concept of next-generation semiconductor microchip fabrication, cleanroom silicon wafer optics and advanced computational microarchitecture.`;
  } else if (allContext.includes('antariksa') || allContext.includes('planet') || allContext.includes('teleskop') || allContext.includes('astronomi')) {
    specificSubjectDescription = `Editorial scientific illustration of an astronomical telescope observing an exoplanet and stellar orbit in deep space, atmospheric spectroscopy visualization.`;
  } else if (allContext.includes('ktt') || allContext.includes('pbb') || allContext.includes('diplomasi') || allContext.includes('resolusi') || allContext.includes('asean')) {
    specificSubjectDescription = `Editorial architectural illustration of an international diplomatic summit hall, peaceful multilateral assembly auditorium with conference flags and podium in ${location || 'the host city'}.`;
  } else if (allContext.includes('maritim') || allContext.includes('selat') || allContext.includes('kapal') || allContext.includes('pelayaran')) {
    specificSubjectDescription = `Editorial maritime navigation illustration showing commercial cargo container ships navigating an archipelagic strait channel with navigation radar motifs.`;
  } else if (allContext.includes('hukum') || allContext.includes('kpk') || allContext.includes('sidang') || allContext.includes('pengadilan') || allContext.includes('kasus')) {
    specificSubjectDescription = `Editorial conceptual illustration representing judicial proceedings, courthouse architecture and verified legal document dossiers.`;
  } else {
    specificSubjectDescription = `Editorial news illustration representing ${title} in ${location || 'Indonesia'}, capturing the core verified subject and context of the news report.`;
  }

  // Construct final prompt adhering strictly to instructions
  const promptParts = [
    `Professional journalistic editorial news illustration: ${specificSubjectDescription}.`,
    summary ? `Contextual narrative: ${summary.slice(0, 160)}.` : '',
    `Category: ${category}. Location: ${location || 'Indonesia'}.`,
    'Visual aesthetic: Sophisticated vector and digital news art, balanced lighting, cinematic 16:9 aspect ratio, suitable as lead hero header of a high-reputation news article.',
    'STRICT NEGATIVE CONSTRAINTS (MANDATORY):',
    '- DO NOT generate photorealistic candid documentation that tricks viewers into thinking it is a real archival photo.',
    '- DO NOT generate identifiable real human faces.',
    '- DO NOT fabricate unverified graphic casualties, dead bodies, blood, or exaggerated destruction not stated in facts.',
    '- NO fake text, NO fake headlines, NO gibberish typography, NO watermarks, NO fake news station banners.',
    '- NO fake government logos or misleading official emblems.',
    '- Prioritize factual accuracy of the geographical subject over theatrical sensationalism.'
  ];

  return promptParts.filter(Boolean).join(' ');
}

/**
 * Generate fallback editorial SVG illustration with exact factual theme and high aesthetic quality
 */
export function generateThematicSvgIllustration(params: IllustrationPromptParams): string {
  const { title, location = 'Internasional', category = 'dunia', facts = '' } = params;
  const rawText = `${title} ${Array.isArray(facts) ? facts.join(' ') : facts} ${location}`.toLowerCase();
  
  const locationLabel = location.length > 28 ? location.slice(0, 25) + '...' : location;
  const safeTitle = (title || 'Ilustrasi Editorial DenyutGlobal').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const volcano = detectVolcanoEntity(rawText);

  // Palette defaults
  let bgGradientStart = '#0f172a';
  let bgGradientEnd = '#1e293b';
  let accentColor = '#e11d48';
  let secondaryColor = '#38bdf8';
  let graphicSvg = '';
  let themeBadge = category.toUpperCase();

  if (volcano) {
    bgGradientStart = '#1c1917';
    bgGradientEnd = '#292524';
    accentColor = '#f97316';
    secondaryColor = '#ef4444';
    themeBadge = volcano.name.toUpperCase();

    if (volcano.name === 'Gunung Lewotobi Laki-laki') {
      graphicSvg = `
        <!-- Lewotobi Twin Ridge Silhouette -->
        <path d="M 0 540 L 220 380 L 380 210 L 460 270 L 580 180 L 640 240 L 780 380 L 960 540 Z" fill="#1c1917" opacity="0.95" />
        <path d="M 280 540 L 440 250 L 520 250 L 680 540 Z" fill="#292524" />
        
        <!-- Active Crater of Lewotobi Laki-laki -->
        <ellipse cx="580" cy="180" rx="35" ry="10" fill="${accentColor}" opacity="0.9" />
        <ellipse cx="580" cy="178" rx="20" ry="5" fill="#fef08a" opacity="0.95" />
        
        <!-- Volcanic Ash Plume Column -->
        <path d="M 570 175 Q 540 100 480 50 Q 420 10 490 -10 Q 580 -20 630 30 Q 670 90 600 160 Z" fill="url(#smokeGrad)" opacity="0.8" />
        <path d="M 585 175 Q 620 110 660 60 Q 720 10 780 40 Q 820 90 750 140 Q 660 170 595 178 Z" fill="url(#smokeGrad2)" opacity="0.65" />
        
        <!-- Ash Dispersion Drift -->
        <ellipse cx="680" cy="80" rx="140" ry="50" fill="url(#ashDriftGrad)" opacity="0.5" />
        
        <!-- Flores Landscape Contour -->
        <path d="M 0 490 Q 240 470 480 490 T 960 490 L 960 540 L 0 540 Z" fill="#0c4a6e" opacity="0.75" />
        <path d="M 0 515 Q 240 505 480 515 T 960 515 L 960 540 L 0 540 Z" fill="#075985" opacity="0.9" />
        
        <!-- Safety Radius Indicator Contour -->
        <circle cx="580" cy="380" r="130" fill="none" stroke="#f97316" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.4" />
      `;
    } else if (volcano.name === 'Gunung Anak Krakatau') {
      graphicSvg = `
        <!-- Sea Horizon & Island Volcano -->
        <rect x="0" y="340" width="960" height="200" fill="#0c4a6e" />
        <path d="M 160 380 L 480 200 L 560 210 L 800 380 Z" fill="#1c1917" />
        <ellipse cx="500" cy="205" rx="30" ry="8" fill="${accentColor}" />
        <!-- Ash plume into oceanic sky -->
        <path d="M 495 200 Q 470 120 420 70 Q 380 20 460 0 Q 540 -10 580 40 Q 610 100 520 190 Z" fill="url(#smokeGrad)" opacity="0.8" />
        <path d="M 0 420 Q 240 400 480 420 T 960 420 L 960 540 L 0 540 Z" fill="#0369a1" opacity="0.6" />
      `;
    } else {
      graphicSvg = `
        <!-- General Stratovolcano Silhouette & Plume -->
        <path d="M 80 540 L 480 180 L 540 180 L 880 540 Z" fill="#1c1917" />
        <ellipse cx="510" cy="180" rx="35" ry="10" fill="${accentColor}" opacity="0.85" />
        <ellipse cx="510" cy="176" rx="20" ry="5" fill="#fef08a" opacity="0.9" />
        <path d="M 505 175 Q 460 100 410 50 Q 360 10 440 0 Q 530 -10 570 40 Q 610 100 520 170 Z" fill="url(#smokeGrad)" opacity="0.8" />
      `;
    }
  } else if (rawText.includes('mangrove') || rawText.includes('karbon') || rawText.includes('iklim') || rawText.includes('konservasi') || rawText.includes('hutan')) {
    bgGradientStart = '#022c22';
    bgGradientEnd = '#064e3b';
    accentColor = '#10b981';
    secondaryColor = '#06b6d4';
    themeBadge = 'KONSERVASI LINGKUNGAN';
    graphicSvg = `
      <!-- Mangrove Canopy & Blue Carbon Estuary -->
      <circle cx="240" cy="300" r="140" fill="#047857" opacity="0.7" />
      <circle cx="380" cy="260" r="170" fill="#065f46" opacity="0.85" />
      <circle cx="560" cy="290" r="150" fill="#047857" opacity="0.7" />
      <circle cx="720" cy="310" r="130" fill="#064e3b" opacity="0.8" />
      <!-- Water reflections -->
      <rect x="0" y="440" width="960" height="100" fill="#0e7490" opacity="0.6" />
      <line x1="120" y1="470" x2="380" y2="470" stroke="#6ee7b7" stroke-width="2" opacity="0.5" />
      <line x1="420" y1="490" x2="780" y2="490" stroke="#6ee7b7" stroke-width="2" opacity="0.4" />
      <line x1="200" y1="510" x2="600" y2="510" stroke="#6ee7b7" stroke-width="2" opacity="0.6" />
    `;
  } else if (rawText.includes('semikonduktor') || rawText.includes('ai') || rawText.includes('chip') || rawText.includes('teknologi')) {
    bgGradientStart = '#0f172a';
    bgGradientEnd = '#1e1b4b';
    accentColor = '#818cf8';
    secondaryColor = '#38bdf8';
    themeBadge = 'TEKNOLOGI & INOVASI';
    graphicSvg = `
      <!-- Silicon Wafer & Microchip Architecture -->
      <rect x="360" y="150" width="240" height="240" rx="24" fill="#1e1b4b" stroke="${accentColor}" stroke-width="4" />
      <rect x="400" y="190" width="160" height="160" rx="16" fill="#312e81" stroke="${secondaryColor}" stroke-width="2" />
      <circle cx="480" cy="270" r="36" fill="${accentColor}" opacity="0.3" />
      <circle cx="480" cy="270" r="18" fill="${secondaryColor}" />
      <path d="M 200 270 L 360 270 M 600 270 L 760 270" stroke="${secondaryColor}" stroke-width="3" stroke-dasharray="6,6" />
      <path d="M 480 80 L 480 150 M 480 390 L 480 460" stroke="${secondaryColor}" stroke-width="3" stroke-dasharray="6,6" />
      <circle cx="200" cy="270" r="6" fill="${accentColor}" />
      <circle cx="760" cy="270" r="6" fill="${accentColor}" />
      <circle cx="480" cy="80" r="6" fill="${accentColor}" />
      <circle cx="480" cy="460" r="6" fill="${accentColor}" />
    `;
  } else if (rawText.includes('ekonomi') || rawText.includes('bank') || rawText.includes('devisa') || rawText.includes('moneter')) {
    bgGradientStart = '#111827';
    bgGradientEnd = '#1f2937';
    accentColor = '#eab308';
    secondaryColor = '#3b82f6';
    themeBadge = 'EKONOMI & MONETER';
    graphicSvg = `
      <!-- Financial Architecture & Market Indicators -->
      <path d="M 120 420 L 260 360 L 400 390 L 560 270 L 700 290 L 860 180" fill="none" stroke="${accentColor}" stroke-width="5" />
      <path d="M 120 420 L 260 360 L 400 390 L 560 270 L 700 290 L 860 180 L 860 540 L 120 540 Z" fill="url(#econGrad)" opacity="0.25" />
      <rect x="220" y="240" width="30" height="240" fill="#374151" rx="4" />
      <rect x="300" y="220" width="30" height="260" fill="#4b5563" rx="4" />
      <rect x="380" y="200" width="30" height="280" fill="#374151" rx="4" />
      <rect x="460" y="180" width="30" height="300" fill="#4b5563" rx="4" />
      <rect x="540" y="160" width="30" height="320" fill="#374151" rx="4" />
      <rect x="620" y="140" width="30" height="340" fill="#4b5563" rx="4" />
    `;
  } else {
    // Standard Global Editorial
    bgGradientStart = '#0f172a';
    bgGradientEnd = '#1e293b';
    accentColor = '#f43f5e';
    secondaryColor = '#38bdf8';
    themeBadge = 'GLOBAL NEWS';
    graphicSvg = `
      <circle cx="480" cy="270" r="160" fill="none" stroke="${secondaryColor}" stroke-width="2" opacity="0.4" />
      <ellipse cx="480" cy="270" rx="160" ry="60" fill="none" stroke="${secondaryColor}" stroke-width="2" opacity="0.4" />
      <ellipse cx="480" cy="270" rx="80" ry="160" fill="none" stroke="${secondaryColor}" stroke-width="2" opacity="0.4" />
      <line x1="320" y1="270" x2="640" y2="270" stroke="${accentColor}" stroke-width="2" opacity="0.7" />
      <line x1="480" y1="110" x2="480" y2="430" stroke="${accentColor}" stroke-width="2" opacity="0.7" />
      <circle cx="480" cy="270" r="8" fill="${accentColor}" />
    `;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgGradientStart}" />
        <stop offset="100%" stop-color="${bgGradientEnd}" />
      </linearGradient>
      <linearGradient id="smokeGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#ea580c" />
        <stop offset="50%" stop-color="#78716c" />
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.1" />
      </linearGradient>
      <linearGradient id="smokeGrad2" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#dc2626" />
        <stop offset="60%" stop-color="#57534e" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="ashDriftGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#57534e" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="econGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="960" height="540" fill="url(#bgGrad)" />

    <!-- Subtle Editorial Grid Motif -->
    <g stroke="#ffffff" stroke-width="1" opacity="0.04">
      <line x1="0" y1="90" x2="960" y2="90" />
      <line x1="0" y1="180" x2="960" y2="180" />
      <line x1="0" y1="270" x2="960" y2="270" />
      <line x1="0" y1="360" x2="960" y2="360" />
      <line x1="0" y1="450" x2="960" y2="450" />
      <line x1="160" y1="0" x2="160" y2="540" />
      <line x1="320" y1="0" x2="320" y2="540" />
      <line x1="480" y1="0" x2="480" y2="540" />
      <line x1="640" y1="0" x2="640" y2="540" />
      <line x1="800" y1="0" x2="800" y2="540" />
    </g>

    <!-- Thematic Visual Elements -->
    ${graphicSvg}

    <!-- Top Left Brand Badge -->
    <rect x="36" y="32" width="220" height="30" rx="15" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1.5" />
    <circle cx="52" cy="47" r="5" fill="${accentColor}" />
    <text x="68" y="52" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">DENYUTGLOBAL ILUSTRASI</text>

    <!-- Bottom Left Official Credit & Context Chip -->
    <g transform="translate(36, 466)">
      <rect x="0" y="0" width="360" height="38" rx="8" fill="#0f172a" fill-opacity="0.92" stroke="#334155" stroke-width="1.2" />
      <circle cx="18" cy="19" r="4" fill="#10b981" />
      <text x="32" y="24" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700">
        ILUSTRASI AI — DENYUTGLOBAL
      </text>
      <text x="215" y="24" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500">
        • ${locationLabel.toUpperCase()}
      </text>
    </g>
  </svg>`;

  const base64Svg = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}
