import { NewsItem, ArticleStatus, ArticleSource } from '../types';
import { slugify } from '../utils/slug';

const STORAGE_KEY = 'denyutglobal_editorial_articles_v2';

export const INITIAL_EDITORIAL_ARTICLES: NewsItem[] = [
  {
    id: 'art-001',
    title: 'KTT Iklim Jenewa Sepakati Mekanisme Dana Transisi Energi $120 Miliar untuk Negara Berkembang',
    judul: 'KTT Iklim Jenewa Sepakati Mekanisme Dana Transisi Energi $120 Miliar untuk Negara Berkembang',
    slug: 'ktt-iklim-jenewa-dana-transisi-energi-120-miliar',
    category: 'dunia',
    kategori: 'dunia',
    categoryLabel: 'Dunia',
    kategoriLabel: 'Dunia',
    location: 'Jenewa, Swiss',
    negaraLokasi: 'Jenewa, Swiss',
    author: 'Redaksi DenyutGlobal',
    publishedAt: '2026-08-15T09:15:00Z',
    tanggal: '15 Agustus 2026',
    waktu: '09:15 WIB',
    status: 'published',
    reviewed: true,
    isEditorial: true,
    isHero: true,
    isFeatured: true,
    isBreaking: true,
    readTimeMinutes: 4,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    gambar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    captionGambar: 'Suasana sidang pleno penutupan KTT Iklim Internasional di Palais des Nations, Jenewa.',
    summary: 'Sebanyak 142 negara delegasi mencapai konsensus bersejarah terkait pembentukan skema pendanaan darurat $120 miliar untuk dekarbonisasi dan transfer teknologi hijau.',
    ringkasan: 'Sebanyak 142 negara delegasi mencapai konsensus bersejarah terkait pembentukan skema pendanaan darurat $120 miliar untuk dekarbonisasi dan transfer teknologi hijau.',
    facts: [
      '142 delegasi negara menyetujui pembentukan dana darurat senilai US$120 miliar.',
      'Fokus alokasi ditujukan bagi negara berkembang dan kepulauan rentan iklim selama lima tahun ke depan.',
      'Terdapat klausul transfer teknologi baterai grid dan manufaktur panel surya bebas royalti eksklusif.',
      'Mekanisme audit keuangan dikelola komite bersama di bawah naungan PBB.'
    ],
    whyItMatters: 'Kesepakatan ini mengakhiri kebuntuan negosiasi pendanaan iklim selama bertahun-tahun. Bagi negara berkembang seperti Indonesia, pakta ini membuka akses pembiayaan berbunga rendah serta alih teknologi esensial tanpa membebani neraca utang negara.',
    content: [
      'JENEWA — Pertemuan Tingkat Tinggi Iklim Global yang berlangsung selama sepekan di Palais des Nations, Jenewa, resmi membuahkan terobosan diplomatik. Sebanyak 142 negara delegasi menyepakati pembentukan kerangka pendanaan transisi energi hijau terpadu senilai US$120 miliar untuk periode 2026–2031.',
      'Berbeda dengan komitmen terdahulu yang kerap berupa target nir-sanksi, traktat Jenewa ini mengikat kontribusi langsung dari kelompok ekonomi maju serta institusi keuangan multilateral. Dana tersebut diprioritaskan untuk percepatan dekarbonisasi pembangkit listrik berbasis batu bara serta pembangunan benteng abrasi pesisir di kawasan kepulauan Pasifik dan Asia Tenggara.',
      'Dalam pidato penutupannya, Sekretaris Jenderal PBB menegaskan pentingnya akuntabilitas. "Kita tidak lagi sekadar berjanji, melainkan mengunci komitmen dana nyata yang diawasi oleh komite independen lintas negara," ujarnya di hadapan sidang pleno.',
      'Bagi Indonesia dan mitra di kawasan ASEAN, traktat ini memberi kepastian kerja sama alih teknologi manufaktur sel surya efisiensi tinggi dan fasilitas penyimpanan energi baterai skala grid tanpa batasan paten eksklusif.'
    ],
    isiLengkap: [
      'JENEWA — Pertemuan Tingkat Tinggi Iklim Global yang berlangsung selama sepekan di Palais des Nations, Jenewa, resmi membuahkan terobosan diplomatik. Sebanyak 142 negara delegasi menyepakati pembentukan kerangka pendanaan transisi energi hijau terpadu senilai US$120 miliar untuk periode 2026–2031.',
      'Berbeda dengan komitmen terdahulu yang kerap berupa target nir-sanksi, traktat Jenewa ini mengikat kontribusi langsung dari kelompok ekonomi maju serta institusi keuangan multilateral. Dana tersebut diprioritaskan untuk percepatan dekarbonisasi pembangkit listrik berbasis batu bara serta pembangunan benteng abrasi pesisir di kawasan kepulauan Pasifik dan Asia Tenggara.',
      'Dalam pidato penutupannya, Sekretaris Jenderal PBB menegaskan pentingnya akuntabilitas. "Kita tidak lagi sekadar berjanji, melainkan mengunci komitmen dana nyata yang diawasi oleh komite independen lintas negara," ujarnya di hadapan sidang pleno.',
      'Bagi Indonesia dan mitra di kawasan ASEAN, traktat ini memberi kepastian kerja sama alih teknologi manufaktur sel surya efisiensi tinggi dan fasilitas penyimpanan energi baterai skala grid tanpa batasan paten eksklusif.'
    ],
    sources: [
      {
        name: 'UN Climate Press Office (UNFCCC)',
        url: 'https://unfccc.int',
        date: '15 Agustus 2026',
        notes: 'Komunike resmi sidang pleno KTT Jenewa'
      },
      {
        name: 'Reuters World Service',
        url: 'https://www.reuters.com',
        date: '15 Agustus 2026',
        notes: 'Laporan jalannya negosiasi anggaran'
      }
    ],
    sourceUrls: ['https://unfccc.int', 'https://www.reuters.com'],
    tags: ['KTT Iklim', 'Energi Bersih', 'PBB', 'Geopolitik']
  },
  {
    id: 'art-002',
    title: 'Indonesia Perkuat Inisiatif Konservasi Mangrove dan Perdagangan Karbon Biru di Forum ASEAN',
    judul: 'Indonesia Perkuat Inisiatif Konservasi Mangrove dan Perdagangan Karbon Biru di Forum ASEAN',
    slug: 'indonesia-inisiatif-mangrove-karbon-biru-asean',
    category: 'indonesia',
    kategori: 'indonesia',
    categoryLabel: 'Indonesia',
    kategoriLabel: 'Indonesia',
    location: 'Jakarta, Indonesia',
    negaraLokasi: 'Jakarta, Indonesia',
    author: 'Tim Redaksi DenyutGlobal',
    publishedAt: '2026-08-14T21:30:00Z',
    tanggal: '14 Agustus 2026',
    waktu: '21:30 WIB',
    status: 'published',
    reviewed: true,
    isEditorial: true,
    isFeatured: true,
    readTimeMinutes: 4,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    gambar: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Kawasan konservasi hutan bakau pesisir Indonesia yang menjadi pusat riset karbon biru.',
    summary: 'Deklarasi bersama ASEAN memperkokoh peran strategis Indonesia dalam mengelola 600.000 hektar ekosistem pesisir dengan potensi serapan 45 juta ton CO2 per tahun.',
    ringkasan: 'Deklarasi bersama ASEAN memperkokoh peran strategis Indonesia dalam mengelola 600.000 hektar ekosistem pesisir dengan potensi serapan 45 juta ton CO2 per tahun.',
    facts: [
      'Kerja sama regional mencakup restorasi ekosistem mangrove seluas 600.000 hektar.',
      'Potensi penyerapan karbon biru diproyeksikan mencapai 45 juta ton emisi CO2 ekuivalen per tahun hingga 2030.',
      'Melibatkan komunitas pesisir lokal di Sumatra, Kalimantan, dan Papua.',
      'Standardisasi sertifikasi kredit karbon biru ASEAN diluncurkan bersama.'
    ],
    whyItMatters: 'Karbon biru dari mangrove memiliki kemampuan menyerap karbon hingga 5 kali lebih tinggi dibanding hutan daratan biasa. Kepemimpinan Indonesia dalam standardisasi ini membuka potensi pendapatan ekonomi hijau sekaligus melindungi garis pantai dari abrasi ekstrem.',
    content: [
      'JAKARTA — Kementerian Lingkungan Hidup dan Kehutanan bersama Sekretariat ASEAN meluncurkan platform kerja sama regional perdagangan kredit karbon biru berbasis ekosistem mangrove di Jakarta.',
      'Program percontohan ini memadukan pemantauan satelit beresolusi tinggi dengan pelibatan langsung kelompok tani nelayan pesisir. Diharapkan, proyek ini tidak hanya memulihkan biodiversitas laut, tetapi juga menghasilkan sertifikat kredit karbon berstandar internasional yang dapat diperdagangkan secara sah.',
      'Delegasi negara-negara ASEAN menyepakati pembentukan bursa karbon regional terintegrasi guna mencegah tumpang tindih sertifikasi serta menjaga kedaulatan data ekologi masing-masing negara.'
    ],
    isiLengkap: [
      'JAKARTA — Kementerian Lingkungan Hidup dan Kehutanan bersama Sekretariat ASEAN meluncurkan platform kerja sama regional perdagangan kredit karbon biru berbasis ekosistem mangrove di Jakarta.',
      'Program percontohan ini memadukan pemantauan satelit beresolusi tinggi dengan pelibatan langsung kelompok tani nelayan pesisir. Diharapkan, proyek ini tidak hanya memulihkan biodiversitas laut, tetapi juga menghasilkan sertifikat kredit karbon berstandar internasional yang dapat diperdagangkan secara sah.',
      'Delegasi negara-negara ASEAN menyepakati pembentukan bursa karbon regional terintegrasi guna mencegah tumpang tindih sertifikasi serta menjaga kedaulatan data ekologi masing-masing negara.'
    ],
    sources: [
      {
        name: 'ANTARA News',
        url: 'https://www.antaranews.com',
        date: '14 Agustus 2026',
        notes: 'Liputan konferensi pers Sekretariat ASEAN di Jakarta'
      },
      {
        name: 'Kementerian Lingkungan Hidup RI',
        url: 'https://menlhk.go.id',
        date: '14 Agustus 2026',
        notes: 'Siaran pers resmi inisiatif Blue Carbon Indonesia'
      }
    ],
    sourceUrls: ['https://www.antaranews.com', 'https://menlhk.go.id'],
    tags: ['Indonesia', 'ASEAN', 'Blue Carbon', 'Lingkungan']
  },
  {
    id: 'art-003',
    title: 'Cadangan Devisa Indonesia Tetap Kokoh di $145,2 Miliar Topang Ketahanan Sektor Eksternal',
    judul: 'Cadangan Devisa Indonesia Tetap Kokoh di $145,2 Miliar Topang Ketahanan Sektor Eksternal',
    slug: 'cadangan-devisa-indonesia-tetap-kokoh-145-2-miliar',
    category: 'ekonomi',
    kategori: 'ekonomi',
    categoryLabel: 'Ekonomi',
    kategoriLabel: 'Ekonomi',
    location: 'Jakarta, Indonesia',
    negaraLokasi: 'Jakarta, Indonesia',
    author: 'Ahmad Fauzi (Editor Ekonomi)',
    publishedAt: '2026-08-14T13:15:00Z',
    tanggal: '14 Agustus 2026',
    waktu: '13:15 WIB',
    status: 'published',
    reviewed: true,
    isEditorial: true,
    isFeatured: true,
    readTimeMinutes: 3,
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    gambar: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Gedung Bank Indonesia di kawasan Thamrin, Jakarta Pusat.',
    summary: 'Bank Indonesia mencatat posisi cadangan devisa setara dengan pembiayaan 6,3 bulan impor, berada jauh di atas standar kecukupan internasional.',
    ringkasan: 'Bank Indonesia mencatat posisi cadangan devisa setara dengan pembiayaan 6,3 bulan impor, berada jauh di atas standar kecukupan internasional.',
    facts: [
      'Posisi cadangan devisa akhir bulan tercatat sebesar US$145,2 miliar.',
      'Mampu membiayai 6,3 bulan kebutuhan impor dan pembayaran utang luar negeri pemerintah.',
      'Standar kecukupan internasional mensyaratkan minimal 3 bulan impor.',
      'Stabilitas ditopang oleh surplus neraca perdagangan berkelanjutan.'
    ],
    whyItMatters: 'Cadangan devisa yang tebal menjadi benteng penyangga utama stabilitas nilai tukar Rupiah di tengah ketidakpastian suku bunga global dan fluktuasi harga komoditas energi dunia.',
    content: [
      'JAKARTA — Bank Indonesia (BI) merilis data posisi cadangan devisa Indonesia pada akhir bulan lalu yang tercatat sebesar 145,2 miliar dolar AS.',
      'Direktur Eksekutif Departemen Komunikasi Bank Indonesia menyampaikan bahwa capaian ini memadai untuk mendukung ketahanan sektor eksternal serta menjaga stabilitas makroekonomi dan sistem keuangan.',
      'Posisi cadangan devisa tersebut setara dengan pembiayaan 6,3 bulan impor atau 6,1 bulan impor beserta pembayaran utang luar negeri pemerintah. Angka ini melampaui standar kecukupan internasional sekitar 3 bulan impor.',
      'Bank Indonesia memandang cadangan devisa ke depan akan tetap memadai, didukung oleh prospek ekonomi nasional yang resilien serta aliran masuk modal asing ke instrumen pasar keuangan domestik.'
    ],
    isiLengkap: [
      'JAKARTA — Bank Indonesia (BI) merilis data posisi cadangan devisa Indonesia pada akhir bulan lalu yang tercatat sebesar 145,2 miliar dolar AS.',
      'Direktur Eksekutif Departemen Komunikasi Bank Indonesia menyampaikan bahwa capaian ini memadai untuk mendukung ketahanan sektor eksternal serta menjaga stabilitas makroekonomi dan sistem keuangan.',
      'Posisi cadangan devisa tersebut setara dengan pembiayaan 6,3 bulan impor atau 6,1 bulan impor beserta pembayaran utang luar negeri pemerintah. Angka ini melampaui standar kecukupan internasional sekitar 3 bulan impor.',
      'Bank Indonesia memandang cadangan devisa ke depan akan tetap memadai, didukung oleh prospek ekonomi nasional yang resilien serta aliran masuk modal asing ke instrumen pasar keuangan domestik.'
    ],
    sources: [
      {
        name: 'Bank Indonesia (Departemen Komunikasi)',
        url: 'https://www.bi.go.id',
        date: '14 Agustus 2026',
        notes: 'Statistik Perkembangan Cadangan Devisa RI'
      },
      {
        name: 'LKBN ANTARA',
        url: 'https://www.antaranews.com',
        date: '14 Agustus 2026',
        notes: 'Pemberitaan rilis resmi Bank Indonesia'
      }
    ],
    sourceUrls: ['https://www.bi.go.id', 'https://www.antaranews.com'],
    tags: ['Ekonomi', 'Bank Indonesia', 'Cadangan Devisa', 'Indonesia']
  },
  {
    id: 'art-004',
    title: 'Regulasi Audit Etika AI Uni Eropa Berlaku Penuh: Standar Baru Transparansi Model Fondasi',
    judul: 'Regulasi Audit Etika AI Uni Eropa Berlaku Penuh: Standar Baru Transparansi Model Fondasi',
    slug: 'regulasi-audit-etika-ai-uni-eropa-2026',
    category: 'teknologi',
    kategori: 'teknologi',
    categoryLabel: 'Teknologi',
    kategoriLabel: 'Teknologi',
    location: 'Brussel, Belgia',
    negaraLokasi: 'Brussel, Belgia',
    author: 'Redaksi DenyutGlobal',
    publishedAt: '2026-08-15T08:10:00Z',
    tanggal: '15 Agustus 2026',
    waktu: '08:10 WIB',
    status: 'published',
    reviewed: true,
    isEditorial: true,
    isDailyBrief: true,
    briefOrder: 1,
    readTimeMinutes: 3,
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    gambar: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Gedung Komisi Eropa di Brussel saat sesi penetapan standar regulasi teknologi digital.',
    summary: 'Pengembang model AI berkapasitas komputasi raksasa kini diwajibkan menyertakan laporan jejak karbon, audit data latih, dan mekanisme pencegahan disinformasi.',
    ringkasan: 'Pengembang model AI berkapasitas komputasi raksasa kini diwajibkan menyertakan laporan jejak karbon, audit data latih, dan mekanisme pencegahan disinformasi.',
    facts: [
      'Wajib audit independen untuk model komputasi di atas 10^25 FLOPs.',
      'Kewajiban pelaporan konsumsi daya listrik data center kecerdasan buatan.',
      'Sanksi administratif hingga 7% dari omzet global perusahaan yang melanggar batasan etika.'
    ],
    whyItMatters: 'Sebagai salah satu pasar tunggal terbesar, standar Uni Eropa sering kali menjadi acuan kepatuhan de facto global (Brussels Effect) yang mendorong perusahaan teknologi dunia mendesain AI secara lebih transparan dan hemat energi.',
    content: [
      'BRUSSEL — Parlemen dan Komisi Eropa resmi memberlakukan ketentuan audit etika teknis bagi pengembang model fondasi kecerdasan buatan komersial di seluruh negara anggota.',
      'Regulasi ini menekankan tiga pilar: transparansi hak cipta data pelatihan, pengujian ketat terhadap kerentanan bias algoritmik, serta pencatatan resmi konsumsi energi pusat data komputasi awan.',
      'Perusahaan teknologi global yang beroperasi di wilayah Eropa diberikan waktu penyesuaian 6 bulan untuk mengunggah dokumen kepatuhan ke basis data pengawasan digital terpusat.'
    ],
    isiLengkap: [
      'BRUSSEL — Parlemen dan Komisi Eropa resmi memberlakukan ketentuan audit etika teknis bagi pengembang model fondasi kecerdasan buatan komersial di seluruh negara anggota.',
      'Regulasi ini menekankan tiga pilar: transparansi hak cipta data pelatihan, pengujian ketat terhadap kerentanan bias algoritmik, serta pencatatan resmi konsumsi energi pusat data komputasi awan.',
      'Perusahaan teknologi global yang beroperasi di wilayah Eropa diberikan waktu penyesuaian 6 bulan untuk mengunggah dokumen kepatuhan ke basis data pengawasan digital terpusat.'
    ],
    sources: [
      {
        name: 'European Commission - Digital Strategy',
        url: 'https://digital-strategy.ec.europa.eu',
        date: '15 Agustus 2026',
        notes: 'Panduan teknis kepatuhan EU AI Act'
      },
      {
        name: 'BBC International Technology Desk',
        url: 'https://www.bbc.com/news/technology',
        date: '15 Agustus 2026',
        notes: 'Liputan respons asosiasi industri perangkat lunak'
      }
    ],
    sourceUrls: ['https://digital-strategy.ec.europa.eu', 'https://www.bbc.com/news/technology'],
    tags: ['Teknologi', 'AI', 'Regulasi', 'Eropa']
  },
  {
    id: 'art-005',
    title: 'Uji Klinis Fase 3 Terapi Gen Presisi Tunjukkan Hasil Remisi Autoimun Hingga 92 Persen',
    judul: 'Uji Klinis Fase 3 Terapi Gen Presisi Tunjukkan Hasil Remisi Autoimun Hingga 92 Persen',
    slug: 'uji-klinis-terapi-gen-remisi-autoimun-oxford',
    category: 'sains',
    kategori: 'sains',
    categoryLabel: 'Sains',
    kategoriLabel: 'Sains',
    location: 'Oxford, Inggris',
    negaraLokasi: 'Oxford, Inggris',
    author: 'Dr. Maya Pratiwi (Editor Sains & Kesehatan)',
    publishedAt: '2026-08-14T15:10:00Z',
    tanggal: '14 Agustus 2026',
    waktu: '15:10 WIB',
    status: 'published',
    reviewed: true,
    isEditorial: true,
    isDailyBrief: true,
    briefOrder: 2,
    readTimeMinutes: 4,
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    gambar: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Peneliti menganalisis struktur protein seluler di laboratorium biomedis Oxford.',
    summary: 'Riset kolaborasi ilmuwan Oxford dan Karolinska Institute mencatat keberhasilan remisi jangka panjang tanpa merusak sistem kekebalan tubuh alami pasien.',
    ringkasan: 'Riset kolaborasi ilmuwan Oxford dan Karolinska Institute mencatat keberhasilan remisi jangka panjang tanpa merusak sistem kekebalan tubuh alami pasien.',
    facts: [
      'Melibatkan 480 partisipan uji klinis multicenter di Inggris dan Skandinavia.',
      '92% pasien mengalami remisi total gejala inflamasi setelah 12 bulan pemberian terapi.',
      'Menggunakan teknologi pemrograman ulang reseptor sel T tanpa imunoterapi konvensional berdosis tinggi.'
    ],
    whyItMatters: 'Pasien penyakit autoimun selama ini bergantung pada obat imunosupresan seumur hidup yang membuat tubuh rentan infeksi. Pendekatan presisi ini menargetkan akar disfungsi imun tanpa melumpuhkan pertahanan alami tubuh.',
    content: [
      'OXFORD — Jurnal medis The Lancet mempublikasikan laporan uji klinis fase 3 terapi seluler presisi yang dirancang untuk meredam respons autoimun agresif.',
      'Uji coba yang dipimpin konsorsium riset medis Oxford dan Karolinska Institute ini berfokus pada pelatihan ulang reseptor sel limfosit agar mengenali jaringan tubuh sendiri sebagai komponen non-ancaman.',
      'Para peneliti berharap izin edar darurat dari badan pengawas obat internasional dapat diterbitkan dalam waktu 18 bulan ke depan untuk memperluas akses pasien secara global.'
    ],
    isiLengkap: [
      'OXFORD — Jurnal medis The Lancet mempublikasikan laporan uji klinis fase 3 terapi seluler presisi yang dirancang untuk meredam respons autoimun agresif.',
      'Uji coba yang dipimpin konsorsium riset medis Oxford dan Karolinska Institute ini berfokus pada pelatihan ulang reseptor sel limfosit agar mengenali jaringan tubuh sendiri sebagai komponen non-ancaman.',
      'Para peneliti berharap izin edar darurat dari badan pengawas obat internasional dapat diterbitkan dalam waktu 18 bulan ke depan untuk memperluas akses pasien secara global.'
    ],
    sources: [
      {
        name: 'The Lancet Medical Journal',
        url: 'https://www.thelancet.com',
        date: '14 Agustus 2026',
        notes: 'Peer-reviewed clinical trial report'
      },
      {
        name: 'University of Oxford Medical Sciences Division',
        url: 'https://www.medsci.ox.ac.uk',
        date: '14 Agustus 2026',
        notes: 'Rilis pers resmi tim peneliti konsorsium'
      }
    ],
    sourceUrls: ['https://www.thelancet.com', 'https://www.medsci.ox.ac.uk'],
    tags: ['Kesehatan', 'Kedokteran', 'Bioteknologi', 'Sains']
  }
];

