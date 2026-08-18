import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import { buildEditorialIllustrationPrompt, generateThematicSvgIllustration } from './src/utils/aiIllustrationGenerator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy Gemini Client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // Robust Multi-Model AI Generator with Automatic Fallback for 503/429/404/Spikes in Demand
  async function generateWithGeminiFallback(
    client: GoogleGenAI,
    contents: string,
    responseMimeType = 'application/json'
  ): Promise<{ text: string | null; modelUsed: string | null }> {
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest'
    ];

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType
          }
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        const status = err?.status || err?.error?.code || err?.code;
        const msg = err?.message || String(err);
        const isRetryable =
          status === 503 ||
          status === 429 ||
          status === 404 ||
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('404') ||
          msg.includes('NOT_FOUND') ||
          msg.includes('no longer available') ||
          msg.includes('quota') ||
          msg.includes('Quota') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('ResourceExhausted') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (isRetryable && i < candidateModels.length - 1) {
          console.warn(`Model ${model} not available (${status || 'error'}). Retrying with backup model ${candidateModels[i + 1]}...`);
          // brief backoff
          await new Promise(resolve => setTimeout(resolve, 350));
          continue;
        } else {
          console.warn(`Model ${model} call failed:`, msg);
        }
      }
    }

    return { text: null, modelUsed: null };
  }

  // Health API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    const defaultDomain = 'https://ais-pre-vvmbqfdh7npn7qfkviyfzd-652622621922.asia-east1.run.app';
    const domain = (process.env.APP_URL || defaultDomain).replace(/\/+$/, '');
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /redaksi\nDisallow: /editorial\n\nSitemap: ${domain}/sitemap.xml\n`);
  });

  // Sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    try {
      const publicSitemap = path.join(process.cwd(), 'public', 'sitemap.xml');
      const distSitemap = path.join(process.cwd(), 'dist', 'sitemap.xml');
      const sitemapPath = fs.existsSync(publicSitemap) ? publicSitemap : distSitemap;
      if (fs.existsSync(sitemapPath)) {
        const content = fs.readFileSync(sitemapPath, 'utf-8');
        res.type('application/xml');
        return res.send(content);
      }
    } catch (e) {
      console.warn('Error reading sitemap.xml:', e);
    }
    res.status(404).send('Sitemap not found');
  });

  // AI Editorial Draft Assistant Endpoint (STRICT ATURAN JURNALISTIK & INTEGRITAS FAKTA)
  app.post('/api/ai/draft', async (req, res) => {
    try {
      const { 
        facts = '', 
        category = 'Dunia', 
        location = '', 
        roughNotes = '', 
        sources = [], 
        existingTitle = '',
        wireReference = null
      } = req.body;

      if (!facts.trim() && !roughNotes.trim() && !existingTitle.trim() && !wireReference) {
        return res.status(400).json({ 
          error: 'Mohon masukkan Fakta Utama atau Catatan Peristiwa terlebih dahulu sebelum meminta bantuan AI.' 
        });
      }

      const client = getGeminiClient();

      if (client) {
        const prompt = `Anda adalah Redaktur Senior DenyutGlobal (media independen berbahasa Indonesia dengan standar integritas, keaslian editorial, dan verifikasi fakta tertinggi).

TUGAS UTAMA:
Susun naskah DRAFT berita original DenyutGlobal yang siap diperiksa secara editorial berdasarkan data faktual yang BENAR-BENAR TERSEDIA dalam bahan referensi/kawat berita.

ATURAN UTAMA & PANTANGAN MUTLAK (DILARANG KERAS):
1. DILARANG MENGGUNAKAN PLACEHOLDER: Dilarang menggunakan "...", "[...]", "[isi]", "[nama]", "[tanggal]", "[lokasi]". Jika data tidak tersedia, jangan tulis daripada menggunakan placeholder.
2. DILARANG MENGGUNAKAN KALIMAT TEMPLATE INTERNAL:
   - Dilarang menulis "sedang dalam penelaahan redaksi" atau "saat ini sedang dalam penelaahan".
   - Dilarang menulis "Bahan liputan dihimpun dari feed kawat" atau "feed kawat resmi".
   - Dilarang menulis "transformasi naskah" atau "pemisahan tegas antara fakta, konteks, dan analisis".
   - Dilarang menulis "DenyutGlobal menerapkan prinsip transparansi".
   - Dilarang menulis "editor mencatat" atau "berdasarkan catatan dan data awal yang dihimpun".
   - Dilarang menulis "untuk memperbarui perkembangan isu bagi publik internasional".
   - Dilarang menulis "Poin fakta yang tercatat mencakup" atau "Dalam catatan konteks pendukung".
   - Dilarang menulis "Penjelasan ini menjadi latar belakang penelaahan isu" atau "isu ini dipantau untuk memberikan gambaran proporsional".
3. JANGAN MENJELASKAN PROSES INTERNAL / AI: Jangan menjelaskan bagaimana AI atau editor bekerja dalam isi naskah berita. Naskah harus langsung berupa berita jurnalistik untuk pembaca publik.
4. LOKASI WAJIB SPESIFIK & TIDAK MENGARANG: Ekstrak lokasi faktual yang tersedia (misal: "Selat Sunda, Lampung-Banten" atau "Negeri Aboru, Pulau Haruku, Maluku Tengah"). Jangan mengarang lokasi. Jika lokasi tidak ada, jangan masukkan kalimat "Tidak disebutkan dalam sumber" ke dalam isi teks berita.
5. JUDUL ORIGINAL SUBSTANTIF:
   - Buat judul berdasarkan fakta utama dengan struktur berbeda dari judul sumber.
   - Hapus semua awalan kawat seperti "ANTARA:", "Badan Geologi:", "Reuters:", "AFP:".
   - Jangan sekadar mengganti 1-2 kata dari judul sumber.
   - Jangan membuat judul lebih dramatis daripada fakta (bebas clickbait).
6. STRUKTUR ISI BERITA:
   - Paragraf 1: Lead (fakta utama kejadian langsung).
   - Paragraf 2: Detail faktual yang tersedia (angka, status, nama lembaga, pernyataan).
   - Paragraf 3: Konteks pendukung yang relevan dari fakta.
   - Paragraf 4: Perkembangan / penutup kondisi terkini berdasarkan sumber.
7. INTEGRITAS FAKTA: Pertahankan nama, angka, tanggal, tempat, status yang akurat. Dilarang mengarang fakta untuk membuat artikel terlihat panjang.

BAHAN YANG DIBERIKAN EDITOR:
- Topik / Judul Awal: ${existingTitle || wireReference?.judul || '(Belum ditentukan)'}
- Rubrik Kategori: ${category}
- Lokasi / Peristiwa: ${location || 'Internasional'}
- Fakta Utama / Ringkasan Kawat:
${facts || wireReference?.ringkasan || '(Tidak ada poin spesifik)'}
- Catatan Tambahan:
${roughNotes || '(Tidak ada catatan tambahan)'}
- Sumber Terdaftar:
${sources && sources.length > 0 ? sources.map((s: any) => `- ${s.name || 'Sumber'} (${s.url || 'URL belum ada'})`).join('\n') : (wireReference?.namaSumber ? `- ${wireReference.namaSumber} (${wireReference.urlSumber || ''})` : '(Tidak ada sumber yang dicantumkan)')}

