import { NewsItem } from '../types';

export const SAMPLE_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-001',
    judul: 'KTT Iklim Jenewa Capai Kesepakatan Bersejarah Dana Transisi Energi Bersih Lintas Benua',
    ringkasan: 'Lebih dari 140 delegasi negara menyetujui pembentukan mekanisme pendanaan darurat sebesar $120 miliar guna mempercepat transisi energi hijau di negara-negara berkembang.',
    isiLengkap: [
      'JENEWA — Pertemuan Tingkat Tinggi Iklim Global yang berlangsung selama sepekan di markas PBB Jenewa akhirnya membuahkan terobosan diplomatik signifikan. Sebanyak 142 negara delegasi menyepakati pembentukan kerangka pendanaan transisi energi hijau terpadu senilai US$120 miliar untuk periode lima tahun ke depan.',
      'Kesepakatan ini berfokus pada percepatan dekarbonisasi pembangkit listrik serta mitigasi risiko perubahan iklim di kawasan kepulauan dan negara berkembang yang paling rentan terhadap kenaikan permukaan air laut.',
      'Sekretaris Jenderal PBB dalam pidato penutupannya menyebut pakta ini sebagai langkah konkret paling berani dalam satu dekade terakhir. "Kita tidak lagi sekadar berjanji, melainkan mengunci komitmen dana nyata yang dapat diaudit secara transparan," tegasnya di hadapan forum.',
      'Indonesia bersama kelompok negara G20 lainnya menyambut positif resolusi ini, khususnya klausul transfer teknologi manufaktur panel surya generasi baru dan baterai penyimpanan energi skala grid yang dirancang bebas royalti eksklusif bagi negara mitra.'
    ],
    kategori: 'dunia',
    kategoriLabel: 'Dunia',
    gambar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    captionGambar: 'Suasana sidang pleno penutupan KTT Iklim Internasional di Palais des Nations, Jenewa.',
    tanggal: '15 Agustus 2026',
    waktu: '09:15 WIB',
    namaSumber: 'Reuters & AFP International',
    urlSumber: 'https://www.reuters.com',
    negaraLokasi: 'Jenewa, Swiss',
    isHero: true,
    isFeatured: true,
    isBreaking: true,
    readTimeMinutes: 4,
    tags: ['KTT Iklim', 'Energi Bersih', 'PBB', 'Geopolitik']
  },
  {
    id: 'news-002',
    judul: '5 Berita Dunia Hari Ini #1: Resolusi Baru Keamanan Maritim Selat Malaka Diresmikan',
    ringkasan: 'Tiga negara pantai menyepakati patroli satelit real-time bersama untuk mencegah penyelundupan dan menjaga jalur logistik global tetap aman.',
    isiLengkap: [
      'SINGAPURA — Forum Keamanan Maritim Kawasan secara resmi mengumumkan integrasi sistem radar satelit kecerdasan buatan untuk mengawasi rute pelayaran Selat Malaka sepanjang 800 kilometer.',
      'Sistem terintegrasi ini memungkinkan identifikasi otomatis kapal tanpa registrasi resmi serta merespons insiden darurat dalam waktu kurang dari 15 menit. Kerja sama ini didukung oleh berbagai operator logistik pelayaran internasional.'
    ],
    kategori: 'dunia',
    kategoriLabel: 'Dunia',
    gambar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Kapal kontainer melintasi jalur pelayaran internasional Selat Malaka.',
    tanggal: '15 Agustus 2026',
    waktu: '08:45 WIB',
    namaSumber: 'Associated Press',
    urlSumber: 'https://apnews.com',
    negaraLokasi: 'Singapura',
    isDailyBrief: true,
    briefOrder: 1,
    readTimeMinutes: 3,
    tags: ['Maritim', 'Logistik', 'Asia Tenggara']
  },
  {
    id: 'news-003',
    judul: '5 Berita Dunia Hari Ini #2: Uni Eropa Luncurkan Regulasi Audit Etika AI Generatif Terbaru',
    ringkasan: 'Semua model fondasi AI berskala besar wajib mempublikasikan jejak konsumsi energi dan sertifikasi keamanan data sebelum dirilis ke publik.',
    isiLengkap: [
      'BRUSSEL — Parlemen Eropa mengesahkan addendum regulasi kecerdasan buatan yang mewajibkan transparansi penuh atas data latih dan konsumsi listrik pusat data komputasi AI.',
      'Aturan ini dirancang untuk memastikan bahwa inovasi komputasi masa depan tidak mengorbankan privasi publik maupun melipatgandakan emisi karbon global.'
    ],
    kategori: 'teknologi',
    kategoriLabel: 'Teknologi',
    gambar: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Gedung Komisi Eropa di Brussel saat sesi penetapan standar regulasi teknologi digital.',
    tanggal: '15 Agustus 2026',
    waktu: '08:10 WIB',
    namaSumber: 'BBC International',
    urlSumber: 'https://www.bbc.com',
    negaraLokasi: 'Brussel, Belgia',
    isDailyBrief: true,
    briefOrder: 2,
    readTimeMinutes: 3,
    tags: ['Kecerdasan Buatan', 'Regulasi', 'Uni Eropa']
  },
  {
    id: 'news-004',
    judul: '5 Berita Dunia Hari Ini #3: Bank Sentral Global Koordinasikan Stabilitas Nilai Tukar Utama',
    ringkasan: 'Pertemuan kuartalan di Basel menetapkan batas koridor suku bunga acuan guna meredam volatilitas arus modal di pasar negara berkembang.',
    isiLengkap: [
      'BASEL — Bank for International Settlements (BIS) merilis pedoman penyelarasan likuiditas antar bank sentral terkemuka dunia guna mengantisipasi gejolak perdagangan komoditas energi global.',
      'Gubernur bank sentral menyatakan kesiapan intervensi terkoordinasi jika terjadi lonjakan suku bunga mendadak yang dapat mengganggu arus perdagangan pangan internasional.'
    ],
    kategori: 'ekonomi',
    kategoriLabel: 'Ekonomi',
    gambar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Papan pergerakan indeks bursa saham dan pasar mata uang internasional.',
    tanggal: '15 Agustus 2026',
    waktu: '07:30 WIB',
    namaSumber: 'Financial Times & Bloomberg',
    urlSumber: 'https://www.ft.com',
    negaraLokasi: 'Basel, Swiss',
    isDailyBrief: true,
    briefOrder: 3,
    readTimeMinutes: 3,
    tags: ['Perbankan', 'Ekonomi Global', 'Moneter']
  },
  {
    id: 'news-005',
    judul: '5 Berita Dunia Hari Ini #4: Teleskop Luar Angkasa Deteksi Jejak Uap Air di Eksoplanet Mirip Bumi',
    ringkasan: 'Spektroskopi inframerah mengonfirmasi atmosfer stabil pada planet ekstrasurya yang mengorbit di zona laik huni bintang berjarak 48 tahun cahaya.',
    isiLengkap: [
      'WASHINGTON — Badan antariksa internasional mempublikasikan temuan data spektrometri dari teleskop observasi generasi baru yang memetakan komposisi atmosfer eksoplanet Gliese-486d.',
      'Analisis mengonfirmasi adanya molekul air dan metana dalam proporsi stabil, menjadikannya kandidat paling menjanjikan untuk riset lanjutan biokimia antariksa.'
    ],
    kategori: 'sains',
    kategoriLabel: 'Sains',
    gambar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Ilustrasi observasi atmosfer eksoplanet melalui spektrum inframerah ruang angkasa.',
    tanggal: '15 Agustus 2026',
    waktu: '06:50 WIB',
    namaSumber: 'Nature & Space Science Alert',
    urlSumber: 'https://www.nature.com',
    negaraLokasi: 'Washington D.C., AS',
    isDailyBrief: true,
    briefOrder: 4,
    readTimeMinutes: 4,
    tags: ['Antariksa', 'Astronomi', 'Eksoplanet']
  },
  {
    id: 'news-006',
    judul: '5 Berita Dunia Hari Ini #5: Sistem Sensor Cepat Seismik Cincin Pasifik Berhasil Uji Coba Pertama',
    ringkasan: 'Jaringan kabel bawah laut serat optik kini mampu mengirimkan peringatan gelombang tsunami hingga 18 menit lebih awal kepada otoritas sipil.',
    isiLengkap: [
      'TOKYO — Kolaborasi badan vulkanologi dan seismologi Pasifik berhasil menguji coba jaringan deteksi tekanan dasar laut berbasis laser serat optik.',
      'Sistem mutakhir ini memangkas waktu kalkulasi magnitudo gempa megathrust secara signifikan, memberi waktu evakuasi lebih berharga bagi jutaan penduduk pesisir di Asia Timur dan Asia Tenggara.'
    ],
    kategori: 'bencana',
    kategoriLabel: 'Bencana',
    gambar: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Pemantauan real-time aktivitas seismik di stasiun pusat vulkanologi Tokyo.',
    tanggal: '15 Agustus 2026',
    waktu: '06:15 WIB',
    namaSumber: 'Kyodo News & NHK World',
    urlSumber: 'https://english.kyodonews.net',
    negaraLokasi: 'Tokyo, Jepang',
    isDailyBrief: true,
    briefOrder: 5,
    readTimeMinutes: 3,
    tags: ['Seismik', 'Mitigasi Bencana', 'Teknologi Sensor']
  },
  {
    id: 'news-007',
    judul: 'Diplomasi Perdamaian Global: Sidang Darurat Majelis Umum PBB Sahkan Koridor Bantuan Kemanusiaan',
    ringkasan: 'Resolusi mengikat disahkan secara aklamasi untuk menjamin akses medis bebas hambatan di lima zona konflik berkepanjangan.',
    isiLengkap: [
      'NEW YORK — Dalam sidang pleno luar biasa di Markas Besar PBB, seluruh negara anggota menyepakati protokol perlindungan konvoi logistik Palang Merah Internasional.',
      'Resolusi ini menegaskan sanksi tegas bagi pihak yang menghambat distribusi obat-obatan dan suplai air bersih bagi warga sipil terdampak krisis kemanusiaan.'
    ],
    kategori: 'politik',
    kategoriLabel: 'Politik',
    gambar: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Delegasi negara mendengarkan pidato Ketua Dewan Keamanan PBB di New York.',
    tanggal: '15 Agustus 2026',
    waktu: '05:40 WIB',
    namaSumber: 'UN News Service',
    urlSumber: 'https://news.un.org',
    negaraLokasi: 'New York, AS',
    isFeatured: true,
    readTimeMinutes: 4,
    tags: ['PBB', 'Diplomasi', 'Kemanusiaan']
  },
  {
    id: 'news-008',
    judul: 'Indonesia Pimpin Inisiatif Konservasi Mangrove dan Blue Carbon Terluas di Forum ASEAN',
    ringkasan: 'Deklarasi Bali memperkuat pendanaan restorasi ekosistem pesisir seluas 600.000 hektar bersama negara-negara mitra Indo-Pasifik.',
    isiLengkap: [
      'JAKARTA — Kementerian Lingkungan Hidup bersama perwakilan sekretariat ASEAN meluncurkan platform kolaborasi regional perdagangan kredit karbon biru berbasis ekosistem mangrove.',
      'Program percontohan ini melibatkan komunitas pesisir di Sumatra, Kalimantan, dan Papua dengan target penyerapan 45 juta ton emisi CO2 ekuivalen per tahun hingga 2030.'
    ],
    kategori: 'indonesia',
    kategoriLabel: 'Indonesia',
    gambar: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Kawasan konservasi hutan bakau pesisir Indonesia yang menjadi pusat riset karbon biru.',
    tanggal: '14 Agustus 2026',
    waktu: '21:30 WIB',
    namaSumber: 'Antara News & ASEAN Secretariat',
    urlSumber: 'https://www.antaranews.com',
    negaraLokasi: 'Jakarta, Indonesia',
    isFeatured: true,
    readTimeMinutes: 4,
    tags: ['Indonesia', 'ASEAN', 'Blue Carbon', 'Lingkungan']
  },
  {
    id: 'news-009',
    judul: 'Revolusi Baterai Solid-State: Pabrik Skala Komersial Pertama Mulai Produksi di Jerman',
    ringkasan: 'Teknologi elektrolit padat baru ini mampu memangkas waktu pengisian daya kendaraan listrik menjadi hanya 8 menit dengan jarak tempuh 1.000 km.',
    isiLengkap: [
      'STUTTGART — Industri otomotif Eropa mencatatkan tonggak sejarah dengan beroperasinya lini perakitan baterai elektrolit padat murni komersial pertama di dunia.',
      'Inovasi ini dinilai memecahkan hambatan terbesar adopsi kendaraan listrik global, yakni bobot baterai dan risiko degradasi termal pada suhu ekstrem.'
    ],
    kategori: 'teknologi',
    kategoriLabel: 'Teknologi',
    gambar: 'https://images.unsplash.com/photo-1558441719-8b489c638a19?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Robot presisi merakit modul baterai sel padat di fasilitas manufaktur Stuttgart.',
    tanggal: '14 Agustus 2026',
    waktu: '19:45 WIB',
    namaSumber: 'Deutsche Welle (DW)',
    urlSumber: 'https://www.dw.com',
    negaraLokasi: 'Stuttgart, Jerman',
    isFeatured: true,
    readTimeMinutes: 3,
    tags: ['EV', 'Baterai', 'Otomotif', 'Teknologi']
  },
  {
    id: 'news-010',
    judul: 'Final Liga Champions Asia & Eropa 2026: Format Turnamen Bersama Diumumkan',
    ringkasan: 'Asosiasi sepak bola internasional memperkenalkan kejuaraan antarklub super yang mempertemukan jawara liga dari 6 konfederasi benua.',
    isiLengkap: [
      'ZURICH — Badan sepak bola dunia secara resmi memfinalisasi kalender kejuaraan antarklub antarbenua dengan format kompetisi gugur terpadu.',
      'Turnamen ini dirancang untuk memperluas panggung persaingan klub-klub dari Asia, Afrika, dan Amerika Latin melawan raksasa Eropa di stadion netral berstandar Olimpiade.'
    ],
    kategori: 'olahraga',
    kategoriLabel: 'Olahraga',
    gambar: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Kemegahan stadion modern saat pembukaan turnamen sepak bola internasional.',
    tanggal: '14 Agustus 2026',
    waktu: '17:20 WIB',
    namaSumber: 'Sky Sports & Goal Global',
    urlSumber: 'https://www.skysports.com',
    negaraLokasi: 'Zurich, Swiss',
    isFeatured: true,
    readTimeMinutes: 3,
    tags: ['Sepak Bola', 'Olahraga Dunia', 'FIFA']
  },
  {
    id: 'news-011',
    judul: 'Misi Medis Global: Uji Klinis Terapi Gen Target Hentikan Progresi Penyakit Autoimun',
    ringkasan: 'Riset gabungan ilmuwan Oxford dan Karolinska Institute menunjukkan keberhasilan remisi jangka panjang pada 92% partisipan fase 3.',
    isiLengkap: [
      'OXFORD — Jurnal medis internasional mempublikasikan hasil uji klinis terapi pengeditan gen seluler presisi yang mampu melatih kembali limfosit T tanpa merusak sistem kekebalan tubuh alami.',
      'Penemuan ini diproyeksikan mengubah standar penanganan penyakit autoimun kronis dalam kurun waktu dua tahun ke depan.'
    ],
    kategori: 'sains',
    kategoriLabel: 'Sains',
    gambar: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Peneliti menganalisis struktur protein seluler di laboratorium biomedis Oxford.',
    tanggal: '14 Agustus 2026',
    waktu: '15:10 WIB',
    namaSumber: 'The Lancet & Medical News Today',
    urlSumber: 'https://www.thelancet.com',
    negaraLokasi: 'Oxford, Inggris',
    readTimeMinutes: 4,
    tags: ['Kesehatan', 'Kedokteran', 'Bioteknologi']
  },
  {
    id: 'news-012',
    judul: 'Gunung Api Bawah Laut Pasifik Selatan Meletus: BMKG & Otoritas Regional Pastikan Jalur Udara Aman',
    ringkasan: 'Letusan abu vulkanik terlokalisasi di perairan terbuka dan tidak mengancam pulau pemukiman maupun rute penerbangan komersial.',
    isiLengkap: [
      'NUKUʻALOFA — Pusat Vulkanologi Pasifik Selatan mencatat erupsi freatik kolom abu setinggi 2.500 meter di punggung bukit bawah laut barat Tonga.',
      'Satelit pemantau cuaca geostasioner mengonfirmasi kepulan abu bergerak ke arah tenggara menjauhi koridor udara internasional utama.'
    ],
    kategori: 'bencana',
    kategoriLabel: 'Bencana',
    gambar: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Kepulan asap vulkanik terpantau dari stasiun pengamatan laut lepas Pasifik.',
    tanggal: '14 Agustus 2026',
    waktu: '13:00 WIB',
    namaSumber: 'Pacific Disaster Net',
    urlSumber: 'https://www.pacificdisaster.net',
    negaraLokasi: 'Nukuʻalofa, Tonga',
    readTimeMinutes: 3,
    tags: ['Vulkanologi', 'Bencana Alam', 'Pasifik']
  },
  {
    id: 'news-013',
    judul: 'Kemitraan Perdagangan Digital Indonesia-Uni Emirat Arab Bukukan Transaksi $8 Miliar',
    ringkasan: 'Platform e-logistik bilateral memangkas waktu kliring bea cukai produk pertanian dan manufaktur halal dari 5 hari menjadi 4 jam.',
    isiLengkap: [
      'ABU DHABI — Penandatanganan nota kesepahaman interoperabilitas sistem logistik pelabuhan Tanjung Priok dan Port Khalifa membuka babak baru hubungan ekonomi bilateral.',
      'Integrasi dokumen berbasis blockchain ini mempermudah pelaku UMKM berorientasi ekspor Indonesia menjangkau pasar Timur Tengah dan Afrika Utara.'
    ],
    kategori: 'indonesia',
    kategoriLabel: 'Indonesia',
    gambar: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Pemandangan pelabuhan modern dan kawasan perdagangan bilateral Abu Dhabi.',
    tanggal: '14 Agustus 2026',
    waktu: '11:45 WIB',
    namaSumber: 'Kementerian Luar Negeri RI & WAM News',
    urlSumber: 'https://kemlu.go.id',
    negaraLokasi: 'Abu Dhabi, UEA',
    readTimeMinutes: 3,
    tags: ['Ekspor', 'Ekonomi Syariah', 'Diplomasi Ekonomi']
  },
  {
    id: 'news-014',
    judul: 'Inovasi Semikonduktor Generasi 1nm: Konsorsium Internasional Umumkan Sukses Tahap Tape-Out',
    ringkasan: 'Arsitektur transistor Gate-All-Around (GAA) terbaru mampu meningkatkan efisiensi daya hingga 40% untuk komputasi super dan pusat data.',
    isiLengkap: [
      'HSINCHU — Industri semikonduktor mencapai pencapaian fisika material baru dengan keberhasilan prototipe keping silikon berskala fabrikasi 1 nanometer.',
      'Arsitektur ini dijadwalkan masuk tahap produksi massal untuk perangkat seluler dan akselerator kecerdasan buatan pada paruh pertama 2027.'
    ],
    kategori: 'teknologi',
    kategoriLabel: 'Teknologi',
    gambar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Wafer silikon berpresisi tinggi di fasilitas cleanroom semikonduktor.',
    tanggal: '13 Agustus 2026',
    waktu: '16:30 WIB',
    namaSumber: 'TechCrunch & Semiconductor Digest',
    urlSumber: 'https://techcrunch.com',
    negaraLokasi: 'Hsinchu, Taiwan',
    readTimeMinutes: 3,
    tags: ['Semikonduktor', 'Chip', 'Hardware']
  },
  {
    id: 'news-015',
    judul: 'Olimpiade Musim Dingin: Panitia Luncurkan Arena Salju Nol Karbon Berbasis Panas Bumi',
    ringkasan: 'Sistem sirkulasi termal tertutup memanfaatkan sumber panas bumi untuk pendinginan es ramah lingkungan tanpa emisi refrigeran kimia berbahaya.',
    isiLengkap: [
      'MILAN — Komite Penyelenggara Olimpiade Milan-Cortina meresmikan kompleks olahraga es berteknologi sirkulasi geotermal mandiri.',
      'Inovasi ini diakui oleh Federasi Olahraga Internasional sebagai model percontohan keberlanjutan infrastruktur olahraga masa depan.'
    ],
    kategori: 'olahraga',
    kategoriLabel: 'Olahraga',
    gambar: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Kompleks stadion musim dingin di kaki pegunungan Alpen Italia.',
    tanggal: '13 Agustus 2026',
    waktu: '14:20 WIB',
    namaSumber: 'La Gazzetta dello Sport & Olympic Media',
    urlSumber: 'https://olympics.com',
    negaraLokasi: 'Milan, Italia',
    readTimeMinutes: 3,
    tags: ['Olimpiade', 'Olahraga', 'Keberlanjutan']
  },
  {
    id: 'news-016',
    judul: 'BI Catat Cadangan Devisa Indonesia Tetap Kuat Capai 145 Miliar Dolar AS',
    ringkasan: 'Ketahanan sektor eksternal tetap terjaga didukung surplus neraca perdagangan dan stabilitas nilai tukar Rupiah di tengah dinamika pasar keuangan global.',
    isiLengkap: [
      'JAKARTA — Bank Indonesia (BI) menyatakan posisi cadangan devisa Indonesia pada akhir bulan lalu tetap tinggi sebesar 145,2 miliar dolar AS, setara dengan pembiayaan 6,3 bulan impor.',
      'Direktur Eksekutif Departemen Komunikasi BI menegaskan bahwa cadangan devisa tersebut mampu mendukung ketahanan sektor eksternal serta menjaga stabilitas makroekonomi dan sistem keuangan secara berkelanjutan.'
    ],
    kategori: 'indonesia',
    kategoriLabel: 'Indonesia',
    gambar: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Gedung Bank Indonesia di kawasan Thamrin, Jakarta Pusat.',
    tanggal: '14 Agustus 2026',
    waktu: '13:15 WIB',
    namaSumber: 'ANTARA',
    urlSumber: 'https://www.antaranews.com/berita/ekonomi/cadangan-devisa-bi',
    negaraLokasi: 'Jakarta, Indonesia',
    sourceFeedType: 'antara',
    readTimeMinutes: 3,
    tags: ['Ekonomi', 'Bank Indonesia', 'Cadangan Devisa', 'Indonesia']
  },
  {
    id: 'news-017',
    judul: 'Kementerian Komdigi Perluas Jaringan Internet Cepat ke 1.200 Titik Fasilitas Publik 3T',
    ringkasan: 'Akselerasi transformasi digital nasional difokuskan pada penguatan konektivitas puskesmas, sekolah, dan balai desa di wilayah kepulauan terluar.',
    isiLengkap: [
      'JAKARTA — Pemerintah melalui Kementerian Komunikasi dan Digital mengumumkan perluasan program akses internet broadband generasi baru di ribuan fasilitas layanan masyarakat kawasan terdepan, terluar, dan tertinggal (3T).',
      'Inisiatif ini memanfaatkan integrasi jaringan serat optik Palapa Ring dan satelit komunikasi berkapasitas tinggi guna memastikan pemerataan kesempatan ekonomi digital bagi seluruh warga.'
    ],
    kategori: 'indonesia',
    kategoriLabel: 'Indonesia',
    gambar: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80',
    captionGambar: 'Infrastruktur pemancar telekomunikasi di wilayah pesisir kepulauan nusantara.',
    tanggal: '14 Agustus 2026',
    waktu: '11:40 WIB',
    namaSumber: 'ANTARA',
    urlSumber: 'https://www.antaranews.com/berita/tekno/internet-3t-komdigi',
    negaraLokasi: 'Jakarta, Indonesia',
    sourceFeedType: 'antara',
    readTimeMinutes: 4,
    tags: ['Teknologi', 'Digital', 'Komdigi', 'Indonesia']
  },
  {
    id: 'news-018',
    judul: 'Badan Geologi: 8 kali letusan-semburan lava pijar Anak Krakatau',
    ringkasan: 'Badan Geologi Kementerian ESDM mencatat delapan kali letusan disertai semburan lava pijar setinggi 100 meter dari kawah Gunung Anak Krakatau di Selat Sunda dalam periode pengamatan 24 jam.',
    isiLengkap: [
      'BANDAR LAMPUNG — Pos Pengamatan Gunung Api Anak Krakatau Pusat Vulkanologi dan Mitigasi Bencana Geologi (PVMBG) Badan Geologi Kementerian ESDM melaporkan delapan kali letusan abu vulkanik dan lontaran lava pijar.',
      'Aktivitas erupsi terekam pada seismograf dengan amplitudo maksimum 45 milimeter dan durasi berkisar antara 35 hingga 110 detik.',
      'Status Gunung Anak Krakatau saat ini berada pada Level III (Siaga). Masyarakat dan nelayan diimbau tidak mendekati kawah dalam radius 5 kilometer.'
    ],
    kategori: 'bencana',
    kategoriLabel: 'Bencana',
    gambar: '',
    captionGambar: '',
    tanggal: '15 Agustus 2026',
    waktu: '10:20 WIB',
    namaSumber: 'ANTARA News',
    urlSumber: 'https://www.antaranews.com/berita/kebencanaan/anak-krakatau-erupsi-8-kali',
    negaraLokasi: 'Selat Sunda, Lampung-Banten',
    sourceFeedType: 'antara',
    readTimeMinutes: 3,
    tags: ['Anak Krakatau', 'Vulkanologi', 'Badan Geologi', 'Bencana']
  },
  {
    id: 'news-019',
    judul: 'Pemerintah Salurkan Bantuan Logistik dan Tenda Darurat ke Warga Terdampak di Negeri Aboru Maluku Tengah',
    ringkasan: 'Tim gabungan BPBD dan Kemensos mendistribusikan 500 paket sembako, selimut, dan tenda darurat untuk warga di Negeri Aboru, Kecamatan Pulau Haruku, Kabupaten Maluku Tengah pascainsiden kebakaran pemukiman.',
    isiLengkap: [
      'AMBON — Penjabat Bupati Maluku Tengah bersama jajaran BPBD meninjau langsung posko pengungsian di Negeri Aboru, Kecamatan Pulau Haruku, Kabupaten Maluku Tengah.',
      'Distribusi bantuan logistik dilakukan melalui jalur laut menggunakan kapal patroli perintis guna mempercepat penanganan 120 kepala keluarga yang mengungsi.',
      'Dinas Kesehatan setempat mendirikan posko medis darurat untuk memastikan ketersediaan obat-obatan dan pemeriksaan berkala bagi lansia dan anak-anak.'
    ],
    kategori: 'indonesia',
    kategoriLabel: 'Indonesia',
    gambar: '',
    captionGambar: '',
    tanggal: '15 Agustus 2026',
    waktu: '11:05 WIB',
    namaSumber: 'ANTARA News Ambon',
    urlSumber: 'https://ambon.antaranews.com/berita/bantuan-aboru-maluku-tengah',
    negaraLokasi: 'Negeri Aboru, Pulau Haruku, Maluku Tengah, Maluku',
    sourceFeedType: 'antara',
    readTimeMinutes: 3,
    tags: ['Maluku Tengah', 'Haruku', 'Bantuan Sosial', 'Indonesia']
  }
];

export const BREAKING_TICKERS = [
  'KTT Iklim Jenewa sahkan dana energi hijau darurat $120 miliar untuk negara berkembang.',
  'Sistem radar satelit real-time Selat Malaka resmi beroperasi penuh hari ini.',
  'Uni Eropa terbitkan panduan transparansi audit etika model kecerdasan buatan.',
  'Bank for International Settlements koordinasikan koridor likuiditas perdagangan internasional.',
  'Indonesia perkuat kerja sama konservasi ekosistem mangrove di forum regional ASEAN.'
];