export class EditorialStore {
  private static instance: EditorialStore;
  private articles: NewsItem[] = [];
  private isInitializedFromApi = false;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): EditorialStore {
    if (!EditorialStore.instance) {
      EditorialStore.instance = new EditorialStore();
    }
    return EditorialStore.instance;
  }

  /**
   * Helper untuk membaca token otorisasi redaksi dari sessionStorage dengan aman
   */
  private getAuthToken(token?: string): string {
    if (token) return token;
    if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
      try {
        return sessionStorage.getItem('denyutglobal_editorial_token') || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  /**
   * Helper untuk membersihkan data URL berukuran besar sebelum disimpan ke offline cache localStorage
   */
  private sanitizeForStorage(items: NewsItem[]): NewsItem[] {
    return items.map((item) => {
      const isImageDataUrl = typeof item.image === 'string' && item.image.startsWith('data:');
      const isGambarDataUrl = typeof item.gambar === 'string' && item.gambar.startsWith('data:');

      // Jika gambar bertipe data URL (base64) dan sangat panjang (> 20KB), jangan simpan string base64 penuh ke localStorage
      if (isImageDataUrl || isGambarDataUrl) {
        return {
          ...item,
          image: isImageDataUrl && item.image && item.image.length > 20000 ? '' : item.image,
          gambar: isGambarDataUrl && item.gambar && item.gambar.length > 20000 ? '' : item.gambar,
        };
      }
      return item;
    });
  }

  /**
   * Membaca artikel dari localStorage (cache / fallback offline)
   */
  public loadFromStorage(): NewsItem[] {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.articles = parsed;
            return this.articles;
          }
        }
      } catch (e) {
        console.warn('Failed to load editorial articles from localStorage', e);
      }
    }
    this.articles = [...INITIAL_EDITORIAL_ARTICLES];
    return this.articles;
  }

  /**
   * Menyimpan salinan ke localStorage sebagai offline cache secara aman & tahan kuota
   */
  public saveToStorage() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      // 1. Sanitasi gambar data URL besar sebelum disimpan ke localStorage
      const sanitized = this.sanitizeForStorage(this.articles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e: any) {
      console.warn('[EditorialStore] Kuota localStorage penuh, menerapkan kompresi cache offline:', e?.message || e);
      
      try {
        // 2. Bersihkan cache sementara untuk menghemat ruang
        try {
          localStorage.removeItem('denyutglobal_news_summary_cache_v1');
          localStorage.removeItem('denyutglobal_editorial_articles');
          localStorage.removeItem('denyutglobal_editorial_articles_v1');
        } catch {}

        // 3. Simpan hanya 15 artikel terbaru dengan struktur ramping
        const leanArticles = this.articles.slice(0, 15).map((art) => ({
          id: art.id,
          slug: art.slug,
          title: art.title || art.judul,
          judul: art.judul || art.title,
          summary: art.summary || art.ringkasan,
          ringkasan: art.ringkasan || art.summary,
          category: art.category || art.kategori,
          kategori: art.kategori || art.category,
          categoryLabel: art.categoryLabel || art.kategoriLabel,
          kategoriLabel: art.kategoriLabel || art.categoryLabel,
          publishedAt: art.publishedAt,
          tanggal: art.tanggal,
          waktu: art.waktu,
          status: art.status,
          reviewed: art.reviewed,
          isEditorial: art.isEditorial,
          image: typeof art.image === 'string' && !art.image.startsWith('data:') ? art.image : '',
          gambar: typeof art.gambar === 'string' && !art.gambar.startsWith('data:') ? art.gambar : '',
          content: art.content || art.isiLengkap,
          isiLengkap: art.isiLengkap || art.content,
          sources: art.sources,
          tags: art.tags
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(leanArticles));
      } catch (fallbackErr) {
        console.warn('[EditorialStore] Melewati penyimpanan offline localStorage (mode in-memory aktif).', fallbackErr);
      }
    }
  }

  public getAllArticles(): NewsItem[] {
    return [...this.articles];
  }

  /**
   * Hanya mengembalikan artikel terverifikasi dan berstatus published untuk pembaca publik
   */
  public getPublishedArticles(): NewsItem[] {
    return this.articles.filter(
      (item) => item.status === 'published' && item.reviewed === true
    );
  }

  public getArticleById(id: string): NewsItem | undefined {
    return this.articles.find((item) => item.id === id);
  }

  /**
   * Mengambil artikel publik dari API server D1 secara asinkron
   * Memperbarui cache memori dan localStorage secara otomatis.
   */
  public async fetchPublishedArticlesFromApi(): Promise<NewsItem[]> {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const json = await res.json();
        const apiArticles: NewsItem[] = json.data || (Array.isArray(json) ? json : []);
        if (apiArticles.length > 0) {
          // Merge API articles with current local drafts
          const nonPublished = this.articles.filter(a => a.status !== 'published' || !a.reviewed);
          this.articles = [...apiArticles, ...nonPublished];
          this.saveToStorage();
          this.isInitializedFromApi = true;
          return this.getPublishedArticles();
        }
      }
    } catch (e) {
      console.warn('Could not fetch public articles from API, using cached fallback:', e);
    }
    return this.getPublishedArticles();
  }

  /**
   * Mengambil detail artikel tunggal dari API berdasarkan slug
   */
  public async fetchArticleBySlugFromApi(slug: string): Promise<NewsItem | undefined> {
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const fetched: NewsItem = json.data;
          // Update cache if found
          const idx = this.articles.findIndex(a => a.id === fetched.id || a.slug === fetched.slug);
          if (idx >= 0) {
            this.articles[idx] = fetched;
          } else {
            this.articles.unshift(fetched);
          }
          this.saveToStorage();
          return fetched;
        }
      }
    } catch (e) {
      console.warn('Could not fetch article by slug from API, looking in local cache:', e);
    }
    return this.articles.find(a => a.slug === slug || a.id === slug);
  }

  /**
   * Mengambil semua artikel redaksi (termasuk draft/review) dari API
   */
  public async fetchEditorialArticlesFromApi(token?: string): Promise<NewsItem[]> {
    try {
      const authToken = this.getAuthToken(token);
      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/editorial/articles', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.articles = json.data;
          this.saveToStorage();
          this.isInitializedFromApi = true;
          return [...this.articles];
        }
      } else if (res.status === 401) {
        console.warn('[EditorialStore] Sesi redaksi kedaluwarsa saat fetch artikel.');
      }
    } catch (e) {
      console.warn('Could not fetch editorial articles from API, fallback to local store:', e);
    }
    return [...this.articles];
  }

  /**
   * Sinkronisasi Batch dari LocalStorage ke Server D1 (Idempotent Migration)
   */
  public async syncLocalToApi(token?: string): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const authToken = this.getAuthToken(token);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/editorial/sync-batch', {
        method: 'POST',
        headers,
        body: JSON.stringify({ articles: this.articles })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.articles = json.data;
          this.saveToStorage();
          return { success: true, message: json.message || 'Sinkronisasi berhasil', count: json.total };
        }
      }
      return { success: false, message: 'Gagal melakukan sinkronisasi dengan server.' };
    } catch (e: any) {
      console.error('Sync batch error:', e);
      return { success: false, message: e?.message || 'Koneksi ke server terputus.' };
    }
  }

  /**
   * Simpan artikel (Asinkron API-First dengan fallback sinkron ke LocalStorage)
   */
  public async saveArticleToApi(article: NewsItem, token?: string): Promise<NewsItem> {
    // Validasi ketat gambar sebelum publish ke API & database D1
    if (article.status === 'published') {
      const trimmedImg = (article.image || article.gambar || '').trim();
      const isValidImage = Boolean(
        trimmedImg &&
        (trimmedImg.toLowerCase().startsWith('data:image/') ||
         trimmedImg.toLowerCase().startsWith('https://') ||
         trimmedImg.toLowerCase().startsWith('http://'))
      );
      if (!isValidImage) {
        throw new Error('Artikel belum memiliki gambar ilustrasi. Tambahkan gambar sebelum menerbitkan artikel.');
      }
    }

    // 1. Siapkan naskah terformat
    const savedLocal = this.saveArticle(article);

    // 2. Simpan ke backend API D1
    try {
      const authToken = this.getAuthToken(token);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        headers['x-editorial-token'] = authToken;
      }

      const res = await fetch('/api/editorial/articles', {
        method: 'POST',
        headers,
        body: JSON.stringify(savedLocal)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const idx = this.articles.findIndex(a => a.id === json.data.id);
          if (idx >= 0) {
            this.articles[idx] = json.data;
          }
          this.saveToStorage();

          if (json.d1_persisted) {
            console.log(`[EditorialStore] Sukses tersimpan ke Cloudflare D1 (${json.d1_source}): "${json.data.title}"`);
          } else {
            console.warn(`[EditorialStore] Disimpan di server fallback (${json.d1_source}): ${json.warning || json.message}`);
          }
          return json.data;
        }
        throw new Error(json.error || json.message || 'Respon server tidak valid saat menyimpan artikel.');
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error || errJson?.message || `Gagal menyimpan ke database Cloudflare D1 (HTTP ${res.status}: ${res.statusText})`;
        if (res.status === 401) {
          throw new Error('Sesi otorisasi Ruang Redaksi kedaluwarsa atau tidak valid. Silakan login ulang ke Ruang Redaksi.');
        }
        throw new Error(errMsg);
      }
    } catch (e: any) {
      console.error('[EditorialStore] Gagal menyimpan artikel ke API/D1:', e);
      throw e;
    }
  }

  /**
   * Hapus artikel (Asinkron API-First dengan update LocalStorage)
   */
  public async deleteArticleFromApi(id: string, token?: string): Promise<boolean> {
    this.deleteArticle(id);

    try {
      const authToken = this.getAuthToken(token);
      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/editorial/articles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers
      });

      return res.ok;
    } catch (e) {
      console.warn('API delete failed, removed locally:', e);
      return true;
    }
  }

  public saveArticle(article: NewsItem): NewsItem {
    const existingIndex = this.articles.findIndex((item) => item.id === article.id);
    const now = new Date();
    const formattedDate = `${now.getDate()} ${this.getMonthName(now.getMonth())} ${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    // Ensure compatibility aliases
    const updated: NewsItem = {
      ...article,
      judul: article.title || article.judul,
      title: article.title || article.judul,
      ringkasan: article.summary || article.ringkasan,
      summary: article.summary || article.ringkasan,
      isiLengkap: article.content || article.isiLengkap,
      content: article.content || article.isiLengkap,
      kategori: article.category || article.kategori,
      category: article.category || article.kategori,
      kategoriLabel: this.getCategoryLabel(article.category || article.kategori),
      categoryLabel: this.getCategoryLabel(article.category || article.kategori),
      negaraLokasi: article.location || article.negaraLokasi,
      location: article.location || article.negaraLokasi,
      gambar: article.image || article.gambar,
      image: article.image || article.gambar,
      namaSumber: article.sources && article.sources.length > 0 ? article.sources.map(s => s.name).join(', ') : 'Redaksi DenyutGlobal',
      urlSumber: article.sources && article.sources.length > 0 ? article.sources[0].url : 'https://denyutglobal.id',
      slug: article.slug ? slugify(article.slug) : slugify(article.title || article.judul) || article.id,
      isEditorial: true,
    };

    if (existingIndex >= 0) {
      // If updating an existing published article, set updatedAt
      const existing = this.articles[existingIndex];
      if (existing.status === 'published' && updated.status === 'published') {
        updated.updatedAt = `${formattedDate} • ${formattedTime}`;
      }
      this.articles[existingIndex] = updated;
    } else {
      // New article creation
      updated.tanggal = updated.tanggal || formattedDate;
      updated.waktu = updated.waktu || formattedTime;
      updated.publishedAt = updated.publishedAt || now.toISOString();
      this.articles.unshift(updated);
    }

    this.saveToStorage();
    return updated;
  }

  public deleteArticle(id: string): boolean {
    const initialLen = this.articles.length;
    this.articles = this.articles.filter((item) => item.id !== id);
    if (this.articles.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public resetToDefault(): NewsItem[] {
    this.articles = [...INITIAL_EDITORIAL_ARTICLES];
    this.saveToStorage();
    return this.articles;
  }

  private getMonthName(monthIdx: number): string {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIdx] || 'Januari';
  }

  private getCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      dunia: 'Dunia',
      politik: 'Politik',
      ekonomi: 'Ekonomi',
      teknologi: 'Teknologi',
      sains: 'Sains',
      olahraga: 'Olahraga',
      bencana: 'Bencana',
      indonesia: 'Indonesia'
    };
    return map[cat] || 'Dunia';
  }
}

export const editorialStore = EditorialStore.getInstance();