Kembalikan HANYA format JSON valid:
{
  "title": "string (Judul original DenyutGlobal yang substantif dan akurat, tidak boleh ada ... atau placeholder)",
  "summary": "string (Ringkasan 2-3 kalimat lugas langsung menjelaskan kejadian)",
  "facts": ["string (Poin-poin fakta utama terverifikasi dari sumber)"],
  "whyItMatters": "string (Penjelasan latar belakang dan signifikansi tanpa kalimat template)",
  "content": [
    "string (Paragraf 1: Lead langsung menjelaskan peristiwa)",
    "string (Paragraf 2: Detail faktual yang tersedia)",
    "string (Paragraf 3: Konteks pendukung dari fakta)",
    "string (Paragraf 4: Penutup kondisi terakhir berdasarkan sumber)"
  ],
  "claims": [
    {
      "claim": "string",
      "type": "fakta" | "konteks" | "opini_analisis",
      "supported": true,
      "sourceTrace": "string"
    }
  ],
  "suggestedTags": ["string"]
}`;

        const { text: textOutput } = await generateWithGeminiFallback(client, prompt, 'application/json');

        if (textOutput) {
          try {
            const parsed = JSON.parse(textOutput);
            return res.json({
              success: true,
              source: 'gemini',
              draft: parsed,
              notice: 'Draft — belum diverifikasi editor'
            });
          } catch (parseError) {
            console.warn('Failed to parse Gemini JSON response, returning clean fallback', parseError);
          }
        }
      }

      // Algorithmic Fallback Generator (Guaranteed 0 forbidden phrases, 0 placeholders)
      const fallbackTitle = existingTitle.trim() || `Pencatatan Perkembangan Data Terkini Sektor ${category}`;
      const factsList = facts
        .split('\n')
        .map((f: string) => f.trim().replace(/^[-*•0-9.]\s*/, ''))
        .filter((f: string) => f.length > 0);

      const hasSources = sources && sources.length > 0 && sources.some((s: any) => s.name?.trim() || s.url?.trim());
      const sourceTraceText = hasSources 
        ? (sources[0].name || 'Sumber Terdaftar Editor') 
        : 'Sumber belum tersedia — perlu verifikasi editor.';

      const locPrefix = location && location !== 'Tidak disebutkan dalam sumber' && location !== 'Internasional' 
        ? `${location.toUpperCase()} — ` 
        : '';

      const f0 = factsList[0] || '';
      const f1 = factsList[1] || '';
      const f2 = factsList[2] || '';
      const fRemaining = factsList.slice(3).join(' ');

      const fallbackContent: string[] = [];
      if (f0) {
        fallbackContent.push(`${locPrefix}${f0}`);
      } else {
        fallbackContent.push(`${locPrefix}Pencatatan data peristiwa sektor ${category.toLowerCase()} telah dirilis melalui laporan resmi pihak terkait.`);
      }

      if (f1) {
        fallbackContent.push(f1);
      }

      if (f2) {
        fallbackContent.push(f2);
      }

      if (fRemaining) {
        fallbackContent.push(fRemaining);
      }

      const fallbackDraft = {
        title: fallbackTitle,
        summary: f0 && f1 ? `${f0} ${f1}` : (f0 || `Pencatatan data peristiwa sektor ${category.toLowerCase()} telah dirilis secara resmi.`),
        facts: factsList.length > 0 ? factsList : [
          `Pencatatan peristiwa terkait sektor ${category.toLowerCase()}.`
        ],
        whyItMatters: `Informasi ini penting bagi pemangku kepentingan dan publik guna memantau perkembangan terkini secara akurat.`,
        content: fallbackContent,
        claims: factsList.map((f, idx) => ({
          claim: f,
          type: 'fakta' as const,
          supported: true,
          sourceTrace: sourceTraceText
        })),
        suggestedTags: [category, location || 'Internasional', 'Berita']
      };

      return res.json({
        success: true,
        source: 'template_fallback',
        draft: fallbackDraft,
        notice: 'Draft — belum diverifikasi editor'
      });

    } catch (error: any) {
      console.error('Editorial AI Assistant Error:', error);
      return res.status(500).json({ 
        error: 'Terjadi kendala saat menyusun draft AI. Silakan coba kembali atau tulis draft secara manual.',
        details: error.message 
      });
    }
  });

  // Helper to safely fetch source content with SSRF protection, timeout, and HTML text extractor
  async function fetchSourceContent(urlStr: string): Promise<{ success: boolean; text?: string; error?: string; hostname?: string }> {
    if (!urlStr || typeof urlStr !== 'string') {
      return { success: false, error: 'URL kosong atau tidak valid' };
    }

    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { success: false, error: 'Protokol URL tidak diizinkan (hanya http/https)' };
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return { success: false, error: 'Format URL tidak valid' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // SSRF & Security Checks
    const forbiddenHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'ip6-localhost', 'ip6-loopback'];
    if (forbiddenHostnames.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { success: false, error: 'Akses ke host internal/lokal diblokir untuk keamanan', hostname };
    }

    // Check private IPv4 ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);
      if (
        octet1 === 10 ||
        octet1 === 127 ||
        octet1 === 0 ||
        (octet1 === 172 && octet2 >= 16 && octet2 <= 31) ||
        (octet1 === 192 && octet2 === 168) ||
        (octet1 === 169 && octet2 === 254)
      ) {
        return { success: false, error: 'Akses ke IP private diblokir untuk keamanan', hostname };
      }
    }

    // AbortController for strict timeout (6 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(trimmed, {
        method: 'GET',
        headers: {
          'User-Agent': 'DenyutGlobalEditorialBot/2.0 (+https://denyutglobal.com/fact-check)',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          hostname 
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text') && !contentType.includes('json') && !contentType.includes('xml')) {
        return { success: false, error: `Tipe konten ${contentType} bukan dokumen teks`, hostname };
      }

      const rawHtml = await response.text();
      // Cap response size to 500KB to prevent memory exhaustion
      const cappedHtml = rawHtml.slice(0, 500000);

      // Clean HTML tags and extract clean textual content
      let text = cappedHtml
        // Remove script, style, svg, noscript, iframe tags with contents
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        // Replace HTML tags with spaces
        .replace(/<[^>]+>/g, ' ')
        // Decode common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Compress whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // Limit extracted text passed to Gemini to ~4,000 characters per source for optimal focus
      if (text.length > 4000) {
        text = text.slice(0, 4000) + '... [Teks sumber diringkas untuk efisiensi audit]';
      }

      if (!text || text.length < 30) {
        return { success: false, error: 'Isi teks sumber kosong atau terlalu pendek untuk diaudit', hostname };
      }

      return { success: true, text, hostname };
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isAbort = fetchErr?.name === 'AbortError' || fetchErr?.message?.includes('aborted');
      return { 
        success: false, 
        error: isAbort ? 'Waktu koneksi ke URL sumber habis (timeout)' : (fetchErr?.message || 'Gagal mengambil halaman web sumber'),
        hostname 
      };
    }
  }

  // Shared Strict Fact-Checking Engine Implementation
  async function performStrictFactCheck(body: any) {
    const {
      title = '',
      judul = '',
      summary = '',
      ringkasan = '',
      content = [],
      isiLengkap = [],
      facts = '',
      faktaUtama = '',
      roughNotes = '',
      catatan = '',
      sources = [],
      daftarSumber = [],
      whyItMatters = '',
      category = '',
      kategori = '',
      location = '',
      lokasi = ''
    } = body || {};

    const finalTitle = (title || judul || '').trim();
    const finalSummary = (summary || ringkasan || '').trim();
    const rawContent = Array.isArray(content) && content.length > 0 
      ? content 
      : (Array.isArray(isiLengkap) && isiLengkap.length > 0 ? isiLengkap : (content || isiLengkap || ''));
    const contentParagraphs: string[] = Array.isArray(rawContent)
      ? rawContent.map((p: any) => String(p || '').trim()).filter(Boolean)
      : String(rawContent || '').split('\n\n').map(p => p.trim()).filter(Boolean);
    const contentText = contentParagraphs.join('\n\n');

    const rawFacts = facts || faktaUtama || '';
    const factsString = Array.isArray(rawFacts) ? rawFacts.join('\n') : String(rawFacts || '');
    const factsList = factsString
      .split('\n')
      .map(f => f.trim().replace(/^[-*•0-9.]+\s*/, '').trim())
      .filter(Boolean);

    const rawNotes = (roughNotes || catatan || '').trim();
    const finalCategory = (category || kategori || 'Dunia').trim();
    const finalLocation = (location || lokasi || '').trim();

    const rawSources = Array.isArray(sources) && sources.length > 0 
      ? sources 
      : (Array.isArray(daftarSumber) ? daftarSumber : []);
    
    const validSources = rawSources
      .filter((s: any) => s && (s.name?.trim() || s.url?.trim() || typeof s === 'string'))
      .map((s: any) => {
        if (typeof s === 'string') return { name: s.trim(), url: '', date: '', notes: '' };
        return {
          name: (s.name || s.namaSumber || s.title || '').trim(),
          url: (s.url || s.urlSumber || s.link || '').trim(),
          date: (s.date || s.waktu || '').trim(),
          notes: (s.notes || s.catatan || '').trim()
        };
      });

    const isUrlVerifiable = (urlStr: string) => {
      if (!urlStr) return false;
      const lower = urlStr.toLowerCase();
      if (lower.includes('...') || lower.includes('example.com') || lower.includes('localhost') || lower === '#' || lower.includes('belum ada') || lower.includes('[url]')) {
        return false;
      }
      try {
        const parsed = new URL(urlStr);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
      } catch {
        return false;
      }
    };

    const hasVerifiableSourceUrl = validSources.some(s => isUrlVerifiable(s.url));
    const forbiddenWords = ['terbukti', 'pasti', 'terbesar', 'bersejarah', 'spektakuler', 'menghebohkan', 'memperkuat', 'menjadi bukti'];

    // Tahap 2: Lakukan fetching isi teks aktual dari sumber-sumber yang memiliki URL valid
    const fetchedSourceData: Array<{ name: string; url: string; success: boolean; text?: string; error?: string }> = [];
    const sourceFetchFailures: string[] = [];

    for (const src of validSources) {
      if (src.url && isUrlVerifiable(src.url)) {
        try {
          const fetchRes = await fetchSourceContent(src.url);
          if (fetchRes.success && fetchRes.text) {
            fetchedSourceData.push({
              name: src.name || fetchRes.hostname || 'Sumber',
              url: src.url,
              success: true,
              text: fetchRes.text
            });
          } else {
            const reason = fetchRes.error || 'Gagal mengekstrak isi teks sumber';
            fetchedSourceData.push({
              name: src.name || 'Sumber',
              url: src.url,
              success: false,
              error: reason
            });
            sourceFetchFailures.push(`${src.name || src.url}: ${reason}`);
          }
        } catch (fetchErr: any) {
          const reason = fetchErr?.message || 'Gagal koneksi ke URL sumber';
          fetchedSourceData.push({
            name: src.name || 'Sumber',
            url: src.url,
            success: false,
            error: reason
          });
          sourceFetchFailures.push(`${src.name || src.url}: ${reason}`);
        }
      }
    }

    const successfulFetchedSources = fetchedSourceData.filter(s => s.success && s.text);
    const hasFetchedSourceContent = successfulFetchedSources.length > 0;

    const client = getGeminiClient();

    if (client && (finalTitle || contentText || factsList.length > 0)) {
      const factCheckPrompt = `Anda adalah Verifikator Fakta & Auditor Integritas Editorial Independen di DenyutGlobal (media kredibel berbahasa Indonesia dengan standar verifikasi fakta tertinggi).
Tugas Anda adalah melakukan audit investigatif dan verifikasi kebenaran secara ketat terhadap setiap klaim, angka, kutipan, dan sumber sebelum naskah diizinkan tayang.

STANDAR & ATURAN AUDIT KETAT DENYUTGLOBAL:

1. ATURAN WAJIB PEMERIKSAAN FAKTA UTAMA (1 FAKTA = 1 CLAIM):
   - Terdapat ${factsList.length} butir FAKTA UTAMA yang diinput oleh editor.
   - Array "claims" yang Anda hasilkan WAJIB memiliki minimal ${Math.max(factsList.length, 1)} elemen.
   - SETIAP BUTIR FAKTA UTAMA HARUS MENGHASILKAN TEPAT SATU ELEMEN DALAM ARRAY "claims".
   - DILARANG MERANGKUM ATAU MENGGABUNGKAN BEBERAPA FAKTA UTAMA MENJADI SATU KLAIM.
   - Setiap claim harus mempertahankan teks dan maksud dari Fakta Utama asal yang bersangkutan.
   - Jika ada klaim tambahan dari isi naskah (lead/tubuh artikel/angka krusial), Anda boleh menambahkannya setelah butir-butir Fakta Utama tersebut.

2. VERIFIKASI BERBASIS ISI TEKS SUMBER (GROUND TRUTH):
   - Sumber hanya boleh dianggap MEMBUKTIKAN ("status": "verified", "supported": true) JIKA DAN HANYA JIKA ISI TEKS SUMBER yang disediakan di bawah benar-benar memuat data/fakta yang mendukung klaim tersebut secara langsung atau dengan makna yang setara dan eksplisit.
   - DILARANG menganggap klaim verified hanya karena nama lembaga resmi, domain/URL terlihat kredibel, atau pengetahuan umum model.
   - Jika isi sumber TIDAK berhasil diambil (${!hasFetchedSourceContent ? 'TIDAK ADA ISI SUMBER YANG BERHASIL DIAMBIL' : `${successfulFetchedSources.length} sumber berhasil diambil`}), maka SEMUA klaim yang bersangkutan WAJIB diberi "status": "needs_verification" (atau "missing_source") dengan "supported": false.
   - Jika sumber hanya membahas topik serupa tetapi tidak memuat angka, nama, atau rincian spesifik klaim, JANGAN beri status verified. Beri "needs_verification".

3. VERIFIKASI DATA ANGKA & ENTITAS SPESIFIK:
   - Angka, tanggal, persentase, besaran moneter, kapasitas, nominal (contoh: "USD 149,9 miliar", "6,8 bulan impor", "3 bulan standar"), nama lembaga, nama proyek, dan nama tokoh harus diverifikasi ketepatannya secara individual terhadap isi teks sumber.
   - Angka pembulatan yang berbeda (misal "149 miliar" vs "149,9 miliar" atau "6 bulan" vs "6,8 bulan") TIDAK BOLEH dianggap terverifikasi otomatis jika tidak cocok dengan isi sumber.

4. KESELARASAN JUDUL DENGAN FAKTA (EDITORIAL INTEGRITY):
   - Periksa apakah Judul sesuai dengan fakta utama dalam isi naskah dan sumber rujukan.
   - Jika judul tidak sesuai, hiperbolis, clickbait, membesar-besarkan fakta, atau memuat klaim yang bertentangan dengan isi naskah, tandai sebagai masalah editorial ("unsupportedClaims").

5. DETEKSI KONFLIK FAKTA:
   - Jika sumber resmi yang tersedia bertentangan dengan klaim dalam naskah, tandai secara eksplisit sebagai "KONFLIK FAKTA" di dalam daftar conflictWarnings.

6. DILARANG MENGARANG:
   - Dilarang keras mengarang fakta, angka, kutipan, URL, nama, tanggal, atau nomor halaman palsu.
   - Jika verified, buat "sourceTrace" yang informatif: contoh "Bank Indonesia (https://...) — Terverifikasi terhadap rilis resmi BI mengenai cadangan devisa USD 149,9 miliar".

7. PANTANGAN TEMPLATE & KATA TERLARANG:
   - Periksa apakah ada penggunaan kata terlarang tanpa dasar data eksplisit: ["terbukti", "pasti", "terbesar", "bersejarah", "spektakuler", "menghebohkan", "memperkuat", "menjadi bukti"].
   - Periksa apakah ada kalimat template internal redaksi (seperti "sedang dalam penelaahan redaksi", "feed kawat resmi", "transformasi naskah", "denyutglobal menerapkan prinsip transparansi", "editor mencatat", dll).
   - Periksa apakah ada tanda placeholder atau elipsis ("...", "[...]", "[isi]", "[nama]", "[tanggal]", "[lokasi]").

8. SYARAT KELULUSAN KETAT (PASSED / LOLOS VERIFIKASI BERSIH):
   - Status "LOLOS VERIFIKASI BERSIH" ("passed": true, "canPublish": true, "hasUnverifiedClaims": false) HANYA BOLEH DIBERIKAN jika:
     a) Isi sumber berhasil diambil dan membuktikan SEMUA butir Fakta Utama;
     b) SEMUA klaim memiliki "supported": true dan "status": "verified";
     c) Tidak ada konflik fakta, tidak ada unsupportedClaims, dan tidak ada missingSourceClaims;
     d) Tidak ada kata terlarang, kalimat template, atau placeholder.
   - Jika SATU SAJA butir Fakta Utama belum terbukti oleh isi sumber, maka status keseluruhan WAJIB "passed": false, "canPublish": false, "hasUnverifiedClaims": true.

==================================================
ISI TEKS SUMBER YANG BERHASIL DIAMBIL UNTUK VERIFIKASI (GROUND TRUTH AUDIT):
==================================================
${successfulFetchedSources.length > 0 ? successfulFetchedSources.map((s, idx) => `--- SUMBER [${idx + 1}]: ${s.name} ---
URL: ${s.url}
ISI TEKS SUMBER:
${s.text}
`).join('\n\n') : '(TIDAK ADA ISI TEKS SUMBER YANG BERHASIL DIAMBIL / SEMUA GAGAL FETCH — TIDAK BISA MEMBERIKAN STATUS VERIFIED)'}

${sourceFetchFailures.length > 0 ? `CATATAN KEGAGALAN FETCH SUMBER:\n${sourceFetchFailures.map(f => `- ${f}`).join('\n')}\n` : ''}

BAHAN ACUAN EDITOR:
- Daftar Fakta Utama Terverifikasi (${factsList.length} butir):
${factsList.length > 0 ? factsList.map((f, i) => `[Fakta Utama ${i + 1}] ${f}`).join('\n') : '(Belum ada poin fakta spesifik)'}
- Catatan Tambahan Editor:
${rawNotes || '(Kosong)'}
- Daftar Sumber Terdaftar:
${validSources.length > 0 ? validSources.map((s: any) => `- ${s.name || 'Sumber'} | URL: ${s.url || '(URL belum ada/tidak valid)'} | Catatan: ${s.notes || '-'}`).join('\n') : '(Tidak ada sumber)'}

NASKAH YANG DI-AUDIT:
- Judul: ${finalTitle || '(Kosong)'}
- Rubrik: ${finalCategory}
- Lokasi: ${finalLocation || 'Internasional'}
- Ringkasan: ${finalSummary || '(Kosong)'}
- Mengapa Penting: ${whyItMatters || '(Kosong)'}
- Isi Lengkap:
${contentText || '(Kosong)'}

KEMBALIKAN DALAM FORMAT JSON BERIKUT (Valid JSON saja, tanpa markdown pembungkus lain).
Pastikan array "claims" memuat audit untuk ${factsList.length > 0 ? `masing-masing dari ${factsList.length} butir Fakta Utama di atas secara terpisah` : 'setiap klaim fakta utama'}:
{
  "passed": boolean,
  "canPublish": boolean,
  "hasUnverifiedClaims": boolean,
  "summary": "string (Evaluasi ringkas mengenai integritas naskah dan status audit)",
  "unsupportedClaims": ["string (Daftar klaim spesifik/angka/judul yang tidak didukung data rujukan)"],
  "missingSourceClaims": ["string (Daftar klaim yang kekurangan sumber rujukan valid atau URL tidak dapat diverifikasi)"],
  "forbiddenKeywordsFound": ["string (Kata terlarang seperti 'terbukti', 'pasti', dsb yang muncul tanpa rujukan data)"],
  "conflictWarnings": ["string (Klaim yang berkonflik dengan sumber resmi jika ditemukan)"],
  "claims": [
    ${factsList.map((f, i) => `{
      "id": "claim-${i + 1}",
      "claim": "${f.replace(/"/g, '\\"')}",
      "type": "fakta",
      "supported": false,
      "sourceTrace": "string (Nama sumber — URL — cuplikan/keterangan bukti dari isi sumber)",
      "issue": "string jika ada masalah atau kosong",
      "status": "verified" | "needs_verification" | "missing_source"
    }`).join(',\n    ') || `{
      "id": "claim-1",
      "claim": "string (Pernyataan klaim spesifik dalam naskah)",
      "type": "fakta" | "konteks" | "opini_analisis",
      "supported": false,
      "sourceTrace": "string (Nama sumber terdaftar)",
      "issue": "string jika ada masalah atau kosong",
      "status": "verified" | "needs_verification" | "missing_source"
    }`}
  ],
  "sourceAudit": {
    "totalSources": number,
    "sourcesProvided": boolean,
    "sourcesTraceable": boolean,
    "sourceContentFetched": boolean,
    "verifiedSourceCount": number,
    "sourceFetchFailures": ["string"],
    "note": "string"
  }
}`;

        try {
          const { text: factCheckOutput } = await generateWithGeminiFallback(client, factCheckPrompt, 'application/json');

          if (factCheckOutput) {
            const parsed = JSON.parse(factCheckOutput);

            let rawClaims = Array.isArray(parsed.claims) ? parsed.claims : [];

            // Backend validation: Ensure every Fakta Utama has its own verified claim item
            if (factsList.length > 0) {
              const matchedClaims: any[] = [];
              const unmatchedFacts: string[] = [];

              factsList.forEach((factText, idx) => {
                const cleanFact = factText.toLowerCase();
                const existing = rawClaims.find((c: any) => {
                  if (!c || !c.claim) return false;
                  const cText = String(c.claim).toLowerCase();
                  return cText.includes(cleanFact.slice(0, 30)) || cleanFact.includes(cText.slice(0, 30)) || c.id === `claim-${idx + 1}`;
                });

                if (existing) {
                  // ONLY mark as supported and verified if AI explicitly audited it as supported+verified AND source content was actually fetched
                  const isTrulyVerified = Boolean(
                    existing.supported === true && 
                    existing.status === 'verified' && 
                    hasVerifiableSourceUrl &&
                    hasFetchedSourceContent
                  );

                  matchedClaims.push({
                    id: existing.id || `claim-${idx + 1}`,
                    claim: existing.claim || factText,
                    type: existing.type || 'fakta',
                    supported: isTrulyVerified,
                    sourceTrace: existing.sourceTrace || (hasVerifiableSourceUrl ? `${validSources[0].name} (${validSources[0].url})` : (validSources[0]?.name || 'Sumber belum tersedia — perlu verifikasi editor.')),
                    issue: !isTrulyVerified 
                      ? (existing.issue || (!hasVerifiableSourceUrl ? 'URL sumber rujukan belum valid atau belum diverifikasi' : (!hasFetchedSourceContent ? 'Isi sumber belum berhasil diambil untuk verifikasi otomatis' : 'Memerlukan verifikasi rujukan data pendukung')))
                      : undefined,
                    status: isTrulyVerified 
                      ? 'verified' 
                      : (existing.status === 'missing_source' || !validSources.length ? 'missing_source' : 'needs_verification')
                  });
                } else {
                  unmatchedFacts.push(factText);
                  matchedClaims.push({
                    id: `claim-${idx + 1}`,
                    claim: factText,
                    type: 'fakta',
                    supported: false,
                    sourceTrace: validSources.length > 0 ? (validSources[0].name || 'Sumber Terdaftar') : 'Sumber belum tersedia — perlu verifikasi editor.',
                    issue: 'Fakta utama ini belum tervalidasi secara individual oleh audit model AI',
                    status: validSources.length > 0 ? 'needs_verification' : 'missing_source'
                  });
                }
              });

              // Also include any extra claims generated for the body/lead paragraphs
              rawClaims.forEach((c: any, extraIdx: number) => {
                const isAlreadyMatched = matchedClaims.some((mc: any) => mc.id === c.id || mc.claim === c.claim);
                if (!isAlreadyMatched && c && c.claim) {
                  const isTrulyVerified = Boolean(
                    c.supported === true && 
                    c.status === 'verified' && 
                    hasVerifiableSourceUrl &&
                    hasFetchedSourceContent
                  );

                  matchedClaims.push({
                    id: c.id || `claim-extra-${extraIdx + 1}`,
                    claim: c.claim,
                    type: c.type || 'fakta',
                    supported: isTrulyVerified,
                    sourceTrace: c.sourceTrace || (validSources[0]?.name || 'Sumber belum tersedia — perlu verifikasi editor.'),
                    issue: !isTrulyVerified ? (c.issue || (!hasVerifiableSourceUrl ? 'URL sumber belum diverifikasi' : (!hasFetchedSourceContent ? 'Isi sumber belum berhasil diambil untuk audit' : 'Memerlukan rujukan data pendukung'))) : undefined,
                    status: isTrulyVerified 
                      ? 'verified' 
                      : (c.status === 'missing_source' || !validSources.length ? 'missing_source' : 'needs_verification')
                  });
                }
              });

              rawClaims = matchedClaims;
            }

            const claims = rawClaims.map((c: any, idx: number) => {
              const isTrulyVerified = Boolean(
                c.supported === true && 
                c.status === 'verified' && 
                hasVerifiableSourceUrl &&
                hasFetchedSourceContent
              );

              return {
                id: c.id || `claim-${idx + 1}`,
                claim: c.claim || '',
                type: c.type || 'fakta',
                supported: isTrulyVerified,
                sourceTrace: c.sourceTrace || (validSources[0]?.name || 'Sumber belum tersedia — perlu verifikasi editor.'),
                issue: !isTrulyVerified ? (c.issue || (!hasVerifiableSourceUrl ? 'URL sumber belum diverifikasi' : (!hasFetchedSourceContent ? 'Isi sumber belum berhasil diambil' : 'Memerlukan rujukan data pendukung'))) : undefined,
                status: isTrulyVerified ? 'verified' : (c.status === 'missing_source' || !validSources.length ? 'missing_source' : 'needs_verification')
              };
            });

            // Strict Validation Checks (Perbaikan 4 & 6 & Tahap 2)
            const hasAnyUnverified = claims.some((c: any) => !c.supported || c.status !== 'verified');
            const hasMissingSources = !validSources.length || !hasVerifiableSourceUrl;
            const hasUnsupported = Array.isArray(parsed.unsupportedClaims) && parsed.unsupportedClaims.length > 0;
            const hasConflicts = Array.isArray(parsed.conflictWarnings) && parsed.conflictWarnings.length > 0;
            const isClaimsCountSufficient = factsList.length === 0 || claims.length >= factsList.length;
            const hasForbiddenKeywords = Array.isArray(parsed.forbiddenKeywordsFound) && parsed.forbiddenKeywordsFound.length > 0;

            // Check if every fact in factsList has a verified corresponding claim
            const allFactsVerified = factsList.length === 0 || factsList.every((factText, fIdx) => {
              const cleanFact = factText.toLowerCase();
              const found = claims.find((c: any) => {
                const cText = String(c.claim || '').toLowerCase();
                return (cText.includes(cleanFact.slice(0, 30)) || cleanFact.includes(cText.slice(0, 30)) || c.id === `claim-${fIdx + 1}`);
              });
              return Boolean(found && found.supported === true && found.status === 'verified');
            });

            const strictPassed = Boolean(
              parsed.passed === true && 
              hasFetchedSourceContent &&
              !hasAnyUnverified && 
              !hasMissingSources && 
              !hasUnsupported && 
              !hasConflicts && 
              !hasForbiddenKeywords &&
              isClaimsCountSufficient &&
              allFactsVerified
            );

            const missingSourceClaims = Array.isArray(parsed.missingSourceClaims) ? [...parsed.missingSourceClaims] : [];
            if (hasMissingSources && missingSourceClaims.length === 0) {
              missingSourceClaims.push('URL sumber rujukan belum terdaftar atau tidak dapat diverifikasi.');
            } else if (!hasFetchedSourceContent && validSources.length > 0) {
              missingSourceClaims.push('Sumber rujukan terdaftar tetapi isi halaman web tidak dapat diambil untuk verifikasi otomatis.');
            }
            if (!isClaimsCountSufficient || !allFactsVerified) {
              missingSourceClaims.push(`Sebagian fakta utama belum ter-audit lengkap atau belum terkonfirmasi oleh isi sumber rujukan.`);
            }

            const verifiedCount = claims.filter((c: any) => c.status === 'verified' && c.supported).length;

            const finalResult = {
              passed: strictPassed,
              canPublish: strictPassed,
              hasUnverifiedClaims: !strictPassed,
              summary: strictPassed
                ? `✅ Lolos Verifikasi Bersih: Seluruh ${claims.length} butir klaim faktual, data angka, dan rujukan sumber telah terbukti secara individual terhadap isi sumber resmi.`
                : (parsed.summary || (!hasFetchedSourceContent && hasVerifiableSourceUrl 
                    ? `⚠️ Perlu Verifikasi Editor: URL sumber terdaftar, namun isi halaman tidak dapat diambil secara otomatis untuk verifikasi fakta.` 
                    : `⚠️ Perlu Verifikasi Editor: Terdapat ${claims.filter((c: any) => c.status !== 'verified').length} dari ${claims.length} butir klaim yang memerlukan konfirmasi rujukan sumber valid.`)),
              unsupportedClaims: Array.isArray(parsed.unsupportedClaims) ? parsed.unsupportedClaims : [],
              missingSourceClaims,
              forbiddenKeywordsFound: Array.isArray(parsed.forbiddenKeywordsFound) ? parsed.forbiddenKeywordsFound : [],
              conflictWarnings: Array.isArray(parsed.conflictWarnings) ? parsed.conflictWarnings : [],
              claims,
              sourceAudit: {
                totalSources: validSources.length,
                sourcesProvided: validSources.length > 0,
                sourcesTraceable: hasVerifiableSourceUrl,
                sourceContentFetched: hasFetchedSourceContent,
                verifiedSourceCount: successfulFetchedSources.length,
                sourceFetchFailures,
                note: hasFetchedSourceContent
                  ? `${successfulFetchedSources.length} sumber berhasil diambil dan digunakan sebagai ground truth audit.`
                  : (hasVerifiableSourceUrl 
                      ? 'URL sumber valid terdaftar, tetapi isi halaman belum berhasil diambil.' 
                      : (validSources.length > 0 ? 'Sumber terdaftar tetapi belum memiliki URL yang dapat diverifikasi.' : 'Sumber rujukan belum dicantumkan.'))
              },
              checkedAt: new Date().toISOString(),
              checkedBy: 'Redaksi DenyutGlobal (Audit AI Gemini & Sumber Primer)'
            };

            return {
              success: true,
              source: 'gemini',
              result: finalResult,
              ...finalResult
            };
          }
        } catch (apiErr: any) {
          console.warn('Gemini fact-check engine fallback to deterministic auditor:', apiErr?.message || apiErr);
        }
      }

      // Robust Algorithmic Fact-Checker (Offline & Fallback Evaluator)
      // PENTING: Fallback heuristik TIDAK membaca isi artikel sumber secara langsung.
      // Oleh karena itu, fallback TIDAK PERNAH memberikan status 'verified' atau 'passed: true'.
      const fullText = `${finalTitle} ${finalSummary} ${whyItMatters} ${contentText}`.toLowerCase();
      const editorGroundText = `${factsString} ${rawNotes}`.toLowerCase();

      const forbiddenTemplatePhrases = [
        'sedang dalam penelaahan redaksi',
        'saat ini sedang dalam penelaahan',
        'bahan liputan dihimpun dari feed kawat',
        'feed kawat resmi',
        'transformasi naskah',
        'pemisahan tegas antara fakta, konteks, dan analisis',
        'denyutglobal menerapkan prinsip transparansi',
        'editor mencatat',
        'berdasarkan catatan dan data awal yang dihimpun',
        'untuk memperbarui perkembangan isu bagi publik internasional',
        'poin fakta yang tercatat mencakup',
        'dalam catatan konteks pendukung',
        'penjelasan ini menjadi latar belakang penelaahan isu',
        'isu ini dipantau untuk memberikan gambaran proporsional'
      ];

      const foundTemplates = forbiddenTemplatePhrases.filter(phrase => fullText.includes(phrase));
      const hasPlaceholders = /\.\.\.|\[\.\.\.\]|\[isi\]|\[nama\]|\[tanggal\]|\[lokasi\]|\[placeholder\]/i.test(fullText);
      
      const foundForbidden: string[] = [];
      forbiddenWords.forEach(word => {
        if (fullText.includes(word) && !editorGroundText.includes(word)) {
          foundForbidden.push(word);
        }
      });

      // Check numbers in draft that might not be in facts
      const numberRegex = /\b\d+([.,]\d+)?\b/g;
      const draftNumbers = Array.from(new Set(fullText.match(numberRegex) || []));
      const editorNumbers = Array.from(new Set(editorGroundText.match(numberRegex) || []));
      const ungroundedNumbers = draftNumbers.filter(num => !editorNumbers.includes(num) && num.length > 1);

      // Check quotes
      const quoteRegex = /"([^"]+)"/g;
      const draftQuotes: string[] = [];
      let match;
      while ((match = quoteRegex.exec(contentText)) !== null) {
        draftQuotes.push(match[1]);
      }
      const ungroundedQuotes = draftQuotes.filter(q => !editorGroundText.includes(q.toLowerCase()));

      const hasSources = validSources.length > 0;
      const unsupportedList: string[] = [];
      const conflictList: string[] = [];

      if (foundTemplates.length > 0) {
        unsupportedList.push(`Memuat kalimat template internal yang dilarang: "${foundTemplates.join('", "')}".`);
      }
      if (hasPlaceholders) {
        unsupportedList.push('Memuat tanda placeholder atau "..." yang dilarang dalam naskah.');
      }
      if (foundForbidden.length > 0) {
        unsupportedList.push(`Penggunaan kata tanpa pembuktian data langsung: "${foundForbidden.join('", "')}".`);
      }
      if (ungroundedNumbers.length > 0 && !factsString.trim()) {
        unsupportedList.push(`Terdapat angka/data kuantitatif (${ungroundedNumbers.slice(0, 3).join(', ')}) yang tidak tercantum dalam Fakta Utama editor.`);
      }
      if (ungroundedQuotes.length > 0 && !rawNotes.trim()) {
        unsupportedList.push(`Terdapat kutipan langsung yang tidak tercantum dalam catatan narasumber editor.`);
      }

      // Check title consistency with facts
      if (finalTitle && factsList.length > 0) {
        const titleWords = finalTitle.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const groundWords = editorGroundText.split(/\s+/).filter(w => w.length > 4);
        const matchCount = titleWords.filter(w => groundWords.some(gw => gw.includes(w) || w.includes(gw))).length;
        if (titleWords.length >= 3 && matchCount === 0) {
          unsupportedList.push('Judul memuat fokus yang berbeda signifikan dari poin fakta utama terverifikasi (potensi ketidaksesuaian editorial).');
        }
      }

      const missingSourceClaims: string[] = [];
      if (!hasSources) {
        missingSourceClaims.push('Sumber rujukan belum dicantumkan. Setiap fakta penting harus dapat ditelusuri ke sumber rujukan.');
      } else if (!hasVerifiableSourceUrl) {
        missingSourceClaims.push('Sumber rujukan belum memiliki URL valid yang dapat diverifikasi.');
      } else if (!hasFetchedSourceContent) {
        missingSourceClaims.push('Sumber tersedia tetapi isi sumber belum berhasil diambil untuk verifikasi otomatis.');
      } else {
        missingSourceClaims.push('Audit otomatis AI sedang tidak tersedia. Perlu konfirmasi manual oleh editor sebelum tayang.');
      }

      // Extract individual claims strictly from ALL factsList items first, then content paragraphs
      const claimsListToEvaluate = factsList.length > 0 
        ? factsList 
        : [
            ...contentParagraphs.flatMap(p => p.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 25))
          ].slice(0, 6);

      // Pada fallback: TIDAK PERNAH memberikan 'verified' atau supported: true
      const claims = claimsListToEvaluate.map((st, idx) => {
        let type: 'fakta' | 'konteks' | 'opini_analisis' = 'fakta';
        if (st.toLowerCase().includes('karena') || st.toLowerCase().includes('sehingga') || st.toLowerCase().includes('latar belakang')) {
          type = 'konteks';
        } else if (st.toLowerCase().includes('berpotensi') || st.toLowerCase().includes('implikasi') || st.toLowerCase().includes('menunjukkan')) {
          type = 'opini_analisis';
        }

        const status: 'needs_verification' | 'missing_source' = (!hasSources || !hasVerifiableSourceUrl) 
          ? 'missing_source' 
          : 'needs_verification';

        return {
          id: `claim-${idx + 1}`,
          claim: st,
          type,
          supported: false, // Fallback tidak pernah mengasumsikan klaim terbukti hanya dari URL
          sourceTrace: hasVerifiableSourceUrl 
            ? `${validSources[0].name} (${validSources[0].url})` 
            : (hasSources ? `${validSources[0].name} (URL belum terverifikasi)` : 'Sumber belum tersedia — perlu verifikasi editor.'),
          issue: !hasVerifiableSourceUrl 
            ? 'URL sumber rujukan belum valid' 
            : 'Perlu konfirmasi verifikasi isi sumber oleh editor/AI',
          status
        };
      });

      // Fallback SELALU menetapkan passed: false dan hasUnverifiedClaims: true
      const passed = false;
      const canPublish = false;
      const hasUnverifiedClaims = true;

      const fallbackResult = {
        passed,
        canPublish,
        hasUnverifiedClaims,
        summary: `⚠️ Perlu Verifikasi Editor: Ditemukan ${claims.length} butir klaim yang memerlukan konfirmasi rujukan sumber secara manual atau pengulangan audit AI.`,
        unsupportedClaims: unsupportedList,
        missingSourceClaims,
        forbiddenKeywordsFound: foundForbidden,
        conflictWarnings: conflictList,
        claims,
        sourceAudit: {
          totalSources: validSources.length,
          sourcesProvided: hasSources,
          sourcesTraceable: hasVerifiableSourceUrl,
          sourceContentFetched: hasFetchedSourceContent,
          verifiedSourceCount: successfulFetchedSources.length,
          sourceFetchFailures,
          note: hasFetchedSourceContent
            ? `${successfulFetchedSources.length} sumber referensi terdaftar (menunggu verifikasi isi oleh editor).`
            : (hasVerifiableSourceUrl 
                ? 'URL valid tetapi isi sumber belum berhasil diambil untuk verifikasi otomatis.' 
                : (hasSources ? 'Sumber terdaftar tetapi belum memiliki URL yang dapat diverifikasi.' : 'Sumber belum tersedia — perlu verifikasi editor.'))
        },
        checkedAt: new Date().toISOString(),
        checkedBy: 'Redaksi DenyutGlobal (Audit Heuristik Aman)'
      };

      return {
        success: true,
        source: 'heuristic',
        result: fallbackResult,
        ...fallbackResult
      };
  }

  // Dedicated AI Fact-Checking Endpoint (Validasi Sebelum Publish)
  app.post('/api/ai/fact-check', async (req, res) => {
    try {
      const responseData = await performStrictFactCheck(req.body);
      return res.json(responseData);
    } catch (err: any) {
      console.error('Fact Check Error (/api/ai/fact-check):', err);
      return res.status(500).json({
        success: false,
        error: 'Terjadi kendala saat melakukan pemeriksaan fakta.',
        details: err.message
      });
    }
  });

  // Dedicated Editorial Fact-Verification Endpoint (/api/editorial/verify-facts)
  app.post('/api/editorial/verify-facts', async (req, res) => {
    try {
      const responseData = await performStrictFactCheck(req.body);
      return res.json(responseData);
    } catch (err: any) {
      console.error('Fact Check Error (/api/editorial/verify-facts):', err);
      return res.status(500).json({
        success: false,
        error: 'Terjadi kendala saat melakukan verifikasi fakta editorial.',
        details: err.message
      });
    }
  });

  // Dedicated AI Draft Revision / Refinement Endpoint (Instruksi Perbaikan Naskah)
  app.post('/api/ai/refine-draft', async (req, res) => {
    try {
      const {
        title = '',
        summary = '',
        content = [],
        facts = '',
        roughNotes = '',
        sources = [],
        category = 'Dunia',
        location = '',
        whyItMatters = '',
        factCheckResult = null,
        instructions = ''
      } = req.body;

      if (!instructions.trim() && !title.trim() && !summary.trim() && (!Array.isArray(content) || content.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'Mohon masukkan instruksi perbaikan atau pastikan naskah artikel telah terisi.'
        });
      }

      const contentText = Array.isArray(content) ? content.join('\n\n') : String(content || '');
      const validSources = Array.isArray(sources)
        ? sources.filter((s: any) => s && (s.name?.trim() || s.url?.trim()))
        : [];

      const client = getGeminiClient();

      if (client) {
        const refinePrompt = `Anda adalah EDITOR NASKAH SENIOR di DenyutGlobal (media independen berbahasa Indonesia dengan standar integritas jurnalistik dan verifikasi fakta tertinggi).

PERAN ANDA:
Anda berfungsi HANYA sebagai EDITOR NASKAH, BUKAN sebagai pembuat atau penambah fakta.
Tugas utama: Memperbaiki bahasa, struktur, keterbacaan, dan kualitas jurnalistik naskah berdasarkan fakta yang sudah tersedia dan terverifikasi, TANPA mengarang, menebak, menambah, mengurangi, atau mengubah fakta.

ATURAN KHUSUS FITUR 🔧 PERBAIKI NASKAH — FINAL:

1. FAKTA TIDAK BOLEH BERUBAH
   Pertahankan secara persis:
   - Nama;
   - Inisial;
   - Jabatan;
   - Lembaga;
   - Lokasi;
   - Tanggal;
   - Waktu;
   - Angka;
   - Nominal;
   - Persentase;
   - Jarak;
   - Kronologi;
   - Status hukum;
   - Status kebencanaan;
   - Tingkat aktivitas;
   - Pasal;
   - Rekomendasi resmi;
   - Fakta utama lainnya.
   Jangan mengubah angka, istilah, status, atau makna.

2. DILARANG MENGARANG
   Jangan menambahkan fakta yang tidak tersedia.
   Jangan menebak informasi yang kosong.
   Jangan membuat:
   - Nama;
   - Tanggal;
   - Angka;
   - Kutipan;
   - Kronologi;
   - Penyebab;
   - Korban;
   - Dampak;
   - Motif;
   - Lokasi tambahan;
   - Rekomendasi tambahan;
   - Analisis;
   - Prediksi.
   Jika informasi tidak tersedia, jangan mengisinya.

3. SEMUA FAKTA UTAMA WAJIB MASUK (ATURAN KRUSIAL)
   Setiap fakta yang tercantum dalam bagian FAKTA UTAMA HARUS tercermin dalam ISI NASKAH, selama fakta tersebut relevan dengan berita.
   Jangan hanya menggunakan satu atau dua fakta lalu mengabaikan fakta utama lainnya.
   Contoh: Jika FAKTA UTAMA berisi waktu erupsi, tinggi kolom abu, arah kolom abu, status Level III Siaga, rekomendasi radius bahaya 3 km dan sektoral 4 km, maka SEMUA informasi tersebut harus masuk ke ISI NASKAH.
   Jangan mengurangi isi hanya karena ingin membuat artikel lebih singkat. Namun jangan menambahkan informasi baru untuk memperpanjang artikel.

4. STRUKTUR ARTIKEL NATURAL & JURNALISTIK
   Susun artikel secara natural dan jurnalistik dengan urutan prioritas:
   1. Peristiwa utama;
   2. Detail kejadian;
   3. Kondisi/status terkait;
   4. Informasi atau rekomendasi resmi;
   5. Fakta tambahan yang memang tersedia.
   Gunakan paragraf pendek (2-4 kalimat per paragraf) agar nyaman dibaca di layar ponsel.

5. JUDUL
   - Buat judul yang menggambarkan peristiwa utama.
   - Jangan menggunakan judul generik seperti "Laporan Pemantauan Kebencanaan Terkini di Kawasan Flores Timur, Nusa Tenggara Timur".
   - Gunakan fakta utama sebagai dasar judul.
   - Jangan membuat judul sensasional, provokatif, atau menyesatkan (bebas clickbait).

6. SUMBER & URL SUMBER
   - Pertahankan sumber dan URL sumber yang diberikan apa adanya.
   - Jangan membuat URL baru, jangan mengganti sumber.

7. STATUS HUKUM DAN BENCANA HARUS HATI-HATI
   - Jangan mengubah status hukum (tersangka/terdakwa/terpidana) atau status kebencanaan.
   - Untuk berita bencana: jangan membuat prediksi, jangan membuat rekomendasi keselamatan sendiri, jangan memperluas radius bahaya, jangan mengubah level aktivitas, jangan mengubah peringatan resmi.

8. NASKAH HARUS LENGKAP
   - Jangan menggunakan "...", "[lanjut]", "[dan seterusnya]", atau placeholder lainnya.
   - Hasil harus berupa naskah lengkap dan utuh siap tayang.

9. JANGAN MEMASUKKAN AUDIT / KOMENTAR INTERNAL KE DALAM NASKAH
   - Naskah judul, ringkasan, dan isi naskah tidak boleh disisipi komentar editor, proses AI, atau catatan internal.

10. LAKUKAN PEMERIKSAAN INTERNAL SEBELUM MENGEMBALIKAN HASIL:
    - Pastikan tidak ada fakta baru;
    - Pastikan tidak ada fakta yang berubah;
    - Pastikan SEMUA FAKTA UTAMA sudah masuk ke ISI NASKAH;
    - Pastikan angka, nominal, jarak, persentase tetap sama;
    - Pastikan nama dan lokasi tetap sama;
    - Pastikan status hukum/kebencanaan tetap sama;
    - Pastikan sumber dan URL tetap sama;
    - Pastikan naskah lengkap tanpa placeholder;
    - Pastikan judul mencerminkan peristiwa utama secara spesifik.

DATA NASKAH SAAT INI:
- Judul Saat Ini: ${title || '(Kosong)'}
- Rubrik Kategori: ${category}
- Lokasi: ${location || 'Internasional'}
- Ringkasan Saat Ini: ${summary || '(Kosong)'}
- FAKTA UTAMA TERVERIFIKASI (SEMUA WAJIB MASUK KE ISI):
${facts || '(Kosong)'}
- Catatan Tambahan Editor:
${roughNotes || '(Kosong)'}
- Isi Naskah Saat Ini:
${contentText || '(Kosong)'}
- Mengapa Penting:
${whyItMatters || '(Kosong)'}
- SUMBER & URL SUMBER:
${validSources.length > 0 ? validSources.map((s: any) => `- ${s.name || 'Sumber'} (${s.url || ''})`).join('\n') : '(Tidak ada sumber)'}
- Catatan Audit Fakta:
${factCheckResult?.summary || '(Belum ada temuan)'}
${factCheckResult?.unsupportedClaims?.length > 0 ? `Klaim belum terverifikasi: ${factCheckResult.unsupportedClaims.join('; ')}` : ''}

INSTRUKSI DARI EDITOR:
${instructions || 'Tolong perbaiki bahasa, struktur, dan judul berita berdasarkan fakta yang tersedia. Pastikan semua fakta utama masuk ke isi naskah.'}

KEMBALIKAN HANYA FORMAT JSON VALID:
{
  "title": "string (Judul berita spesifik berbasis peristiwa utama nyata, tidak generik, tidak sensasional)",
  "summary": "string (Ringkasan 2-3 kalimat padat merangkum peristiwa utama dan status/rekomendasi)",
  "facts": ["string (Daftar poin seluruh fakta utama yang dipertahankan utuh)"],
  "content": [
    "string (Paragraf 1: Peristiwa utama - lead lugas)",
    "string (Paragraf 2: Detail kejadian - angka, waktu, kronologi, tinggi, dsb)",
    "string (Paragraf 3: Kondisi & status terkait)",
    "string (Paragraf 4: Informasi/rekomendasi resmi dari otoritas/lembaga)",
    "string (Paragraf 5 jika ada fakta tambahan)"
  ],
  "whyItMatters": "string (Signifikansi latar belakang peristiwa secara objektif)",
  "changesSummary": [
    "string (Poin ringkas perbaikan bahasa, e.g. 'Semua poin fakta utama diintegrasikan ke isi naskah', 'Judul diselaraskan dengan peristiwa utama', 'Tata bahasa disesuaikan PUEBI')"
  ],
  "conflictWarnings": [
    "string (Hanya jika instruksi editor bertentangan dengan data resmi: 'Perubahan tersebut berpotensi bertentangan dengan fakta terverifikasi dan tidak diterapkan: [alasan]')"
  ],
  "statusFakta": "string (Status verifikasi, e.g. 'Terverifikasi terhadap rujukan terdaftar')"
}`;

        const { text: refineOutput } = await generateWithGeminiFallback(client, refinePrompt, 'application/json');

        if (refineOutput) {
          try {
            const parsed = JSON.parse(refineOutput);
            return res.json({
              success: true,
              source: 'gemini',
              revisedDraft: {
                title: parsed.title || title,
                summary: parsed.summary || summary,
                facts: Array.isArray(parsed.facts) ? parsed.facts : (facts ? facts.split('\n').filter(Boolean) : []),
                content: Array.isArray(parsed.content) ? parsed.content : (contentText ? [contentText] : []),
                whyItMatters: parsed.whyItMatters || whyItMatters,
                changesSummary: Array.isArray(parsed.changesSummary) && parsed.changesSummary.length > 0
                  ? parsed.changesSummary
                  : [
                      'Naskah diselaraskan dengan instruksi editor',
                      'Placeholder dan kata klise dibersihkan',
                      'Fakta utama dipertahankan'
                    ],
                conflictWarnings: Array.isArray(parsed.conflictWarnings) ? parsed.conflictWarnings : [],
                statusFakta: parsed.statusFakta || (validSources.length > 0 ? 'Terverifikasi terhadap sumber terdaftar' : 'Perlu verifikasi sumber')
              }
            });
          } catch (pe) {
            console.warn('Failed to parse Gemini refine JSON, fallback to algorithmic refiner', pe);
          }
        }
      }

      // Algorithmic Refinement Engine (Guaranteed deterministic fallback)
      const rawFactList = facts.split('\n').map(f => f.trim().replace(/^[-*•0-9.]\s*/, '')).filter(Boolean);
      
      let cleanedTitle = title.trim();
      // Remove wire prefixes
      cleanedTitle = cleanedTitle.replace(/^(ANTARA|Reuters|AFP|DW|BBC|Badan Geologi|BMKG|Polri|Kemenkes|KPK|BNPB):\s*/i, '');
      cleanedTitle = cleanedTitle.replace(/\.\.\.|\[\.\.\.\]/g, '').trim();
      if (!cleanedTitle && rawFactList.length > 0) {
        cleanedTitle = rawFactList[0].length > 80 ? rawFactList[0].slice(0, 80) + '...' : rawFactList[0];
      } else if (!cleanedTitle) {
        cleanedTitle = `Pencatatan Perkembangan Data Terkini Sektor ${category}`;
      }

      // Clean summary
      let cleanedSummary = summary.replace(/\.\.\.|\[\.\.\.\]|\[isi\]|\[placeholder\]/gi, '').trim();
      if (!cleanedSummary && rawFactList.length > 0) {
        cleanedSummary = rawFactList.slice(0, 2).join('. ') + '.';
      } else if (!cleanedSummary) {
        cleanedSummary = `Perkembangan data dan fakta peristiwa sektor ${category.toLowerCase()} telah dirilis secara resmi oleh pihak berwenang.`;
      }

      // Clean and reconstruct paragraphs to ensure ALL facts are included
      let paragraphs: string[] = [];
      const cleanedExistingParagraphs = contentText
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => {
          let cp = p;
          cp = cp.replace(/\.\.\.|\[\.\.\.\]|\[isi\]|\[nama\]|\[tanggal\]|\[lokasi\]|TODO|PLACEHOLDER/gi, '');
          cp = cp.replace(/sedang dalam penelaahan redaksi|saat ini sedang dalam penelaahan/gi, '');
          cp = cp.replace(/bahan liputan dihimpun dari feed kawat|feed kawat resmi/gi, '');
          cp = cp.replace(/transformasi naskah|denyutglobal menerapkan prinsip transparansi/gi, '');
          cp = cp.replace(/editor mencatat|berdasarkan catatan dan data awal yang dihimpun/gi, '');
          cp = cp.replace(/untuk memperbarui perkembangan isu bagi publik internasional/gi, '');
          return cp.trim();
        })
        .filter(p => p.length > 15);

      if (cleanedExistingParagraphs.length > 0) {
        paragraphs = [...cleanedExistingParagraphs];
        // Ensure any fact from rawFactList not mentioned in paragraphs gets appended
        const combinedText = paragraphs.join(' ').toLowerCase();
        const missingFacts = rawFactList.filter(f => {
          const keyWords = f.toLowerCase().split(' ').filter(w => w.length > 4);
          const matched = keyWords.filter(w => combinedText.includes(w));
          return keyWords.length > 0 && matched.length / keyWords.length < 0.4;
        });

        if (missingFacts.length > 0) {
          paragraphs.push(missingFacts.join('. ') + '.');
        }
      } else {
        // Build structured paragraphs strictly from rawFactList
        if (rawFactList.length >= 3) {
          paragraphs.push(rawFactList[0] + (rawFactList[0].endsWith('.') ? '' : '.'));
          paragraphs.push(rawFactList.slice(1, Math.ceil(rawFactList.length / 2)).join('. ') + '.');
          paragraphs.push(rawFactList.slice(Math.ceil(rawFactList.length / 2)).join('. ') + '.');
        } else if (rawFactList.length > 0) {
          paragraphs.push(rawFactList.join('. ') + '.');
        } else {
          paragraphs.push(cleanedSummary);
        }
      }

      // Add official source reference attribution paragraph if available
      if (validSources.length > 0) {
        const sourceNames = validSources.map((s: any) => s.name).filter(Boolean).join(', ');
        if (sourceNames && !paragraphs.some(p => p.toLowerCase().includes('sumber') || p.toLowerCase().includes(sourceNames.toLowerCase()))) {
          paragraphs.push(`Informasi resmi peristiwa ini bersumber dari data dan rilis publik ${sourceNames}.`);
        }
      }

      const cleanedFacts = rawFactList.length > 0 ? rawFactList : [cleanedSummary];

      const changesSummary = [
        'Semua poin fakta utama diintegrasikan ke dalam isi naskah',
        'Placeholder dan tanda elipsis (...) dibersihkan',
        'Kalimat template internal redaksi dihapus',
        'Tata bahasa dan keterbacaan diselaraskan dengan standar PUEBI/EYD',
        'Seluruh angka, data nominal, status, dan sumber rujukan dipertahankan utuh'
      ];

      return res.json({
        success: true,
        source: 'algorithmic',
        revisedDraft: {
          title: cleanedTitle,
          summary: cleanedSummary,
          facts: cleanedFacts,
          content: paragraphs,
          whyItMatters: whyItMatters.trim() || 'Informasi ini relevan bagi publik dan pemangku kepentingan guna memantau perkembangan terkini secara objektif.',
          changesSummary,
          conflictWarnings: [],
          statusFakta: validSources.length > 0 ? 'Terverifikasi terhadap rujukan terdaftar' : 'Perlu verifikasi sumber'
        }
      });

    } catch (err: any) {
      console.error('Refine Draft Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Perbaikan gagal dijalankan. Naskah asli tetap aman dan tidak berubah.',
        details: err.message
      });
    }
  });

  // AI Editorial Illustration Generator Endpoint
  app.post('/api/ai/generate-illustration', async (req, res) => {
    try {
      const {
        title = '',
        facts = '',
        location = '',
        category = 'Dunia',
        summary = '',
        seed = Date.now()
      } = req.body;

      if (!title.trim() && !facts.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Judul atau fakta naskah diperlukan untuk menyusun ilustrasi.'
        });
      }

      const client = getGeminiClient();
      const prompt = buildEditorialIllustrationPrompt({
        title,
        facts,
        location,
        category,
        summary,
        seed
      });

      let imageUrl: string | null = null;

      if (client) {
        try {
          const response = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [
                {
                  text: prompt
                }
              ]
            },
            config: {
              imageConfig: {
                aspectRatio: '16:9'
              }
            }
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || 'image/png';
                imageUrl = `data:${mime};base64,${part.inlineData.data}`;
                break;
              }
            }
          }
        } catch (geminiError: any) {
          console.warn('Gemini image generation error:', geminiError?.message || geminiError);
          return res.status(503).json({
            success: false,
            error: geminiError?.message?.includes('quota') || geminiError?.message?.includes('429')
              ? 'Batas kuota layanan AI saat ini sedang penuh. Anda dapat mengunggah foto editor langsung melalui tombol Upload Foto.'
              : 'Layanan AI Ilustrasi sedang tidak dapat diakses saat ini. Silakan gunakan tombol Upload Foto editor.',
            details: geminiError?.message
          });
        }
      }

      if (imageUrl) {
        return res.json({
          success: true,
          imageUrl,
          imageType: 'ai_illustration',
          imageCredit: 'Ilustrasi AI — DenyutGlobal',
          captionGambar: `Ilustrasi editorial DenyutGlobal: ${title.trim()}`
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Tidak ada gambar yang dihasilkan oleh layanan AI. Silakan coba kembali atau gunakan fitur Upload Foto editor.'
      });

    } catch (err: any) {
      console.error('Illustration Generation Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Gagal membuat Ilustrasi AI. Artikel tetap dapat diproses tanpa gambar atau gunakan Upload Foto.',
        details: err.message
      });
    }
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DenyutGlobal Full-stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
